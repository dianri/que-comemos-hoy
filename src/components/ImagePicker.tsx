import React, { useState, useMemo } from 'react';
import { Search, Link as LinkIcon, Check, Image as ImageIcon, Sparkles } from 'lucide-react';

interface FoodImageItem {
  id: string;
  name: string;
  url: string;
  tags: string[];
}

export const FOOD_IMAGES_CATALOG: FoodImageItem[] = [
  // Pizzas
  {
    id: 'pizza-margherita',
    name: 'Pizza Margherita',
    url: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80',
    tags: ['pizza', 'italiana', 'queso', 'mozzarella', 'albahaca', 'tomate'],
  },
  {
    id: 'pizza-pepperoni',
    name: 'Pizza Pepperoni',
    url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
    tags: ['pizza', 'pepperoni', 'italiana', 'queso'],
  },
  {
    id: 'pizza-artesanal',
    name: 'Pizza al Horno de Leña',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    tags: ['pizza', 'italiana', 'horno', 'masa'],
  },

  // Pastas
  {
    id: 'pasta-carbonara',
    name: 'Espaguetis Carbonara',
    url: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80',
    tags: ['pasta', 'espaguetis', 'carbonara', 'italiana', 'bacon', 'queso'],
  },
  {
    id: 'pasta-lasana',
    name: 'Lasaña al Horno',
    url: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=800&q=80',
    tags: ['lasaña', 'lasagna', 'pasta', 'carne', 'queso', 'italiana'],
  },
  {
    id: 'pasta-bolognesa',
    name: 'Pasta a la Boloñesa',
    url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
    tags: ['pasta', 'boloñesa', 'bolognese', 'espaguetis', 'carne', 'tomate'],
  },
  {
    id: 'pasta-pesto',
    name: 'Pasta al Pesto Verde',
    url: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=800&q=80',
    tags: ['pasta', 'pesto', 'albahaca', 'italiana', 'verde'],
  },

  // Tradicional & Arroces
  {
    id: 'arroz-paella',
    name: 'Paella Valenciana',
    url: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=800&q=80',
    tags: ['paella', 'arroz', 'marisco', 'pollo', 'española', 'tradicional'],
  },
  {
    id: 'arroz-marisco',
    name: 'Arroz Marinero',
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    tags: ['arroz', 'marisco', 'gambas', 'paella', 'pescado'],
  },
  {
    id: 'tradicional-tortilla',
    name: 'Tortilla de Patatas',
    url: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=800&q=80',
    tags: ['tortilla', 'patatas', 'huevo', 'española', 'tapas', 'tradicional'],
  },
  {
    id: 'tradicional-croquetas',
    name: 'Croquetas Caseras',
    url: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80',
    tags: ['croquetas', 'jamón', 'tapas', 'española', 'frito'],
  },
  {
    id: 'tradicional-guiso',
    name: 'Guiso de la Abuela',
    url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
    tags: ['guiso', 'lentejas', 'estofado', 'carne', 'patatas', 'caldo', 'sopa'],
  },

  // Hamburguesas & Americana
  {
    id: 'burger-smash',
    name: 'Hamburguesa Smash',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    tags: ['hamburguesa', 'burger', 'carne', 'queso', 'cheddar', 'patatas', 'americana'],
  },
  {
    id: 'burger-gourmet',
    name: 'Hamburguesa Doble Gourmet',
    url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
    tags: ['hamburguesa', 'burger', 'bacon', 'queso', 'americana'],
  },
  {
    id: 'alitas-pollo',
    name: 'Alitas de Pollo Crujientes',
    url: 'https://images.unsplash.com/photo-1527477378370-b4d4554b7914?auto=format&fit=crop&w=800&q=80',
    tags: ['alitas', 'pollo', 'barbacoa', 'crispy', 'frito'],
  },
  {
    id: 'perrito-caliente',
    name: 'Perrito Caliente / Hot Dog',
    url: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=800&q=80',
    tags: ['perrito', 'hotdog', 'salchicha', 'mostaza', 'americana'],
  },

  // Japonesa & Asiática
  {
    id: 'sushi-variado',
    name: 'Sushi & Nigiris',
    url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
    tags: ['sushi', 'nigiri', 'maki', 'japonesa', 'salmón', 'atún', 'pescado'],
  },
  {
    id: 'sushi-roll',
    name: 'California Rolls de Salmón',
    url: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=800&q=80',
    tags: ['sushi', 'roll', 'maki', 'aguacate', 'japonesa'],
  },
  {
    id: 'ramen-japones',
    name: 'Ramen Japonés con Huevo',
    url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    tags: ['ramen', 'sopa', 'fideos', 'noodles', 'japonesa', 'caldo', 'asiática'],
  },
  {
    id: 'poke-bowl',
    name: 'Poke Bowl Hawaiano',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    tags: ['poke', 'bowl', 'saludable', 'salmón', 'aguacate', 'arroz', 'ensalada'],
  },
  {
    id: 'arroz-pad-thai',
    name: 'Noodles / Pad Thai',
    url: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80',
    tags: ['pad thai', 'noodles', 'fideos', 'asiática', 'verduras', 'gambas'],
  },

  // Mexicana
  {
    id: 'tacos-pastor',
    name: 'Tacos al Pastor',
    url: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800&q=80',
    tags: ['tacos', 'mexicana', 'carne', 'cilantro', 'tortilla', 'picante'],
  },
  {
    id: 'burrito-mexicano',
    name: 'Burrito Completo',
    url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80',
    tags: ['burrito', 'mexicana', 'frijoles', 'arroz', 'carne', 'queso'],
  },
  {
    id: 'nachos-guacamole',
    name: 'Nachos con Guacamole y Queso',
    url: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=800&q=80',
    tags: ['nachos', 'guacamole', 'queso', 'mexicana', 'aguacate', 'aperitivo'],
  },

  // Saludable & Ensaladas
  {
    id: 'ensalada-mediterranea',
    name: 'Ensalada Mediterránea',
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    tags: ['ensalada', 'saludable', 'verduras', 'tomate', 'lechuga', 'fresco'],
  },
  {
    id: 'ensalada-cesar',
    name: 'Ensalada César con Pollo',
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    tags: ['ensalada', 'cesar', 'caesar', 'pollo', 'queso', 'saludable'],
  },
  {
    id: 'salmon-horno',
    name: 'Salmón al Horno con Verduras',
    url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
    tags: ['salmon', 'salmón', 'pescado', 'verduras', 'saludable', 'horno'],
  },
  {
    id: 'pescado-dorada',
    name: 'Pescado a la Plancha',
    url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    tags: ['pescado', 'dorada', 'lubina', 'plancha', 'saludable', 'limon'],
  },

  // Carnes
  {
    id: 'carne-chuleton',
    name: 'Chuletón a la Brasa',
    url: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80',
    tags: ['carne', 'chuleton', 'chuletón', 'buey', 'ternera', 'brasa', 'steak'],
  },
  {
    id: 'pollo-asado',
    name: 'Pollo Asado con Patatas',
    url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80',
    tags: ['pollo', 'asado', 'patatas', 'horno', 'carne'],
  },

  // Postres
  {
    id: 'postre-cheesecake',
    name: 'Tarta de Queso / Cheesecake',
    url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
    tags: ['tarta', 'queso', 'cheesecake', 'postre', 'dulce', 'frambuesa'],
  },
  {
    id: 'postre-chocolate',
    name: 'Tarta de Chocolate y Brownie',
    url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    tags: ['chocolate', 'tarta', 'brownie', 'postre', 'dulce'],
  },
  {
    id: 'postre-pancakes',
    name: 'Tortitas con Frutas y Miel',
    url: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80',
    tags: ['tortitas', 'pancakes', 'desayuno', 'dulce', 'miel', 'frutas'],
  },
];

