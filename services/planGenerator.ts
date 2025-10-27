import { PerformanceLog, ReinforcementPlan, UserProfile } from '../types';
import { TOTAL_TRACKABLE_ACTIVITIES } from '../constants';
import { GoogleGenAI } from "@google/genai";

// Mapeo de nombres de juegos a habilidades cognitivas
const GAME_SKILL_MAP: Record<string, string> = {
    'Classification': 'Lógica de Clasificación',
    'VennDiagram': 'Lógica de Clasificación',
    'TreasureSort': 'Lógica de Clasificación',
    'Matching': 'Memoria y Atención',
    'OddOneOut': 'Percepción de Diferencias',
    'Inventory': 'Conteo y Precisión',
};

// Función para calcular la "puntuación de dificultad" para un juego
// Un valor más alto indica mayor dificultad.
const calculateDifficultyScore = (log: PerformanceLog): number => {
    const timePenalty = (log.time_taken_ms / (log.total_items || 1)) / 1000; // Tiempo por ítem en segundos
    const errorPenalty = log.incorrect_attempts * 5; // Cada error cuenta como 5 segundos de penalización
    return timePenalty + errorPenalty;
};

export const generateReinforcementPlan = async (logs: PerformanceLog[], user: UserProfile): Promise<ReinforcementPlan | null> => {
    if (!logs || logs.length < 5) {
        return null;
    }

    const completedCount = Object.keys(user.completed_levels || {}).length;
    const overallProgress = TOTAL_TRACKABLE_ACTIVITIES > 0
        ? Math.round((completedCount / TOTAL_TRACKABLE_ACTIVITIES) * 100)
        : 0;

    // 1. Analizar el rendimiento por habilidad cognitiva
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

    // 2. Encontrar el área de mayor dificultad
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
    
    if (weakestSkill && highestAvgDifficulty > 10) { // Umbral de dificultad, ej. más de 10s de penalización promedio por juego
         mainDifficulty = weakestSkill;
    }

    // 3. Generar el plan con Gemini
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    const performanceSummary = logs.map(log => 
        `- Juego: ${log.game_name}, Nivel: ${log.level_name}, Errores: ${log.incorrect_attempts}, Tiempo: ${(log.time_taken_ms / 1000).toFixed(1)}s`
    ).join('\n');

    // FIX: The prompt was malformed, causing a large number of syntax errors.
    // It has been corrected to be a single, valid template literal string.
    const prompt = `
        Eres un psicopedagogo experto en desarrollo infantil y pensamiento lógico-matemático.
        Analiza el siguiente resumen de desempeño de un estudiante de preescolar llamado ${user.firstName} y genera un "Plan de Refuerzo Pedagógico" en formato JSON.

        DATOS DE DESEMPEÑO:
        - Área de mayor dificultad identificada: ${mainDifficulty}
        - Total de partidas jugadas: ${logs.length}
        - Resumen de partidas:
        ${performanceSummary}

        Basado en estos datos, genera un objeto JSON con la siguiente estructura exacta. No incluyas "json" al principio ni \`\`\`.

        {
          "studentName": "${user.firstName} ${user.lastName}",
          "date": "${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}",
          "summary": {
            "totalSessions": ${logs.length},
            "accuracy": ${Math.round((1 - (logs.reduce((acc, log) => acc + log.incorrect_attempts, 0) / logs.reduce((acc, log) => acc + (log.total_items || 1), 1))) * 100)},
            "avgTimePerTask": "${(logs.reduce((acc, log) => acc + log.time_taken_ms, 0) / logs.reduce((acc, log) => acc + (log.total_items || 1), 1) / 1000).toFixed(1)} seg/ítem",
            "mainDifficulty": "${mainDifficulty}",
            "overallProgress": ${overallProgress}
          },
          "category": "Explorador Lógico",
          "categoryDescription": "Demuestra curiosidad y habilidad para identificar patrones básicos, sentando las bases para un razonamiento más complejo.",
          "focusArea": "Fortalecer la flexibilidad cognitiva en tareas de clasificación.",
          "context": {
            "matematico": [
              "La capacidad de clasificar objetos utilizando múltiples y variados criterios es fundamental para la construcción del concepto de número y el desarrollo del pensamiento algebraico temprano.",
              "Dominar la clasificación flexible permite a los niños entender que los objetos pueden pertenecer a diferentes grupos simultáneamente, una idea clave en la teoría de conjuntos."
            ],
            "didactico": {
              "dialogo": [
                {"title": "Preguntas de Andamiaje", "example": "Veo que agrupaste por color. ¿De qué otra forma podríamos ordenar estos mismos objetos? ¿Qué pasaría si ahora solo miramos su forma?"},
                {"title": "Verbalización del Pensamiento", "example": "Anima al niño a explicar por qué un objeto pertenece a un grupo. 'Cuéntame, ¿por qué pusiste este aquí?'"}
              ],
              "manipulativas": [
                {"title": "Clasificación con Aros", "description": "Usa aros de hula-hula en el suelo para crear diagramas de Venn con objetos cotidianos (juguetes, ropa). Empieza con un criterio y luego introduce un segundo aro para la intersección."},
                {"title": "El Intruso", "description": "Crea una fila de 4-5 objetos que compartan un atributo, excepto uno. Pide al niño que identifique 'al intruso' y explique por qué no pertenece al grupo."}
              ],
              "rutinas": [
                {"title": "Ordenar la Compra", "example": "Al desempacar las compras, pide ayuda para agrupar los productos: 'Vamos a poner todas las frutas juntas. Ahora, todas las cosas que van en el refrigerador.'"}
              ]
            }
          },
          "indicators": [
            "El niño es capaz de cambiar el criterio de clasificación de un conjunto de objetos cuando se le solicita.",
            "Comienza a verbalizar los criterios que utiliza para agrupar sin necesidad de preguntas constantes.",
            "Resuelve juegos como 'El Intruso' con mayor rapidez y precisión."
          ],
          "conclusion": "${user.firstName} muestra una base sólida. El enfoque en la flexibilidad cognitiva a través de estas actividades potenciará su capacidad para resolver problemas complejos en el futuro."
        }

        Instrucciones IMPORTANTES para el contenido:
        - El tono debe ser profesional, positivo y orientado a la acción para un educador.
        - Las estrategias didácticas deben ser concretas, prácticas y adecuadas para la edad preescolar.
        - Si 'mainDifficulty' es "Ninguna dificultad mayor detectada", el plan debe enfocarse en desafíos de nivel superior y consolidación.
        - Si 'mainDifficulty' es 'Memoria y Atención', las estrategias deben centrarse en juegos de memoria, seguir instrucciones y atención sostenida.
        - Si 'mainDifficulty' es 'Conteo y Precisión', las estrategias deben centrarse en correspondencia uno a uno, conteo y cuantificación.
        - Si 'mainDifficulty' es 'Lógica de Clasificación' o 'Percepción de Diferencias', el plan debe enfocarse en identificar atributos, comparar y agrupar.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });
        
        // FIX: The Gemini API returns a `.text` property, not a function.
        // Accessing the property directly is the correct way to get the string response.
        const planText = response.text;
        const planObject = JSON.parse(planText);
        return planObject as ReinforcementPlan;

    } catch (error) {
        console.error("Error al generar el plan con Gemini:", error);
        return null;
    }
};
