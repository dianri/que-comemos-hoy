import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { X, Sparkles, Trophy, RotateCcw } from 'lucide-react';
import { Food } from '../types';

interface RouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  foods: Food[];
  onSelectWinner?: (food: Food) => void;
}

const SLICE_COLORS = [
  '#f97316', // Orange
  '#ef4444', // Red
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#14b8a6', // Teal
  '#84cc16', // Lime
];

export const RouletteModal: React.FC<RouletteModalProps> = ({
  isOpen,
  onClose,
  foods,
  onSelectWinner,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Food | null>(null);
  const currentAngleRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  // Sintetizador Web Audio para el sonido del tic de la ruleta (sin archivos externos)
  const playTickSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch {
      // AudioContext bloqueado o no disponible
    }
  }, []);

  // Dibujar la ruleta en el Canvas
  const drawWheel = useCallback((angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas || foods.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 15;

    ctx.clearRect(0, 0, width, height);

    const numSlices = foods.length;
    const arc = (2 * Math.PI) / numSlices;

    // Sombra del disco exterior
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();

    // Dibujar cada porción
    for (let i = 0; i < numSlices; i++) {
      const sliceAngle = angle + i * arc;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, sliceAngle, sliceAngle + arc);
      ctx.closePath();

      ctx.fillStyle = SLICE_COLORS[i % SLICE_COLORS.length];
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Texto de la comida en la porción
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(sliceAngle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;

      const foodName = foods[i].name;
      const truncated = foodName.length > 14 ? foodName.slice(0, 13) + '…' : foodName;
      ctx.fillText(truncated, radius - 20, 5);
      ctx.restore();
    }

    // Centro decorativo de la ruleta
    ctx.beginPath();
    ctx.arc(centerX, centerY, 28, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 8;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#ea580c';
    ctx.fill();

    // Icono cubiertos en el centro
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🍽️', centerX, centerY);
  }, [foods]);

  // Redibujar cuando se abre el modal o cambian los platos
  useEffect(() => {
    if (isOpen) {
      setWinner(null);
      // Ajustar dimensiones del canvas para retina displays
      const canvas = canvasRef.current;
      if (canvas) {
        const size = Math.min(window.innerWidth - 40, 360);
        canvas.width = size * 2;
        canvas.height = size * 2;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.scale(2, 2);
      }
      drawWheel(currentAngleRef.current);
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isOpen, drawWheel]);

  // Animación física del giro
  const spin = () => {
    if (isSpinning || foods.length === 0) return;
    setIsSpinning(true);
    setWinner(null);

    // Calcular giros y parada aleatoria
    const numSlices = foods.length;
    const arc = (2 * Math.PI) / numSlices;
    const fullSpins = 5 + Math.floor(Math.random() * 4); // 5 a 8 vueltas completas
    const randomExtraAngle = Math.random() * 2 * Math.PI;
    const totalRotation = fullSpins * 2 * Math.PI + randomExtraAngle;

    const startAngle = currentAngleRef.current;
    const targetAngle = startAngle + totalRotation;
    const duration = 4500; // 4.5 segundos
    const startTime = performance.now();
    let lastTickIndex = -1;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const currentAngle = startAngle + (targetAngle - startAngle) * easedProgress;
      currentAngleRef.current = currentAngle;
      drawWheel(currentAngle);

      // Calcular slice actual que pasa por la aguja (en la posición superior: -PI/2)
      const normalizedAngle = (2 * Math.PI - (currentAngle % (2 * Math.PI))) % (2 * Math.PI);
      const pointerAngle = (normalizedAngle + (3 * Math.PI) / 2) % (2 * Math.PI);
      const currentSlice = Math.floor(pointerAngle / arc) % numSlices;

      if (currentSlice !== lastTickIndex) {
        lastTickIndex = currentSlice;
        playTickSound();
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const winningFood = foods[currentSlice];
        setWinner(winningFood);
        if (onSelectWinner) onSelectWinner(winningFood);

        // Explosión de confeti festivo
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f97316', '#ef4444', '#10b981', '#3b82f6', '#f59e0b'],
        });
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col items-center p-6 max-h-[90vh] overflow-y-auto">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          disabled={isSpinning}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado */}
        <div className="text-center mb-4">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ruleta Aleatoria</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">
            ¿Qué comeremos hoy?
          </h2>
          <p className="text-xs text-slate-500">
            {foods.length} platos en la ruleta. ¡Deja que la suerte decida!
          </p>
        </div>

        {/* Contenedor de la Ruleta y la Aguja */}
        <div className="relative my-2 flex items-center justify-center">
          {/* Aguja / Puntero Superior */}
          <div className="absolute -top-3 z-20 flex flex-col items-center">
            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-red-600 drop-shadow-md" />
            <div className="w-2.5 h-2.5 rounded-full bg-white -mt-5 border-2 border-red-600 shadow" />
          </div>

          {/* Canvas de la Ruleta */}
          <canvas
            ref={canvasRef}
            className="rounded-full shadow-inner select-none transition-transform"
          />
        </div>

        {/* Resultado del Ganador o Botón de Girar */}
        {winner ? (
          <div className="mt-4 w-full bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-orange-200 rounded-2xl p-4 text-center animate-bounce-subtle">
            <div className="flex items-center justify-center space-x-2 text-amber-600 mb-1">
              <Trophy className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">¡Plato Ganador!</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 mb-2">
              🎉 ¡Hoy toca: {winner.name}!
            </h3>

            {winner.image_url && (
              <img
                src={winner.image_url}
                alt={winner.name}
                className="w-full h-36 object-cover rounded-xl shadow-md my-2"
              />
            )}

            <div className="flex items-center justify-center space-x-2 mt-3">
              <button
                onClick={spin}
                disabled={isSpinning}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white border border-orange-200 text-orange-700 font-bold text-xs hover:bg-orange-100 transition-colors shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Girar de nuevo</span>
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/20"
              >
                ¡A cocinar! 😋
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 w-full flex flex-col items-center">
            <button
              onClick={spin}
              disabled={isSpinning || foods.length === 0}
              className={`w-full py-3.5 px-6 rounded-2xl font-black text-white text-base sm:text-lg shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 ${
                isSpinning
                  ? 'bg-slate-400 cursor-not-allowed scale-98'
                  : 'bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 hover:opacity-95 active:scale-95 shadow-orange-500/30'
              }`}
            >
              <span>{isSpinning ? '¡Girando la Ruleta...!' : '🎯 ¡Girar la Ruleta!'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
