import React, { useState, useMemo } from 'react';
import { Search, Link as LinkIcon, Check, Image as ImageIcon, Sparkles, ExternalLink, AlertTriangle } from 'lucide-react';
import { isSafeImageUrl } from '../lib/sanitize';

export interface FoodImageItem {
  id: string;
  name: string;
  url: string;
  tags: string[];
}

export const FOOD_IMAGES_CATALOG: FoodImageItem[] = [
  // --- 33 Platos Tradicionales del Recetario ---
  {
    id: 'lentejas',
    name: 'Lentejas',
    url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
    tags: ['lentejas', 'guiso', 'chorizo', 'legumbres', 'tradicional', 'abuela', 'cuchara', 'estofado', 'sopas', 'pimenton'],
  },
  {
    id: 'fideua',
    name: 'Fideuà',
    url: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=800&q=80',
    tags: ['fideua', 'fideuà', 'fideos', 'marisco', 'gambas', 'sepia', 'arroces', 'valenciana', 'alioli', 'pescados'],
  },
  {
    id: 'asado',
    name: 'Asado',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    tags: ['asado', 'carne', 'carnes', 'horno', 'costillas', 'cordero', 'patatas', 'brasa', 'tradicional'],
  },
  {
    id: 'patatas-fritas',
    name: 'Patatas fritas',
    url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
    tags: ['patatas fritas', 'patatas', 'papas', 'fritas', 'guarnicion', 'french fries', 'tradicional', 'tapas'],
  },
  {
    id: 'patatas-a-lo-pobre',
    name: 'Patatas a lo pobre',
    url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
    tags: ['patatas a lo pobre', 'patatas', 'papas', 'pimientos', 'cebolla', 'tapas', 'tradicional', 'andaluz'],
  },
  {
    id: 'espaguetis-marinera',
    name: 'Espaguetis a la marinera',
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    tags: ['espaguetis a la marinera', 'pasta', 'espaguetis', 'marisco', 'almejas', 'gambas', 'mejillones', 'italiana', 'pescados'],
  },
  {
    id: 'albondigas',
    name: 'Albóndigas',
    url: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=800&q=80',
    tags: ['albondigas', 'albóndigas', 'carne', 'carnes', 'tomate', 'salsa', 'guisantes', 'tradicional', 'meatballs'],
  },
  {
    id: 'magra-en-salsa',
    name: 'Magra en salsa',
    url: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=800&q=80',
    tags: ['magra en salsa', 'magra', 'cerdo', 'carne', 'carnes', 'tomate', 'salsa', 'estofado', 'tradicional', 'tapa'],
  },
  {
    id: 'macarrones-con-tomate',
    name: 'Macarrones con tomate',
    url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
    tags: ['macarrones con tomate', 'macarrones', 'pasta', 'tomate', 'queso', 'gratinado', 'italiana', 'carne'],
  },
  {
    id: 'arroz-a-la-cubana',
    name: 'Arroz a la cubana',
    url: 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=800&q=80',
    tags: ['arroz a la cubana', 'arroz', 'arroces', 'huevo frito', 'tomate', 'platano', 'tradicional'],
  },
  {
    id: 'lasana',
    name: 'Lasaña',
    url: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=800&q=80',
    tags: ['lasaña', 'lasana', 'lasagna', 'pasta', 'carne', 'carnes', 'bechamel', 'queso', 'italiana', 'horno'],
  },
  {
    id: 'salmon',
    name: 'Salmón',
    url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
    tags: ['salmon', 'salmón', 'pescado', 'pescados', 'plancha', 'esparragos', 'saludable'],
  },
  {
    id: 'pechugas-de-pollo',
    name: 'Pechugas de pollo',
    url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80',
    tags: ['pechugas de pollo', 'pechuga', 'pollo', 'plancha', 'carne', 'carnes', 'saludable', 'ligero'],
  },
  {
    id: 'chuletas-cabeza-lomo',
    name: 'Chuletas de cabeza de lomo',
    url: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=800&q=80',
    tags: ['chuletas de cabeza de lomo', 'chuletas', 'lomo', 'cerdo', 'carne', 'carnes', 'plancha', 'tradicional'],
  },
  {
    id: 'arroz-con-secreto',
    name: 'Arroz con secreto',
    url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
    tags: ['arroz con secreto', 'arroz', 'arroces', 'secreto', 'iberico', 'setas', 'boletus', 'paella', 'carnes'],
  },
  {
    id: 'salmorejo',
    name: 'Salmorejo',
    url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80',
    tags: ['salmorejo', 'cordobes', 'tomate', 'jamon', 'huevo', 'sopa', 'sopas', 'fria', 'tradicional', 'andaluz'],
  },
  {
    id: 'gazpacho',
    name: 'Gazpacho',
    url: 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=800&q=80',
    tags: ['gazpacho', 'andaluz', 'tomate', 'pepino', 'sopa', 'sopas', 'fria', 'saludable', 'verano', 'tradicional'],
  },
  {
    id: 'pollo-asado',
    name: 'Pollo asado',
    url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80',
    tags: ['pollo asado', 'pollo', 'asado', 'horno', 'patatas', 'carne', 'carnes', 'tradicional'],
  },
  {
    id: 'ensaladilla-rusa',
    name: 'Ensaladilla rusa',
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    tags: ['ensaladilla rusa', 'ensaladilla', 'patata', 'atun', 'mayonesa', 'tapas', 'tradicional', 'frio'],
  },
  {
    id: 'ensaladilla-de-mariscos',
    name: 'Ensaladilla de mariscos',
    url: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&w=800&q=80',
    tags: ['ensaladilla de mariscos', 'ensaladilla', 'marisco', 'langostinos', 'gambas', 'patata', 'pescados', 'tapas'],
  },
  {
    id: 'rinones-encebollados',
    name: 'Riñones encebollados',
    url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    tags: ['riñones encebollados', 'rinones encebollados', 'riñones', 'casqueria', 'cebolla', 'jerez', 'carne', 'carnes', 'guiso'],
  },
  {
    id: 'higado-encebollado',
    name: 'Hígado encebollado',
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    tags: ['higado encebollado', 'hígado encebollado', 'higado', 'cebolla', 'carne', 'carnes', 'casqueria', 'tradicional'],
  },
  {
    id: 'croquetas',
    name: 'Croquetas',
    url: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80',
    tags: ['croquetas', 'jamon', 'jamón', 'bechamel', 'tapas', 'aperitivo', 'tradicional', 'frito'],
  },
  {
    id: 'flamenquines',
    name: 'Flamenquines',
    url: 'https://images.unsplash.com/photo-1625938144755-652e08e359b7?auto=format&fit=crop&w=800&q=80',
    tags: ['flamenquines', 'cordoba', 'lomo', 'jamon', 'empanado', 'carne', 'carnes', 'frito', 'tradicional'],
  },
  {
    id: 'sanjacobos',
    name: 'Sanjacobos',
    url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
    tags: ['sanjacobos', 'jamon', 'queso', 'empanado', 'carne', 'carnes', 'queso fundido', 'frito', 'tradicional'],
  },
  {
    id: 'nuggets',
    name: 'Nuggets',
    url: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=800&q=80',
    tags: ['nuggets', 'pollo', 'crujiente', 'frito', 'americana', 'snack', 'dip', 'carne'],
  },
  {
    id: 'merluza-a-la-plancha',
    name: 'Merluza a la plancha',
    url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
    tags: ['merluza a la plancha', 'merluza', 'pescado', 'pescados', 'plancha', 'saludable', 'limon', 'ajo'],
  },
  {
    id: 'caldo-de-pollo',
    name: 'Caldo de pollo',
    url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
    tags: ['caldo de pollo', 'caldo', 'sopa', 'sopas', 'pollo', 'fideos', 'consome', 'tradicional', 'invierno'],
  },
  {
    id: 'sopa-de-mariscos',
    name: 'Sopa de mariscos',
    url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    tags: ['sopa de mariscos', 'sopa', 'sopas', 'marisco', 'gambas', 'mejillones', 'fumet', 'pescados', 'caldo'],
  },
  {
    id: 'gambas-a-la-plancha',
    name: 'Gambas a la plancha',
    url: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80',
    tags: ['gambas a la plancha', 'gambas', 'marisco', 'pescados', 'plancha', 'sal gorda', 'limon', 'tapas'],
  },
  {
    id: 'champinones-a-la-plancha',
    name: 'Champiñones a la plancha',
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    tags: ['champinones a la plancha', 'champiñones a la plancha', 'champinones', 'champiñones', 'setas', 'plancha', 'saludable', 'tapas'],
  },
  {
    id: 'sardinas-a-la-plancha',
    name: 'Sardinas a la plancha',
    url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    tags: ['sardinas a la plancha', 'sardinas', 'pescado', 'pescados', 'plancha', 'saludable', 'mediterraneo', 'espeto'],
  },
  {
    id: 'secreto-a-la-plancha',
    name: 'Secreto a la plancha',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    tags: ['secreto a la plancha', 'secreto', 'iberico', 'carne', 'carnes', 'cerdo', 'plancha', 'brasa'],
  },

  // --- Platos Favoritos Adicionales ---
  {
    id: 'tortilla-patatas',
    name: 'Tortilla de Patatas',
    url: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=800&q=80',
    tags: ['tortilla', 'patatas', 'huevo', 'española', 'tapas', 'tradicional'],
  },
  {
    id: 'paella-valenciana',
    name: 'Paella Valenciana',
    url: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=800&q=80',
    tags: ['paella', 'arroz', 'arroces', 'marisco', 'pollo', 'española', 'tradicional'],
  },
  {
    id: 'pizza-margherita',
    name: 'Pizza Margherita',
    url: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80',
    tags: ['pizza', 'italiana', 'queso', 'mozzarella', 'albahaca', 'tomate'],
  },
  {
    id: 'burger-smash',
    name: 'Hamburguesa Smash',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    tags: ['hamburguesa', 'burger', 'carne', 'carnes', 'queso', 'cheddar', 'patatas', 'americana'],
  },
  {
    id: 'tacos-pastor',
    name: 'Tacos al Pastor',
    url: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800&q=80',
    tags: ['tacos', 'mexicana', 'carne', 'carnes', 'cilantro', 'tortilla', 'picante'],
  },
  {
    id: 'sushi-variado',
    name: 'Sushi & Nigiris',
    url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
    tags: ['sushi', 'nigiri', 'maki', 'japonesa', 'salmón', 'atún', 'pescado', 'pescados'],
  },
  {
    id: 'ensalada-mediterranea',
    name: 'Ensalada Mediterránea',
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    tags: ['ensalada', 'saludable', 'verduras', 'tomate', 'lechuga', 'fresco'],
  },
  {
    id: 'postre-cheesecake',
    name: 'Tarta de Queso / Cheesecake',
    url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
    tags: ['tarta', 'queso', 'cheesecake', 'postre', 'dulce', 'frambuesa'],
  },
];

