
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, FileText, BarChart3, Dumbbell, ShieldCheck, Rocket, ArrowLeft, ArrowRight } from 'lucide-react';

const ONBOARDING_KEY = 'ifit_onboarding_completed';

const slides = [
    {
        icon: Sparkles,
        title: "Welcome to iFit",
        description: "Your AI Personal Trainer. Get a hyper-personalized fitness and nutrition plan based on your unique profile and goals.",
    },
    {
        icon: FileText,
        title: "Step 1: Your Assessment",
        description: "Answer a few simple questions about your goals, body, and lifestyle. It only takes 2 minutes to create your profile.",
    },
    {
        icon: BarChart3,
        title: "Step 2: AI-Powered Report",
        description: "Instantly receive a detailed report with body composition estimates, nutrition targets, and key focus areas.",
    },
    {
        icon: Dumbbell,
        title: "Step 3: Pro Workout Guide",
        description: "Turn your report into a personalized, multi-week workout plan, drafted by our advanced AI coach.",
    },
    {
        icon: ShieldCheck,
        title: "Step 4: Trainer Approved",
        description: "For your safety and success, a certified iFit trainer reviews, refines, and approves your plan before you start.",
    },
    {
        icon: Rocket,
        title: "Ready to Start?",
        description: "Your transformation begins now. Let's build the plan that will help you reach your goals.",
    }
];

export default function OnboardingPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const navigate = useNavigate();

    const handleNext = () => {
        if (currentStep < slides.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleFinish = () => {
        localStorage.setItem(ONBOARDING_KEY, 'true');
        navigate('/assessment');
    };

    const { icon: Icon, title, description } = slides[currentStep];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex flex-col justify-between p-6">
            <div className="flex-grow flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-lime-500/10 border-2 border-lime-500/30 rounded-full flex items-center justify-center mb-8">
                    <Icon className="w-12 h-12 text-lime-400" />
                </div>
                <h1 className="text-4xl font-bold mb-4">{title}</h1>
                <p className="text-lg text-gray-300 max-w-md mx-auto">{description}</p>
            </div>

            <footer className="w-full max-w-lg mx-auto">
                <div className="flex justify-center items-center gap-3 mb-8">
                    {slides.map((_, index) => (
                        <div
                            key={index}
                            className={`w-2.5 h-2.5 rounded-full transition-all ${
                                index === currentStep ? 'bg-lime-500 scale-125' : 'bg-gray-600'
                            }`}
                        />
                    ))}
                </div>
                <div className="flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className="flex items-center gap-2 text-gray-400 hover:text-white disabled:opacity-30 transition"
                    >
                        <ArrowLeft /> Back
                    </button>
                    {currentStep === slides.length - 1 ? (
                        <button
                            onClick={handleFinish}
                            className="bg-gradient-to-r from-lime-500 to-green-500 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition hover:opacity-90"
                        >
                            Start My Assessment <Rocket />
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition"
                        >
                            Next <ArrowRight />
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
}