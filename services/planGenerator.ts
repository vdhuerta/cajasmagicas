import { GoogleGenAI, Type } from "@google/genai";
import { PerformanceLog, ReinforcementPlan, UserProfile } from '../types';
import { TOTAL_TRACKABLE_ACTIVITIES } from '../constants';

const pedagogicalFramework = `
Marco Pedagógico de la Clasificación:
La clasificación es la habilidad de agrupar objetos por semejanzas y separarlos por diferencias basándose en atributos como color, forma o tamaño. Es una operación mental clave para el pensamiento lógico-matemático en preescolares.
Beneficios Clave:
1.  Desarrollo Lógico: Fomenta la observación, comparación y el razonamiento analítico.
2.  Adquisición de Vocabulario: El niño aprende y utiliza términos para describir categorías y atributos.
3.  Base para el Número: Es una noción pre-numérica esencial. Ayuda a entender la inclusión de clases (ej., hay más 'figuras' que 'figuras rojas'), que es fundamental para comprender la cardinalidad y el concepto de número como una cantidad abstracta.
`;

const GAME_SKILL_MAP: Record<string, string> = {
    'Classification': 'Lógica de Clasificación',
    'VennDiagram': 'Lógica de Clasificación',
    'TreasureSort': 'Lógica de Clasificación',
    'Matching': 'Memoria y Atención',
    'OddOneOut': 'Percepción de Diferencias',
    'Inventory': 'Conteo y Precisión',
};

const calculateDifficultyScore = (log: PerformanceLog): number => {
    const timePerItem = (log.time_taken_ms / (log.total_items || 1));
    const timePenalty = Math.min(timePerItem / 1000, 10);
    const errorPenalty = log.incorrect_attempts * 5;
    return timePenalty + errorPenalty;
};

