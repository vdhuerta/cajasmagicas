
import React from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { InstallIcon } from './icons/InstallIcon';

// Specific icons for instructions
const ShareIosIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

const AddToHomeScreenIosIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const ThreeDotsIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
        <circle cx="5" cy="12" r="1" />
    </svg>
);


interface AddToHomeScreenModalProps {
  onClose: () => void;
}

const AddToHomeScreenModal: React.FC<AddToHomeScreenModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-60 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-4xl relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 transition z-10" aria-label="Cerrar"><CloseIcon /></button>
        
        <div className="text-center mb-6">
            <InstallIcon className="w-12 h-12 mx-auto text-sky-600 mb-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-sky-800">Instalar en tu Dispositivo</h2>
            <p className="text-slate-600 mt-2">Accede al Bosque Mágico con un solo toque desde tu pantalla de inicio.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* iOS Instructions */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h3 className="text-2xl font-bold text-slate-700 mb-4 text-center">Para iPhone y iPad</h3>
                <ol className="space-y-4">
                    <li className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">1</div>
                        <p className="text-slate-600">Abre esta página en el navegador <strong>Safari</strong>.</p>
                    </li>
                    <li className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">2</div>
                        <p className="flex items-center gap-2 text-slate-600">Toca el botón de <strong>Compartir</strong> <ShareIosIcon />.</p>
                    </li>
                    <li className="flex items-center gap-4">
                         <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">3</div>
                        <p className="flex items-center gap-2 text-slate-600">Busca y selecciona <strong>'Agregar a inicio'</strong> <AddToHomeScreenIosIcon />.</p>
                    </li>
                     <li className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">4</div>
                        <p className="text-slate-600">¡Listo! Ahora tendrás un acceso directo.</p>
                    </li>
                </ol>
            </div>

            {/* Android Instructions */}
            <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <h3 className="text-2xl font-bold text-green-800 mb-4 text-center">Para Android</h3>
                <ol className="space-y-4">
                    <li className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-200 flex items-center justify-center font-bold text-green-700">1</div>
                        <p className="text-slate-600">Abre esta página en el navegador <strong>Chrome</strong>.</p>
                    </li>
                    <li className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-200 flex items-center justify-center font-bold text-green-700">2</div>
                        <p className="flex items-center gap-2 text-slate-600">Toca el menú de los <strong>tres puntos</strong> <ThreeDotsIcon />.</p>
                    </li>
                    <li className="flex items-center gap-4">
                         <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-200 flex items-center justify-center font-bold text-green-700">3</div>
                        <p className="flex items-center gap-2 text-slate-600">Selecciona <strong>'Instalar aplicación'</strong>.</p>
                    </li>
                     <li className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-200 flex items-center justify-center font-bold text-green-700">4</div>
                        <p className="text-slate-600">Confirma y el juego aparecerá como una app más.</p>
                    </li>
                </ol>
            </div>
        </div>

        <div className="mt-8 text-center">
             <button 
              onClick={onClose} 
              className="w-full sm:w-auto px-8 py-3 bg-sky-500 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-sky-600 transition"
            >
              ¡Entendido!
            </button>
        </div>

      </div>
      <style>{`@keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }`}</style>
    </div>
  );
};

export default AddToHomeScreenModal;
