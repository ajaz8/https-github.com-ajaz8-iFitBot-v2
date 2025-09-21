
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import QuizContainer from '../components/quiz/QuizContainer';
import { AppContext, AuthContext } from '../App';
import type { QuizData } from '../types';

export default function AssessmentPage() {
    const { setQuizData } = useContext(AppContext);
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleQuizComplete = (data: QuizData) => {
        // The AppContext's setQuizData now handles persistence to Firestore
        const dataWithId = { ...data, id: new Date().toISOString() };
        
        // If the user is logged in, their name and email are pre-filled from their profile
        const finalData = {
            ...dataWithId,
            name: currentUser?.displayName || data.name,
            email: currentUser?.email || data.email,
        };
        
        setQuizData(finalData);
        navigate('/report');
    };

    return <QuizContainer onComplete={handleQuizComplete} />;
}