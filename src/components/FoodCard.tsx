import React, { useState } from 'react';
import { Heart, Sparkles, Trash2, Star } from 'lucide-react';
import { Food } from '../types';
import { useUser } from '../context/UserContext';

interface FoodCardProps {
  food: Food;
  onDelete?: (id: string) => void;
  isHighlighted?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  Arroces: 'bg-amber-100 text-amber-800 border-amber-200',
  Tradicional: 'bg-orange-100 text-orange-800 border-orange-200',
  Italiana: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Americana: 'bg-red-100 text-red-800 border-red-200',
  Mexicana: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Japonesa: 'bg-rose-100 text-rose-800 border-rose-200',
  Saludable: 'bg-teal-100 text-teal-800 border-teal-200',
  General: 'bg-slate-100 text-slate-800 border-slate-200',
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80';

export const FoodCard: React.FC<FoodCardProps> = ({ food, onDelete, isHighlighted = false }) => {
  const { userVotes, toggleVote, isAuthenticated, isFavorite, toggleFavorite } = useUser();
  const [imgSrc, setImgSrc] = useState(food.image_url || FALLBACK_IMAGE);
  const [isLiking, setIsLiking] = useState(false);

  const hasVoted = userVotes.has(food.id);
  const isFav = isFavorite(food.id);
  const categoryColor = CATEGORY_COLORS[food.category] || CATEGORY_COLORS.General;

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking) return;
    setIsLiking(true);
    await toggleVote(food.id);
    setTimeout(() => setIsLiking(false), 300);
  };

  return (
    <div
      className={`group relative flex flex-col bg-white rounded-3xl overflow-hidden border transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 ${
        isHighlighted
          ? 'border-orange-500 shadow-2xl shadow-orange-500/20 ring-4 ring-orange-400/40 scale-[1.02]'
          : 'border-slate-100 shadow-md'
      }`}
    >
      {/* Contenedor de la Imagen */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
        <img
          src={imgSrc}
          alt={food.name}
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
          loading="lazy"
        />

        {/* Gradiente oscuro superior e inferior para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Badge de Categoría */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm border ${categoryColor}`}
          >
            {food.category || 'General'}
          </span>
        </div>

        {/* Botones de Favorito y Votar (Like) */}
        <div className="absolute top-3 right-3 z-10 flex items-center space-x-1.5">
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
              className={`w-4 h-4 transition-transform ${
                isFav ? 'fill-amber-400 text-amber-950 scale-110' : ''
              }`}
            />
          </button>

          {/* Botón Votar */}
          <button
            onClick={handleVote}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full backdrop-blur-md transition-all shadow-md active:scale-90 ${
              hasVoted
                ? 'bg-rose-500 text-white font-bold shadow-rose-500/30'
                : 'bg-white/80 hover:bg-white text-slate-700 hover:text-rose-500'
            } ${isLiking ? 'scale-125' : ''}`}
            title={hasVoted ? 'Quitar tu voto' : 'Votar este plato'}
          >
            <Heart
              className={`w-4 h-4 transition-transform ${
                hasVoted ? 'fill-current scale-110' : ''
              }`}
            />
            <span className="text-xs">{food.votes_count}</span>
          </button>
        </div>

        {/* Título sobre imagen en pantallas pequeñas / decorativo */}
        {isHighlighted && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center space-x-1 shadow-lg animate-bounce-subtle">
            <Sparkles className="w-3 h-3" />
            <span>¡Plato Seleccionado!</span>
          </div>
        )}
      </div>

      {/* Contenido de la Tarjeta */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 group-hover:text-orange-600 transition-colors line-clamp-1">
            {food.name}
          </h3>
          {food.description && (
            <p className="mt-1 text-xs sm:text-sm text-slate-500 line-clamp-2">
              {food.description}
            </p>
          )}
        </div>

        {/* Footer de la Tarjeta */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>{food.created_by ? `Por ${food.created_by}` : 'Comunidad'}</span>
          </span>

          {isAuthenticated && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`¿Eliminar "${food.name}" de las opciones?`)) {
                  onDelete(food.id);
                }
              }}
              className="text-slate-300 hover:text-red-500 p-1 rounded-lg transition-colors"
              title="Eliminar plato (solo usuarios autenticados)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
