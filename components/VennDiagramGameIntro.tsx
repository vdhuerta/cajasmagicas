
import React from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { speakText } from '../utils/tts';
import { AudioIcon } from './icons/AudioIcon';
import { VennDiagramIcon } from './icons/VennDiagramIcon';

interface VennDiagramGameIntroProps {
  onStart: () => void;
  onClose: () => void;
}

const VennDiagramGameIntro: React.FC<VennDiagramGameIntroProps> = ({ onStart, onClose }) => {
  const title = "El Cruce Mágico";
  const story = "Dos arroyos mágicos fluyen por el bosque. Uno es el 'Arroyo de las Formas Circulares' y el otro es el 'Arroyo de las Cosas Azules'. ¡Donde se cruzan, forman una poza mágica!";
  const instructions = "Tu misión es arrastrar cada figura a su lugar correcto. Algunas van a un arroyo, otras al otro, ¡y las más especiales van justo en la poza donde se juntan los dos!";

  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-60 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-lg md:max-w-2xl relative animate-fade-in-up text-center">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 transition z-10" aria-label="Cerrar"><CloseIcon /></button>
        
        <VennDiagramIcon className="w-16 h-16 mx-auto text-cyan-500 mb-4" />

        <div className="flex items-center justify-center gap-3 mb-3">
            <h2 className="text-3xl font-bold text-cyan-800">{title}</h2>
        </div>
        
        <div className="flex items-start gap-3 mb-4">
          <p className="text-slate-600">{story}</p>
          <button onClick={() => speakText(story)} className="p-2 rounded-full hover:bg-cyan-100 transition" aria-label={`Leer en voz alta: ${story}`}>
              <AudioIcon className="w-5 h-5 text-cyan-700" />
          </button>
        </div>

        <div className="flex items-start gap-3 mb-8 p-3 bg-cyan-50 rounded-lg">
          <p className="text-slate-700 font-semibold">{instructions}</p>
          <button onClick={() => speakText(instructions)} className="p-2 rounded-full hover:bg-cyan-100 transition" aria-label={`Leer en voz alta: ${instructions}`}>
              <AudioIcon className="w-5 h-5 text-cyan-700" />
          </button>
        </div>

        <button 
          onClick={onStart} 
          className="w-full px-6 py-4 bg-cyan-500 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-cyan-600 transition-transform transform hover:scale-105"
        >
          ¡Vamos a explorar!
        </button>

      </div>
      <style>{`@keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }`}</style>
    </div>
  );
};

export default VennDiagramGameIntro;
