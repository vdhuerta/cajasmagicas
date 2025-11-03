import React from 'react';

export const CuisenaireIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="2" y="18" width="4" height="4" rx="1" fill="#ef4444" stroke="#ef4444" />
        <rect x="7" y="14" width="4" height="8" rx="1" fill="#eab308" stroke="#eab308" />
        <rect x="12" y="10" width="4" height="12" rx="1" fill="#22c55e" stroke="#22c55e" />
        <rect x="17" y="6" width="4" height="16" rx="1" fill="#3b82f6" stroke="#3b82f6" />
    </svg>
);
