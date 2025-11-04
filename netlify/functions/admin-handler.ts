import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error.' }) };
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
        return { statusCode: 200, body: JSON.stringify(data) };
      }

      case 'GET_USER_LOGS': {
        const { userId } = payload;
        if (!userId) return { statusCode: 400, body: JSON.stringify({ error: 'User ID is required.' }) };
        const { data, error } = await supabaseAdmin
          .from('performance_logs')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return { statusCode: 200, body: JSON.stringify(data) };
      }
      
      case 'UPDATE_USER': {
        const { id, ...updates } = payload;
        if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'User ID is required for updates.' }) };
        const { data, error } = await supabaseAdmin
          .from('usuarios')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return { statusCode: 200, body: JSON.stringify(data) };
      }

      case 'DELETE_USER': {
        const { userId } = payload;
        if (!userId) return { statusCode: 400, body: JSON.stringify({ error: 'User ID is required.' }) };
        
        // 1. Delete performance logs. The public.usuarios table should cascade delete via foreign key from auth.users.
        const { error: logError } = await supabaseAdmin.from('performance_logs').delete().eq('user_id', userId);
        if (logError) console.error(`Non-critical: Could not delete logs for user ${userId}:`, logError.message);
        
        // 2. Delete the user from Supabase Auth. This will cascade and delete the corresponding row in `public.usuarios`.
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (authError) throw authError;

        return { statusCode: 200, body: JSON.stringify({ message: 'User deleted successfully.' }) };
      }

      default:
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid action.' }) };
    }
  } catch (error: any) {
    console.error('Error in admin-handler:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message || 'An internal server error occurred.' }) };
  }
};

export { handler };