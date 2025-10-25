// services/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- Configuración de Supabase ---
// Este es el enfoque recomendado para la comunicación con Supabase en una aplicación Jamstack.
// Las credenciales se obtienen de las variables de entorno, que es una práctica recomendada
// para producción (pueden ser configuradas en Netlify). Si no se encuentran, se utilizan
// los valores hardcodeados para facilitar el desarrollo local.

// NOTA: Las variables de entorno en el frontend usualmente requieren un prefijo específico 
// del entorno de construcción (ej. VITE_ o REACT_APP_). Aquí asumimos que el entorno de 
// despliegue las hace disponibles.
const supabaseUrl = (window as any).process?.env?.SUPABASE_URL || 'https://blkmxffsdxgtzoautmqz.supabase.co';
const supabaseAnonKey = (window as any).process?.env?.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsa214ZmZzZHhndHpvYXV0bXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjE1ODcsImV4cCI6MjA3Njc5NzU4N30.axEq8nAp7yRRqu2qCvBnqrzM0MhGLef5PapCfhf5Fv8';

// --- Inicialización del Cliente ---
// Se crea una única instancia del cliente de Supabase que se exportará y utilizará
// en toda la aplicación. La comunicación ocurre directamente desde el navegador del
// usuario a los servidores de Supabase, lo cual es eficiente y funciona de la misma
// manera tanto en desarrollo local como en un hosting como Netlify.

let supabase: SupabaseClient | null = null;

// Realizamos una validación para asegurarnos de que las credenciales son válidas
// antes de intentar crear el cliente. La clave 'anon' es segura para ser expuesta,
// ya que la seguridad se gestiona a través de las Políticas de Seguridad a Nivel de Fila (RLS)
// en la base de datos de Supabase.
if (supabaseUrl && supabaseAnonKey && supabaseUrl.includes('.supabase.co')) {
    try {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
        console.error("Error al inicializar el cliente de Supabase:", error);
    }
} else {
    // Si las credenciales no son válidas o están ausentes, la aplicación
    // entrará en un "Modo Local" y mostrará una advertencia en la UI.
    console.warn("Las credenciales de Supabase no han sido configuradas o son inválidas. La aplicación se ejecutará en modo local.");
}

export { supabase };
