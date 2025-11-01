import type { Handler, HandlerEvent } from "@netlify/functions";
import type { PerformanceLog, SkillsBulletin, BulletinSection } from '../../types';
import { GAME_SKILL_MAP } from '../../constants';

// Pedagogical rules for generating feedback
const getFeedbackForSkill = (skill: string, avgIncorrect: number): { comment: string; recommendation: string } => {
    const feedbackMap: Record<string, { high: string[]; mid: string[]; low: string[] }> = {
        'Clasificación': {
            high: ["Demuestra una excelente capacidad para agrupar objetos por sus atributos.", "Se recomienda proponer desafíos con múltiples criterios (ej. 'círculos rojos y pequeños')."],
            mid: ["Está desarrollando la habilidad de clasificar. A veces confunde los criterios.", "Reforzar la identificación de un solo atributo a la vez (solo color, solo forma). Usar lenguaje claro."],
            low: ["Presenta dificultades para identificar el atributo común en un grupo.", "Realizar actividades concretas con objetos cotidianos (ej. 'vamos a guardar todos los juguetes rojos')."],
        },
        'Memoria y Atención': {
            high: ["Muestra una memoria y concentración notables, recordando posiciones con facilidad.", "Aumentar la cantidad de pares en juegos de memoria o introducir distractores leves."],
            mid: ["Logra encontrar parejas, pero a veces requiere múltiples intentos.", "Jugar partidas con menos pares y celebrar cada acierto para reforzar la confianza."],
            low: ["Le cuesta retener la ubicación de los elementos destapados.", "Empezar con solo 2 o 3 pares. Verbalizar juntos la ubicación: 'Aquí estaba el círculo azul'."],
        },
        'Atención y Percepción': {
            high: ["Identifica diferencias sutiles rápidamente, mostrando una gran agudeza visual.", "Introducir juegos que requieran encontrar más de un 'intruso' en un grupo grande."],
            mid: ["Generalmente encuentra el objeto diferente, pero puede requerir pistas.", "Animar a describir verbalmente por qué un objeto no pertenece, para reforzar el razonamiento."],
            low: ["Se le dificulta encontrar el elemento que no cumple la regla.", "Usar grupos con diferencias muy evidentes (ej. 3 círculos rojos y 1 cuadrado azul)."],
        },
        'Conteo y Correspondencia': {
            high: ["Realiza el conteo y la correspondencia uno a uno con gran precisión.", "Proponer desafíos que impliquen contar y luego realizar una acción (ej. 'trae 5 cucharas')."],
            mid: ["A veces pierde la cuenta o se equivoca al arrastrar la cantidad solicitada.", "Practicar el conteo señalando cada objeto. Usar los dedos para llevar la cuenta."],
            low: ["Muestra dificultades para asociar el número con la cantidad de objetos.", "Contar objetos de la vida real en voz alta juntos. Empezar con cantidades pequeñas (1 a 3)."],
        }
    };

    const defaultFeedback = {
        high: ["Buen desempeño general en esta área.", "Continuar practicando con desafíos variados."],
        mid: ["Se observa un progreso adecuado.", "Seguir reforzando con actividades lúdicas."],
        low: ["Es un área que requiere más apoyo.", "Realizar actividades cortas y frecuentes para construir la habilidad."]
    };
    
    const skillFeedback = feedbackMap[skill] || defaultFeedback;

    if (avgIncorrect < 0.5) return { comment: skillFeedback.high[0], recommendation: skillFeedback.high[1] };
    if (avgIncorrect < 1.5) return { comment: skillFeedback.mid[0], recommendation: skillFeedback.mid[1] };
    return { comment: skillFeedback.low[0], recommendation: skillFeedback.low[1] };
};


const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        const { logs } = JSON.parse(event.body || '{}') as { logs: PerformanceLog[] };
        if (!logs || logs.length === 0) {
            return { statusCode: 400, body: JSON.stringify({ error: 'No performance logs provided' }) };
        }

        const skillData: Record<string, { totalIncorrect: number; count: number }> = {};
        
        logs.forEach(log => {
            const skill = GAME_SKILL_MAP[log.game_name] || 'Otros';
            if (!skillData[skill]) {
                skillData[skill] = { totalIncorrect: 0, count: 0 };
            }
            skillData[skill].totalIncorrect += log.incorrect_attempts;
            skillData[skill].count += 1;
        });
        
        const strengths: BulletinSection[] = [];
        const opportunities: BulletinSection[] = [];

        for (const skill in skillData) {
            const avgIncorrect = skillData[skill].count > 0 ? skillData[skill].totalIncorrect / skillData[skill].count : 0;
            const { comment, recommendation } = getFeedbackForSkill(skill, avgIncorrect);

            if (avgIncorrect < 0.8) { // Threshold for strength
                strengths.push({ skill, comment, recommendation });
            } else { // Threshold for opportunity
                opportunities.push({ skill, comment, recommendation });
            }
        }
        
        const summary = `Este boletín se basa en ${logs.length} sesiones de juego, analizando el rendimiento en diferentes habilidades clave.`;

        const bulletin: SkillsBulletin = {
            summary,
            strengths,
            opportunities,
        };

        return {
            statusCode: 200,
            body: JSON.stringify(bulletin),
            headers: { 'Content-Type': 'application/json' },
        };

    } catch (error) {
        console.error("Error in generate-bulletin function:", error instanceof Error ? error.message : String(error));
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to generate bulletin' }),
        };
    }
};

export { handler };