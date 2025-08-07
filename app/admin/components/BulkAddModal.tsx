"use client";

import React, { useState } from 'react';
import { SUBJECTS, TOPICS } from '@/lib/quizData';

const requiredFormat = `---
* exam: UPSC CSE
* year: 2023
* paperQuestionNumber: 1
* questionText: Consider the following statements:
  1. Jhelum River passes through Wular Lake.
  2. Krishna River directly feeds Kolleru Lake.
* optionA: Only one
* optionB: Only two
* correctOption: B
* subject: Geo (Ind)
* topic: River Systems
---
`;

interface ValidationError {
    questionIndex: number;
    message: string;
}

const parseAndValidate = (text: string): { data: any[], errors: ValidationError[] } => {
    const questions: any[] = [];
    const errors: ValidationError[] = [];
    const questionBlocks = text.split('---').filter(block => block.trim().length > 0);

    questionBlocks.forEach((block, index) => {
        const question: { [key: string]: any } = {};
        const questionNumberForError = index + 1;
        const lines = block.trim().split('\n');
        let currentKey: string | null = null;

        lines.forEach(line => {
            const fieldMatch = line.match(/^\s*\*\s*([\w\s()]+):\s*(.*)/);
            if (fieldMatch) {
                const key = fieldMatch[1].trim();
                const value = fieldMatch[2].trim();
                question[key] = value;
                currentKey = key;
            } else if (currentKey) {
                question[currentKey] += '\n' + line.trim();
            }
        });

        if (Object.keys(question).length === 0) return;

        // --- Validation ---
        const { exam, year, subject, topic, questionText } = question;
        if (!exam) errors.push({ questionIndex: questionNumberForError, message: `Missing required field: "exam".` });
        if (!year) errors.push({ questionIndex: questionNumberForError, message: `Missing required field: "year".` });
        if (!questionText) errors.push({ questionIndex: questionNumberForError, message: `Missing required field: "questionText".` });

        if (subject) {
            if (!SUBJECTS.includes(subject)) {
                errors.push({ questionIndex: questionNumberForError, message: `Invalid subject: "${subject}".` });
            } else if (subject !== 'Misc.' && (!topic || topic.trim() === '')) {
                errors.push({ questionIndex: questionNumberForError, message: `Missing required field: "topic" for subject "${subject}".` });
            } else if (subject !== 'Misc.' && topic) {
                const validTopics = TOPICS[subject as keyof typeof TOPICS];
                if (validTopics && !validTopics.includes(topic)) {
                    errors.push({ questionIndex: questionNumberForError, message: `Invalid topic: "${topic}" for subject "${subject}".` });
                }
            }
        } else {
            errors.push({ questionIndex: questionNumberForError, message: `Missing required field: "subject".` });
        }
        
        question.year = Number(question.year);
        if (question.paperQuestionNumber) {
            question.paperQuestionNumber = Number(question.paperQuestionNumber);
        }

        questions.push(question);
    });

    return { data: questions, errors };
};

const BulkAddModal: React.FC<{ onClose: () => void; onSuccess: () => void; }> = ({ onClose, onSuccess }) => {
    const [view, setView] = useState<'edit' | 'preview'>('edit'); // Controls the view
    const [textInput, setTextInput] = useState('');
    const [parsedQuestions, setParsedQuestions] = useState<any[]>([]);
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
    const [generalError, setGeneralError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleValidation = () => {
        setGeneralError('');
        setParsedQuestions([]);
        setValidationErrors([]);
        if (!textInput.trim()) {
            setGeneralError('Input is empty.');
            return;
        }
        const { data, errors } = parseAndValidate(textInput);
        setParsedQuestions(data);
        setValidationErrors(errors);

        if (data.length === 0 && errors.length === 0) {
             setGeneralError('Could not parse any questions. Please check the format.');
        } else if (errors.length > 0) {
            setGeneralError('Please fix the validation errors shown below.');
        } else {
            setGeneralError('');
            setView('preview'); // On success, switch to preview view
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parsedQuestions),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'An unknown server error occurred.');
            alert(`Successfully added ${parsedQuestions.length} questions!`);
            onSuccess();
            onClose();
        } catch (error: any) {
            alert(`Submission Failed:\n${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-panel bg-white w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl" onClick={(e) => e.stopPropagation()}>
                {/* EDITING VIEW */}
                {view === 'edit' && (
                    <>
                        <header className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-800">Bulk Add Questions</h2>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><i className="ri-close-line text-xl"></i></button>
                        </header>
                        <main className="flex-1 flex flex-col md:flex-row p-6 gap-6 overflow-hidden">
                            <div className="w-full md:w-1/2 flex flex-col gap-4">
                                <div>
                                    <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-1">Paste Question Data Here</label>
                                    <textarea id="text-input" value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder={'--- \n* key: value\n---'} className="w-full h-48 p-2 border border-gray-300 rounded-md shadow-sm font-mono text-sm custom-scrollbar" />
                                </div>
                                <div className="bg-gray-50 p-3 rounded-md border text-xs flex-1 flex flex-col">
                                    <h4 className="font-semibold text-gray-700 mb-2">Required Format:</h4>
                                    <pre className="overflow-auto custom-scrollbar bg-white p-2 rounded flex-1">{requiredFormat}</pre>
                                </div>
                            </div>
                            <div className="w-full md:w-1/2 flex flex-col bg-gray-50 rounded-lg border">
                                <div className="p-4 border-b"><h3 className="font-semibold">Validation Status</h3></div>
                                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                                    {generalError && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm font-medium mb-4">{generalError}</div>}
                                    {validationErrors.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="font-bold text-red-600 mb-2">Validation Errors:</h4>
                                            <ul className="space-y-2 text-sm">
                                                {validationErrors.map((err, i) => <li key={i} className="p-2 bg-red-50 border-l-4 border-red-400"><span className="font-semibold">Question #{err.questionIndex}:</span> {err.message}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </main>
                        <footer className="p-6 border-t flex justify-end gap-4">
                            <button type="button" onClick={onClose} className="btn bg-white text-gray-700 font-semibold px-6 py-2 rounded-lg border">Cancel</button>
                            <button onClick={handleValidation} className="btn bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md">
                                Validate & Preview
                            </button>
                        </footer>
                    </>
                )}

                {/* PREVIEW VIEW */}
                {view === 'preview' && (
                     <>
                        <header className="p-6 border-b border-gray-200 bg-white flex-shrink-0 flex justify-between items-center sticky top-0">
                            <h2 className="text-xl font-semibold text-gray-800">Preview Questions ({parsedQuestions.length})</h2>
                             <button onClick={() => setView('edit')} className="text-sm font-semibold text-blue-600 hover:underline">
                                <i className="ri-arrow-left-line align-middle"></i> Back to Edit
                            </button>
                        </header>
                        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4 bg-gray-50">
                            {parsedQuestions.map((q, index) => (
                                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                                    <p className="text-gray-700 whitespace-pre-wrap">{q.questionText}</p>
                                </div>
                            ))}
                        </main>
                        <footer className="p-6 border-t border-gray-200 bg-white flex-shrink-0 flex justify-end gap-4">
                            <button type="button" onClick={onClose} className="btn bg-white text-gray-700 font-semibold px-6 py-2 rounded-lg border">Cancel</button>
                            <button onClick={handleSubmit} disabled={isSubmitting} className="btn bg-green-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400">
                                {isSubmitting ? 'Submitting...' : `Confirm & Add to Database`}
                            </button>
                        </footer>
                    </>
                )}
            </div>
        </div>
    );
};

export default BulkAddModal;