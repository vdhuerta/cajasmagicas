

import React from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { speakText } from '../utils/tts';
import { AudioIcon } from './icons/AudioIcon';

interface GameIntroModalProps {
  onStart: () => void;
  onClose: () => void;
  title: string;
  story: string;
  instructions: string;
  buttonText: string;
  Icon: React.FC<{ className?: string }>;
  theme: {
    text: string;
    buttonBg: string;
    buttonHoverBg: string;
    iconText: string;
    bg: string;
    audioHover: string;
    audioText: string;
  };
  isCompleted: boolean;
}

const GameIntroModal: React.FC<GameIntroModalProps> = ({ onStart, onClose, title, story, instructions, buttonText, Icon, theme, isCompleted }) => {
  const finalButtonText = isCompleted ? '¿Quieres volver a Jugar?' : buttonText;

  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-60 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-lg md:max-w-2xl relative animate-fade-in-up text-center">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 transition z-10" aria-label="Cerrar"><CloseIcon /></button>
        
        <Icon className={`w-16 h-16 mx-auto ${theme.iconText} mb-4`} />

        <div className="flex items-center justify-center gap-3 mb-3">
            <h2 className={`text-3xl font-bold ${theme.text}`}>{title}</h2>
        </div>
        
        <div className="flex items-start gap-3 mb-4">
          <p className="text-slate-600 text-left">{story}</p>
          <button onClick={() => speakText(story)} className={`p-2 rounded-full ${theme.audioHover} transition`} aria-label={`Leer en voz alta: ${story}`}>
              <AudioIcon className={`w-5 h-5 ${theme.audioText}`} />
          </button>
        </div>

        <div className={`flex items-start gap-3 mb-8 p-3 ${theme.bg} rounded-lg`}>
          <p className="text-slate-700 font-semibold text-left">{instructions}</p>
          <button onClick={() => speakText(instructions)} className={`p-2 rounded-full ${theme.audioHover} transition`} aria-label={`Leer en voz alta: ${instructions}`}>
              <AudioIcon className={`w-5 h-5 ${theme.audioText}`} />
          </button>
        </div>

        <button 
          onClick={onStart} 
          className={`w-full px-6 py-4 ${theme.buttonBg} text-white font-bold text-lg rounded-xl shadow-lg ${theme.buttonHoverBg} transition-transform transform hover:scale-105`}
        >
          {finalButtonText}
        </button>

      </div>
      <style>{`@keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }`}</style>
    </div>
  );
};

export default GameIntroModal;