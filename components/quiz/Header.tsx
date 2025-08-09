"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import { useQuiz } from "@/app/context/QuizContext";
import { useAuth } from "@/app/context/AuthContext";
import ConfirmationModal from './ConfirmationModal';
import DynamicQuizCommandBar from './DynamicQuizCommandBar'; // Import our new smart component

const Header = () => {
    const {
        isTestMode, showReport, quizTitle, startTest, resetTest, showDetailedSolution,
        saveTestResult, quizGroupBy, isTopBarVisible, setIsTopBarVisible
    } = useQuiz();
    const { user, logout } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const getButton = () => {
        if (showDetailedSolution) {
            return (
                <>
                    <button onClick={saveTestResult} className="btn px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-sm hover:bg-gray-700">
                        Save for Later
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="btn px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 flex items-center">
                        <i className="ri-home-4-line mr-2"></i>
                        Dashboard
                    </button>
                </>
            );
        }
        if (showReport) return <button onClick={resetTest} className="btn px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700">Back to Dashboard</button>;
        if (isTestMode) return null;
        return <button onClick={startTest} className="btn px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm">Start Test</button>;
    };

    const userName = user?.name || 'User';

    return (
        <>
            <header className="relative z-30 flex-shrink-0">
                {/* This top bar logic remains unchanged */}
                <div className={`transition-all duration-300 ease-in-out ${!isTopBarVisible || isTestMode ? '-mt-[69px]' : 'mt-0'}`}>
                    <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between mx-auto h-[69px] px-6">
                        <div className="flex items-center gap-3">
                            <Link href="/dashboard" title="Go to Dashboard"><i className="ri-home-4-line text-xl text-gray-600"></i></Link>
                            <div>
                                <h1 className="text-md font-bold text-gray-800">{quizTitle}</h1>
                                <p className="text-xs text-gray-500 capitalize">{quizGroupBy === 'examYear' ? 'Subject Practice' : 'PYQ Practice'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                {getButton()}
                            </div>
                             {getButton() && <div className="h-6 w-px bg-gray-300"></div>}
                            <div className="relative" ref={dropdownRef}>
                                <button onClick={() => setDropdownOpen(!isDropdownOpen)} className="flex items-center gap-3 btn">
                                    <div className="text-right hidden sm:block">
                                        <p className="font-semibold text-sm text-gray-800">{userName}</p>
                                        <p className="text-xs text-gray-500 capitalize">{user?.role || 'Member'}</p>
                                    </div>
                                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=e8e8e8&color=333`} alt="User Avatar" className="w-10 h-10 rounded-full" />
                                </button>
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100">
                                        <div className="px-4 py-2 border-b border-gray-100 sm:hidden">
                                            <p className="font-bold text-sm truncate">{userName}</p>
                                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                        </div>
                                        <Link href="/dashboard/settings" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Profile</Link>
                                        <button className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Dark Mode</button>
                                        <button onClick={logout} className="w-full text-left block px-4 py-2 text-sm text-red-700 hover:bg-red-50">Logout</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- REFACTOR --- */}
                {/* The old, complex command bar logic is replaced with our new, smart component. */}
                <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-200">
                     <div className="flex items-center justify-between max-w-full mx-auto px-6 h-[52px] gap-4">
                        {/* The dynamic content is now handled by this single component */}
                        <DynamicQuizCommandBar />

                        {/* The hide/show button remains, ensuring existing functionality is intact. */}
                        {!isTestMode && (
                             <button onClick={() => setIsTopBarVisible(prev => !prev)} className="text-gray-500 hover:text-gray-800 flex-shrink-0" title={isTopBarVisible ? "Hide header" : "Show header"}>
                                <i className={`ri-arrow-up-s-line text-2xl transition-transform duration-300 ${!isTopBarVisible ? 'rotate-180' : ''}`}></i>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {isModalOpen && <ConfirmationModal onClose={() => setIsModalOpen(false)} onConfirmErase={resetTest} onConfirmSave={saveTestResult} />}
        </>
    );
};

export default Header;