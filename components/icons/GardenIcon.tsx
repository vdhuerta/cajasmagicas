import React from 'react';

export const GardenIcon: React.FC<{ className?: string }> = ({ className = "w-7 h-7" }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        {/* Flower */}
        <path d="M12 10C12 10 13 8 15 8C17 8 18 10 18 12C18 14 17 16 15 16C13 16 12 14 12 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="#fde047"/>
        <path d="M12 10C12 10 11 8 9 8C7 8 6 10 6 12C6 14 7 16 9 16C11 16 12 14 12 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="#fde047"/>
        <circle cx="12" cy="12" r="2" fill="#d97706" stroke="currentColor" strokeWidth="1.5"/>
        {/* Stem */}
        <path d="M12 16V22" stroke="#4d7c0f" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Leaves / Regletas */}
        <rect x="2" y="19" width="6" height="3" rx="1" fill="#ef4444" stroke="#ef4444" />
        <rect x="16" y="17" width="6" height="3" rx="1" fill="#3b82f6" stroke="#3b82f6" />
    </svg>
);