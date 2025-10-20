import React from 'react';

export const ElfIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Face */}
    <circle cx="50" cy="60" r="30" fill="#fde4cf" />
    
    {/* Hat */}
    <path d="M 50,5 A 40,40 0 0,1 85,35 L 50,45 Z" fill="#22c55e" />
    <path d="M 50,5 A 40,40 0 0,0 15,35 L 50,45 Z" fill="#16a34a" />
    
    {/* Hat Band */}
    <rect x="15" y="35" width="70" height="10" fill="#facc15" />

    {/* Ears */}
    <path d="M 20,55 Q 5,50 15,70 Z" fill="#fde4cf" stroke="#e7c5a8" strokeWidth="2" />
    <path d="M 80,55 Q 95,50 85,70 Z" fill="#fde4cf" stroke="#e7c5a8" strokeWidth="2" />

    {/* Eyes */}
    <circle cx="40" cy="60" r="3" fill="#333" />
    <circle cx="60" cy="60" r="3" fill="#333" />

    {/* Mouth */}
    <path d="M 45,72 Q 50,78 55,72" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
