"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';

const TopBar = () => {
    const headerRef = useRef<HTMLElement>(null);
    const { user, logout } = useAuth(); // Get the user and logout function
    const [isDropdownOpen, setDropdownOpen] = useState(false); // State to control dropdown visibility
    const dropdownRef = useRef<HTMLDivElement>(null);

    const userName = user?.name || 'User';

    // Effect for the shrinking header animation
    useEffect(() => {
        const header = headerRef.current;
        if (!header) return;
        const handleScroll = () => {
            if (window.scrollY > 20) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Effect to close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header ref={headerRef} className="header bg-white pt-4 pb-4 sticky top-0 z-50">
            <div className="max-w-[1300px] mx-auto px-8 flex justify-between items-center transition-all duration-300">
                <div className="flex items-center gap-3">
                    <img src="https://i.imgur.com/rE4017A.png" alt="Logo" className="w-9 h-9 logo-img transition-all duration-300" />
                    <span className="text-2xl logo-text" style={{ fontFamily: "'Playfair Display', serif" }}>Root & Rise</span>
                </div>

                <div className="flex items-center gap-6">
                    <div className="relative">
                        <i className="ri-search-line absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"></i>
                        <input type="text" placeholder="Search..." className="bg-gray-100 border border-gray-200 rounded-full py-2 pl-11 pr-4 text-sm w-80 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                    </div>
                    <button title="Notifications" className="text-gray-500 hover:text-gray-800 transition-colors">
                        <i className="ri-notification-3-line text-xl"></i>
                    </button>
                    
                    {/* --- NEW: Avatar Dropdown --- */}
                    <div className="relative" ref={dropdownRef}>
                        <button onClick={() => setDropdownOpen(!isDropdownOpen)} className="block w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-blue-400 transition-colors">
                            <img 
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=e8e8e8&color=333`}
                                alt="User Avatar" 
                            />
                        </button>
                        
                        {/* The Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <p className="font-bold text-sm truncate">{userName}</p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                </div>
                                <div className="mt-2 space-y-1">
                                    <Link href="/dashboard/settings" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <i className="ri-user-settings-line mr-2"></i>My Profile
                                    </Link>
                                    <Link href="/dashboard/bookmarks" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <i className="ri-bookmark-3-line mr-2"></i>My Bookmarks
                                    </Link>
                                     <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between">
                                        <span><i className="ri-moon-line mr-2"></i>Dark Mode</span>
                                        {/* Placeholder for a toggle switch */}
                                        <div className="w-8 h-4 bg-gray-200 rounded-full"></div>
                                    </button>
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-100">
                                    <button 
                                        onClick={logout} // This calls the logout function from AuthContext
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                                    >
                                        <i className="ri-logout-box-r-line mr-2"></i>Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <style jsx global>{`
                .header.scrolled { padding-top: 0.5rem; padding-bottom: 0.5rem; background-color: rgba(253, 253, 253, 0.85); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-bottom: 1px solid #f0f0f0; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
                .header.scrolled .logo-img { width: 2rem; height: 2rem; }
                .header.scrolled .logo-text { display: none; }
            `}</style>
        </header>
    );
};

export default TopBar;