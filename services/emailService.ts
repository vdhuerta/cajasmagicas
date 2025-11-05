// services/emailService.ts

interface EmailPayload {
    to: string;
    subject: string;
    body: string;
}

export const sendEmail = async ({ to, subject, body }: EmailPayload): Promise<{ message: string }> => {
    const functionUrl = '/.netlify/functions/send-email';

    try {
        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to, subject, body }),
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const responseText = await response.text();
            if (responseText.trim().startsWith('<!DOCTYPE')) {
                 throw new Error(`Error de enrutamiento del servidor: Se recibió una página HTML en lugar de datos JSON. Verifica la configuración de redirección en Netlify.`);
            }
            throw new Error('La respuesta del servidor no es un JSON válido.');
        }

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