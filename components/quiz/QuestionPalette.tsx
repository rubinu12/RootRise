"use client";

import React, { FC, useEffect, useRef } from 'react';
import { useQuiz } from '@/app/context/QuizContext';

interface QuestionPaletteProps {
    onClose: () => void;
}

const QuestionPalette: FC<QuestionPaletteProps> = ({ onClose }) => {
    const { questions, userAnswers, markedForReview, currentQuestionInView, setCurrentQuestionInView } = useQuiz();
    const paletteContainerRef = useRef<HTMLDivElement>(null);

    // Synchronized Scrolling Logic
    useEffect(() => {
        if (paletteContainerRef.current) {
            const activeButton = paletteContainerRef.current.querySelector(`#palette-btn-${currentQuestionInView}`);
            if (activeButton) {
                activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [currentQuestionInView]);

    const scrollToQuestion = (questionNumber: number) => {
        setCurrentQuestionInView(questionNumber);
        const questionElement = document.getElementById(`question-${questions[questionNumber - 1].id}`);
        if (questionElement) {
            questionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        onClose();
    };

    const getStatusClass = (qNumber: number): string => {
        const questionId = questions[qNumber - 1]?.id;
        if (currentQuestionInView === qNumber) return 'bg-blue-100 border-blue-500 text-blue-600';
        if (markedForReview.has(questionId)) return 'bg-purple-100 border-purple-300 text-purple-700';
        if (userAnswers.some(a => a.questionId === questionId)) return 'bg-green-100 border-green-300 text-green-700';
        return 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50';
    };

    const gridCols = questions.length > 50 ? 'grid-cols-6' : 'grid-cols-5';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div 
                className="modal-panel p-4 bg-gray-50 w-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-md font-semibold text-center text-gray-800 mb-4">All Questions</h3>
                {/* --- FIX: Using your existing 'custom-scrollbar' class --- */}
                <div ref={paletteContainerRef} className={`grid ${gridCols} gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar`}>
                    {questions.map(q => (
                        <button
                            key={q.id}
                            id={`palette-btn-${q.questionNumber}`}
                            onClick={() => scrollToQuestion(q.questionNumber)}
                            className={`btn w-12 h-12 flex-shrink-0 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200 border ${getStatusClass(q.questionNumber)}`}
                        >
                            {q.questionNumber}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuestionPalette;
