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
import { isPhotoImageUrl, isSafeImageUrl } from '../lib/sanitize';
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

/**
 * Diccionario de mapeo culinario español -> inglés para optimizar búsquedas
 * en fuentes internacionales (Wikipedia EN, Unsplash, TheMealDB), obteniendo
 * fotografías gastronómicas de alta calidad y evitando resultados institucionales o no culinarios.
 */
const CULINARY_TRANSLATION_MAP: Record<string, string> = {
  // Cremas y Sopas
  'crema de calabacin': 'zucchini cream soup',
  'crema de calabaza': 'pumpkin cream soup',
  'crema de verduras': 'vegetable cream soup',
  'crema de puerros': 'vichyssoise leek soup',
  'crema de champinones': 'mushroom cream soup',
  'crema de esparragos': 'asparagus cream soup',
  'crema de zanahoria': 'carrot cream soup',
  'sopa de ajo': 'castilian garlic soup',
  'sopa de fideos': 'chicken noodle soup',
  'sopa de cebolla': 'french onion soup',
  'sopa castellana': 'castilian garlic soup with egg',
  'gazpacho': 'gazpacho cold soup bowl',
  'gazpacho andaluz': 'andalusian gazpacho',
  'salmorejo': 'salmorejo cordobes cold soup',
  'ajoblanco': 'ajoblanco cold almond soup',
  'vichyssoise': 'vichyssoise cold leek soup',
  'caldo de pollo': 'chicken broth soup',
  'caldo de verduras': 'vegetable broth',

  // Legumbres y Guisos
  'lentejas': 'lentil soup stew',
  'lentejas con chorizo': 'spanish lentil stew with chorizo',
  'lentejas estofadas': 'spanish lentil stew',
  'cocido': 'spanish cocido chickpea stew',
  'cocido madrileno': 'cocido madrileno chickpea stew',
  'fabada': 'asturian fabada bean stew',
  'fabada asturiana': 'fabada asturiana bean stew',
  'garbanzos': 'chickpea stew',
  'garbanzos con espinacas': 'chickpeas with spinach',
  'judias pintas': 'red bean stew',
  'alubias': 'white bean stew',
  'potaje': 'spanish vegetable bean stew',
  'potaje de vigilia': 'chickpea cod spinach stew',

  // Arroces y Pastas
  'paella': 'spanish paella dish',
  'paella valenciana': 'traditional valencian paella',
  'paella de marisco': 'seafood paella dish',
  'arroz negro': 'black rice with squid ink',
  'arroz con pollo': 'chicken and rice dish',
  'arroz caldoso': 'spanish broth rice seafood',
  'arroz a banda': 'arroz a banda seafood rice',
  'fideua': 'fideua seafood noodle dish',
  'risotto': 'creamy mushroom risotto',
  'risotto de setas': 'mushroom risotto',
  'espaguetis carbonara': 'spaghetti carbonara pasta',
  'carbonara': 'pasta carbonara',
  'espaguetis bolonesa': 'spaghetti bolognese pasta',
  'bolonesa': 'pasta bolognese meat sauce',
  'lasana': 'baked meat lasagna',
  'lasana de carne': 'traditional beef lasagna',
  'lasana de verduras': 'vegetable lasagna',
  'macarrones con tomate': 'macaroni pasta with tomato sauce',
  'canelones': 'baked cannelloni pasta',
  'gnocchis': 'potato gnocchi dish',
  'pasta al pesto': 'pesto pasta dish',

  // Carnes
  'albondigas': 'meatballs in tomato sauce',
  'albondigas en salsa': 'spanish meatballs in sauce',
  'pechuga de pollo': 'grilled chicken breast',
  'pollo asado': 'roasted chicken with potatoes',
  'pollo al curry': 'chicken curry with rice',
  'pollo al horno': 'baked roast chicken',
  'pollo al ajillo': 'garlic chicken dish',
  'solomillo': 'tenderloin beef steak',
  'solomillo al pedro ximenez': 'beef tenderloin in wine sauce',
  'entrecot': 'grilled ribeye beef steak',
  'hamburguesa': 'gourmet burger with fries',
  'lomo': 'pork tenderloin steak',
  'costillas': 'barbecue pork ribs',
  'carrilleras': 'braised pork cheeks beef cheeks',
  'rabo de toro': 'oxtail stew traditional dish',
  'croquetas': 'spanish creamy croquettes',
  'croquetas de jamon': 'spanish ham croquettes',
  'san jacobo': 'cordon bleu breaded cutlet',
  'cachopo': 'asturian cachopo breaded beef',

  // Pescados y Mariscos
  'salmon': 'grilled salmon fillet with vegetables',
  'salmon a la plancha': 'pan seared salmon fillet',
  'salmon al horno': 'baked salmon fillet',
  'merluza': 'hake fish fillet dish',
  'merluza a la romana': 'fried hake fish',
  'merluza en salsa verde': 'hake in green parsley sauce',
  'bacalao': 'cod fish fillet dish',
  'bacalao al pil pil': 'cod fish pil pil',
  'lubina': 'baked sea bass fish',
  'dorada': 'baked sea bream fish',
  'atun': 'grilled tuna steak',
  'pulpo': 'galician style octopus',
  'pulpo a la gallega': 'pulpo a la gallega octopus',
  'calamares': 'fried calamari squid rings',
  'calamares en su tinta': 'squid in black ink sauce',
  'gambas al ajillo': 'garlic shrimp tapas',

  // Huevos y Tortillas
  'tortilla de patatas': 'spanish potato omelette',
  'tortilla espanola': 'spanish potato omelette',
  'tortilla francesa': 'rolled french omelette',
  'huevos rotos': 'broken fried eggs with french fries and ham',
  'huevos fritos con patatas': 'fried eggs with french fries',
  'huevos rellenos': 'deviled eggs with tuna',

  // Verduras y Ensaladas
  'ensalada': 'fresh green salad bowl',
  'ensalada mixta': 'mediterranean salad',
  'ensalada cesar': 'caesar salad with chicken',
  'ensaladilla rusa': 'spanish potato salad ensaladilla rusa',
  'pisto': 'spanish pisto manchego vegetable stew',
  'escalivada': 'catalan escalivada roasted vegetables',
  'esparragos': 'grilled green asparagus',
  'judias verdes': 'green beans with potatoes and olive oil',
  'alcachofas': 'baked artichokes with ham',
  'berenjenas rellenas': 'stuffed baked eggplants',

  // Internacionales
  'pizza': 'artisan italian pizza',
  'sushi': 'assorted sushi roll plate',
  'ramen': 'japanese ramen noodle soup bowl',
  'tacos': 'mexican street tacos',
  'fajitas': 'sizzling chicken fajitas',
  'burrito': 'mexican burrito wrap',
  'ceviche': 'fresh fish ceviche bowl',
  'guacamole': 'fresh guacamole with tortilla chips',
  'hummus': 'creamy hummus bowl with pita',
  'falafel': 'crispy falafel with tahini',
  'pad thai': 'traditional pad thai noodle plate',

  // Postres
  'tarta de queso': 'baked cheesecake slice',
  'cheesecake': 'creamy cheesecake slice',
  'tarta de manzana': 'apple pie tart slice',
  'tiramisu': 'italian tiramisu dessert',
  'brownie': 'chocolate brownie with vanilla ice cream',
  'flan': 'caramel flan custard dessert',
  'arroz con leche': 'spanish rice pudding with cinnamon',
  'torrijas': 'spanish french toast torrijas',
  'churros': 'spanish churros with hot chocolate',
};

