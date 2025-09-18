import React, { useState, useContext, useRef } from 'react';
import { AppContext } from '../App';
import type { WorkoutPlan } from '../types';
import { generateWorkoutPlan } from '../services/geminiService';
import { Loader, Dumbbell, AlertTriangle, Download, Share2, ArrowLeft, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import WorkoutPlanDisplay from '../components/WorkoutPlanDisplay';

const loadingMessages = [
    'Analyzing your assessment...',
    'Designing your weekly schedule...',
    'Selecting the best exercises for you...',
    'Incorporating progression principles...',
    'Building your multi-week plan...',
    'Just a few more seconds...'
];

export default function WorkoutGuidePage() {
    const { quizData } = useContext(AppContext);
    const [generatedPlan, setGeneratedPlan] = useState<WorkoutPlan | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    const [error, setError] = useState<string | null>(null);
    const planRef = useRef<HTMLDivElement>(null);

    const handleGeneratePlan = async () => {
        if (!quizData) {
            setError("Please complete a Body Assessment first to generate a workout guide.");
            return;
        };
        setLoading(true);
        setError(null);
        setGeneratedPlan(null);

        let messageIndex = 0;
        const intervalId = setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            setLoadingMessage(loadingMessages[messageIndex]);
        }, 3000);

        try {
            const response = await generateWorkoutPlan(quizData);
            setGeneratedPlan(response);
        } catch (err) {
            console.error(err);
            setError("Failed to generate the workout plan. The AI might be busy. Please try again in a moment.");
        } finally {
            clearInterval(intervalId);
            setLoading(false);
        }
    };

    const handleSaveAsPdf = () => {
        const input = planRef.current;
        if (!input) return;

        html2canvas(input, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = pdfWidth / canvasWidth;
            const pdfHeight = canvasHeight * ratio;
            
            let heightLeft = pdfHeight;
            let position = 0;
            
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();

            while (heightLeft > 0) {
              position = heightLeft - pdfHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
              heightLeft -= pdf.internal.pageSize.getHeight();
            }
            pdf.save(`iFitBot_WorkoutPlan_${quizData?.name}.pdf`);
        });
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: 'My iFitBot Workout Plan', text: 'Check out my personalized workout plan from iFitBot!', url: window.location.href, }).catch(console.error);
        } else {
            alert("Share feature not available on this browser. You can save as PDF or copy the URL.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                 <div className="w-full flex justify-between items-center mb-4">
                    <Link to="/report" className="text-gray-300 hover:text-lime-500 flex items-center">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Report
                    </Link>
                    <Link to="/" className="text-gray-300 hover:text-lime-500 flex items-center">
                        <Home className="w-4 h-4 mr-2" /> Back to Home
                    </Link>
                </div>
                <div className="text-center mb-12">
                    <Dumbbell className="w-16 h-16 mx-auto text-lime-500 mb-4" />
                    <h1 className="text-5xl font-bold mb-2">Workout Guide Generator</h1>
                    <p className="text-lg text-gray-400">Turn your assessment into an actionable, day-by-day workout plan.</p>
                </div>
                
                {!generatedPlan && !loading && (
                    <div className="text-center">
                        {quizData ? (
                             <button onClick={handleGeneratePlan} className="bg-gradient-to-r from-lime-500 to-green-500 hover:opacity-90 text-white px-12 py-6 text-xl font-semibold rounded-full shadow-2xl hover:shadow-lime-500/25 transition-all duration-300 transform hover:scale-105">
                                Generate My Expert Plan
                            </button>
                        ) : (
                            <div className="bg-yellow-900/50 text-yellow-300 p-4 rounded-lg flex flex-col items-center gap-4">
                                <AlertTriangle /> 
                                <p>No assessment data found. Please complete an assessment first.</p>
                                <Link to="/assessment" className="bg-lime-500 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded-lg">
                                    Start Assessment
                                </Link>
                            </div>
                        )}
                    </div>
                )}
                
                {loading && (
                    <div className="text-center text-white p-10">
                        <Loader className="w-12 h-12 mx-auto animate-spin text-lime-500 mb-4" />
                        <h2 className="text-2xl font-semibold">Crafting Your Pro Workout Plan...</h2>
                        <p className="text-gray-400">{loadingMessage}</p>
                    </div>
                )}

                {error && (
                    <div className="text-center text-white bg-red-900/50 p-10 rounded-lg">
                        <AlertTriangle className="w-12 h-12 mx-auto text-red-500 mb-4" />
                        <h2 className="text-2xl font-semibold">An Error Occurred</h2>
                        <p className="text-red-300">{error}</p>
                    </div>
                )}

                {!loading && generatedPlan && quizData && (
                     <>
                        <div className="mb-6 bg-gray-800/50 rounded-lg p-2 flex flex-col sm:flex-row gap-2 justify-center items-center">
                            <button onClick={handleSaveAsPdf} className="w-full sm:w-auto bg-gray-700 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center transition-colors">
                                <Download className="w-4 h-4 mr-2" />
                                PDF
                            </button>
                            <button onClick={handleShare} className="w-full sm:w-auto bg-gray-700 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center transition-colors">
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                            </button>
                             <button onClick={handleGeneratePlan} title="Regenerate Plan" className="w-full sm:w-auto flex-grow bg-gray-700 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center transition-colors">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Regenerate
                            </button>
                        </div>
                        <WorkoutPlanDisplay ref={planRef} plan={generatedPlan} name={quizData.name} />
                    </>
                )}
            </div>
        </div>
    );
}