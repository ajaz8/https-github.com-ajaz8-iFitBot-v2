

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, BookOpen, Dumbbell, Scale, Flame, Weight, Building, FileCheck2, TrendingUp } from "lucide-react";

const AnimatedTitle = () => {
    const title = "iFit";
    const tagline = "Your AI Personal Trainer";

    return (
        <div className="text-center">
            <h1 className="text-7xl md:text-9xl font-bold text-white tracking-tighter">
                {title.split("").map((char, index) => (
                    <span
                        key={index}
                        className="inline-block animate-fade-in-up"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        {char}
                    </span>
                ))}
            </h1>
            <p
                className="text-xl md:text-2xl text-lime-400 mt-4 animate-fade-in"
                style={{ animationDelay: `${title.length * 0.1 + 0.3}s` }}
            >
                {tagline}
            </p>
        </div>
    );
};

const SplashScreen = ({ onFinished }: { onFinished: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(() => onFinished(), 3000); // 3 seconds for splash
        return () => clearTimeout(timer);
    }, [onFinished]);

    return (
        <div className="fixed inset-0 bg-black flex flex-col justify-center items-center z-50">
            <style>
                {`@keyframes fade-in-up { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.5s forwards; opacity: 0; } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in { animation: fade-in 1s forwards; opacity: 0; }`}
            </style>
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-20"
            >
                <source src="https://videos.pexels.com/video-files/3840428/3840428-hd.mp4" type="video/mp4" />
            </video>
            <div className="relative z-10">
                <AnimatedTitle />
            </div>
        </div>
    );
};

export default function Home() {
    const [loading, setLoading] = useState(true);

    if (loading) {
        return <SplashScreen onFinished={() => setLoading(false)} />;
    }

    return (
        <div className="min-h-screen w-full bg-black flex flex-col justify-center items-center p-4 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/80 to-black"></div>
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-10"
            >
                <source src="https://videos.pexels.com/video-files/3840428/3840428-hd.mp4" type="video/mp4" />
            </video>
            <div className="relative z-10 flex flex-col items-center text-center">
                <div className="mb-16">
                    <AnimatedTitle />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                    <Link to="/assessment" className="group relative md:col-span-2">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-lime-500 to-green-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                        <div className="w-full h-full p-6 bg-gray-900 text-white rounded-lg relative flex flex-col justify-between transition-transform group-hover:scale-105">
                            <div className="flex items-center gap-4">
                                <FileText className="w-10 h-10 text-lime-500 flex-shrink-0" />
                                <div>
                                    <h3 className="text-xl font-semibold text-left">Body Assessment</h3>
                                    <p className="text-sm text-gray-400 text-left">Start your transformation</p>
                                </div>
                            </div>
                            <div className="border-t border-gray-700 my-4"></div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="flex flex-col items-center p-2 rounded-md">
                                    <Scale className="w-6 h-6 text-gray-400 group-hover:text-lime-400 transition-colors" />
                                    <span className="text-xs mt-1 text-gray-400">Lose Weight</span>
                                </div>
                                <div className="flex flex-col items-center p-2 rounded-md">
                                    <Weight className="w-6 h-6 text-gray-400 group-hover:text-lime-400 transition-colors" />
                                    <span className="text-xs mt-1 text-gray-400">Gain Muscle</span>
                                </div>
                                <div className="flex flex-col items-center p-2 rounded-md">
                                    <Flame className="w-6 h-6 text-gray-400 group-hover:text-lime-400 transition-colors" />
                                    <span className="text-xs mt-1 text-gray-400">Get Shredded</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                    <Link to="/workout-guide" className="group relative">
                        <div className="w-full h-full text-lg p-6 bg-black/50 border border-gray-700 text-white rounded-lg flex flex-col items-center justify-center gap-2 transition-transform group-hover:scale-105 group-hover:border-lime-500">
                            <Dumbbell className="w-8 h-8 text-gray-400 group-hover:text-lime-500" />
                            <span className="font-semibold">Workout Guide</span>
                            <span className="text-sm text-gray-400">Generate your plan</span>
                        </div>
                    </Link>
                    <Link to="/my-plan" className="group relative">
                        <div className="w-full h-full text-lg p-6 bg-black/50 border border-gray-700 text-white rounded-lg flex flex-col items-center justify-center gap-2 transition-transform group-hover:scale-105 group-hover:border-lime-500">
                            <FileCheck2 className="w-8 h-8 text-gray-400 group-hover:text-lime-500" />
                            <span className="font-semibold">My Approved Plan</span>
                            <span className="text-sm text-gray-400">Check status & download</span>
                        </div>
                    </Link>
                    <Link to="/progress" className="group relative">
                        <div className="w-full h-full text-lg p-6 bg-black/50 border border-gray-700 text-white rounded-lg flex flex-col items-center justify-center gap-2 transition-transform group-hover:scale-105 group-hover:border-lime-500">
                            <TrendingUp className="w-8 h-8 text-gray-400 group-hover:text-lime-500" />
                            <span className="font-semibold">Progress Tracker</span>
                            <span className="text-sm text-gray-400">Log weights & PRs</span>
                        </div>
                    </Link>
                    <Link to="/exercise-library" className="group relative">
                        <div className="w-full h-full text-lg p-6 bg-black/50 border border-gray-700 text-white rounded-lg flex flex-col items-center justify-center gap-2 transition-transform group-hover:scale-105 group-hover:border-lime-500">
                            <BookOpen className="w-8 h-8 text-gray-400 group-hover:text-lime-500" />
                            <span className="font-semibold">Exercise Library</span>
                            <span className="text-sm text-gray-400">Browse techniques</span>
                        </div>
                    </Link>
                    <Link to="/about" className="group relative md:col-span-2">
                        <div className="w-full h-full text-lg p-6 bg-black/50 border border-gray-700 text-white rounded-lg flex flex-col items-center justify-center gap-2 transition-transform group-hover:scale-105 group-hover:border-lime-500">
                            <Building className="w-8 h-8 text-gray-400 group-hover:text-lime-500" />
                            <span className="font-semibold">Our Gym</span>
                            <span className="text-sm text-gray-400">Location & Info</span>
                        </div>
                    </Link>
                </div>
                <footer className="relative z-10 mt-16 text-center text-gray-500 text-sm">
                    <p className="mb-2">&copy; {new Date().getFullYear()} iFit. All rights reserved.</p>
                    <Link to="/trainer-login" className="hover:text-lime-400 transition-colors">
                        Trainer Portal
                    </Link>
                </footer>
            </div>
        </div>
    );
}