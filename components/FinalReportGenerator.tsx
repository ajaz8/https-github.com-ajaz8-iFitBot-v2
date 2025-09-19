
import React, { useRef, useState } from 'react';
import type { PendingWorkoutPlan } from '../types';
import FinalReportContent from './FinalReportContent';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ArrowLeft, Download, Image as ImageIcon, Loader } from 'lucide-react';

export default function FinalReportGenerator({ plan, onComplete, backButtonText = "Back to Dashboard" }: { plan: PendingWorkoutPlan, onComplete: () => void, backButtonText?: string }) {
    const reportRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationMessage, setGenerationMessage] = useState('');

    const generate = async (type: 'pdf' | 'image') => {
        const input = reportRef.current;
        if (!input) return;

        setIsGenerating(true);
        setGenerationMessage(`Generating ${type.toUpperCase()}...`);

        // Give the UI a moment to update before starting the intensive canvas operation
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            const canvas = await html2canvas(input, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff' // Ensure a white background for captures
            });

            if (type === 'pdf') {
                setGenerationMessage('Compressing PDF...');
                const imgData = canvas.toDataURL('image/jpeg', 0.9); // Use JPEG for smaller PDF size
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`iFit_Plan_${plan.userName}.pdf`);
            } else {
                setGenerationMessage('Saving Image...');
                const image = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = image;
                link.download = `iFit_Plan_${plan.userName}.png`;
                link.click();
            }
        } catch (error) {
            console.error(`Failed to generate ${type}`, error);
            alert(`Sorry, there was an error creating the ${type}. Please try again.`);
        } finally {
            setIsGenerating(false);
            setGenerationMessage('');
        }
    };


    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                 <header className="mb-6">
                    <div className="w-full flex justify-between items-center">
                         <button onClick={onComplete} className="text-gray-300 hover:text-lime-500 flex items-center">
                            <ArrowLeft className="w-4 h-4 mr-2" /> {backButtonText}
                        </button>
                        <div className="flex gap-2">
                             <button onClick={() => generate('image')} disabled={isGenerating} className="bg-gray-700 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center transition-colors disabled:opacity-50">
                                <ImageIcon className="w-4 h-4 mr-2" />
                                JPG Preview
                            </button>
                            <button onClick={() => generate('pdf')} disabled={isGenerating} className="bg-gray-700 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center transition-colors disabled:opacity-50">
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF
                            </button>
                        </div>
                    </div>
                     <div className="text-center mt-6">
                        <h1 className="text-4xl font-bold">Your Finalized Workout Guide</h1>
                        <p className="text-lg text-gray-400 mt-1">Reviewed and signed by {plan.assignedTrainerName}. Save your PDF for offline use.</p>
                    </div>
                </header>

                {isGenerating && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex flex-col justify-center items-center z-50">
                        <Loader className="w-12 h-12 mx-auto animate-spin text-lime-500 mb-4" />
                        <p className="text-lg">{generationMessage}</p>
                    </div>
                )}
                
                <div className="shadow-2xl">
                     <FinalReportContent ref={reportRef} plan={plan} />
                </div>
            </div>
        </div>
    );
}