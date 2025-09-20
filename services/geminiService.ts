import { GoogleGenAI, Type } from "@google/genai";
import type { QuizData, ReportData, WorkoutPlanApiResponse, PendingWorkoutPlan, ChatMessage, WorkoutGuideDraft, ExtractedReportData } from '../types';
import { workoutDatabase } from '../data/workoutDatabase';

// FIX: Per guidelines, API key must come from process.env.API_KEY, not import.meta.env.
const apiKey = process.env.API_KEY;

if (!apiKey) {
  // FIX: Updated error message to reflect the new environment variable.
  throw new Error("API_KEY environment variable is not set");
}

// Use new GoogleGenAI({apiKey: ...}) as per SDK guidelines
const ai = new GoogleGenAI({ apiKey: apiKey });

/**
 * Generates a full fitness assessment report with structured data and markdown.
 */
export const generateAssessmentReport = async (quizData: QuizData): Promise<ReportData> => {
    // Define the JSON schema for the structured part of the report
    const reportSchema = {
        type: Type.OBJECT,
        properties: {
            numbers: {
                type: Type.OBJECT,
                properties: {
                    current_intake_kcal: { type: Type.NUMBER },
                    current_burn_kcal: { type: Type.NUMBER },
                    calorie_gap_kcal: { type: Type.NUMBER },
                },
            },
            nutrition_targets: {
                type: Type.OBJECT,
                properties: {
                    recommended_calories_kcal: { type: Type.NUMBER },
                    protein_g: { type: Type.NUMBER },
                    water_l: { type: Type.NUMBER },
                    carbs_g_range: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                    fats_g_range: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                },
            },
            body_comp: {
                type: Type.OBJECT,
                properties: {
                    estimated_bf_percent: { type: Type.NUMBER },
                    bf_ideal_band: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                    bf_status: { type: Type.STRING },
                    estimated_tbw_percent: { type: Type.NUMBER },
                    tbw_typical_band: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                    tbw_status: { type: Type.STRING },
                },
            },
            flags: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        issue: { type: Type.STRING },
                        severity: { type: Type.STRING },
                        why: { type: Type.STRING },
                    },
                },
            },
            methodology: { type: Type.ARRAY, items: { type: Type.STRING } },
            report_markdown: { type: Type.STRING, description: "A detailed, motivational report in Markdown format covering all key areas." },
        },
        required: ["numbers", "nutrition_targets", "body_comp", "flags", "methodology", "report_markdown"]
    };

    try {
        const prompt = `
            Act as a certified personal trainer and nutritionist.
            Analyze this user’s data to generate a complete fitness assessment.
            You MUST populate ALL fields in the provided JSON schema accurately based on the user's data.
            - For 'bf_status' and 'tbw_status', use only "below", "within", or "above".
            - For 'flags.severity', use only "low", "medium", or "high".
            - 'carbs_g_range' and 'fats_g_range' should be an array of two numbers, e.g., [150, 200].
            - Generate a comprehensive, professional, and motivational report in markdown format for the 'report_markdown' field.
            The markdown report should be well-structured and cover: 
            1) A friendly introduction and summary of their main goal.
            2) A breakdown of their daily nutrition targets.
            3) An analysis of their body composition.
            4) An explanation of their daily calorie balance.
            5) A clear list of key issues or areas to focus on (flags).

            User Data: ${JSON.stringify(quizData, null, 2)}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: reportSchema,
            },
        });
        
        const reportData: ReportData = JSON.parse(response.text);
        return reportData;

    } catch (err) {
        console.error("Gemini API Error in generateAssessmentReport:", err);
        // Custom error for JSON parsing issues
        if (err instanceof SyntaxError) {
             throw new Error("AI_JSON_PARSE_ERROR: Failed to parse the structured report from the AI.");
        }
        // Return an error message within the expected structure for other errors
        return {
            report_markdown: "⚠️ # Failed to generate report.\n\nThe AI service may be temporarily unavailable or encountered an issue processing your data. Please try again later.",
            numbers: { current_intake_kcal: 0, current_burn_kcal: 0, calorie_gap_kcal: 0 },
            nutrition_targets: { recommended_calories_kcal: 0, protein_g: 0, water_l: 0, carbs_g_range: null, fats_g_range: null },
            body_comp: { estimated_bf_percent: 0, bf_ideal_band: [0, 0], bf_status: "within", estimated_tbw_percent: 0, tbw_typical_band: [0, 0], tbw_status: "within" },
            flags: [],
            methodology: [],
        };
    }
};

/**
 * Generates a draft workout plan as a structured JSON object.
 */
export const generateWorkoutPlan = async (reportImage: string | null, userName: string, quizData: QuizData | null): Promise<WorkoutPlanApiResponse> => {
    try {
        // --- Smart Trainer Assignment Logic ---
        const allTrainers: { name: "Athul" | "Athithiya" | "Saieel"; specialties: string[] }[] = [
            { name: "Athul", specialties: ["Weight Loss", "Lean Body"] },
            { name: "Athithiya", specialties: ["Lean Body", "Bodybuilding"] },
            { name: "Saieel", specialties: ["Weight Loss", "Bodybuilding"] },
        ];

        const goalToSpecialtyMap: Record<string, string> = {
            'lose_weight': "Weight Loss",
            'gain_muscle': "Bodybuilding",
            'get_shredded': "Lean Body",
        };

        const userGoal = quizData?.goal;
        const targetSpecialty = userGoal ? goalToSpecialtyMap[userGoal] : null;

        let assignedTrainerName: "Athul" | "Athithiya" | "Saieel";

        if (targetSpecialty) {
            const weightedPool: ("Athul" | "Athithiya" | "Saieel")[] = [];
            const specialistWeight = 5; // Specialists are 5 times more likely to be picked
            const generalistWeight = 1; // Non-specialists still have a chance

            allTrainers.forEach(trainer => {
                const weight = trainer.specialties.includes(targetSpecialty) ? specialistWeight : generalistWeight;
                for (let i = 0; i < weight; i++) {
                    weightedPool.push(trainer.name);
                }
            });

            assignedTrainerName = weightedPool[Math.floor(Math.random() * weightedPool.length)];
        } else {
            // Fallback to simple random if no goal is specified
            const trainers = allTrainers.map(t => t.name);
            assignedTrainerName = trainers[Math.floor(Math.random() * trainers.length)];
        }
        // --- End of Smart Trainer Assignment ---

        const promptText = `
            Act as an elite AI performance coach.
            Your task is to create a comprehensive and hyper-personalized DRAFT workout plan for a client.
            This draft is for review by a human trainer.
            The output MUST be a valid JSON object matching the provided schema.

            **INSTRUCTIONS:**
            1.  **Analyze Client Data:** Review the client's name, their assessment data (if available), and the assessment report image.
            2.  **Use the Database:** Refer to the provided 'AI-Ready Workout Database' below. Select a Category and Split that best matches the client's goal and available gym days.
            3.  **Personalize the Plan:** Adapt the template from the database. You can adjust exercises, sets, reps, and conditioning to fit the client's fitness level and equipment access. DO NOT just copy the template.
            4.  **Create Training Phases:** Structure the plan into distinct phases (e.g., 'Foundation', 'Build', 'Peak'). Each phase should have a clear focus and cover specific weeks of the program. This is critical for long-term progress.
            5.  **Progression Principle:** Crucially, define a clear 'progression_principle' with a title and a simple description explaining how the client should aim to progress (e.g., adding weight, reps, or reducing rest).
            6.  **Extract Metrics:** Analyze the report image to extract key metrics if they aren't available in the JSON data.
            7.  **Handle Nulls:** For properties like 'alt_bodyweight' and 'alt_minimal' that might not have a value, return JSON null, not the string "null".

            ---
            **AI-READY WORKOUT DATABASE (Reference Only):**
            ${JSON.stringify(workoutDatabase, null, 2)}
            ---

            **CLIENT DETAILS:**
            Client Name: ${userName}
            Client Data (if available): ${JSON.stringify(quizData, null, 2)}
        `;

        const strengthExerciseSchema = {
            type: Type.OBJECT,
            properties: {
                movement: { type: Type.STRING },
                sets: { type: Type.INTEGER },
                reps: { type: Type.STRING },
                rpe_or_tempo: { type: Type.STRING },
                alt_bodyweight: { type: Type.STRING },
                alt_minimal: { type: Type.STRING },
            }
        };

        const workoutDaySchema = {
            type: Type.OBJECT,
            properties: {
                day_name: { type: Type.STRING },
                warmup: { type: Type.OBJECT, properties: { duration_min: { type: Type.INTEGER }, notes: { type: Type.STRING } } },
                strength: { type: Type.ARRAY, items: strengthExerciseSchema },
                conditioning: { type: Type.OBJECT, properties: { style: { type: Type.STRING }, duration_min: { type: Type.INTEGER }, notes: { type: Type.STRING } } },
                cooldown: { type: Type.OBJECT, properties: { duration_min: { type: Type.INTEGER }, notes: { type: Type.STRING } } },
            }
        };

        const workoutGuideDraftSchema = {
            type: Type.OBJECT,
            properties: {
                program_weeks: { type: Type.INTEGER },
                weekly_days: { type: Type.INTEGER },
                phases: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            weeks: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                            focus: { type: Type.STRING },
                        },
                    },
                },
                progression_principle: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "The title of the progression principle, e.g., 'Progressive Overload'." },
                        description: { type: Type.STRING, description: "A brief explanation of how the user should progress week to week." },
                    },
                },
                equipment_tier: { type: Type.STRING },
                days: { type: Type.ARRAY, items: workoutDaySchema },
                progression_notes: { type: Type.STRING },
                safety_notes: { type: Type.STRING },
            },
        };
        
        const fullResponseSchema = {
            type: Type.OBJECT,
            properties: {
                workout_guide_draft: workoutGuideDraftSchema,
                presentation_markdown: { type: Type.STRING, description: "A user-friendly markdown summary of the workout philosophy and a sample day for the client." },
            }
        };
        
        // FIX: Explicitly type requestParts to allow for both text and inlineData parts,
        // which prevents a TypeScript error when pushing the image part.
        const requestParts: { text?: string; inlineData?: { mimeType: string, data: string } }[] = [{ text: promptText }];
        if (reportImage) {
            const match = reportImage.match(/^data:(.+);base64,(.+)$/);
            if (match) {
                const mimeType = match[1];
                const base64Data = match[2];
                requestParts.push({
                    inlineData: {
                        mimeType,
                        data: base64Data,
                    },
                });
            }
        }
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: requestParts },
            config: {
                responseMimeType: "application/json",
                responseSchema: fullResponseSchema,
            },
        });

        const responseJson = JSON.parse(response.text);
        const workoutGuideDraft: WorkoutGuideDraft = responseJson.workout_guide_draft;
        const presentationMarkdown: string = responseJson.presentation_markdown;

        return {
            needs_assessment: false,
            cta_copy: null,
            assigned_trainer: { name: assignedTrainerName },
            extracted_from_report: null, // This part is not implemented yet in the prompt
            workout_guide_draft: workoutGuideDraft,
            presentation_markdown: presentationMarkdown,
            trainer_checklist: ["Confirm the plan aligns with client goals.", "Check exercise selection for safety and effectiveness.", "Verify progression logic is appropriate for the client's fitness level."],
            signature_line: `Draft by iFitBot AI for ${userName}`,
        };
    } catch (err) {
        console.error("Gemini API Error in generateWorkoutPlan:", err);
        const placeholderExtractedData: ExtractedReportData = {
            recommended_calories_kcal: null,
            current_burn_kcal: null,
            current_intake_kcal: null,
            calorie_gap_kcal: null,
            protein_target_g: null,
            water_target_l: null,
            predicted_loss_kg_per_week: null,
            weeks_to_lose_10kg: null,
            parse_notes: "AI failed to generate a plan.",
        };
        return {
            needs_assessment: false,
            cta_copy: null,
            assigned_trainer: { name: "Athul" }, // Placeholder trainer on error
            extracted_from_report: placeholderExtractedData, // Placeholder data on error
            workout_guide_draft: null,
            presentation_markdown: "# ⚠️ Generation Error\n\nSorry, the AI couldn't create your plan. This might be due to a poor quality image or high server load. Please try again with a clearer report image."
        };
    }
};


/**
 * Gets a contextual response from the AI for the trainer chatbot.
 */
export const getTrainerChatbotResponse = async (plan: PendingWorkoutPlan, chatHistory: ChatMessage[]): Promise<string> => {
    try {
        const history = chatHistory.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        }));

        // The last message is the current user prompt, so we separate it.
        const userPrompt = history.pop();
        if (!userPrompt) {
            return "I'm sorry, I didn't receive a question.";
        }

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: history,
            config: {
                systemInstruction: `
                    You are iFitBot, an expert AI assistant for certified personal trainers.
                    Your role is to help the trainer refine and adjust an AI-generated workout plan before they approve it for a client.
                    The trainer is currently reviewing the plan for client: ${plan.userName}.
                    
                    Client's original assessment data:
                    ${JSON.stringify(plan.quizData, null, 2)}
                    
                    The current DRAFT workout plan is:
                    ${JSON.stringify(plan.planData.workout_guide_draft, null, 2)}
                    
                    Your task is to respond to the trainer's requests concisely and professionally. 
                    You can suggest exercise swaps, adjust durations, explain the rationale behind the plan, or modify the plan structure based on their instructions. 
                    When suggesting changes, be specific. For example, instead of "I'll add squats," say "Okay, I've replaced leg press with barbell back squats, 3 sets of 8-12 reps."
                    Always be helpful and defer to the trainer's expertise.
                `,
            },
        });

        const response = await chat.sendMessage({ message: userPrompt.parts[0].text });
        return response.text;

    } catch (error) {
        console.error("Trainer Chatbot Error:", error);
        return "I apologize, but I encountered an error and cannot respond at this moment.";
    }
};

/**
 * Generates a personalized, encouraging note from a trainer to a client.
 */
export const generateAutoTrainerNote = async (userName: string, trainerName: string, quizData: QuizData | null): Promise<string> => {
    try {
        const prompt = `
            Act as a friendly and motivating certified personal trainer. Your name is ${trainerName}.
            You are writing a short, personal note to your new client, ${userName}, after reviewing their AI-generated workout plan.
            Your note should be encouraging, establish a human connection, and add a personal touch.
            
            **Instructions:**
            1.  Start with a warm greeting to ${userName}.
            2.  Mention that you've personally reviewed their new AI-based plan.
            3.  Based on their assessment data below, pick ONE key area for them to focus on (e.g., consistency if they are a beginner, hydration if their water intake is low, sleep if their hours are short).
            4.  Keep the tone positive and motivating.
            5.  End with an encouraging sign-off like "Let's crush it together!" or similar.
            6.  Sign off with your name, ${trainerName}.
            7.  The entire note should be about 3-4 sentences long.

            **Client's Assessment Data:**
            ${JSON.stringify(quizData, null, 2)}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        return response.text.trim();

    } catch (err) {
        console.error("Gemini API Error in generateAutoTrainerNote:", err);
        // Return a safe, generic fallback note on error
        return `Hi ${userName},\n\nI've personally reviewed your AI-based assessment and tailored plan. I recommend focusing extra on consistency this week. Let's crush it together 💪\n\n– ${trainerName}`;
    }
};

