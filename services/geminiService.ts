// services/geminiService.ts
import { GoogleGenAI } from "@google/genai";
import { ClassificationRule } from "../types";

const isRunningInAiStudio = !!(window as any).aistudio;

// Helper functions copied from the original Netlify function for direct use
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

function createRuleDescription(rule: ClassificationRule): string {
    const descriptions = Object.entries(rule)
        .map(([key, value]) => `${translations[key] || key}: ${translations[value] || value}`);
    
    if (descriptions.length === 0) return 'contiene figuras de todo tipo';
    return 'contiene figuras con estas características: ' + descriptions.join(', ');
}

/**
 * Calls a secure Netlify serverless function to get a creative name for a magic box.
 * This is the intended behavior for a production environment on Netlify.
 * @param rule - The classification rule for the box.
 * @returns A promise that resolves to a creative name string.
 */
const getMagicBoxNameViaFunction = async (rule: ClassificationRule): Promise<string> => {
    const functionUrl = '/.netlify/functions/gemini';
    
    try {
        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rule }),
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const responseText = await response.text();
            console.error(`Received non-JSON response from ${functionUrl}. It may be an HTML fallback.`, responseText.substring(0, 200));
            if (responseText.trim().startsWith('<!DOCTYPE')) {
                 throw new Error(`Error de enrutamiento del servidor: Se recibió una página HTML en lugar de datos JSON. Esto suele ocurrir por una configuración incorrecta de redirección en Netlify ('netlify.toml').`);
            }
            throw new Error('La respuesta del servidor no es un JSON válido.');
        }
        
        const data = await response.json();

        if (!response.ok) {
            console.error(`Error from Netlify function (gemini): ${data.error || response.statusText}`);
            return "¡El Cofre Encantado!";
        }

        return data.name || "¡Una Caja muy Especial!";

    } catch (error) {
        console.error("Error calling the name generation service:", error instanceof Error ? error.message : String(error));
        return "¡El Cofre Encantado!";
    }
};

/**
 * Calls the Gemini API directly from the client.
 * This is used in environments like AI Studio where Netlify functions are not available.
 * @param rule - The classification rule for the box.
 * @returns A promise that resolves to a creative name string.
 */
const getMagicBoxNameDirectly = async (rule: ClassificationRule): Promise<string> => {
    if (!process.env.API_KEY) {
        console.error("Gemini API key (process.env.API_KEY) not found for direct call.");
        return "¡El Cofre Encantado!";
    }

    try {
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
        console.error("Error calling Gemini API directly:", error);
        return "¡El Cofre Encantado!";
    }
};

export const getMagicBoxName = async (rule: ClassificationRule): Promise<string> => {
    if (isRunningInAiStudio) {
        return getMagicBoxNameDirectly(rule);
    } else {
        return getMagicBoxNameViaFunction(rule);
    }
};
