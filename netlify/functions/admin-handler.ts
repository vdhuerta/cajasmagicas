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
        
        // Si no hay cambios, simplemente devolvemos el usuario actual para evitar una escritura innecesaria.
        if (Object.keys(changes).length === 0) {
            const { data: currentUser, error } = await supabaseAdmin.from('usuarios').select('*').eq('id', id).single();
            if (error) throw error;
            return { statusCode: 200, headers, body: JSON.stringify(currentUser) };
        }

        // --- Actualización Simplificada: Solo en la tabla 'usuarios' ---
        // La tabla `public.usuarios` es la fuente de verdad para la UI de la app.
        // Esto evita el error de permisos con `auth.admin.updateUserById` que causaba el fallo en Netlify.
        const { data: updatedUser, error: updateError } = await supabaseAdmin
          .from('usuarios')
          .update(changes)
          .eq('id', id)
          .select()
          .single();

        if (updateError) {
            console.error(`Error en DB al actualizar perfil ${id}:`, updateError);
            throw new Error(`Error de base de datos al actualizar el perfil: ${updateError.message}`);
        }
        
        // Devolver el usuario actualizado.
        return { statusCode: 200, headers, body: JSON.stringify(updatedUser) };
      }

      case 'DELETE_USER': {
        const { userId } = payload;
        if (!userId) return { statusCode: 400, headers, body: JSON.stringify({ error: 'User ID is required.' }) };
        // El trigger en auth.users se encargará de borrar en cascada la fila de public.usuarios
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