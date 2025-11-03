import React from 'react';

export const SnakeIcon: React.FC<{ className?: string }> = ({ className = "w-7 h-7" }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M6.6,12.2a2,2,0,0,1-2.8,0l-.5-.5a2,2,0,0,1,0-2.8l3-3a2,2,0,0,1,2.8,0l.5.5a2,2,0,0,1,0,2.8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9.4,15a2,2,0,0,1-2.8,0l-.5-.5a2,2,0,0,1,0-2.8l3-3a2,2,0,0,1,2.8,0l.5.5a2,2,0,0,1,0,2.8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12.2,17.8a2,2,0,0,1-2.8,0l-.5-.5a2,2,0,0,1,0-2.8l3-3a2,2,0,0,1,2.8,0l.5.5a2,2,0,0,1,0,2.8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15,20.6a2,2,0,0,1-2.8,0l-.5-.5a2,2,0,0,1,0-2.8l3-3a2,2,0,0,1,2.8,0l.5.5a2,2,0,0,1,0,2.8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M19,5a3,3,0,0,0-3-3,2.9,2.9,0,0,0-1.7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16.5,7.5a1,1,0,1,1,1-1A1,1,0,0,1,16.5,7.5Z" fill="currentColor"/>
    </svg>
);