export const generateReinforcementPlan = async (logs: PerformanceLog[], user: UserProfile): Promise<ReinforcementPlan | null> => {
    try {
        if (!process.env.API_KEY) {
            console.error("Gemini API key not configured. Cannot generate plan.");
            return null;
        }

        // --- 1. Análisis Cuantitativo (realizado en el cliente) ---
        const completedCount = Object.keys(user.completed_levels || {}).length;
        const overallProgress = TOTAL_TRACKABLE_ACTIVITIES > 0
            ? Math.round((completedCount / TOTAL_TRACKABLE_ACTIVITIES) * 100)
            : 0;
            
        const classificationLogs = logs.filter(log => GAME_SKILL_MAP[log.game_name] === 'Lógica de Clasificación');
        const correctClassificationAttempts = classificationLogs.length;
        const incorrectClassificationAttempts = classificationLogs.reduce((acc, log) => acc + log.incorrect_attempts, 0);
        const totalClassificationAttempts = correctClassificationAttempts + incorrectClassificationAttempts;
        const accuracy = totalClassificationAttempts > 0 
            ? Math.round((correctClassificationAttempts / totalClassificationAttempts) * 100)
            : 100;

        const totalTimeMs = logs.reduce((acc, log) => acc + log.time_taken_ms, 0);
        const avgTimePerTask = logs.length > 0 ? `${(totalTimeMs / logs.length / 1000).toFixed(1)}s` : 'N/A';
            
        const skillPerformance: Record<string, { totalDifficulty: number; count: number }> = {};
        logs.forEach(log => {
            const skill = GAME_SKILL_MAP[log.game_name];
            if (skill) {
                if (!skillPerformance[skill]) skillPerformance[skill] = { totalDifficulty: 0, count: 0 };
                skillPerformance[skill].totalDifficulty += calculateDifficultyScore(log);
                skillPerformance[skill].count += 1;
            }
        });

        let mainDifficulty = "Ninguna dificultad mayor detectada.";
        let weakestSkill = '';
        let highestAvgDifficulty = 0;
        for (const skill in skillPerformance) {
            const avgDifficulty = skillPerformance[skill].totalDifficulty / skillPerformance[skill].count;
            if (avgDifficulty > highestAvgDifficulty) {
                highestAvgDifficulty = avgDifficulty;
                weakestSkill = skill;
            }
        }
        if (weakestSkill && highestAvgDifficulty > 15) { // Umbral para identificar una dificultad
             mainDifficulty = weakestSkill;
        }

        const performanceSummary = logs.slice(0, 10).map(log => 
            `- Juego: ${log.game_name}, Nivel: ${log.level_name}, Errores: ${log.incorrect_attempts}, Tiempo: ${(log.time_taken_ms / 1000).toFixed(1)}s`
        ).join('\n');

        // --- 2. Generación Cualitativa (realizada por Gemini) ---
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const prompt = `
        Eres un psicopedagogo experto en desarrollo infantil y pensamiento lógico-matemático.
        Tu única fuente de verdad y conocimiento es el siguiente Marco Pedagógico. Basa TODAS tus respuestas y recomendaciones en él.

        --- INICIO DEL MARCO PEDAGÓGICO (Fuente de Verdad) ---
        ${pedagogicalFramework}
        --- FIN DEL MARCO PEDAGÓGICO ---

        Ahora, te proporciono un análisis del desempeño de un estudiante de preescolar. Tu tarea es generar las secciones CUALITATIVAS de un "Plan de Refuerzo Pedagógico".

        DATOS ANALIZADOS DEL ESTUDIANTE:
        - Nombre: ${user.firstName}
        - Área de mayor dificultad identificada: ${mainDifficulty}
        - Resumen de partidas recientes:
        ${performanceSummary}

        Instrucciones para tu respuesta JSON:
        - Basándote en el 'Área de mayor dificultad', genera las secciones 'category', 'categoryDescription', 'focusArea', 'context', 'indicators' y 'conclusion'.
        - El tono debe ser profesional, positivo y orientado a la acción para un educador.
        - Las estrategias didácticas deben ser concretas, prácticas y adecuadas para la edad preescolar, y deben reflejar los principios del Marco Pedagógico.
        - Si 'Área de mayor dificultad' es "Ninguna dificultad mayor detectada", el plan debe enfocarse en desafíos de nivel superior y consolidación, mencionando cómo esto afianza los conceptos del Marco Pedagógico.
        - Si 'Área de mayor dificultad' es 'Lógica de Clasificación', enfócate en esa área, conectando las estrategias directamente con los "Beneficios Clave" del Marco Pedagógico.
        - Rellena todos los campos del JSON con información útil y coherente basada en los datos y el marco provisto.`;
        
        const qualitativePlanSchema = {
            type: Type.OBJECT,
            properties: {
                category: { type: Type.STRING },
                categoryDescription: { type: Type.STRING },
                focusArea: { type: Type.STRING },
                context: {
                    type: Type.OBJECT,
                    properties: {
                        matematico: { type: Type.ARRAY, items: { type: Type.STRING } },
                        didactico: {
                            type: Type.OBJECT,
                            properties: {
                                dialogo: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, example: { type: Type.STRING } } } },
                                manipulativas: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } } } },
                                rutinas: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, example: { type: Type.STRING } } } }
                            }
                        }
                    }
                },
                indicators: { type: Type.ARRAY, items: { type: Type.STRING } },
                conclusion: { type: Type.STRING }
            }
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: qualitativePlanSchema,
            }
        });

        const qualitativePart = JSON.parse(response.text);

        // --- 3. Ensamblaje del Plan Completo ---
        const fullPlan: ReinforcementPlan = {
            studentName: `${user.firstName} ${user.lastName}`,
            date: new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }),
            summary: {
                totalSessions: logs.length,
                accuracy: accuracy,
                avgTimePerTask: avgTimePerTask,
                mainDifficulty: mainDifficulty,
                overallProgress: overallProgress,
            },
            ...qualitativePart
        };

        return fullPlan;

    } catch (error) {
        console.error("Error generating reinforcement plan with Gemini API:", error instanceof Error ? error.message : String(error));
        return null;
    }
};
