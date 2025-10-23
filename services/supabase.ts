// services/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// TODO: REEMPLAZA ESTOS VALORES CON TUS PROPIAS CLAVES DE SUPABASE
// Puedes encontrarlas en la configuración de tu proyecto de Supabase en "Settings" > "API".
// FIX: Explicitly typing as string avoids a TypeScript error when comparing a literal string to a placeholder.
const supabaseUrl: string = 'https://blkmxffsdxgtzoautmqz.supabase.co';
const supabaseAnonKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsa214ZmZzZHhndHpvYXV0bXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjE1ODcsImV4cCI6MjA3Njc5NzU4N30.axEq8nAp7yRRqu2qCvBnqrzM0MhGLef5PapCfhf5Fv8';

let supabase: SupabaseClient | null = null;

// Solo intentar crear el cliente si las variables de entorno han sido reemplazadas.
if (supabaseUrl !== 'URL_DE_TU_PROYECTO_SUPABASE' && supabaseAnonKey !== 'TU_CLAVE_PUBLICA_ANONIMA') {
    // Usamos un bloque try-catch para manejar errores en caso de que la URL sea inválida.
    try {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
        console.error("Error al inicializar el cliente de Supabase:", error);
        // Alertar al usuario de que la configuración es incorrecta.
        alert("Error en la configuración de Supabase. Revisa que la URL en 'services/supabase.ts' sea válida.");
    }
} else {
    // Advertir en la consola que la app funcionará sin conexión a la base de datos.
    // Esto evita que la aplicación se bloquee y permite el desarrollo/uso local.
    console.warn("ADVERTENCIA: Las claves de Supabase no han sido configuradas en 'services/supabase.ts'. La aplicación funcionará en modo local sin conexión a la base de datos.");
}

// Exporta el cliente de Supabase (puede ser null si no está configurado).
export { supabase };