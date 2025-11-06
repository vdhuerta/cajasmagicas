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
        if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'User ID is required for updates.' }) };
        const { data, error } = await supabaseAdmin
          .from('usuarios')
          .update(updates)
          .eq('id', id)
          .select();
        
        if (error) throw error;

        if (!data || data.length !== 1) {
            const message = `La operación de actualización no afectó a una única fila. Filas afectadas: ${data ? data.length : 0}. Esto puede deberse a políticas de seguridad (RLS) incorrectas.`;
            console.error('Update operation did not return a single row for user ID:', id, 'Returned:', data);
            return { statusCode: 500, headers, body: JSON.stringify({ error: message }) };
        }

        return { statusCode: 200, headers, body: JSON.stringify(data[0]) };
      }

      case 'BATCH_UPDATE_USERS': {
        const { updates } = payload;
        if (!Array.isArray(updates) || updates.length === 0) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Payload must be a non-empty array of updates.' }) };
        }

        try {
            const updatePromises = updates.map(async (update) => {
                const { id, ...changes } = update;
                if (Object.keys(changes).length === 0) {
                    return; // Skip if no actual changes
                }
                
                // Use { count: 'exact' } to get the number of affected rows.
                // This is more direct than .select() and only requires UPDATE RLS permissions.
                const { error, count } = await supabaseAdmin
                    .from('usuarios')
                    .update(changes, { count: 'exact' })
                    .eq('id', id);

                if (error) {
                    // Forward any database-level errors.
                    throw new Error(`Error de base de datos al actualizar usuario ${id}: ${error.message}`);
                }
                
                if (count === 0) {
                    // This is a critical check. If no rows were updated, it means the user
                    // was not found by the WHERE clause (eq('id', id)), likely due to RLS.
                    throw new Error(`No se encontró el usuario con ID ${id} para actualizar (0 filas afectadas). Verifica las políticas de seguridad (RLS) para la operación UPDATE.`);
                }
            });
            
            await Promise.all(updatePromises);

            return { statusCode: 200, headers, body: JSON.stringify({ message: 'Todos los usuarios fueron actualizados con éxito.' }) };

        } catch (err: any) {
            console.error('Error during batch update:', err);
            const statusCode = err.message.includes('No se encontró') ? 404 : 500;
            return { statusCode, headers, body: JSON.stringify({ error: err.message }) };
        }
      }

      case 'DELETE_USER': {
        const { userId } = payload;
        if (!userId) return { statusCode: 400, headers, body: JSON.stringify({ error: 'User ID is required.' }) };
        
        // 1. Delete performance logs. The public.usuarios table should cascade delete via foreign key from auth.users.
        const { error: logError } = await supabaseAdmin.from('performance_logs').delete().eq('user_id', userId);
        if (logError) console.error(`Non-critical: Could not delete logs for user ${userId}:`, logError.message);
        
        // 2. Delete the user from Supabase Auth. This will cascade and delete the corresponding row in `public.usuarios`.
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