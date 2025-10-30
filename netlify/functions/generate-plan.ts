import { GoogleGenAI, Type } from "@google/genai";
import type { Handler, HandlerEvent } from "@netlify/functions";
import type { PerformanceLog, UserProfile } from '../../types';
import { TOTAL_TRACKABLE_ACTIVITIES } from '../../constants';

const pedagogicalFramework = `
Marco Pedagógico de la Clasificación:
La clasificación es la habilidad de agrupar objetos por semejanzas y separarlos por diferencias basándose en atributos como color, forma o tamaño. Es una operación mental clave para el pensamiento lógico-matemático en preescolares.
Beneficios Clave:
1.  Desarrollo Lógico: Fomenta la observación, comparación y el razonamiento analítico.
2.  Adquisición de Vocabulario: El niño aprende y utiliza términos para describir categorías y atributos.
3.  Base para el Número: Es una noción pre-numérica esencial. Ayuda a entender la inclusión de clases (ej., hay más 'figuras' que 'figuras rojas'), que es fundamental para comprender la cardinalidad y el concepto de número como una cantidad abstracta.
`;

// --- Helper functions from the original file ---
const GAME_SKILL_MAP: Record<string, string> = {
    'Classification': 'Lógica de Clasificación',
    'VennDiagram': 'Lógica de Clasificación',
    'TreasureSort': 'Lógica de Clasificación',
    'Matching': 'Memoria y Atención',
    'OddOneOut': 'Percepción de Diferencias',
    'Inventory': 'Conteo y Precisión',
};

const calculateDifficultyScore = (log: PerformanceLog): number => {
    // A simple metric combining time and errors. Lower is better.
    const timePerItem = (log.time_taken_ms / (log.total_items || 1));
    const timePenalty = Math.min(timePerItem / 1000, 10); // Cap time penalty per item at 10s
    const errorPenalty = log.incorrect_attempts * 5;
    return timePenalty + errorPenalty;
};


// --- The main logic wrapped in a handler ---
const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
        return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
    }

    try {
        const { logs, user } = JSON.parse(event.body || '{}') as { logs: PerformanceLog[], user: UserProfile };
        if (!logs || !user || logs.length < 5) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Insufficient data provided' }) };
        }

        // --- All the analysis logic from the original file ---
        const completedCount = Object.keys(user.completed_levels || {}).length;
        const overallProgress = TOTAL_TRACKABLE_ACTIVITIES > 0
            ? Math.round((completedCount / TOTAL_TRACKABLE_ACTIVITIES) * 100)
            : 0;
            
        const skillPerformance: Record<string, { totalDifficulty: number; count: number }> = {};
        logs.forEach(log => {
            const skill = GAME_SKILL_MAP[log.game_name];
            if (skill) {
                if (!skillPerformance[skill]) {
                    skillPerformance[skill] = { totalDifficulty: 0, count: 0 };
                }
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
        if (weakestSkill && highestAvgDifficulty > 10) { // Threshold for identifying a difficulty
             mainDifficulty = weakestSkill;
        }

        const performanceSummary = logs.map(log => 
            `- Juego: ${log.game_name}, Nivel: ${log.level_name}, Errores: ${log.incorrect_attempts}, Tiempo: ${(log.time_taken_ms / 1000).toFixed(1)}s`
        ).join('\n');
        
        // --- Gemini API Call ---
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        
        const prompt = `
        Eres un psicopedagogo experto en desarrollo infantil y pensamiento lógico-matemático.
        Tu única fuente de verdad y conocimiento es el siguiente Marco Pedagógico. Basa TODAS tus respuestas y recomendaciones en él.

        --- INICIO DEL MARCO PEDAGÓGICO (Fuente de Verdad) ---
        ${pedagogicalFramework}
        --- FIN DEL MARCO PEDAGÓGICO ---

        Ahora, analiza el siguiente resumen de desempeño de un estudiante de preescolar llamado ${user.firstName} y genera un "Plan de Refuerzo Pedagógico".
        Tu respuesta debe ser un objeto JSON que se ajuste al esquema que se te ha proporcionado.

        DATOS DE DESEMPEÑO:
        - Estudiante: ${user.firstName} ${user.lastName}
        - Progreso General: ${overallProgress}% de actividades completadas.
        - Área de mayor dificultad identificada: ${mainDifficulty}
        - Total de partidas analizadas: ${logs.length}
        - Resumen de partidas:
        ${performanceSummary}

        Instrucciones para el contenido:
        - El tono debe ser profesional, positivo y orientado a la acción para un educador.
        - Las estrategias didácticas deben ser concretas, prácticas y adecuadas para la edad preescolar, y deben reflejar los principios del Marco Pedagógico.
        - Si 'mainDifficulty' es "Ninguna dificultad mayor detectada", el plan debe enfocarse en desafíos de nivel superior y consolidación, mencionando cómo esto afianza los conceptos del Marco Pedagógico.
        - Si 'mainDifficulty' es 'Memoria y Atención', 'Conteo y Precisión', 'Lógica de Clasificación' o 'Percepción de Diferencias', el plan debe enfocarse en esa área, conectando las estrategias directamente con los "Beneficios Clave" del Marco Pedagógico.
        - Rellena todos los campos del JSON con información útil y coherente basada en los datos y el marco provisto.
        - La fecha debe ser la actual: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
    `;
        
        const planSchema = {
            type: Type.OBJECT,
            properties: {
                studentName: { type: Type.STRING },
                date: { type: Type.STRING },
                summary: {
                    type: Type.OBJECT,
                    properties: {
                        totalSessions: { type: Type.INTEGER },
                        accuracy: { type: Type.INTEGER },
                        avgTimePerTask: { type: Type.STRING },
                        mainDifficulty: { type: Type.STRING },
                        overallProgress: { type: Type.INTEGER },
                    },
                    required: ["totalSessions", "accuracy", "avgTimePerTask", "mainDifficulty", "overallProgress"]
                },
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
                                dialogo: {
                                    type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, example: { type: Type.STRING } }, required: ["title", "example"] }
                                },
                                manipulativas: {
                                    type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["title", "description"] }
                                },
                                rutinas: {
                                    type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, example: { type: Type.STRING } }, required: ["title", "example"] }
                                }
                            },
                            required: ["dialogo", "manipulativas", "rutinas"]
                        }
                    },
                    required: ["matematico", "didactico"]
                },
                indicators: { type: Type.ARRAY, items: { type: Type.STRING } },
                conclusion: { type: Type.STRING }
            },
            required: ["studentName", "date", "summary", "category", "categoryDescription", "focusArea", "context", "indicators", "conclusion"]
        };


        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: planSchema,
            }
        });

        const planText = response.text;
        
        try {
            JSON.parse(planText);
        } catch (parseError) {
            console.error("Gemini returned invalid JSON:", planText);
            throw new Error("API returned malformed plan data.");
        }
        
        return {
            statusCode: 200,
            body: planText,
            headers: { 'Content-Type': 'application/json' },
        };

    } catch (error) {
        console.error("Error in generate-plan function:", error instanceof Error ? error.message : String(error));
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to generate plan from API' }),
        };
    }
};

export { handler };