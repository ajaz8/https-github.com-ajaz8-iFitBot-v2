
import React, { useState, useRef, useContext, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { generateWorkoutPlan, generateAssessmentReport } from '../services/geminiService';
import type { WorkoutPlanApiResponse, PendingWorkoutPlan, ReportData } from '../types';
import { Loader, Dumbbell, AlertTriangle, Home, FileCheck2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import GeneratedPlanConfirmation from '../components/GeneratedPlanConfirmation';
import ReportContent from '../components/ReportContent';

const loadingMessages = [
    'Analyzing your assessment data...',
    'Extracting key performance metrics...',
    'Assigning an expert iFit trainer...',
    'Designing your draft workout schedule...',
    'Selecting the best exercises for you...',
    'Preparing your plan for review...'
];

export default function WorkoutGuidePage() {
    const { quizData } = useContext(AppContext);
    const [generatedResponse, setGeneratedResponse] = useState<WorkoutPlanApiResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // For rendering the report off-screen to generate an image
    const hiddenReportRef = useRef<HTMLDivElement>(null);
    const [reportDataForCanvas, setReportDataForCanvas] = useState<ReportData | null>(null);
    const loadingIntervalRef = useRef<number | null>(null);


    // This effect runs after reportData is fetched and the hidden component is rendered.
    // It generates the canvas image and then proceeds to generate the workout plan.
    useEffect(() => {
        if (!reportDataForCanvas || !hiddenReportRef.current || !quizData) return;

        const generateImageAndPlan = async () => {
            try {
                const canvas = await html2canvas(hiddenReportRef.current, { scale: 2 });
                const imageBase64 = canvas.toDataURL('image/jpeg', 0.9);

                const userName = quizData.name || 'Valued Client';
                const response = await generateWorkoutPlan(imageBase64, userName);

                if (response.assigned_trainer && response.workout_guide_draft) {
                    const newPendingPlan: PendingWorkoutPlan = {
                        id: new Date().toISOString(),
                        userName: userName,
                        assignedTrainerName: response.assigned_trainer.name,
                        status: 'pending',
                        generatedAt: new Date().toISOString(),
                        planData: response,
                        quizData: quizData,
                    };
                    const existingPlansJSON = localStorage.getItem('pending_plans');
                    const existingPlans: PendingWorkoutPlan[] = existingPlansJSON ? JSON.parse(existingPlansJSON) : [];
                    localStorage.setItem('pending_plans', JSON.stringify([...existingPlans, newPendingPlan]));
                }
                
                setGeneratedResponse(response);

            } catch (err) {
                console.error("Error during canvas or plan generation:", err);
                setError("Failed to process your assessment and generate the plan. Please try again.");
            } finally {
                if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
                setLoading(false);
                setReportDataForCanvas(null); // Clean up
            }
        };

        // Use a small timeout to ensure the DOM is fully updated before html2canvas runs.
        const timer = setTimeout(() => {
            generateImageAndPlan();
        }, 100);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportDataForCanvas, quizData]);


    const handleGeneratePlan = async () => {
        if (!quizData) {
            setError("Could not find the original assessment data. Please complete the assessment first.");
            navigate('/assessment');
            return;
        }

        setLoading(true);
        setError(null);
        setGeneratedResponse(null);

        let messageIndex = 0;
        loadingIntervalRef.current = window.setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            setLoadingMessage(loadingMessages[messageIndex]);
        }, 3000);

        try {
            // Step 1: Generate the report data silently
            const reportData = await generateAssessmentReport(quizData);
            // Step 2: Set it to state, which triggers the useEffect for canvas generation
            setReportDataForCanvas(reportData);
        } catch (err) {
            console.error(err);
            setError("Failed to generate the initial assessment report needed for the workout plan. Please try again.");
            if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
            setLoading(false);
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="text-center text-white p-10">
                    <Loader className="w-12 h-12 mx-auto animate-spin text-lime-500 mb-4" />
                    <h2 className="text-2xl font-semibold">Crafting Your Pro Workout Plan...</h2>
                    <p className="text-gray-400">{loadingMessage}</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center text-white bg-red-900/50 p-6 rounded-lg my-6">
                    <AlertTriangle className="w-10 h-10 mx-auto text-red-500 mb-4" />
                    <h2 className="text-xl font-semibold mb-2">An Error Occurred</h2>
                    <p className="text-red-300">{error}</p>
                </div>
            );
        }

        if (generatedResponse) {
             if (generatedResponse.needs_assessment && generatedResponse.cta_copy) {
                return (
                    <div className="text-center bg-gray-800/50 p-8 rounded-lg">
                        <FileCheck2 className="w-12 h-12 mx-auto text-lime-500 mb-4" />
                        <h2 className="text-2xl font-bold mb-2">{generatedResponse.cta_copy.title}</h2>
                        <p className="text-gray-300 mb-6">{generatedResponse.cta_copy.subtitle}</p>
                        <button 
                            onClick={() => navigate('/assessment')}
                            className="bg-gradient-to-r from-lime-500 to-green-500 text-white px-8 py-3 font-semibold rounded-lg transition-transform transform hover:scale-105"
                        >
                            {generatedResponse.cta_copy.button_label}
                        </button>
                    </div>
                );
            }

            if (generatedResponse.assigned_trainer) {
                return <GeneratedPlanConfirmation response={generatedResponse} />;
            }
        }

        // Default view: Generate button
        return (
             <div className="text-center space-y-8 p-8 bg-gray-800/50 border border-gray-700 rounded-lg">
                <h2 className="text-2xl text-white">
                    Ready to generate a plan for <span className="text-lime-400 font-bold">{quizData?.name}</span>?
                </h2>
                <p className="text-gray-400 max-w-xl mx-auto">
                    We'll use your recent assessment to create a personalized workout guide, which will then be sent to one of our expert trainers for final review and approval.
                </p>
                <button 
                    onClick={handleGeneratePlan}
                    disabled={loading} 
                    className="bg-gradient-to-r from-lime-500 to-green-500 text-white px-12 py-6 text-xl font-semibold rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none hover:shadow-lime-500/25"
                >
                    Generate My Expert Plan
                </button>
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
                    <h1 className="text-5xl font-bold mb-2">Workout Guide Generator</h1>
                    <p className="text-lg text-gray-400">Your AI-generated plan is reviewed by a human expert for safety and effectiveness.</p>
                </div>
                
                {renderContent()}
            </div>
            
            {/* Hidden component for html2canvas to render the report off-screen */}
            <div style={{ position: 'fixed', left: '-9999px', top: 0, width: '800px' }}>
                {reportDataForCanvas && quizData && (
                    <ReportContent ref={hiddenReportRef} reportData={reportDataForCanvas} quizData={quizData} />
                )}
            </div>
        </div>
    );
}