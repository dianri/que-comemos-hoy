import { Food, getFoodCategories } from '../types';

export interface ShareResult {
  success: boolean;
  method: 'share_file' | 'share_native' | 'clipboard' | 'aborted' | 'error';
  message?: string;
}

const FALLBACK_APP_URL = 'https://quecomemoshoy.dianrie.com';

const slugify = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

/**
 * Comparte un plato usando la Web Share API nativa con imagen (si está disponible y soportada),
 * o recurre al portapapeles con texto enriquecido formateado para WhatsApp.
 */
export const shareFood = async (
  food: Food,
  creatorDisplayName?: string
): Promise<ShareResult> => {
  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : FALLBACK_APP_URL;

  const shareUrl = `${origin}?food=${food.id}`;
  const title = `🍽️ ¡${food.name}! | ¿Qué comemos hoy?`;
  const creator = creatorDisplayName ? ` · Creado por ${creatorDisplayName}` : '';
  const descriptionPart = food.description ? `\n📝 ${food.description}` : '';

  const categoriesText = getFoodCategories(food).join(', ');
  const shareText =
    `🍽️ *${food.name}* (${categoriesText})${creator}\n` +
    `¡Mira qué plato más delicioso guardado en *Qué Comemos Hoy*!${descriptionPart}\n\n` +
    `👉 ¡Vota o gira la ruleta para decidir el menú de hoy!`;

  // 1. Intentar Web Share API nativa
  if (typeof navigator !== 'undefined' && navigator.share) {
    // A. Intentar compartir con fichero de imagen si el navegador lo soporta
    if (food.image_url && typeof navigator.canShare === 'function') {
      try {
        const res = await fetch(food.image_url, { mode: 'cors' });
        if (res.ok) {
          const blob = await res.blob();
          const mimeType = blob.type || 'image/jpeg';
          const ext = mimeType.includes('png') ? 'png' : 'jpg';
          const file = new File([blob], `${slugify(food.name)}.${ext}`, {
            type: mimeType,
          });

          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title,
              text: `${shareText}\n${shareUrl}`,
              files: [file],
            });
            return {
              success: true,
              method: 'share_file',
              message: '¡Plato compartido con imagen!',
            };
          }
        }
      } catch (err: unknown) {
        const error = err as { name?: string };
        if (error?.name === 'AbortError') {
          return { success: false, method: 'aborted' };
        }
        // Si falla por CORS o fichero no permitido, continuar con el share nativo de texto
      }
    }

    // B. Compartir nativo estándar con texto y URL
    try {
      await navigator.share({
        title,
        text: shareText,
        url: shareUrl,
      });
      return {
        success: true,
        method: 'share_native',
        message: '¡Plato compartido con éxito!',
      };
    } catch (err: unknown) {
      const error = err as { name?: string };
      if (error?.name === 'AbortError') {
        return { success: false, method: 'aborted' };
      }
      // Si falla, continuar al fallback de portapapeles
    }
  }

  // 2. Fallback: Copiar texto formateado y enlace al portapapeles
  try {
    const clipboardContent = `${shareText}\n\n🔗 ${shareUrl}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(clipboardContent);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = clipboardContent;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }

    return {
      success: true,
      method: 'clipboard',
      message: '¡Enlace y detalles copiados para compartir!',
    };
  } catch (err) {
    console.error('Error al copiar al portapapeles:', err);
    return {
      success: false,
      method: 'error',
      message: 'No se pudo compartir el plato.',
    };
  }
};
