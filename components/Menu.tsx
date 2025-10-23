
import React from 'react';
import { StarIcon } from './icons/StarIcon';
import { ClassificationIcon } from './icons/ClassificationIcon';
import { SeriationIcon } from './icons/SeriationIcon';
import { ConservationIcon } from './icons/ConservationIcon';
import { TrashIcon } from './icons/TrashIcon';
import { UserProfile } from '../types';

type NavigatableGame = 'classification-games' | 'achievements' | 'ranking';

interface MenuProps {
  onNavigate: (game: NavigatableGame) => void;
  onClearData: () => void;
  user: UserProfile | null;
}

const Menu: React.FC<MenuProps> = ({ onNavigate, onClearData, user }) => {
  return (
    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-30 animate-fade-in-down">
      <div className="py-2">
        <button
          onClick={() => onNavigate('classification-games')}
          className="w-full flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-sky-100 transition"
        >
          <ClassificationIcon />
          <span>Clasificación</span>
        </button>

        <button
          disabled
          className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 cursor-not-allowed"
        >
          <SeriationIcon />
          <span>Seriación</span>
          <span className="ml-auto text-xs font-semibold bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">Pronto</span>
        </button>
        
        <button
          disabled
          className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 cursor-not-allowed"
        >
          <ConservationIcon />
          <span>Conservación</span>
           <span className="ml-auto text-xs font-semibold bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">Pronto</span>
        </button>
        
        {user && (
          <>
            <div className="my-1 border-t border-slate-200"></div>

            <button
              onClick={() => onNavigate('achievements')}
              className="w-full flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-sky-100 transition"
            >
              <StarIcon className="w-6 h-6 text-sky-600" />
              <span>Logros</span>
            </button>

            <button
                onClick={() => onNavigate('ranking')}
                className="w-full flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-sky-100 transition"
            >
                <SeriationIcon className="w-6 h-6 text-sky-600" />
                <span>Ranking</span>
            </button>
            
            <div className="my-1 border-t border-slate-200"></div>

            <button
              onClick={onClearData}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition"
            >
              <TrashIcon className="w-6 h-6 text-red-600" />
              <span>Limpiar Datos</span>
            </button>
          </>
        )}
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