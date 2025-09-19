

import React from 'react';
import type { WorkoutPlanApiResponse } from '../types';
import { UserCheck, Calendar, Zap, Layers, Dumbbell } from 'lucide-react';

const InfoChip = ({ icon: Icon, text }: { icon: React.ElementType, text: string }) => (
    <div className="flex items-center gap-2 bg-gray-700/50 text-gray-300 text-sm px-3 py-1.5 rounded-full">
        <Icon size={16} className="text-lime-400" />
        <span>{text}</span>
    </div>
);

export default function GeneratedPlanConfirmation({ response }: { response: WorkoutPlanApiResponse }) {
    const { assigned_trainer, workout_guide_draft, presentation_markdown } = response;
    
    if (!assigned_trainer || !workout_guide_draft) {
        return <p>An unexpected error occurred while displaying the confirmation.</p>;
    }

    return (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-8 rounded-lg max-w-2xl mx-auto shadow-2xl">
            <div className="text-center">
                <UserCheck className="w-16 h-16 mx-auto text-lime-500 mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">Draft Plan Generated!</h2>
                <p className="text-gray-300 mb-6">Your personalized plan is now with our expert for final review.</p>
            </div>

            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-lg text-white mb-3">Key Details:</h3>
                <div className="flex flex-wrap gap-3">
                    <InfoChip icon={Calendar} text={`${workout_guide_draft.program_weeks}-Week Plan`} />
                    <InfoChip icon={Zap} text={`${workout_guide_draft.weekly_days} Days / Week`} />
                    <InfoChip icon={Layers} text={`${workout_guide_draft.phases.length} Phases`} />
                    <InfoChip icon={Dumbbell} text={`${workout_guide_draft.equipment_tier.charAt(0).toUpperCase() + workout_guide_draft.equipment_tier.slice(1)} Equipment`} />
                </div>
            </div>

            <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-left border-l-4 border-lime-500 pl-4 bg-gray-900/50 p-4 rounded-r-lg">
                <p className="font-bold text-white mb-2">Message from iFitBot:</p>
                {presentation_markdown}
            </div>
        </div>
    );
}