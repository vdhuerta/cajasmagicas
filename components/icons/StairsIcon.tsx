import React from 'react';

export const StairsIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 21V18h3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 18V15h3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 12v-3h3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V6h3" />
      {/* Dashed line for the missing step */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 3" d="M11 15v-3h3" />
    </svg>
);