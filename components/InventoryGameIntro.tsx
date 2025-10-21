import React from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { speakText } from '../utils/tts';
import { AudioIcon } from './icons/AudioIcon';
import { ToolsIcon } from './icons/ToolsIcon';

interface InventoryGameIntroProps {
  onStart: () => void;
  onClose: () => void;
}

const InventoryGameIntro: React.FC<InventoryGameIntroProps> = ({ onStart, onClose }) => {
  const title = "El Inventario del Duende";
  const story = "Un duende artesano muy ocupado necesita tu ayuda. Está construyendo inventos mágicos, ¡pero se le han mezclado todas las piezas! No puede empezar a construir hasta que tenga el número exacto de cada componente.";
  const instructions = "Tu misión es leer con atención el pedido del duende. Luego, busca en el montón las figuras que te pide, cuéntalas con cuidado y arrástralas a su cesta. ¡La precisión es la clave!";

  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-60 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-lg md:max-w-2xl relative animate-fade-in-up text-center">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 transition z-10" aria-label="Cerrar"><CloseIcon /></button>
        
        <ToolsIcon className="w-16 h-16 mx-auto text-lime-500 mb-4" />

        <div className="flex items-center justify-center gap-3 mb-3">
            <h2 className="text-3xl font-bold text-lime-800">{title}</h2>
        </div>
        
        <div className="flex items-start gap-3 mb-4">
          <p className="text-slate-600">{story}</p>
          <button onClick={() => speakText(story)} className="p-2 rounded-full hover:bg-lime-100 transition" aria-label={`Leer en voz alta: ${story}`}>
              <AudioIcon className="w-5 h-5 text-lime-700" />
          </button>
        </div>

        <div className="flex items-start gap-3 mb-8 p-3 bg-lime-50 rounded-lg">
          <p className="text-slate-700 font-semibold">{instructions}</p>
          <button onClick={() => speakText(instructions)} className="p-2 rounded-full hover:bg-lime-100 transition" aria-label={`Leer en voz alta: ${instructions}`}>
              <AudioIcon className="w-5 h-5 text-lime-700" />
          </button>
        </div>

        <button 
          onClick={onStart} 
          className="w-full px-6 py-4 bg-lime-500 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-lime-600 transition-transform transform hover:scale-105"
        >
          ¡A trabajar!
        </button>

      </div>
      <style>{`@keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }`}</style>
    </div>
  );
};

export default InventoryGameIntro;
