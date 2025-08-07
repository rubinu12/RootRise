"use client";

import React, { useState, useEffect } from 'react';

// --- Types ---
interface Question { _id: string; paperQuestionNumber?: number; questionText: string; subject?: string; topic?: string; year?: number; }
interface QuestionListProps { questions: Question[]; selectedQuestionIds: string[]; setSelectedQuestionIds: React.Dispatch<React.SetStateAction<string[]>>; }

// --- Helper function to parse selection strings ---
const parseSelectionString = (str: string): number[] => {
    const selectedNumbers = new Set<number>();
    const parts = str.split(',');
    parts.forEach(part => {
        part = part.trim();
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(Number);
            if (!isNaN(start) && !isNaN(end)) {
                for (let i = start; i <= end; i++) {
                    selectedNumbers.add(i);
                }
            }
        } else { const num = Number(part); if (!isNaN(num)) { selectedNumbers.add(num); } }
    });
    return Array.from(selectedNumbers);
};

const QuestionList = ({ questions, selectedQuestionIds, setSelectedQuestionIds }: QuestionListProps) => {
    const [openYears, setOpenYears] = useState<Set<number>>(new Set());
    const [selectionText, setSelectionText] = useState('');

    // FIX: Simplified the reduce function to avoid the linter warning.
    const questionsByYear = questions.reduce((acc, q) => {
        const year = q.year || 'Uncategorized';
        (acc[year] = acc[year] || []).push(q);
        return acc;
    }, {} as { [key: string]: Question[] });

    const sortedYears = Object.keys(questionsByYear).sort((a, b) => Number(b) - Number(a));

    const toggleYear = (year: number) => {
        setOpenYears(prev => {
            const newSet = new Set(prev);
            newSet.has(year) ? newSet.delete(year) : newSet.add(year);
            return newSet;
        });
    };
    
    const handleQuestionClick = (id: string) => {
        setSelectedQuestionIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) { newSet.delete(id); } else { newSet.add(id); }
            return Array.from(newSet);
        });
    };

    const handleSelectByText = () => {
        const yearToSelectIn = openYears.values().next().value;
        if (!yearToSelectIn) { alert("Please open a year section to apply selection."); return; }
        const questionNumbersToSelect = parseSelectionString(selectionText);
        const questionIdsToSelect = new Set<string>(selectedQuestionIds);
        questionsByYear[yearToSelectIn].forEach(q => { if (q.paperQuestionNumber && questionNumbersToSelect.includes(q.paperQuestionNumber)) { questionIdsToSelect.add(q._id); } });
        setSelectedQuestionIds(Array.from(questionIdsToSelect));
        setSelectionText('');
    };

    useEffect(() => {
        if (sortedYears.length > 0) {
            setOpenYears(new Set([Number(sortedYears[0])]));
        }
    }, [questions, sortedYears]); // Added sortedYears dependency

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 flex-shrink-0"><h2 className="text-lg font-semibold text-gray-800">All Questions ({selectedQuestionIds.length} selected)</h2></div>
            <div className="p-2 border-b border-gray-200 flex gap-2"><input type="text" value={selectionText} onChange={(e) => setSelectionText(e.target.value)} placeholder="e.g., 1, 5, 8-12" className="flex-grow p-2 border border-gray-300 rounded-md text-sm" /><button onClick={handleSelectByText} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700">Select</button></div>
            <div className="flex-1 overflow-y-auto">
                {sortedYears.map(yearStr => {
                    const year = Number(yearStr);
                    const isYearOpen = openYears.has(year);
                    const yearQuestions = questionsByYear[yearStr].sort((a, b) => (a.paperQuestionNumber || 0) - (b.paperQuestionNumber || 0));
                    return (
                        <div key={year} className="border-b border-gray-200">
                            <button onClick={() => toggleYear(year)} className="w-full flex justify-between items-center p-4 text-left font-semibold text-gray-700 hover:bg-gray-50"><span>{year}</span><i className={`ri-arrow-down-s-line transition-transform ${isYearOpen ? 'rotate-180' : ''}`}></i></button>
                            {isYearOpen && (<div className="pl-4">{yearQuestions.map((q, index) => { const isSelected = selectedQuestionIds.includes(q._id); return (<div key={q._id} onClick={() => handleQuestionClick(q._id)} className={`p-3 border-l-4 cursor-pointer flex items-start gap-3 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-gray-100'}`}><div className={`mt-1 w-4 h-4 rounded border flex-shrink-0 ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}></div><div><p className="font-medium text-gray-800" title={q.questionText}>{q.paperQuestionNumber || index + 1}. {q.questionText}</p><div className="text-xs text-gray-500 mt-1"><span>{q.subject || 'No Subject'}</span><span className="mx-2">|</span><span>{q.topic || 'No Topic'}</span></div></div></div>); })}</div>)}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default QuestionList;