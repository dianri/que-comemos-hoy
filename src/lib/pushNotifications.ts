import { supabase } from './supabase';

export const VAPID_PUBLIC_KEY =
  import.meta.env.VITE_VAPID_PUBLIC_KEY ||
  'BAOyoa5CuFQERDh9Cssf3SNjra0PLYT95ewEQ48sOfWBKNKdo2mQEup925BlZP1RR4NpHNUSGeTqJ6we5tACr2o';

/**
 * Convierte una clave VAPID pública codificada en Base64URL a un Uint8Array requerido por el PushManager del navegador.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Comprueba si el navegador actual soporta Service Worker, Push API y Notificaciones.
 */
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Obtiene el estado actual del permiso de notificaciones en el navegador.
 */
export function getPushPermission(): NotificationPermission | 'unsupported' {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Verifica si el navegador actual ya cuenta con una suscripción Push activa.
 */
export async function isSubscribedToPush(): Promise<boolean> {
  if (!isPushSupported()) return false;
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
  } catch (err) {
    console.error('Error al comprobar suscripción push:', err);
    return false;
  }
}

/**
 * Solicita permiso de notificaciones al usuario, crea la suscripción con las claves VAPID
 * y la guarda en la base de datos de Supabase en public.push_subscriptions.
 */
export async function subscribeUserToPush(
  userId: string,
  userEmail: string
): Promise<{ success: boolean; message?: string; error?: unknown }> {
  if (!isPushSupported()) {
    return {
      success: false,
      message: 'Las notificaciones Push no están soportadas en este navegador o dispositivo.',
    };
  }

  try {
    // 1. Solicitar permisos de notificación si aún no se han concedido
    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      return {
        success: false,
        message:
          permission === 'denied'
            ? 'Permiso de notificaciones denegado en tu navegador. Habilítalo en los ajustes del sitio.'
            : 'No se concedió permiso para enviar notificaciones.',
      };
    }

    // 2. Esperar a que el Service Worker esté activo
    const registration = await navigator.serviceWorker.ready;

    // 3. Obtener suscripción existente o crear una nueva
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
    }

    // 4. Guardar la suscripción en Supabase
    const subscriptionJson = subscription.toJSON();
    const endpoint = subscription.endpoint;

    const { error: dbError } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: userId,
          user_email: userEmail,
          endpoint,
          subscription: subscriptionJson,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'endpoint' }
      );

    if (dbError) {
      console.error('Error al guardar la suscripción push en Supabase:', dbError);
      throw dbError;
    }

    return {
      success: true,
      message: '¡Notificaciones push activadas con éxito! Recibirás avisos de nuevos platos.',
    };
  } catch (err) {
    console.error('Error durante la suscripción push:', err);
    return {
      success: false,
      message: 'No se pudo completar la suscripción push. Inténtalo de nuevo.',
      error: err,
    };
  }
}

/**
 * Cancela la suscripción Push en el navegador y la elimina de Supabase.
 */
export async function unsubscribeUserFromPush(
  userId?: string
): Promise<{ success: boolean; message?: string }> {
  if (!isPushSupported()) {
    return { success: false, message: 'Push no soportado.' };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      // Eliminar de Supabase
      let query = supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
      if (userId) {
        query = query.eq('user_id', userId);
      }
      await query;
    }

    return {
      success: true,
      message: 'Notificaciones push desactivadas.',
    };
  } catch (err) {
    console.error('Error al desactivar suscripción push:', err);
    return {
      success: false,
      message: 'Error al desactivar las notificaciones push.',
    };
  }
}

/**
 * Invoca la Edge Function de Supabase para despachar una notificación push
 * a los administradores cuando se envía una nueva solicitud de plato.
 */
export async function triggerPushNotification(payload: {
  foodId?: string;
  foodName: string;
  creatorName?: string;
  userEmail?: string;
}): Promise<void> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://okieuqjwrxcmfnsmtjwn.supabase.co';
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-push-notification`;

    await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        food_id: payload.foodId,
        food_name: payload.foodName,
        creator_name: payload.creatorName || payload.userEmail || 'Un usuario',
        title: '🛎️ Nuevo plato pendiente de revisión',
        body: `«${payload.foodName}» espera aprobación para la carta general.`,
        url: '/?openModeration=true',
      }),
    });
  } catch (err) {
    // Es un disparo asíncrono secundario (el trigger de la BD ya asegura el despacho)
    console.warn('Aviso al disparar notificación push manual:', err);
  }
}
