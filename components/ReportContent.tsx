
import React from 'react';
import type { ReportData, QuizData } from '../types';
import { BookOpen } from 'lucide-react';

const ReportContent = React.forwardRef<HTMLDivElement, { reportData: ReportData, quizData: QuizData }>(({ reportData, quizData }, ref) => {
    if (!reportData) return null;

    // A simple markdown to HTML converter
    const renderMarkdown = (markdown: string) => {
        return markdown
            .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-gray-700 mt-6 mb-2">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-gray-800 border-l-4 border-lime-500 pl-4 my-6">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-gray-900 mb-4">$1</h1>')
            .replace(/\*\*(.*)\*\*/g, '<strong class="font-semibold text-gray-800">$1</strong>')
            .replace(/\n\s*-\s/g, '<li class="flex items-start"><span class="text-lime-500 font-bold mr-2 mt-1">&#8226;</span>')
            .replace(/(\<li.*\>.*<\/li\>)/g, '<ul>$1</ul>') // Not perfect, but wraps lists
            .replace(/<\/li\><ul>/g,'<li>') // cleanup nested lists
            .replace(/<\/ul\><li>/g,'</li><li>')
            .replace(/\n/g, '<br />');
    };

    return (
        <div ref={ref} className="bg-white text-gray-700 p-4 sm:p-8 md:p-10 rounded-lg shadow-2xl printable-area font-sans">
            <div className="text-center mb-10 border-b-2 border-gray-200 pb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Your iFit Assessment</h1>
                <p className="text-md sm:text-lg text-gray-600 mt-2">Exclusively prepared for: <span className="font-semibold text-lime-600">{quizData.name}</span></p>
                <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            
            <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(reportData.report_markdown) }}
            />

            {reportData.methodology && (
                 <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-3"><BookOpen className="text-lime-500 w-7 h-7"/> Methodology</h2>
                    <div className="bg-gray-100 rounded-lg p-6">
                        <ul className="text-gray-600 leading-relaxed text-sm list-disc list-inside space-y-1">
                            {reportData.methodology.map((item, index) => (
                                <li key={index}><em>{item}</em></li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            <div className="mt-12 text-center text-sm text-gray-500 border-t pt-6">
                <p>Disclaimer: This AI-generated report is for informational purposes only. Consult with a healthcare professional before starting any new fitness or nutrition plan.</p>
            </div>
        </div>
    );
});

export default ReportContent;