import React from 'react';
import type { ReportData, QuizData, Flag } from '../types';
import { BookOpen, AlertTriangle, Flame, Droplets, Utensils, Wheat, Beef } from 'lucide-react';

// --- START: NEW VISUALIZATION COMPONENTS ---

const statusColors = {
    below: { text: 'text-blue-600', bg: 'bg-blue-100', accent: 'stroke-blue-500' },
    within: { text: 'text-green-600', bg: 'bg-green-100', accent: 'stroke-green-500' },
    above: { text: 'text-yellow-600', bg: 'bg-yellow-100', accent: 'stroke-yellow-500' },
};

const Gauge = ({ label, value, unit, idealMin, idealMax, status }: { label: string, value: number, unit: string, idealMin: number, idealMax: number, status: "below" | "within" | "above" }) => {
    const min = idealMin - (idealMax - idealMin);
    const max = idealMax + (idealMax - idealMin);
    const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
    
    const colors = statusColors[status] || statusColors.within;

    return (
        <div className={`p-4 rounded-lg shadow-md flex flex-col items-center justify-between h-full ${colors.bg}`}>
            <h3 className="text-md font-bold text-gray-700">{label}</h3>
            <div className="relative w-full max-w-[200px] aspect-video">
                <svg viewBox="0 0 100 50" className="w-full h-full">
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e5e7eb" strokeWidth="8" strokeLinecap="round" />
                    <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        className={colors.accent}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="125.6"
                        strokeDashoffset={125.6 - (percentage / 100) * 125.6}
                        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                </svg>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                    <span className={`text-3xl font-bold ${colors.text}`}>{value.toFixed(1)}</span>
                    <span className="text-lg text-gray-600">{unit}</span>
                </div>
            </div>
             <div className="text-center text-xs text-gray-500">
                <p>Ideal: {idealMin.toFixed(1)} - {idealMax.toFixed(1)}{unit}</p>
                <p className={`font-semibold capitalize ${colors.text}`}>{status} Ideal Range</p>
            </div>
        </div>
    );
};

const MacroDisplay = ({ label, value, unit, icon: Icon, colorClass }: { label: string, value: string, unit: string, icon: React.ElementType, colorClass: string }) => (
    <div className={`flex items-center gap-3 p-3 rounded-lg ${colorClass}`}>
        <Icon className="w-7 h-7 text-white" />
        <div>
            <div className="text-white text-sm font-semibold">{label}</div>
            <div className="text-white/90 text-lg font-bold">{value} <span className="text-sm font-normal">{unit}</span></div>
        </div>
    </div>
);


const NutritionTargets = ({ targets }: { targets: ReportData['nutrition_targets'] }) => {
    return (
        <div className="bg-gray-700 p-4 rounded-lg shadow-md flex flex-col justify-between h-full">
             <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2"><Utensils size={20} /> Daily Nutrition</h3>
                <div className="mt-2">
                    <span className="text-5xl font-bold text-lime-400">{targets.recommended_calories_kcal}</span>
                    <span className="text-lg text-gray-300 ml-1">kcal</span>
                </div>
            </div>
            <div className="space-y-2">
                 <MacroDisplay label="Protein" value={`${targets.protein_g}`} unit="g" icon={Beef} colorClass="bg-red-500/80" />
                 <MacroDisplay label="Carbs" value={`${targets.carbs_g_range?.[0] || '?'} - ${targets.carbs_g_range?.[1] || '?'}`} unit="g" icon={Wheat} colorClass="bg-yellow-500/80" />
                 <MacroDisplay label="Fats" value={`${targets.fats_g_range?.[0] || '?'} - ${targets.fats_g_range?.[1] || '?'}`} unit="g" icon={Flame} colorClass="bg-blue-500/80" />
                 <MacroDisplay label="Water" value={`${targets.water_l}`} unit="Liters" icon={Droplets} colorClass="bg-cyan-500/80" />
            </div>
        </div>
    );
};

const FlagsDisplay = ({ flags }: { flags: Flag[] }) => {
    if (!flags || flags.length === 0) return null;
    
    const severityStyles = {
        low: 'bg-blue-100 border-blue-500 text-blue-800',
        medium: 'bg-yellow-100 border-yellow-500 text-yellow-800',
        high: 'bg-red-100 border-red-500 text-red-800'
    };

    return (
        <div className="mb-10">
             <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-red-500 pl-4 my-6 flex items-center gap-3">
                <AlertTriangle className="text-red-500" /> Key Focus Areas
            </h2>
             <div className="space-y-4">
                {flags.map((flag, index) => (
                    <div key={index} className={`border-l-4 p-4 rounded-r-lg ${severityStyles[flag.severity]}`}>
                        <p className="font-bold">{flag.issue}</p>
                        <p className="text-sm mt-1">{flag.why}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- END: NEW VISUALIZATION COMPONENTS ---


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

            {/* --- NEW VISUAL DASHBOARD --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Gauge 
                        label="Estimated Body Fat"
                        value={reportData.body_comp.estimated_bf_percent}
                        unit="%"
                        idealMin={reportData.body_comp.bf_ideal_band[0]}
                        idealMax={reportData.body_comp.bf_ideal_band[1]}
                        status={reportData.body_comp.bf_status}
                    />
                     <Gauge 
                        label="Total Body Water"
                        value={reportData.body_comp.estimated_tbw_percent}
                        unit="%"
                        idealMin={reportData.body_comp.tbw_typical_band[0]}
                        idealMax={reportData.body_comp.tbw_typical_band[1]}
                        status={reportData.body_comp.tbw_status}
                    />
                </div>
                <div className="lg:col-span-1">
                    <NutritionTargets targets={reportData.nutrition_targets} />
                </div>
            </div>
            
            <FlagsDisplay flags={reportData.flags} />
            
            <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(reportData.report_markdown) }}
            />

            {reportData.methodology && reportData.methodology.length > 0 && (
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