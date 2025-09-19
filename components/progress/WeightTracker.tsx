
import React, { useState } from 'react';
import type { UserProgress, WeightEntry } from '../../types';
import { addWeightEntry } from '../../services/progressService';
import { Target, Plus } from 'lucide-react';
import ProgressChart from './ProgressChart';

interface WeightTrackerProps {
    email: string;
    progress: UserProgress;
    onUpdate: (newProgress: UserProgress) => void;
}

export default function WeightTracker({ email, progress, onUpdate }: WeightTrackerProps) {
    const [newWeight, setNewWeight] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const weightValue = parseFloat(newWeight);
        if (!weightValue || weightValue <= 0) return;

        const newEntry: WeightEntry = {
            date: new Date().toISOString(),
            weight: weightValue,
        };
        const updatedProgress = addWeightEntry(email, newEntry);
        onUpdate(updatedProgress);
        setNewWeight('');
    };

    const latestWeight = progress.weightLog.length > 0 ? progress.weightLog[progress.weightLog.length - 1].weight : 'N/A';

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3"><Target /> Weight Log</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-4">
                    <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                        <p className="text-gray-400 text-sm">Latest Weight</p>
                        <p className="text-lime-400 text-3xl font-bold">{latestWeight} <span className="text-lg">kg</span></p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <label htmlFor="weight-input" className="text-sm font-medium text-gray-300">Log New Weight (kg)</label>
                        <div className="flex gap-2">
                            <input
                                id="weight-input"
                                type="number"
                                step="0.1"
                                value={newWeight}
                                onChange={(e) => setNewWeight(e.target.value)}
                                placeholder="e.g., 74.5"
                                className="flex-1 bg-gray-700 border-2 border-gray-600 rounded-lg text-white p-2 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                                required
                            />
                            <button type="submit" className="bg-lime-500 text-white p-2 rounded-lg hover:bg-lime-600 transition-colors">
                                <Plus size={24} />
                            </button>
                        </div>
                    </form>
                </div>
                <div className="md:col-span-2">
                    <ProgressChart data={progress.weightLog} />
                </div>
            </div>
        </div>
    );
}