import { UserProfile, PerformanceLog } from '../types';

const callAdminFunction = async (action: string, payload?: any) => {
    // FIX: Using a relative path `/api/` which is a standard convention for proxying to serverless functions in environments like Netlify.
    // This avoids issues where the direct function URL might not be correctly resolved, leading to the server returning the main HTML file.
    const functionUrl = '/api/admin-handler'; 
    
    try {
        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, payload }),
        });

        // First, check if the response is JSON before trying to parse.
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            // This catches cases where the server returns HTML (like a 404 page that's actually index.html).
            const responseText = await response.text();
            // We can even check if it looks like HTML to give a better error.
            if (responseText.trim().startsWith('<!DOCTYPE')) {
                 throw new Error(`Unexpected token '<', "<!DOCTYPE "... is not valid JSON. This usually means the API path is wrong.`);
            }
            throw new Error('Received non-JSON response from server.');
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `Server responded with status ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`Admin service error on action '${action}':`, error);
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