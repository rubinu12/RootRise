// app/context/AuthContext.tsx
"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode, FC } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { IUser } from '@/models/Users';
import { useIdleTimer } from '@/lib/hooks/useIdleTimer';

// --- Type Definitions ---
interface AuthContextType {
    isAuthenticated: boolean;
    user: IUser | null;
    loading: boolean;
    logout: () => void;
}

// --- Create The Context ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const IDLE_TIMEOUT = 4 * 60 * 60 * 1000; // 4 hours

// --- Create The Provider Component ---
export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    
                    // --- THIS IS THE FIX FOR THE TYPESCRIPT ERROR ---
                    // Explicitly create the user object to satisfy TypeScript
                    // and correctly convert Firestore Timestamps to JS Dates.
                    const userProfile: IUser = {
                        uid: firebaseUser.uid,
                        name: userData.name,
                        email: userData.email,
                        phoneNo: userData.phoneNo,
                        role: userData.role,
                        createdAt: (userData.createdAt as Timestamp)?.toDate(),
                        lastLogin: (userData.lastLogin as Timestamp)?.toDate(),
                        profilePicture: userData.profilePicture,
                        targetExamYear: userData.targetExamYear,
                    };
                    setUser(userProfile);
                    // --- END OF FIX ---

                } else {
                    console.error("User document not found in Firestore for UID:", firebaseUser.uid);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            setUser(null);
            router.push('/join');
        }
    };

    useIdleTimer(logout, IDLE_TIMEOUT);

    const value = {
        isAuthenticated: !!user,
        user,
        loading,
        logout,
    };
    
    // This prevents the redirect loop by waiting for the initial auth check.
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
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