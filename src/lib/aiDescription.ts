/**
 * aiDescription.ts — Servicio inteligente para generar descripciones gastronómicas cortas y apetitosas.
 *
 * Estrategia en cascada con tolerancia a fallos:
 * 1. Google Gemini Flash (si VITE_GEMINI_API_KEY está configurada en .env).
 * 2. Servicio de IA gratuito y abierto (Pollinations AI) sin registro ni tarjeta de crédito.
 * 3. Extracto culinario de Wikipedia REST API en español.
 * 4. Motor de plantillas gastronómicas artesanales según categoría y nombre del plato.
 */

/**
 * Limpia y normaliza el texto generado por IA eliminando artefactos y exceso de longitud.
 */
function cleanGeneratedText(raw: string): string {
  if (!raw) return '';

  let text = raw.trim();

  // Quitar etiquetas markdown de encabezados, negrita, cursiva o código
  text = text.replace(/```[\s\S]*?```/g, '');
  text = text.replace(/`([^`]+)`/g, '$1');
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/^#+\s+/gm, '');

  // Quitar prefijos comunes de modelos de lenguaje
  text = text.replace(/^(?:aquí tienes|te dejo|descripción|propuesta de descripción|esta es una descripción|un plato de|el plato es):\s*/i, '');
  text = text.replace(/^(?:aquí va una descripción|claro,|por supuesto,)\s*/i, '');

  // Quitar comillas circundantes
  text = text.replace(/^["'«“]+|["'»”]+$/g, '').trim();

  // Si el texto supera los 220 caracteres, recortar de forma limpia en el último punto o coma
  if (text.length > 220) {
    const sub = text.slice(0, 215);
    const lastPunctuation = Math.max(sub.lastIndexOf('.'), sub.lastIndexOf(','), sub.lastIndexOf(';'));
    if (lastPunctuation > 90) {
      text = sub.slice(0, lastPunctuation) + (sub[lastPunctuation] === '.' ? '.' : '...');
    } else {
      text = sub.trim() + '...';
    }
  }

  // Asegurar que comience con mayúscula
  if (text.length > 0) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }

  // Si quedó demasiado vacío o sin sentido, devolver string vacío para activar el fallback
  if (text.length < 15) {
    return '';
  }

  return text;
}

/**
 * Generador artesanal basado en reglas culinarias para cuando las APIs externas no respondan.
 */
function generateGastronomicTemplate(dishName: string, category?: string): string {
  const cat = (category || '').toLowerCase();
  const name = dishName.trim();

  const templates: Record<string, string[]> = {
    carne: [
      `Tierna y jugosa elaboración de ${name}, cocinada a fuego lento con hierbas aromáticas y un toque tradicional irresistible.`,
      `Sabrosa porción de ${name} preparada en su punto óptimo, realzando todo su sabor con una guarnición clásica.`,
      `Exquisita receta de ${name}, dorada al punto perfecto y acompañada de un fondo jugoso y lleno de matices.`
    ],
    pescado: [
      `Fresco y delicado ${name}, preparado respetando su sabor marino original con un toque suave de aceite de oliva virgen extra.`,
      `Pieza de ${name} con una textura tierna y un toque ligero de limón y perejil fresco.`,
      `Tradicional plato marinero de ${name}, ligero, saludable y con un sabor auténtico de mar.`
    ],
    marisco: [
      `Selección de marisco fresco preparado para potenciar toda su esencia marina y aroma a brisa costera.`,
      `Sabroso plato marinero con ${name}, cocinado al punto con un toque cítrico y aromático.`
    ],
    arroz: [
      `Arroz meloso y en su punto justo de cocción, impregnado con un fondo casero rico en sabor y tradición.`,
      `Plato clásico de arroz elaborado a fuego lento, con granos sueltos y un sofrito repleto de aromas.`,
      `Sabroso plato de ${name}, con una textura perfecta y todo el sabor del mejor sofrito tradicional.`
    ],
    pasta: [
      `Pasta al dente servida con una salsa casera reconfortante, aromáticas especias y queso recién rallado.`,
      `Clásica receta de ${name} elaborada al estilo italiano con ingredientes frescos y un toque cremoso.`,
      `Delicioso plato de pasta cocinado al punto, bañado en una salsa sedosa y llena de sabor.`
    ],
    sopa: [
      `Caldo caliente y reconfortante preparado a fuego lento con ingredientes selectos para reconfortar el cuerpo y el alma.`,
      `Cremosa y suave textura con ingredientes de temporada, servida caliente con un toque crujiente.`,
      `Reconfortante plato de ${name}, cocinado con paciencia para lograr un sabor profundo y casero.`
    ],
    postre: [
      `Dulce tentación con una textura suave y esponjosa, el broche de oro perfecto para cualquier comida.`,
      `Delicioso postre artesanal con el equilibrio justo de dulzor, cremosidad y aroma casero.`,
      `Irresistible bocado dulce de ${name}, preparado con mimo para los amantes del buen postre.`
    ],
    desayuno: [
      `Comienza el día con energía gracias a este apetitoso ${name}, elaborado con ingredientes frescos y equilibrados.`,
      `Opción perfecta para el desayuno o merienda, deliciosa, reconfortante y llena de vitalidad.`
    ],
    pizza: [
      `Masa crujiente y esponjosa horneada al punto, con queso fundido y una combinación sabrosa de ingredientes frescos.`,
      `Auténtica receta al horno con una base ligera, salsa de tomate sazonada y un aroma irresistible.`
    ],
    tapa: [
      `Bocado tradicional lleno de sabor, perfecto para compartir y disfrutar en la mejor compañía.`,
      `Tapa casera y apetitosa con ${name}, ideal para abrir el apetito con una copa o refresco.`
    ]
  };

  // Buscar coincidencia por categoría o nombre
  let matchingKey = 'general';
  for (const key of Object.keys(templates)) {
    if (cat.includes(key) || name.toLowerCase().includes(key)) {
      matchingKey = key;
      break;
    }
  }

  const list = templates[matchingKey] || [
    `Exquisito plato casero de ${name}, preparado con ingredientes frescos seleccionados y el toque justo de tradición.`,
    `Deliciosa receta tradicional de ${name}, elaborada con mimo para disfrutar de una experiencia gastronómica reconfortante.`,
    `Auténtica preparación de ${name}, destacando por su sabor equilibrado, aromas caseros y presentación apetitosa.`
  ];

  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
}

/**
 * Consulta a Wikipedia en español para extraer un resumen gastronómico.
 */
async function fetchFromWikipedia(dishName: string): Promise<string | null> {
  try {
    const cleanQuery = dishName.trim().replace(/\s+/g, '_');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanQuery)}`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.extract) {
      const extract = data.extract as string;
      // Comprobar si parece un plato culinario o gastronómico
      const lower = extract.toLowerCase();
      const isCulinary = /plato|comida|receta|gastronom|cocina|guiso|alimento|ingrediente|sopa|postre|carne|pescado|fritura|rebozado|pasta/i.test(lower);
      if (isCulinary) {
        // Tomar las primeras dos frases o hasta 200 caracteres
        const sentences = extract.split(/(?<=[.!?])\s+/);
        const shortExtract = sentences.slice(0, 2).join(' ');
        const cleaned = cleanGeneratedText(shortExtract);
        if (cleaned.length >= 20) {
          return cleaned;
        }
      }
    }
  } catch {
    // Falla silenciosa para continuar con la cascada
  }
  return null;
}

