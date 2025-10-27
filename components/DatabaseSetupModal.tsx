import React, { useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { WarningIcon } from './icons/WarningIcon';
import { ClipboardCopyIcon } from './icons/ClipboardCopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { supabase } from '../services/supabase';

interface DatabaseSetupModalProps {
  title: string;
  sqlScript: string;
  onClose: () => void;
}

const DatabaseSetupModal: React.FC<DatabaseSetupModalProps> = ({ title, sqlScript, onClose }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlScript.trim());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // FIX: Added a check for supabase to prevent runtime errors if it's null.
  // The link to Supabase will be disabled if the client is not available.
  const supabaseProjectId = supabase?.supabaseUrl.split('.')[0].replace('https://', '');
  const supabaseSqlUrl = supabaseProjectId ? `https://app.supabase.com/project/${supabaseProjectId}/sql` : '#';

  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-60 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-2xl relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 transition z-10" aria-label="Cerrar"><CloseIcon /></button>
        
        <div className="text-center">
            <WarningIcon className="w-16 h-16 mx-auto text-amber-500 mb-4" />
            <h2 className="text-3xl font-bold text-slate-800 mb-3">Configuración Requerida</h2>
            <p className="text-slate-600 mb-4">Para activar el <strong>Plan de Refuerzo</strong>, es necesario crear una tabla en tu base de datos para guardar el progreso de los estudiantes.</p>
        </div>

        <div className="space-y-4">
            <div>
                <h3 className="font-bold text-slate-700 mb-2">Paso 1: Copia el siguiente script SQL</h3>
                <div className="relative">
                    <pre className="bg-slate-800 text-white p-4 rounded-lg text-xs overflow-x-auto">
                        <code>{sqlScript.trim()}</code>
                    </pre>
                    <button onClick={handleCopy} className="absolute top-2 right-2 px-3 py-1.5 bg-slate-600 text-white text-xs font-semibold rounded-md hover:bg-slate-700 transition flex items-center gap-2">
                      {isCopied ? <><CheckIcon className="w-4 h-4 text-green-400"/> Copiado</> : <><ClipboardCopyIcon className="w-4 h-4"/> Copiar</>}
                    </button>
                </div>
            </div>

            <div>
                 <h3 className="font-bold text-slate-700 mb-2">Paso 2: Pega y ejecuta el script en Supabase</h3>
                 <p className="text-sm text-slate-600 mb-3">Ve al editor SQL de tu proyecto en Supabase, pega el código que copiaste y haz clic en "RUN".</p>
                 <a 
                    href={supabaseSqlUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => !supabaseProjectId && e.preventDefault()}
                    className={`inline-block w-full text-center px-6 py-3 bg-green-600 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-green-700 transition ${!supabaseProjectId ? 'opacity-50 cursor-not-allowed' : ''}`}
                 >
                    Abrir Editor SQL de Supabase
                 </a>
            </div>
             <div>
                 <h3 className="font-bold text-slate-700 mb-2">Paso 3: ¡Listo!</h3>
                 <p className="text-sm text-slate-600">Una vez que el script se haya ejecutado, cierra esta ventana e intenta generar el plan de refuerzo nuevamente.</p>
            </div>
        </div>

      </div>
      <style>{`@keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }`}</style>
    </div>
  );
};

export default DatabaseSetupModal;