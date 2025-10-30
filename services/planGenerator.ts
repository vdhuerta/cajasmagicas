// services/planGenerator.ts
import { PerformanceLog, ReinforcementPlan, UserProfile } from '../types';

/**
 * Calls a secure Netlify serverless function to generate the reinforcement plan.
 * This function acts as a proxy to the Gemini API, ensuring the API key is not exposed on the client.
 * @param logs - The performance logs for the user.
 * @param user - The user's profile.
 * @returns A promise that resolves to the ReinforcementPlan or null if an error occurs.
 */
export const generateReinforcementPlan = async (logs: PerformanceLog[], user: UserProfile): Promise<ReinforcementPlan | null> => {
    try {
        // The endpoint for the Netlify function. This path is automatically handled by Netlify's routing.
        const endpoint = '/.netlify/functions/generate-plan';

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // The serverless function expects the raw logs and user profile to perform its own analysis.
            body: JSON.stringify({ logs, user }),
        });

        if (!response.ok) {
            // If the server returns an error, try to parse it for a more specific message.
            const errorData = await response.json().catch(() => ({ 
                error: 'No se pudo obtener una respuesta detallada del servidor.' 
            }));
            console.error(`Error from Netlify function: ${response.status} ${response.statusText}`, errorData);
            throw new Error(errorData.error || `Error del servidor: ${response.status}`);
        }

        const plan: ReinforcementPlan = await response.json();
        return plan;

    } catch (error) {
        // Log the error for debugging and return null to the UI component.
        // The UI component is responsible for showing a user-friendly message.
        console.error("Error calling the plan generation service:", error instanceof Error ? error.message : String(error));
        return null;
    }
};
