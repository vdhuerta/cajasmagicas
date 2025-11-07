import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const handler: Handler = async (event) => {
  // Define headers once to be reused in all JSON responses
  const headers = {
    'Content-Type': 'application/json',
  };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server configuration error.' }) };
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  try {
    const { action, payload } = JSON.parse(event.body || '{}');

    switch (action) {
      case 'GET_ALL_USERS': {
        const { data, error } = await supabaseAdmin
          .from('usuarios')
          .select('*');
        if (error) throw error;
        return { statusCode: 200, headers, body: JSON.stringify(data) };
      }

      case 'GET_USER_LOGS': {
        const { userId } = payload;
        if (!userId) return { statusCode: 400, headers, body: JSON.stringify({ error: 'User ID is required.' }) };
        const { data, error } = await supabaseAdmin
          .from('performance_logs')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return { statusCode: 200, headers, body: JSON.stringify(data) };
      }
      
      case 'UPDATE_USER': {
        const { id, ...updates } = payload;
        if (!id) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'El ID de usuario es requerido para la actualización.' }) };
        }

        // Use the atomic .update().select().single() method.
        // This is the most efficient and safest way to perform this operation.
        const { data: updatedUser, error } = await supabaseAdmin
          .from('usuarios')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        // Handle errors from Supabase
        if (error) {
          console.error(`Supabase error updating user ${id}:`, error);
          if (error.code === 'PGRST116') { // PostgREST error for "no rows returned" by .single()
            throw new Error(`No se encontró un usuario con el ID '${id}'. La fila podría haber sido eliminada.`);
          }
          throw new Error(`Error de base de datos: ${error.message}`);
        }

        if (!updatedUser) {
          throw new Error('La operación de actualización no devolvió los datos del usuario, a pesar de no haber un error explícito.');
        }

        return { statusCode: 200, headers, body: JSON.stringify(updatedUser) };
      }

      case 'DELETE_USER': {
        const { userId } = payload;
        if (!userId) return { statusCode: 400, headers, body: JSON.stringify({ error: 'User ID is required.' }) };
        
        const { error: logError } = await supabaseAdmin.from('performance_logs').delete().eq('user_id', userId);
        if (logError) console.error(`Non-critical: Could not delete logs for user ${userId}:`, logError.message);
        
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (authError) throw authError;

        return { statusCode: 200, headers, body: JSON.stringify({ message: 'User deleted successfully.' }) };
      }

      default:
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid action.' }) };
    }
  } catch (error: any) {
    console.error('Error in admin-handler:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message || 'An internal server error occurred.' }) };
  }
};

export { handler };