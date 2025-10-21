import React from 'react';
import { InventoryGameDifficulty } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { speakText } from '../utils/tts';
import { AudioIcon } from './icons/AudioIcon';

interface InventoryLevelModalProps {
  onSelectLevel: (difficulty: InventoryGameDifficulty) => void;
  onClose: () => void;
}

const levels: { name: InventoryGameDifficulty; description: string; colors: any }[] = [
    { name: 'Básico', description: 'Pedidos sencillos con una sola característica. ¡Perfecto para empezar!', colors: { bg: 'bg-green-500', hover: 'hover:bg-green-600', text: 'text-green-700' } },
    { name: 'Medio', description: 'Los pedidos se complican, pidiendo dos características a la vez.', colors: { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600', text: 'text-yellow-700' } },
    { name: 'Experto', description: '¡Un verdadero desafío! Pedidos con tres características. Solo para maestros artesanos.', colors: { bg: 'bg-red-500', hover: 'hover:bg-red-600', text: 'text-red-700' } },
];

const InventoryLevelModal: React.FC<InventoryLevelModalProps> = ({ onSelectLevel, onClose }) => {
  const modalTitle = "Elige la Dificultad";
  
  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-60 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-2xl relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 transition z-10" aria-label="Cerrar"><CloseIcon /></button>
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold text-sky-800">{modalTitle}</h2>
          <p className="text-slate-600 mt-2">¿Qué tan difícil será el trabajo de hoy?</p>
        </div>
        <div className="space-y-4">
          {levels.map((level) => (
            <div key={level.name} className="p-4 border rounded-xl flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-grow">
                    <div className="flex items-center gap-2">
                        <h3 className={`text-2xl font-bold ${level.colors.text}`}>{level.name}</h3>
                         <button onClick={() => speakText(level.name)} className="p-1 rounded-full hover:bg-slate-100 transition" aria-label={`Leer: ${level.name}`}>
                            <AudioIcon className={`w-5 h-5 ${level.colors.text}`} />
                         </button>
                    </div>
                    <p className="text-slate-600">{level.description}</p>
                </div>
                <button 
                    onClick={() => onSelectLevel(level.name)}
                    className={`w-full sm:w-auto px-8 py-3 ${level.colors.bg} ${level.colors.hover} text-white font-bold rounded-lg shadow-md transition-transform transform hover:scale-105`}
                >
                    Jugar
                </button>
            </div>
          ))}
        </div>
      </div>
       <style>{`@keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }`}</style>
    </div>
  );
};

export default InventoryLevelModal;
