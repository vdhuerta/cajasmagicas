import React from 'react';

export const CuisenaireIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="2" y="18" width="4" height="4" rx="1" fill="#f87171" stroke="#f87171" />
        <rect x="7" y="14" width="4" height="8" rx="1" fill="#facc15" stroke="#facc15" />
        <rect x="12" y="10" width="4" height="12" rx="1" fill="#4ade80" stroke="#4ade80" />
        <rect x="17" y="6" width="4" height="16" rx="1" fill="#60a5fa" stroke="#60a5fa" />
    </svg>
);