"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  // This function will navigate the user to your new combined login/signup page.
  const navigateToJoinPage = () => {
    router.push('/join');
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 max-w-lg">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
          Master Your Exam Preparation
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          The ultimate platform for UPSC aspirants. Access practice questions, track your progress, and conquer the syllabus.
        </p>
        <button
          onClick={navigateToJoinPage}
          className="mt-8 btn bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Login or Sign Up
        </button>
      </div>
    </main>
  );
}
