import React from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Home } from 'lucide-react';
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

const TextInput = ({ value, onChange, stepConfig }: { value: string, onChange: (v: string) => void, stepConfig: StepConfig }) => (
    <input
        type={stepConfig.inputType || 'text'}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={stepConfig.placeholder}
        className="w-full max-w-lg text-2xl p-4 bg-gray-800 border-2 border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
    />
);

const NumberInput = ({ value, onChange, stepConfig }: { value: number, onChange: (v: number | undefined) => void, stepConfig: StepConfig }) => (
    <div className="relative max-w-lg w-full">
        <input
            type="number"
            value={value || ''}
            onChange={(e) => {
                const num = parseInt(e.target.value, 10);
                if (isNaN(num)) {
                    onChange(undefined);
                    return;
                }
                onChange(num)
            }}
            placeholder={stepConfig.placeholder}
            min={stepConfig.min}
            max={stepConfig.max}
            className="w-full text-2xl p-4 bg-gray-800 border-2 border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500 pr-20"
        />
        {stepConfig.unit && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">{stepConfig.unit}</span>}
    </div>
);

const SingleSelect = ({ value, onChange, stepConfig }: { value: string, onChange: (v: string) => void, stepConfig: StepConfig }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
        {stepConfig.options?.map(option => (
            <button
                key={option.id}
                onClick={() => onChange(option.id)}
                className={`p-6 border-2 rounded-lg text-left transition-all duration-200 relative ${value === option.id ? 'bg-lime-500/10 border-lime-500' : 'bg-gray-800 border-gray-700 hover:border-gray-600 hover:bg-gray-700'}`}
            >
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-semibold text-white">{option.label}</h3>
                        {option.desc && <p className="text-gray-400 mt-1">{option.desc}</p>}
                    </div>
                     {value === option.id && <CheckCircle className="w-6 h-6 text-lime-500 flex-shrink-0 ml-4" />}
                </div>
            </button>
        ))}
    </div>
);

export default function QuizStep({ step, totalSteps, stepConfig, value, onChange, onNext, onBack, canGoNext, isLast }: QuizStepProps) {
    const progress = (step / totalSteps) * 100;

    const renderInput = () => {
        switch (stepConfig.type) {
            case 'text_input':
                return <TextInput value={value} onChange={onChange} stepConfig={stepConfig} />;
            case 'number_input':
                return <NumberInput value={value} onChange={onChange} stepConfig={stepConfig} />;
            case 'single_select':
                 return <SingleSelect value={value} onChange={onChange} stepConfig={stepConfig} />;
            case 'camera_input':
                return <CameraInput value={value} onChange={onChange} />;
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
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">{stepConfig.question}</h1>
                {stepConfig.subtitle && <p className="text-lg text-gray-400 mb-10 max-w-2xl leading-relaxed">{stepConfig.subtitle}</p>}
                <div className="w-full flex justify-center">{renderInput()}</div>
            </main>
            <footer className="w-full max-w-4xl mx-auto py-8 flex justify-between items-center">
                <button
                    onClick={onBack}
                    disabled={step === 1}
                    className="flex items-center gap-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:hover:text-gray-400 transition text-lg px-6 py-3 rounded-lg"
                >
                    <ArrowLeft />
                    Back
                </button>
                <button
                    onClick={onNext}
                    disabled={!canGoNext}
                    className="bg-gradient-to-r from-lime-500 to-green-500 text-white font-bold py-4 px-10 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition hover:opacity-90 text-lg"
                >
                    {isLast ? 'Generate Report' : 'Next'}
                    <ArrowRight />
                </button>
            </footer>
        </div>
    );
}