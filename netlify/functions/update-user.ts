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
        .select()
        .single(); // Use .single() to get a single object back instead of an array

    if (error) {
        console.error(`Error updating profile for ${id}:`, error);
        throw new Error(`Database error while updating profile: ${error.message}`);
    }

    if (!data) {
        throw new Error(`Could not find user to update with ID: ${id}.`);
    }
    
    return { statusCode: 200, headers, body: JSON.stringify(data) };

  } catch (error: any) {
    console.error('Error in update-user function:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message || 'An internal server error occurred.' }) };
  }
};

export { handler };