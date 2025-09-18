import React, { useState } from 'react';
import QuizWelcome from './QuizWelcome';
import QuizStep from './QuizStep';
import type { QuizData } from '../../types';
import type { StepConfig } from './QuizStep';

const quizSteps: StepConfig[] = [
    { id: "name", question: "Amazing! Let's start this journey. What's your name?", type: "text_input", placeholder: "Enter your name", required: true },
    { id: "email", question: "Great to meet you! What's your email?", subtitle: "We'll use this to save your progress and send your personalized iFitBot results.", type: "text_input", inputType: "email", placeholder: "Enter your email", required: true },
    { id: "gender", question: "Thanks! Now, about you. What's your gender?", subtitle: "This helps our AI use the most accurate formulas for your body.", type: "single_select", options: [{ id: "male", label: "Male" }, { id: "female", label: "Female" }], required: true },
    { id: "age", question: "How many years young are you?", type: "number_input", placeholder: "Enter your age", required: true, min: 13, max: 99 },
    { id: "currentWeight", question: "What's your current weight in kilograms?", subtitle: "No judgment here! This is our starting point.", type: "number_input", placeholder: "e.g., 75", unit: "kg", required: true, min: 30, max: 300 },
    { id: "height", question: "And your height in centimeters?", type: "number_input", placeholder: "e.g., 180", unit: "cm", required: true, min: 100, max: 250 },
    { id: "goal", question: "What's the one big goal you're aiming for?", subtitle: "This is the 'why' that will power your journey.", type: "single_select", options: [{id: 'lose_weight', label: 'Lose Weight'}, {id: 'gain_muscle', label: 'Gain Muscle'}, {id: 'get_shredded', label: 'Get Shredded (Lean Out)'}], required: true },
    { id: "targetWeight", question: "Let's set a target! What's your goal weight in kg?", subtitle: "A clear target helps us build the perfect plan for you.", type: "number_input", placeholder: "e.g., 70", unit: "kg", required: true, min: 30, max: 300 },
    { id: "targetPeriodWeeks", question: "How many weeks do you want to give yourself to reach it?", subtitle: "Consistency is key. Let's choose a realistic timeframe (e.g., 8, 12, 16 weeks).", type: "number_input", placeholder: "e.g., 12", unit: "weeks", required: true, min: 2, max: 52 },
    { id: "bodyImage", question: "Want a more accurate analysis?", subtitle: "(Optional) A photo helps our AI visually assess your physique for a truly personalized plan. Your privacy is respected.", type: "camera_input", required: false },
    { id: "dailyActivity", question: "How active is your typical day, excluding workouts?", subtitle: "Think about your job or daily routine.", type: "single_select", options: [ { id: "sedentary", label: "Mostly Sitting", desc: "Desk job, little to no walking." }, { id: "lightly_active", label: "Lightly Active", desc: "Walking occasionally, light daily tasks." }, { id: "moderately_active", label: "Moderately Active", desc: "On your feet most of the day." }, { id: "very_active", label: "Very Active", desc: "Physically demanding job or routine." } ], required: true },
    { id: "fitnessLevel", question: "How would you describe your current fitness level?", type: "single_select", options: [{ id: "beginner", label: "I'm a Beginner", desc: "Just starting out on my fitness journey." }, { id: "amateur", label: "I'm an Amateur", desc: "I exercise sometimes but not consistently." }, { id: "advanced", label: "I'm Advanced", desc: "I'm in great shape and train regularly." }], required: true },
    { id: "workoutFrequency", question: "How often have you been working out recently?", type: "single_select", options: [{ id: "not_at_all", label: "Not at all" }, { id: "1-2_times", label: "1-2 times a week" }, { id: "3_times", label: "3 times a week" }, { id: "more_than_3", label: "More than 3 times a week" }], required: true },
    { id: "workoutLocation", question: "Where will you be doing your workouts?", subtitle: "iFitBot can create a plan for any environment!", type: "single_select", options: [{ id: "home", label: "At Home" }, { id: "gym", label: "At the Gym" }, { id: "both", label: "Both Home & Gym" }], required: true },
    { id: "sleepHours", question: "How much sleep are you getting on average?", subtitle: "Recovery is just as important as the workout!", type: "single_select", options: [{ id: "less_than_5", label: "Less than 5 hours" }, { id: "5_to_6", label: "5-6 hours" }, { id: "7_to_8", label: "7-8 hours (Ideal!)" }, { id: "more_than_8", label: "More than 8 hours" }], required: true },
    { id: "waterIntake", question: "How much water do you drink per day?", subtitle: "Hydration is a cornerstone of fitness.", type: "single_select", options: [{ id: "less_than_1l", label: "Less than 1 Liter" }, { id: "1_to_2l", label: "1 to 2 Liters" }, { id: "more_than_2l", label: "More than 2 Liters" }], required: true },
    { id: "stressLevel", question: "How would you rate your current stress levels?", subtitle: "Fitness can be a powerful tool to manage stress.", type: "single_select", options: [{ id: "low", label: "Low" }, { id: "moderate", label: "Moderate" }, { id: "high", label: "High" }], required: true },
    { id: "dietType", question: "What does your current diet look like?", type: "single_select", options: [{ id: "balanced", label: "Balanced Diet" }, { id: "low_carb", label: "Low-Carb" }, { id: "vegetarian", label: "Vegetarian" }, { id: "vegan", label: "Vegan" }, { id: "other", label: "Other / No specific diet" }], required: true },
    { id: "motivation", question: "Last question! What is your biggest motivation to get fit?", type: "text_input", placeholder: "e.g., To feel more energetic", required: true },
];


const getInitialAnswers = () => {
    const initial: Partial<QuizData> = {};
    quizSteps.forEach(step => {
        if (step.defaultValue !== undefined) {
            (initial as any)[step.id] = step.defaultValue;
        }
    });
    return initial;
};

export default function QuizContainer({ onComplete }: { onComplete: (data: QuizData) => void }) {
    const [showWelcome, setShowWelcome] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Partial<QuizData>>(getInitialAnswers());

    if (showWelcome) {
        return <QuizWelcome onStart={() => setShowWelcome(false)} />;
    }

    const currentStepConfig = quizSteps[currentStep];
    const isLastStep = currentStep === quizSteps.length - 1;

    const canGoNext = () => {
        const currentAnswer = answers[currentStepConfig.id as keyof QuizData];
        if (!currentStepConfig.required) return true;
        
        if (Array.isArray(currentAnswer)) {
            return currentAnswer.length > 0;
        }
        
        return currentAnswer !== undefined && currentAnswer !== null && `${currentAnswer}`.trim() !== "";
    };

    const handleNext = async () => {
        if (isLastStep) {
            if (canGoNext()) {
              onComplete(answers as QuizData);
            }
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleAnswerChange = (value: any) => {
        setAnswers(prev => ({
            ...prev,
            [currentStepConfig.id]: value
        }));
    };

    return (
        <QuizStep
            step={currentStep + 1}
            totalSteps={quizSteps.length}
            value={answers[currentStepConfig.id as keyof QuizData]}
            onChange={handleAnswerChange}
            onNext={handleNext}
            onBack={handleBack}
            canGoNext={canGoNext()}
            isLast={isLastStep}
            stepConfig={currentStepConfig}
        />
    );
}