import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const handler: Handler = async (event) => {
  const headers = { 'Content-Type': 'application/json' };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Variables de entorno del servidor no configuradas.' }) };
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  try {
    const { action, payload } = JSON.parse(event.body || '{}');

    switch (action) {
      case 'GET_DASHBOARD_DATA': {
        const { data: users, error: usersError } = await supabaseAdmin.from('usuarios').select('*');
        if (usersError) throw usersError;
        const { data: logs, error: logsError } = await supabaseAdmin.from('performance_logs').select('user_id');
        if (logsError) throw logsError;
        return { statusCode: 200, headers, body: JSON.stringify({ users: users || [], logs: logs || [] }) };
      }

      case 'GET_USER_LOGS': {
        const { userId } = payload;
        if (!userId) return { statusCode: 400, headers, body: JSON.stringify({ error: 'User ID is required.' }) };
        const { data, error } = await supabaseAdmin.from('performance_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (error) throw error;
        return { statusCode: 200, headers, body: JSON.stringify(data) };
      }
      
      case 'UPDATE_USER': {
        const { id, ...changes } = payload;
        if (!id) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'El ID de usuario es requerido.' }) };
        }
        
        // Si no hay cambios, simplemente devuelve el usuario actual.
        if (Object.keys(changes).length === 0) {
            const { data: currentUser, error } = await supabaseAdmin.from('usuarios').select('*').eq('id', id).single();
            if (error) throw error;
            return { statusCode: 200, headers, body: JSON.stringify(currentUser) };
        }
        
        // Separar los cambios para la tabla de autenticación y la tabla de perfiles.
        const authMetadataChanges: Record<string, any> = {};
        const profileChanges: Record<string, any> = {};

        if (changes.firstName) authMetadataChanges.firstName = changes.firstName;
        if (changes.lastName) authMetadataChanges.lastName = changes.lastName;

        // Mantener los datos sincronizados en ambas tablas si se cambian.
        if (changes.firstName) profileChanges.firstName = changes.firstName;
        if (changes.lastName) profileChanges.lastName = changes.lastName;
        
        if (changes.career) profileChanges.career = changes.career;
        if (changes.section) profileChanges.section = changes.section;
        if (changes.score !== undefined) profileChanges.score = changes.score;

        // Paso 1: Actualizar user_metadata en auth.users (fuente principal para nombre/apellido).
        if (Object.keys(authMetadataChanges).length > 0) {
          const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
            id,
            { user_metadata: authMetadataChanges }
          );
          if (authError) {
            console.error(`Error actualizando los datos de autenticación para ${id}:`, authError);
            throw new Error(`Error actualizando los datos de autenticación: ${authError.message}`);
          }
        }

        // Paso 2: Actualizar la tabla public.usuarios con los datos del perfil.
        if (Object.keys(profileChanges).length > 0) {
          const { error: profileError } = await supabaseAdmin
            .from('usuarios')
            .update(profileChanges)
            .eq('id', id);

          if (profileError) {
            console.error(`Error actualizando los datos del perfil para ${id}:`, profileError);
            throw new Error(`Error de base de datos al actualizar el perfil: ${profileError.message}`);
          }
        }

        // Paso 3: Devolver el perfil actualizado desde la tabla public.usuarios para confirmar.
        const { data: finalUserData, error: fetchError } = await supabaseAdmin
          .from('usuarios')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) {
          throw new Error(`No se pudo recuperar el perfil de usuario actualizado: ${fetchError.message}`);
        }

        return { statusCode: 200, headers, body: JSON.stringify(finalUserData) };
      }

      case 'DELETE_USER': {
        const { userId } = payload;
        if (!userId) return { statusCode: 400, headers, body: JSON.stringify({ error: 'User ID is required.' }) };
        // El trigger en auth.users se encargará de eliminar en cascada la fila en public.usuarios.
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (authError) throw authError;
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'User deleted successfully.' }) };
      }

      default:
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid action.' }) };
    }
  } catch (error: any) {
    console.error('Error en admin-handler:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message || 'Ocurrió un error interno en el servidor.' }) };
  }
};

export { handler };