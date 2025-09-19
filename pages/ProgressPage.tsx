

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, AlertTriangle, TrendingUp, User } from 'lucide-react';
import type { UserProgress } from '../types';
import { getProgressForUser } from '../services/progressService';
import WeightTracker from '../components/progress/WeightTracker';
import PersonalRecordTracker from '../components/progress/PersonalRecordTracker';

export default function ProgressPage() {
    const [email, setEmail] = useState('');
    const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
    const [searchedEmail, setSearchedEmail] = useState('');
    const [error, setError] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email.trim()) {
            setError('Please enter a valid email address.');
            return;
        }

        try {
            const progress = getProgressForUser(email);
            setUserProgress(progress);
            setSearchedEmail(email);
        } catch (err) {
            console.error(err);
            setError('Could not retrieve progress data. Please try again later.');
            setUserProgress(null);
            setSearchedEmail('');
        }
    };
    
    const handleProgressUpdate = (newProgress: UserProgress) => {
        setUserProgress(newProgress);
    };

    const renderContent = () => {
        if (error) {
             return (
                 <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg max-w-lg mx-auto">
                    <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
                    <p>{error}</p>
                </div>
            );
        }

        if (userProgress) {
            return (
                <div className="space-y-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-semibold text-white flex items-center justify-center gap-2">
                            <User /> Tracking Progress for:
                        </h2>
                        <p className="text-lime-400">{searchedEmail}</p>
                    </div>
                    <WeightTracker email={searchedEmail} progress={userProgress} onUpdate={handleProgressUpdate} />
                    <PersonalRecordTracker email={searchedEmail} progress={userProgress} onUpdate={handleProgressUpdate} />
                </div>
            );
        }
        
        return null; // Don't show anything before the first search
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <Link to="/" className="text-gray-300 hover:text-lime-500 flex items-center mb-8">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Link>

                <header className="text-center mb-12">
                    <TrendingUp className="w-16 h-16 mx-auto text-lime-500 mb-4" />
                    <h1 className="text-5xl font-bold">Progress Tracker</h1>
                    <p className="text-lg text-gray-400 mt-2">Log your journey, celebrate your wins, and stay motivated.</p>
                </header>

                <div className="bg-gray-800/50 p-6 rounded-lg mb-8">
                    <form onSubmit={handleSearch} className="max-w-lg mx-auto flex items-center gap-2">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email to load/start tracking"
                            className="flex-1 bg-gray-700 border-2 border-gray-600 rounded-lg text-white placeholder-gray-500 p-3 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                            required
                        />
                        <button type="submit" className="bg-lime-500 text-white p-3 rounded-lg hover:bg-lime-600 transition-colors">
                            <Search size={24} />
                        </button>
                    </form>
                </div>
                
                {renderContent()}
            </div>
        </div>
    );
}