import React from 'react';

export const TrophyIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9 9 0 119 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.75v1.5a2.25 2.25 0 01-4.5 0v-1.5m3.75 18.75h.008v.008h-.008v-.008zm-3.75 0h.008v.008h-.008v-.008z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7.5h6M7.5 12h9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-3.375c0-.621.504-1.125 1.125-1.125h.041c.621 0 1.125.504 1.125 1.125V21" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-3.375c0-.621-.504-1.125-1.125-1.125h-.041c-.621 0-1.125.504-1.125 1.125V21" />
  </svg>
);