/**
 * Gets a conversational response from the AI for the calorie chatbot.
 */
export const getCalorieCoachResponse = async (chatHistory: ChatMessage[]): Promise<string> => {
    try {
        const history = chatHistory.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        }));

        const userPrompt = history.pop();
        if (!userPrompt) {
            return "Sorry, I didn't get that. What food are you curious about?";
        }

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: history,
            config: {
                systemInstruction: `
                    You are an expert nutritionist and calorie counter named iFit Calorie Coach.
                    Your role is to provide quick, estimated nutritional information for food items.
                    
                    **Instructions:**
                    1.  When a user provides a food item, you MUST provide an estimated calorie count for a standard serving size.
                    2.  Also include a brief, simple macronutrient breakdown (Protein, Carbs, Fat).
                    3.  Be friendly, concise, and conversational. Keep your responses short and to the point (2-3 sentences max).
                    4.  If a user asks a follow-up question (e.g., "what about a larger portion?"), answer it in context.
                    5.  Do not give medical advice. Add a brief disclaimer if the user asks for health advice.
                `,
            },
        });

        const response = await chat.sendMessage({ message: userPrompt.parts[0].text });
        return response.text;

    } catch (error) {
        console.error("Calorie Coach Chatbot Error:", error);
        return "I apologize, but I couldn't process that request right now. Please try again.";
    }
};
