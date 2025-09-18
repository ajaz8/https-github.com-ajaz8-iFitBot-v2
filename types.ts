export interface QuizData {
    id?: string;
    name: string;
    email: string;
    gender: 'male' | 'female';
    age: number;
    currentWeight: number;
    height: number;
    goal: 'lose_weight' | 'gain_muscle' | 'get_shredded';
    targetWeight: number;
    targetPeriodWeeks: number;
    bodyImage?: string; // Base64 encoded image data
    fitnessLevel: 'beginner' | 'amateur' | 'advanced';
    workoutFrequency: 'not_at_all' | '1-2_times' | '3_times' | 'more_than_3';
    workoutLocation: 'home' | 'gym' | 'both';
    sleepHours: 'less_than_5' | '5_to_6' | '7_to_8' | 'more_than_8';
    stressLevel: 'low' | 'moderate' | 'high';
    dietType: 'balanced' | 'low_carb' | 'vegetarian' | 'vegan' | 'other';
    // New fields for deeper insights
    waterIntake: 'less_than_1l' | '1_to_2l' | 'more_than_2l';
    dailyActivity: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
    motivation: string;
}

export interface ReportData {
    summary: string;
    metrics: {
        bmi: number;
        bmi_category: string;
        bmr: number;
        tdee: number;
    };
    nutrition: {
        daily_calories: number;
        calorie_explanation: string;
        macros: {
            protein_grams: number;
            carbs_grams: number;
            fat_grams: number;
        };
    };
    sampleMealDay: {
        title: string;
        meals: {
            name: string;
            description: string;
        }[];
    };
    // New field for AI-driven lifestyle insights
    potentialChallenges: string[];
    recommendations: string[];
}

export interface Exercise {
    name: string;
    sets: number;
    reps: string;
    rest_seconds: number;
    instructions: string;
}

export interface Workout {
    day: number;
    title: string;
    estimated_duration: number;
    warmup: string;
    exercises: Exercise[];
    cooldown: string;
}

export interface WeeklyWorkout {
    week: number;
    workouts: Workout[];
}

export interface WorkoutPlan {
    title: string;
    description: string;
    duration_weeks: number;
    progression_principle: {
        title: string;
        description: string;
    };
    weekly_workouts: WeeklyWorkout[];
}

// New type for exercise variations
export interface Variation {
  name: string;
  description: string;
}

// Types for the Exercise Library
export type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core';
export type Equipment = 'Bodyweight' | 'Dumbbells' | 'Barbell' | 'Kettlebell' | 'Resistance Bands';
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface LibraryExercise {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  videoUrl: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  difficulty: Difficulty;
  variations?: Variation[];
}