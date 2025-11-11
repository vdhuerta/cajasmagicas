import React, { useMemo } from 'react';
import { PerformanceLog, UserProfile } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { DocumentReportIcon } from './icons/DocumentReportIcon';
import { PEDAGOGICAL_KNOWLEDGE_BASE, GAME_NAME_TRANSLATIONS, LEVEL_NAME_TRANSLATIONS, GAME_SKILL_MAP, LEVEL_SKILL_MAP, CLASSIFICATION_SKILLS, SERIATION_SUB_SKILLS } from '../constants';
import { StarIcon } from './icons/StarIcon';
import { WarningIcon } from './icons/WarningIcon';
import RadarChart from './RadarChart';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { LockIcon } from './icons/LockIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';

interface PerformanceDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  performanceLogs: PerformanceLog[];
}

const MIN_SESSIONS_FOR_DASHBOARD = 5;

const formatTime = (ms: number): string => {
    if (ms < 1000) {
        return `${Math.round(ms / 100) / 10}s`;
    }
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes === 0) {
        return `${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
};

const MathSuggestions: React.FC<{ playedSeriationGames: Set<string> }> = ({ playedSeriationGames }) => {
    const suggestions = [];

    if (playedSeriationGames.has('seriation_growth-pattern')) {
        suggestions.push({
            title: "Pensamiento Funcional",
            content: "Has practicado con 'patrones de crecimiento'. Esta es una introducción temprana al pensamiento funcional. La regla 'de dos en dos' que seguiste (ej. 2, 4, 6...) es una función lineal, que en álgebra se escribe como `y = 2x`. ¡Estás construyendo las bases para entender ecuaciones!"
        });
    }
    if (playedSeriationGames.has('seriation_descending')) {
        suggestions.push({
            title: "Relaciones Inversas",
            content: "Al ordenar de mayor a menor, estás explorando una relación inversa. Esto es un precursor directo de funciones decrecientes. Por ejemplo, una serie como 10, 9, 8... puede ser representada por la función algebraica `y = 11 - x`, donde 'x' es la posición del elemento. ¡Es álgebra sin que te des cuenta!"
        });
    }
    if (playedSeriationGames.has('seriation_abc-pattern') || playedSeriationGames.has('color_snake_game')) {
        suggestions.push({
            title: "Identificación del Núcleo",
            content: "Identificar el 'núcleo' que se repite en una secuencia (ej. 'Rojo-Azul-Verde') es una habilidad algebraica clave. Te ayuda a predecir elementos futuros (extrapolación) y a generalizar reglas, lo cual es fundamental para trabajar con variables y expresiones algebraicas más adelante."
        });
    }

    if (suggestions.length === 0) {
        return <p className="text-center text-slate-500 p-4">Juega a más juegos de Seriación como 'Saltos de Gigante' o 'La Escalera Inversa' para desbloquear sugerencias matemáticas avanzadas.</p>;
    }

    return (
        <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-200 flex items-center justify-center mt-1"><LightbulbIcon className="w-4 h-4 text-violet-700"/></div>
                    <div>
                        <strong className="text-violet-800">{suggestion.title}</strong>
                        <p className="text-sm text-slate-600">{suggestion.content}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};


const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ isOpen, onClose, user, performanceLogs }) => {

    const analysisData = useMemo(() => {
        if (!performanceLogs || performanceLogs.length === 0) {
            return {
                totalSessions: 0,
                totalTimePlayed: '0m 0s',
                totalIncorrectAttempts: 0,
                radarDatasets: [],
                classificationInsights: [],
                seriationInsights: [],
                generalProgress: 0,
                completedActivitiesCount: 0,
                totalActivitiesCount: 0,
                playedSeriationGames: new Set<string>(),
                gameDetails: [],
            };
        }

        const totalTimeMs = performanceLogs.reduce((acc, log) => acc + log.time_taken_ms, 0);
        const totalIncorrectAttempts = performanceLogs.reduce((acc, log) => acc + log.incorrect_attempts, 0);
        
        const skillData: Record<string, { totalIncorrect: number; count: number; totalItems: number }> = {};
        
        performanceLogs.forEach(log => {
            const skill = LEVEL_SKILL_MAP[log.level_name] || GAME_SKILL_MAP[log.game_name] || 'Otros';
            if (!skillData[skill]) {
                skillData[skill] = { totalIncorrect: 0, count: 0, totalItems: 0 };
            }
            skillData[skill].totalIncorrect += log.incorrect_attempts;
            skillData[skill].count += 1;
            skillData[skill].totalItems += log.total_items || 0;
        });
        
        const classificationPerformanceData = CLASSIFICATION_SKILLS.map(skill => {
            const data = skillData[skill];
            const value = (data && data.totalItems > 0) ? Math.max(0, (data.totalItems - data.totalIncorrect) / data.totalItems) : 0;
            return { label: skill, value };
        });

        const seriationPerformanceData = SERIATION_SUB_SKILLS.map(skill => {
            const data = skillData[skill];
            const value = (data && data.totalItems > 0) ? Math.max(0, (data.totalItems - data.totalIncorrect) / data.totalItems) : 0;
            return { label: skill, value };
        });

        const radarDatasets = [
            { data: classificationPerformanceData, color: 'fill-sky-500/50', stroke: 'stroke-sky-700' },
            { data: seriationPerformanceData, color: 'fill-rose-500/50', stroke: 'stroke-rose-700' }
        ];

        const pedagogicalInsights: { skill: string; message: string; recommendation: string; type: 'strength' | 'consolidating' | 'opportunity' }[] = [];
        
        const allAnalyzedSkills = new Set([...CLASSIFICATION_SKILLS, ...SERIATION_SUB_SKILLS]);
        allAnalyzedSkills.forEach(skill => {
            const knowledge = PEDAGOGICAL_KNOWLEDGE_BASE[skill];
            if (knowledge) {
                const data = skillData[skill];
                const precision = (data && data.totalItems > 0) ? (data.totalItems - data.totalIncorrect) / data.totalItems : 0;
                
                if (precision >= 0.9) {
                    pedagogicalInsights.push({ skill, ...knowledge.feedbackRules.strength, type: 'strength' });
                } else if (precision >= 0.6) {
                    pedagogicalInsights.push({ skill, ...knowledge.feedbackRules.consolidating, type: 'consolidating' });
                } else {
                    pedagogicalInsights.push({ skill, ...knowledge.feedbackRules.opportunity, type: 'opportunity' });
                }
            }
        });
        
        const classificationInsights = pedagogicalInsights.filter(i => CLASSIFICATION_SKILLS.includes(i.skill));
        const seriationInsights = pedagogicalInsights.filter(i => SERIATION_SUB_SKILLS.includes(i.skill));
        
        const completedActivitiesSet = new Set(performanceLogs.map(log => log.level_name));
        const totalTrackableActivities = Object.keys(LEVEL_NAME_TRANSLATIONS).filter(key => key !== 'classification_expert').length;
        const completedTrackableCount = Array.from(completedActivitiesSet).filter((activity: string) => 
            Object.keys(LEVEL_NAME_TRANSLATIONS).includes(activity) && activity !== 'classification_expert'
        ).length;

        const generalProgress = totalTrackableActivities > 0 ? (completedTrackableCount / totalTrackableActivities) * 100 : 0;
        
        const playedSeriationGames = new Set(
            performanceLogs
                .filter(log => SERIATION_SUB_SKILLS.includes(LEVEL_SKILL_MAP[log.level_name]))
                .map(log => log.level_name)
        );
        
        const gameDetails = Object.values(performanceLogs.reduce((acc, log) => {
            const key = log.level_name;
            if (!acc[key]) {
                acc[key] = {
                    gameName: GAME_NAME_TRANSLATIONS[log.game_name] || log.game_name,
                    levelName: LEVEL_NAME_TRANSLATIONS[log.level_name] || log.level_name.replace(/_/g, ' '),
                    sessions: 0,
                    totalTime: 0,
                    totalErrors: 0,
                };
            }
            acc[key].sessions += 1;
            acc[key].totalTime += log.time_taken_ms;
            acc[key].totalErrors += log.incorrect_attempts;
            return acc;
        }, {} as Record<string, { gameName: string; levelName: string; sessions: number; totalTime: number; totalErrors: number }>))
        .sort((a, b) => a.gameName.localeCompare(b.gameName) || a.levelName.localeCompare(b.levelName));

        return {
            totalSessions: performanceLogs.length,
            totalTimePlayed: formatTime(totalTimeMs),
            totalIncorrectAttempts,
            radarDatasets,
            classificationInsights,
            seriationInsights,
            generalProgress,
            completedActivitiesCount: completedTrackableCount,
            totalActivitiesCount: totalTrackableActivities,
            playedSeriationGames,
            gameDetails,
        };

    }, [performanceLogs]);
    
    const getInsightsForCategory = (insights: typeof analysisData.classificationInsights) => {
        const strengths = insights.filter(i => i.type === 'strength');
        const consolidating = insights.filter(i => i.type === 'consolidating');
        const opportunities = insights.filter(i => i.type === 'opportunity');
        
        return (
             <div className="bg-slate-50 p-4 rounded-lg border space-y-4">
                {insights.length === 0 ? (
                    <p className="text-center text-slate-500 p-4">No hay suficientes datos para esta categoría. ¡Sigue jugando!</p>
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
        );
    };

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
                        
                        <div className="space-y-6">
                           <div className="bg-white p-6 rounded-lg shadow-md border">
                                <h3 className="text-xl font-bold text-slate-700 mb-4 text-center">Resumen General</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <p className="text-3xl font-bold text-sky-600">{analysisData.totalSessions}</p>
                                        <p className="text-sm text-slate-500 font-semibold">Sesiones Totales</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <p className="text-3xl font-bold text-sky-600">{analysisData.totalTimePlayed}</p>
                                        <p className="text-sm text-slate-500 font-semibold">Tiempo Total de Juego</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <p className="text-3xl font-bold text-rose-600">{analysisData.totalIncorrectAttempts}</p>
                                        <p className="text-sm text-slate-500 font-semibold">Errores Totales</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white p-6 rounded-lg shadow-md border">
                                <h3 className="text-xl font-bold text-slate-700 mb-4 text-center">Avance General del Juego</h3>
                                <div>
                                    <div className="flex justify-between items-center mb-1 text-sm font-semibold">
                                        <span className="text-slate-700">Actividades Únicas Completadas</span>
                                        <span className="text-sky-700">{analysisData.completedActivitiesCount} / {analysisData.totalActivitiesCount}</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-5">
                                        <div 
                                            className="bg-sky-500 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all duration-500" 
                                            style={{ width: `${analysisData.generalProgress}%` }}
                                        >
                                            {analysisData.generalProgress > 10 ? `${analysisData.generalProgress.toFixed(0)}%` : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-slate-700 mb-2 text-center">Rendimiento por Habilidad</h3>
                            <div className="flex items-center justify-center p-4 bg-slate-50 rounded-lg border">
                                <RadarChart datasets={analysisData.radarDatasets} size={450} />
                            </div>
                             <div className="flex justify-center gap-4 mt-2 text-sm font-semibold">
                                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-sky-500/50 border border-sky-700 rounded-sm"></div><span className="text-sky-800">Clasificación y Afines</span></div>
                                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-rose-500/50 border border-rose-700 rounded-sm"></div><span className="text-rose-800">Habilidades de Seriación</span></div>
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-bold text-slate-700 mb-3 text-center">Detalle de las Partidas</h3>
                            <div className="bg-slate-50 p-3 rounded-lg border max-h-80 overflow-y-auto">
                                <ul className="space-y-3">
                                    {analysisData.gameDetails.map(detail => (
                                        <li key={detail.levelName} className="p-3 bg-white rounded-md shadow-sm">
                                            <p className="font-bold text-slate-800">{detail.gameName}</p>
                                            <p className="text-sm text-slate-500">{detail.levelName}</p>
                                            <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                                                <div className="bg-slate-100 p-1 rounded">
                                                    <p className="font-bold text-sky-700 text-base">{detail.sessions}</p>
                                                    <p className="text-slate-500">Partidas</p>
                                                </div>
                                                <div className="bg-slate-100 p-1 rounded">
                                                    <p className="font-bold text-rose-700 text-base">{(detail.totalErrors / detail.sessions).toFixed(1)}</p>
                                                    <p className="text-slate-500">Errores (prom.)</p>
                                                </div>
                                                <div className="bg-slate-100 p-1 rounded">
                                                    <p className="font-bold text-green-700 text-base">{formatTime(detail.totalTime / detail.sessions)}</p>
                                                    <p className="text-slate-500">Tiempo (prom.)</p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <p className="text-xs text-slate-400 text-center mt-2 italic">
                                Nota: El puntaje por partida no se muestra aquí, ya que el puntaje total se actualiza de forma acumulativa en tu perfil.
                            </p>
                        </div>
                    
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xl font-bold text-slate-700 mb-3">Análisis Pedagógico: Clasificación</h3>
                                {getInsightsForCategory(analysisData.classificationInsights)}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-700 mb-3">Análisis Pedagógico: Seriación</h3>
                                {getInsightsForCategory(analysisData.seriationInsights)}
                                
                                <h3 className="text-xl font-bold text-slate-700 mb-3 mt-6">Sugerencias desde la Matemática</h3>
                                <div className="bg-violet-50 p-4 rounded-lg border border-violet-200">
                                    <MathSuggestions playedSeriationGames={analysisData.playedSeriationGames} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-slate-700 mb-3 text-center">Historial de Actividades Recientes</h3>
                            <div className="bg-slate-50 p-3 rounded-lg border max-h-80 overflow-y-auto">
                                <ul className="space-y-3">
                                    {performanceLogs.slice(0, 10).map(log => (
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
             <style>{`
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } 
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
             `}</style>
        </div>
    );
};

export default PerformanceDashboard;