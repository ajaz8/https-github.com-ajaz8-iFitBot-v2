

import React, { useState } from 'react';
import type { UserProgress, PersonalRecordEntry } from '../../types';
import { addPersonalRecordEntry, deletePersonalRecordEntry } from '../../services/progressService';
import { Award, Plus, Trash2 } from 'lucide-react';

interface PersonalRecordTrackerProps {
    email: string;
    progress: UserProgress;
    onUpdate: (newProgress: UserProgress) => void;
}

export default function PersonalRecordTracker({ email, progress, onUpdate }: PersonalRecordTrackerProps) {
    const [exercise, setExercise] = useState('');
    const [value, setValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!exercise.trim() || !value.trim()) return;

        const newEntry: Omit<PersonalRecordEntry, 'id'> = {
            date: new Date().toISOString(),
            exercise,
            value,
        };
        const updatedProgress = addPersonalRecordEntry(email, newEntry);
        onUpdate(updatedProgress);
        setExercise('');
        setValue('');
    };
    
    const handleDelete = (recordId: string) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            const updatedProgress = deletePersonalRecordEntry(email, recordId);
            onUpdate(updatedProgress);
        }
    };

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3"><Award /> Personal Records (PRs)</h3>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-6 items-end">
                <div className="sm:col-span-5">
                    <label htmlFor="pr-exercise" className="block text-sm font-medium text-gray-300 mb-1">Exercise</label>
                    <input
                        id="pr-exercise"
                        type="text"
                        value={exercise}
                        onChange={(e) => setExercise(e.target.value)}
                        placeholder="e.g., Bench Press"
                        className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg text-white p-2 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                        required
                    />
                </div>
                 <div className="sm:col-span-5">
                    <label htmlFor="pr-value" className="block text-sm font-medium text-gray-300 mb-1">Weight/Reps</label>
                    <input
                        id="pr-value"
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="e.g., 100kg x 5"
                        className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg text-white p-2 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                        required
                    />
                </div>
                <div className="sm:col-span-2">
                    <button type="submit" className="w-full bg-lime-500 text-white p-2 rounded-lg hover:bg-lime-600 transition-colors flex items-center justify-center gap-2">
                        <Plus size={20} /> Add
                    </button>
                </div>
            </form>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {progress.personalRecords.length > 0 ? (
                    progress.personalRecords.map(pr => (
                        <div key={pr.id} className="bg-gray-700/50 p-3 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-white">{pr.exercise}: <span className="font-normal text-lime-400">{pr.value}</span></p>
                                <p className="text-xs text-gray-400">{new Date(pr.date).toLocaleDateString()}</p>
                            </div>
                            <button onClick={() => handleDelete(pr.id)} className="text-gray-500 hover:text-red-500 p-1 rounded-full">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-8">No personal records logged yet. Add your first one!</p>
                )}
            </div>
        </div>
    );
}