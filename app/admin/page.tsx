"use client";

import React, { useState, useEffect } from 'react';
import QuestionList from './components/QuestionList';
import AdminHeader from './components/AdminHeader';
import BulkAddModal from './components/BulkAddModal';
import QuestionEditorModal from './components/QuestionEditorModal'; // Import the new modal

export default function Page() {
    const [questions, setQuestions] = useState([]);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
    // State for the new single question modal
    const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);

    const fetchQuestions = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/questions/all');
            const result = await response.json();
            if (result.success) {
                const sorted = result.data.sort((a: any, b: any) => {
                    if (a.year !== b.year) {
                        return (b.year || 0) - (a.year || 0);
                    }
                    return (a.paperQuestionNumber || 0) - (b.paperQuestionNumber || 0);
                });
                setQuestions(sorted);
            }
        } catch (error) {
            console.error("Failed to fetch questions", error);
            setQuestions([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    if (isLoading && questions.length === 0) {
        return <div className="flex items-center justify-center h-screen bg-gray-50">Loading Questions...</div>;
    }

    return (
        <div className="bg-gray-50 h-screen flex flex-col font-sans">
            <header className="flex-shrink-0 z-10">
                <AdminHeader 
                    onBulkAddClick={() => setIsBulkAddModalOpen(true)}
                    onNewQuestionClick={() => setIsEditorModalOpen(true)} // Connect the new handler
                />
            </header>
            
            <main className="flex-1 flex flex-row overflow-hidden">
                <div className="w-full border-r border-gray-200 bg-white flex flex-col">
                    <QuestionList 
                        questions={questions}
                        selectedQuestionIds={selectedQuestionIds}
                        setSelectedQuestionIds={setSelectedQuestionIds}
                    />
                </div>
            </main>
            
            {isBulkAddModalOpen && (
                <BulkAddModal 
                    onClose={() => setIsBulkAddModalOpen(false)}
                    onSuccess={() => {
                        fetchQuestions();
                        setIsBulkAddModalOpen(false);
                    }}
                />
            )}

            {/* Render the new single question modal */}
            {isEditorModalOpen && (
                <QuestionEditorModal
                    onClose={() => setIsEditorModalOpen(false)}
                    onSuccess={() => {
                        fetchQuestions();
                        setIsEditorModalOpen(false);
                    }}
                />
            )}
        </div>
    );
}
