
import React, { useState, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../App';
import type { ReportData, QuizData } from '../types';
import { generateAssessmentReport } from '../services/geminiService';
import { Download, Share2, Loader, AlertTriangle, ArrowLeft, Home, Image as ImageIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import ReportContent from '../components/ReportContent';

const loadingMessages = [
    'Our AI coach is analyzing your data...',
    'Calculating your key metrics...',
    'Consulting nutritional databases...',
    'Designing your personalized plan...',
    'Cross-referencing with your goals...',
    'Almost there, finalizing your report...'
];

export default function ReportPage() {
    const { quizData } = useContext(AppContext);
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    const [error, setError] = useState<string | null>(null);
    const reportRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!quizData) {
            navigate('/assessment');
            return;
        }

        const generateReport = async () => {
            setLoading(true);
            setError(null);

            let messageIndex = 0;
            const intervalId = setInterval(() => {
                messageIndex = (messageIndex + 1) % loadingMessages.length;
                setLoadingMessage(loadingMessages[messageIndex]);
            }, 3000);
            
            try {
                const response = await generateAssessmentReport(quizData);
                if (response.report_markdown.startsWith("⚠️")) {
                     setError("Failed to generate the AI report. The service may be experiencing high demand or had an issue with your data. Please try again in a few moments.");
                     setReportData(null); // Ensure no partial/error data is shown
                } else {
                    setReportData(response);
                }
            } catch (err: any) {
                console.error("Report generation error:", err);
                if (err.message?.includes("AI_JSON_PARSE_ERROR")) {
                    setError("The AI had trouble formatting its response. This is a temporary issue, please try generating the report again.");
                } else {
                    setError("Failed to generate the AI report. A network or service error occurred. Please try again in a few moments.");
                }
            } finally {
                clearInterval(intervalId);
                setLoading(false);
            }
        };

        generateReport();
    }, [quizData, navigate]);

    const handleSaveAsPdf = () => {
        const input = reportRef.current;
        if (!input) return;
        html2canvas(input, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`iFit_Assessment_${quizData?.name}.pdf`);
        });
    };

    const handleSaveAsImage = () => {
        const input = reportRef.current;
        if (!input) return;
        html2canvas(input, { scale: 2, useCORS: true }).then(canvas => {
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `iFit_Assessment_${quizData?.name}.png`;
            link.click();
        });
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'My iFit Body Assessment',
                text: 'Check out my personalized fitness assessment from iFit!',
                url: window.location.href,
            }).catch(console.error);
        } else {
            alert("Share feature is not supported on your browser. You can save as PDF or copy the URL.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center p-4 md:p-8">
            <style>{`
                @keyframes content-fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-content-fade-in {
                    animation: content-fade-in 0.8s ease-out forwards;
                }
            `}</style>
            <div className="w-full max-w-5xl">
                 <div className="w-full flex justify-between items-center mb-4">
                    <Link to="/assessment" className="text-gray-300 hover:text-lime-500 flex items-center">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Assessment
                    </Link>
                    <Link to="/" className="text-gray-300 hover:text-lime-500 flex items-center">
                        <Home className="w-4 h-4 mr-2" /> Back to Home
                    </Link>
                </div>
                {loading && (
                    <div className="text-center text-white p-10">
                        <Loader className="w-12 h-12 mx-auto animate-spin text-lime-500 mb-4" />
                        <h2 className="text-2xl font-semibold">Generating Your Pro-Level Report...</h2>
                        <p className="text-gray-400">{loadingMessage}</p>
                    </div>
                )}
                {error && (
                    <div className="text-center text-white bg-red-900/50 p-10 rounded-lg">
                        <AlertTriangle className="w-12 h-12 mx-auto text-red-500 mb-4" />
                        <h2 className="text-2xl font-semibold">An Error Occurred</h2>
                        <p className="text-red-300 max-w-md mx-auto">{error}</p>
                    </div>
                )}
                {!loading && !error && reportData && quizData && (
                    <div className="animate-content-fade-in">
                        <div className="mb-6 bg-gray-800/50 rounded-lg p-2 flex flex-col sm:flex-row gap-2 justify-center items-center">
                            <button onClick={handleSaveAsPdf} className="w-full sm:w-auto bg-gray-700 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center transition-colors">
                                <Download className="w-4 h-4 mr-2" />
                                PDF
                            </button>
                             <button onClick={handleSaveAsImage} className="w-full sm:w-auto bg-gray-700 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center transition-colors">
                                <ImageIcon className="w-4 h-4 mr-2" />
                                Image
                            </button>
                            <button onClick={handleShare} className="w-full sm:w-auto bg-gray-700 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center transition-colors">
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                            </button>
                            <Link
                                to="/workout-guide"
                                className="w-full sm:w-auto flex-grow bg-gradient-to-r from-lime-500 to-green-500 hover:opacity-90 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center text-center transition-opacity"
                            >
                                Generate My Workout Guide
                            </Link>
                        </div>
                        <ReportContent ref={reportRef} reportData={reportData} quizData={quizData} />
                    </div>
                )}
            </div>
        </div>
    );
}