import React from 'react';

export const KiteIcon: React.FC<{ className?: string }> = ({ className = "w-7 h-7" }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 2L2 12L12 22L22 12L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" fill="currentColor" fillOpacity="0.2"/>
        <path d="M12 2V22" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
        <path d="M2 12H22" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
);
