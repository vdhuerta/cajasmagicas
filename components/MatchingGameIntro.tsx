
import React from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { speakText } from '../utils/tts';
import { AudioIcon } from './icons/AudioIcon';
import { PairsIcon } from './icons/PairsIcon';

interface MatchingGameIntroProps {
  onStart: () => void;
  onClose: () => void;
}

const MatchingGameIntro: React.FC<MatchingGameIntroProps> = ({ onStart, onClose }) => {
  const title = "El Desafío de la Memoria del Bosque";
  const story = "¡Los duendes traviesos han vuelto a hacer de las suyas! Han escondido las figuras mágicas bajo un manto de hojas encantadas. ¡Solo un explorador con una memoria de elefante puede encontrar todas las parejas y poner orden!";
  const instructions = "Tu misión es simple: voltea dos hojas a la vez para encontrar las figuras que son idénticas. ¡Concéntrate y recuerda dónde se esconde cada una!";

  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-60 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-lg md:max-w-2xl relative animate-fade-in-up text-center">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 transition z-10" aria-label="Cerrar"><CloseIcon /></button>
        
        <PairsIcon className="w-16 h-16 mx-auto text-amber-500 mb-4" />

        <div className="flex items-center justify-center gap-3 mb-3">
            <h2 className="text-3xl font-bold text-amber-800">{title}</h2>
        </div>
        
        <div className="flex items-start gap-3 mb-4">
          <p className="text-slate-600">{story}</p>
          <button onClick={() => speakText(story)} className="p-2 rounded-full hover:bg-amber-100 transition" aria-label={`Leer en voz alta: ${story}`}>
              <AudioIcon className="w-5 h-5 text-amber-700" />
          </button>
        </div>

        <div className="flex items-start gap-3 mb-8 p-3 bg-amber-50 rounded-lg">
          <p className="text-slate-700 font-semibold">{instructions}</p>
          <button onClick={() => speakText(instructions)} className="p-2 rounded-full hover:bg-amber-100 transition" aria-label={`Leer en voz alta: ${instructions}`}>
              <AudioIcon className="w-5 h-5 text-amber-700" />
          </button>
        </div>

        <button 
          onClick={onStart} 
          className="w-full px-6 py-4 bg-amber-500 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-amber-600 transition-transform transform hover:scale-105"
        >
          ¡Estoy listo!
        </button>

      </div>
      <style>{`@keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }`}</style>
    </div>
  );
};

export default MatchingGameIntro;
