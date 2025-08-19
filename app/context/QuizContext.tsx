// app/context/QuizContext.tsx
'use client';

import React, {
    createContext,
    useState,
    useContext,
    ReactNode,
    useEffect,
    useCallback,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Question, UserAnswer } from '@/types';
import { auth } from '@/lib/firebase'; // Import auth to get the current user

// NOTE: The interfaces (BackendQuestion, GroupByKey, etc.) remain the same.

type BackendQuestion = {
    _id: string;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: string;
    explanationText: string;
    year ? : number;
    subject ? : string;
    topic?: string;
    exam?: string;
    examYear?: string;
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

interface PerformanceStats {
    finalScore: number;
    accuracy: number;
    avgTimePerQuestion: number;
    pacing: 'Ahead' | 'On Pace' | 'Behind';
}

interface SavedQuizState {
    filter: QuizFilter;
    isTestMode: boolean;
    userAnswers: UserAnswer[];
    timeLeft: number;
    bookmarkedQuestions: string[];
    markedForReview: string[];
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
    calculateResults: () => { // Ensure this matches the return type
        correctCount: number;
        incorrectCount: number;
        unattemptedCount: number;
        finalScore: number;
        maxScore: number;
    };
    toast: ToastState;
    showToast: (message: string, type: 'info' | 'warning') => void;
    hideToast: () => void;
    performanceStats: PerformanceStats | null;
}

const QuizContext = createContext < QuizContextType | undefined > (undefined);
const SESSION_STORAGE_KEY = 'activeQuizSession';

// --- NEW HELPER FUNCTION TO GET AUTH TOKEN ---
const getAuthHeader = async () => {
    const user = auth.currentUser;
    if (!user) return null;
    const token = await user.getIdToken();
    return { 'Authorization': `Bearer ${token}` };
};

export const QuizProvider = ({ children }: { children: ReactNode }) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
    const [isTestMode, setIsTestMode] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [currentViewAnswer, setCurrentViewAnswer] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    const [showDetailedSolution, setShowDetailedSolution] = useState(false);
    const [currentQuestionNumberInView, setCurrentQuestionNumberInView] = useState(1);
    const [quizError, setQuizError] = useState<QuizError | null>(null);
    const [quizTitle, setQuizTitle] = useState('');
    const [quizGroupBy, setQuizGroupBy] = useState<GroupByKey | null>(null);
    const [isGroupingEnabled, setIsGroupingEnabled] = useState(true);
    const [isPageScrolled, setIsPageScrolled] = useState(false);
    const [isTopBarVisible, setIsTopBarVisible] = useState(true);
    const [currentGroupInView, setCurrentGroupInView] = useState<string | null>(null);
    const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<string>>(new Set());
    const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
    const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });
    const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);

    const router = useRouter();
    const pathname = usePathname();

    const clearSession = () => sessionStorage.removeItem(SESSION_STORAGE_KEY);

    const loadAndStartQuiz = useCallback(async (filter: QuizFilter, restoreState?: Partial<SavedQuizState>) => {
        setIsLoading(true);
        setQuizError(null);

        // --- ADDED AUTH CHECK ---
        const headers = await getAuthHeader();
        if (!headers) {
            setQuizError({ message: 'You must be logged in to start a quiz.', type: 'auth' });
            setIsLoading(false);
            return;
        }

        let title = 'UPSC Practice', groupBy: GroupByKey | null = null, groupingEnabled = false;
        if (filter.subject && filter.topic) { title = `${filter.subject} - ${filter.topic}`; groupBy = 'examYear'; groupingEnabled = true; } 
        else if (filter.subject) { title = `${filter.subject} - All Questions`; groupBy = 'topic'; groupingEnabled = true; } 
        else if (filter.exam && filter.year) { title = `${filter.exam} - ${filter.year}`; groupBy = null; groupingEnabled = false; }
        setQuizTitle(title); setQuizGroupBy(groupBy); setIsGroupingEnabled(groupingEnabled);

        try {
            const response = await fetch(`/api/questions?${new URLSearchParams(filter as Record<string, string>).toString()}`, { headers });
            if (!response.ok) { 
                if (response.status === 401) {
                    setQuizError({ message: 'Your session has expired. Please log in again.', type: 'auth' });
                } else {
                    setQuizError({ message: 'Could not load questions.', type: 'generic' });
                }
                return; 
            }
            const result = await response.json();
            if (result.success && result.data.length > 0) {
                const transformedQuestions: Question[] = result.data.map((q: BackendQuestion, index: number) => ({
                    id: q._id, questionNumber: index + 1, text: q.questionText,
                    options: [{ label: "A", text: q.optionA }, { label: "B", text: q.optionB }, { label: "C", text: q.optionC }, { label: "D", text: q.optionD }],
                    correctAnswer: q.correctOption, explanation: q.explanationText, year: q.year, subject: q.subject, topic: q.topic, exam: q.exam,
                    examYear: `${q.exam}-${q.year}`,
                }));
                setQuestions(transformedQuestions);
                const calculatedTime = Math.round(transformedQuestions.length * 1.2 * 60);
                setTotalTime(calculatedTime);
                setUserAnswers(restoreState?.userAnswers || []);
                setBookmarkedQuestions(new Set(restoreState?.bookmarkedQuestions || []));
                setMarkedForReview(new Set(restoreState?.markedForReview || []));
                setIsTestMode(restoreState?.isTestMode || false);
                setTimeLeft(restoreState?.timeLeft ?? calculatedTime);
                if (pathname !== '/quiz') { router.push('/quiz'); }
                sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
                    filter, isTestMode: restoreState?.isTestMode || false, userAnswers: restoreState?.userAnswers || [],
                    timeLeft: restoreState?.timeLeft ?? calculatedTime, bookmarkedQuestions: Array.from(restoreState?.bookmarkedQuestions || []), markedForReview: Array.from(restoreState?.markedForReview || []),
                }));
            } else { setQuizError({ message: 'No questions were found for your selection.', type: 'generic' }); }
        } catch (error) { console.error("Failed to load quiz:", error); setQuizError({ message: 'A network error occurred.', type: 'generic' }); } 
        finally { setIsLoading(false); }
    }, [router, pathname]);

    useEffect(() => {
        const savedStateJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (savedStateJSON && pathname === '/quiz') {
            const savedState: SavedQuizState = JSON.parse(savedStateJSON);
            loadAndStartQuiz(savedState.filter, savedState);
        } else {
            setIsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (isTestMode && questions.length > 0) {
            const savedStateJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
            if (savedStateJSON) {
                const savedState: SavedQuizState = JSON.parse(savedStateJSON);
                savedState.userAnswers = userAnswers; savedState.timeLeft = timeLeft;
                savedState.bookmarkedQuestions = Array.from(bookmarkedQuestions);
                savedState.markedForReview = Array.from(markedForReview);
                sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(savedState));
            }
        }
    }, [userAnswers, timeLeft, bookmarkedQuestions, markedForReview, isTestMode, questions]);

    const calculateResults = useCallback(() => {
        let correctCount = 0, incorrectCount = 0;
        questions.forEach((q) => {
            const userAnswer = userAnswers.find((ua) => ua.questionId === q.id);
            if (userAnswer) { (userAnswer.answer === q.correctAnswer) ? correctCount++ : incorrectCount++; }
        });
        const unattemptedCount = questions.length - (correctCount + incorrectCount);
        const finalScore = parseFloat(((correctCount * 2) - (incorrectCount * (2 / 3))).toFixed(2));
        return { correctCount, incorrectCount, unattemptedCount, finalScore, maxScore: questions.length * 2 };
    }, [questions, userAnswers]);
    
    const saveTestResult = async () => {
        const headers = await getAuthHeader();
        if (!headers) {
            showToast("You must be logged in to save results.", "warning");
            return;
        }

        const { correctCount, incorrectCount, unattemptedCount, finalScore, maxScore } = calculateResults();
        
        const payload = {
            quizTitle,
            questions: questions.map(q => q.id),
            userAnswers,
            score: {
                correctCount,
                incorrectCount,
                unattemptedCount,
                finalScore,
                maxScore,
            },
        };

        try {
            const response = await fetch('/api/test-result', {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Failed to save the test result.");
            }
            showToast("Test result saved successfully!", "info");
            resetTest(); // Go to dashboard after saving
        } catch (error) {
            console.error("Error saving test result:", error);
            showToast("Could not save the test result.", "warning");
        }
    };
    
    useEffect(() => {
        if (showReport || showDetailedSolution) {
            const attemptedCount = userAnswers.length;
            if (attemptedCount === 0) { setPerformanceStats({ finalScore: 0, accuracy: 0, avgTimePerQuestion: 0, pacing: 'On Pace' }); return; }
            const { finalScore, correctCount } = calculateResults();
            const accuracy = Math.round((correctCount / attemptedCount) * 100);
            const timeTaken = totalTime - timeLeft;
            const avgTimePerQuestion = Math.round(timeTaken / attemptedCount);
            let pacing: 'Ahead' | 'On Pace' | 'Behind' = 'On Pace';
            const idealTimePerQuestion = 72;
            if (avgTimePerQuestion > idealTimePerQuestion + 10) { pacing = 'Behind'; } else if (avgTimePerQuestion < idealTimePerQuestion - 10) { pacing = 'Ahead'; }
            setPerformanceStats({ finalScore, accuracy, avgTimePerQuestion, pacing });
        }
    }, [showReport, showDetailedSolution, userAnswers, totalTime, timeLeft, calculateResults]);

    const handleAnswerSelect = (questionId: string, answer: string) => { /* ... */ };
    const toggleBookmark = (questionId: string) => { /* ... */ };
    const toggleMarkForReview = (questionId: string) => { /* ... */ };
    
    const startTest = () => {
        if (questions.length === 0) return;
        setIsTestMode(true); setTimeLeft(totalTime); setCurrentViewAnswer(null); setUserAnswers([]);
        setMarkedForReview(new Set()); setBookmarkedQuestions(new Set()); setShowDetailedSolution(false);
        setShowReport(false); setCurrentQuestionNumberInView(1);
        const savedStateJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (savedStateJSON) {
            const savedState: SavedQuizState = JSON.parse(savedStateJSON);
            savedState.isTestMode = true; sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(savedState));
        }
    };

    const submitTest = () => { setIsTestMode(false); setShowReport(true); clearSession(); };
    const resetTest = () => { clearSession(); router.push('/dashboard'); };
    const handleDetailedSolution = () => { setShowReport(false); setShowDetailedSolution(true); clearSession(); };
    const viewAnswer = (questionId: string) => setCurrentViewAnswer(questionId);
    const closeAnswerView = () => setCurrentViewAnswer(null);
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
        getNotAttemptedCount, loadAndStartQuiz: loadAndStartQuiz as (filter: QuizFilter) => Promise<void>,
        isPageScrolled, setIsPageScrolled, currentGroupInView, setCurrentGroupInView, bookmarkedQuestions,
        toggleBookmark, markedForReview, toggleMarkForReview, saveTestResult, 
        calculateResults,
        toast, showToast, hideToast,
        performanceStats
    };

    return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};

export const useQuiz = (): QuizContextType => {
    const context = useContext(QuizContext);
    if (context === undefined) throw new Error('useQuiz must be used within a QuizProvider');
    return context;
};