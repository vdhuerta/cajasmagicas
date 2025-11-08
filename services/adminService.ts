// services/adminService.ts
import { UserProfile, PerformanceLog } from '../types';

const callAdminFunction = async (action: string, payload?: any) => {
    // Se utiliza una ruta relativa para llamar a la función de Netlify.
    // Esto es más robusto y evita problemas con configuraciones de redirección
    // para SPAs que pueden interceptar rutas absolutas.
    const functionUrl = '/.netlify/functions/admin-handler'; 
    
    try {
        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, payload }),
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const responseText = await response.text();
            if (responseText.trim().startsWith('<!DOCTYPE')) {
                 // Este es el error más común: Netlify devuelve el index.html de la SPA.
                 throw new Error(`Error de enrutamiento del servidor: Se recibió una página HTML en lugar de datos JSON. Esto suele ocurrir por una configuración incorrecta de redirección en Netlify ('netlify.toml').`);
            }
            throw new Error('La respuesta del servidor no es un JSON válido.');
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `El servidor respondió con el estado ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`Error en el servicio de admin en la acción '${action}':`, error);
        throw error;
    }
};

export const getDashboardData = (): Promise<{ users: UserProfile[], logs: { user_id: string }[] }> => {
    return callAdminFunction('GET_DASHBOARD_DATA');
};

export const getUserLogs = (userId: string): Promise<PerformanceLog[]> => {
    return callAdminFunction('GET_USER_LOGS', { userId });
};

export const updateUser = (id: string, updates: Partial<Omit<UserProfile, 'id' | 'email'>>): Promise<UserProfile> => {
    return callAdminFunction('UPDATE_USER', { id, ...updates });
};

export const deleteUser = (userId: string): Promise<{ message: string }> => {
    return callAdminFunction('DELETE_USER', { userId });
};