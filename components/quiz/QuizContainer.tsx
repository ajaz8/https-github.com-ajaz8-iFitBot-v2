
import React, { useState } from 'react';
import QuizWelcome from './QuizWelcome';
import QuizStep from './QuizStep';
import type { QuizData } from '../../types';
import type { StepConfig } from './QuizStep';

const quizSteps: StepConfig[] = [
    // Personal Info
    { id: "name", question: "Amazing! Let's start this journey. What's your name?", type: "text_input", placeholder: "Enter your name", required: true },
    { id: "email", question: "Great to meet you! What's your email?", subtitle: "We'll use this to save your progress and send your personalized iFitBot results.", type: "text_input", inputType: "email", placeholder: "Enter your email", required: true },
    { id: "gender", question: "Thanks! Now, about you. What's your gender?", subtitle: "This helps our AI use the most accurate formulas for your body.", type: "single_select", options: [{ id: "male", label: "Male" }, { id: "female", label: "Female" }], required: true },
    { id: "age", question: "How many years young are you?", type: "number_input", placeholder: "Enter your age", required: true, min: 13, max: 99 },
    
    // Body Metrics
    { id: "currentWeight", question: "What's your current weight in kilograms?", subtitle: "No judgment here! This is our starting point.", type: "number_input", placeholder: "e.g., 75", unit: "kg", required: true, min: 30, max: 300 },
    { id: "height", question: "And your height in centimeters?", type: "number_input", placeholder: "e.g., 180", unit: "cm", required: true, min: 100, max: 250 },
    
    // Goals
    { id: "goal", question: "What's the one big goal you're aiming for?", subtitle: "This is the 'why' that will power your journey.", type: "single_select", options: [{id: 'lose_weight', label: 'Lose Weight'}, {id: 'gain_muscle', label: 'Gain Muscle'}, {id: 'get_shredded', label: 'Get Shredded (Lean Out)'}], required: true },
    { id: "targetWeight", question: "Let's set a target! What's your goal weight in kg?", subtitle: "A clear target helps us build the perfect plan for you.", type: "number_input", placeholder: "e.g., 70", unit: "kg", required: true, min: 30, max: 300 },
    { id: "targetPeriodWeeks", question: "How many weeks do you want to give yourself to reach it?", subtitle: "Consistency is key. Let's choose a realistic timeframe (e.g., 8, 12, 16 weeks).", type: "number_input", placeholder: "e.g., 12", unit: "weeks", required: true, min: 2, max: 52 },
    
    // Visuals
    { id: "bodyImage", question: "Want a more accurate analysis?", subtitle: "(Optional) A photo helps our AI visually assess your physique for a truly personalized plan. Your privacy is respected.", type: "camera_input", required: false },
    
    // Activity & Fitness
    { id: "dailyActivity", question: "How active is your typical day, excluding workouts?", subtitle: "Think about your job or daily routine. This helps us calculate your energy burn.", type: "single_select", options: [ { id: "sedentary", label: "Mostly Sitting", desc: "Desk job, little to no walking." }, { id: "lightly_active", label: "Lightly Active", desc: "Walking occasionally, light daily tasks." }, { id: "moderately_active", label: "Moderately Active", desc: "On your feet most of the day." }, { id: "very_active", label: "Very Active", desc: "Physically demanding job or routine." } ], required: true },
    { id: "fitnessLevel", question: "How would you describe your current fitness level?", type: "single_select", options: [{ id: "beginner", label: "I'm a Beginner", desc: "Just starting out." }, { id: "amateur", label: "I'm an Amateur", desc: "I exercise sometimes." }, { id: "advanced", label: "I'm Advanced", desc: "I train regularly." }], required: true },
    { id: "gymDaysPerWeek", question: "How many days per week do you typically work out?", subtitle: "This helps us understand your current exercise habits.", type: "number_input", placeholder: "e.g., 3", unit: "days", required: true, min: 0, max: 7 },
    { id: "workoutLocation", question: "Where will you be doing your workouts?", subtitle: "iFitBot can create a plan for any environment!", type: "single_select", options: [{ id: "home", label: "At Home" }, { id: "gym", label: "At the Gym" }, { id: "both", label: "Both Home & Gym" }], required: true },
    
    // Lifestyle & Nutrition
    { id: "sleepHours", question: "How much sleep are you getting on average?", subtitle: "Recovery is just as important as the workout!", type: "single_select", options: [{ id: "less_than_5", label: "Less than 5 hours" }, { id: "5_to_6", label: "5-6 hours" }, { id: "7_to_8", label: "7-8 hours (Ideal!)" }, { id: "more_than_8", label: "More than 8 hours" }], required: true },
    { id: "waterIntakeLiters", question: "How much water do you drink per day, in liters?", subtitle: "Hydration is a cornerstone of fitness.", type: "number_input", placeholder: "e.g., 2.5", unit: "Liters", required: true, min: 0, max: 10 },
    { id: "dietType", question: "What does your current diet look like?", type: "single_select", options: [{ id: "balanced", label: "Balanced Diet" }, { id: "low_carb", label: "Low-Carb" }, { id: "vegetarian", label: "Vegetarian" }, { id: "vegan", label: "Vegan" }, { id: "other", label: "Other / No specific diet" }], required: true },
    
    // Motivation
    { id: "motivation", question: "Last question! What is your biggest motivation to get fit?", type: "text_input", placeholder: "e.g., To feel more energetic", required: true },
];

const validateStep = (stepConfig: StepConfig, value: any): string | null => {
    if (stepConfig.required) {
        if (value === undefined || value === null || `${value}`.trim() === "") {
            return "This field is required.";
        }
    } else {
        // If not required and empty, it's valid
        if (value === undefined || value === null || `${value}`.trim() === "") {
            return null;
        }
    }
    
    if (stepConfig.type === 'number_input') {
        const num = Number(value);
        if (isNaN(num)) return "Please enter a valid number.";
        if (stepConfig.min !== undefined && num < stepConfig.min) {
            return `Value must be at least ${stepConfig.min}.`;
        }
        if (stepConfig.max !== undefined && num > stepConfig.max) {
            return `Value must be no more than ${stepConfig.max}.`;
        }
    }
    
    if (stepConfig.inputType === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return "Please enter a valid email address.";
        }
    }

    return null; // No error
};


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

    const currentStepConfig = quizSteps[currentStep];
    const isLastStep = currentStep === quizSteps.length - 1;


    if (showWelcome) {
        return <QuizWelcome onStart={() => setShowWelcome(false)} />;
    }

    const canGoNext = () => {
        const currentAnswer = answers[currentStepConfig.id as keyof QuizData];
        // For optional steps like camera, can always go next if no value is provided.
        if (!currentStepConfig.required && (currentAnswer === undefined || currentAnswer === null || currentAnswer === '')) {
            return true;
        }
        return validateStep(currentStepConfig, currentAnswer) === null;
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