import React from 'react';
import { StarIcon } from './icons/StarIcon';

type Game = 'home' | 'classification' | 'matching' | 'odd-one-out' | 'achievements';

interface MenuProps {
  onNavigate: (game: Game) => void;
}

const Menu: React.FC<MenuProps> = ({ onNavigate }) => {
  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-30 animate-fade-in-down">
      <div className="py-2">
        <button
          onClick={() => onNavigate('achievements')}
          className="w-full flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-sky-100 transition"
        >
          <StarIcon className="w-6 h-6 text-sky-600" />
          <span>Logros</span>
        </button>
      </div>
      <style>{`
        @keyframes fade-in-down { 
          from { opacity: 0; transform: translateY(-10px); } 
          to { opacity: 1; transform: translateY(0); } 
        } 
        .animate-fade-in-down { animation: fade-in-down 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Menu;