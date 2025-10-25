// services/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- ¡IMPORTANTE! ---
// Ahora leeremos las claves desde las variables de entorno.
// Esto es más seguro y permite diferentes configuraciones para desarrollo y producción.
// Netlify (y otros servicios de hosting) inyectarán estas variables durante el proceso de build.
// Usamos el prefijo VITE_PUBLIC_ por convención para que estén disponibles en el código del navegador.
const supabaseUrl = process.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_PUBLIC_SUPABASE_KEY;

let supabase: SupabaseClient | null = null;

// Validamos que las variables de entorno existan antes de crear el cliente.
if (supabaseUrl && supabaseAnonKey) {
    try {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
        console.error("Error al inicializar el cliente de Supabase:", error);
    }
} else {
    // Si las variables no están definidas, la aplicación se ejecutará en modo local.
    // La UI mostrará el "Modo Local".
    console.warn("Las variables de entorno de Supabase (VITE_PUBLIC_SUPABASE_URL, VITE_PUBLIC_SUPABASE_KEY) no han sido configuradas. La aplicación se ejecutará en modo local.");
}

export { supabase };