"use client";

import React, { FC } from "react";
import { useQuiz } from "@/app/context/QuizContext";
import { useAuth } from "@/app/context/AuthContext";

import Header from "@/components/quiz/Header";
import QuestionColumn from "@/components/quiz/QuestionColumn";
import AnswerColumn from "@/components/quiz/AnswerColumn";
import ReportCard from "@/components/quiz/ReportCard";
import LoadingScreen from "@/components/quiz/LoadingScreen";
import TestStatusBar from "@/components/quiz/TestStatusBar";
import Toast from "@/components/common/Toast";
import { useRouter } from "next/navigation";

interface ErrorDisplayProps {
    message: string;
    type: 'auth' | 'generic';
}

const ErrorDisplay: FC<ErrorDisplayProps> = ({ message, type }) => {
    const router = useRouter();
    const { logout } = useAuth();

    const isAuthError = type === 'auth';
    const buttonText = isAuthError ? 'Go to Login' : 'Back to Dashboard';
    
    const handleAction = () => {
        if (isAuthError) {
            logout();
        } else {
            router.push('/dashboard');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-8">
            <div className="text-5xl mb-4">
                <i className={`ri-error-warning-line ${isAuthError ? 'text-red-500' : 'text-yellow-500'}`}></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {isAuthError ? 'Session Expired' : 'An Error Occurred'}
            </h2>
            <p className="text-gray-600 mb-8 max-w-md">{message}</p>
            <button
                onClick={handleAction}
                className="btn bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
                {buttonText}
            </button>
        </div>
    );
};

const QuizUI = () => {
  const { 
    isLoading, 
    showReport, 
    questions, 
    quizError, 
    isTestMode, 
    toast, 
    hideToast 
  } = useQuiz();

  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (quizError) {
    return <ErrorDisplay message={quizError.message} type={quizError.type} />;
  }

  if (!questions || questions.length === 0) {
     return <ErrorDisplay message="No questions were found for your selection." type="generic" />;
  }

  return (
    <div className={`h-screen flex flex-col overflow-hidden bg-gray-50 ${isTestMode ? 'pt-16' : ''}`}>
      {isTestMode && <TestStatusBar />}
      <Header />
      
      <main className="flex-1 flex flex-col lg:flex-row p-4 lg:p-6 gap-6 overflow-hidden">
        <div className="flex-1 min-w-0">
          <QuestionColumn />
        </div>
        <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
          <AnswerColumn />
        </div>
      </main>
      
      {showReport && <ReportCard />}
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
};

export default function QuizPage() {
  return <QuizUI />;
}