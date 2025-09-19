import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { PendingWorkoutPlan } from '../types';
import { getPendingPlans } from '../services/planService';
import FinalReportGenerator from '../components/FinalReportGenerator';

const StatusBadge = ({ status }: { status: 'pending' | 'approved' | 'rejected' }) => {
    const config = {
        pending: { Icon: Clock, color: 'text-yellow-400', label: 'Pending Review' },
        approved: { Icon: CheckCircle, color: 'text-green-400', label: 'Approved' },
        rejected: { Icon: XCircle, color: 'text-red-400', label: 'Rejected' },
    };
    const { Icon, color, label } = config[status];
    return (
        <span className={`flex items-center gap-2 text-sm font-semibold ${color}`}>
            <Icon size={16} /> {label}
        </span>
    );
};

export default function MyPlanPage() {
    const [email, setEmail] = useState('');
    const [foundPlans, setFoundPlans] = useState<PendingWorkoutPlan[]>([]);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState('');
    const [selectedPlan, setSelectedPlan] = useState<PendingWorkoutPlan | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setFoundPlans([]);
        setSearched(true);
        if (!email.trim()) {
            setError('Please enter a valid email address.');
            return;
        }

        try {
            const allPlans = getPendingPlans();
            const userPlans = allPlans.filter(plan => plan.userEmail.toLowerCase() === email.toLowerCase())
                                      .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
            setFoundPlans(userPlans);
        } catch (err) {
            console.error(err);
            setError('Could not retrieve plans. Please try again later.');
        }
    };

    if (selectedPlan) {
        return <FinalReportGenerator plan={selectedPlan} onComplete={() => setSelectedPlan(null)} backButtonText="Back to My Plans"/>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <Link to="/" className="text-gray-300 hover:text-lime-500 flex items-center mb-8">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Link>

                <header className="text-center mb-12">
                    <h1 className="text-5xl font-bold">My Approved Plan</h1>
                    <p className="text-lg text-gray-400 mt-2">Check the status of your plan and download it once approved.</p>
                </header>

                <form onSubmit={handleSearch} className="max-w-lg mx-auto flex items-center gap-2 mb-12">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter the email used for your assessment"
                        className="flex-1 bg-gray-800 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 p-3 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                        required
                    />
                    <button type="submit" className="bg-lime-500 text-white p-3 rounded-lg hover:bg-lime-600 transition-colors">
                        <Search size={24} />
                    </button>
                </form>
                
                {error && (
                     <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg max-w-lg mx-auto">
                        <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
                        <p>{error}</p>
                    </div>
                )}

                <div className="space-y-4">
                    {foundPlans.length > 0 ? (
                        foundPlans.map(plan => (
                            <div key={plan.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-5">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <p className="font-semibold text-white">Plan for {plan.userName}</p>
                                        <p className="text-sm text-gray-400">Generated on: {new Date(plan.generatedAt).toLocaleDateString()}</p>
                                        <div className="mt-2"><StatusBadge status={plan.status} /></div>
                                    </div>
                                    {plan.status === 'approved' && (
                                        <button 
                                            onClick={() => setSelectedPlan(plan)}
                                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg w-full sm:w-auto"
                                        >
                                            View & Download Plan
                                        </button>
                                    )}
                                     {plan.status === 'rejected' && (
                                         <p className="text-sm text-red-400 sm:text-right">This draft needs trainer review before it can be released.</p>
                                     )}
                                </div>
                                {plan.status === 'approved' && (
                                    <div className="mt-4 pt-4 border-t border-gray-700">
                                         <p className="text-sm text-gray-300 mb-2">Your guide is finalized and ready to download. Enjoy a structured, safe plan that matches your assessment.</p>
                                        {plan.trainerNotes && (
                                            <div className="p-4 bg-lime-900/50 border-l-4 border-lime-500 rounded-r-lg">
                                                <p className="font-bold text-lime-400">A Note from Your Trainer, {plan.assignedTrainerName}:</p>
                                                <p className="text-gray-300 mt-1 italic">"{plan.trainerNotes}"</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        searched && !error && (
                            <div className="text-center py-16 text-gray-400">
                                <p>No plans found for this email address.</p>
                                <p className="text-sm">Please make sure you entered the correct email.</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
