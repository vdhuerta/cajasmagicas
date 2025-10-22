import { createClient } from '@supabase/supabase-js';
import { UserProfile } from '../types';

// Se acceden a las variables de entorno de forma segura, usando `process.env`.
// Este método es compatible con el entorno de Netlify y el servidor de desarrollo local.
const supabaseUrl = (typeof process !== 'undefined' && process.env) ? process.env.VITE_SUPABASE_URL : undefined;
const supabaseAnonKey = (typeof process !== 'undefined' && process.env) ? process.env.VITE_SUPABASE_ANON_KEY : undefined;


// Un indicador para saber si la aplicación está configurada para usar Supabase.
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Creamos y exportamos el cliente de Supabase. Si no están las claves, será nulo.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Mapea los datos del perfil de Supabase (con snake_case) a nuestro tipo UserProfile (con camelCase).
 */
export const mapProfileDataToUserProfile = (profileData: any): UserProfile => {
  if (!profileData) return null as any; // Devuelve null si no hay datos.
  return {
    id: profileData.id,
    email: profileData.email,
    firstName: profileData.first_name,
    lastName: profileData.last_name,
    career: profileData.career,
    score: profileData.score,
    unlockedAchievements: profileData.unlocked_achievements || {},
    completedLevels: profileData.completed_levels || {},
  };
};
