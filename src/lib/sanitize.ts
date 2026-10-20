/**
 * sanitize.ts — Utilidades de seguridad: sanitización de texto e imágenes.
 *
 * React escapa el JSX por defecto, pero sanitizamos en el punto de entrada
 * (inputs del usuario) para garantizar que los datos almacenados en Supabase
 * estén limpios y nunca contengan etiquetas HTML, scripts ni esquemas peligrosos.
 */

/** URL de imagen de reserva cuando la original es inválida o peligrosa */
export const SAFE_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80';

/**
 * Elimina cualquier etiqueta HTML del texto y recorta espacios.
 * Útil para limpiar nombres de platos, descripciones y nombres de usuario
 * antes de guardarlos en Supabase o en localStorage.
 */
export const sanitizeText = (input: string): string =>
  input.replace(/<[^>]*>/g, '').trim();

/**
 * Valida que una URL sea segura para usarse como `src` de imagen:
 *   - Debe comenzar estrictamente por `https://`
 *   - Bloquea `javascript:`, `data:`, `vbscript:` y cualquier otro esquema
 * Devuelve `true` si la URL es aceptable, `false` en caso contrario.
 */
export const isSafeImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Devuelve la URL de imagen si es segura, o la imagen de reserva si no lo es.
 * Usar al asignar el estado `imgSrc` en FoodCard o en los formularios.
 */
export const safeImageUrl = (url: string | null | undefined): string => {
  if (!url) return SAFE_FALLBACK_IMAGE;
  return isSafeImageUrl(url) ? url : SAFE_FALLBACK_IMAGE;
};
