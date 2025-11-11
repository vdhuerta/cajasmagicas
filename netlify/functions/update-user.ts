import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const handler: Handler = async (event) => {
  const headers = { 'Content-Type': 'application/json' };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server environment variables not configured.' }) };
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  try {
    const { id, ...changes } = JSON.parse(event.body || '{}');

    if (!id) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'User ID is required.' }) };
    }
    
    if (Object.keys(changes).length === 0) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'No changes provided to update.' }) };
    }

    const { data, error } = await supabaseAdmin
        .from('usuarios')
        .update(changes)
        .eq('id', id)
        .select();

    if (error) {
        // Handle database-level errors (e.g., RLS violations, connection issues)
        console.error(`Supabase error updating profile for ${id}:`, error);
        throw new Error(`Error de base de datos al actualizar el perfil: ${error.message}`);
    }

    // Verify that exactly one record was found and updated.
    // If .eq('id', id) finds no match, `data` will be an empty array [].
    if (!data || data.length === 0) {
        // This is a critical case: the user ID did not exist.
        throw new Error(`No se encontró un usuario con el ID '${id}' para actualizar. La operación falló.`);
    }

    if (data.length > 1) {
        // This case is highly unlikely with a unique ID but is good practice to handle.
        console.warn(`Warning: Multiple users were updated for a single ID '${id}'. This should not happen.`);
    }
    
    // Success: return the first (and only) updated user profile.
    return { statusCode: 200, headers, body: JSON.stringify(data[0]) };

  } catch (error: any) {
    console.error('Error in update-user function:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message || 'An internal server error occurred.' }) };
  }
};

export { handler };
