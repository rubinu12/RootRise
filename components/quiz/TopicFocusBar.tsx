"use client";

import React from 'react';
import { useQuiz } from '@/app/context/QuizContext';
import { Question } from '@/types';

interface TopicFocusBarProps {
    currentQuestion: Question | null;
}

const TopicFocusBar: React.FC<TopicFocusBarProps> = ({ currentQuestion }) => {
    const { loadAndStartQuiz } = useQuiz();

    if (!currentQuestion) {
        return null; // Don't render anything if there's no question in view
    }

    const { exam, subject, topic } = currentQuestion;

    const handlePracticeTopic = () => {
        if (subject && topic) {
            // This will initiate a new quiz with only questions from this specific topic
            loadAndStartQuiz({ subject, topic });
        }
    };

    return (
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-sm text-gray-600 overflow-hidden">
                <span className="font-semibold text-gray-800 flex-shrink-0">{exam}</span>
                <i className="ri-arrow-right-s-line"></i>
                <span className="font-medium">{subject}</span>
                {topic && (
                    <>
                        <i className="ri-arrow-right-s-line"></i>
                        <span className="text-gray-500 truncate">{topic}</span>
                    </>
                )}
            </div>
            {subject && topic && (
                <button
                    onClick={handlePracticeTopic}
                    className="btn flex-shrink-0 ml-4 px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full hover:bg-blue-200"
                >
                    Practice this Topic
                </button>
            )}
        </div>
    );
};

export default TopicFocusBar;