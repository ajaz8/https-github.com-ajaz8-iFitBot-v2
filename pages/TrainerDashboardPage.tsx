

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, ArrowLeft, User, ListChecks, Check, X, FileText, Calendar, Shield, MessageSquare, CheckSquare, Clock, CheckCircle, XCircle, ChevronDown } from 'lucide-react';
import type { PendingWorkoutPlan } from '../types';
import FinalReportGenerator from '../components/FinalReportGenerator';
import TrainerChatbot from '../components/TrainerChatbot';

const ReviewModal = ({ plan, onClose, onUpdateStatus }: { plan: PendingWorkoutPlan, onClose: () => void, onUpdateStatus: (id: string, status: 'approved' | 'rejected', notes?: string) => void }) => {
    const [trainerNotes, setTrainerNotes] = useState('');
    if (!plan) return null;
    const { workout_guide_draft: draft, presentation_markdown, trainer_checklist } = plan.planData;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <header className="p-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-white">Review: {plan.userName}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
                </header>
                <div className="overflow-y-auto p-6">
                    {draft ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div className="bg-gray-700 p-3 rounded-lg"><div className="text-lime-400 font-bold text-xl">{draft.program_weeks}</div><div className="text-xs text-gray-400">Weeks</div></div>
                                <div className="bg-gray-700 p-3 rounded-lg"><div className="text-lime-400 font-bold text-xl">{draft.weekly_days}</div><div className="text-xs text-gray-400">Days/Week</div></div>
                                <div className="bg-gray-700 p-3 rounded-lg"><div className="text-lime-400 font-bold text-xl capitalize">{draft.equipment_tier}</div><div className="text-xs text-gray-400">Equipment</div></div>
                                <div className="bg-gray-700 p-3 rounded-lg"><div className="text-lime-400 font-bold text-xl">{draft.phases.length}</div><div className="text-xs text-gray-400">Phases</div></div>
                            </div>
                            
                            {trainer_checklist && trainer_checklist.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-lime-400 mb-2 flex items-center gap-2">
                                        <ListChecks size={18} /> AI-Generated Review Checklist
                                    </h3>
                                    <ul className="space-y-2 text-gray-300 text-sm bg-gray-900/50 p-4 rounded-lg">
                                        {trainer_checklist.map((item, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <CheckSquare size={16} className="text-lime-500 mt-0.5 flex-shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            <div>
                                <h3 className="text-lg font-semibold text-lime-400 mb-2">Presentation Markdown</h3>
                                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm border-l-4 border-gray-600 pl-4 bg-gray-900/50 p-4 rounded-r-lg">{presentation_markdown}</div>
                            </div>
                             <div>
                                <h3 className="text-lg font-semibold text-lime-400 mb-2">Safety Notes</h3>
                                <div className="text-gray-300 text-sm flex items-center gap-2 bg-gray-700 p-3 rounded-lg"><Shield size={16}/> {draft.safety_notes}</div>
                            </div>
                            
                             <div>
                                <h3 className="text-lg font-semibold text-lime-400 mb-2">Add Personal Note (Optional)</h3>
                                <textarea
                                    value={trainerNotes}
                                    onChange={(e) => setTrainerNotes(e.target.value)}
                                    rows={3}
                                    placeholder="e.g., 'Great plan to start with! Focus on form for the first two weeks. Let's crush this!'"
                                    className="w-full bg-gray-900 text-white rounded-lg p-3 border-2 border-gray-600 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition"
                                />
                            </div>

                             <div className="border-t border-gray-700 pt-4">
                                <h3 className="text-lg font-semibold text-lime-400 mb-2 flex items-center gap-2"><MessageSquare size={18}/> AI Assistant Chat</h3>
                                <TrainerChatbot plan={plan} />
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-gray-400">Workout draft data is missing.</p>
                    )}
                </div>
                 <footer className="p-4 flex flex-col sm:flex-row justify-end items-center border-t border-gray-700 flex-shrink-0 gap-4">
                    <button onClick={() => onUpdateStatus(plan.id, 'rejected')} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors">
                        <X size={18}/> Reject
                    </button>
                    <button onClick={() => onUpdateStatus(plan.id, 'approved', trainerNotes)} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors">
                        <Check size={18}/> Approve Plan
                    </button>
                </footer>
            </div>
        </div>
    );
};

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


export default function TrainerDashboardPage() {
    const navigate = useNavigate();
    const [trainerUser, setTrainerUser] = useState<string | null>(null);
    const [allPlans, setAllPlans] = useState<PendingWorkoutPlan[]>([]);
    const [planToReview, setPlanToReview] = useState<PendingWorkoutPlan | null>(null);
    const [planToFinalize, setPlanToFinalize] = useState<PendingWorkoutPlan | null>(null);
    const [showReviewed, setShowReviewed] = useState(false);

    const loadPlans = useCallback(() => {
        const plansJSON = localStorage.getItem('pending_plans');
        setAllPlans(plansJSON ? JSON.parse(JSON.parse(JSON.stringify(plansJSON))) : []);
    }, []);

    useEffect(() => {
        const user = sessionStorage.getItem('ifit_trainer_user');
        if (!user) {
            navigate('/trainer-login');
        } else {
            setTrainerUser(user);
            loadPlans();
        }
    }, [navigate, loadPlans]);
    
    const assignedPlans = useMemo(() => {
        return allPlans.filter(plan => plan.assignedTrainerName === trainerUser && plan.status === 'pending')
                       .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
    }, [allPlans, trainerUser]);

    const reviewedPlans = useMemo(() => {
        return allPlans.filter(plan => plan.assignedTrainerName === trainerUser && (plan.status === 'approved' || plan.status === 'rejected'))
                       .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
    }, [allPlans, trainerUser]);

    const handleLogout = () => {
        sessionStorage.removeItem('ifit_trainer_user');
        navigate('/trainer-login');
    };
    
    const handleUpdateStatus = (id: string, status: 'approved' | 'rejected', notes?: string) => {
        const planToUpdate = allPlans.find(p => p.id === id);
        if (!planToUpdate) return;
        
        const updatedPlans = allPlans.map(p => 
            p.id === id 
            ? { ...p, status, trainerNotes: notes || undefined } 
            : p
        );
        localStorage.setItem('pending_plans', JSON.stringify(updatedPlans));
        
        if (status === 'approved') {
            // Find the updated plan object to pass to the finalizer
            const finalizedPlan = updatedPlans.find(p => p.id === id);
            if(finalizedPlan) setPlanToFinalize(finalizedPlan);
        }
        
        setPlanToReview(null); // Close review modal
        loadPlans(); // Reload to update UI
    };

    if (planToFinalize) {
        return <FinalReportGenerator plan={planToFinalize} onComplete={() => { setPlanToFinalize(null); loadPlans(); }} />;
    }
    
    if (!trainerUser) {
        return (
            <div className="min-h-screen bg-gray-900 flex justify-center items-center">
                <div className="w-8 h-8 border-4 border-lime-500 border-dashed rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
             <div className="max-w-5xl mx-auto">
                <div className="w-full flex justify-between items-center mb-8">
                    <Link to="/" className="text-gray-300 hover:text-lime-500 flex items-center z-20">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                    </Link>
                     <button onClick={handleLogout} className="bg-gray-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>

                <header className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold">Trainer Dashboard</h1>
                    <p className="text-xl md:text-2xl text-lime-400 mt-2 flex items-center gap-2">
                        <User /> Welcome, {trainerUser}
                    </p>
                </header>

                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 sm:p-6">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3"><ListChecks/> Pending Reviews ({assignedPlans.length})</h2>
                    {assignedPlans.length > 0 ? (
                        <div className="space-y-4">
                           {assignedPlans.map(plan => {
                                const draft = plan.planData.workout_guide_draft;
                                return (
                                <div key={plan.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 sm:p-5 transition-all duration-300 hover:border-lime-500 hover:shadow-lg hover:shadow-lime-500/10">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                        <div className="flex-grow">
                                            <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                                <User className="w-5 h-5 text-lime-400 flex-shrink-0" />
                                                <span>{plan.userName}</span>
                                            </h3>
                                             <div className="text-xs text-gray-500 mt-1 pl-7 sm:pl-0">
                                                Generated: {new Date(plan.generatedAt).toLocaleString()}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setPlanToReview(plan)}
                                            className="w-full sm:w-auto bg-lime-500 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors flex-shrink-0"
                                        >
                                            <FileText size={16}/> 
                                            <span>Review Plan</span>
                                        </button>
                                    </div>

                                    {draft && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center mt-4 border-t border-gray-700 pt-4">
                                            <div className="bg-gray-700 p-2 rounded-md">
                                                <p className="font-bold text-base text-white">{draft.program_weeks} Weeks</p>
                                            </div>
                                            <div className="bg-gray-700 p-2 rounded-md">
                                                <p className="font-bold text-base text-white">{draft.weekly_days} Days/Wk</p>
                                            </div>
                                            <div className="bg-gray-700 p-2 rounded-md">
                                                <p className="font-bold text-base text-white capitalize">{draft.equipment_tier}</p>
                                            </div>
                                             <div className="bg-gray-700 p-2 rounded-md">
                                                <p className="font-bold text-base text-white capitalize">{draft.phases.length} Phases</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )})}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-gray-400">
                            <p>No client workout plans are currently pending your review.</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 bg-gray-800/50 border border-gray-700 rounded-lg p-4 sm:p-6">
                    <button onClick={() => setShowReviewed(!showReviewed)} className="w-full flex justify-between items-center text-left text-white hover:text-lime-400 transition-colors">
                        <h2 className="text-2xl font-semibold">Reviewed Plans ({reviewedPlans.length})</h2>
                        <ChevronDown className={`w-6 h-6 transition-transform ${showReviewed ? 'rotate-180' : ''}`} />
                    </button>
                    {showReviewed && (
                        <div className="mt-4 pt-4 border-t border-gray-600 space-y-4">
                            {reviewedPlans.length > 0 ? (
                                reviewedPlans.map(plan => (
                                    <div key={plan.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                                            <div>
                                                <h3 className="font-bold text-white">{plan.userName}</h3>
                                                <p className="text-xs text-gray-500">Generated: {new Date(plan.generatedAt).toLocaleDateString()}</p>
                                            </div>
                                            <StatusBadge status={plan.status} />
                                        </div>
                                        {plan.trainerNotes && (
                                            <div className="mt-3 pt-3 border-t border-gray-700 text-sm italic text-gray-400">
                                                <p className="font-semibold text-gray-300 not-italic">Your Notes:</p>
                                                <p>"{plan.trainerNotes}"</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-8 text-gray-400">No plans have been reviewed yet.</p>
                            )}
                        </div>
                    )}
                </div>

            </div>
            {planToReview && (
                <ReviewModal 
                    plan={planToReview}
                    onClose={() => setPlanToReview(null)}
                    onUpdateStatus={handleUpdateStatus}
                />
            )}
        </div>
    );
}
