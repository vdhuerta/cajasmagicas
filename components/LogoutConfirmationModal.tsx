
import React from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { WarningIcon } from './icons/WarningIcon';

interface LogoutConfirmationModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({ onConfirm, onCancel }) => {
  const title = "¡Espera un momento!";
  const message = "Si cierras tu sesión, tu progreso y logros quedarán guardados en este dispositivo, pero ya no estarán asociados a tu nombre. ¿Estás seguro de que quieres salir?";

  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-60 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md relative animate-fade-in-up text-center">
        <button onClick={onCancel} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 transition z-10" aria-label="Cancelar"><CloseIcon /></button>
        
        <WarningIcon className="w-16 h-16 mx-auto text-amber-500 mb-4" />

        <h2 className="text-3xl font-bold text-slate-800 mb-3">{title}</h2>
        
        <p className="text-slate-600 mb-8">{message}</p>

        <div className="flex justify-center gap-4">
            <button 
              onClick={onCancel} 
              className="w-full px-6 py-3 bg-slate-200 text-slate-700 font-bold text-lg rounded-xl shadow-md hover:bg-slate-300 transition"
            >
              Cancelar
            </button>
            <button 
              onClick={onConfirm} 
              className="w-full px-6 py-3 bg-rose-500 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-rose-600 transition"
            >
              Sí, Salir
            </button>
        </div>

      </div>
      <style>{`@keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }`}</style>
    </div>
  );
};

export default LogoutConfirmationModal;
