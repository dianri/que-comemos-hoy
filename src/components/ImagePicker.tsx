import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Link as LinkIcon,
  Check,
  Image as ImageIcon,
  Sparkles,
  ExternalLink,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Globe,
} from 'lucide-react';
import { isSafeImageUrl } from '../lib/sanitize';
import { FOOD_IMAGES_CATALOG, FoodImageItem } from '../constants/foodImages';

export type { FoodImageItem };
export { FOOD_IMAGES_CATALOG };

// Normalización de texto (sin acentos/tildes y minúsculas)
const normalizeText = (text: string): string => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

interface ImagePickerProps {
  selectedUrl: string;
  onSelectUrl: (url: string) => void;
  foodName?: string;
}

interface PhotoResult {
  id: string;
  name: string;
  url: string;
  source: 'catalog' | 'unsplash' | 'wikipedia' | 'commons' | 'themealdb';
}

// Caché en memoria para evitar llamadas redundantes a la API
const searchCache = new Map<string, PhotoResult[]>();

// Palabras no deseadas en títulos de fotos de Wikimedia Commons
const BANNED_TITLE_WORDS = [
  'flag',
  'bandera',
  'map',
  'mapa',
  'logo',
  'escudo',
  'diagram',
  'diagrama',
  'icon',
  'icono',
  'symbol',
  'simbolo',
  'location',
  'ubicacion',
];

/**
 * Busca fotos en tiempo real consultando fuentes públicas libres y el catálogo local.
 */