const QUICK_FILTERS = [
  'Todos',
  'Tradicional',
  'Carnes',
  'Pescados',
  'Sopas',
  'Arroces',
  'Pasta',
  'Saludable',
  'Pizza',
  'Burger',
  'Tapas',
];

// Función auxiliar para búsqueda sin distinción de tildes/acentos
const normalizeText = (text: string): string => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

interface ImagePickerProps {
  selectedUrl: string;
  onSelectUrl: (url: string) => void;
  foodName?: string;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({ selectedUrl, onSelectUrl, foodName = '' }) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'custom'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [previewError, setPreviewError] = useState(false);

  // Función para abrir Google Imágenes con el nombre del plato
  const handleOpenGoogleImages = () => {
    const term = (foodName.trim() || searchQuery.trim() || 'comida casera');
    const query = encodeURIComponent(`${term} receta comida`);
    const googleImagesUrl = `https://www.google.com/search?tbm=isch&q=${query}`;
    window.open(googleImagesUrl, '_blank', 'noopener,noreferrer');
  };

  // Filtrado reactivo en tiempo real con normalización de acentos
  const filteredImages = useMemo(() => {
    const qNorm = normalizeText(searchQuery.trim());
    return FOOD_IMAGES_CATALOG.filter((item) => {
      // 1. Filtro rápido por píldora
      if (activeFilter !== 'Todos') {
        const filterNorm = normalizeText(activeFilter);
        const matchesPill = item.tags.some((t) => {
          const tNorm = normalizeText(t);
          return tNorm.includes(filterNorm) || filterNorm.includes(tNorm);
        });
        if (!matchesPill) return false;
      }

      // 2. Filtro por término de búsqueda
      if (!qNorm) return true;
      const matchesName = normalizeText(item.name).includes(qNorm);
      const matchesTag = item.tags.some((t) => normalizeText(t).includes(qNorm));
      return matchesName || matchesTag;
    });
  }, [searchQuery, activeFilter]);

