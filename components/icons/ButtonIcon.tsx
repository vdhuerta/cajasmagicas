import React from 'react';
import { Holes } from '../../types';

interface ButtonIconProps {
  className?: string;
  holes?: Holes;
}

export const ButtonIcon: React.FC<ButtonIconProps> = ({ className, holes }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" stroke="currentColor" strokeOpacity="0.5" strokeWidth="4" fill="currentColor" fillOpacity="0.8" />
    {holes === Holes.Two && (
      <>
        <circle cx="35" cy="50" r="6" fill="currentColor" opacity="0.4" />
        <circle cx="65" cy="50" r="6" fill="currentColor" opacity="0.4" />
      </>
    )}
    {holes === Holes.Four && (
      <>
        <circle cx="35" cy="35" r="6" fill="currentColor" opacity="0.4" />
        <circle cx="65" cy="35" r="6" fill="currentColor" opacity="0.4" />
        <circle cx="35" cy="65" r="6" fill="currentColor" opacity="0.4" />
        <circle cx="65" cy="65" r="6" fill="currentColor" opacity="0.4" />
      </>
    )}
  </svg>
);
