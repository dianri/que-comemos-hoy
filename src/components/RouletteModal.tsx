import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { X, Sparkles, Trophy, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Food } from '../types';
import { playConfettiPop, playRouletteTick, isSoundMuted, setSoundMuted, getAudioContext } from '../lib/sound';

interface RouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  foods: Food[];
  onSelectWinner?: (food: Food) => void;
  subtitle?: string;
}

// Paleta viva con contraste óptimo para tipografía oscura
const SLICE_COLORS = [
  '#FDE047', // Amarillo brillante
  '#FB923C', // Naranja suave
  '#86EFAC', // Verde menta
  '#93C5FD', // Azul cielo
  '#F472B6', // Rosa vibrante
  '#C084FC', // Violeta claro
  '#67E8F9', // Cian pastel
  '#FCA5A5', // Rojo coral suave
  '#FBBF24', // Ámbar dorado
  '#5EEAD4', // Turquesa
  '#A7F3D0', // Esmeralda suave
  '#DDD6FE', // Lavanda
];

export const RouletteModal: React.FC<RouletteModalProps> = ({
  isOpen,
  onClose,
  foods,
  onSelectWinner,
  subtitle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Food | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(() => isSoundMuted());
  const currentAngleRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  // Función de renderizado del Canvas con centrado perfecto del texto
  const drawWheel = useCallback(
    (angle: number) => {
      const canvas = canvasRef.current;
      if (!canvas || foods.length === 0) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width / 2; // Compensación por retina scale (2x)
      const height = canvas.height / 2;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(centerX, centerY) - 14;
      const innerRadius = 32;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const numSlices = foods.length;
      const arc = (2 * Math.PI) / numSlices;

      // 1. Sombra exterior difusa para dar profundidad a la ruleta
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 2, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();

      // 2. Dibujar cada segmento (quesito)
      for (let i = 0; i < numSlices; i++) {
        const sliceStartAngle = angle + i * arc;
        const sliceEndAngle = sliceStartAngle + arc;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, sliceStartAngle, sliceEndAngle);
        ctx.closePath();

        ctx.fillStyle = SLICE_COLORS[i % SLICE_COLORS.length];
        ctx.fill();

        // Borde fino separador entre sectores
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#18181b';
        ctx.stroke();

        // 3. Dibujar el texto del plato centrado en el segmento
        ctx.save();
        ctx.translate(centerX, centerY);
        // Rotar al punto medio exacto del arco del sector
        ctx.rotate(sliceStartAngle + arc / 2);

        // Posición radial equidistante entre el centro interior y el borde exterior
        const midRadius = innerRadius + (radius - innerRadius) / 2;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#18181b'; // zinc-900 oscuro para máxima legibilidad
        ctx.font = 'bold 12px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

        // Truncar con elipsis si el texto supera el espacio disponible
        const maxTextWidth = radius - innerRadius - 18;
        const foodName = foods[i].name;
        let displayText = foodName;

        if (ctx.measureText(displayText).width > maxTextWidth) {
          while (displayText.length > 2 && ctx.measureText(displayText + '…').width > maxTextWidth) {
            displayText = displayText.slice(0, -1);
          }
          displayText += '…';
        }

        ctx.fillText(displayText, midRadius, 0);
        ctx.restore();
      }

      // 4. Borde exterior oscuro para definir la ruleta claramente contra el fondo blanco
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#18181b';
      ctx.stroke();

      // 5. Centro decorativo de la ruleta (eje)
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#18181b';
      ctx.stroke();
      ctx.restore();

      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius - 8, 0, 2 * Math.PI);
      ctx.fillStyle = '#ea580c';
      ctx.fill();

      // Icono de cubiertos en el centro
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🍽️', centerX, centerY);
    },
    [foods]
  );

  // Inicializar canvas al abrir el modal o cambiar platos
  useEffect(() => {
    if (isOpen) {
      setWinner(null);
      const canvas = canvasRef.current;
      if (canvas) {
        const size = Math.min(window.innerWidth - 64, 330);
        // Doble resolución para pantallas Retina/HiDPI
        canvas.width = size * 2;
        canvas.height = size * 2;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.resetTransform();
          ctx.scale(2, 2);
        }
      }
      drawWheel(currentAngleRef.current);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpen, drawWheel]);

  // Lógica del Giro con Sincronización Matemática 100% Precisa con la Flecha Superior
  const spin = () => {
    if (isSpinning || foods.length === 0) return;
    // Desbloquear / activar AudioContext en el evento click del usuario
    getAudioContext();
    setIsSpinning(true);
    setWinner(null);

    const numSlices = foods.length;
    const arc = (2 * Math.PI) / numSlices;

    // 1. Elegir de antemano el índice ganador aleatorio
    const winningIndex = Math.floor(Math.random() * numSlices);
    const winningFood = foods[winningIndex];

    // 2. La flecha fija está en las 12 en punto: ángulo -PI/2 (o 3*PI/2)
    const POINTER_ANGLE = 3 * Math.PI / 2;

    // 3. El centro del sector ganador dentro de la ruleta
    // Para que caiga de forma natural y variada, añadimos un pequeño offset aleatorio dentro del sector
    const randomOffset = (Math.random() - 0.5) * (arc * 0.6); // Dentro del 60% central del quesito
    const sliceCenterAngleOnWheel = winningIndex * arc + arc / 2 + randomOffset;

    // 4. Calcular el ángulo objetivo final que sitúa este sector bajo la flecha superior
    // Condición: (targetAngle + sliceCenterAngleOnWheel) % 2PI == POINTER_ANGLE
    const currentAngle = currentAngleRef.current;
    const currentNormalized = ((currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const desiredNormalized = ((POINTER_ANGLE - sliceCenterAngleOnWheel) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);

    let deltaAngle = desiredNormalized - currentNormalized;
    if (deltaAngle < 0) {
      deltaAngle += 2 * Math.PI;
    }

    // Añadir entre 5 y 8 vueltas completas para que el giro sea espectacular
    const fullSpins = 6 + Math.floor(Math.random() * 3);
    const totalRotation = fullSpins * 2 * Math.PI + deltaAngle;
    const targetAngle = currentAngle + totalRotation;

    const duration = 4500; // 4.5 segundos de giro
    const startTime = performance.now();
    let lastTickIndex = -1;

    // Curva de desaceleración suave (ease-out cubic)
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const frameAngle = currentAngle + totalRotation * easedProgress;
      currentAngleRef.current = frameAngle;
      drawWheel(frameAngle);

      // Calcular qué sector pasa bajo la flecha en cada fotograma para el sonido del tick
      const normalizedPointer =
        ((POINTER_ANGLE - (frameAngle % (2 * Math.PI))) % (2 * Math.PI) + 2 * Math.PI) %
        (2 * Math.PI);
      const activeSlice = Math.floor(normalizedPointer / arc) % numSlices;

      if (activeSlice !== lastTickIndex) {
        lastTickIndex = activeSlice;
        playRouletteTick();
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Asegurar que termina exactamente en targetAngle
        currentAngleRef.current = targetAngle;
        drawWheel(targetAngle);
        setIsSpinning(false);

        // Breve pausa para apreciar la posición final de la flecha antes del festejo
        setTimeout(() => {
          setWinner(winningFood);

          // Efecto de sonido alegre "Pop de Confeti" sincronizado con la animación
          playConfettiPop();

          // Explosión de confeti festivo
          confetti({
            particleCount: 130,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#f97316', '#ef4444', '#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
          });
        }, 300);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Encabezado fijo superior */}
        <div className="relative px-4 pt-3.5 pb-2 sm:px-6 sm:pt-4 sm:pb-3 text-center border-b border-slate-100 flex-shrink-0 bg-white">
          {/* Controles de cabecera: Silenciar y Cerrar */}
          <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 flex items-center space-x-1">
            <button
              type="button"
              onClick={() => {
                const next = !isMuted;
                setIsMuted(next);
                setSoundMuted(next);
              }}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title={isMuted ? 'Activar sonido de la ruleta y confeti' : 'Silenciar sonido'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              ) : (
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
              )}
            </button>

            <button
              onClick={onClose}
              disabled={isSpinning}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40"
              title="Cerrar ruleta"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-orange-100 text-orange-700 mb-0.5">
            <Sparkles className="w-3 h-3 text-orange-500" />
            <span>Ruleta de la Suerte</span>
          </span>
          <h2 className="text-base sm:text-xl font-extrabold text-slate-800 leading-tight">
            ¿Qué comeremos hoy?
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 truncate max-w-[260px] sm:max-w-xs mx-auto">
            {subtitle || `${foods.length} platos en la ruleta. ¡Deja que el destino decida!`}
          </p>
        </div>

        {/* Cuerpo con scroll interior para la ruleta y la tarjeta del ganador */}
        <div className="flex-1 overflow-y-auto px-3.5 py-2.5 sm:px-6 sm:py-3 flex flex-col items-center scrollbar-none">
          {/* Contenedor de la Ruleta y la Flecha Puntero Superior */}
          <div className="relative my-1 flex items-center justify-center flex-shrink-0">
            {/* Flecha Puntero Superior (12 en punto) Prominente y Definida */}
            <div className="absolute -top-3.5 z-20 flex flex-col items-center pointer-events-none drop-shadow-md">
              <div className="relative">
                <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[26px] border-t-zinc-900" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[13px] border-l-transparent border-r-[13px] border-r-transparent border-t-[22px] border-t-red-600" />
              </div>
              <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-zinc-900 shadow -mt-5 z-10" />
            </div>

            {/* Canvas de la Ruleta */}
            <canvas ref={canvasRef} className="rounded-full select-none" />
          </div>

          {/* Tarjeta del Plato Ganador */}
          {winner && (
            <div className="mt-2.5 w-full bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-orange-300 rounded-2xl p-3 text-center animate-bounce-subtle shadow-xs">
              <div className="flex items-center justify-center space-x-1.5 text-amber-600 mb-0.5">
                <Trophy className="w-4 h-4 text-amber-500 animate-pulse" />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">¡Plato Seleccionado!</span>
              </div>
              <h3 className="text-base sm:text-xl font-black text-slate-900 mb-1 leading-snug">
                🎉 ¡Hoy toca: {winner.name}!
              </h3>

              {winner.image_url && (
                <div className="relative h-28 sm:h-36 w-full rounded-xl overflow-hidden shadow-xs my-1.5 border border-orange-200">
                  <img
                    src={winner.image_url}
                    alt={winner.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/70 text-white backdrop-blur-sm">
                    {winner.category}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Barra inferior fija (Sticky Footer) con las acciones siempre visibles */}
        <div className="sticky bottom-0 z-30 w-full bg-white/95 backdrop-blur-md px-3.5 py-2.5 sm:px-6 sm:py-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-shrink-0">
          {winner ? (
            <div className="flex items-center justify-between gap-2 w-full">
              <button
                type="button"
                onClick={spin}
                disabled={isSpinning}
                className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl bg-white border-2 border-orange-300 text-orange-700 font-bold text-xs sm:text-sm hover:bg-orange-50 active:scale-95 transition-all shadow-xs"
              >
                <RotateCcw className="w-4 h-4 text-orange-600" />
                <span>Volver a girar</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (winner && onSelectWinner) {
                    onSelectWinner(winner);
                  }
                  onClose();
                }}
                className="flex-1 flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs sm:text-sm hover:opacity-95 active:scale-95 transition-all shadow-md shadow-orange-500/25"
              >
                <span>¡A cocinar! 😋</span>
              </button>
            </div>
          ) : (
            <button
              onClick={spin}
              disabled={isSpinning || foods.length === 0}
              className={`w-full py-2.5 sm:py-3 px-5 rounded-xl font-black text-white text-xs sm:text-sm shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                isSpinning
                  ? 'bg-slate-400 cursor-not-allowed scale-98'
                  : 'bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 hover:opacity-95 active:scale-95 shadow-orange-500/30'
              }`}
            >
              <span>{isSpinning ? '¡Girando la Ruleta...!' : '🎯 ¡Girar la Ruleta!'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