  return (
    <div className="space-y-3">
      {/* Selector de Pestañas: Catálogo vs URL Manual */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-orange-500" />
          <span>Fotografía del Plato *</span>
        </label>

        <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center space-x-1 ${
              activeTab === 'catalog'
                ? 'bg-white text-orange-600 shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Search className="w-3 h-3" />
            <span>Buscar Foto</span>
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

      {activeTab === 'catalog' ? (
        <div className="space-y-2.5 animate-fade-in">
          {/* Barra de Búsqueda de Fotos */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar foto (ej. lentejas, fideuà, asado, albóndigas...)"
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 bg-slate-50/60"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-1"
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtros rápidos con presets */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
            {QUICK_FILTERS.map((filter) => {
              const active = activeFilter === filter;
              return (
                <button
                  type="button"
                  key={filter}
                  onClick={() => {
                    setActiveFilter(filter);
                    setSearchQuery('');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                    active
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>

          {/* Cuadrícula de Fotos con selección visual */}
          {filteredImages.length === 0 ? (
            <div className="py-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-1">
              <p className="text-xs font-semibold text-slate-600">No encontramos fotos para "{searchQuery}"</p>
              <p className="text-[11px] text-slate-400">
                Prueba con otro término o pega una URL personalizada en la pestaña "URL Directa".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-52 overflow-y-auto p-1 bg-slate-50/50 rounded-xl border border-slate-100">
              {filteredImages.map((item) => {
                const isSelected = selectedUrl === item.url;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => onSelectUrl(item.url)}
                    className={`group relative aspect-video rounded-lg overflow-hidden border transition-all text-left ${
                      isSelected
                        ? 'ring-2 ring-orange-500 border-orange-500 shadow-md scale-98'
                        : 'border-slate-200 hover:border-orange-300 hover:shadow-sm opacity-90 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Check de selección */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-orange-500/25 flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-md">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-1 pointer-events-none">
                      <p className="text-[10px] text-white font-medium truncate leading-tight">
                        {item.name}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3 animate-fade-in">
          {/* Botón llamativo para buscar en Google Imágenes */}
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
              className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all"
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
                // Solo pasamos la URL si está vacía (para borrar) o es segura (https://)
                if (!rawUrl || isSafeImageUrl(rawUrl)) {
                  onSelectUrl(rawUrl);
                } else if (rawUrl.startsWith('https://')) {
                  // URL https en construcción (aún no válida), la pasamos igual para no bloquear tipado
                  onSelectUrl(rawUrl);
                } else if (rawUrl.length > 0) {
                  // Esquema no seguro detectado (javascript:, data:, http:, etc.) — bloquear y alertar
                  setPreviewError(true);
                  onSelectUrl('');
                }
              }}
              placeholder="https://ejemplo.com/tu-foto.jpg"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 bg-white"
            />
          </div>
          {/* Aviso de esquema no seguro */}
          {previewError && !selectedUrl && (
            <div className="flex items-center space-x-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Solo se permiten URLs seguras que comiencen por <strong>https://</strong>. Se han bloqueado esquemas peligrosos.</span>
            </div>
          )}

          {/* Guía visual para el usuario */}
          <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-start space-x-1.5">
            <span className="text-orange-500 font-bold">💡</span>
            <span>
              ¿No tienes el enlace? Haz clic en <strong>"Buscar en Google"</strong>, haz clic derecho sobre la imagen que te guste, selecciona <em>"Copiar dirección de la imagen"</em> y pégala aquí.
            </span>
          </p>
        </div>
      )}

      {/* Vista previa reactiva de la foto seleccionada con validación visual */}
      {selectedUrl && (
        <div className="space-y-1.5">
          <div className="relative h-28 sm:h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner group">
            {previewError ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-red-50/70 border border-red-200 text-red-600">
                <AlertTriangle className="w-5 h-5 mb-1 text-red-500" />
                <p className="text-xs font-bold">No pudimos cargar la vista previa</p>
                <p className="text-[10px] text-red-500/90 mt-0.5 max-w-xs">
                  Asegúrate de copiar la dirección directa de la imagen (que termine en .jpg, .png o .webp).
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
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
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
