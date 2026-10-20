/**
 * toast.ts — Sistema global y ligero de notificaciones Toast sin dependencias externas.
 */

export interface ToastEventDetail {
  message: string;
  type?: 'success' | 'info' | 'error';
  duration?: number;
}

export const showToast = (
  message: string,
  type: 'success' | 'info' | 'error' = 'success',
  duration = 2600
): void => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent<ToastEventDetail>('app-toast', {
        detail: { message, type, duration },
      })
    );
  }
};
