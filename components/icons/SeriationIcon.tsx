import React from 'react';

export const SeriationIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6 text-sky-600" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="4" y="14" width="4" height="6" rx="1" />
        <rect x="10" y="10" width="4" height="10" rx="1" />
        <rect x="16" y="6" width="4" height="14" rx="1" />
    </svg>
);
