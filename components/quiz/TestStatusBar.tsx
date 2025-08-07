"use client";

import React, { useEffect, useRef } from "react";
import { useQuiz } from "@/app/context/QuizContext";

// --- The Timer logic now lives here ---
const Timer = () => {
    const { totalTime, timeLeft, setTimeLeft, submitTest, showToast } = useQuiz();
    const notificationFlags = useRef({ half: false, ten: false, one: false });

    useEffect(() => {
        if (timeLeft <= 0) {
            submitTest();
            return;
        }

        const intervalId = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);

        // --- NEW: Notification Logic ---
        const halfTime = totalTime / 2;
        if (timeLeft <= halfTime && !notificationFlags.current.half) {
            showToast("Half of the time has passed!", "info");
            notificationFlags.current.half = true;
        }
        if (timeLeft <= 600 && !notificationFlags.current.ten) { // 10 minutes
            showToast("10 minutes remaining.", "warning");
            notificationFlags.current.ten = true;
        }
        if (timeLeft <= 60 && !notificationFlags.current.one) { // 1 minute
            showToast("1 minute remaining!", "warning");
            notificationFlags.current.one = true;
        }

        return () => clearInterval(intervalId);
    }, [timeLeft, setTimeLeft, submitTest, totalTime, showToast]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${h}:${m}:${s}`;
    };

    const timePercentage = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;
    let barColor = "bg-green-500";
    if (timePercentage < 50) barColor = "bg-yellow-500";
    if (timePercentage < 20) barColor = "bg-red-500";

    return (
        <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm w-64">
            <div className="flex justify-between items-center mb-1 px-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                    <i className="ri-timer-line text-green-500"></i>
                    Time Left
                </div>
                <span className={`font-bold text-lg ${barColor.replace("bg-", "text-")}`}>{formatTime(timeLeft)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className={`${barColor} h-1.5 rounded-full transition-all duration-1000 ease-linear`} style={{ width: `${timePercentage}%` }}></div>
            </div>
        </div>
    );
};


const TestStatusBar = () => {
    const { submitTest } = useQuiz();

    return (
        <div className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-gray-200 z-40">
            <div className="p-2 flex items-center justify-between max-w-screen-2xl mx-auto">
                <h2 className="text-lg font-bold text-gray-800">Test in Progress</h2>
                <div className="flex items-center gap-4">
                    <Timer />
                    <button onClick={submitTest} className="btn px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-sm hover:bg-red-700">Submit Test</button>
                </div>
            </div>
        </div>
    );
};

export default TestStatusBar;