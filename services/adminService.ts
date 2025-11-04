import { UserProfile, PerformanceLog } from '../types';

const callAdminFunction = async (action: string, payload?: any) => {
    // Usar la ruta de reescritura /api/ es una convención estándar y robusta que Netlify
    // redirigirá a la función de servidor correcta. Esto es más limpio y consistente
    // con cómo se llama a la función de Gemini.
    const functionUrl = '/api/admin-handler'; 
    
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
                 throw new Error(`Error de ruta: La llamada a la API recibió HTML. Revisa que la función '/api/admin-handler' esté desplegada correctamente en Netlify.`);
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