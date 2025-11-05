import React from 'react';

export const ToolsIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.83-5.83M11.42 15.17L14.49 12.1 4.5 2.1l-1.5 1.5L8.25 9l-1.42 1.42a2.652 2.652 0 000 3.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12.1 14.49L15.17 11.42" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5l6-6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21l3.75-3.75" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 3l6 6" />
  </svg>
);
