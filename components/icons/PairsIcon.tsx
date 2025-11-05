
import React from 'react';

export const PairsIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h8.25a2.25 2.25 0 012.25 2.25v8.25A2.25 2.25 0 0114.25 18H6a2.25 2.25 0 01-2.25-2.25V6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 15.75A2.25 2.25 0 017.5 18v-8.25a2.25 2.25 0 012.25-2.25h8.25a2.25 2.25 0 012.25 2.25v8.25a2.25 2.25 0 01-2.25 2.25H9.75z" />
    </svg>
);
