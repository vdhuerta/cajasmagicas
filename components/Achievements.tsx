import React from 'react';
import { ALL_ACHIEVEMENTS } from '../constants';
import { StarIcon } from './icons/StarIcon';
import { LockIcon } from './icons/LockIcon';
import { speakText } from '../utils/tts';
import { AudioIcon } from './icons/AudioIcon';

interface AchievementsProps {
  unlockedAchievements: Record<string, boolean>;
}

const Achievements: React.FC<AchievementsProps> = ({ unlockedAchievements }) => {
  const unlockedCount = Object.values(unlockedAchievements).filter(Boolean).length;
  const totalCount = ALL_ACHIEVEMENTS.length;
  const title = "Salón de Logros del Bosque";

  return (
    <div className="flex flex-col items-center h-full p-4">
      <div className="flex items-center gap-3 mb-2">
        <StarIcon className="w-10 h-10 text-amber-500" />
        <h2 className="text-4xl font-bold text-center text-sky-800">{title}</h2>
      </div>
      <p className="text-slate-600 mb-6">
        Has desbloqueado <strong>{unlockedCount}</strong> de <strong>{totalCount}</strong> logros. ¡Sigue explorando!
      </p>

      <div className="w-full max-w-4xl overflow-y-auto bg-white/50 p-4 rounded-xl shadow-inner">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_ACHIEVEMENTS.map(achievement => {
            const isUnlocked = unlockedAchievements[achievement.id];
            return (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg flex items-start gap-4 transition-all duration-300
                  ${isUnlocked
                    ? 'bg-amber-50 border-2 border-amber-300 shadow-md'
                    : 'bg-slate-100 border-2 border-slate-200 opacity-70'
                  }`}
              >
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                  ${isUnlocked ? 'bg-amber-400' : 'bg-slate-300'}
                `}>
                  {isUnlocked
                    ? <StarIcon className="w-8 h-8 text-white" />
                    : <LockIcon className="w-7 h-7 text-slate-500" />
                  }
                </div>
                <div className="flex-grow">
                  <h3 className={`font-bold ${isUnlocked ? 'text-amber-800' : 'text-slate-600'}`}>
                    {achievement.name}
                  </h3>
                  <p className="text-sm text-slate-500">{achievement.description}</p>
                </div>
                <button 
                  onClick={() => speakText(`${achievement.name}. ${achievement.description}`)}
                  className={`p-1 rounded-full self-start ${isUnlocked ? 'hover:bg-amber-200' : 'hover:bg-slate-200'}`}
                  aria-label={`Leer: ${achievement.name}`}
                >
                  <AudioIcon className={`w-5 h-5 ${isUnlocked ? 'text-amber-700' : 'text-slate-500'}`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Achievements;