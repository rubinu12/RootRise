"use client";

import React, { useMemo } from 'react';
import { useQuiz } from '@/app/context/QuizContext';

// Import the specialized bar components we've designed
import TopicFocusBar from '@/components/quiz/TopicFocusBar';
import PerformanceAnalyticsBar from './PerformanceAnalyticsBar';

// This is the component for the group navigation links (for subject-wise practice)
const GroupNavigation = () => {
    const { questions, quizGroupBy, isGroupingEnabled, setIsGroupingEnabled } = useQuiz();

    const sortedGroups = useMemo(() => {
        if (!quizGroupBy || !isGroupingEnabled) return [];
        const groups = Array.from(new Set(questions.map(q => q[quizGroupBy]).filter(Boolean))) as (string | number)[];
        if (groups.length === 0) return [];
        const isNumeric = !isNaN(Number(groups[0]));
        return groups.sort((a, b) => isNumeric ? Number(b) - Number(a) : String(a).localeCompare(String(b)));
    }, [questions, quizGroupBy, isGroupingEnabled]);

    const scrollToGroup = (groupName: string | number) => {
        const groupElement = document.getElementById(`group-${groupName}`);
        if (groupElement) {
            groupElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // The ToggleSwitch component, moved here to be self-contained
    const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean, onChange: (enabled: boolean) => void }) => (
        <button
            onClick={() => onChange(!enabled)}
            className={`${enabled ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors flex-shrink-0`}
        >
            <span className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
        </button>
    );

    return (
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 flex-shrink-0">
                <ToggleSwitch enabled={isGroupingEnabled} onChange={setIsGroupingEnabled} />
            </div>
            <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap">
                {sortedGroups.map(group => (
                    <React.Fragment key={group}>
                        <div className="border-l border-gray-300 h-4"></div>
                        <button onClick={() => scrollToGroup(group)} className="text-gray-600 hover:text-blue-600 font-semibold px-2">{group}</button>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};


// The main controller component
const DynamicQuizCommandBar: React.FC = () => {
    const {
        isTestMode,
        showReport,
        showDetailedSolution,
        isGroupingEnabled,
        questions,
        currentQuestionNumberInView
    } = useQuiz();

    // Determine the currently visible question to pass to the TopicFocusBar
    const currentQuestion = useMemo(() => {
        if (questions.length > 0 && currentQuestionNumberInView > 0) {
            return questions[currentQuestionNumberInView - 1];
        }
        return null;
    }, [questions, currentQuestionNumberInView]);

    // 1. In Test Mode, render nothing.
    if (isTestMode) {
        return null;
    }

    // 2. In Review Mode (after test), render the performance analytics.
    if (showReport || showDetailedSolution) {
        return <PerformanceAnalyticsBar />;
    }

    // 3. In Practice Mode, decide which bar to show.
    if (isGroupingEnabled) {
        // For subject-wise practice, show group navigation.
        return <GroupNavigation />;
    } else {
        // For year-wise practice, show the topic context.
        return <TopicFocusBar currentQuestion={currentQuestion} />;
    }
};

export default DynamicQuizCommandBar;