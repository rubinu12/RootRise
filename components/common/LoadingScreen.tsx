"use client";

import React, { useState, useEffect } from 'react';

// A custom hook for the typewriter effect
const useTypewriter = (text: string, speed: number = 50) => {
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        setDisplayText(''); // Reset text when a new quote is fetched
        let i = 0;
        const typingInterval = setInterval(() => {
            if (i < text.length) {
                setDisplayText(prevText => prevText + text.charAt(i));
                i++;
            } else {
                clearInterval(typingInterval);
            }
        }, speed);

        return () => {
            clearInterval(typingInterval);
        };
    }, [text, speed]);

    return displayText;
};

// The main LoadingScreen component
export default function LoadingScreen() {
    const [quote, setQuote] = useState("Loading...");
    const typedQuote = useTypewriter(quote);

    useEffect(() => {
        // Fetch a random quote from your API endpoint
        const fetchQuote = async () => {
            try {
                const response = await fetch('/api/quotes/random');
                const data = await response.json();
                if (data.success) {
                    setQuote(data.quote);
                } else {
                    // Provide a fallback quote in case the API fails
                    setQuote('"The best way to predict the future is to create it."');
                }
            } catch (error) {
                console.error("Failed to fetch quote:", error);
                setQuote('"The best way to predict the future is to create it."');
            }
        };

        fetchQuote();
    }, []);

    return (
        // This div creates the full-screen overlay
        <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col items-center justify-center p-4 transition-opacity duration-300">
            {/* The pulsing dots animation */}
            <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            
            {/* The container for the quote with the typewriter effect */}
            <p className="italic text-lg text-gray-700 mt-8 font-medium text-center max-w-xl">
                {typedQuote}
            </p>
        </div>
    );
}
