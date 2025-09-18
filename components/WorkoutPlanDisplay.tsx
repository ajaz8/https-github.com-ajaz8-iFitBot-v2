import React from 'react';
import type { WorkoutPlan } from '../types';
import { Zap } from 'lucide-react';

const WorkoutPlanDisplay = React.forwardRef<HTMLDivElement, { plan: WorkoutPlan, name: string }>(({ plan, name }, ref) => {
    if (!plan) return null;

    return (
        <div ref={ref} className="bg-white text-gray-800 p-4 sm:p-8 md:p-10 rounded-lg shadow-2xl printable-area font-sans">
            <div className="text-center mb-10 border-b-2 border-gray-200 pb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">{plan.title}</h1>
                <p className="text-md sm:text-lg text-gray-600 mt-2">Your <span className="font-semibold text-lime-600">{plan.duration_weeks}-Week Transformation Plan</span> for {name}</p>
                <p className="text-md text-gray-500 mt-2 max-w-2xl mx-auto leading-relaxed">{plan.description}</p>
            </div>
            
            <div className="mb-12 bg-lime-50 border border-lime-200 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-3 text-lime-800 flex items-center gap-2">
                    <Zap className="w-6 h-6" />
                    {plan.progression_principle.title}
                </h2>
                <p className="text-gray-700 leading-relaxed">{plan.progression_principle.description}</p>
            </div>

            {plan.weekly_workouts.map(week => (
                <div key={week.week} className="mb-12">
                    <h2 className="text-3xl font-bold mb-6 text-gray-800 border-l-4 border-lime-500 pl-4">Week {week.week}</h2>
                    <div className="space-y-8">
                        {week.workouts.map((workout, workoutIndex) => (
                            <div key={workout.day} className={`rounded-lg shadow-md overflow-hidden ${workoutIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white border border-gray-200'}`}>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900">Day {workout.day}: {workout.title} <span className="text-gray-500 font-normal text-base">- Approx. {workout.estimated_duration} min</span></h3>
                                    
                                    <div className="mt-4 bg-gray-100 border-l-4 border-lime-400 rounded-r-lg p-3">
                                        <h4 className="font-semibold text-gray-800">Warm-up</h4>
                                        <p className="text-sm text-gray-600">{workout.warmup}</p>
                                    </div>

                                     <ul className="space-y-4 mt-4">
                                        {workout.exercises.map((ex, i) => (
                                            <li key={i} className="pb-4 border-b border-gray-200 last:border-b-0">
                                                <h4 className="font-bold text-lg text-gray-800">{ex.name}</h4>
                                                <div className="flex flex-wrap items-baseline text-gray-600 mt-2 text-sm gap-x-6">
                                                    <span><span className="font-medium text-gray-500">Sets:</span> {ex.sets}</span>
                                                    <span><span className="font-medium text-gray-500">Reps:</span> {ex.reps}</span>
                                                    <span><span className="font-medium text-gray-500">Rest:</span> {ex.rest_seconds}s</span>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{ex.instructions}</p>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-4 bg-gray-100 border-l-4 border-cyan-400 rounded-r-lg p-3">
                                        <h4 className="font-semibold text-gray-800">Cool-down</h4>
                                        <p className="text-sm text-gray-600">{workout.cooldown}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
             <div className="mt-12 text-center text-sm text-gray-500 border-t pt-6">
                <p>Disclaimer: This AI-generated plan is for informational purposes. Consult a professional before starting.</p>
            </div>
        </div>
    );
});

export default WorkoutPlanDisplay;