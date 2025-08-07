"use client";

import React, { useEffect } from 'react';

// --- Type Definitions ---
interface SelectionModalProps {
    title: string;
    items: (string | number)[];
    onClose: () => void;
}

// --- Helper Data ---
export const SUBJECTS: string[] = [
    "Polity", "Geo (Ind)", "Geo (World)", "Economics", 
    "A. History", "Med. History", "M. History", "A & C", 
    "Agriculture", "Env. & Eco.", "Sci. & Tech", "Misc."
];

export const YEARS: number[] = Array.from({ length: new Date().getFullYear() - 2010 }, (_, i) => new Date().getFullYear() - i);


// --- Modal Component (Defined as a standard function) ---
export default function SelectionModal({ title, items, onClose }: SelectionModalProps) {
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div 
                className="modal-panel bg-gray-100 w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-200 flex-shrink-0">
                    <h2 className="text-xl font-semibold text-center text-gray-800 tracking-wide">{title}</h2>
                </div>
                <div className="p-8 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-4 gap-6">
                        {items.map(item => (
                            <a
                                key={item}
                                href="#"
                                className="btn bg-white rounded-lg text-gray-700 flex items-center justify-center h-24 text-center p-3 font-medium transition-all duration-200 ease-in-out border border-gray-200 shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
                            >
                                <span className="break-words">{String(item)}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
