"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode, FC } from 'react';
import { useRouter } from 'next/navigation';
import { IUser } from '@/models/Users';

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

// --- Create The Provider Component ---
export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<Omit<IUser, 'password'> | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchUser = async () => {
        try {
            // --- CRUCIAL FIX: Added { cache: 'no-store' } ---
            // This forces the browser to make a fresh request to the server every time,
            // bypassing any client-side caches and ensuring our "Magic Key" check runs.
            const response = await fetch('/api/auth/me', { cache: 'no-store' }); 
            
            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            // FIX: Log the error and remove the unused variable.
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