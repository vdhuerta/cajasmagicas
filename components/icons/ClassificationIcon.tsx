import React from 'react';

export const ClassificationIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6 text-sky-600" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="12" width="8" height="8" rx="1"></rect>
        <circle cx="16" cy="16" r="4"></circle>
        <polygon points="8 4 12 10 4 10 8 4"></polygon>
    </svg>
);
