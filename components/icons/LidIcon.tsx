import React from 'react';

export const LidIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="40" width="80" height="20" rx="5" fill="currentColor" fillOpacity="0.8" stroke="currentColor" strokeOpacity="0.5" strokeWidth="3" />
    <path d="M 20,40 Q 50,25 80,40" fill="currentColor" fillOpacity="0.8" stroke="currentColor" strokeOpacity="0.5" strokeWidth="3" />
  </svg>
);
