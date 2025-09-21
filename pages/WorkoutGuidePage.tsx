
import React, { useState, useContext, useRef, useEffect } from 'react';
import { generateWorkoutPlan } from '../services/geminiService';
import { addPendingPlan } from '../services/planService';
import type { WorkoutPlanApiResponse, PendingWorkoutPlan } from '../types';
import { Loader, Dumbbell, AlertTriangle, Home, Mail, Upload, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import GeneratedPlanConfirmation from '../components/GeneratedPlanConfirmation';

const MAX_FILE_SIZE_MB = 4.5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const loadingMessages = [
    'Warming up the AI coach...',
    'Analyzing report structure...',
    'Extracting key metrics and goals...',
    'Designing foundational workout phase...',
    'Structuring weekly progression model...',
    'Selecting optimal exercises for your goal...',
    'Assigning an expert iFit trainer for review...',
    'Compiling your draft guide... almost there!'
];

interface ErrorState {
    title: string;
    message: string;
}

export default function WorkoutGuidePage() {
    const { quizData } = useContext(AppContext);
    const navigate = useNavigate();
    
    const [reportImage, setReportImage] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState(quizData?.email || '');
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [generatedResponse, setGeneratedResponse] = useState<WorkoutPlanApiResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    const [error, setError] = useState<ErrorState | null>(null);
    
    useEffect(() => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setIsEmailValid(emailRegex.test(userEmail));
    }, [userEmail]);
    
    const handleFileSelect = (file: File) => {
        setError(null);

        if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
            setError({
                title: "Unsupported File Type",
                message: "Please upload a valid image (PNG, JPG) or a PDF file."
            });
            return;
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            setError({
                title: "File Too Large",
                message: `Please upload a file smaller than ${MAX_FILE_SIZE_MB}MB.`
            });
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => setReportImage(reader.result as string);
        reader.onerror = () => setError({ title: "File Read Error", message: "Could not read the selected file. Please try again."});
        reader.readAsDataURL(file);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const triggerFileSelect = () => fileInputRef.current?.click();

    const handleGeneratePlan = async () => {
        if (!reportImage) {
            setError({ title: "Report Missing", message: "Please upload an image of your assessment report to proceed."});
            return;
        }
        if (!isEmailValid) {
            setError({ title: "Invalid Email", message: "Please enter a valid email to save and retrieve your plan."});
            return;
        }

        setLoading(true);
        setError(null);
        setGeneratedResponse(null);

        const intervalId = setInterval(() => {
            setLoadingMessage(prev => {
                const currentIndex = loadingMessages.indexOf(prev);
                const nextIndex = (currentIndex + 1) % loadingMessages.length;
                return loadingMessages[nextIndex];
            });
        }, 2500);

        try {
            const userName = quizData?.name || 'Valued Client';
            const response = await generateWorkoutPlan(reportImage, userName, quizData);

            if (response.assigned_trainer && response.workout_guide_draft) {
                const newPendingPlan: PendingWorkoutPlan = {
                    id: new Date().toISOString(),
                    userEmail: userEmail,
                    userName: userName,
                    assignedTrainerName: response.assigned_trainer.name,
                    status: 'pending',
                    generatedAt: new Date().toISOString(),
                    planData: response,
                    quizData: quizData,
                };
                addPendingPlan(newPendingPlan);
            }
            
            setGeneratedResponse(response);
        } catch (err: any) {
            console.error("Error during plan generation:", err);
            if (err.message?.includes("AI_JSON_PARSE_ERROR")) {
                setError({
                    title: "Analysis Failed",
                    message: "The AI could not read the data from the report image. Please try again with a clearer, higher-quality image."
                });
            } else {
                 setError({
                    title: "Generation Failed",
                    message: "Our AI service may be experiencing high demand or could not process the request. Please wait a few moments and try again."
                });
            }
        } finally {
            clearInterval(intervalId);
            setLoading(false);
        }
    };
    
    const renderContent = () => {
        if (loading) {
            return (
                <div className="text-center text-white p-10">
                    <Loader className="w-12 h-12 mx-auto animate-spin text-lime-500 mb-4" />
                    <h2 className="text-2xl font-semibold">Building your Draft Guide...</h2>
                    <p className="text-gray-400 transition-opacity duration-500">{loadingMessage}</p>
                </div>
            );
        }

        if (generatedResponse) {
             if (generatedResponse.assigned_trainer) {
                return <GeneratedPlanConfirmation response={generatedResponse} />;
            }
        }
        
        return (
             <div className="w-full max-w-2xl mx-auto space-y-6 text-center">
                 <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                    <h2 className="text-2xl font-semibold text-white">Upload Your Assessment</h2>
                    <p className="text-gray-400 mt-2">Attach your iFit report (PNG, JPG, or PDF). We’ll draft a program that matches your goals.</p>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileInputChange}
                        accept="image/png,image/jpeg,application/pdf"
                        className="hidden"
                    />
                    
                    {reportImage ? (
                        <div className="mt-4">
                            <div className="relative group bg-gray-900 p-2 rounded-lg inline-block">
                                <img src={reportImage} alt="Assessment report preview" className="rounded-md max-h-64 mx-auto shadow-lg" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                    <button onClick={() => setReportImage(null)} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                                        <X size={18} /> Change File
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div 
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`mt-6 p-8 border-2 border-dashed rounded-lg transition-colors ${isDragging ? 'border-lime-500 bg-gray-800' : 'border-gray-600'}`}
                        >
                            <p className="text-gray-500 mb-4">No file yet? Take the assessment to unlock your guide.</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button onClick={triggerFileSelect} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                                    Upload Report
                                </button>
                                <button onClick={() => navigate('/assessment')} className="bg-lime-600 hover:bg-lime-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                                    Do the Assessment
                                </button>
                            </div>
                        </div>
                    )}
                 </div>

                {error && (
                    <div className="bg-red-900/40 border border-red-500/50 p-4 rounded-lg text-center">
                        <div className="flex justify-center items-center gap-3">
                            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
                            <h3 className="text-lg font-semibold text-red-300">{error.title}</h3>
                        </div>
                        <p className="text-red-300/90 mt-2">{error.message}</p>
                    </div>
                )}
                
                {reportImage && (
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 flex flex-col items-center gap-4">
                        <label htmlFor="email-input" className="font-semibold text-white">
                            Enter your email to save and retrieve your plan:
                        </label>
                         <div className="relative w-full max-w-sm">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                            <input 
                                id="email-input"
                                type="email"
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                                placeholder="your.email@example.com"
                                className={`w-full bg-gray-700 border-2 rounded-lg text-white placeholder-gray-500 p-3 pl-10 focus:outline-none focus:ring-2 transition-colors ${!isEmailValid && userEmail ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-lime-500 focus:ring-lime-500'}`}
                            />
                        </div>
                         {!quizData && !userEmail && (
                            <p className="text-sm text-yellow-300/80 mt-2 max-w-md">
                                Note: No assessment profile found. The AI will generate a plan from the report image, but an email is required to save it.
                            </p>
                        )}
                        <button 
                            onClick={handleGeneratePlan}
                            disabled={loading || !isEmailValid}
                            className="bg-gradient-to-r from-lime-500 to-green-500 text-white px-12 py-4 text-lg font-semibold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Generate My Workout Guide
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="w-full flex justify-end items-center mb-4">
                    <Link to="/" className="text-gray-300 hover:text-lime-500 flex items-center">
                        <Home className="w-4 h-4 mr-2" /> Back to Home
                    </Link>
                </div>
                <div className="text-center mb-12">
                    <Dumbbell className="w-16 h-16 mx-auto text-lime-500 mb-4" />
                    <h1 className="text-5xl font-bold mb-2">Workout Guide</h1>
                     <p className="text-lg text-gray-400 max-w-2xl mx-auto">Turn your assessment into a pro, structured plan—reviewed by a real trainer.</p>
                </div>
                
                {renderContent()}

            </div>
        </div>
    );
}