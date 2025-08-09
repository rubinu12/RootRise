"use client";

import React from 'react';
import { useQuiz } from '@/app/context/QuizContext';

const PerformanceAnalyticsBar: React.FC = () => {
    const { performanceStats } = useQuiz();

    if (!performanceStats) {
        return null;
    }

    const { finalScore, accuracy, avgTimePerQuestion, pacing } = performanceStats;

    const formatTime = (seconds: number) => {
        if (isNaN(seconds) || seconds === 0) return '0s';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m > 0 ? `${m}m ` : ''}${s}s`;
    };

    const getPacingColor = () => {
        if (pacing === 'Behind') return 'text-red-600';
        if (pacing === 'Ahead') return 'text-green-600';
        return 'text-gray-800';
    };

    const Metric = ({ label, value, valueClassName = '' }: { label: string, value: string | number, valueClassName?: string }) => (
        <div className="text-center">
            <div className="text-xs text-gray-600 mb-0.5">{label}</div>
            <div className={`text-lg font-bold text-gray-800 ${valueClassName}`}>{value}</div>
        </div>
    );

    return (
        <div className="flex items-center justify-around w-full">
            <Metric label="Final Score" value={finalScore.toFixed(2)} valueClassName={finalScore > (100 * 2 * 0.4) ? 'text-green-600' : 'text-red-600'} />
            <Metric label="Accuracy" value={`${accuracy}%`} valueClassName={accuracy > 75 ? 'text-green-600' : accuracy < 40 ? 'text-red-600' : 'text-yellow-600'} />
            <Metric label="Avg. Time / Q" value={formatTime(avgTimePerQuestion)} />
            <Metric label="Pacing" value={pacing} valueClassName={getPacingColor()} />
        </div>
    );
};

export default PerformanceAnalyticsBar;