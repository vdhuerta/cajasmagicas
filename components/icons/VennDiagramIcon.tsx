
import React from 'react';

export const VennDiagramIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <circle cx="9.5" cy="12" r="7" />
      <circle cx="14.5" cy="12" r="7" />
    </svg>
);
