// services/emailService.ts

const getAbsoluteFunctionUrl = (functionName: string): string => {
    return `${window.location.origin}/.netlify/functions/${functionName}`;
};

interface EmailPayload {
    to: string;
    subject: string;
    body: string;
}

export const sendEmail = async ({ to, subject, body }: EmailPayload): Promise<{ message: string }> => {
    const functionUrl = getAbsoluteFunctionUrl('send-email');

    try {
        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to, subject, body }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `El servidor respondió con el estado ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`Error en el servicio de email:`, error);
        throw error;
    }
};
