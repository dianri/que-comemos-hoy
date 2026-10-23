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

/** Extensiones de archivos de documentos, texto o ejecutables no fotográficos */
export const BANNED_DOC_EXTENSIONS =
  /\.(pdf|docx?|xlsx?|pptx?|txt|rtf|csv|zip|rar|tar|gz|html?|php|asp|aspx|jsp|xml|json)(\?.*)?$/i;

/** Dominios o subdominios donde suelen alojarse boletines oficiales o documentos institucionales */
export const BANNED_DOC_DOMAINS =
  /(^|\.)(boe\.es|borme\.es|bocm\.es|bop\.es|gob\.es|sede\.|junta-andalucia\.es|madrid\.org|gencat\.cat|xunta\.gal|diputacion)/i;

/**
 * Elimina cualquier etiqueta HTML del texto y recorta espacios.
 * Útil para limpiar nombres de platos, descripciones y nombres de usuario
 * antes de guardarlos en Supabase o en localStorage.
 */
export const sanitizeText = (input: string): string =>
  input.replace(/<[^>]*>/g, '').trim();

/**
 * Valida que una URL sea segura para usarse en la aplicación:
 *   - Debe comenzar estrictamente por `https://`
 *   - Bloquea `javascript:`, `data:`, `vbscript:` y cualquier otro esquema
 *   - Desparasita y bloquea extensiones de documentos (PDF, DOC, etc.) y sedes oficiales
 * Devuelve `true` si la URL es aceptable, `false` en caso contrario.
 */
export const isSafeImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') return false;

    // Descartar extensiones de documentos no fotográficos (ej. PDF, DOCX, TXT)
    if (BANNED_DOC_EXTENSIONS.test(parsed.pathname)) {
      return false;
    }

    // Descartar portales gubernamentales o boletines oficiales donde suelen alojarse PDFs
    if (BANNED_DOC_DOMAINS.test(parsed.hostname)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

/**
 * Valida de forma estricta que la URL apunte a un recurso fotográfico/imagen válido
 * (.jpg, .jpeg, .png, .webp, .avif o CDNs reconocidos de imágenes) y no a páginas web o documentos.
 */
export const isPhotoImageUrl = (url: string): boolean => {
  if (!isSafeImageUrl(url)) return false;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    const pathname = parsed.pathname.toLowerCase();

    // 1. Si termina con extensión de imagen raster conocida
    if (/\.(jpe?g|png|webp|avif)$/i.test(pathname)) {
      return true;
    }

    // 2. Si proviene de CDNs o servicios de imágenes donde los parámetros controlan el formato
    const trustedImageHosts = [
      'images.unsplash.com',
      'upload.wikimedia.org',
      'images.pexels.com',
      'themealdb.com',
      'res.cloudinary.com',
      'googleusercontent.com',
      'supabase.co',
      'images.squarespace-cdn.com',
      'cdn.pixabay.com',
    ];

    if (trustedImageHosts.some((host) => parsed.hostname.includes(host))) {
      return true;
    }

    // 3. Si en los parámetros de la URL se especifica un formato de imagen válido
    const formatParam = parsed.searchParams.get('format') || parsed.searchParams.get('fm');
    if (formatParam && /^(jpe?g|png|webp|avif)$/i.test(formatParam)) {
      return true;
    }

    // Descartar archivos SVG (suelen ser banderas, logos, diagramas o iconos en lugar de fotos de comida)
    if (/\.svg$/i.test(pathname)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

/**
 * Devuelve la URL de imagen si es segura y válida, o la imagen de reserva si no lo es.
 * Usar al asignar el estado `imgSrc` en FoodCard o en los formularios.
 */
export const safeImageUrl = (url: string | null | undefined): string => {
  if (!url) return SAFE_FALLBACK_IMAGE;
  return isPhotoImageUrl(url) ? url : SAFE_FALLBACK_IMAGE;
};
