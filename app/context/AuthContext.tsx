"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode, FC } from 'react';
import { useRouter } from 'next/navigation';
import { IUser } from '@/models/Users';
import { useIdleTimer } from '@/lib/hooks/useIdleTimer'; // --- NEW: Import our custom hook ---

// --- Type Definitions ---
interface AuthContextType {
    isAuthenticated: boolean;
    user: Omit<IUser, 'password'> | null;
    loading: boolean;
    fetchUser: () => void;
    logout: () => void;
}

// --- Create The Context ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- NEW: Define the inactivity timeout (e.g., 4 hours in milliseconds) ---
const IDLE_TIMEOUT =  4* 2 * 60 * 1000; 

// --- Create The Provider Component ---
export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<Omit<IUser, 'password'> | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchUser = async () => {
        try {
            const response = await fetch('/api/auth/me', { cache: 'no-store' }); 
            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Failed to fetch user:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            setUser(null);
            router.push('/join');
        }
    };

    // --- NEW: Use the idle timer hook ---
    // We pass the logout function as the callback to be executed when the user is idle.
    useIdleTimer(logout, IDLE_TIMEOUT);

    const value = {
        isAuthenticated: !!user,
        user,
        loading,
        fetchUser,
        logout,
    };
    
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// --- Create The Custom Hook ---
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};