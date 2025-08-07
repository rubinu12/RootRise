"use client";

import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'info' | 'warning';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // The toast will disappear after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';
  const icon = type === 'warning' ? 'ri-error-warning-line' : 'ri-information-line';

  return (
    <div className="fixed top-20 right-6 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-slide-in">
      <div className="flex items-center p-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${bgColor}`}>
          <i className={icon}></i>
        </div>
        <div className="ml-4">
          <p className="font-semibold text-gray-800">{message}</p>
        </div>
        <button onClick={onClose} className="ml-6 text-gray-400 hover:text-gray-700">
          <i className="ri-close-line"></i>
        </button>
      </div>
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        }
      `}</style>
    </div>
  );
};

export default Toast;