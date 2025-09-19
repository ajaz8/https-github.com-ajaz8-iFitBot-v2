
import { GoogleGenAI, Type } from "@google/genai";
import type { QuizData, ReportData, WorkoutPlanApiResponse, PendingWorkoutPlan, ChatMessage } from '../types';

if (!process.env.API_KEY) {
    console.error("API_KEY environment variable is not set. Please check your deployment environment variables.");
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAssessmentReport = async (quizData: QuizData): Promise<ReportData> => {
    
    const { bodyImage, ...textData } = quizData;

    // Create a data object that matches the variable names in the new prompt's calculation rules.
    const promptQuizData = {
        name: textData.name,
        sex: textData.gender,
        age: textData.age,
        heightCm: textData.height,
        weightKg: textData.currentWeight,
        waistCm: textData.waistCm,
        dailyActivity: textData.dailyActivity,
        avgStepsPerDay: textData.avgStepsPerDay,
        sittingHoursPerDay: textData.sittingHoursPerDay,
        waterLitersPerDay: textData.waterIntakeLiters,
        junkMealsPerWeek: textData.junkMealsPerWeek,
        sugaryDrinksPerDay: textData.sugaryDrinksPerDay,
        gymDaysPerWeek: textData.gymDaysPerWeek,
        minutesPerSession: textData.minutesPerSession,
        eveningHunger: textData.eveningHunger,
    };

    const prompt = `
    You are "iFitBot", an elite AI transformation analyst. Your tone is exceptionally motivational, supportive, and knowledgeable. Produce ONLY the analytical core of an assessment report.

    IMPORTANT: Some user data fields may be missing. If a field is not provided in the USER DATA, use a sensible default value or omit any calculations/flags that depend on it. Do not error or mention that the data is missing.

    If a body image is provided, you MUST use your vision capabilities to analyze it. Subtly adjust your 'Body Composition' estimates (especially Body-Fat %) based on visual cues from the photo. You MUST mention in the 'Methodology' section that a visual estimate from the photo was used to refine the calculation.

    You MUST output a valid JSON object that strictly matches the OUTPUT SCHEMA provided below. Do not include any text outside the JSON object.

    USER DATA:
    ${JSON.stringify(promptQuizData)}

    CALCULATION & ANALYSIS INSTRUCTIONS:
    1.  **BMR (Basal Metabolic Rate)**: Calculate using the Mifflin-St Jeor equation. For males: BMR = 10 * weightKg + 6.25 * heightCm - 5 * age + 5. For females: BMR = 10 * weightKg + 6.25 * heightCm - 5 * age - 161.
    2.  **TDEE (Total Daily Energy Expenditure / Current Burn)**: Calculate as TDEE = BMR * [Activity Multiplier]. Use these multipliers for 'dailyActivity': sedentary=1.2, lightly_active=1.375, moderately_active=1.55, very_active=1.725. This is 'current_burn_kcal'.
    3.  **Current Intake (kcal)**: Estimate this conservatively. Start with a base of 1800 kcal. If 'junkMealsPerWeek' is provided, add (junkMealsPerWeek / 7) * 500. If 'sugaryDrinksPerDay' is provided, add (sugaryDrinksPerDay * 150). If 'eveningHunger' is 'heavy' or 'order_outside', add 250. Round to the nearest 50. This is 'current_intake_kcal'.
    4.  **Calorie Gap**: Calculate as current_intake_kcal - current_burn_kcal.
    5.  **Recommended Daily Calories**: Calculate as max(1500 for Male / 1200 for Female, current_burn_kcal - 750). The 750 deficit is a standard starting point.
    6.  **Nutrition Targets**:
        - Protein (g): round(1.8 * weightKg).
        - Water (L): round(0.033 * weightKg, 2).
        - Carbs & Fats (g) Range (Optional): Calculate ranges based on remaining calories after protein. Use a balanced split (e.g., Carbs 40-50%, Fats 25-35%).
    7.  **Body Composition (Non-Medical Estimates)**:
        - Estimated Body-Fat % (BF%): Use Deurenberg equation: BF% = 1.2 * (weightKg / (heightCm/100)^2) + 0.23 * age - 10.8 * (sex=='male' ? 1 : 0) - 5.4. If 'waistCm' is provided, you can slightly adjust this estimate up if it's high. If a body image is provided, refine this estimate based on visual assessment.
        - Ideal BF% Band: Use these reference bands. M 20–39: 8–20% | 40–59: 11–22%. F 20–39: 21–33% | 40–59: 23–34%. Determine user's 'bf_status' as "below", "within", or "above" their band.
        - Estimated Total Body Water % (TBW%): Use Hume method: LBM_male = 0.407 * weightKg + 0.267 * heightCm - 19.2; LBM_female = 0.252 * weightKg + 0.473 * heightCm - 48.3. Then TBW_liters = 0.73 * LBM. Finally TBW% = (TBW_liters / weightKg) * 100.
        - Typical TBW% Band: Male: ~50–65%; Female: ~45–60%. Determine user's 'tbw_status'.
    8.  **Flags**: Automatically detect these issues. Be concise. Only create a flag if the relevant data is provided in the USER DATA.
        - Low hydration if waterLitersPerDay < water_l target.
        - Very low steps if avgStepsPerDay < 4000.
        - Excess sitting if sittingHoursPerDay > 9.
        - High junk if junkMealsPerWeek > 3.
        - High sugary drinks if sugaryDrinksPerDay > 1.
        - Surplus if calorie_gap_kcal > 300.
        - Aggressive deficit if recommended_calories_kcal < 0.7 * current_burn_kcal.
    9.  **Methodology**: Provide 5-8 bullets explaining how key numbers were derived (formulas used, rounding rules, estimation models). State that BF% and TBW% are non-medical estimates. If an image was used for BF% estimation, you MUST state it here.
    10. **Report Markdown**: Generate a concise, professional, one-page markdown report with these exact sections: 1) Current Snapshot (steps, sitting, hydration), 2) Daily Nutrition Targets (calories, protein, water), 3) Body Composition (BF% vs ideal, TBW% vs typical), 4) Calories & Burn (intake, burn, gap), 5) Key Issues (flags), 6) Methodology.

    OUTPUT SCHEMA:
    {
      "type": "object",
      "properties": {
        "numbers": {
          "type": "object",
          "properties": {
            "current_intake_kcal": { "type": "number" },
            "current_burn_kcal": { "type": "number" },
            "calorie_gap_kcal": { "type": "number" }
          }
        },
        "nutrition_targets": {
          "type": "object",
          "properties": {
            "recommended_calories_kcal": { "type": "number" },
            "protein_g": { "type": "number" },
            "water_l": { "type": "number" },
            "carbs_g_range": { "type": "array", "items": { "type": "number" }, "nullable": true },
            "fats_g_range": { "type": "array", "items": { "type": "number" }, "nullable": true }
          }
        },
        "body_comp": {
          "type": "object",
          "properties": {
            "estimated_bf_percent": { "type": "number" },
            "bf_ideal_band": { "type": "array", "items": { "type": "number" } },
            "bf_status": { "type": "string", "enum": ["below", "within", "above"] },
            "estimated_tbw_percent": { "type": "number" },
            "tbw_typical_band": { "type": "array", "items": { "type": "number" } },
            "tbw_status": { "type": "string", "enum": ["below", "within", "above"] }
          }
        },
        "flags": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "issue": { "type": "string" },
              "severity": { "type": "string", "enum": ["low", "medium", "high"] },
              "why": { "type": "string" }
            }
          }
        },
        "methodology": { "type": "array", "items": { "type": "string" } },
        "report_markdown": { "type": "string" }
      }
    }
`;
    
    const contentParts: any[] = [{ text: prompt }];

    if (bodyImage) {
        const [meta, base64Data] = bodyImage.split(',');
        const mimeType = meta.match(/:(.*?);/)?.[1] || 'image/jpeg';
        
        contentParts.push({
            inlineData: {
                mimeType,
                data: base64Data
            }
        });
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: contentParts },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    numbers: {
                        type: Type.OBJECT,
                        properties: {
                            current_intake_kcal: { type: Type.NUMBER },
                            current_burn_kcal: { type: Type.NUMBER },
                            calorie_gap_kcal: { type: Type.NUMBER }
                        },
                        required: ["current_intake_kcal", "current_burn_kcal", "calorie_gap_kcal"]
                    },
                    nutrition_targets: {
                        type: Type.OBJECT,
                        properties: {
                            recommended_calories_kcal: { type: Type.NUMBER },
                            protein_g: { type: Type.NUMBER },
                            water_l: { type: Type.NUMBER },
                            carbs_g_range: { type: Type.ARRAY, items: { type: Type.NUMBER }, nullable: true },
                            fats_g_range: { type: Type.ARRAY, items: { type: Type.NUMBER }, nullable: true }
                        },
                        required: ["recommended_calories_kcal", "protein_g", "water_l"]
                    },
                    body_comp: {
                        type: Type.OBJECT,
                        properties: {
                            estimated_bf_percent: { type: Type.NUMBER },
                            bf_ideal_band: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                            bf_status: { type: Type.STRING },
                            estimated_tbw_percent: { type: Type.NUMBER },
                            tbw_typical_band: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                            tbw_status: { type: Type.STRING }
                        },
                         required: ["estimated_bf_percent", "bf_ideal_band", "bf_status", "estimated_tbw_percent", "tbw_typical_band", "tbw_status"]
                    },
                    flags: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                issue: { type: Type.STRING },
                                severity: { type: Type.STRING },
                                why: { type: Type.STRING }
                            },
                            required: ["issue", "severity", "why"]
                        }
                    },
                    methodology: { type: Type.ARRAY, items: { type: Type.STRING } },
                    report_markdown: { type: Type.STRING }
                },
                 required: ["numbers", "nutrition_targets", "body_comp", "flags", "methodology", "report_markdown"]
            }
        }
    });

    try {
        const text = response.text.trim();
        // Clean up potential markdown code fences that the model might add
        const jsonStr = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Failed to parse JSON response from AI:", response.text, e);
        throw new Error("The AI returned an invalid response format. Please try again.");
    }
};

