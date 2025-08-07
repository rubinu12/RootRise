"use client";

import React from 'react';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import TopBar from '@/components/dashboard/TopBar';
import MainNavbar from '@/components/dashboard/MainNavbar';
import QuickStart from '@/components/dashboard/QuickStart';
import StudyStreak from '@/components/dashboard/StudyStreak'; // Import the new component
import { useAuth } from '@/app/context/AuthContext';

// --- Placeholders for other sections ---
const DailyDoseSection = () => <div className="card p-6"><h3 className="text-2xl">Daily Dose Placeholder</h3></div>;
const MainsPromptSection = () => <div className="card p-6"><h3 className="text-2xl">Mains Prompt Placeholder</h3></div>;
const WidgetsSection = () => <div className="grid grid-cols-3 gap-4"><div className="card p-4 text-center">Widget</div><div className="card p-4 text-center">Widget</div><div className="card p-4 text-center">Widget</div></div>;
const SyllabusPerformanceSection = () => <div className="card p-6"><h3 className="text-2xl">Syllabus Performance Placeholder</h3></div>;


export default function DashboardPage() {
  const { user } = useAuth();
  const userName = user?.name ? user.name.split(' ')[0] : 'Aspirant';

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-[#fdfdfd]">
        <TopBar />
        <MainNavbar />
        
        <main className="max-w-[1300px] mx-auto px-8 w-full flex-1 mt-8">
            <div className="grid grid-cols-12 gap-8">

              {/* --- LEFT COLUMN --- */}
              <div className="col-span-12 lg:col-span-8 space-y-8">
                <section>
                  <h2 className="text-3xl mb-2">Welcome Back, {userName}!</h2>
                  <p className="text-gray-600 mb-6">Let's make today productive. Here's what we recommend:</p>
                  <QuickStart />
                </section>
                <DailyDoseSection />
                <SyllabusPerformanceSection />
              </div>

              {/* --- RIGHT COLUMN --- */}
              <div className="col-span-12 lg:col-span-4 space-y-8">
                {/* Use the imported StudyStreak component here */}
                <StudyStreak /> 
                <MainsPromptSection />
                <WidgetsSection />
              </div>
              
            </div>
        </main>
      </div>
      <style jsx global>{`
        .card { background-color: white; border-radius: 8px; border: 1px solid #f0f0f0; transition: all 0.3s ease; box-shadow: 0 4px 10px -8px rgba(0,0,0,0.08); }
        .card:hover { box-shadow: 0 10px 25px -10px rgba(0,0,0,0.1); transform: translateY(-4px); }
      `}</style>
    </ProtectedRoute>
  );
}