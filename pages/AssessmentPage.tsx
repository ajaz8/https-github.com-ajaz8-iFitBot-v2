import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuizContainer from '../components/quiz/QuizContainer';
import { AppContext } from '../App';
import GoogleLoginButton from '../components/GoogleLoginButton'; // ✅ Added
import type { QuizData } from '../types';

export default function AssessmentPage() {
  const { setQuizData } = useContext(AppContext);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // ✅ track login state

  const handleQuizComplete = (data: QuizData) => {
    const dataWithId = { ...data, id: new Date().toISOString() };
    setQuizData(dataWithId);
    navigate('/report');
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-center mb-6">
        AI Fitness Assessment
      </h1>

      {/* ✅ Show Google login first */}
      {!isLoggedIn ? (
        <div className="flex flex-col items-center">
          <p className="mb-4 text-gray-700">
            Please sign in with Google to start your assessment.
          </p>
          <GoogleLoginButton />
        </div>
      ) : (
        // ✅ After login → show quiz
        <QuizContainer onComplete={handleQuizComplete} />
      )}
    </div>
  );
}
