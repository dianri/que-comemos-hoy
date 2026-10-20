/**
 * sound.ts — Sintetizador de efectos de sonido con Web Audio API.
 *
 * Sin dependencias externas de audio, sin latencia de red,
 * compatible con autoplay policies (desbloqueado con interacción del usuario)
 * y con control de silencio (mute) persistido en localStorage.
 */

const MUTE_STORAGE_KEY = 'que_comemos_sound_muted';

let sharedAudioCtx: AudioContext | null = null;

/**
 * Obtiene o inicializa la instancia compartida de AudioContext.
 * Si el contexto estaba suspendido por la política de autoplay, lo reanuda.
 */
export const getAudioContext = (): AudioContext | null => {
  try {
    if (!sharedAudioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        sharedAudioCtx = new AudioContextClass();
      }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
};

/**
 * Comprueba si el sonido está silenciado por preferencia del usuario.
 */
export const isSoundMuted = (): boolean => {
  try {
    return localStorage.getItem(MUTE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

/**
 * Activa o desactiva el sonido y guarda la preferencia en localStorage.
 */
export const setSoundMuted = (muted: boolean): void => {
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, muted ? 'true' : 'false');
  } catch {
    // Almacenamiento no disponible
  }
};

/**
 * Efecto de sonido: "Pop de Confeti / Explosión de Fiesta" 🎉
 *
 * Estructura de 2 fases:
 * 1. "Pop" inicial: Ruido blanco filtrado por paso banda + barrido tonal rápido
 *    hacia graves (simula la detonación del cañón de confeti).
 * 2. "Brillo / Chime": Arpegio festivo pentatónico brillante con decaimiento
 *    suave y armónico (simula el destello brillante de las serpentinas).
 */
export const playConfettiPop = (): void => {
  if (isSoundMuted()) return;

  try {
    const audioCtx = getAudioContext();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;

    // --- FASE 1: EL "POP" DEL CAÑÓN DE CONFETI ---
    // A) Generar ráfaga corta de ruido blanco filtrado (45ms)
    const noiseDuration = 0.05;
    const bufferSize = Math.floor(audioCtx.sampleRate * noiseDuration);
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
    }

    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1200, now);
    noiseFilter.Q.setValueAtTime(2.2, now);

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.35, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + noiseDuration);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + noiseDuration);

    // B) Golpe percusivo tonal grave ("Thump" del disparo del pop: 480Hz -> 80Hz)
    const popOsc = audioCtx.createOscillator();
    const popGain = audioCtx.createGain();

    popOsc.type = 'sine';
    popOsc.frequency.setValueAtTime(480, now);
    popOsc.frequency.exponentialRampToValueAtTime(85, now + 0.045);

    popGain.gain.setValueAtTime(0.4, now);
    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    popOsc.connect(popGain);
    popGain.connect(audioCtx.destination);

    popOsc.start(now);
    popOsc.stop(now + 0.05);

    // --- FASE 2: DESTELLO FESTIVO / CAMPANITAS MÁGICAS ---
    // 4 notas alegres y cristalinas en rápida sucesión (C6, E6, G6, C7)
    const notes = [1046.5, 1318.51, 1567.98, 2093.0]; // Do, Mi, Sol, Do agudo
    notes.forEach((freq, index) => {
      const noteTime = now + 0.04 + index * 0.045; // Comienza justo tras el pop
      const chimeOsc = audioCtx.createOscillator();
      const chimeGain = audioCtx.createGain();

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq, noteTime);

      // Envolvente de campanita con sustain corto y caída suave
      chimeGain.gain.setValueAtTime(0.0001, noteTime);
      chimeGain.gain.linearRampToValueAtTime(0.12, noteTime + 0.015);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.35);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(audioCtx.destination);

      chimeOsc.start(noteTime);
      chimeOsc.stop(noteTime + 0.36);

      chimeOsc.onended = () => {
        try {
          chimeOsc.disconnect();
          chimeGain.disconnect();
        } catch {
          // Ya desconectado
        }
      };
    });
  } catch {
    // Si la API falla o está bloqueada por permisos, no rompe la aplicación
  }
};

let lastTickTime = 0;

/**
 * Efecto de sonido: "Tick mecánico" para el giro de la ruleta.
 */
export const playRouletteTick = (): void => {
  if (isSoundMuted()) return;

  try {
    const now = performance.now();
    if (now - lastTickTime < 38) return;
    lastTickTime = now;

    const audioCtx = getAudioContext();
    if (!audioCtx) return;

    const currentTime = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    const baseFreq = 780 + Math.random() * 70;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, currentTime + 0.022);

    gain.gain.setValueAtTime(0.18, currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.022);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.onended = () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {
        // Ya desconectado
      }
    };

    osc.start(currentTime);
    osc.stop(currentTime + 0.025);
  } catch {
    // Audio no disponible
  }
};
