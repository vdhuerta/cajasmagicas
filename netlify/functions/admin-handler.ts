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
      case 'GET_DASHBOARD_DATA': {
        const { data: users, error: usersError } = await supabaseAdmin
          .from('usuarios')
          .select('*');
        if (usersError) throw usersError;

        const { data: logs, error: logsError } = await supabaseAdmin
            .from('performance_logs')
            .select('user_id');
        if (logsError) throw logsError;
        
        return { 
            statusCode: 200, 
            headers, 
            body: JSON.stringify({ users: users || [], logs: logs || [] }) 
        };
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
        const { id, ...changes } = payload;
        if (!id) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'El ID de usuario es requerido para la actualización.' }) };
        }

        if (Object.keys(changes).length === 0) {
            // Técnicamente, la UI no debería permitir esto, pero es una buena validación del lado del servidor.
            const { data: currentUser, error: fetchError } = await supabaseAdmin.from('usuarios').select().eq('id', id).single();
            if (fetchError) throw fetchError;
            return { statusCode: 200, headers, body: JSON.stringify(currentUser) };
        }

        // --- Parte 1: Actualizar metadatos en auth.users (si aplica) ---
        const authMetadataUpdates: { firstName?: string, lastName?: string } = {};
        if ('firstName' in changes) {
            authMetadataUpdates.firstName = changes.firstName;
        }
        if ('lastName' in changes) {
            authMetadataUpdates.lastName = changes.lastName;
        }

        if (Object.keys(authMetadataUpdates).length > 0) {
            const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
                id,
                { user_metadata: authMetadataUpdates }
            );

            if (authError) {
                console.error(`Supabase auth error updating user ${id}:`, authError);
                throw new Error(`Error actualizando los datos de autenticación: ${authError.message}`);
            }
        }
        
        // --- Parte 2: Actualizar la tabla pública 'usuarios' ---
        // Supabase maneja de forma inteligente los objetos de actualización parcial.
        // Solo actualizará los campos que se proporcionan en el objeto `changes`.
        const { data: updatedUser, error: profileError } = await supabaseAdmin
          .from('usuarios')
          .update(changes) // Pasamos directamente el objeto con los campos a cambiar
          .eq('id', id)
          .select()
          .single();

        if (profileError) {
            console.error(`Supabase profile error updating user ${id}:`, profileError);
            throw new Error(`Error de base de datos al actualizar el perfil: ${profileError.message}`);
        }
        
        if (!updatedUser) {
            throw new Error('La operación de actualización no devolvió los datos del usuario. Verifique que el usuario exista.');
        }

        return { statusCode: 200, headers, body: JSON.stringify(updatedUser) };
      }

      case 'DELETE_USER': {
        const { userId } = payload;
        if (!userId) return { statusCode: 400, headers, body: JSON.stringify({ error: 'User ID is required.' }) };
        
        const { error: logError } = await supabaseAdmin.from('performance_logs').delete().eq('user_id', userId);
        if (logError) console.error(`Non-critical: Could not delete logs for user ${userId}:`, logError.message);
        
        // The trigger on auth.users will handle deleting the public.usuarios row
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