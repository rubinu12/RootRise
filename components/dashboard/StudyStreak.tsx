"use client";

import React from 'react';

const StudyStreak = () => {
    // --- Calendar Logic for August 2025 ---
    const year = 2025;
    const month = 7; // 0-indexed for August
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendarDays = [];
    // Add blank placeholders for days before the 1st
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push(<div key={`blank-${i}`}></div>);
    }
    // Add the actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        let dayClass = "h-9 w-9 flex items-center justify-center rounded-full text-sm";
        if (day === 4) { // Today's date
            dayClass += " bg-[#3d5a80] text-white font-bold";
        } else if (day === 2 || day === 3) { // Studied days
            dayClass += " bg-teal-100 text-teal-700";
        }
        calendarDays.push(<div key={day} className={dayClass}>{day}</div>);
    }

    return (
        <div className="card p-5">
            <h3 className="text-xl text-center mb-4">Study Streak</h3>
            <div className="flex justify-around mb-4 pt-2 pb-4 border-b border-gray-100">
                <div className="text-center">
                    <p className="text-sm text-gray-500">Current</p>
                    <p className="font-bold text-2xl text-teal-600">3 Days</p>
                </div>
                <div className="text-center">
                    <p className="text-sm text-gray-500">Longest</p>
                    <p className="font-bold text-2xl text-gray-800">14 Days</p>
                </div>
            </div>
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold">August 2025</h4>
                <div>
                    <button className="text-gray-500 hover:text-black p-1">
                        <i className="ri-arrow-left-s-line text-xl"></i>
                    </button>
                    <button className="text-gray-500 hover:text-black p-1">
                        <i className="ri-arrow-right-s-line text-xl"></i>
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-2 place-items-center">
                <div className="font-bold text-xs text-gray-400">Su</div>
                <div className="font-bold text-xs text-gray-400">Mo</div>
                <div className="font-bold text-xs text-gray-400">Tu</div>
                <div className="font-bold text-xs text-gray-400">We</div>
                <div className="font-bold text-xs text-gray-400">Th</div>
                <div className="font-bold text-xs text-gray-400">Fr</div>
                <div className="font-bold text-xs text-gray-400">Sa</div>
                {calendarDays}
            </div>
        </div>
    );
};

export default StudyStreak;