/**
 * Obtiene la traducción culinaria al inglés o aplica reglas heurísticas de contexto gastronómico.
 */
function getCulinaryEnglishTranslation(query: string): string {
  const norm = normalizeText(query);
  if (CULINARY_TRANSLATION_MAP[norm]) {
    return CULINARY_TRANSLATION_MAP[norm];
  }

  // Comprobar coincidencia parcial en claves del diccionario
  for (const [esKey, enVal] of Object.entries(CULINARY_TRANSLATION_MAP)) {
    if (norm.includes(esKey) || esKey.includes(norm)) {
      return enVal;
    }
  }

  // Heurísticas de prefijo
  if (norm.startsWith('crema de ')) {
    const ingredient = norm.replace('crema de ', '').trim();
    return `${ingredient} cream soup food dish`;
  }
  if (norm.startsWith('sopa de ')) {
    const ingredient = norm.replace('sopa de ', '').trim();
    return `${ingredient} soup food dish`;
  }
  if (norm.startsWith('arroz con ')) {
    const ingredient = norm.replace('arroz con ', '').trim();
    return `rice with ${ingredient} dish`;
  }
  if (norm.startsWith('ensalada de ')) {
    const ingredient = norm.replace('ensalada de ', '').trim();
    return `${ingredient} salad plate`;
  }
  if (norm.startsWith('tarta de ') || norm.startsWith('pastel de ')) {
    const ingredient = norm.replace(/^(tarta|pastel) de /, '').trim();
    return `${ingredient} pie cake dessert`;
  }

  return `${query} food recipe meal dish`;
}

