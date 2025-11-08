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

// Las operaciones de escritura (actualizar, eliminar) siempre deben pasar por el backend seguro
// por razones de seguridad, ya que requieren permisos de administrador (service_role).
// Funcionarán en Netlify, pero fallarán de forma segura en AI Studio, lo cual es el comportamiento esperado.

export const updateUser = (id: string, updates: Partial<Omit<UserProfile, 'id' | 'email'>>): Promise<UserProfile> => {
    if (isRunningInAiStudio) {
         console.warn("AI Studio: La actualización de usuarios está deshabilitada por seguridad. Se requiere el entorno de Netlify.");
         throw new Error("La actualización de usuarios solo está permitida en el entorno de producción (Netlify) por razones de seguridad.");
    }
    return callAdminFunction('UPDATE_USER', { id, ...updates });
};

export const deleteUser = (userId: string): Promise<{ message: string }> => {
     if (isRunningInAiStudio) {
         console.warn("AI Studio: La eliminación de usuarios está deshabilitada por seguridad. Se requiere el entorno de Netlify.");
         throw new Error("La eliminación de usuarios solo está permitida en el entorno de producción (Netlify) por razones de seguridad.");
    }
    return callAdminFunction('DELETE_USER', { userId });
};
