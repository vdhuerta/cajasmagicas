import React, { useState, useEffect } from 'react';
import { UserProfile, PerformanceLog } from '../types';
import { fetchUserPerformanceLogs } from '../services/adminService';
import { CloseIcon } from './icons/CloseIcon';
import { ALL_ACHIEVEMENTS, GAME_NAME_TRANSLATIONS, LEVEL_NAME_TRANSLATIONS } from '../constants';

interface UserDetailsModalProps {
    user: UserProfile;
    onClose: () => void;
}

const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
};

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, onClose }) => {
    const [logs, setLogs] = useState<PerformanceLog[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(true);

    useEffect(() => {
        const loadLogs = async () => {
            try {
                const userLogs = await fetchUserPerformanceLogs(user.id);
                setLogs(userLogs);
            } catch (error) {
                console.error("Failed to fetch user logs", error);
            } finally {
                setIsLoadingLogs(false);
            }
        };
        loadLogs();
    }, [user.id]);

    const unlockedAchievements = ALL_ACHIEVEMENTS.filter(ach => user.unlockedAchievements?.[ach.id]);

    return (
        <div className="fixed inset-0 bg-slate-800 bg-opacity-70 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col animate-fade-in-up">
                <header className="p-4 border-b border-slate-200 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-xl font-bold text-slate-800">Detalles de {user.firstName} {user.lastName}</h3>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 transition rounded-full hover:bg-slate-200" aria-label="Cerrar"><CloseIcon /></button>
                </header>
                
                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    <div>
                        <h4 className="font-bold text-lg text-sky-700 mb-2">Información del Perfil</h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm bg-slate-50 p-4 rounded-lg">
                            <strong className="text-slate-500">Correo:</strong> <span className="text-slate-800">{user.email}</span>
                            <strong className="text-slate-500">Carrera:</strong> <span className="text-slate-800">{user.career}</span>
                            <strong className="text-slate-500">Puntaje:</strong> <span className="text-slate-800 font-semibold">{user.score.toLocaleString('es-ES')}</span>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-lg text-amber-700 mb-2">Logros Desbloqueados ({unlockedAchievements.length})</h4>
                        <div className="bg-amber-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                            {unlockedAchievements.length > 0 ? (
                                <ul className="list-disc list-inside text-sm text-amber-900 space-y-1">
                                    {unlockedAchievements.map(ach => <li key={ach.id}><strong>{ach.name}:</strong> {ach.description}</li>)}
                                </ul>
                            ) : <p className="text-slate-500 text-sm">Aún no ha desbloqueado logros.</p>}
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="font-bold text-lg text-emerald-700 mb-2">Historial de Desempeño</h4>
                        <div className="bg-emerald-50 p-2 rounded-lg max-h-80 overflow-y-auto">
                            {isLoadingLogs ? <p className="text-slate-500 text-sm text-center p-4">Cargando historial...</p> : (
                                logs.length > 0 ? (
                                    <ul className="space-y-2">
                                        {logs.map(log => (
                                            <li key={log.id} className="p-3 bg-white rounded-md shadow-sm">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-bold text-slate-800">{GAME_NAME_TRANSLATIONS[log.game_name] || log.game_name}</p>
                                                        <p className="text-sm text-slate-500">{LEVEL_NAME_TRANSLATIONS[log.level_name] || log.level_name.replace(/_/g, ' ')}</p>
                                                    </div>
                                                    <div className="text-right text-sm">
                                                        <p className="font-semibold">{formatTime(log.time_taken_ms)}</p>
                                                        <p className="text-rose-600">{log.incorrect_attempts} errores</p>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-400 mt-1">{new Date(log.created_at!).toLocaleString('es-ES')}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-slate-500 text-sm text-center p-4">No hay registros de desempeño.</p>
                            )}
                        </div>
                    </div>
                </div>

                <footer className="p-4 border-t border-slate-200 flex-shrink-0 text-right">
                    <button onClick={onClose} className="px-6 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition">Cerrar</button>
                </footer>
            </div>
             <style>{`@keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }`}</style>
        </div>
    );
};

export default UserDetailsModal;
