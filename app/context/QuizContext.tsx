'use client';

import React, {
    createContext,
    useState,
    useContext,
    ReactNode
} from 'react';
import {
    useRouter
} from 'next/navigation';
import {
    Question,
    UserAnswer
} from '@/types';

type BackendQuestion = {
    _id: string;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: string;
    explanation: string;
    year ? : number;
    subject ? : string;
    topic?: string;
    exam?: string;
};

type GroupByKey = 'topic' | 'examYear';

interface QuizFilter {
    exam?: string;
    year?: string;
    subject?: string;
    topic?: string;
}

interface QuizError {
    message: string;
    type: 'auth' | 'generic';
}

interface ToastState {
    show: boolean;
    message: string;
    type: 'info' | 'warning';
}

interface QuizContextType {
    questions: Question[];
    userAnswers: UserAnswer[];
    isTestMode: boolean;
    isLoading: boolean;
    showReport: boolean;
    currentViewAnswer: string | null;
    timeLeft: number;
    totalTime: number;
    showDetailedSolution: boolean;
    quizError: QuizError | null;
    quizTitle: string;
    quizGroupBy: GroupByKey | null;
    isGroupingEnabled: boolean;
    setIsGroupingEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    isTopBarVisible: boolean;
    setIsTopBarVisible: React.Dispatch<React.SetStateAction<boolean>>;
    currentQuestionNumberInView: number;
    setCurrentQuestionNumberInView: React.Dispatch<React.SetStateAction<number>>;
    handleAnswerSelect: (questionId: string, answer: string) => void;
    startTest: () => void;
    submitTest: () => void;
    resetTest: () => void;
    viewAnswer: (questionId: string) => void;
    closeAnswerView: () => void;
    handleDetailedSolution: () => void;
    setTimeLeft: React.Dispatch < React.SetStateAction < number >> ;
    getAttemptedCount: () => number;
    getNotAttemptedCount: () => number;
    loadAndStartQuiz: (filter: QuizFilter) => Promise < void > ;
    isPageScrolled: boolean;
    setIsPageScrolled: React.Dispatch < React.SetStateAction < boolean >> ;
    currentGroupInView: string | null;
    setCurrentGroupInView: React.Dispatch < React.SetStateAction < string | null >> ;
    bookmarkedQuestions: Set < string > ;
    toggleBookmark: (questionId: string) => void;
    markedForReview: Set < string > ;
    toggleMarkForReview: (questionId: string) => void;
    saveTestResult: () => Promise < void > ;
    calculateResults: () => {
        correctCount: number;
        incorrectCount: number;
        unattemptedCount: number;
        finalScore: number;
        maxScore: number;
    };
    toast: ToastState;
    showToast: (message: string, type: 'info' | 'warning') => void;
    hideToast: () => void;
}

const QuizContext = createContext < QuizContextType | undefined > (undefined);

export const QuizProvider = ({
    children
}: {
    children: ReactNode
}) => {
    const [questions, setQuestions] = useState < Question[] > ([]);
    const [isLoading, setIsLoading] = useState(false);
    const [userAnswers, setUserAnswers] = useState < UserAnswer[] > ([]);
    const [isTestMode, setIsTestMode] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [currentViewAnswer, setCurrentViewAnswer] = useState < string | null > (null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    const [showDetailedSolution, setShowDetailedSolution] = useState(false);
    const [currentQuestionNumberInView, setCurrentQuestionNumberInView] = useState(1);
    const [quizError, setQuizError] = useState < QuizError | null > (null);
    const [quizTitle, setQuizTitle] = useState('');
    const [quizGroupBy, setQuizGroupBy] = useState<GroupByKey | null>(null);
    const [isGroupingEnabled, setIsGroupingEnabled] = useState(true);
    const [isPageScrolled, setIsPageScrolled] = useState(false);
    const [isTopBarVisible, setIsTopBarVisible] = useState(true);
    const [currentGroupInView, setCurrentGroupInView] = useState < string | null > (null);
    const [bookmarkedQuestions, setBookmarkedQuestions] = useState < Set < string >> (new Set());
    const [markedForReview, setMarkedForReview] = useState < Set < string >> (new Set());
    const [toast, setToast] = useState < ToastState > ({
        show: false,
        message: '',
        type: 'info'
    });

    const router = useRouter();

    const loadAndStartQuiz = async (filter: QuizFilter) => {
        setIsLoading(true);
        setQuizError(null);
        
        let title = 'UPSC Practice';
        let groupBy: GroupByKey | null = null;
        let groupingEnabled = false;

        if (filter.subject && filter.topic) {
            title = `${filter.subject} - ${filter.topic}`;
            groupBy = 'examYear';
            groupingEnabled = true;
        } else if (filter.subject) {
            title = `${filter.subject} - All Questions`;
            groupBy = 'topic';
            groupingEnabled = true; 
        } else if (filter.exam && filter.year) {
            title = `${filter.exam} - ${filter.year}`;
            groupBy = null;
            groupingEnabled = false;
        }

        setQuizTitle(title);
        setQuizGroupBy(groupBy);
        setIsGroupingEnabled(groupingEnabled);

        try {
            const response = await fetch(`/api/questions?${new URLSearchParams(filter as Record<string, string>).toString()}`);
            if (!response.ok) {
                setQuizError({ message: 'Could not load questions.', type: 'generic' });
                return;
            }
            const result = await response.json();
            if (result.success && result.data.length > 0) {
                const transformedQuestions: Question[] = result.data.map((q: BackendQuestion, index: number) => ({
                    id: q._id,
                    questionNumber: index + 1,
                    text: q.questionText,
                    options: [{ label: "A", text: q.optionA }, { label: "B", text: q.optionB }, { label: "C", text: q.optionC }, { label: "D", text: q.optionD }],
                    correctAnswer: q.correctOption,
                    explanation: q.explanation,
                    year: q.year,
                    subject: q.subject,
                    topic: q.topic,
                    exam: q.exam,
                    examYear: `${q.exam}-${q.year}`,
                }));
                setQuestions(transformedQuestions);

                const calculatedTime = Math.round(transformedQuestions.length * 1.2 * 60);
                setTotalTime(calculatedTime);
                setTimeLeft(calculatedTime);
                
                if (transformedQuestions.length > 0 && groupBy) {
                    const firstQuestion = transformedQuestions[0];
                    setCurrentGroupInView(String(firstQuestion[groupBy] || ''));
                } else if (transformedQuestions.length > 0) {
                     setCurrentGroupInView(String(transformedQuestions[0].year || ''));
                }

                setUserAnswers([]);
                setBookmarkedQuestions(new Set());
                setMarkedForReview(new Set());
                setShowReport(false);
                setCurrentViewAnswer(null);
                setShowDetailedSolution(false);
                setCurrentQuestionNumberInView(1);
                setIsTestMode(false);
                setIsPageScrolled(false);
                setIsTopBarVisible(true);
                router.push('/quiz');
            } else {
                setQuizError({ message: 'No questions were found for your selection.', type: 'generic' });
            }
        } catch (error) {
            // FIX: Log the error and remove the unused variable.
            console.error("Failed to load quiz:", error);
            setQuizError({ message: 'A network error occurred.', type: 'generic' });
        } finally {
            setIsLoading(false);
        }
    };

    const calculateResults = () => {
        let correctCount = 0;
        let incorrectCount = 0;
        questions.forEach((question) => {
            const userAnswer = userAnswers.find((ua) => ua.questionId === question.id);
            if (userAnswer) {
                if (userAnswer.answer === question.correctAnswer) correctCount++;
                else incorrectCount++;
            }
        });
        const totalCount = questions.length;
        const unattemptedCount = totalCount - (correctCount + incorrectCount);
        const marksForCorrect = correctCount * 2;
        const marksDeducted = incorrectCount * (2 / 3);
        const finalScore = parseFloat((marksForCorrect - marksDeducted).toFixed(2));
        const maxScore = totalCount * 2;
        return { correctCount, incorrectCount, unattemptedCount, finalScore, maxScore };
    };

    const saveTestResult = async () => {
        const score = calculateResults();
        const resultPayload = {
            quizTitle,
            questions: questions.map(q => q.id),
            userAnswers,
            score,
        };
        try {
            await fetch('/api/test-results', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(resultPayload), });
        } catch (error) { console.error("Failed to save test result", error); } 
        finally { resetTest(); }
    };

    const handleAnswerSelect = (questionId: string, answer: string) => {
        if (isTestMode && userAnswers.find(ua => ua.questionId === questionId)) return;
        setUserAnswers(prev => {
            const existing = prev.find(ua => ua.questionId === questionId);
            if (existing) return prev.map(ua => ua.questionId === questionId ? { ...ua, answer } : ua);
            return [...prev, { questionId, answer }];
        });
    };

    const toggleBookmark = (questionId: string) => {
        setBookmarkedQuestions(prev => { const newSet = new Set(prev); if (newSet.has(questionId)) newSet.delete(questionId); else newSet.add(questionId); return newSet; });
    };

    const toggleMarkForReview = (questionId: string) => {
        setMarkedForReview(prev => { const newSet = new Set(prev); if (newSet.has(questionId)) newSet.delete(questionId); else newSet.add(questionId); return newSet; });
    };

    const startTest = () => {
        if (questions.length === 0) return;
        setIsTestMode(true);
        setTimeLeft(totalTime);
        setCurrentViewAnswer(null);
        setUserAnswers([]);
        setMarkedForReview(new Set());
        setBookmarkedQuestions(new Set());
        setShowDetailedSolution(false);
        setShowReport(false);
        setCurrentQuestionNumberInView(1);
    };

    const submitTest = () => { setIsTestMode(false); setShowReport(true); };
    const resetTest = () => router.push('/dashboard');
    const viewAnswer = (questionId: string) => setCurrentViewAnswer(questionId);
    const closeAnswerView = () => setCurrentViewAnswer(null);
    const handleDetailedSolution = () => { setShowReport(false); setShowDetailedSolution(true); };
    const getAttemptedCount = () => userAnswers.length;
    const getNotAttemptedCount = () => questions.length - userAnswers.length;
    const showToast = (message: string, type: 'info' | 'warning' = 'info') => setToast({ show: true, message, type });
    const hideToast = () => setToast({ show: false, message: '', type: 'info' });

    const value: QuizContextType = {
        questions, userAnswers, isTestMode, isLoading, showReport, currentViewAnswer, timeLeft, totalTime,
        showDetailedSolution, quizError, quizTitle, quizGroupBy, isGroupingEnabled, setIsGroupingEnabled, 
        isTopBarVisible, setIsTopBarVisible, currentQuestionNumberInView, setCurrentQuestionNumberInView,
        handleAnswerSelect, startTest, submitTest,
        resetTest, viewAnswer, closeAnswerView, handleDetailedSolution, setTimeLeft, getAttemptedCount,
        getNotAttemptedCount, loadAndStartQuiz,
        isPageScrolled, setIsPageScrolled, currentGroupInView, setCurrentGroupInView, bookmarkedQuestions,
        toggleBookmark, markedForReview, toggleMarkForReview, saveTestResult, calculateResults,
        toast, showToast, hideToast
    };

    return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};

export const useQuiz = (): QuizContextType => {
    const context = useContext(QuizContext);
    if (context === undefined) throw new Error('useQuiz must be used within a QuizProvider');
    return context;
};