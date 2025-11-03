// services/geminiService.ts
import { ClassificationRule } from "../types";

/**
 * Calls a secure Netlify serverless function to get a creative name for a magic box.
 * This avoids exposing the Gemini API key on the client.
 * @param rule - The classification rule for the box.
 * @returns A promise that resolves to a creative name string.
 */
export const getMagicBoxName = async (rule: ClassificationRule): Promise<string> => {
    try {
        const functionUrl = `${window.location.origin}/.netlify/functions/gemini`;
        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rule }),
        });

        if (!response.ok) {
            console.error(`Error from Netlify function (gemini): ${response.statusText}`);
            // Return a user-friendly fallback name on error.
            return "¡El Cofre Encantado!";
        }

        const data = await response.json();
        return data.name || "¡Una Caja muy Especial!";

    } catch (error) {
        console.error("Error calling the name generation service:", error instanceof Error ? error.message : String(error));
        // Return a user-friendly fallback name on error.
        return "¡El Cofre Encantado!";
    }
};