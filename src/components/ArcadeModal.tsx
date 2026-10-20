import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ExternalLink, Gamepad2, RotateCcw, Smartphone, Maximize2 } from 'lucide-react';

interface ArcadeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ARKANOID_URL = 'https://dianri.github.io/Arkanoid_Game/';

// Dimensiones fijas nativas del contenedor del juego Arkanoid (canvas 800x600 + cabina + HUD)
const GAME_WIDTH = 864;
const GAME_HEIGHT = 790;

export const ArcadeModal: React.FC<ArcadeModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Inicialización inteligente de escala según tamaño de ventana para evitar parpadeos
  const [scale, setScale] = useState(() => {
    if (typeof window !== 'undefined') {
      const availW = Math.max(window.innerWidth - 24, 200);
      const availH = Math.max(window.innerHeight * 0.72, 200);
      return Math.min(availW / GAME_WIDTH, availH / GAME_HEIGHT, 1);
    }
    return 1;
  });

  // Cálculo dinámico de la escala uniforme para que el juego se ajuste 100% visible
  const updateScale = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    if (!clientWidth || !clientHeight) return;

    // Margen de seguridad interior (padding)
    const paddingX = 12;
    const paddingY = 12;
    const availW = Math.max(clientWidth - paddingX, 100);
    const availH = Math.max(clientHeight - paddingY, 100);

    const scaleX = availW / GAME_WIDTH;
    const scaleY = availH / GAME_HEIGHT;
    // Escala uniforme: ajusta al ancho y alto disponible sin deformar ni cortar nada
    const fittedScale = Math.min(scaleX, scaleY);

    // Permitir escalar hacia abajo en móvil y limitar hasta 1.05 en pantallas grandes
    setScale(Math.min(fittedScale, 1.05));
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Medición tras pintar el modal
    const rafId = requestAnimationFrame(() => {
      updateScale();
    });

    window.addEventListener('resize', updateScale);
    window.addEventListener('orientationchange', updateScale);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateScale();
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateScale);
      window.removeEventListener('orientationchange', updateScale);
      resizeObserver?.disconnect();
    };
  }, [isOpen, updateScale]);

  if (!isOpen) return null;

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-1.5 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-zinc-950 rounded-2xl sm:rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col h-[94vh] sm:h-[84vh] max-h-[840px] animate-scale-up">
        {/* Cabecera estilo Arcade Neon */}
        <div className="relative px-3 py-2.5 sm:px-6 sm:py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2 sm:space-x-2.5 min-w-0 pr-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-xs shrink-0">
              <Gamepad2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <h3 className="text-xs sm:text-sm font-black text-white tracking-wider uppercase font-mono truncate">
                  Arkanoid Retro
                </h3>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase shrink-0">
                  Pixel Edition
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-zinc-400 font-mono truncate hidden xs:block">
                🎮 ¡Rompe bloques mientras decides qué comer!
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
            {/* Botón para reiniciar juego */}
            <button
              type="button"
              onClick={handleReload}
              className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Reiniciar juego"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Enlace para abrir en pestaña nueva a pantalla completa */}
            <a
              href={ARKANOID_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-cyan-400 hover:bg-zinc-800 transition-colors"
              title="Abrir a pantalla completa en una nueva pestaña"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Botón cerrar */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/40 border border-transparent transition-colors"
              title="Cerrar juego y volver"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-300" />
            </button>
          </div>
        </div>

        {/* Banner informativo de adaptabilidad para dispositivos móviles */}
        <div className="sm:hidden px-2.5 py-1.5 bg-gradient-to-r from-cyan-950/70 via-zinc-900 to-cyan-950/70 border-b border-cyan-800/30 text-[10.5px] font-mono text-cyan-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-1.5 truncate pr-2">
            <Smartphone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">Gira el móvil en horizontal para mayor comodidad</span>
          </div>
          <a
            href={ARKANOID_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-2 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 text-[9.5px] font-bold flex items-center space-x-1 transition-colors"
            title="Abrir juego a pantalla completa"
          >
            <Maximize2 className="w-2.5 h-2.5" />
            <span>Pantalla Completa</span>
          </a>
        </div>

        {/* Contenedor del Iframe con Loader y Escalado Dinámico Inteligente */}
        <div
          ref={containerRef}
          className="relative flex-1 bg-[#070a12] overflow-hidden flex items-center justify-center p-1 sm:p-3 select-none"
          style={{ touchAction: 'none' }}
        >
          {isLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950 text-cyan-400 space-y-3 font-mono">
              <div className="w-10 h-10 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
              <p className="text-xs text-zinc-400 tracking-widest animate-pulse">
                CARGANDO ARKANOID...
              </p>
            </div>
          )}

          {/* Wrapper exterior con las dimensiones visuales exactas calculadas tras escalar */}
          <div
            className="relative flex-shrink-0 shadow-2xl rounded-xl sm:rounded-2xl overflow-hidden border border-cyan-900/30 bg-[#0b0f1a]"
            style={{
              width: `${Math.round(GAME_WIDTH * scale)}px`,
              height: `${Math.round(GAME_HEIGHT * scale)}px`,
            }}
          >
            {/* Contenedor interior de dimensiones nativas fijas transformado mediante CSS scale */}
            <div
              style={{
                width: `${GAME_WIDTH}px`,
                height: `${GAME_HEIGHT}px`,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            >
              <iframe
                key={iframeKey}
                src={ARKANOID_URL}
                title="Arkanoid Arcade Game"
                onLoad={() => setIsLoading(false)}
                className="w-full h-full border-0 block"
                allow="fullscreen; autoplay; keyboard"
                scrolling="no"
              />
            </div>
          </div>
        </div>

        {/* Pie de acciones del modal */}
        <div className="px-3 py-2 sm:px-6 sm:py-2.5 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400 flex-shrink-0">
          <span className="hidden sm:inline text-[11px] text-zinc-400">
            🕹️ Usa las flechas ← → o arrastra el dedo / ratón para mover la nave
          </span>
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <a
              href={ARKANOID_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-colors flex items-center space-x-1"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Pantalla Completa</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-[11px] transition-colors active:scale-95 shadow-md shadow-orange-600/30"
            >
              Volver a la carta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
