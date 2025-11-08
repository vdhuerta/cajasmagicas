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
        if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'El ID de usuario es requerido.' }) };
        if (Object.keys(changes).length === 0) {
            const { data: currentUser, error } = await supabaseAdmin.from('usuarios').select().eq('id', id).single();
            if (error) throw error;
            return { statusCode: 200, headers, body: JSON.stringify(currentUser) };
        }

        // --- PASO 1: Actualizar la tabla de autenticación (auth.users) ---
        // Estos son datos protegidos que solo el service_role puede tocar.
        const authUpdates: { [key: string]: any } = {};
        if (changes.firstName) authUpdates.firstName = changes.firstName;
        if (changes.lastName) authUpdates.lastName = changes.lastName;

        if (Object.keys(authUpdates).length > 0) {
            const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, { user_metadata: authUpdates });
            if (authError) {
                console.error(`Error en Supabase Auth al actualizar ${id}:`, authError);
                throw new Error(`Error actualizando los datos de autenticación: ${authError.message}`);
            }
        }
        
        // --- PASO 2: Actualizar la tabla de perfil público (public.usuarios) ---
        // Creamos un objeto solo con los campos que pertenecen a esta tabla.
        const profileUpdates: { [key: string]: any } = {};
        if (changes.career) profileUpdates.career = changes.career;
        if (changes.section) profileUpdates.section = changes.section;
        if (changes.score !== undefined) profileUpdates.score = changes.score;
        // También replicamos el nombre/apellido en la tabla pública para consistencia
        if (changes.firstName) profileUpdates.firstName = changes.firstName;
        if (changes.lastName) profileUpdates.lastName = changes.lastName;
        
        if (Object.keys(profileUpdates).length > 0) {
            const { error: profileError } = await supabaseAdmin.from('usuarios').update(profileUpdates).eq('id', id);
            if (profileError) {
                console.error(`Error en DB al actualizar perfil ${id}:`, profileError);
                throw new Error(`Error de base de datos al actualizar el perfil: ${profileError.message}`);
            }
        }
        
        // --- PASO 3: Devolver el usuario completamente actualizado ---
        const { data: finalUser, error: finalUserError } = await supabaseAdmin.from('usuarios').select().eq('id', id).single();
        if (finalUserError) throw new Error("No se pudo obtener el usuario actualizado después de guardar.");

        return { statusCode: 200, headers, body: JSON.stringify(finalUser) };
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