async function fetchOnlineFoodPhotos(query: string, signal?: AbortSignal): Promise<PhotoResult[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const cacheKey = normalizeText(cleanQuery);
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey)!;
  }

  const results: PhotoResult[] = [];
  const seenUrls = new Set<string>();

  // 1. Si existe clave de Unsplash en variables de entorno, consultar Unsplash API
  const unsplashKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  const unsplashPromise = unsplashKey
    ? fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          cleanQuery
        )}&per_page=12&client_id=${unsplashKey}`,
        { signal }
      )
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          const list: PhotoResult[] = [];
          if (Array.isArray(data?.results)) {
            for (const item of data.results) {
              const url = item.urls?.regular || item.urls?.small;
              if (url && !seenUrls.has(url)) {
                seenUrls.add(url);
                list.push({
                  id: `un-${item.id}`,
                  name: item.description || item.alt_description || cleanQuery,
                  url,
                  source: 'unsplash',
                });
              }
            }
          }
          return list;
        })
        .catch(() => [])
    : Promise.resolve([]);

  // 2. Wikipedia en Español (Page Images API - fotos auténticas de platos tradicionales)
  const wikiEsPromise = fetch(
    `https://es.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      cleanQuery
    )}&gsrlimit=10&prop=pageimages&pithumbsize=800&format=json&origin=*`,
    { signal }
  )
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      const list: PhotoResult[] = [];
      if (data?.query?.pages) {
        for (const p of Object.values(data.query.pages) as any[]) {
          const src = p.thumbnail?.source;
          const title = (p.title || '').trim();
          if (src && /\.(jpe?g|png|webp)/i.test(src) && !seenUrls.has(src)) {
            const isBanned = BANNED_TITLE_WORDS.some((w) =>
              title.toLowerCase().includes(w)
            );
            if (!isBanned) {
              seenUrls.add(src);
              list.push({
                id: `wkes-${p.pageid}`,
                name: title,
                url: src,
                source: 'wikipedia',
              });
            }
          }
        }
      }
      return list;
    })
    .catch(() => []);

  // 3. Wikimedia Commons (búsqueda directa de fotos de comida)
  const commonsPromise = fetch(
    `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(
      cleanQuery
    )}&gsrlimit=10&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json&origin=*`,
    { signal }
  )
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      const list: PhotoResult[] = [];
      if (data?.query?.pages) {
        for (const p of Object.values(data.query.pages) as any[]) {
          const info = p.imageinfo?.[0];
          const src = info?.thumburl || info?.url;
          const rawTitle = (p.title || '')
            .replace(/^File:/i, '')
            .replace(/\.[^/.]+$/, '')
            .replace(/_/g, ' ');
          if (src && /\.(jpe?g|png|webp)/i.test(src) && !seenUrls.has(src)) {
            const isBanned = BANNED_TITLE_WORDS.some((w) =>
              rawTitle.toLowerCase().includes(w)
            );
            if (!isBanned) {
              seenUrls.add(src);
              list.push({
                id: `cm-${p.pageid}`,
                name: rawTitle,
                url: src,
                source: 'commons',
              });
            }
          }
        }
      }
      return list;
    })
    .catch(() => []);

  // 4. TheMealDB API (fotos de platos internacionales y cocina casera)
  const mealDbPromise = fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(
      cleanQuery
    )}`,
    { signal }
  )
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      const list: PhotoResult[] = [];
      if (Array.isArray(data?.meals)) {
        for (const m of data.meals) {
          const src = m.strMealThumb;
          if (src && !seenUrls.has(src)) {
            seenUrls.add(src);
            list.push({
              id: `mdb-${m.idMeal}`,
              name: m.strMeal,
              url: src,
              source: 'themealdb',
            });
          }
        }
      }
      return list;
    })
    .catch(() => []);

  // Ejecución en paralelo de todas las fuentes
  const [unsplashList, wikiList, commonsList, mealList] = await Promise.all([
    unsplashPromise,
    wikiEsPromise,
    commonsPromise,
    mealDbPromise,
  ]);

  results.push(...unsplashList, ...wikiList, ...commonsList, ...mealList);

  // Almacenar en caché para respuestas instantáneas futuras
  if (results.length > 0) {
    searchCache.set(cacheKey, results);
  }

  return results;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  selectedUrl,
  onSelectUrl,
  foodName = '',
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'custom'>('search');
  const [searchQuery, setSearchQuery] = useState(foodName || '');
  const [isSearching, setIsSearching] = useState(false);
  const [apiPhotos, setApiPhotos] = useState<PhotoResult[]>([]);
  const [previewError, setPreviewError] = useState(false);

  // Rastreo de si el usuario ha escrito una búsqueda personalizada en el input
  const [hasManuallyEdited, setHasManuallyEdited] = useState(false);
  const prevFoodNameRef = useRef(foodName);

  // Sincronización inteligente con el "Nombre del Plato" superior
  useEffect(() => {
    const currentName = foodName.trim();
    const prevName = prevFoodNameRef.current.trim();

    if (currentName !== prevName) {
      prevFoodNameRef.current = foodName;
      // Si el usuario no ha forzado una búsqueda manual o si el campo estaba sincronizado
      if (!hasManuallyEdited || !searchQuery.trim() || searchQuery === prevName) {
        setSearchQuery(currentName);
        setHasManuallyEdited(false);
      }
    }
  }, [foodName, hasManuallyEdited, searchQuery]);

  // Coincidencias locales del catálogo estático como respaldo instantáneo (0ms)
  const localCatalogMatches = useMemo<PhotoResult[]>(() => {
    const qNorm = normalizeText(searchQuery);
    if (!qNorm) {
      // Si no hay búsqueda, devolver las 16 primeras fotos más apetitosas del catálogo
      return FOOD_IMAGES_CATALOG.slice(0, 16).map((item) => ({
        id: `cat-${item.id}`,
        name: item.name,
        url: item.url,
        source: 'catalog' as const,
      }));
    }

    // Filtrar catálogo por coincidencia en nombre o etiquetas
    const matches = FOOD_IMAGES_CATALOG.filter((item) => {
      const nameNorm = normalizeText(item.name);
      if (nameNorm.includes(qNorm) || qNorm.includes(nameNorm)) return true;
      return item.tags.some((t) => {
        const tNorm = normalizeText(t);
        return tNorm.includes(qNorm) || qNorm.includes(tNorm);
      });
    });

    return matches.map((item) => ({
      id: `cat-${item.id}`,
      name: item.name,
      url: item.url,
      source: 'catalog' as const,
    }));
  }, [searchQuery]);

  // Consulta en directo conectada a APIs públicas con debounce de 350ms
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setApiPhotos([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const liveResults = await fetchOnlineFoodPhotos(query, controller.signal);
        setApiPhotos(liveResults);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setApiPhotos([]);
        }
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  // Combinación y deduplicación de fotos (Catálogo local + Fotos de la API en directo)
  const displayedPhotos = useMemo<PhotoResult[]>(() => {
    const combined: PhotoResult[] = [];
    const seen = new Set<string>();

    // 1. Fotos en directo traídas por la API
    for (const item of apiPhotos) {
      if (!seen.has(item.url)) {
        seen.add(item.url);
        combined.push(item);
      }
    }

    // 2. Coincidencias del catálogo local (añade opciones variadas sin duplicar)
    for (const item of localCatalogMatches) {
      if (!seen.has(item.url)) {
        seen.add(item.url);
        combined.push(item);
      }
    }

    return combined;
  }, [apiPhotos, localCatalogMatches]);

  // Función para abrir Google Imágenes con el término de búsqueda
  const handleOpenGoogleImages = () => {
    const term = foodName.trim() || searchQuery.trim() || 'comida casera';
    const query = encodeURIComponent(`${term} receta comida`);
    const googleImagesUrl = `https://www.google.com/search?tbm=isch&q=${query}`;
    window.open(googleImagesUrl, '_blank', 'noopener,noreferrer');
  };

  // Botón para re-sincronizar el buscador con el nombre del plato
  const handleResyncWithName = () => {
    setSearchQuery(foodName.trim());
    setHasManuallyEdited(false);
  };

  const isOutOfSync =
    foodName.trim().length > 0 &&
    searchQuery.trim().toLowerCase() !== foodName.trim().toLowerCase();

  return (
    <div className="space-y-3">
      {/* Selector de Pestañas: Buscador en Directo vs URL Manual */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-orange-500" />
          <span>Fotografía del Plato *</span>
        </label>

        <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center space-x-1 ${
              activeTab === 'search'
                ? 'bg-white text-orange-600 shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Search className="w-3 h-3" />
            <span>Buscador de Fotos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center space-x-1 ${
              activeTab === 'custom'
                ? 'bg-white text-orange-600 shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>URL Directa</span>
          </button>
        </div>
      </div>

      {activeTab === 'search' ? (
        <div className="space-y-2.5 animate-fade-in">
          {/* Barra de Búsqueda Inteligente */}
          <div className="space-y-1.5">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                {isSearching ? (
                  <Loader2 className="w-3.5 h-3.5 text-orange-500 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHasManuallyEdited(true);
                }}
                placeholder={
                  foodName.trim()
                    ? `Buscando fotos de "${foodName.trim()}"...`
                    : 'Escribe el plato (rabo de toro, carbonara, fabada...)'
                }
                className="w-full h-9 pl-9 pr-8 py-1.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 bg-slate-50/70"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setHasManuallyEdited(true);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-0.5"
                  title="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Acceso rápido para volver a sincronizar con el nombre del plato */}
            {isOutOfSync && (
              <div className="flex items-center justify-between text-[11px] text-slate-500 bg-amber-50/70 border border-amber-200/60 px-2.5 py-1 rounded-lg">
                <span className="truncate">
                  Nombre escrito: <strong>"{foodName.trim()}"</strong>
                </span>
                <button
                  type="button"
                  onClick={handleResyncWithName}
                  className="ml-2 flex-shrink-0 text-orange-600 hover:text-orange-700 font-bold flex items-center space-x-1"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>Buscar por nombre</span>
                </button>
              </div>
            )}
          </div>

          {/* Cuadrícula de Fotos Dinámica */}
          {displayedPhotos.length === 0 ? (
            <div className="py-5 px-3 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
              <p className="text-xs font-semibold text-slate-700">
                No encontramos fotos en directo para "{searchQuery}"
              </p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Prueba con otro término similar, o busca directamente en Google Imágenes y pega el enlace.
              </p>
              <button
                type="button"
                onClick={handleOpenGoogleImages}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-orange-500 text-white font-bold text-xs shadow-xs hover:bg-orange-600 active:scale-95 transition-all"
              >
                <span>🔍 Buscar "{searchQuery || foodName}" en Google</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1 px-1">
                <span className="flex items-center space-x-1 font-medium">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>
                    {searchQuery.trim()
                      ? `${displayedPhotos.length} fotos encontradas para "${searchQuery.trim()}"`
                      : 'Platos populares recomendados'}
                  </span>
                </span>
                <span className="text-[10px] text-slate-400">Toca para seleccionar</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-56 sm:max-h-64 overflow-y-auto p-1.5 bg-slate-50/70 rounded-xl border border-slate-200/80">
                {displayedPhotos.map((item) => {
                  const isSelected = selectedUrl === item.url;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => onSelectUrl(item.url)}
                      className={`group relative aspect-[4/3] rounded-xl overflow-hidden border transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'ring-2 ring-orange-500 border-orange-500 shadow-md scale-[0.98]'
                          : 'border-slate-200/90 hover:border-orange-400 hover:shadow-xs opacity-90 hover:opacity-100 active:scale-95'
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 bg-slate-100"
                        onError={(e) => {
                          // Si una foto remota falla al cargar, ocultar la tarjeta rota
                          const target = e.currentTarget.parentElement;
                          if (target) target.style.display = 'none';
                        }}
                      />

                      {/* Check visual de selección */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-orange-500/25 flex items-center justify-center">
                          <div className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-lg">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        </div>
                      )}

                      {/* Badge inferior con el título del plato */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-1.5 pointer-events-none">
                        <p className="text-[10px] sm:text-[11px] text-white font-semibold truncate leading-tight drop-shadow-xs">
                          {item.name}
                        </p>
                      </div>

                      {/* Badge de fuente web */}
                      {item.source !== 'catalog' && (
                        <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[8.5px] font-bold text-white/90 flex items-center space-x-0.5 pointer-events-none">
                          <Globe className="w-2.5 h-2.5 text-cyan-300" />
                          <span>Web</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3 animate-fade-in">
          {/* Botón para buscar en Google Imágenes */}
          <div className="flex items-center justify-between gap-2 p-2.5 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50/40 border border-orange-200/80 rounded-xl">
            <div className="flex items-center space-x-2 text-xs text-orange-950 font-semibold min-w-0">
              <span className="text-base flex-shrink-0">🔍</span>
              <span className="truncate">
                {foodName.trim()
                  ? `Buscar "${foodName.trim()}" en Google`
                  : 'Buscar imágenes en Google'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleOpenGoogleImages}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-all"
              title="Abrir Google Imágenes en una pestaña nueva"
            >
              <span>Buscar en Google</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Input para pegar la URL Directa */}
          <div className="relative">
            <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="url"
              value={selectedUrl}
              onChange={(e) => {
                const rawUrl = e.target.value;
                setPreviewError(false);
                if (!rawUrl || isSafeImageUrl(rawUrl)) {
                  onSelectUrl(rawUrl);
                } else if (rawUrl.startsWith('https://')) {
                  onSelectUrl(rawUrl);
                } else if (rawUrl.length > 0) {
                  setPreviewError(true);
                  onSelectUrl('');
                }
              }}
              placeholder="https://ejemplo.com/tu-foto.jpg"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 bg-white"
            />
          </div>

          {previewError && !selectedUrl && (
            <div className="flex items-center space-x-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                Solo se permiten URLs seguras que comiencen por <strong>https://</strong>.
              </span>
            </div>
          )}

          <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-start space-x-1.5">
            <span className="text-orange-500 font-bold">💡</span>
            <span>
              ¿Tienes una foto en internet? Haz clic derecho sobre ella, selecciona{' '}
              <em>"Copiar dirección de la imagen"</em> y pégala aquí.
            </span>
          </p>
        </div>
      )}

      {/* Vista previa reactiva de la foto seleccionada */}
      {selectedUrl && (
        <div className="space-y-1">
          <div className="relative h-20 sm:h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner group">
            {previewError ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-red-50/70 border border-red-200 text-red-600">
                <AlertTriangle className="w-4 h-4 mb-0.5 text-red-500" />
                <p className="text-[11px] font-bold">No pudimos cargar la vista previa</p>
                <p className="text-[9px] text-red-500/90 mt-0.5 max-w-xs">
                  Asegúrate de que la dirección sea una imagen accesible (.jpg, .png o .webp).
                </p>
              </div>
            ) : (
              <>
                <img
                  src={selectedUrl}
                  alt="Vista previa seleccionada"
                  className="w-full h-full object-cover transition-opacity duration-200"
                  onLoad={() => setPreviewError(false)}
                  onError={() => setPreviewError(true)}
                />
                <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[9px] font-bold flex items-center space-x-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                  <span>Foto Seleccionada</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
