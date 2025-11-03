import { UserProfile, PerformanceLog } from '../types';

const callAdminFunction = async (action: string, payload?: any) => {
    try {
        const response = await fetch('/.netlify/functions/admin-handler', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, payload }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Server responded with status ${response.status}`);
        }

        return await response.json();
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
