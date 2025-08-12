"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * A custom hook to track user inactivity.
 * @param onIdle - The callback function to execute when the user becomes idle.
 * @param idleTimeout - The duration in milliseconds after which the user is considered idle.
 */
export const useIdleTimer = (onIdle: () => void, idleTimeout: number) => {
    const [isIdle, setIsIdle] = useState(false);
    const timeoutId = useRef<NodeJS.Timeout | null>(null);

    const startTimer = useCallback(() => {
        // Set a timeout to call the onIdle function.
        timeoutId.current = setTimeout(() => {
            setIsIdle(true);
            onIdle();
        }, idleTimeout);
    }, [idleTimeout, onIdle]);

    const clearTimer = useCallback(() => {
        // Clear the timeout if it exists.
        if (timeoutId.current) {
            clearTimeout(timeoutId.current);
            timeoutId.current = null;
        }
    }, []);

    const handleEvent = useCallback(() => {
        // User is active, reset the idle state and the timer.
        setIsIdle(false);
        clearTimer();
        startTimer();
    }, [clearTimer, startTimer]);

    useEffect(() => {
        // Start the timer when the component mounts.
        startTimer();

        // List of events that indicate user activity.
        const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];

        // Add event listeners for all specified activity events.
        events.forEach(event => {
            window.addEventListener(event, handleEvent);
        });

        // Cleanup function to remove event listeners when the component unmounts.
        return () => {
            clearTimer();
            events.forEach(event => {
                window.removeEventListener(event, handleEvent);
            });
        };
    }, [handleEvent, startTimer, clearTimer]);

    return isIdle;
};