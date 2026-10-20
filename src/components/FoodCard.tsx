import React, { useState } from 'react';
import { Heart, Sparkles, Trash2, Star, Pencil, ChefHat } from 'lucide-react';
import { Food } from '../types';
import { useUser } from '../context/UserContext';
import { safeImageUrl } from '../lib/sanitize';

interface FoodCardProps {
  food: Food;
  onDelete?: (id: string) => void;
  onEdit?: (food: Food) => void;
  onSelect?: (food: Food) => void;
  isHighlighted?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  Tradicional: 'bg-orange-100 text-orange-800 border-orange-200',
  Carnes: 'bg-rose-100 text-rose-800 border-rose-200',
  Pescados: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  Sopas: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Arroces: 'bg-amber-100 text-amber-800 border-amber-200',
  Italiana: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Americana: 'bg-red-100 text-red-800 border-red-200',
  Mexicana: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Japonesa: 'bg-purple-100 text-purple-800 border-purple-200',
  Saludable: 'bg-teal-100 text-teal-800 border-teal-200',
  General: 'bg-slate-100 text-slate-800 border-slate-200',
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80';

export const FoodCard: React.FC<FoodCardProps> = ({
  food,
  onDelete,
  onEdit,
  onSelect,
  isHighlighted = false,
}) => {
  const {
    user,
    userName,
    userVotes,
    toggleVote,
    isFavorite,
    toggleFavorite,
    canManageFood,
    isSuperUser,
  } = useUser();

  const [imgSrc, setImgSrc] = useState(safeImageUrl(food.image_url));
  const [isLiking, setIsLiking] = useState(false);

  // Sincronizar imgSrc si food.image_url cambia externamente por edición o realtime
  // Siempre pasar por safeImageUrl para bloquear esquemas peligrosos (javascript:, data:, etc.)
  React.useEffect(() => {
    setImgSrc(safeImageUrl(food.image_url));
  }, [food.image_url]);

  const hasVoted = userVotes.has(food.id);
  const isFav = isFavorite(food.id);
  const canManage = canManageFood(food);
  const categoryColor = CATEGORY_COLORS[food.category] || CATEGORY_COLORS.General;

  // Privacidad estricta: nunca mostrar emails en las tarjetas
  const getCreatorDisplayName = (): string => {
    // 1. Si la receta pertenece al usuario actual (evaluado estrictamente por UID o email)
    const isMine =
      (user && food.user_id && food.user_id === user.id) ||
      (user && food.user_email && food.user_email.toLowerCase() === user.email?.toLowerCase()) ||
      (food.created_by && user && (food.created_by === user.id || (user.email && food.created_by.toLowerCase() === user.email.toLowerCase())));

    if (isMine) {
      return userName;
    }

    if (!food.created_by || food.created_by.toLowerCase() === 'anónimo') {
      return 'Receta Oficial';
    }

    // 2. Si created_by es un UUID (auth.uid), atribuir a Receta Oficial o Autor de la Comunidad
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(food.created_by);
    if (isUUID) {
      if (food.user_email && food.user_email.toLowerCase() === 'dianrie@hotmail.com') {
        return 'Chef Dianrie';
      }
      return 'Chef de la Comunidad';
    }

    let clean = food.created_by;
    if (clean.includes('@')) {
      clean = clean.split('@')[0];
    }

    if (clean.toLowerCase() === 'dianrie') {
      return 'Chef Dianrie';
    }

    return clean.charAt(0).toUpperCase() + clean.slice(1);
  };

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking) return;
    setIsLiking(true);
    await toggleVote(food.id);
    setTimeout(() => setIsLiking(false), 300);
  };

  return (
    <div
      onClick={() => onSelect?.(food)}
      className={`group relative flex flex-col bg-white rounded-2xl sm:rounded-3xl overflow-hidden border transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 cursor-pointer ${
        isHighlighted
          ? 'border-orange-500 shadow-2xl shadow-orange-500/20 ring-4 ring-orange-400/40 scale-[1.02]'
          : 'border-slate-100 shadow-md hover:border-orange-200'
      }`}
    >
      {/* Contenedor de la Imagen */}
      <div className="relative h-40 sm:h-50 w-full overflow-hidden bg-slate-100">
        <img
          src={imgSrc}
          alt={food.name}
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
          loading="lazy"
        />

        {/* Gradiente oscuro superior e inferior para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Badge Flotante Superior: Selección Ganadora / Destacada */}
        {isHighlighted && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white text-[10px] sm:text-[11px] font-black px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full flex items-center space-x-1.5 shadow-xl shadow-orange-500/40 border border-white/60 animate-bounce-subtle whitespace-nowrap">
              <Sparkles className="w-3 h-3 text-amber-200 fill-amber-200" />
              <span className="tracking-wide uppercase text-[9px] sm:text-[10px]">¡Plato Seleccionado!</span>
            </div>
          </div>
        )}

        {/* Badge de Categoría y Autoría */}
        <div className={`absolute left-2.5 z-10 flex items-center space-x-1 transition-all ${
          isHighlighted ? 'top-8 sm:top-10' : 'top-2.5'
        }`}>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold backdrop-blur-md shadow-sm border ${categoryColor}`}
          >
            {food.category || 'General'}
          </span>
          {canManage && (
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold backdrop-blur-md shadow-sm text-white ${
                isSuperUser ? 'bg-purple-600/90' : 'bg-slate-900/80'
              }`}
            >
              {isSuperUser ? '👑 Admin' : 'Tu receta'}
            </span>
          )}
        </div>

        {/* Botones de Favorito y Votar (Like) */}
        <div className={`absolute right-2.5 z-10 flex items-center space-x-1 transition-all ${
          isHighlighted ? 'top-8 sm:top-10' : 'top-2.5'
        }`}>
          {/* Botón Favorito */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(food.id);
            }}
            className={`p-1.5 rounded-full backdrop-blur-md transition-all shadow-md active:scale-90 ${
              isFav
                ? 'bg-amber-400 text-amber-950 shadow-amber-400/40 ring-2 ring-amber-300'
                : 'bg-white/80 hover:bg-white text-slate-500 hover:text-amber-500'
            }`}
            title={isFav ? 'Quitar de favoritos' : 'Marcar como favorito'}
          >
            <Star
              className={`w-3.5 h-3.5 transition-transform ${
                isFav ? 'fill-amber-400 text-amber-950 scale-110' : ''
              }`}
            />
          </button>

          {/* Botón Votar */}
          <button
            onClick={handleVote}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-full backdrop-blur-md transition-all shadow-md active:scale-90 ${
              hasVoted
                ? 'bg-rose-500 text-white font-bold shadow-rose-500/30'
                : 'bg-white/80 hover:bg-white text-slate-700 hover:text-rose-500'
            } ${isLiking ? 'scale-125' : ''}`}
            title={hasVoted ? 'Quitar tu voto' : 'Votar este plato'}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-transform ${
                hasVoted ? 'fill-current scale-110' : ''
              }`}
            />
            <span className="text-[11px] font-bold">{food.votes_count}</span>
          </button>
        </div>
      </div>

      {/* Contenido de la Tarjeta */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-orange-600 transition-colors line-clamp-1">
            {food.name}
          </h3>
          {food.description && (
            <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">
              {food.description}
            </p>
          )}
        </div>

        {/* Footer de la Tarjeta */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center space-x-1 text-slate-500 font-medium truncate max-w-[150px] sm:max-w-[200px]">
            <ChefHat className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
            <span className="truncate">{getCreatorDisplayName()}</span>
          </span>

          {/* Acciones de gestión protegidas: solo propietario o superusuario */}
          {canManage && (
            <div className="flex items-center space-x-1">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(food);
                  }}
                  className="text-slate-400 hover:text-orange-600 hover:bg-orange-50 p-1 rounded-lg transition-colors"
                  title="Modificar receta"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              )}

              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`¿Eliminar "${food.name}" de las opciones?`)) {
                      onDelete(food.id);
                    }
                  }}
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-lg transition-colors"
                  title="Eliminar plato"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
