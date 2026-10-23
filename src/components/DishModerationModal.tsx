import React, { useState } from 'react';
import {
  X,
  Bell,
  Check,
  ChefHat,
  Search,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Loader2,
  Calendar,
} from 'lucide-react';
import { Food, getFoodCategories, getFoodCreatorDisplayName } from '../types';
import { safeImageUrl, SAFE_FALLBACK_IMAGE } from '../lib/sanitize';

interface DishModerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingFoods: Food[];
  onApproveFood: (food: Food) => Promise<void> | void;
  onRejectFood: (food: Food) => Promise<void> | void;
  onSelectFood?: (food: Food) => void;
}

export const DishModerationModal: React.FC<DishModerationModalProps> = ({
  isOpen,
  onClose,
  pendingFoods,
  onApproveFood,
  onRejectFood,
  onSelectFood,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredList = pendingFoods.filter((f) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const authorName = getFoodCreatorDisplayName(f).toLowerCase();
    const email = (f.user_email || '').toLowerCase();
    const name = f.name.toLowerCase();
    return name.includes(q) || authorName.includes(q) || email.includes(q);
  });

  const handleApprove = async (food: Food) => {
    setProcessingId(food.id);
    try {
      await onApproveFood(food);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (food: Food) => {
    setProcessingId(food.id);
    try {
      await onRejectFood(food);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabecera del Modal */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-3 bg-gradient-to-r from-orange-50/50 via-white to-amber-50/30 flex-shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 flex-shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-xl font-extrabold text-slate-800 leading-tight">
                  Moderación de Platos
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-orange-100 text-orange-700 border border-orange-200">
                  {pendingFoods.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                Revisa las propuestas de la comunidad para la carta general
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Buscador interno si hay más de 2 platos */}
        {pendingFoods.length > 2 && (
          <div className="p-3 sm:px-6 border-b border-slate-100 bg-slate-50/60 flex-shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar por nombre de plato o chef solicitante..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
            </div>
          </div>
        )}

        {/* Contenido / Lista de Platos Pendientes */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
          {pendingFoods.length === 0 ? (
            <div className="py-12 sm:py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-100 shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                ¡Bandeja de moderación al día! 🎉
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                No hay platos pendientes de revisión por ahora. Cuando los comensales soliciten incluir nuevas recetas en la carta general, aparecerán aquí para tu aprobación.
              </p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs sm:text-sm">
              No se encontró ningún plato pendiente que coincida con "{searchQuery}".
            </div>
          ) : (
            filteredList.map((food) => {
              const categories = getFoodCategories(food);
              const authorDisplayName = getFoodCreatorDisplayName(food);
              const isBusy = processingId === food.id;

              return (
                <div
                  key={food.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-orange-200 shadow-xs hover:shadow-md transition-all p-3.5 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between"
                >
                  {/* Foto y Datos del Plato */}
                  <div className="flex items-start space-x-3 sm:space-x-4 min-w-0 flex-1">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
                      <img
                        src={safeImageUrl(food.image_url)}
                        alt={food.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = SAFE_FALLBACK_IMAGE;
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        {categories.slice(0, 2).map((cat) => (
                          <span
                            key={cat}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200"
                          >
                            {cat}
                          </span>
                        ))}
                        {categories.length > 2 && (
                          <span className="text-[10px] text-slate-400 font-semibold">
                            +{categories.length - 2}
                          </span>
                        )}
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          ⏳ Pendiente
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-extrabold text-slate-800 leading-snug truncate">
                        {food.name}
                      </h4>

                      {food.description && (
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {food.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11px] text-slate-500">
                        <span className="flex items-center space-x-1 font-semibold text-slate-600 truncate">
                          <ChefHat className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                          <span className="truncate">{authorDisplayName}</span>
                        </span>
                        {food.user_email && (
                          <span className="text-slate-400 truncate max-w-[150px] sm:max-w-[200px]">
                            {food.user_email}
                          </span>
                        )}
                        {food.created_at && (
                          <span className="flex items-center space-x-1 text-slate-400 text-[10px]">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span>{formatDate(food.created_at)}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Acciones de Moderación */}
                  <div className="flex items-center space-x-2 w-full sm:w-auto justify-end flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {onSelectFood && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectFood(food);
                        }}
                        disabled={isBusy}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold transition-all flex items-center space-x-1"
                        title="Ver detalle completo de la receta"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Ver</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleReject(food)}
                      disabled={isBusy}
                      className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-all flex items-center space-x-1 disabled:opacity-50 cursor-pointer active:scale-95"
                      title="Rechazar solicitud (dejar el plato privado para su autor)"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Rechazar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApprove(food)}
                      disabled={isBusy}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/25 flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer active:scale-95"
                      title="Aprobar e incluir en la carta general comunitaria"
                    >
                      {isBusy ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      )}
                      <span>Aprobar</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pie del Modal */}
        <div className="p-3.5 sm:p-4 px-4 sm:px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-shrink-0 text-xs text-slate-500">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <span>Al aprobar, el plato pasa automáticamente a la pantalla principal para todos.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
