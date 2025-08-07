"use client";

import React from 'react';

const QuickStart = () => {
    return (
        <div className="card p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Automated Revision Card */}
                <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-lg">
                    <h4 className="font-bold text-lg text-blue-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Automated Revision
                    </h4>
                    <p className="text-sm text-blue-800 mt-1">Topics you last studied over a week ago.</p>
                    <ul className="text-sm mt-3 space-y-2">
                        <li className="font-semibold text-gray-700">∙ Fundamental Rights</li>
                        <li className="font-semibold text-gray-700">∙ Indus Valley Civilization</li>
                    </ul>
                    <button 
                        className="mt-4 font-bold text-sm text-white py-2 px-4 rounded-md transition-colors" 
                        style={{ backgroundColor: '#3d5a80' }} 
                        onMouseOver={e => (e.currentTarget.style.backgroundColor = '#2f4561')}
                        onMouseOut={e => (e.currentTarget.style.backgroundColor = '#3d5a80')}
                    >
                        Start Revision Quiz
                    </button>
                </div>
                {/* Topper's Tip Card */}
                <div className="bg-gray-50/50 border border-dashed border-gray-300 p-5 rounded-lg">
                     <h4 className="font-bold text-lg mb-3 flex items-center text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
                        <i className="ri-lightbulb-flash-line text-yellow-500 mr-2"></i>Topper&apos;s Tip of the Day
                     </h4>
                     {/* FIX: Replaced " and ' with &quot; and &apos; */}
                     <p className="text-gray-700 italic leading-relaxed text-sm">&quot;Don&apos;t just read the newspaper, analyze it. For every piece of news, ask yourself: &apos;How can UPSC frame a question on this?&apos; This changes the way you study current affairs.&quot;</p>
                     <p className="text-right text-xs font-semibold text-gray-500 mt-3">- Tina Dabi (AIR 1, 2015)</p>
                </div>
            </div>
        </div>
    );
};

export default QuickStart;