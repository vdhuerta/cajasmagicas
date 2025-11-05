import React from 'react';
import { ActivityLogEntry } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { StarIcon } from './icons/StarIcon';

const GamepadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h.01M12 12h.01M18 12h.01M7.5 16.5h.01M10.5 16.5h.01M13.5 16.5h.01M16.5 16.5h.01M12 18a2.25 2.25 0 002.25-2.25H9.75A2.25 2.25 0 0012 18z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h12A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6z" />
  </svg>
);
const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const CogIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5" />
  </svg>
);

const LOG_ICONS: Record<ActivityLogEntry['type'], React.ReactElement> = {
  game: <GamepadIcon className="w-6 h-6 text-sky-500" />,
  achievement: <StarIcon className="w-6 h-6 text-amber-500" />,
  win: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
  system: <CogIcon className="w-6 h-6 text-slate-500" />,
};

interface NotificationsLogProps {
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
  logs: ActivityLogEntry[];
}

const NotificationsLog: React.FC<NotificationsLogProps> = ({ isOpen, onClose, onClear, logs }) => {

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-slate-50 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">Registro de Actividad</h2>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 transition rounded-full hover:bg-slate-200" aria-label="Cerrar">
              <CloseIcon />
            </button>
          </div>

          <div className="flex-grow p-4 overflow-y-auto space-y-3">
            {logs.length > 0 ? logs.map(log => (
              <div key={log.id} className="flex items-start gap-3 p-2 bg-white rounded-lg shadow-sm">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100">
                  {LOG_ICONS[log.type]}
                </div>
                <div className="flex-grow">
                  <p className="text-sm text-slate-700">{log.message}</p>
                  <p className="text-xs text-slate-400">{formatTimestamp(log.timestamp)}</p>
                </div>
                {log.pointsEarned && (
                    <div className="ml-auto text-right">
                        <p className="font-bold text-green-600">+{log.pointsEarned}</p>
                        <p className="text-xs text-slate-400">puntos</p>
                    </div>
                )}
              </div>
            )) : (
                <div className="text-center text-slate-500 pt-10">
                    <p>¡Aún no ha pasado nada!</p>
                    <p>Juega un poco y aquí aparecerán tus acciones.</p>
                </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-200">
            <button 
                onClick={onClear}
                className="w-full px-4 py-2 bg-rose-500 text-white font-semibold rounded-lg shadow-md hover:bg-rose-600 transition disabled:bg-slate-300"
                disabled={logs.length <= 1}
            >
              Limpiar Registro
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationsLog;