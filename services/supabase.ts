// services/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- ¡IMPORTANTE! ---
// Reemplaza estas variables con las de tu propio proyecto de Supabase.
// Puedes encontrar estas claves en la configuración de tu proyecto, en la sección "API".
// La clave "anon" es segura para ser expuesta en el frontend, ya que la seguridad
// se gestiona a través de las Políticas de Seguridad a Nivel de Fila (RLS) en tu base de datos.
const supabaseUrl = 'https://blkmxffsdxgtzoautmqz.supabase.co'; // <-- REEMPLAZA ESTO
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsa214ZmZzZHhndHpvYXV0bXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjE1ODcsImV4cCI6MjA3Njc5NzU4N30.axEq8nAp7yRRqu2qCvBnqrzM0MhGLef5PapCfhf5Fv8'; // <-- REEMPLAZA ESTO

let supabase: SupabaseClient | null = null;

// Validamos que las claves no sean las de ejemplo para evitar errores.
if (supabaseUrl && supabaseAnonKey && supabaseUrl.includes('.supabase.co') && !supabaseUrl.includes('tu-id-de-proyecto')) {
    try {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
        console.error("Error al inicializar el cliente de Supabase:", error);
    }
} else {
    // Si las claves son las de ejemplo, no inicializamos Supabase.
    // Esto evita que la aplicación intente conectarse a un proyecto inexistente.
    // La UI mostrará el "Modo Local".
    console.warn("Las credenciales de Supabase no han sido configuradas. La aplicación se ejecutará en modo local. Por favor, actualiza 'services/supabase.ts' con tus propias claves.");
}

export { supabase };
