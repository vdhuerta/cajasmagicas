import { PerformanceLog, SkillsBulletin } from '../types';

/**
 * Calls a secure Netlify serverless function to generate the skills bulletin.
 * This function analyzes performance logs using a rule-based system.
 * @param logs - The performance logs for the user.
 * @returns A promise that resolves to the SkillsBulletin or null if an error occurs.
 */
export const generateSkillsBulletin = async (logs: PerformanceLog[]): Promise<SkillsBulletin | null> => {
    try {
        const endpoint = '/.netlify/functions/generate-bulletin';

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ logs }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ 
                error: 'Could not parse error response from server.' 
            }));
            console.error(`Error from Netlify function: ${response.status}`, errorData);
            throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const bulletin: SkillsBulletin = await response.json();
        return bulletin;

    } catch (error) {
        console.error("Error calling the bulletin generation service:", error instanceof Error ? error.message : String(error));
        return null;
    }
};
