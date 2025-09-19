
import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Home, AlertCircle } from 'lucide-react';
import CameraInput from './CameraInput';
import { Link } from 'react-router-dom';

export interface StepConfig {
    id: string;
    question: string;
    subtitle?: string;
    type: string;
    placeholder?: string;
    inputType?: string;
    unit?: string;
    options?: { id: string; label: string; desc?: string }[];
    min?: number;
    max?: number;
    required?: boolean;
    defaultValue?: any;
}

// Validation logic for a single step
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


interface QuizStepProps {
    step: number;
    totalSteps: number;
    stepConfig: StepConfig;
    value: any;
    onChange: (value: any) => void;
    onNext: () => void;
    onBack: () => void;
    canGoNext: boolean;
    isLast: boolean;
}

const InputError = ({ message }: { message: string | null }) => {
    if (!message) return null;
    return (
        <div className="flex items-center gap-2 text-red-400 text-sm mt-2">
            <AlertCircle size={16} />
            <span>{message}</span>
        </div>
    );
};

const TextInput = ({ value, onChange, stepConfig, error }: { value: string, onChange: (v: string) => void, stepConfig: StepConfig, error: string | null }) => (
    <div className="w-full max-w-lg">
        <input
            type={stepConfig.inputType || 'text'}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={stepConfig.placeholder}
            className={`w-full text-base p-4 bg-gray-800 border-2 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${error ? 'border-red-500/80 focus:ring-red-500' : 'border-gray-700 focus:ring-lime-500 focus:border-lime-500'}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${stepConfig.id}-error` : undefined}
        />
        <div id={`${stepConfig.id}-error`} aria-live="polite">
            <InputError message={error} />
        </div>
    </div>
);

const NumberInput = ({ value, onChange, stepConfig, error }: { value: number, onChange: (v: number | undefined) => void, stepConfig: StepConfig, error: string | null }) => (
     <div className="w-full max-w-lg">
        <div className="relative w-full">
            <input
                type="number"
                value={value || ''}
                onChange={(e) => {
                    const num = parseInt(e.target.value, 10);
                    onChange(isNaN(num) ? undefined : num);
                }}
                placeholder={stepConfig.placeholder}
                min={stepConfig.min}
                max={stepConfig.max}
                className={`w-full text-base p-4 bg-gray-800 border-2 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 pr-20 transition-colors ${error ? 'border-red-500/80 focus:ring-red-500' : 'border-gray-700 focus:ring-lime-500 focus:border-lime-500'}`}
                aria-invalid={!!error}
                aria-describedby={error ? `${stepConfig.id}-error` : undefined}
            />
            {stepConfig.unit && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-base">{stepConfig.unit}</span>}
        </div>
        <div id={`${stepConfig.id}-error`} aria-live="polite">
            <InputError message={error} />
        </div>
    </div>
);

const SingleSelect = ({ value, onChange, stepConfig }: { value: string, onChange: (v: string) => void, stepConfig: StepConfig }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
        {stepConfig.options?.map(option => (
            <button
                key={option.id}
                onClick={() => onChange(option.id)}
                className={`p-5 border-2 rounded-lg text-left transition-all duration-200 relative ${value === option.id ? 'bg-lime-500/10 border-lime-500' : 'bg-gray-800 border-gray-700 hover:border-gray-600 hover:bg-gray-700'}`}
            >
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-base font-semibold text-white">{option.label}</h3>
                        {option.desc && <p className="text-sm text-gray-400 mt-1">{option.desc}</p>}
                    </div>
                     {value === option.id && <CheckCircle className="w-6 h-6 text-lime-500 flex-shrink-0 ml-4" />}
                </div>
            </button>
        ))}
    </div>
);

export default function QuizStep({ step, totalSteps, stepConfig, value, onChange, onNext, onBack, canGoNext, isLast }: QuizStepProps) {
    const progress = (step / totalSteps) * 100;
    const [error, setError] = useState<string | null>(null);

    // Validate anytime the value or step changes
    useEffect(() => {
        // Only show validation error for required fields if a value exists (i.e., user has interacted)
        if (stepConfig.required && value !== undefined && value !== null) {
            const validationError = validateStep(stepConfig, value);
            setError(validationError);
        } else if (!stepConfig.required) {
            const validationError = validateStep(stepConfig, value);
            setError(validationError);
        } else {
             setError(null);
        }
    }, [value, stepConfig]);

    const handleValueChange = (newValue: any) => {
        const validationError = validateStep(stepConfig, newValue);
        setError(validationError);
        onChange(newValue);
    };

    const renderInput = () => {
        switch (stepConfig.type) {
            case 'text_input':
                return <TextInput value={value} onChange={handleValueChange} stepConfig={stepConfig} error={error} />;
            case 'number_input':
                return <NumberInput value={value} onChange={handleValueChange} stepConfig={stepConfig} error={error}/>;
            case 'single_select':
                 return <SingleSelect value={value} onChange={handleValueChange} stepConfig={stepConfig} />;
            case 'camera_input':
                return <CameraInput value={value} onChange={handleValueChange} />;
            default:
                return <p>Unknown step type</p>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col p-4">
            <header className="w-full max-w-4xl mx-auto pt-8">
                <div className="flex justify-between items-center gap-4 md:gap-8">
                    <span className="text-sm text-gray-400 whitespace-nowrap">Step {step} of {totalSteps}</span>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div className="bg-lime-500 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}></div>
                    </div>
                    <Link to="/" className="text-gray-400 hover:text-lime-500 flex items-center text-sm whitespace-nowrap">
                        <Home className="w-4 h-4 mr-1" />
                        Back to Home
                    </Link>
                </div>
            </header>
            <main className="flex-grow flex flex-col items-center justify-center text-center py-12 md:py-16">
                <h1 className="text-2xl md:text-3xl font-bold mb-4">{stepConfig.question}</h1>
                {stepConfig.subtitle && <p className="text-base text-gray-300 mb-8 max-w-2xl leading-relaxed">{stepConfig.subtitle}</p>}
                <div className="w-full flex justify-center mt-8">{renderInput()}</div>
            </main>
            <footer className="w-full max-w-4xl mx-auto py-8 flex justify-between items-center">
                <button
                    onClick={onBack}
                    disabled={step === 1}
                    className="flex items-center gap-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:hover:text-gray-400 transition text-base px-6 py-3 rounded-lg"
                >
                    <ArrowLeft />
                    Back
                </button>
                <div className="flex items-center gap-4">
                    {!isLast && !stepConfig.required && (
                        <button
                            onClick={onNext}
                            className="text-gray-400 hover:text-white transition text-base px-6 py-3 rounded-lg"
                            aria-label="Skip this question"
                        >
                            Skip
                        </button>
                    )}
                    <button
                        onClick={onNext}
                        disabled={!canGoNext}
                        className="bg-gradient-to-r from-lime-500 to-green-500 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition hover:opacity-90 text-base"
                    >
                        {isLast ? 'Generate Report' : 'Next'}
                        <ArrowRight />
                    </button>
                </div>
            </footer>
        </div>
    );
}