'use client';

import { useState, useEffect } from 'react';

const LoadingScreen = () => {
  const [quote, setQuote] = useState('');
  const [displayedQuote, setDisplayedQuote] = useState('');
  const [isTypingDone, setIsTypingDone] = useState(false);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await fetch('/api/quotes/random');
        const data = await response.json();
        if (data.success) {
          setQuote(data.quote);
        } else {
          throw new Error(data.error || "Failed to fetch quote.");
        }
      } catch (error) {
        console.error(error);
        setQuote("\"The expert in anything was once a beginner.\" - Anonymous");
      }
    };
    fetchQuote();
  }, []);

  useEffect(() => {
    if (quote) {
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < quote.length) {
          setDisplayedQuote(prev => prev + quote.charAt(i));
          i++;
        } else {
          clearInterval(typingInterval);
          setIsTypingDone(true);
        }
      }, 40);

      return () => clearInterval(typingInterval);
    }
  }, [quote]);

  return (
    <div className="h-screen bg-white flex flex-col items-center justify-center p-8">
       <style jsx>{`
        .blinking-cursor {
          font-weight: 100;
          font-size: 1.5rem; /* Adjusted for aesthetics */
          color: #1E293B;
          animation: 1s blink step-end infinite;
        }
        @keyframes blink {
          from, to { color: transparent; }
          50% { color: #1E293B; }
        }
        .loading-dots {
          text-align: center;
          margin-top: 1.5rem;
        }
        .loading-dots span {
          animation: blink-dots 1.4s infinite both;
          font-size: 2rem;
          color: #3B82F6;
        }
        .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink-dots {
          0%, 80%, 100% { opacity: 0; }
          40% { opacity: 1; }
        }
      `}</style>
      <div className="max-w-3xl text-center">
        <p className="text-xl text-gray-700 font-serif italic">
          {displayedQuote}
          {!isTypingDone && <span className="blinking-cursor">|</span>}
        </p>
        {isTypingDone && (
          <div className="loading-dots">
            <span>.</span><span>.</span><span>.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
