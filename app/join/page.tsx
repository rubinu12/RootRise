// app/join/page.tsx
"use client";

import React, { useState, FC, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// The FormInput component remains the same
interface FormInputProps {
    id: string;
    label: string;
    type: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
}

const FormInput: FC<FormInputProps> = ({ id, label, type, value, onChange, placeholder }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <input
            id={id}
            name={id}
            type={type}
            required
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
    </div>
);


export default function JoinPage() {
    const [isLoginView, setIsLoginView] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phoneNo: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            if (isLoginView) {
                await signInWithEmailAndPassword(auth, formData.email, formData.password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                const firebaseUser = userCredential.user;

                const response = await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        uid: firebaseUser.uid,
                        name: formData.name,
                        email: formData.email,
                        phoneNo: formData.phoneNo,
                        role: 'paid',
                    }),
                });

                if (!response.ok) {
                    const result = await response.json();
                    throw new Error(result.message || 'Failed to create user profile.');
                }
            }
            // --- FIX: ADDED THE REDIRECT BACK ---
            // On successful login or registration, navigate to the dashboard.
            router.push('/dashboard');

        } catch (err: any) {
            setError(err.message.replace('Firebase: ', ''));
            setIsLoading(false); // Only stop loading if there is an error.
        }
        // We remove the `finally` block so the loading screen stays active
        // until the page redirects.
    };

    return (
        <div className="min-h-screen flex bg-gray-50 relative">
            {/* The loading overlay remains the same */}
            {isLoading && (
                <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center">
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                        <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <p className="mt-4 text-gray-700 font-medium">Processing...</p>
                </div>
            )}

            {/* The rest of the JSX remains the same */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            {isLoginView ? 'Welcome Back!' : 'Create Your Account'}
                        </h1>
                        <p className="mt-2 text-gray-600">
                            {isLoginView
                                ? 'Log in to continue your journey.'
                                : 'Join us to start mastering the exams.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLoginView && (
                            <FormInput id="name" label="Full Name" type="text" value={formData.name} onChange={handleInputChange} placeholder="Your Name" />
                        )}

                        <FormInput id="email" label="Email Address" type="email" value={formData.email} onChange={handleInputChange} placeholder="you@example.com" />

                        {!isLoginView && (
                             <FormInput id="phoneNo" label="Phone Number" type="tel" value={formData.phoneNo} onChange={handleInputChange} placeholder="10-digit mobile number" />
                        )}

                        <FormInput id="password" label="Password" type="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" />

                        {error && (
                            <div className="text-red-600 text-sm text-center p-2 bg-red-50 rounded-md">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                        >
                            {isLoginView ? 'Log In' : 'Create Account'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        {isLoginView ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={() => { setIsLoginView(!isLoginView); setError(''); }} className="font-medium text-blue-600 hover:text-blue-500 ml-1">
                            {isLoginView ? 'Sign Up' : 'Log In'}
                        </button>
                    </p>
                </div>
            </div>

            <div className="hidden lg:flex w-1/2 bg-gray-800 items-center justify-center p-12">
                 <div className="text-center text-white">
                    <h2 className="text-4xl font-bold">Your Creative Space</h2>
                    <p className="mt-4 text-lg text-gray-300">This panel will be filled with tools to boost your preparation.</p>
                </div>
            </div>
        </div>
    );
}