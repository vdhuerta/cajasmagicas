import React from 'react';

export const SpoonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M 50,5 C 30,5 20,20 20,40 C 20,65 50,95 50,95 C 50,95 80,65 80,40 C 80,20 70,5 50,5 Z"
      fill="currentColor"
      fillOpacity="0.8"
      stroke="currentColor"
      strokeOpacity="0.5"
      strokeWidth="3"
    />
    <ellipse cx="50" cy="40" rx="20" ry="25" fill="currentColor" opacity="0.5" />
  </svg>
);