
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { WorkoutPlanApiResponse } from '../types';
import { UserCheck, Layers, BarChart, Calendar, Zap, Share2 } from 'lucide-react';

export default function GeneratedPlanConfirmation({ response }: { response: WorkoutPlanApiResponse }) {
    const { assigned_trainer } = response;

    const { randomTrainer, randomMessage } = useMemo(() => {
        const trainers = ["Athul", "Athithiya", "Saieel"];
        const randomTrainer = assigned_trainer?.name || trainers[Math.floor(Math.random() * trainers.length)];

        const messages = [
            `Dear user, kindly contact our trainer Mr ${randomTrainer} to receive your finalized workout guide. As an AI, we always aim to deliver a fully accurate program, so your guide will be released only after trainer review.`,
            `Your draft is ready. For accuracy and safety, it will be finalized by Mr ${randomTrainer}. Please contact the trainer to receive the completed guide.`
        ];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];

        return { randomTrainer, randomMessage };
    }, [assigned_trainer]);
    
    if (!assigned_trainer) {
        return <p>An unexpected error occurred while displaying the confirmation.</p>;
    }
    
    const phoneNumber = "971581514436";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=Hello Mr ${randomTrainer}, I have generated my iFit workout plan and would like to have it reviewed.`;

    const handleShare = async () => {
        const shareUrl = window.location.origin + window.location.pathname + '#/my-plan';
        const shareData = {
            title: 'My iFit Draft Plan',
            text: 'I just generated a draft workout plan with iFit! It\'s now waiting for a trainer to review it.',
            url: shareUrl,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Error sharing plan:', err);
            }
        } else if (navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(shareUrl);
                alert('Plan link copied to clipboard!');
            } catch (err) {
                alert('Could not copy link. Please manually share this URL: ' + shareUrl);
            }
        } else {
            alert('To share, please manually copy this link: ' + shareUrl);
        }
    };

    return (
        <div className="bg-gray-800/50 border border-gray-700 p-6 sm:p-8 rounded-lg max-w-3xl mx-auto shadow-2xl">
            <div className="text-center">
                <UserCheck className="w-16 h-16 mx-auto text-lime-500 mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">Your Draft Guide</h2>
                <p className="text-gray-300 mb-8">Awaiting Trainer Review</p>
            </div>

            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Your AI-Generated Draft Includes:</h3>
                <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-3"><Calendar className="w-5 h-5 text-lime-400 mt-0.5 flex-shrink-0" /><span>6-week structure with clear phases</span></li>
                    <li className="flex items-start gap-3"><BarChart className="w-5 h-5 text-lime-400 mt-0.5 flex-shrink-0" /><span>3–5 sessions/week matched to your assessment</span></li>
                    <li className="flex items-start gap-3"><Zap className="w-5 h-5 text-lime-400 mt-0.5 flex-shrink-0" /><span>Safe progressions and coaching cues</span></li>
                    <li className="flex items-start gap-3"><Layers className="w-5 h-5 text-lime-400 mt-0.5 flex-shrink-0" /><span>Printable overview + day-by-day schedule</span></li>
                </ul>
            </div>

            <div className="mt-8 bg-lime-900/50 border-l-4 border-lime-500 rounded-r-lg p-5">
                 <p className="text-lime-200">{randomMessage}</p>
            </div>
            
            <div className="text-center mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
                    Contact Trainer
                </a>
                <Link to="/my-plan" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
                    View Draft Summary
                </Link>
                <button onClick={handleShare} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <Share2 size={16} /> Share Draft
                </button>
            </div>
        </div>
    );
}