// Palabras estrictamente prohibidas en títulos o URLs (documentos, política, mapas, logos, diagramas)
const BANNED_TITLE_WORDS = [
  'decreto',
  'resolucion',
  'ordenanza',
  'boletin',
  'acta',
  'ley',
  'licitacion',
  'estatuto',
  'pdf',
  'documento',
  'boe',
  'borme',
  'ayuntamiento',
  'tribunal',
  'flag',
  'bandera',
  'map',
  'mapa',
  'logo',
  'logotipo',
  'escudo',
  'diagram',
  'diagrama',
  'icon',
  'icono',
  'symbol',
  'simbolo',
  'location',
  'ubicacion',
  'chart',
  'grafico',
  'screenshot',
  'captura',
  'vector',
  'esquema',
  'organigrama',
  'edificio',
  'building',
  'street',
  'calle',
  'portrait',
  'retrato',
  'person',
  'people',
  'politician',
  'alcalde',
  'parlamento',
  'congreso',
];

/**
 * Validador estricto para asegurar que una foto candidata sea una fotografía gastronómica legítima
 * y no un documento, PDF, gráfico, mapa o página no relacionada.
 */
function isValidFoodPhotoCandidate(url?: string, title?: string): boolean {
  if (!url) return false;
  if (!isPhotoImageUrl(url)) return false;

  const textToCheck = `${url} ${title || ''}`.toLowerCase();
  return !BANNED_TITLE_WORDS.some((kw) => textToCheck.includes(kw));
}

