// services/geminiService.ts
import { ClassificationRule } from "../types";

// Se construye la URL absoluta para la función de Netlify en tiempo de ejecución.
// Esto evita problemas de enrutamiento con las reglas de redirección para SPAs en Netlify.
const getAbsoluteFunctionUrl = (functionName: string): string => {
    return `${window.location.origin}/.netlify/functions/${functionName}`;
};

/**
 * Calls a secure Netlify serverless function to get a creative name for a magic box.
 * This avoids exposing the Gemini API key on the client.
 * @param rule - The classification rule for the box.
 * @returns A promise that resolves to a creative name string.
 */
export const getMagicBoxName = async (rule: ClassificationRule): Promise<string> => {
    // FIX: Se utiliza la URL absoluta para asegurar que la llamada llegue a la función
    // y no sea interceptada por las reglas de enrutamiento de la SPA de Netlify.
    const functionUrl = getAbsoluteFunctionUrl('gemini');
    
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
                 // Este es el error más común: Netlify devuelve el index.html de la SPA.
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
        // Return a user-friendly fallback name on error.
        return "¡El Cofre Encantado!";
    }
};