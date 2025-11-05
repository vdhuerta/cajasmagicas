import React from 'react';

export const ConservationIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6 text-slate-400" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Wide beaker */}
    <path d="M5 20V9h8v11H5z" />
    <path d="M5 15h8" strokeDasharray="2 2"/>
    
    {/* Tall beaker */}
    <path d="M15 20V5h4v15h-4z" />
    <path d="M15 15h4" strokeDasharray="2 2"/>
  </svg>
);
