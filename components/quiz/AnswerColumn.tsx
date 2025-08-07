"use client";

import React, { useEffect, useRef } from "react";
import { useQuiz } from "@/app/context/QuizContext";
import { Question } from "@/types";

const AnswerColumnHeader = () => {
    const { getAttemptedCount, getNotAttemptedCount } = useQuiz();

    return (
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-xl font-bold text-blue-700">{getAttemptedCount()}</div>
                    <div className="text-xs font-medium text-blue-800">Attempted</div>
                </div>
                <div className="text-center p-3 bg-gray-100 rounded-lg border border-gray-200">
                    <div className="text-xl font-bold text-gray-700">{getNotAttemptedCount()}</div>
                    <div className="text-xs font-medium text-gray-800">Not Attempted</div>
                </div>
            </div>
        </div>
    );
}

const AnswerColumn = () => {
  const {
    questions, userAnswers, handleAnswerSelect, viewAnswer, isTestMode, 
    showDetailedSolution, currentQuestionNumberInView,
  } = useQuiz();

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current && currentQuestionNumberInView > 0) {
      const answerElement = scrollContainerRef.current.querySelector(
        `#answer-card-${currentQuestionNumberInView}`
      );
      if (answerElement) {
        answerElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentQuestionNumberInView]);

  const getUserAnswer = (questionId: string) => {
    return userAnswers.find((ua) => ua.questionId === questionId)?.answer;
  };

  const getOptionButtonStyle = (question: Question, optionLabel: string) => {
    const userAnswer = getUserAnswer(question.id);
    const baseStyle = "btn h-10 rounded-md font-medium transition-all duration-200 border";
    if (showDetailedSolution) {
        if (optionLabel === question.correctAnswer) return `${baseStyle} bg-theme-correct-bg border-theme-correct-border text-theme-correct-text`;
        if (optionLabel === userAnswer) return `${baseStyle} bg-theme-incorrect-bg border-theme-incorrect-border text-theme-incorrect-text`;
    }
    if (userAnswer === optionLabel) return `${baseStyle} bg-theme-accent-bg border-theme-accent-border text-theme-accent-text`;
    return `${baseStyle} bg-white border-gray-300 hover:border-blue-400`;
  };

  const getOptionCursor = (questionId: string) => {
    const userAnswer = getUserAnswer(questionId);
    if (isTestMode && userAnswer) {
      return "cursor-not-allowed";
    }
    return "cursor-pointer";
  };
  
  const getQuestionCardStyle = (displayNumber: number) => {
    return currentQuestionNumberInView === displayNumber ? "liquid-highlight" : "";
  };

  const scrollToQuestion = (displayNumber: number) => {
    const questionElement = document.getElementById(`question-card-${displayNumber}`);
    if (questionElement) {
        questionElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden">
       <style jsx>{`
        .liquid-highlight { position: relative; z-index: 1; background-color: #eff6ff; border-color: #bfdbfe; }
        .liquid-highlight::before { content: ""; position: absolute; top: 50%; left: 50%; width: 120%; height: 120%; background-color: #dbeafe; border-radius: 0.5rem; transform: translate(-50%, -50%); filter: blur(30px); opacity: 0.8; z-index: -1; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a0aec0; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      <AnswerColumnHeader />

      <div ref={scrollContainerRef} className="p-4 overflow-y-auto custom-scrollbar">
        <div className="space-y-3">
          {questions.map((question, index) => {
              const displayNumber = index + 1;
              const userAnswer = getUserAnswer(question.id);
              return (
              <div
                key={question.id}
                id={`answer-card-${displayNumber}`}
                className={`bg-gray-50 rounded-lg p-4 border border-gray-200 transition-all duration-300 relative overflow-hidden ${getQuestionCardStyle(displayNumber)}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <button onClick={() => scrollToQuestion(displayNumber)} className="font-bold text-gray-700 hover:text-blue-600">
                    Q{displayNumber} <i className="ri-arrow-right-line align-middle"></i>
                  </button>
                  {(!isTestMode || showDetailedSolution) && (
                    <button onClick={() => viewAnswer(question.id)} className="text-sm font-medium text-blue-600 hover:underline">
                      View
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {question.options.map((option) => (
                    <button
                      key={option.label}
                      onClick={() => handleAnswerSelect(question.id, option.label)}
                      disabled={isTestMode && !!userAnswer && userAnswer !== option.label}
                      className={`${getOptionButtonStyle(question, option.label)} ${getOptionCursor(question.id)} flex items-center justify-center gap-1`}>
                      <span>{option.label}</span>
                      {showDetailedSolution && userAnswer === option.label && (
                          <i className={question.correctAnswer === userAnswer ? "ri-check-line text-theme-correct-text" : "ri-close-line text-theme-incorrect-text"}></i>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )})}
        </div>
      </div>
    </div>
  );
};

export default AnswerColumn;