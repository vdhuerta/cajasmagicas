import React, { useState, useEffect, useMemo } from 'react';
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

    const summaryData = useMemo(() => {
        if (!logs || logs.length === 0) {
            return {
                totalSessions: 0,
                totalTimePlayed: '0m 0s',
                totalIncorrectAttempts: 0,
                generalProgress: 0,
                completedActivitiesCount: 0,
                totalActivitiesCount: Object.keys(LEVEL_NAME_TRANSLATIONS).filter(key => key !== 'classification_expert').length
            };
        }
    
        const totalTimeMs = logs.reduce((acc, log) => acc + log.time_taken_ms, 0);
        const totalIncorrectAttempts = logs.reduce((acc, log) => acc + log.incorrect_attempts, 0);
    
        const completedActivitiesSet = new Set(logs.map(log => log.level_name));
        const totalTrackableActivities = Object.keys(LEVEL_NAME_TRANSLATIONS).filter(key => key !== 'classification_expert').length;
        const completedTrackableCount = Array.from(completedActivitiesSet).filter((activity: string) => 
            Object.keys(LEVEL_NAME_TRANSLATIONS).includes(activity) && activity !== 'classification_expert'
        ).length;
        const generalProgress = totalTrackableActivities > 0 ? (completedTrackableCount / totalTrackableActivities) * 100 : 0;
    
        return {
            totalSessions: logs.length,
            totalTimePlayed: formatTime(totalTimeMs),
            totalIncorrectAttempts,
            generalProgress,
            completedActivitiesCount: completedTrackableCount,
            totalActivitiesCount: totalTrackableActivities
        };
    }, [logs]);

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
                        <h4 className="font-bold text-lg text-emerald-700 mb-2">Resumen de Desempeño</h4>
                        {isLoadingLogs ? (
                            <p className="text-slate-500 text-sm text-center p-4">Cargando resumen...</p>
                        ) : logs.length > 0 ? (
                            <div className="space-y-4 bg-emerald-50 p-4 rounded-lg">
                                {/* General Summary Boxes */}
                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div className="bg-white p-3 rounded-md shadow-sm">
                                        <p className="text-2xl font-bold text-sky-600">{summaryData.totalSessions}</p>
                                        <p className="text-xs text-slate-500 font-semibold">Sesiones de Juego</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-md shadow-sm">
                                        <p className="text-2xl font-bold text-sky-600">{summaryData.totalTimePlayed}</p>
                                        <p className="text-xs text-slate-500 font-semibold">Tiempo Total</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-md shadow-sm">
                                        <p className="text-2xl font-bold text-rose-600">{summaryData.totalIncorrectAttempts}</p>
                                        <p className="text-xs text-slate-500 font-semibold">Intentos Incorrectos</p>
                                    </div>
                                </div>
                                {/* General Progress Bar */}
                                <div>
                                    <div className="flex justify-between items-center mb-1 text-sm font-semibold">
                                        <span className="text-slate-700">Progreso General de Actividades</span>
                                        <span className="text-sky-700">{summaryData.completedActivitiesCount} / {summaryData.totalActivitiesCount}</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-4">
                                        <div 
                                            className="bg-sky-500 h-4 rounded-full transition-all duration-500" 
                                            style={{ width: `${summaryData.generalProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-emerald-50 p-4 rounded-lg">
                                <p className="text-slate-500 text-sm text-center">No hay registros de desempeño.</p>
                            </div>
                        )}
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