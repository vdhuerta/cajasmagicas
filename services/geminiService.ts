import { GoogleGenAI } from "@google/genai";
import { ClassificationRule } from "../types";

// Traducciones para construir un prompt claro en español.
const translations: Record<string, string> = {
    shape: 'forma',
    color: 'color',
    size: 'tamaño',
    thickness: 'grosor',
    circle: 'círculo',
    square: 'cuadrado',
    triangle: 'triángulo',
    rectangle: 'rectángulo',
    red: 'rojo',
    blue: 'azul',
    yellow: 'amarillo',
    small: 'pequeño',
    large: 'grande',
    thick: 'grueso',
    thin: 'delgado',
};

// Crea una descripción legible de la regla para el prompt de la IA.
function createRuleDescription(rule: ClassificationRule): string {
    const descriptions = Object.entries(rule)
        .map(([key, value]) => `${translations[key] || key}: ${translations[value] || value}`);
    
    if (descriptions.length === 0) return 'contiene figuras de todo tipo';
    return 'contiene figuras con estas características: ' + descriptions.join(', ');
}

// Llama a la API de Gemini para obtener un nombre creativo para una caja.
export const getMagicBoxName = async (rule: ClassificationRule): Promise<string> => {
    try {
        // La clave de API se inyecta en el entorno de construcción, por lo que process.env.API_KEY está disponible aquí.
        if (!import.meta.env.VITE_API_KEY) {
            console.error("Gemini API key not configured. Using fallback name.");
            return "¡El Cofre Encantado!";
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const ruleDescription = createRuleDescription(rule);

        const prompt = `Eres un cuentacuentos creativo para niños de preescolar. Un niño acaba de ordenar un grupo de figuras en una caja. La regla para esta caja es que ${ruleDescription}.
    
    Da un nombre corto, divertido y mágico para esta caja.
    
    Ejemplos:
    - Para 'color: rojo': El Cofre del Fuego del Dragón
    - Para 'color: azul': La Caja de Gemas del Río
    - Para 'forma: círculo': La Colección de Rocas Lunares
    - Para 'tamaño: pequeño': Los Tesoros del Duende
    
    Sé muy creativo y que el nombre tenga de 3 a 5 palabras. No uses comillas en tu respuesta. Solo proporciona el nombre.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const text = response.text.trim();

        return text || "¡Una Caja muy Especial!";

    } catch (error) {
        console.error("Error calling Gemini API for box name:", error instanceof Error ? error.message : String(error));
        // Proporciona un fallback en caso de un error de red o de la API.
        return "¡El Cofre Encantado!";
    }
};
