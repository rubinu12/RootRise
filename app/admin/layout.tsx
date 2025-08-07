"use client";

import React from 'react';
import { useAuth } from '@/app/context/AuthContext';
import LoadingScreen from '@/components/common/LoadingScreen';
import { useRouter } from 'next/navigation';

// This is the error component for unauthorized users
const AccessDenied = () => {
    const router = useRouter();
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center px-4 bg-gray-50">
            <div className="text-5xl mb-4">
                <i className="ri-lock-2-line text-red-500"></i>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Access Denied</h1>
            <p className="mt-2 text-lg text-gray-600">You do not have permission to view this page.</p>
            <button
                onClick={() => router.push('/')}
                className="mt-6 btn bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-blue-700"
            >
                Go to Homepage
            </button>
        </div>
    );
};

// This layout component will wrap every page inside the /admin directory
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const { user, loading } = useAuth();

    // 1. While we're checking the user's role, show a loading screen.
    if (loading) {
        return <LoadingScreen />;
    }

    // 2. If the check is done and the user is NOT an admin, block access.
    if (!user || user.role !== 'admin') {
        return <AccessDenied />;
    }

    // 3. If the user IS a valid admin, show the requested page.
    return <>{children}</>;
}
