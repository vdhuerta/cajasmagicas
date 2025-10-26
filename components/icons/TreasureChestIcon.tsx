import React from 'react';

export const TreasureChestIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M5.25 3.75a.75.75 0 00-1.5 0v1.5c0 .414.336.75.75.75h15a.75.75 0 00.75-.75v-1.5a.75.75 0 00-1.5 0V4.5h-15V3.75z" />
    <path fillRule="evenodd" d="M20.25 7.5a.75.75 0 00-.75.75v6a.75.75 0 00.75.75h.75a.75.75 0 00.75-.75v-6a.75.75 0 00-.75-.75h-.75zM3.75 7.5a.75.75 0 00-.75.75v6c0 .414.336.75.75.75H4.5a.75.75 0 00.75-.75v-6A.75.75 0 004.5 7.5H3.75z" clipRule="evenodd" />
    <path d="M18.75 9.75a.75.75 0 00-1.5 0v4.5a.75.75 0 001.5 0v-4.5z" />
    <path fillRule="evenodd" d="M12.75 6a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0V6zM6 9.75A.75.75 0 016.75 9h10.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75v-4.5z" clipRule="evenodd" />
    <path d="M3.75 16.5A.75.75 0 014.5 15.75h15a.75.75 0 01.75.75v3a.75.75 0 01-.75.75H4.5a.75.75 0 01-.75-.75v-3z" />
  </svg>
);
