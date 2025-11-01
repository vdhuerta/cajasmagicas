import React, { useMemo } from 'react';
import { PerformanceLog, UserProfile } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { DocumentReportIcon } from './icons/DocumentReportIcon';
import { PEDAGOGICAL_KNOWLEDGE_BASE, GAME_NAME_TRANSLATIONS, LEVEL_NAME_TRANSLATIONS, GAME_SKILL_MAP } from '../constants';
import { StarIcon } from './icons/StarIcon';
import { WarningIcon } from './icons/WarningIcon';
import RadarChart from './RadarChart';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { LockIcon } from './icons/LockIcon';

interface PerformanceDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  performanceLogs: PerformanceLog[];
}

const MIN_SESSIONS_FOR_DASHBOARD = 5;

const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
};

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ isOpen, onClose, user, performanceLogs }) => {

    const analysisData = useMemo(() => {
        if (!performanceLogs || performanceLogs.length === 0) {
            return {
                totalSessions: 0,
                totalTimePlayed: '0m 0s',
                totalIncorrectAttempts: 0,
                skillPerformance: [],
                pedagogicalInsights: [],
                generalProgress: 0,
                completedActivitiesCount: 0,
                totalActivitiesCount: 0,
            };
        }

        const totalTimeMs = performanceLogs.reduce((acc, log) => acc + log.time_taken_ms, 0);
        const totalIncorrectAttempts = performanceLogs.reduce((acc, log) => acc + log.incorrect_attempts, 0);
        
        const skillData: Record<string, { totalIncorrect: number; count: number; totalItems: number }> = {};
        
        performanceLogs.forEach(log => {
            const skill = GAME_SKILL_MAP[log.game_name] || 'Otros';
            if (!skillData[skill]) {
                skillData[skill] = { totalIncorrect: 0, count: 0, totalItems: 0 };
            }
            skillData[skill].totalIncorrect += log.incorrect_attempts;
            skillData[skill].count += 1;
            skillData[skill].totalItems += log.total_items || 0;
        });

        const skillPerformance = Object.entries(skillData).map(([skill, data]) => ({
            label: skill,
            value: data.totalItems > 0 ? Math.max(0, (data.totalItems - data.totalIncorrect) / data.totalItems) : 0,
        }));

        const pedagogicalInsights: { skill: string; message: string; recommendation: string; type: 'strength' | 'consolidating' | 'opportunity' }[] = [];
        Object.entries(skillData).forEach(([skill, data]) => {
            const knowledge = PEDAGOGICAL_KNOWLEDGE_BASE[skill];
            if (knowledge && data.totalItems > 0) {
                const precision = (data.totalItems - data.totalIncorrect) / data.totalItems;
                
                if (precision >= 0.9) {
                    pedagogicalInsights.push({ skill, message: knowledge.feedbackRules.strength.message, recommendation: knowledge.feedbackRules.strength.recommendation, type: 'strength' });
                } else if (precision >= 0.6) {
                    pedagogicalInsights.push({ skill, message: knowledge.feedbackRules.consolidating.message, recommendation: knowledge.feedbackRules.consolidating.recommendation, type: 'consolidating' });
                } else {
                    pedagogicalInsights.push({ skill, message: knowledge.feedbackRules.opportunity.message, recommendation: knowledge.feedbackRules.opportunity.recommendation, type: 'opportunity' });
                }
            }
        });
        
        const completedActivitiesSet = new Set(performanceLogs.map(log => log.level_name));
        const totalTrackableActivities = Object.keys(LEVEL_NAME_TRANSLATIONS).filter(key => key !== 'classification_expert').length;
        // FIX: Explicitly type `activity` as `string` to resolve type inference issue.
        const completedTrackableCount = Array.from(completedActivitiesSet).filter((activity: string) => 
            Object.keys(LEVEL_NAME_TRANSLATIONS).includes(activity) && activity !== 'classification_expert'
        ).length;

        const generalProgress = totalTrackableActivities > 0 ? (completedTrackableCount / totalTrackableActivities) * 100 : 0;

        return {
            totalSessions: performanceLogs.length,
            totalTimePlayed: formatTime(totalTimeMs),
            totalIncorrectAttempts,
            skillPerformance,
            pedagogicalInsights,
            generalProgress,
            completedActivitiesCount: completedTrackableCount,
            totalActivitiesCount: totalTrackableActivities,
        };

    }, [performanceLogs]);
    
    const strengths = analysisData.pedagogicalInsights.filter(i => i.type === 'strength');
    const consolidating = analysisData.pedagogicalInsights.filter(i => i.type === 'consolidating');
    const opportunities = analysisData.pedagogicalInsights.filter(i => i.type === 'opportunity');

    if (!isOpen) return null;

    if (performanceLogs.length < MIN_SESSIONS_FOR_DASHBOARD) {
        return (
            <div className="fixed inset-0 bg-slate-800 bg-opacity-60 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col items-center text-center relative animate-fade-in-up p-8">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 transition z-10 rounded-full hover:bg-slate-200" aria-label="Cerrar">
                        <CloseIcon className="w-7 h-7"/>
                    </button>
                    <LockIcon className="w-16 h-16 text-slate-400 mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Panel de Desempeño Bloqueado</h2>
                    <p className="text-slate-600 mb-6">
                        Para desbloquear tu análisis de desempeño, necesitas jugar al menos {MIN_SESSIONS_FOR_DASHBOARD} partidas en distintos juegos. ¡Así tendremos suficientes datos para darte recomendaciones personalizadas!
                    </p>
                    <div className="w-full bg-slate-200 rounded-full h-4 mb-2">
                        <div 
                            className="bg-sky-500 h-4 rounded-full transition-all duration-500" 
                            style={{ width: `${(performanceLogs.length / MIN_SESSIONS_FOR_DASHBOARD) * 100}%` }}
                        ></div>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 mb-6">
                        {performanceLogs.length} de {MIN_SESSIONS_FOR_DASHBOARD} partidas completadas
                    </p>
                    <button 
                        onClick={onClose} 
                        className="w-full sm:w-auto px-8 py-3 bg-sky-500 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-sky-600 transition"
                    >
                        ¡A Jugar!
                    </button>
                </div>
                <style>{`
                    @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } 
                    .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
                `}</style>
            </div>
        );
    }
    
    return (
        <div className="fixed inset-0 bg-slate-800 bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col relative animate-fade-in-up">
                <div className="p-6 border-b border-slate-200 flex-shrink-0">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 transition z-10 rounded-full hover:bg-slate-200" aria-label="Cerrar">
                        <CloseIcon className="w-7 h-7"/>
                    </button>
                    <div className="flex items-center gap-3">
                        <DocumentReportIcon className="w-10 h-10 text-sky-600" />
                        <div>
                            <h2 className="text-2xl font-bold text-sky-800">Panel de Desempeño</h2>
                            <p className="text-slate-500">Resumen del progreso de {user?.firstName || 'del estudiante'}.</p>
                        </div>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto p-6 md:p-8">
                    <div className="max-w-4xl mx-auto w-full space-y-8">
                        {/* General Stats */}
                        <div>
                            <h3 className="text-xl font-bold text-slate-700 mb-4 text-center">Estadísticas Generales</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-sky-50 p-4 rounded-lg text-center">
                                    <strong className="block text-3xl text-sky-800">{analysisData.totalSessions}</strong>
                                    <span className="text-sm text-sky-700">Sesiones de Juego</span>
                                </div>
                                <div className="bg-amber-50 p-4 rounded-lg text-center">
                                    <strong className="block text-3xl text-amber-800">{analysisData.totalTimePlayed}</strong>
                                    <span className="text-sm text-amber-700">Tiempo Total</span>
                                </div>
                                <div className="bg-rose-50 p-4 rounded-lg text-center">
                                    <strong className="block text-3xl text-rose-800">{analysisData.totalIncorrectAttempts}</strong>
                                    <span className="text-sm text-rose-700">Intentos Incorrectos</span>
                                </div>
                            </div>
                        </div>

                        {/* Progress Meter */}
                        <div>
                            <h3 className="text-xl font-bold text-slate-700 mb-4 text-center">Avance General</h3>
                            <div className="bg-slate-100 p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-1 text-sm font-semibold text-slate-600">
                                    <span>{analysisData.completedActivitiesCount} de {analysisData.totalActivitiesCount} actividades completadas</span>
                                    <span>{Math.round(analysisData.generalProgress)}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-4">
                                    <div 
                                        className="bg-sky-500 h-4 rounded-full transition-all duration-500" 
                                        style={{ width: `${analysisData.generalProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Radar Chart */}
                        <div>
                            <h3 className="text-xl font-bold text-slate-700 mb-2 text-center">Rendimiento por Habilidad</h3>
                            <div className="flex items-center justify-center p-4 bg-slate-50 rounded-lg border">
                                <RadarChart data={analysisData.skillPerformance} size={450} />
                            </div>
                            <p className="text-sm text-slate-500 mt-2 text-center italic">
                                Cómo interpretar el gráfico: Cada eje representa una habilidad. Los puntos más alejados del centro indican un mejor desempeño en esa área.
                            </p>
                        </div>
                    
                        {/* Detailed Analysis & History */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xl font-bold text-slate-700 mb-2">Análisis Pedagógico</h3>
                                <div className="text-sm text-slate-600 mb-3">
                                    Se han detectado <strong className="text-green-700">{strengths.length}</strong> {strengths.length === 1 ? 'fortaleza' : 'fortalezas'}, <strong className="text-sky-700">{consolidating.length}</strong> {consolidating.length === 1 ? 'habilidad en consolidación' : 'habilidades en consolidación'} y <strong className="text-amber-700">{opportunities.length}</strong> {opportunities.length === 1 ? 'área de oportunidad' : 'áreas de oportunidad'}.
                                </div>
                                <div className="bg-slate-50 p-4 rounded-lg border space-y-4">
                                    {analysisData.pedagogicalInsights.length === 0 ? (
                                        <p className="text-center text-slate-500 p-4">No hay suficientes datos para generar un análisis detallado. ¡Sigue jugando!</p>
                                    ) : (
                                        <>
                                            {strengths.length > 0 && (
                                                <div className="space-y-3">
                                                    <h4 className="font-bold text-lg text-green-700">Fortalezas</h4>
                                                    {strengths.map(insight => (
                                                        <div key={insight.skill} className="flex items-start gap-3">
                                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-200 flex items-center justify-center mt-1"><StarIcon className="w-4 h-4 text-green-700"/></div>
                                                            <div>
                                                                <strong className="text-green-800">{insight.skill}</strong>
                                                                <p className="text-sm text-slate-600 mb-1">{insight.message}</p>
                                                                <p className="text-xs text-slate-500 italic"><span className="font-semibold">Recomendación:</span> {insight.recommendation}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {consolidating.length > 0 && (
                                                <div className="space-y-3">
                                                    <h4 className="font-bold text-lg text-sky-700">En Consolidación</h4>
                                                    {consolidating.map(insight => (
                                                        <div key={insight.skill} className="flex items-start gap-3">
                                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-200 flex items-center justify-center mt-1"><TrendingUpIcon className="w-4 h-4 text-sky-700"/></div>
                                                            <div>
                                                                <strong className="text-sky-800">{insight.skill}</strong>
                                                                <p className="text-sm text-slate-600 mb-1">{insight.message}</p>
                                                                <p className="text-xs text-slate-500 italic"><span className="font-semibold">Recomendación:</span> {insight.recommendation}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {opportunities.length > 0 && (
                                                <div className="space-y-3">
                                                    <h4 className="font-bold text-lg text-amber-700">Áreas de Oportunidad</h4>
                                                    {opportunities.map(insight => (
                                                        <div key={insight.skill} className="flex items-start gap-3">
                                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center mt-1"><WarningIcon className="w-4 h-4 text-amber-700"/></div>
                                                            <div>
                                                                <strong className="text-amber-800">{insight.skill}</strong>
                                                                <p className="text-sm text-slate-600 mb-1">{insight.message}</p>
                                                                <p className="text-xs text-slate-500 italic"><span className="font-semibold">Recomendación:</span> {insight.recommendation}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-700 mb-3">Historial de Actividades</h3>
                                <div className="bg-slate-50 p-3 rounded-lg border">
                                    <ul className="space-y-3">
                                        {performanceLogs.map(log => (
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
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
             <style>{`
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } 
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
             `}</style>
        </div>
    );
};

export default PerformanceDashboard;