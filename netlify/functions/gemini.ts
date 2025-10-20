import { GoogleGenAI } from "@google/genai";
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

// Definimos un tipo para la regla de clasificación que esperamos recibir
interface ClassificationRule {
    [key: string]: string;
}

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

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Asegurarse de que solo se acepten peticiones POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }
  
  const API_KEY = process.env.API_KEY;

  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key not configured' }),
    };
  }

  try {
    const { rule } = JSON.parse(event.body || '{}') as { rule: ClassificationRule };
    if (!rule) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing rule in request body' }),
        };
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });
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

    return {
      statusCode: 200,
      body: JSON.stringify({ name: text || "¡Una Caja muy Especial!" }),
      headers: { 'Content-Type': 'application/json' },
    };

  } catch (error) {
    console.error("Error in Netlify function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate name from API' }),
    };
  }
};

export { handler };
