import type { Handler } from "@netlify/functions";

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { to, subject, body } = JSON.parse(event.body || '{}');

    if (!to || !subject || !body) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Faltan campos requeridos: destinatario, asunto y cuerpo del mensaje.' }) };
    }

    // --- LÓGICA DE ENVÍO DE CORREO SIMULADA ---
    // En una aplicación real, aquí se integraría con un servicio de correo
    // como SendGrid, Resend, o AWS SES, usando una API key guardada en las
    // variables de entorno de Netlify.
    //
    // const emailApiKey = process.env.EMAIL_API_KEY;
    // await emailService.send({ from: 'admin@cajas-magicas.com', to, subject, html: body });
    //
    // Para esta simulación, solo registramos la acción en la consola y asumimos éxito.
    
    console.log(`--- SIMULANDO ENVÍO DE CORREO ---`);
    console.log(`Para: ${to}`);
    console.log(`Asunto: ${subject}`);
    console.log(`Cuerpo: ${body}`);
    console.log(`-----------------------------`);

    // Simular un pequeño retraso de red
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Correo enviado con éxito (simulado).' }),
      headers: { 'Content-Type': 'application/json' },
    };

  } catch (error: any) {
    console.error('Error en la función send-email:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message || 'Ocurrió un error interno en el servidor.' }) };
  }
};

export { handler };
