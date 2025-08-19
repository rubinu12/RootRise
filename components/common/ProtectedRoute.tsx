// components/common/ProtectedRoute.tsx
"use client";

import React, { FC, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import LoadingScreen from './LoadingScreen';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // This effect will run whenever the loading or isAuthenticated state changes.
    
    // We wait until the initial loading is finished before making any decisions.
    if (!loading) {
      // If loading is done and the user is still not authenticated, then we redirect.
      if (!isAuthenticated) {
        router.replace('/join');
      }
    }
  }, [isAuthenticated, loading, router]);

  // --- THIS IS THE KEY ---
  // While the AuthContext is in its initial loading state, we must show a loading screen.
  // This prevents the component from rendering its children or redirecting prematurely.
  if (loading) {
    return <LoadingScreen />;
  }

  // If loading is finished and the user is authenticated, we can safely show the content.
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If loading is finished and the user is not authenticated,
  // we render nothing while the useEffect above handles the redirect.
  return <LoadingScreen />; // Showing LoadingScreen here prevents a "flash" of the old page.
};

export default ProtectedRoute;