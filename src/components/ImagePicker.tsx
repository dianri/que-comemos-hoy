import React, { useState, useMemo } from 'react';
import { Search, Link as LinkIcon, Check, Image as ImageIcon, Sparkles, ExternalLink, AlertTriangle } from 'lucide-react';
import { isSafeImageUrl } from '../lib/sanitize';
import { FOOD_IMAGES_CATALOG, FoodImageItem } from '../constants/foodImages';

export type { FoodImageItem };
export { FOOD_IMAGES_CATALOG };

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
  'Postres',
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
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar foto (lentejas, fideuà, asado...)"
              className="w-full h-8 sm:h-9 pl-8 pr-7 py-1 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/40 bg-slate-50/60"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-0.5"
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtros rápidos con presets */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-0.5 text-xs scrollbar-none">
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
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                    active
                      ? 'bg-orange-500 text-white shadow-xs'
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
            <div className="py-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-1">
              <p className="text-xs font-semibold text-slate-600">No encontramos fotos para "{searchQuery}"</p>
              <p className="text-[10px] text-slate-400">
                Prueba con otro término o pega una URL en "URL Directa".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-2 max-h-40 sm:max-h-52 overflow-y-auto p-1 bg-slate-50/50 rounded-xl border border-slate-100">
              {filteredImages.map((item) => {
                const isSelected = selectedUrl === item.url;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => onSelectUrl(item.url)}
                    className={`group relative aspect-[4/3] sm:aspect-video rounded-lg overflow-hidden border transition-all text-left ${
                      isSelected
                        ? 'ring-2 ring-orange-500 border-orange-500 shadow-md scale-98'
                        : 'border-slate-200 hover:border-orange-300 hover:shadow-xs opacity-90 hover:opacity-100'
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
                        <div className="w-4 h-4 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-md">
                          <Check className="w-3 h-3" />
                        </div>
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-1 pointer-events-none">
                      <p className="text-[9px] sm:text-[10px] text-white font-medium truncate leading-tight">
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
        <div className="space-y-1">
          <div className="relative h-20 sm:h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner group">
            {previewError ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-red-50/70 border border-red-200 text-red-600">
                <AlertTriangle className="w-4 h-4 mb-0.5 text-red-500" />
                <p className="text-[11px] font-bold">No pudimos cargar la vista previa</p>
                <p className="text-[9px] text-red-500/90 mt-0.5 max-w-xs">
                  Asegúrate de copiar la dirección directa de la imagen (.jpg, .png o .webp).
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
