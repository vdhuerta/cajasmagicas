
import React from 'react';
import { DienesBlockType } from '../types';
import DienesBlock from './DienesBlock';
import { SparklesIcon } from './icons/SparklesIcon';

interface GameCardProps {
  block: DienesBlockType;
  isFlipped: boolean;
  onClick: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ block, isFlipped, onClick }) => {
  return (
    <div className="w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 perspective-1000" onClick={onClick}>
      <div
        className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Card Back */}
        <div className="absolute w-full h-full backface-hidden bg-rose-300 rounded-lg shadow-lg flex items-center justify-center cursor-pointer">
          <SparklesIcon className="w-12 h-12 text-white/70" />
        </div>
        {/* Card Front */}
        <div className="absolute w-full h-full backface-hidden bg-sky-100 rounded-lg shadow-lg flex items-center justify-center rotate-y-180">
          <DienesBlock block={block} />
        </div>
      </div>
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; }
      `}</style>
    </div>
  );
};

export default GameCard;