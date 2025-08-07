"use client";

import React, { FC, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import LoadingScreen from './LoadingScreen'; // A loading screen for a better UX

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // 1. While the AuthContext is checking for a token, we show a loading screen.
  //    This prevents a "flash" of the login page before redirecting.
  if (loading) {
    return <LoadingScreen />;
  }

  // 2. Once loading is complete, if the user is not authenticated, redirect them.
  if (!isAuthenticated) {
    // Using router.replace() is better for auth flows than router.push()
    // because it prevents the user from clicking the "back" button to a protected page.
    router.replace('/join');
    return null; // Return null while the redirect happens
  }

  // 3. If the user is authenticated, render the children (the protected page).
  return <>{children}</>;
};

export default ProtectedRoute;
