import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, PerformanceLog } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { ALL_ACHIEVEMENTS, GAME_NAME_TRANSLATIONS, LEVEL_NAME_TRANSLATIONS, PEDAGOGICAL_KNOWLEDGE_BASE, GAME_SKILL_MAP } from '../constants';
import RadarChart from './RadarChart';
import { StarIcon } from './icons/StarIcon';
import { WarningIcon } from './icons/WarningIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { fetchUserPerformanceLogs } from '../services/adminService';


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

// Helper components copied from PerformanceDashboard
const MathSuggestions: React.FC<{ playedSeriationGames: Set<string> }> = ({ playedSeriationGames }) => {
    const suggestions = [];

    if (playedSeriationGames.has('seriation_growth-pattern')) {
        suggestions.push({
            title: "Pensamiento Funcional",
            content: "Ha practicado con 'patrones de crecimiento'. Esta es una introducción temprana al pensamiento funcional. La regla 'de dos en dos' que siguió (ej. 2, 4, 6...) es una función lineal, que en álgebra se escribe como `y = 2x`. ¡Está construyendo las bases para entender ecuaciones!"
        });
    }
    if (playedSeriationGames.has('seriation_descending')) {
        suggestions.push({
            title: "Relaciones Inversas",
            content: "Al ordenar de mayor a menor, está explorando una relación inversa. Esto es un precursor directo de funciones decrecientes. Por ejemplo, una serie como 10, 9, 8... puede ser representada por la función algebraica `y = 11 - x`, donde 'x' es la posición del elemento."
        });
    }
    if (playedSeriationGames.has('seriation_abc-pattern') || playedSeriationGames.has('color_snake_game')) {
        suggestions.push({
            title: "Identificación del Núcleo",
            content: "Identificar el 'núcleo' que se repite en una secuencia (ej. 'Rojo-Azul-Verde') es una habilidad algebraica clave. Ayuda a predecir elementos futuros (extrapolación) y a generalizar reglas, lo cual es fundamental para trabajar con variables."
        });
    }

    if (suggestions.length === 0) {
        return <p className="text-center text-slate-500 p-4 text-sm">El estudiante necesita jugar más juegos de Seriación para ver sugerencias matemáticas avanzadas.</p>;
    }

    return (
        <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-200 flex items-center justify-center mt-1"><LightbulbIcon className="w-4 h-4 text-violet-700"/></div>
                    <div>
                        <strong className="text-violet-800 text-sm">{suggestion.title}</strong>
                        <p className="text-xs text-slate-600">{suggestion.content}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

const getInsightsForCategory = (insights: any[]) => {
    const strengths = insights.filter(i => i.type === 'strength');
    const consolidating = insights.filter(i => i.type === 'consolidating');
    const opportunities = insights.filter(i => i.type === 'opportunity');
    
    return (
         <div className="bg-slate-50 p-4 rounded-lg border space-y-4">
            {insights.length === 0 ? (
                <p className="text-center text-slate-500 p-4 text-sm">No hay suficientes datos para esta categoría. El estudiante necesita jugar más.</p>
            ) : (
                <>
                    {strengths.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="font-bold text-base text-green-700">Fortalezas</h4>
                            {strengths.map(insight => (
                                <div key={insight.skill} className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-200 flex items-center justify-center mt-1"><StarIcon className="w-4 h-4 text-green-700"/></div>
                                    <div>
                                        <strong className="text-green-800 text-sm">{insight.skill}</strong>
                                        <p className="text-xs text-slate-600 mb-1">{insight.message}</p>
                                        <p className="text-xs text-slate-500 italic"><span className="font-semibold">Recomendación:</span> {insight.recommendation}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                     {consolidating.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="font-bold text-base text-sky-700">En Consolidación</h4>
                            {consolidating.map(insight => (
                                <div key={insight.skill} className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-200 flex items-center justify-center mt-1"><TrendingUpIcon className="w-4 h-4 text-sky-700"/></div>
                                    <div>
                                        <strong className="text-sky-800 text-sm">{insight.skill}</strong>
                                        <p className="text-xs text-slate-600 mb-1">{insight.message}</p>
                                        <p className="text-xs text-slate-500 italic"><span className="font-semibold">Recomendación:</span> {insight.recommendation}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {opportunities.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="font-bold text-base text-amber-700">Áreas de Oportunidad</h4>
                            {opportunities.map(insight => (
                                <div key={insight.skill} className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center mt-1"><WarningIcon className="w-4 h-4 text-amber-700"/></div>
                                    <div>
                                        <strong className="text-amber-800 text-sm">{insight.skill}</strong>
                                        <p className="text-xs text-slate-600 mb-1">{insight.message}</p>
                                        <p className="text-xs text-slate-500 italic"><span className="font-semibold">Recomendación:</span> {insight.recommendation}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, onClose }) => {
    const [logs, setLogs] = useState<PerformanceLog[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadLogs = async () => {
            setIsLoadingLogs(true);
            setError('');
            try {
                // Use the centralized admin service to fetch logs via the serverless function
                const data = await fetchUserPerformanceLogs(user.id);
                setLogs(data);
            } catch (error) {
                console.error("Failed to fetch user logs via service", error);
                setError("No se pudieron cargar los registros de desempeño del servidor.");
            } finally {
                setIsLoadingLogs(false);
            }
        };
        loadLogs();
    }, [user.id]);

    const unlockedAchievements = ALL_ACHIEVEMENTS.filter(ach => user.unlockedAchievements?.[ach.id]);

    const analysisData = useMemo(() => {
        if (!logs || logs.length === 0) {
            return {
                totalSessions: 0,
                totalTimePlayed: '0m 0s',
                totalIncorrectAttempts: 0,
                radarDatasets: [],
                classificationInsights: [],
                seriationInsights: [],
                generalProgress: 0,
                completedActivitiesCount: 0,
                totalActivitiesCount: Object.keys(LEVEL_NAME_TRANSLATIONS).filter(key => key !== 'classification_expert').length,
                playedSeriationGames: new Set<string>(),
            };
        }

        const totalTimeMs = logs.reduce((acc, log) => acc + log.time_taken_ms, 0);
        const totalIncorrectAttempts = logs.reduce((acc, log) => acc + log.incorrect_attempts, 0);
        
        const skillData: Record<string, { totalIncorrect: number; count: number; totalItems: number }> = {};
        
        logs.forEach(log => {
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

        const CLASSIFICATION_SKILLS = ['Clasificación', 'Memoria y Atención', 'Atención y Percepción', 'Conteo y Correspondencia'];
        const SERIATION_SKILLS = ['Seriación'];

        const classificationPerformanceData = skillPerformance.filter(s => CLASSIFICATION_SKILLS.includes(s.label));
        const seriationPerformanceData = skillPerformance.filter(s => SERIATION_SKILLS.includes(s.label));
        
        const radarDatasets = [
            { data: classificationPerformanceData, color: 'fill-sky-500/50', stroke: 'stroke-sky-700' },
            { data: seriationPerformanceData, color: 'fill-rose-500/50', stroke: 'stroke-rose-700' }
        ];

        const pedagogicalInsights: { skill: string; message: string; recommendation: string; type: 'strength' | 'consolidating' | 'opportunity' }[] = [];
        Object.entries(skillData).forEach(([skill, data]) => {
            const knowledge = PEDAGOGICAL_KNOWLEDGE_BASE[skill];
            if (knowledge && data.totalItems > 0) {
                const precision = (data.totalItems - data.totalIncorrect) / data.totalItems;
                if (precision >= 0.9) pedagogicalInsights.push({ skill, ...knowledge.feedbackRules.strength, type: 'strength' });
                else if (precision >= 0.6) pedagogicalInsights.push({ skill, ...knowledge.feedbackRules.consolidating, type: 'consolidating' });
                else pedagogicalInsights.push({ skill, ...knowledge.feedbackRules.opportunity, type: 'opportunity' });
            }
        });
        
        const classificationInsights = pedagogicalInsights.filter(i => CLASSIFICATION_SKILLS.includes(i.skill));
        const seriationInsights = pedagogicalInsights.filter(i => SERIATION_SKILLS.includes(i.skill));
        
        const completedActivitiesSet = new Set(logs.map(log => log.level_name));
        const totalTrackableActivities = Object.keys(LEVEL_NAME_TRANSLATIONS).filter(key => key !== 'classification_expert').length;
        const completedTrackableCount = Array.from(completedActivitiesSet).filter((activity: string) => 
            Object.keys(LEVEL_NAME_TRANSLATIONS).includes(activity) && activity !== 'classification_expert'
        ).length;

        const generalProgress = totalTrackableActivities > 0 ? (completedTrackableCount / totalTrackableActivities) * 100 : 0;
        
        const playedSeriationGames = new Set(
            logs
                .filter(log => SERIATION_SKILLS.includes(GAME_SKILL_MAP[log.game_name]))
                .map(log => log.level_name)
        );

        return {
            totalSessions: logs.length,
            totalTimePlayed: formatTime(totalTimeMs),
            totalIncorrectAttempts,
            radarDatasets,
            classificationInsights,
            seriationInsights,
            generalProgress,
            completedActivitiesCount: completedTrackableCount,
            totalActivitiesCount: totalTrackableActivities,
            playedSeriationGames,
        };
    }, [logs]);


    return (
        <div className="fixed inset-0 bg-slate-800 bg-opacity-70 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col animate-fade-in-up">
                <header className="p-4 border-b border-slate-200 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-xl font-bold text-slate-800">Detalles de {user.firstName} {user.lastName}</h3>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 transition rounded-full hover:bg-slate-200" aria-label="Cerrar"><CloseIcon /></button>
                </header>
                
                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                     {isLoadingLogs ? (
                         <div className="flex justify-center items-center h-full"><p className="text-slate-500 animate-pulse">Cargando datos de desempeño...</p></div>
                     ) : error ? (
                        <div className="text-center text-red-500 py-10"><p>{error}</p></div>
                     ) : logs.length === 0 ? (
                        <div className="text-center text-slate-500 py-10">
                            <h4 className="font-bold text-lg text-emerald-700 mb-2">Sin Registros de Desempeño</h4>
                            <p>Este estudiante aún no ha completado ninguna actividad.</p>
                        </div>
                     ) : (
                        <div className="space-y-8">
                            {/* Performance Summary */}
                             <div className="bg-white p-4 rounded-lg shadow-md border">
                                <h3 className="text-lg font-bold text-slate-700 mb-3 text-center">Resumen General</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <p className="text-2xl font-bold text-sky-600">{analysisData.totalSessions}</p>
                                        <p className="text-xs text-slate-500 font-semibold">Sesiones de Juego</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <p className="text-2xl font-bold text-sky-600">{analysisData.totalTimePlayed}</p>
                                        <p className="text-xs text-slate-500 font-semibold">Tiempo Total</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <p className="text-2xl font-bold text-rose-600">{analysisData.totalIncorrectAttempts}</p>
                                        <p className="text-xs text-slate-500 font-semibold">Errores Totales</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Radar Chart */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-700 mb-2 text-center">Rendimiento por Habilidad</h3>
                                <div className="flex items-center justify-center p-2 bg-slate-50 rounded-lg border">
                                    <RadarChart datasets={analysisData.radarDatasets} size={350} />
                                </div>
                                <div className="flex justify-center gap-4 mt-2 text-xs font-semibold">
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-sky-500/50 border border-sky-700"></div><span className="text-sky-800">Clasificación</span></div>
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-rose-500/50 border border-rose-700"></div><span className="text-rose-800">Seriación</span></div>
                                </div>
                            </div>
                        
                            {/* Pedagogical Analysis */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-700 mb-2">Análisis Pedagógico: Clasificación</h3>
                                    {getInsightsForCategory(analysisData.classificationInsights)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-700 mb-2">Análisis Pedagógico: Seriación</h3>
                                    {getInsightsForCategory(analysisData.seriationInsights)}
                                    
                                    <h3 className="text-lg font-bold text-slate-700 mb-2 mt-4">Sugerencias desde la Matemática</h3>
                                    <div className="bg-violet-50 p-4 rounded-lg border border-violet-200">
                                        <MathSuggestions playedSeriationGames={analysisData.playedSeriationGames} />
                                    </div>
                                </div>
                            </div>
                        </div>
                     )}
                </div>
            </div>
             <style>{`@keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }`}</style>
        </div>
    );
};

export default UserDetailsModal;