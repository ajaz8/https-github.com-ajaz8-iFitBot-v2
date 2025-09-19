
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AssessmentPage from './pages/AssessmentPage';
import ReportPage from './pages/ReportPage';
import WorkoutGuidePage from './pages/WorkoutGuidePage';
import ExerciseLibraryPage from './pages/ExerciseLibraryPage';
import AboutPage from './pages/AboutPage';
import TrainerLoginPage from './pages/TrainerLoginPage';
import TrainerDashboardPage from './pages/TrainerDashboardPage';
import MyPlanPage from './pages/MyPlanPage';
import ProgressPage from './pages/ProgressPage';
import ContactSupportIcon from './components/ContactSupportIcon';
import type { QuizData } from './types';

export const AppContext = React.createContext<{
quizData: QuizData | null;
setQuizData: React.Dispatch<React.SetStateAction<QuizData | null>>;
}>({
quizData: null,
setQuizData: () => {},
});

const QUIZ_DATA_STORAGE_KEY = 'ifit_latest_quiz_data';

export default function App() {
    // Initialize state from localStorage
    const [quizData, setQuizData] = useState<QuizData | null>(() => {
        try {
            const savedData = localStorage.getItem(QUIZ_DATA_STORAGE_KEY);
            return savedData ? JSON.parse(savedData) : null;
        } catch (error) {
            console.error("Failed to load quiz data from localStorage", error);
            return null;
        }
    });

    // Effect to save to localStorage whenever quizData changes
    useEffect(() => {
        try {
            if (quizData) {
                localStorage.setItem(QUIZ_DATA_STORAGE_KEY, JSON.stringify(quizData));
            } else {
                localStorage.removeItem(QUIZ_DATA_STORAGE_KEY);
            }
        } catch (error) {
            console.error("Failed to save quiz data to localStorage", error);
        }
    }, [quizData]);


return (
    <AppContext.Provider value={{ quizData, setQuizData }}>
        <HashRouter>
            <div className="flex flex-col min-h-screen">
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/assessment" element={<AssessmentPage />} />
                        <Route path="/report" element={quizData ? <ReportPage /> : <Navigate to="/assessment" />} />
                        <Route path="/workout-guide" element={<WorkoutGuidePage />} />
                        <Route path="/my-plan" element={<MyPlanPage />} />
                        <Route path="/progress" element={<ProgressPage />} />
                        <Route path="/exercise-library" element={<ExerciseLibraryPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/trainer-login" element={<TrainerLoginPage />} />
                        <Route path="/trainer-dashboard" element={<TrainerDashboardPage />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </main>
                 <footer className="bg-black text-center p-4 text-xs text-gray-600">
                    <p>Your program is informational and non-medical. Stop if pain or dizziness. For medical concerns, consult a professional.</p>
                </footer>
            </div>
            <ContactSupportIcon />
        </HashRouter>
    </AppContext.Provider>
);
}