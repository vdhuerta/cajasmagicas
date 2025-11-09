// services/adminService.ts
import { UserProfile, PerformanceLog } from '../types';
import { supabase } from './supabase';

// Detecta si la aplicación se está ejecutando en el entorno de AI Studio.
const isRunningInAiStudio = !!(window as any).aistudio;

const callAdminFunction = async (action: string, payload?: any) => {
    const functionUrl = '/.netlify/functions/admin-handler'; 
    
    try {
        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, payload }),
        });

        const responseText = await response.text();
        if (!response.ok) {
            try {
                const errorData = JSON.parse(responseText);
                throw new Error(errorData.error || `El servidor respondió con el estado ${response.status}`);
            } catch (e) {
                if (responseText.trim().startsWith('<!DOCTYPE')) {
                    throw new Error(`Error de enrutamiento del servidor: Se recibió HTML en lugar de JSON. Verifica la configuración de Netlify.`);
                }
                throw new Error(`Error de servidor no controlable. Respuesta: ${responseText.substring(0, 100)}...`);
            }
        }
        
        return JSON.parse(responseText);

    } catch (error) {
        console.error(`Error en el servicio de admin en la acción '${action}':`, error);
        throw error;
    }
};

export const getDashboardData = async (): Promise<{ users: UserProfile[], logs: { user_id: string }[] }> => {
    if (isRunningInAiStudio) {
        // En AI Studio, llamamos directamente a Supabase (requiere RLS de lectura).
        console.log("AI Studio: Obteniendo datos del panel directamente desde Supabase.");
        if (!supabase) throw new Error("El cliente de Supabase no está inicializado.");

        const { data: users, error: usersError } = await supabase.from('usuarios').select('*');
        if (usersError) throw new Error(`Error al obtener usuarios (revisa las políticas RLS): ${usersError.message}`);

        const { data: logs, error: logsError } = await supabase.from('performance_logs').select('user_id');
        if (logsError) throw new Error(`Error al obtener registros (revisa las políticas RLS): ${logsError.message}`);

        return { users: users || [], logs: logs || [] };
    } else {
        // En producción (Netlify), usamos la función segura.
        return callAdminFunction('GET_DASHBOARD_DATA');
    }
};

export const getUserLogs = async (userId: string): Promise<PerformanceLog[]> => {
    if (isRunningInAiStudio) {
        console.log(`AI Studio: Obteniendo registros para el usuario ${userId} directamente desde Supabase.`);
        if (!supabase) throw new Error("El cliente de Supabase no está inicializado.");
        const { data, error } = await supabase.from('performance_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (error) throw new Error(`Error al obtener registros del usuario (revisa las políticas RLS): ${error.message}`);
        return data || [];
    } else {
        return callAdminFunction('GET_USER_LOGS', { userId });
    }
};

export const updateUser = async (id: string, updates: Partial<Omit<UserProfile, 'id' | 'email'>>): Promise<UserProfile> => {
    if (isRunningInAiStudio) {
         console.warn("AI Studio: User updates are disabled for security. Netlify environment is required.");
         throw new Error("User updates are only permitted in the production environment (Netlify) for security reasons.");
    }
    
    const functionUrl = '/.netlify/functions/update-user';
    
    try {
        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...updates }),
        });

        const responseText = await response.text();
        if (!response.ok) {
            try {
                const errorData = JSON.parse(responseText);
                throw new Error(errorData.error || `Server responded with status ${response.status}`);
            } catch (e) {
                if (responseText.trim().startsWith('<!DOCTYPE')) {
                    throw new Error(`Server routing error: Received HTML instead of JSON. Check Netlify configuration.`);
                }
                throw new Error(`Unparseable server error. Response: ${responseText.substring(0, 100)}...`);
            }
        }
        
        return JSON.parse(responseText);

    } catch (error) {
        console.error(`Error in updateUser service:`, error);
        throw error;
    }
};

export const deleteUser = (userId: string): Promise<{ message: string }> => {
     if (isRunningInAiStudio) {
         console.warn("AI Studio: La eliminación de usuarios está deshabilitada por seguridad. Se requiere el entorno de Netlify.");
         throw new Error("La eliminación de usuarios solo está permitida en el entorno de producción (Netlify) por razones de seguridad.");
    }
    return callAdminFunction('DELETE_USER', { userId });
};