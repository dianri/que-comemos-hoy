import React, { useState, useEffect, useCallback } from 'react';
import { Download, X, Share, PlusSquare, Smartphone, Check } from 'lucide-react';
import { showToast } from '../lib/toast';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const STORAGE_KEY_DISMISSED = 'que_comemos_pwa_dismissed';
const STORAGE_KEY_INSTALLED = 'que_comemos_pwa_installed';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

export const PwaInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Comprobar si ya está instalada o ejecutándose en modo standalone
  const checkIsStandalone = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const isStandaloneDisplay = window.matchMedia('(display-mode: standalone)').matches;
    const isIosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    const isAndroidApp = document.referrer.includes('android-app://');
    return isStandaloneDisplay || isIosStandalone || isAndroidApp;
  }, []);

  // Comprobar si el usuario desestimó el aviso recientemente
  const checkIsDismissed = useCallback(() => {
    try {
      const dismissedAt = localStorage.getItem(STORAGE_KEY_DISMISSED);
      if (!dismissedAt) return false;
      const timestamp = parseInt(dismissedAt, 10);
      if (isNaN(timestamp)) return false;
      return Date.now() - timestamp < DISMISS_DURATION_MS;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    // Si ya está instalada en modo standalone, nunca mostrar el banner
    if (checkIsStandalone()) {
      return;
    }

    // Detectar si el dispositivo es iOS (Safari)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIos(isIosDevice);

    // 1. Escuchar el evento estándar beforeinstallprompt (Android, Chrome, Edge, Escritorio)
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevenir el banner nativo del navegador para controlarlo nosotros
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Mostrar el banner personalizado solo si no ha sido desestimado recientemente
      if (!checkIsDismissed()) {
        setIsVisible(true);
      }
    };

    // 2. Escuchar cuando la aplicación se instale con éxito
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsVisible(false);
      setShowIosGuide(false);
      try {
        localStorage.setItem(STORAGE_KEY_INSTALLED, 'true');
      } catch {}
      showToast('¡"Qué comemos hoy" se ha instalado correctamente! 🎉', 'success', 3500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // En dispositivos iOS Safari, sugerir la instalación si no ha sido descartado
    if (isIosDevice && !checkIsDismissed()) {
      // Pequeño retardo para no saturar al usuario nada más entrar
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2500);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [checkIsDismissed, checkIsStandalone]);

  // Manejar acción de instalación
  const handleInstallClick = async () => {
    if (isIos) {
      // En iOS mostrar guía paso a paso
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) {
      // Fallback si el evento se perdió
      showToast('Para instalar: abre el menú de tu navegador y pulsa "Instalar aplicación"', 'info', 4000);
      return;
    }

    try {
      setIsInstalling(true);
      // Lanzar el cuadro de diálogo nativo del sistema
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        setIsVisible(false);
        setDeferredPrompt(null);
      }
    } catch (err) {
      console.warn('Error durante la instalación de la PWA:', err);
    } finally {
      setIsInstalling(false);
    }
  };

  // Desestimar banner
  const handleDismiss = () => {
    setIsVisible(false);
    setShowIosGuide(false);
    try {
      localStorage.setItem(STORAGE_KEY_DISMISSED, Date.now().toString());
    } catch {}
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Banner flotante principal */}
      <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl shadow-orange-950/15 border border-orange-200/90 p-3.5 sm:p-4 text-slate-800">
          <div className="flex items-start justify-between gap-3">
            {/* Icono de la app */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 flex items-center justify-center text-white text-2xl shadow-md shadow-orange-500/30 flex-shrink-0 select-none">
              🍽️
            </div>

            {/* Contenido descriptivo */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center space-x-1.5">
                <h4 className="text-sm font-black text-slate-900 tracking-tight">
                  Instala la aplicación
                </h4>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                  App
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                Acceso más rápido y sin barras de navegador en tu móvil o PC.
              </p>
            </div>

            {/* Botón cerrar */}
            <button
              type="button"
              onClick={handleDismiss}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0 cursor-pointer"
              title="Cerrar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Botones de acción */}
          <div className="mt-3 flex items-center justify-end space-x-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={handleDismiss}
              className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Ahora no
            </button>
            <button
              type="button"
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 transition-all flex items-center space-x-1.5 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isInstalling ? (
                <span>Instalando...</span>
              ) : isIos ? (
                <>
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Ver cómo instalar</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Instalar gratis</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal Guía para iOS Safari */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-orange-200 text-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center text-lg">
                  🍽️
                </div>
                <h3 className="font-bold text-sm text-slate-900">Instalar en iPhone o iPad</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs text-slate-600">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                  1
                </div>
                <div>
                  Pulsa el botón <strong>Compartir</strong> en la barra inferior de Safari{' '}
                  <span className="inline-flex items-center px-1 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold align-middle">
                    <Share className="w-3 h-3 text-blue-600 inline mr-0.5" /> Compartir
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                  2
                </div>
                <div>
                  Desplázate hacia abajo y selecciona{' '}
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold align-middle">
                    <PlusSquare className="w-3 h-3 text-slate-700 inline mr-1" /> Añadir a pantalla de inicio
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                  3
                </div>
                <div>
                  Pulsa <strong>Añadir</strong> en la esquina superior derecha. ¡Listo! Ya tendrás el icono en tu pantalla como una app nativa.
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowIosGuide(false);
                  setIsVisible(false);
                  try {
                    localStorage.setItem(STORAGE_KEY_DISMISSED, Date.now().toString());
                  } catch {}
                }}
                className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 transition-all flex items-center justify-center space-x-1 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Entendido</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
