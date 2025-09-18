import React from 'react';
import type { ReportData, QuizData } from '../types';
import { Target, PieChart, Utensils, CheckCircle, Scale, Flame, Lightbulb } from 'lucide-react';

const MetricCard = ({ icon: Icon, label, value, unit }: { icon: React.ElementType, label: string, value: string, unit: string }) => (
    <div className="bg-white p-4 rounded-xl flex items-center gap-4 border border-gray-200/80 shadow-lg shadow-gray-500/10">
        <div className="bg-gradient-to-br from-lime-100 to-lime-200 p-3 rounded-full">
            <Icon className="w-6 h-6 text-lime-600" />
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            <p className="text-xl font-bold text-gray-800">{value} <span className="text-base font-normal text-gray-500">{unit}</span></p>
        </div>
    </div>
);

const ReportContent = React.forwardRef<HTMLDivElement, { reportData: ReportData, quizData: QuizData }>(({ reportData, quizData }, ref) => {
    if (!reportData) return null;
    const { protein_grams, carbs_grams, fat_grams } = reportData.nutrition.macros;
    const { daily_calories } = reportData.nutrition;

    // Guard against division by zero if daily_calories is 0
    const proteinPercent = daily_calories > 0 ? Math.round((protein_grams * 4 / daily_calories) * 100) : 0;
    const fatPercent = daily_calories > 0 ? Math.round((fat_grams * 9 / daily_calories) * 100) : 0;
    const carbsPercent = 100 - proteinPercent - fatPercent;

    return (
        <div ref={ref} className="bg-white text-gray-800 p-4 sm:p-8 md:p-10 rounded-lg shadow-2xl printable-area font-sans">
            <div className="text-center mb-10 border-b-2 border-gray-200 pb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Your iFitBot Assessment</h1>
                <p className="text-md sm:text-lg text-gray-600 mt-2">Exclusively prepared for: <span className="font-semibold text-lime-600">{quizData.name}</span></p>
                <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="mb-12 bg-lime-50 border border-lime-200 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-3 text-lime-800">A Message From Your AI Coach</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{reportData.summary}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-10">
                    <div>
                        <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-3"><Target className="text-lime-500 w-8 h-8"/> Your Key Metrics</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <MetricCard icon={Flame} label="Daily Calories" value={String(Math.round(reportData.nutrition.daily_calories))} unit="kcal" />
                            <MetricCard icon={Scale} label="BMI" value={reportData.metrics.bmi.toFixed(1)} unit={`(${reportData.metrics.bmi_category})`} />
                            <MetricCard icon={Utensils} label="BMR (Resting)" value={String(Math.round(reportData.metrics.bmr))} unit="kcal/day" />
                            <MetricCard icon={CheckCircle} label="TDEE (Active)" value={String(Math.round(reportData.metrics.tdee))} unit="kcal/day" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-3"><PieChart className="text-lime-500 w-8 h-8"/> Daily Nutrition Plan</h2>
                        <div className="bg-gray-50 rounded-lg p-6">
                            <p className="text-center text-gray-600 mb-6 leading-relaxed">{reportData.nutrition.calorie_explanation}</p>
                            <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
                                <div className="relative w-40 h-40 flex items-center justify-center">
                                    <svg className="w-full h-full" viewBox="0 0 36 36">
                                        <circle cx="18" cy="18" r="15.915" className="stroke-current text-gray-200" strokeWidth="3" fill="transparent"></circle>
                                        <circle cx="18" cy="18" r="15.915" className="stroke-current text-blue-500" strokeWidth="3" fill="transparent" strokeDasharray={`${proteinPercent}, 100`} strokeDashoffset="0"></circle>
                                        <circle cx="18" cy="18" r="15.915" className="stroke-current text-green-500" strokeWidth="3" fill="transparent" strokeDasharray={`${carbsPercent}, 100`} strokeDashoffset={`-${proteinPercent}`}></circle>
                                        <circle cx="18" cy="18" r="15.915" className="stroke-current text-yellow-500" strokeWidth="3" fill="transparent" strokeDasharray={`${fatPercent}, 100`} strokeDashoffset={`-${proteinPercent + carbsPercent}`}></circle>
                                    </svg>
                                    <div className="absolute text-center">
                                        <span className="text-3xl font-bold text-gray-800">{Math.round(reportData.nutrition.daily_calories)}</span>
                                        <span className="text-sm block text-gray-500">Kcal</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-lg"><span className="w-3 h-3 rounded-full bg-blue-500"></span><div><span className="font-bold">{Math.round(protein_grams)}g</span> <span className="text-gray-600">Protein</span></div></div>
                                    <div className="flex items-center gap-2 text-lg"><span className="w-3 h-3 rounded-full bg-green-500"></span><div><span className="font-bold">{Math.round(carbs_grams)}g</span> <span className="text-gray-600">Carbs</span></div></div>
                                    <div className="flex items-center gap-2 text-lg"><span className="w-3 h-3 rounded-full bg-yellow-500"></span><div><span className="font-bold">{Math.round(fat_grams)}g</span> <span className="text-gray-600">Fats</span></div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-3"><Utensils className="text-lime-500 w-8 h-8"/> Sample Meal Day</h2>
                        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                            <p className="text-center text-gray-600 text-sm italic">{reportData.sampleMealDay.title}</p>
                            {reportData.sampleMealDay.meals.map(meal => (
                                <div key={meal.name} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                                    <p className="font-bold text-gray-800">{meal.name}</p>
                                    <p className="text-gray-600 leading-relaxed">{meal.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <div className="bg-lime-50 rounded-lg p-6 sticky top-8">
                        <h2 className="text-2xl font-bold mb-4 text-lime-800">Top Recommendations</h2>
                        <ul className="space-y-4">
                            {reportData.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                                    <span className="text-gray-700 leading-relaxed">{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {reportData.potentialChallenges && reportData.potentialChallenges.length > 0 && (
                <div className="mt-12">
                    <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-3"><Lightbulb className="text-lime-500 w-8 h-8"/> Lifestyle Insights & Opportunities</h2>
                    <div className="bg-lime-50 border border-lime-200 rounded-lg p-6 space-y-4">
                        {reportData.potentialChallenges.map((challenge, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                                <p className="text-gray-700 leading-relaxed">{challenge}</p>
                            </div>
                        ))}
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