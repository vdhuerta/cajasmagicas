import { ClassificationRule } from "../types";

// Ya no necesitamos inicializar GoogleGenAI ni acceder a process.env aquí.

export const getMagicBoxName = async (rule: ClassificationRule): Promise<string> => {
    try {
        // Hacemos una petición a nuestra función serverless de Netlify.
        // Netlify automáticamente expone las funciones en la ruta /.netlify/functions/
        const response = await fetch('/.netlify/functions/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ rule }),
        });

        if (!response.ok) {
            console.error("Error from Netlify function:", response.statusText);
            // Si la función falla, devolvemos un nombre por defecto.
            return "¡El Cofre Encantado!";
        }

        const data = await response.json();
        // La función devuelve un objeto { name: '...' }
        return data.name || "¡Una Caja muy Especial!";

    } catch (error) {
        console.error("Error calling Netlify function:", error instanceof Error ? error.message : String(error));
        // Proporcionamos un fallback en caso de un error de red.
        return "¡El Cofre Encantado!";
    }
};