/**
 * Consulta a Pollinations AI (API gratuita de texto).
 */
async function fetchFromPollinations(dishName: string, category?: string): Promise<string | null> {
  try {
    const prompt = `Escribe una descripción culinaria corta, apetitosa y atractiva en español (máximo 1 o 2 frases, menos de 160 caracteres) para el plato "${dishName}"${category ? ` (${category})` : ''}. No pongas comillas, no incluyas introducciones ni notas, solo el texto apetitoso directo.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);

    const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?seed=${Math.floor(Math.random() * 10000)}&model=openai`;
    const res = await fetch(url, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const raw = await res.text();
    const cleaned = cleanGeneratedText(raw);
    if (cleaned && cleaned.length >= 15) {
      return cleaned;
    }
  } catch {
    // Continuar a la siguiente alternativa
  }
  return null;
}

/**
 * Consulta a Google Gemini si el usuario ha configurado la variable de entorno VITE_GEMINI_API_KEY.
 */
async function fetchFromGemini(dishName: string, category?: string, apiKey?: string): Promise<string | null> {
  if (!apiKey) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const prompt = `Escribe una descripción culinaria corta, apetitosa y atractiva en español (máximo 1 o 2 frases breves, menos de 160 caracteres) para el plato "${dishName}"${category ? ` de categoría "${category}"` : ''}. Responde únicamente con la descripción directa, sin comillas ni encabezados.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 90,
          }
        })
      }
    );
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (raw) {
      const cleaned = cleanGeneratedText(raw);
      if (cleaned.length >= 15) return cleaned;
    }
  } catch {
    // Continuar
  }
  return null;
}

/**
 * Función principal expuesta para autocompletar la descripción corta con IA.
 * Garantiza siempre devolver un texto apetitoso y nunca fallar.
 */
export async function generateDishDescription(dishName: string, category?: string): Promise<string> {
  const cleanName = dishName.trim();
  if (!cleanName) {
    throw new Error('Por favor, indica primero el nombre del plato.');
  }

  // 1. Intento con Gemini (si hay API key configurada)
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_AI_API_KEY;
  if (geminiApiKey) {
    const geminiResult = await fetchFromGemini(cleanName, category, geminiApiKey);
    if (geminiResult) return geminiResult;
  }

  // 2. Intento con servicio de IA gratuito (Pollinations)
  const aiResult = await fetchFromPollinations(cleanName, category);
  if (aiResult) return aiResult;

  // 3. Intento con Wikipedia gastronómica
  const wikiResult = await fetchFromWikipedia(cleanName);
  if (wikiResult) return wikiResult;

  // 4. Fallback garantizado con motor de plantillas gastronómicas
  return generateGastronomicTemplate(cleanName, category);
}
