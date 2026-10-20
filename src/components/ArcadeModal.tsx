import React, { useState } from 'react';
import { X, ExternalLink, Gamepad2, RotateCcw } from 'lucide-react';

interface ArcadeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ARKANOID_URL = 'https://dianri.github.io/Arkanoid_Game/';

export const ArcadeModal: React.FC<ArcadeModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

  if (!isOpen) return null;

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-zinc-950 rounded-2xl sm:rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col h-[90vh] sm:h-[84vh] max-h-[820px] animate-scale-up">
        {/* Cabecera estilo Arcade Neon */}
        <div className="relative px-3.5 py-2.5 sm:px-6 sm:py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-xs">
              <Gamepad2 className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="text-xs sm:text-sm font-black text-white tracking-wider uppercase font-mono">
                  Arkanoid Retro Arcade
                </h3>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                  Pixel Edition
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-zinc-400 font-mono truncate">
                🎮 ¡Rompe bloques mientras decides qué comer!
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
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

        {/* Contenedor del Iframe con Loader */}
        <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950 text-cyan-400 space-y-3 font-mono">
              <div className="w-10 h-10 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
              <p className="text-xs text-zinc-400 tracking-widest animate-pulse">
                CARGANDO ARKANOID...
              </p>
            </div>
          )}

          <iframe
            key={iframeKey}
            src={ARKANOID_URL}
            title="Arkanoid Arcade Game"
            onLoad={() => setIsLoading(false)}
            className="w-full h-full border-0"
            allow="fullscreen; autoplay; keyboard"
          />
        </div>

        {/* Pie de acciones del modal */}
        <div className="px-3 py-2 sm:px-6 sm:py-2.5 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400 flex-shrink-0">
          <span className="hidden sm:inline text-[11px] text-zinc-400">
            🕹️ Usa las flechas ← → o el ratón / táctil para mover la nave
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
