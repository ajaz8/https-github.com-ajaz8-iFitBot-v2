import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, ArrowLeft, User, ListChecks, Check, X, FileText, Calendar, Shield, MessageSquare, CheckSquare, Clock, CheckCircle, XCircle, ChevronDown, Activity, Zap, Layers, Wind } from 'lucide-react';
import type { PendingWorkoutPlan } from '../types';
import { getPendingPlans, updatePlan } from '../services/planService';
import FinalReportGenerator from '../components/FinalReportGenerator';
import TrainerChatbot from '../components/TrainerChatbot';

const ReviewModal = ({ plan, onClose, onUpdateStatus }: { plan: PendingWorkoutPlan, onClose: () => void, onUpdateStatus: (id: string, status: 'approved' | 'rejected', notes?: string) => void }) => {
    const [trainerNotes, setTrainerNotes] = useState('');
    if (!plan) return null;
    const { workout_guide_draft: draft, trainer_checklist } = plan.planData;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                <header className="p-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-white">Review: {plan.userName}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
                </header>
                <div className="overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                         {/* Client Overview */}
                        <div>
                            <h3 className="text-lg font-semibold text-lime-400 mb-2">Client Overview</h3>
                            <div className="text-sm bg-gray-900/50 p-4 rounded-lg space-y-2">
                                <p><strong>Email:</strong> {plan.userEmail}</p>
                                {plan.quizData ? (
                                    <>
                                        <p><strong>Goal:</strong> <span className="capitalize">{plan.quizData.goal.replace(/_/g, ' ')}</span></p>
                                        <p><strong>Fitness Level:</strong> <span className="capitalize">{plan.quizData.fitnessLevel}</span></p>
                                        <p><strong>Highlights:</strong> {plan.quizData.age}yo {plan.quizData.gender}, {plan.quizData.gymDaysPerWeek} days/week, prefers {plan.quizData.workoutLocation}.</p>
                                    </>
                                ) : (
                                    <p className="text-yellow-300">No client profile data submitted. The plan was generated from the report image only. Please review and customize carefully.</p>
                                )}
                            </div>
                        </div>

                        {/* Program Structure */}
                        {draft && (
                            <div>
                                <h3 className="text-lg font-semibold text-lime-400 mb-2">Program Structure</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm bg-gray-900/50 p-4 rounded-lg">
                                    <p><strong>Weeks:</strong> {draft.program_weeks}</p>
                                    <p><strong>Phases:</strong> {draft.phases.length}</p>
                                    <p><strong>Days/Week:</strong> {draft.weekly_days}</p>
                                    <p><strong>Equipment:</strong> <span className="capitalize">{draft.equipment_tier}</span></p>
                                </div>
                            </div>
                        )}

                        {/* Session Template */}
                        {draft && (
                            <div>
                                <h3 className="text-lg font-semibold text-lime-400 mb-2">Session Template</h3>
                                <ul className="text-sm bg-gray-900/50 p-4 rounded-lg space-y-2">
                                    <li className="flex items-center gap-2"><Wind size={14}/> <strong>Warm-up:</strong> {draft.days[0]?.warmup.duration_min} min</li>
                                    <li className="flex items-center gap-2"><Zap size={14}/> <strong>Strength:</strong> {draft.days[0]?.strength.length} movements</li>
                                    <li className="flex items-center gap-2"><Activity size={14}/> <strong>Conditioning:</strong> {draft.days[0]?.conditioning.duration_min} min ({draft.days[0]?.conditioning.style})</li>
                                    <li className="flex items-center gap-2"><Layers size={14}/> <strong>Cool-down:</strong> {draft.days[0]?.cooldown.duration_min} min</li>
                                </ul>
                            </div>
                        )}
                        
                        {/* Progression & Safety */}
                         {draft && (
                             <>
                                <div>
                                    <h3 className="text-lg font-semibold text-lime-400 mb-2">Progression Rules</h3>
                                    <p className="text-sm bg-gray-900/50 p-4 rounded-lg">{draft.progression_notes}</p>
                                 </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-lime-400 mb-2">Safety Notes</h3>
                                    <p className="text-sm bg-gray-900/50 p-4 rounded-lg">{draft.safety_notes}</p>
                                </div>
                             </>
                         )}

                    </div>
                     <div className="space-y-6">
                        {/* AI Checklist */}
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
                        
                        {/* Chat with AI */}
                        <div>
                            <h3 className="text-lg font-semibold text-lime-400 mb-2 flex items-center gap-2"><MessageSquare size={18}/> Chat with AI</h3>
                            <TrainerChatbot plan={plan} />
                        </div>

                         {/* Actions */}
                        <div>
                            <h3 className="text-lg font-semibold text-lime-400 mb-2">Approve & Sign</h3>
                             <div className="bg-gray-900/50 p-4 rounded-lg">
                                <h4 className="font-semibold text-white mb-2">Add Personal Note (Optional)</h4>
                                <textarea
                                    value={trainerNotes}
                                    onChange={(e) => setTrainerNotes(e.target.value)}
                                    rows={3}
                                    placeholder="e.g., 'Great plan to start with! Focus on form for the first two weeks. Let's crush this!'"
                                    className="w-full bg-gray-900 text-white rounded-lg p-3 border-2 border-gray-600 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition"
                                />
                                 <div className="mt-4 flex flex-col sm:flex-row justify-end gap-3">
                                    <button onClick={() => onUpdateStatus(plan.id, 'rejected')} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors">
                                        <X size={18}/> Reject
                                    </button>
                                    <button onClick={() => onUpdateStatus(plan.id, 'approved', trainerNotes)} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors">
                                        <Check size={18}/> Approve & Sign
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
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
        setAllPlans(getPendingPlans());
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
        
        const updates: Partial<PendingWorkoutPlan> = {
            status,
            trainerNotes: notes || undefined
        };

        if (status === 'approved') {
            updates.approvedAt = new Date().toISOString();
        }

        updatePlan(id, updates);
        
        const updatedPlans = getPendingPlans();
        if (status === 'approved') {
            const finalizedPlan = updatedPlans.find(p => p.id === id);
            if(finalizedPlan) setPlanToFinalize(finalizedPlan);
        }
        
        setPlanToReview(null);
        setAllPlans(updatedPlans);
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
                    <h1 className="text-4xl md:text-5xl font-bold">Review & Sign Workout Guides</h1>
                    <p className="text-lg text-gray-400 mt-2">
                        Welcome, {trainerUser}. Edit details, chat with AI, approve, and release the final PDF/JPG.
                    </p>
                </header>

                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 sm:p-6">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3"><ListChecks/> Pending Reviews ({assignedPlans.length})</h2>
                    {assignedPlans.length > 0 ? (
                        <div className="space-y-4">
                           {assignedPlans.map(plan => (
                                <div key={plan.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 sm:p-5 transition-all duration-300 hover:border-lime-500 hover:shadow-lg hover:shadow-lime-500/10">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                        <div className="flex-grow">
                                            <h3 className="font-bold text-lg text-white">
                                                {plan.userName}
                                            </h3>
                                            <p className="text-sm text-lime-400 capitalize">{plan.quizData?.goal.replace(/_/g, ' ') || 'Goal not specified'}</p>
                                             <div className="text-xs text-gray-500 mt-1">
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
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-gray-400">
                            <p>You’re all clear. New guides will show here automatically.</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 bg-gray-800/50 border border-gray-700 rounded-lg p-4 sm:p-6">
                    <button onClick={() => setShowReviewed(!showReviewed)} className="w-full flex justify-between items-center text-left text-white hover:text-lime-400 transition-colors">
                        <h2 className="text-2xl font-semibold">Approved ({reviewedPlans.filter(p => p.status === 'approved').length})</h2>
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
