"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from 'next/link';
import { useQuiz } from "@/app/context/QuizContext";
import { useAuth } from "@/app/context/AuthContext";
import ConfirmationModal from './ConfirmationModal';

const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean, onChange: (enabled: boolean) => void }) => (
    <button
        onClick={() => onChange(!enabled)}
        className={`${enabled ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors flex-shrink-0`}
    >
        <span className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
    </button>
);

const Header = () => {
    const {
        isTestMode, showReport, quizTitle, startTest, resetTest, isPageScrolled, showDetailedSolution,
        saveTestResult, questions, currentGroupInView, quizGroupBy, isTopBarVisible,
        setIsTopBarVisible, isGroupingEnabled, setIsGroupingEnabled
    } = useQuiz();
    const { user, logout } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const commandBarScrollRef = useRef<HTMLDivElement>(null);

    const sortedGroups = useMemo(() => {
        if (!quizGroupBy || !isGroupingEnabled) return [];
        const groups = [...new Set(questions.map(q => q[quizGroupBy]).filter(Boolean))] as (string | number)[];
        if (groups.length === 0) return [];
        const isNumeric = !isNaN(Number(groups[0]));
        return groups.sort((a, b) => isNumeric ? Number(b) - Number(a) : String(a).localeCompare(String(b)));
    }, [questions, quizGroupBy, isGroupingEnabled]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    useEffect(() => {
        const el = commandBarScrollRef.current;
        if (el) {
            const onWheel = (e: WheelEvent) => {
                if (e.deltaY === 0 || el.scrollWidth <= el.clientWidth) return;
                e.preventDefault();
                el.scrollTo({ left: el.scrollLeft + e.deltaY, behavior: 'auto' });
            };
            el.addEventListener('wheel', onWheel);
            return () => el.removeEventListener('wheel', onWheel);
        }
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

    const scrollToGroup = (groupName: string | number) => {
        const groupElement = document.getElementById(`group-${groupName}`);
        if (groupElement) {
            groupElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const userName = user?.name || 'User';

    return (
        <>
            <header className="relative z-30 flex-shrink-0">
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

                {!isTestMode && (
                    <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-200">
                         <div className="flex items-center justify-between max-w-full mx-auto px-6 h-[52px] gap-4">
                            <div className="flex items-center gap-4 flex-shrink-0">
                                {quizGroupBy === 'topic' && (
                                    <div className="flex items-center gap-2">
                                        <ToggleSwitch enabled={isGroupingEnabled} onChange={setIsGroupingEnabled} />
                                    </div>
                                )}
                                <div className={`font-semibold text-gray-600 transition-opacity duration-300 capitalize text-nowrap ${isPageScrolled ? 'opacity-100' : 'opacity-0'}`}>
                                   <b className="text-gray-900">{quizGroupBy === 'examYear' ? "Source" : quizGroupBy}:</b> {currentGroupInView}
                                </div>
                            </div>
                            
                            <div ref={commandBarScrollRef} className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap">
                                {isGroupingEnabled && sortedGroups.map(group => (
                                    <React.Fragment key={group}>
                                        <div className="border-l border-gray-300 h-4"></div>
                                        <button onClick={() => scrollToGroup(group)} className="text-gray-600 hover:text-blue-600 font-semibold px-2">{group}</button>
                                    </React.Fragment>
                                ))}
                            </div>

                            <button onClick={() => setIsTopBarVisible(prev => !prev)} className="text-gray-500 hover:text-gray-800 flex-shrink-0" title={isTopBarVisible ? "Hide header" : "Show header"}>
                                <i className={`ri-arrow-up-s-line text-2xl transition-transform duration-300 ${!isTopBarVisible ? 'rotate-180' : ''}`}></i>
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {isModalOpen && <ConfirmationModal onClose={() => setIsModalOpen(false)} onConfirmErase={resetTest} onConfirmSave={saveTestResult} />}
        </>
    );
};

export default Header;