export const generateWorkoutPlan = async (reportImage: string | null, userName: string): Promise<WorkoutPlanApiResponse> => {

    const userMessage: any[] = [];
    let prompt = `
    You are iFitBot, an AI expert in fitness programming. Your task is to analyze a user's iFit Assessment Report and generate a DRAFT workout plan. This draft will be reviewed and finalized by a human trainer.

    CORE FLOW:
    1.  **Check for Input**: Analyze the provided input. The user may or may not upload a report.
    2.  **No Report**: If 'has_report_upload' is false, you MUST return 'needs_assessment: true' and the provided CTA copy. Do not generate a workout plan.
    3.  **Report Provided**: If a report is uploaded, use your vision capabilities to parse the image/PDF. Extract key metrics like calorie targets, protein goals, predicted loss, etc. Populate the 'extracted_from_report' object. If parsing is difficult, note it in 'parse_notes'.
    4.  **Generate Draft Plan**: Create a safe, effective, 6-week DRAFT workout plan based on the extracted data. Follow all content rules for duration, frequency, session structure, and progression. The plan must be a draft, not a final prescription.
    5.  **Assign Trainer**: Randomly select ONE trainer from this list: ["Athul", "Rahim", "Rahim", "Athithiya", "Athul"]. This weighted list is important. Assign their name to the 'assigned_trainer' field.
    6.  **Create Presentation**: Generate a concise, user-friendly markdown summary of the draft. After the summary, you MUST append the specific review notice, inserting the assigned trainer's name.
    7.  **Trainer Checklist**: Generate a 'trainer_checklist' array with 4-5 critical review points for the human trainer. Examples: "Is the volume appropriate for the client's fitness level?", "Are exercise alternatives suitable?", "Does the progression model align with client goals?", "Are safety notes clear and adequate?".

    CONTENT RULES FOR DRAFT WORKOUT GUIDE:
    - **Duration**: Default to 6 weeks, structured into three 2-week phases: Foundation, Build, Peak.
    - **Frequency**: 3-5 days/week. Base this on the user's fitness level and lifestyle from the report.
    - **Session Template**: Each workout day includes Warm-up (8-10 min), Strength Block (30-40 min, 4-6 movements), Conditioning (10-15 min), and Cool-down (5 min).
    - **Equipment**: Choose a tier (bodyweight, minimal, full) based on user's workout location. Provide alternatives.
    - **Progression**: Describe how the plan progresses week to week (e.g., more reps, sets, lower rest).
    - **Safety**: Use neutral, non-medical language. Include a general safety disclaimer. No medical advice.
    - **No Nutrition**: Do NOT include any meal plans or dietary advice in this workout guide.

    USER PROMPT:
    `;

    if (reportImage) {
        const [meta, base64Data] = reportImage.split(',');
        const mimeType = meta.match(/:(.*?);/)?.[1] || 'image/jpeg';
        const requestPayload = {
            "has_report_upload": true,
            "report_file_type": mimeType.split('/')[1],
            "user_context": { "display_name": userName, "date_iso": new Date().toISOString() }
        };
        prompt += JSON.stringify(requestPayload);
        userMessage.push({text: prompt});
        userMessage.push({ inlineData: { mimeType, data: base64Data } });

    } else {
         const requestPayload = {
            "has_report_upload": false,
            "user_context": { "display_name": userName, "date_iso": new Date().toISOString() }
        };
        prompt += JSON.stringify(requestPayload);
        userMessage.push({text: prompt});
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: userMessage },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    needs_assessment: { type: Type.BOOLEAN },
                    cta_copy: {
                        type: Type.OBJECT,
                        nullable: true,
                        properties: {
                            title: { type: Type.STRING },
                            subtitle: { type: Type.STRING },
                            button_label: { type: Type.STRING },
                        }
                    },
                    assigned_trainer: {
                        type: Type.OBJECT,
                        nullable: true,
                        properties: {
                            name: { type: Type.STRING, enum: ["Athul", "Rahim", "Athithiya"] }
                        }
                    },
                    extracted_from_report: {
                        type: Type.OBJECT,
                        nullable: true,
                        properties: {
                            recommended_calories_kcal: { type: Type.NUMBER, nullable: true },
                            current_burn_kcal: { type: Type.NUMBER, nullable: true },
                            current_intake_kcal: { type: Type.NUMBER, nullable: true },
                            calorie_gap_kcal: { type: Type.NUMBER, nullable: true },
                            protein_target_g: { type: Type.NUMBER, nullable: true },
                            water_target_l: { type: Type.NUMBER, nullable: true },
                            predicted_loss_kg_per_week: { type: Type.NUMBER, nullable: true },
                            weeks_to_lose_10kg: { type: Type.NUMBER, nullable: true },
                            parse_notes: { type: Type.STRING },
                        }
                    },
                    workout_guide_draft: {
                        type: Type.OBJECT,
                        nullable: true,
                        properties: {
                            program_weeks: { type: Type.NUMBER },
                            weekly_days: { type: Type.NUMBER },
                            phases: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING, enum: ["Foundation", "Build", "Peak"] },
                                        weeks: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                                        focus: { type: Type.STRING }
                                    }
                                }
                            },
                            equipment_tier: { type: Type.STRING, enum: ["bodyweight", "minimal", "full"] },
                            days: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        day_name: { type: Type.STRING },
                                        warmup: { type: Type.OBJECT, properties: { duration_min: { type: Type.NUMBER }, notes: { type: Type.STRING }}},
                                        strength: {
                                            type: Type.ARRAY,
                                            items: {
                                                type: Type.OBJECT,
                                                properties: {
                                                    movement: { type: Type.STRING },
                                                    sets: { type: Type.NUMBER },
                                                    reps: { type: Type.STRING },
                                                    rpe_or_tempo: { type: Type.STRING },
                                                    alt_bodyweight: { type: Type.STRING, nullable: true },
                                                    alt_minimal: { type: Type.STRING, nullable: true }
                                                }
                                            }
                                        },
                                        conditioning: { type: Type.OBJECT, properties: { style: { type: Type.STRING, enum: ["steady", "interval"] }, duration_min: { type: Type.NUMBER }, notes: { type: Type.STRING }}},
                                        cooldown: { type: Type.OBJECT, properties: { duration_min: { type: Type.NUMBER }, notes: { type: Type.STRING }}}
                                    }
                                }
                            },
                            progression_notes: { type: Type.STRING },
                            safety_notes: { type: Type.STRING }
                        }
                    },
                    presentation_markdown: { type: Type.STRING },
                    trainer_checklist: { 
                        type: Type.ARRAY, 
                        items: { type: Type.STRING },
                        nullable: true 
                    },
                    signature_line: { type: Type.STRING, nullable: true }
                }
            }
        }
    });

    return JSON.parse(response.text);
};

export const getTrainerChatbotResponse = async (
    plan: PendingWorkoutPlan,
    chatHistory: ChatMessage[]
): Promise<string> => {
    const planContext = JSON.stringify(plan.planData.workout_guide_draft, null, 2);
    const historyText = chatHistory.map(m => `${m.role}: ${m.text}`).join('\n');

    const prompt = `
    You are iFitBot, an expert AI assistant for a certified personal trainer.
    Your tone is professional, knowledgeable, and collaborative.

    CONTEXT:
    The trainer is reviewing a DRAFT workout plan for a client named "${plan.userName}".
    Here is the full workout plan draft in JSON format that you generated:
    ${planContext}

    TASK:
    Your task is to act as a helpful assistant. Analyze the conversation history and the provided workout plan to answer the trainer's latest query.
    - Provide clear rationale for exercise choices or progressions based on fitness principles.
    - Suggest safe and effective modifications or alternative exercises if requested.
    - Keep your answers concise and directly related to the question.
    - Do not give medical advice.
    - Do not change the fundamental goals of the plan unless specifically asked.

    CONVERSATION HISTORY:
    ${historyText}

    INSTRUCTION:
    Provide a helpful and concise response to the trainer's last message.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    return response.text;
};