
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, ArrowLeft } from 'lucide-react';

const TRAINERS = {
    "Athul": "7778",
    "Athithiya": "7778",
    "Saieel": "7778"
};

export default function TrainerLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        const trainerPassword = TRAINERS[username as keyof typeof TRAINERS];

        if (trainerPassword && password === trainerPassword) {
            sessionStorage.setItem('ifit_trainer_user', username);
            navigate('/trainer-dashboard');
        } else {
            setError('Check your ID and password (7778).');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4">
             <Link to="/" className="absolute top-8 left-8 text-gray-300 hover:text-lime-500 flex items-center z-20">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Link>
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-lime-400">Trainer Portal</h1>
                    <p className="text-gray-400">Please log in to continue.</p>
                </div>
                <form onSubmit={handleLogin} className="bg-gray-800/50 border border-gray-700 shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
                    <div className="mb-4">
                        <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="username">
                            Trainer ID
                        </label>
                        <input
                            className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-lime-500"
                            id="username"
                            type="text"
                            placeholder="e.g., Athul"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 bg-gray-700 text-white mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-lime-500"
                            id="password"
                            type="password"
                            placeholder="******************"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                    <div className="flex items-center justify-between">
                        <button
                            className="bg-lime-500 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full flex items-center justify-center gap-2 transition-colors"
                            type="submit"
                        >
                            <LogIn size={18}/>
                            Sign In
                        </button>
                    </div>
                </form>
                 <p className="text-center text-gray-500 text-xs mt-4">
                    IDs: Athul · Athithiya · Saieel — Password: 7778
                </p>
            </div>
        </div>
    );
}