/**
 * Busca fotos en tiempo real consultando fuentes públicas libres y el catálogo local,
 * acotando estrictamente la búsqueda con palabras clave culinarias y filtros de seguridad.
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
  const englishQuery = getCulinaryEnglishTranslation(cleanQuery);

  // 1. Unsplash API (si existe clave en variables de entorno, con filtro de contenido alto y términos culinarios)
  const unsplashKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  const unsplashPromise = unsplashKey
    ? fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          `${englishQuery} food dish gourmet photography`
        )}&per_page=12&content_filter=high&orientation=landscape&client_id=${unsplashKey}`,
        { signal }
      )
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          const list: PhotoResult[] = [];
          if (Array.isArray(data?.results)) {
            for (const item of data.results) {
              const url = item.urls?.regular || item.urls?.small;
              const title = item.description || item.alt_description || cleanQuery;
              if (isValidFoodPhotoCandidate(url, title) && !seenUrls.has(url)) {
                seenUrls.add(url);
                list.push({
                  id: `un-${item.id}`,
                  name: title,
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

  // 2. Wikipedia en Español (Búsqueda acotada con operadores culinarios para evitar artículos no gastronómicos)
  const wikiEsQuery = `${cleanQuery} (gastronomía OR plato OR comida OR receta)`;
  const wikiEsPromise = fetch(
    `https://es.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      wikiEsQuery
    )}&gsrlimit=8&prop=pageimages&pithumbsize=800&format=json&origin=*`,
    { signal }
  )
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      const list: PhotoResult[] = [];
      if (data?.query?.pages) {
        for (const p of Object.values(data.query.pages) as any[]) {
          const src = p.thumbnail?.source;
          const title = (p.title || '').trim();
          if (isValidFoodPhotoCandidate(src, title) && !seenUrls.has(src)) {
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
      return list;
    })
    .catch(() => []);

  // 3. Wikipedia en Inglés (Excelente fuente para platos internacionales y recetas con traducción culinaria)
  const wikiEnQuery = `${englishQuery} (dish OR food OR soup OR recipe)`;
  const wikiEnPromise = fetch(
    `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      wikiEnQuery
    )}&gsrlimit=8&prop=pageimages&pithumbsize=800&format=json&origin=*`,
    { signal }
  )
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      const list: PhotoResult[] = [];
      if (data?.query?.pages) {
        for (const p of Object.values(data.query.pages) as any[]) {
          const src = p.thumbnail?.source;
          const title = (p.title || '').trim();
          if (isValidFoodPhotoCandidate(src, title) && !seenUrls.has(src)) {
            seenUrls.add(src);
            list.push({
              id: `wken-${p.pageid}`,
              name: title,
              url: src,
              source: 'wikipedia',
            });
          }
        }
      }
      return list;
    })
    .catch(() => []);

  // 4. Wikimedia Commons (búsqueda estricta de fotos de comida bitmap, descartando PDFs o vectores)
  const commonsQuery = `"${cleanQuery}" (dish OR food OR recipe OR comida) filetype:bitmap -pdf -doc`;
  const commonsPromise = fetch(
    `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(
      commonsQuery
    )}&gsrlimit=8&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json&origin=*`,
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
          if (isValidFoodPhotoCandidate(src, rawTitle) && !seenUrls.has(src)) {
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
      return list;
    })
    .catch(() => []);

  // 5. TheMealDB API (fotos de recetas internacionales con término en inglés)
  const mealDbTerm = englishQuery.split(' ')[0] || cleanQuery;
  const mealDbPromise = fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(mealDbTerm)}`,
    { signal }
  )
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      const list: PhotoResult[] = [];
      if (Array.isArray(data?.meals)) {
        for (const m of data.meals) {
          const src = m.strMealThumb;
          if (isValidFoodPhotoCandidate(src, m.strMeal) && !seenUrls.has(src)) {
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
  const [unsplashList, wikiEsList, wikiEnList, commonsList, mealList] = await Promise.all([
    unsplashPromise,
    wikiEsPromise,
    wikiEnPromise,
    commonsPromise,
    mealDbPromise,
  ]);

  results.push(...unsplashList, ...wikiEsList, ...wikiEnList, ...commonsList, ...mealList);

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

  // Función para abrir Google Imágenes con términos culinarios estrictos, SafeSearch y formato fotográfico
  const handleOpenGoogleImages = () => {
    const term = foodName.trim() || searchQuery.trim() || 'comida casera';
    const refinedQuery = `"${term}" receta plato comida -filetype:pdf -filetype:doc -site:boe.es -site:gob.es`;
    const query = encodeURIComponent(refinedQuery);
    // safe=active activa SafeSearch estricto en Google; tbs=itp:photo exige que sean exclusivamente fotografías
    const googleImagesUrl = `https://www.google.com/search?tbm=isch&q=${query}&safe=active&tbs=itp:photo`;
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
                    : 'Escribe el plato (crema de calabacín, paella, carbonara...)'
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
                No encontramos fotos gastronómicas para "{searchQuery}"
              </p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Prueba con otro término similar o abre Google Imágenes con filtro fotográfico y copia la dirección de la foto.
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
          {/* Botón para buscar en Google Imágenes con SafeSearch y filtro fotográfico */}
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
              title="Abrir Google Imágenes filtrado por recetas fotográficas en una pestaña nueva"
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
                const rawUrl = e.target.value.trim();
                setPreviewError(false);
                if (!rawUrl) {
                  onSelectUrl('');
                } else if (isPhotoImageUrl(rawUrl)) {
                  onSelectUrl(rawUrl);
                } else if (isSafeImageUrl(rawUrl)) {
                  // Empieza por https pero no parece foto o es documento/página
                  setPreviewError(true);
                  onSelectUrl('');
                } else {
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
                Introduce una URL segura de imagen válida (<strong>.jpg, .png o .webp</strong>). No se admiten documentos PDF ni páginas web.
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
                  Asegúrate de que la dirección sea una imagen accesible (.jpg, .png o .webp) y no un documento o enlace protegido.
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
