import React from 'react';

export const RiverIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 4.5C5.25 3.672 4.578 3 3.75 3S2.25 3.672 2.25 4.5v15c0 .828.672 1.5 1.5 1.5s1.5-.672 1.5-1.5v-15z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 4.5c0-.828-.672-1.5-1.5-1.5s-1.5.672-1.5 1.5v15c0 .828.672 1.5 1.5 1.5s1.5-.672 1.5-1.5v-15z" />
  </svg>
);