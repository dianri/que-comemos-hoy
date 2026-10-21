import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ExternalLink,
  Gamepad2,
  RotateCcw,
  Smartphone,
  Maximize2,
  Trophy,
  RefreshCw,
  Sparkles,
  UserX,
  LogIn,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';
import { GameScore } from '../types';
import { playConfettiPop } from '../lib/sound';

interface ArcadeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ARKANOID_URL = 'https://dianri.github.io/Arkanoid_Game/';

// Dimensiones fijas nativas del contenedor del juego Arkanoid (canvas 800x600 + cabina + HUD)
const GAME_WIDTH = 864;
const GAME_HEIGHT = 790;

export const ArcadeModal: React.FC<ArcadeModalProps> = ({ isOpen, onClose }) => {
  const { userName, user, isAuthenticated, openAuthModal } = useUser();
  const [activeTab, setActiveTab] = useState<'game' | 'ranking'>('game');
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Estado del ranking y puntuaciones
  const [leaderboard, setLeaderboard] = useState<GameScore[]>([]);
  const [isLoadingScores, setIsLoadingScores] = useState<boolean>(false);
  const [scoreBanner, setScoreBanner] = useState<{
    score: number;
    playerName: string;
    timestamp: number;
  } | null>(null);

  // Evitar duplicados por mensajes repetidos del iframe
  const lastScoreRef = useRef<{ score: number; time: number }>({ score: -1, time: 0 });

  // Nombre del jugador con sufijo _invitado para no autenticados (previene suplantaciones)
  const getPlayerSubmissionName = useCallback(() => {
    const raw = (userName && userName.trim()) || (user?.email ? user.email.split('@')[0] : 'Gourmet');
    if (isAuthenticated) {
      // Usuario autenticado y verificado: nombre oficial sin sufijo _invitado
      return raw.replace(/_invitado$/i, '').trim();
    } else {
      // Usuario invitado no registrado: sufijo obligatorio _invitado
      const cleanRaw = raw.replace(/_invitado$/i, '').trim();
      return `${cleanRaw || 'Invitado'}_invitado`;
    }
  }, [userName, user, isAuthenticated]);

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

  // Consultar todas las puntuaciones de Supabase (ranking completo sin límite)
  const fetchLeaderboard = useCallback(async () => {
    setIsLoadingScores(true);
    try {
      const { data, error } = await supabase
        .from('game_scores')
        .select('id, game_name, user_name, score, created_at')
        .eq('game_name', 'arkanoid')
        .order('score', { ascending: false });

      if (error) {
        console.warn('Error al consultar ranking:', error.message);
        return;
      }

      if (data) {
        setLeaderboard(data as GameScore[]);
      }
    } catch (err) {
      console.error('Error al cargar ranking de Arkanoid:', err);
    } finally {
      setIsLoadingScores(false);
    }
  }, []);

  // Suscripción Realtime a nuevas puntuaciones
  useEffect(() => {
    if (!isOpen) return;

    fetchLeaderboard();

    const channel = supabase
      .channel('public:game_scores_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'game_scores' },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, fetchLeaderboard]);

  // Escuchar mensajes provenientes del iframe del juego
  const handleMessage = useCallback(
    async (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      const isScoreEvent =
        data.type === 'ARKANOID_SCORE_SUBMISSION' ||
        data.type === 'GAME_OVER' ||
        data.game === 'arkanoid';

      if (!isScoreEvent || typeof data.score !== 'number') return;

      const rawScore = Math.round(data.score);
      if (rawScore <= 0) return;

      // Evitar duplicados si el juego emite el evento varias veces
      const now = Date.now();
      if (lastScoreRef.current.score === rawScore && now - lastScoreRef.current.time < 3500) {
        return;
      }
      lastScoreRef.current = { score: rawScore, time: now };

      const finalPlayerName = getPlayerSubmissionName();

      try {
        const { error } = await supabase.from('game_scores').insert({
          game_name: 'arkanoid',
          user_name: finalPlayerName,
          score: rawScore,
        });

        if (error) {
          console.warn('Error al guardar puntuación de Arkanoid:', error.message);
          return;
        }

        // Celebración festiva sonora y confeti
        playConfettiPop();
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.5 },
        });

        setScoreBanner({
          score: rawScore,
          playerName: finalPlayerName,
          timestamp: Date.now(),
        });

        // Refrescar tabla de récords
        fetchLeaderboard();
      } catch (err) {
        console.error('Error al insertar score de Arkanoid:', err);
      }
    },
    [getPlayerSubmissionName, fetchLeaderboard]
  );

  useEffect(() => {
    if (!isOpen) return;

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isOpen, handleMessage]);

  // Recalcular escala en resize o cambio de orientación
  useEffect(() => {
    if (!isOpen || activeTab !== 'game') return;

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
  }, [isOpen, activeTab, updateScale]);

  if (!isOpen) return null;

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-1.5 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-zinc-950 rounded-2xl sm:rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col h-[94vh] sm:h-[84vh] max-h-[840px] animate-scale-up">
        {/* Cabecera estilo Arcade Neon con Selector de Pestañas */}
        <div className="relative px-3 py-2.5 sm:px-6 sm:py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 pr-2">
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
                🎮 ¡Rompe bloques y bate el récord de la comunidad!
              </p>
            </div>
          </div>

          {/* Selector de Pestañas: Juego vs Ranking */}
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            <div className="flex items-center p-0.5 sm:p-1 bg-zinc-950/80 rounded-xl border border-zinc-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveTab('game')}
                className={`px-2.5 py-1 sm:px-3 sm:py-1 rounded-lg font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                  activeTab === 'game'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Gamepad2 className="w-3 h-3" />
                <span>Juego</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ranking')}
                className={`px-2.5 py-1 sm:px-3 sm:py-1 rounded-lg font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                  activeTab === 'ranking'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Trophy className="w-3 h-3 text-amber-400" />
                <span>Ranking</span>
              </button>
            </div>

            {/* Botón para reiniciar juego */}
            {activeTab === 'game' && (
              <button
                type="button"
                onClick={handleReload}
                className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Reiniciar juego"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

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
              className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/40 border border-transparent transition-colors cursor-pointer"
              title="Cerrar juego y volver"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-300" />
            </button>
          </div>
        </div>

        {/* Banner de Aviso e Invitación al Registro para Jugadores Invitados */}
        {!isAuthenticated && (
          <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-amber-950/70 via-zinc-900 to-amber-950/70 border-b border-amber-500/30 text-amber-200 text-xs font-mono flex items-center justify-between flex-shrink-0 animate-fade-in">
            <div className="flex items-center space-x-2 min-w-0 pr-2">
              <UserX className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate text-[11px] sm:text-xs">
                Jugando como invitado (tus récords llevarán el sufijo <strong className="text-amber-300">_invitado</strong>).
              </span>
            </div>
            <button
              type="button"
              onClick={() => openAuthModal('Inicia sesión para registrar tus récords con tu nombre oficial verificado.')}
              className="shrink-0 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 hover:text-white border border-amber-400/40 text-[10px] sm:text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <LogIn className="w-3 h-3" />
              <span>Iniciar Sesión</span>
            </button>
          </div>
        )}

        {/* Banner informativo de adaptabilidad para dispositivos móviles (solo en vista juego) */}
        {activeTab === 'game' && (
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
        )}

        {/* Notificación flotante de nueva puntuación registrada */}
        {scoreBanner && (
          <div className="relative z-30 px-3 py-2 bg-gradient-to-r from-amber-950 via-zinc-900 to-amber-950 border-b border-amber-500/40 text-amber-200 flex items-center justify-between font-mono text-xs animate-fade-in flex-shrink-0">
            <div className="flex items-center space-x-2 truncate pr-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
              <span className="truncate">
                ¡Puntuación registrada! <strong>{scoreBanner.playerName}</strong> sumó{' '}
                <strong className="text-amber-300">{scoreBanner.score.toLocaleString()} pts</strong>.
              </span>
            </div>
            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('ranking')}
                className="px-2.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[10px] font-bold flex items-center space-x-1 transition-colors cursor-pointer"
              >
                <Trophy className="w-3 h-3 text-amber-400" />
                <span>Ver Ranking</span>
              </button>
              <button
                type="button"
                onClick={() => setScoreBanner(null)}
                className="p-1 text-zinc-400 hover:text-white"
                title="Cerrar aviso"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Contenido Principal: Juego vs Ranking */}
        {activeTab === 'game' ? (
          /* Vista del Iframe con Escalado Dinámico */
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
        ) : (
          /* Vista del Salón de la Fama / Ranking Completo */
          <div className="relative flex-1 bg-zinc-950 p-3 sm:p-6 overflow-y-auto flex flex-col items-center justify-start font-mono space-y-4 overscroll-contain">
            <div className="w-full max-w-2xl space-y-3 pb-4">
              {/* Encabezado del Ranking */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10 shrink-0">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm sm:text-base font-black text-white tracking-widest uppercase">
                        Salón de la Fama
                      </h4>
                      {leaderboard.length > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          {leaderboard.length} récords
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Ranking global de todas las puntuaciones de la comunidad
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={fetchLeaderboard}
                  disabled={isLoadingScores}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
                  title="Actualizar ranking"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingScores ? 'animate-spin text-amber-400' : ''}`} />
                </button>
              </div>

              {/* Lista de Puntuaciones */}
              {isLoadingScores && leaderboard.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-zinc-500 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                  <p className="text-xs">Cargando récords galácticos...</p>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="py-12 px-4 rounded-2xl bg-zinc-900/50 border border-dashed border-zinc-800 text-center space-y-3">
                  <div className="text-4xl">🚀</div>
                  <h5 className="text-sm font-bold text-white">¡Sé el primero en entrar al ranking!</h5>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Termina una partida en el minijuego de Arkanoid y tu puntuación aparecerá aquí automáticamente.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('game')}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <Gamepad2 className="w-4 h-4" />
                    <span>Jugar Ahora</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {leaderboard.map((item, index) => {
                    const rank = index + 1;
                    const isFirst = rank === 1;
                    const isSecond = rank === 2;
                    const isThird = rank === 3;

                    const trimmedItemName = item.user_name.trim();
                    const isGuest = trimmedItemName.toLowerCase().endsWith('_invitado');
                    const cleanDisplayName = isGuest
                      ? trimmedItemName.replace(/_invitado$/i, '').trim()
                      : trimmedItemName;

                    // Comprobación si la puntuación pertenece al usuario actual
                    const currentCleanName = (userName || '').replace(/_invitado$/i, '').trim().toLowerCase();
                    const itemCleanName = cleanDisplayName.toLowerCase();
                    const isCurrentUser =
                      (isAuthenticated && !isGuest && itemCleanName === currentCleanName) ||
                      (!isAuthenticated && isGuest && itemCleanName === currentCleanName) ||
                      trimmedItemName.toLowerCase() === (userName || '').trim().toLowerCase();

                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all ${
                          isFirst
                            ? 'bg-gradient-to-r from-amber-950/40 via-zinc-900 to-amber-950/20 border-amber-500/50 shadow-md shadow-amber-500/10'
                            : isSecond
                            ? 'bg-gradient-to-r from-slate-900/60 via-zinc-900 to-slate-900/30 border-slate-400/40 shadow-xs'
                            : isThird
                            ? 'bg-gradient-to-r from-amber-950/20 via-zinc-900 to-zinc-900 border-amber-800/40'
                            : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800/80'
                        }`}
                      >
                        {/* Posición y Nombre del Jugador */}
                        <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 pr-2">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0">
                            {isFirst ? (
                              <span className="text-lg">🥇</span>
                            ) : isSecond ? (
                              <span className="text-lg">🥈</span>
                            ) : isThird ? (
                              <span className="text-lg">🥉</span>
                            ) : (
                              <span className="text-zinc-500 font-bold">#{rank}</span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                              <p
                                className={`text-xs sm:text-sm font-bold truncate ${
                                  isFirst
                                    ? 'text-amber-300 font-black'
                                    : isSecond
                                    ? 'text-slate-200'
                                    : isThird
                                    ? 'text-amber-400/90'
                                    : 'text-zinc-300'
                                }`}
                              >
                                {cleanDisplayName}
                                {isGuest && (
                                  <span className="text-[10px] font-normal text-zinc-500 font-mono ml-0.5">
                                    _invitado
                                  </span>
                                )}
                              </p>

                              {/* Distintivo de autenticación: Verificado vs Invitado */}
                              {!isGuest ? (
                                <span
                                  className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0 shadow-xs"
                                  title="Usuario registrado y verificado"
                                >
                                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                                  <span>Verificado</span>
                                </span>
                              ) : (
                                <span
                                  className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] font-mono text-zinc-400 bg-zinc-800/80 border border-zinc-700/60 shrink-0"
                                  title="Puntuación registrada en modo invitado"
                                >
                                  <UserX className="w-2.5 h-2.5 text-zinc-400" />
                                  <span>Invitado</span>
                                </span>
                              )}

                              {/* Distintivo 'Tú' */}
                              {isCurrentUser && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase shrink-0">
                                  Tú
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-zinc-500 truncate">
                              {new Date(item.created_at).toLocaleDateString(undefined, {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Puntuación */}
                        <div className="flex items-center space-x-1.5 shrink-0">
                          <span
                            className={`text-sm sm:text-base font-black tracking-wider ${
                              isFirst
                                ? 'text-amber-400 drop-shadow-sm'
                                : isSecond
                                ? 'text-slate-200'
                                : isThird
                                ? 'text-amber-500'
                                : 'text-cyan-400'
                            }`}
                          >
                            {item.score.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-zinc-500 uppercase">pts</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Botón para volver a jugar */}
              <div className="pt-3 flex justify-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('game')}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-600/20 transition-all cursor-pointer"
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span>Volver a Jugar al Arkanoid</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pie de acciones del modal */}
        <div className="px-3 py-2 sm:px-6 sm:py-2.5 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400 flex-shrink-0">
          <span className="hidden sm:inline text-[11px] text-zinc-400">
            {activeTab === 'game'
              ? '🕹️ Usa las flechas ← → o arrastra el dedo / ratón para mover la nave'
              : '🏆 Las puntuaciones se guardan y actualizan automáticamente en tiempo real'}
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
              className="px-4 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-[11px] transition-colors active:scale-95 shadow-md shadow-orange-600/30 cursor-pointer"
            >
              Volver a la carta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
