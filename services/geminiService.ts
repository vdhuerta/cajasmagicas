// services/geminiService.ts
import { ClassificationRule } from "../types";

/**
 * Calls a secure Netlify serverless function to get a creative name for a magic box.
 * This avoids exposing the Gemini API key on the client.
 * @param rule - The classification rule for the box.
 * @returns A promise that resolves to a creative name string.
 */
export const getMagicBoxName = async (rule: ClassificationRule): Promise<string> => {
    // FIX: Changed the function URL to the direct Netlify path to bypass potential routing issues.
    // This direct path is the canonical way to access the function and works consistently
    // across both local development (AI Studio) and production (Netlify hosting).
    const functionUrl = '/.netlify/functions/gemini';
    
    try {
        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rule }),
        });

        // First, check if the response is JSON before trying to parse.
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const responseText = await response.text();
            console.error(`Received non-JSON response from ${functionUrl}. It may be an HTML fallback.`, responseText.substring(0, 200));
            if (responseText.trim().startsWith('<!DOCTYPE')) {
                 throw new Error(`Error de ruta: La llamada a la API en '${functionUrl}' recibió HTML en lugar de JSON. Esto suele ocurrir por una mala configuración de las redirecciones del servidor.`);
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
        // Return a user-friendly fallback name on error.
        return "¡El Cofre Encantado!";
    }
};