const QUICK_FILTERS = [
  'Todos',
  'Pizza',
  'Pasta',
  'Arroz',
  'Burger',
  'Sushi',
  'Tacos',
  'Saludable',
  'Carne',
  'Pescado',
  'Postre',
];

interface ImagePickerProps {
  selectedUrl: string;
  onSelectUrl: (url: string) => void;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({ selectedUrl, onSelectUrl }) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'custom'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');

  // Filtrado reactivo en tiempo real
  const filteredImages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return FOOD_IMAGES_CATALOG.filter((item) => {
      // 1. Filtro rápido por píldora
      if (activeFilter !== 'Todos') {
        const matchesPill = item.tags.some((t) => t.includes(activeFilter.toLowerCase()));
        if (!matchesPill) return false;
      }

      // 2. Filtro por término de búsqueda
      if (!q) return true;
      const matchesName = item.name.toLowerCase().includes(q);
      const matchesTag = item.tags.some((t) => t.includes(q));
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
              placeholder="Buscar foto (ej. pizza, paella, ensalada, tacos...)"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 bg-slate-50/60"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-1"
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
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-50/50 rounded-xl border border-slate-100">
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
                      <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-md">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1 pointer-events-none">
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
        <div className="space-y-2 animate-fade-in">
          <div className="relative">
            <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="url"
              value={selectedUrl}
              onChange={(e) => onSelectUrl(e.target.value)}
              placeholder="https://ejemplo.com/tu-foto.jpg"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40"
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Pega el enlace directo a una imagen de internet (.jpg, .png, .webp).
          </p>
        </div>
      )}

      {/* Vista previa de la foto seleccionada */}
      {selectedUrl && (
        <div className="relative h-28 sm:h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner group">
          <img
            src={selectedUrl}
            alt="Vista previa seleccionada"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Foto Seleccionada</span>
          </div>
        </div>
      )}
    </div>
  );
};
