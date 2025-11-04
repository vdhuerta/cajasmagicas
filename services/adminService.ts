import { UserProfile, PerformanceLog } from '../types';

const callAdminFunction = async (action: string, payload?: any) => {
    // FIX: Changed the function URL to the direct Netlify path to bypass potential routing issues.
    // This direct path is the canonical way to access the function and works consistently
    // across both local development (AI Studio) and production (Netlify hosting).
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
                 throw new Error(`Error de ruta: La llamada a la API en '${functionUrl}' recibió HTML. Revisa que la función esté desplegada correctamente en Netlify.`);
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

export const fetchAllUsers = (): Promise<UserProfile[]> => {
    return callAdminFunction('GET_ALL_USERS');
};

export const fetchUserPerformanceLogs = (userId: string): Promise<PerformanceLog[]> => {
    return callAdminFunction('GET_USER_LOGS', { userId });
};

export const updateUser = (user: Partial<UserProfile> & { id: string }): Promise<UserProfile> => {
    return callAdminFunction('UPDATE_USER', user);
};

export const deleteUser = (userId: string): Promise<{ message: string }> => {
    return callAdminFunction('DELETE_USER', { userId });
};