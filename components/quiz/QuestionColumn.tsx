"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useQuiz } from "@/app/context/QuizContext";
import { Question } from "@/types";
import QuestionPalette from './QuestionPalette'; 

const QuestionCard = ({ question, displayNumber }: { question: Question, displayNumber: number }) => {
    const { 
        userAnswers, isTestMode, showDetailedSolution, currentQuestionNumberInView,
        markedForReview, toggleMarkForReview, bookmarkedQuestions, toggleBookmark
    } = useQuiz();
    
    const isLongOption = question.options.some((opt) => opt.text.length > 50);
    const userAnswer = userAnswers.find((ua) => ua.questionId === question.id)?.answer;

    const getOptionStyle = (optionLabel: string) => {
        const baseClasses = "p-4 rounded-lg border text-left font-medium transition-all duration-200";
        if (showDetailedSolution || (!isTestMode && userAnswer)) {
            if (optionLabel === question.correctAnswer) return `${baseClasses} bg-theme-correct-bg border-theme-correct-border text-theme-correct-text`;
            if (optionLabel === userAnswer) return `${baseClasses} bg-theme-incorrect-bg border-theme-incorrect-border text-theme-incorrect-text`;
        }
        if (userAnswer === optionLabel) return `${baseClasses} bg-theme-accent-bg border-theme-accent-border text-theme-accent-text`;
        return `${baseClasses} bg-white border-gray-300`;
    };

    return (
        <div id={`question-card-${displayNumber}`} className={`rounded-xl p-6 border relative transition-all duration-300 mb-6 ${currentQuestionNumberInView === displayNumber ? "bg-blue-50 border-blue-300" : "bg-white border-gray-200"}`}>
            <div className="flex items-start gap-4">
                {/* Column 1: Question Number Column (as per your wireframe) */}
                <div className="flex flex-col items-center flex-shrink-0">
                    <div className="bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        {displayNumber}
                    </div>
                    <div className="flex flex-col items-center mt-3 space-y-2">
                        <button onClick={() => toggleMarkForReview(question.id)} className="p-2 text-gray-400 hover:text-purple-600" title="Mark for Review"><i className={markedForReview.has(question.id) ? "ri-flag-fill text-purple-600" : "ri-flag-line"}></i></button>
                        <button onClick={() => toggleBookmark(question.id)} className="p-2 text-gray-400 hover:text-blue-600" title="Bookmark"><i className={bookmarkedQuestions.has(question.id) ? "ri-bookmark-fill text-blue-600" : "ri-bookmark-line"}></i></button>
                    </div>
                </div>
                
                {/* Column 2: Question Text Column (as per your wireframe) */}
                <div className="flex-1 min-w-0">
                    <p className="text-lg text-gray-900 font-semibold leading-relaxed whitespace-pre-line">{question.text}</p>
                    <div className={`pt-4 grid ${isLongOption ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"} gap-4`}>
                        {question.options.map((option) => (
                            <div key={option.label} className={getOptionStyle(option.label)}>
                                <span className="font-bold mr-2">{option.label}.</span><span>{option.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


const QuestionColumn = () => {
  const { 
    questions, currentViewAnswer, closeAnswerView, setCurrentQuestionNumberInView, 
    setIsPageScrolled, setCurrentGroupInView, quizGroupBy, isGroupingEnabled, 
    isTopBarVisible, setIsTopBarVisible,
  } = useQuiz();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const groupObserverRef = useRef<IntersectionObserver | null>(null);

  const questionsByGroup = useMemo(() => {
    if (!quizGroupBy || !isGroupingEnabled) return null;
    return questions.reduce((acc, q) => {
        const groupKey = String(q[quizGroupBy] || 'Uncategorized');
        if (!acc[groupKey]) acc[groupKey] = [];
        acc[groupKey].push(q);
        return acc;
    }, {} as Record<string, Question[]>);
  }, [questions, quizGroupBy, isGroupingEnabled]);

  const sortedGroups = useMemo(() => {
    if (!questionsByGroup) return [];
    const keys = Object.keys(questionsByGroup);
    if (keys.length === 0) return [];
    const isNumeric = !isNaN(Number(keys[0]));
    return keys.sort((a, b) => isNumeric ? Number(b) - Number(a) : a.localeCompare(b));
  }, [questionsByGroup]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
        const isScrolled = container.scrollTop > 20;
        setIsPageScrolled(isScrolled);
        if (isScrolled && isTopBarVisible) setIsTopBarVisible(false);
        else if (!isScrolled && !isTopBarVisible) setIsTopBarVisible(true);
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [setIsPageScrolled, isTopBarVisible, setIsTopBarVisible]);

  useEffect(() => {
    if (groupObserverRef.current) groupObserverRef.current.disconnect();
    const container = scrollContainerRef.current;
    if (!container || !quizGroupBy || !isGroupingEnabled) {
        setCurrentGroupInView(null);
        return;
    };
    groupObserverRef.current = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                const groupName = entry.target.getAttribute('data-group');
                if (groupName) {
                    setCurrentGroupInView(groupName);
                    break; 
                }
            }
        }
    }, { root: container, rootMargin: "-40% 0px -60% 0px", threshold: 0 });
    const groupElements = container.querySelectorAll('[data-group]');
    groupElements.forEach(el => groupObserverRef.current?.observe(el));
    return () => groupObserverRef.current?.disconnect();
  }, [sortedGroups, setCurrentGroupInView, quizGroupBy, isGroupingEnabled]);

  useEffect(() => {
      if (!setCurrentQuestionNumberInView || !scrollContainerRef.current) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const cardId = entry.target.id.replace("question-card-", "");
              setCurrentQuestionNumberInView(Number(cardId));
            }
          });
        }, { root: scrollContainerRef.current, rootMargin: "-50% 0px -50% 0px", threshold: 0 }
      );
      const questionElements = scrollContainerRef.current.querySelectorAll('[id^="question-card-"]');
      questionElements.forEach((el) => observer.observe(el));
      return () => observer.disconnect();
  }, [questions, setCurrentQuestionNumberInView, isGroupingEnabled]);
  
  if (currentViewAnswer) {
    const question = questions.find((q) => q.id === currentViewAnswer);
    if (!question) return null;
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Detailed Solution</h3>
                <button onClick={closeAnswerView} className="p-2 rounded-full hover:bg-gray-100"><i className="ri-close-line text-xl"></i></button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                <div className="space-y-6">
                    <div><p className="font-semibold text-lg mb-2 whitespace-pre-line">Q{question.questionNumber}: {question.text}</p></div>
                    <div><h4 className="font-semibold text-lg mb-2">Explanation:</h4><p className="text-gray-700 leading-relaxed whitespace-pre-line">{question.explanation}</p></div>
                </div>
            </div>
        </div>
    );
  }

  let questionCounter = 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col relative overflow-hidden">
      <div ref={scrollContainerRef} className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        <div className="space-y-6">
          {isGroupingEnabled && questionsByGroup && sortedGroups.map(groupName => (
            <div key={groupName} id={`group-${groupName}`}>
              <div data-group={groupName} className="py-2 mt-4">
                  <div className="bg-gray-200 text-gray-700 font-bold text-sm py-2 px-4 rounded-full inline-block capitalize">{groupName}</div>
              </div>
              {questionsByGroup[groupName].map((question) => {
                  questionCounter++;
                  return <QuestionCard key={question.id} question={question} displayNumber={questionCounter} />
              })}
            </div>
          ))}
          {!isGroupingEnabled && questions.map((question, index) => <QuestionCard key={question.id} question={question} displayNumber={index + 1} />)}
        </div>
      </div>
      <div className="absolute bottom-6 right-6">
        {isPaletteOpen && <QuestionPalette onClose={() => setIsPaletteOpen(false)} />}
        <button onClick={() => setIsPaletteOpen(!isPaletteOpen)} className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform mt-4">
            <i className={`ri-grid-fill text-2xl transition-transform duration-300 ${isPaletteOpen ? 'rotate-45' : ''}`}></i>
        </button>
      </div>
    </div>
  );
};

export default QuestionColumn;