"use client";

import React, { useState, useEffect, FC, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';
import { SUBJECTS, TOPICS } from '@/lib/quizData';

// Define the structure of a question object for our form state
interface QuestionFormData {
    exam: string;
    year: number | string;
    paperQuestionNumber: number | string;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: string;
    subject: string;
    topic: string;
    difficulty: string;
    explanationText: string;
    explanationPDF?: string;
    image?: string;
}

const initialFormData: QuestionFormData = {
    exam: 'UPSC CSE',
    year: '',
    paperQuestionNumber: '',
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: '',
    subject: '',
    topic: '',
    difficulty: 'Medium',
    explanationText: '',
    explanationPDF: '',
    image: '',
};

interface QuestionEditorModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const QuestionEditorModal: React.FC<QuestionEditorModalProps> = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState<QuestionFormData>(initialFormData);
    const [availableTopics, setAvailableTopics] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // When the selected subject changes, update the list of available topics
    useEffect(() => {
        if (formData.subject && TOPICS[formData.subject]) {
            setAvailableTopics(TOPICS[formData.subject]);
            // Reset topic if it's not valid for the new subject
            if (!TOPICS[formData.subject].includes(formData.topic)) {
                setFormData(prev => ({ ...prev, topic: '' }));
            }
        } else {
            setAvailableTopics([]);
        }
    }, [formData.subject, formData.topic]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        // --- UPDATED VALIDATION LOGIC ---
        const isTopicRequired = formData.subject && formData.subject !== 'Misc.';
        if (!formData.questionText || !formData.subject || !formData.year || (isTopicRequired && !formData.topic)) {
            setError('Please fill all required fields: Question Text, Subject, Year, and Topic (unless Subject is Misc.).');
            setIsSubmitting(false);
            return;
        }

        try {
            const payload = {
                ...formData,
                year: Number(formData.year),
                paperQuestionNumber: Number(formData.paperQuestionNumber) || undefined,
            };

            const response = await fetch('/api/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Failed to add question.');
            }

            alert('Question added successfully!');
            onSuccess(); // Refresh the list on the main page
            onClose();   // Close the modal

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <form
                onSubmit={handleSubmit}
                className="modal-panel bg-white w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-6 border-b border-gray-200 flex-shrink-0 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Add New Question</h2>
                    <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                        <i className="ri-close-line text-xl"></i>
                    </button>
                </header>

                <main className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4">
                    {/* Row 1: Exam, Year, Paper No. */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InputField label="Exam" name="exam" value={formData.exam} onChange={handleInputChange} required />
                        <InputField label="Year" name="year" type="number" value={String(formData.year)} onChange={handleInputChange} required />
                        <InputField label="Paper Question No." name="paperQuestionNumber" type="number" value={String(formData.paperQuestionNumber)} onChange={handleInputChange} />
                    </div>

                    {/* Row 2: Question Text */}
                    <TextareaField label="Question Text" name="questionText" value={formData.questionText} onChange={handleInputChange} required rows={4} />

                    {/* Row 3: Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Option A" name="optionA" value={formData.optionA} onChange={handleInputChange} />
                        <InputField label="Option B" name="optionB" value={formData.optionB} onChange={handleInputChange} />
                        <InputField label="Option C" name="optionC" value={formData.optionC} onChange={handleInputChange} />
                        <InputField label="Option D" name="optionD" value={formData.optionD} onChange={handleInputChange} />
                    </div>

                    {/* Row 4: Subject, Topic, Correct Option */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <SelectField label="Subject" name="subject" value={formData.subject} onChange={handleInputChange} required>
                            <option value="">Select Subject</option>
                            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </SelectField>
                        {/* --- CHANGE HERE: Topic is now conditionally required --- */}
                        <SelectField 
                            label="Topic" 
                            name="topic" 
                            value={formData.topic} 
                            onChange={handleInputChange} 
                            disabled={!formData.subject || formData.subject === 'Misc.'}
                            required={formData.subject !== 'Misc.'}
                        >
                            <option value="">Select Topic</option>
                            {availableTopics.map(t => <option key={t} value={t}>{t}</option>)}
                        </SelectField>
                        <SelectField label="Correct Option" name="correctOption" value={formData.correctOption} onChange={handleInputChange}>
                            <option value="">Select Answer</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                        </SelectField>
                    </div>
                    
                    {/* Row 5: Explanation */}
                     <TextareaField label="Explanation" name="explanationText" value={formData.explanationText} onChange={handleInputChange} rows={4} />
                     
                     {/* Row 6: Extra Fields */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Image URL" name="image" value={formData.image || ''} onChange={handleInputChange} placeholder="https://example.com/image.png" />
                        <InputField label="Explanation PDF URL" name="explanationPDF" value={formData.explanationPDF || ''} onChange={handleInputChange} placeholder="https://example.com/doc.pdf" />
                     </div>

                    {error && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm font-medium">{error}</div>}
                </main>

                <footer className="p-6 border-t border-gray-200 flex-shrink-0 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="btn bg-white text-gray-700 font-semibold px-6 py-2 rounded-lg border border-gray-300">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="btn bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400">
                        {isSubmitting ? 'Saving...' : 'Save Question'}
                    </button>
                </footer>
            </form>
        </div>
    );
};

// Props for InputField, extends all standard HTML input attributes
interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

// Props for TextareaField, extends all standard HTML textarea attributes
interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
}

// Props for SelectField, extends all standard HTML select attributes
interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    children: React.ReactNode;
}

// Reusable Form Field Components with explicit types
const InputField: FC<InputFieldProps> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}{props.required && <span className="text-red-500">*</span>}</label>
        <input {...props} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
    </div>
);

const TextareaField: FC<TextareaFieldProps> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}{props.required && <span className="text-red-500">*</span>}</label>
        <textarea {...props} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 custom-scrollbar" />
    </div>
);

const SelectField: FC<SelectFieldProps> = ({ label, children, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}{props.required && <span className="text-red-500">*</span>}</label>
        <select {...props} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white">
            {children}
        </select>
    </div>
);

export default QuestionEditorModal;