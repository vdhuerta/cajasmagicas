import React from 'react';

const UserGroupIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962c.513-.513.43-1.503-.227-2.016a7.5 7.5 0 00-9.656 9.656c.513-.658 1.503-.74 2.016-.227m8.288-8.288A3 3 0 005.272 7.512c.658.513.74 1.503.227 2.016a7.5 7.5 0 009.656 9.656c-.513.658-1.503.74-2.016.227m-8.288-8.288a3 3 0 003.682-3.682m4.606 4.606a3 3 0 003.682-3.682" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
    </svg>
);

export default UserGroupIcon;
