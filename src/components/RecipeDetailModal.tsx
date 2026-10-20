import React, { useState } from 'react';
import {
  X,
  Heart,
  Star,
  ChefHat,
  Pencil,
  Sparkles,
  Utensils,
  Award,
  Tag,
} from 'lucide-react';
import { Food } from '../types';
import { useUser } from '../context/UserContext';

interface RecipeDetailModalProps {
  isOpen: boolean;
  food: Food | null;
  onClose: () => void;
  onEdit?: (food: Food) => void;
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

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80';

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  isOpen,
  food,
  onClose,
  onEdit,
}) => {
  const {
    user,
    userName,
    userVotes,
    toggleVote,
    favorites,
    toggleFavorite,
    canManageFood,
    isSuperUser,
  } = useUser();

  const [isLiking, setIsLiking] = useState(false);

  if (!isOpen || !food) return null;

  const hasVoted = userVotes.has(food.id);
  const isFav = favorites.has(food.id);
  const canManage = canManageFood(food);
  const categoryColor = CATEGORY_COLORS[food.category] || CATEGORY_COLORS.General;

  // Lógica de privacidad estricta: nunca mostrar emails
  const getCreatorDisplayName = (): string => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-scale-up">
        {/* Foto de alta resolución y encabezado visual */}
        <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-slate-100 flex-shrink-0">
          <img
            src={food.image_url || FALLBACK_IMAGE}
            alt={food.name}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
          />

          {/* Gradiente para contraste */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 pointer-events-none" />

          {/* Botón cerrar flotante */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all shadow-md active:scale-90"
            title="Cerrar detalle"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges superiores */}
          <div className="absolute top-4 left-4 z-20 flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-md border ${categoryColor}`}
            >
              <Tag className="w-3 h-3 mr-1" />
              {food.category || 'General'}
            </span>

            {canManage && (
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-md text-white ${
                  isSuperUser ? 'bg-purple-600/90' : 'bg-slate-900/80'
                }`}
              >
                {isSuperUser ? '🛡️ Admin' : 'Tu receta'}
              </span>
            )}
          </div>

          {/* Nombre y datos sobre la imagen en la base */}
          <div className="absolute bottom-4 inset-x-4 z-20 text-white space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-md leading-tight">
              {food.name}
            </h2>
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-200">
              <span className="flex items-center space-x-1 font-medium bg-black/40 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                <ChefHat className="w-3.5 h-3.5 text-orange-400" />
                <span>Creado por {getCreatorDisplayName()}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Contenido del Modal */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Barra de interacción rápida (Votos, Favorito, Votar) */}
          <div className="flex items-center justify-between p-3.5 bg-orange-50/70 border border-orange-200/60 rounded-2xl">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                <Award className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">Popularidad</p>
                <p className="text-xs text-slate-500">
                  {food.votes_count === 1 ? '1 voto registrado' : `${food.votes_count} votos en total`}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Botón Favorito */}
              <button
                onClick={() => toggleFavorite(food.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all shadow-xs active:scale-95 text-xs font-bold ${
                  isFav
                    ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300'
                    : 'bg-white text-slate-600 hover:text-amber-600 hover:bg-amber-50 border border-slate-200'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-950' : ''}`} />
                <span>{isFav ? 'Favorito' : 'Guardar'}</span>
              </button>

              {/* Botón Me Gusta */}
              <button
                onClick={handleVote}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl transition-all shadow-xs active:scale-95 text-xs font-bold ${
                  hasVoted
                    ? 'bg-rose-500 text-white shadow-rose-500/25 ring-2 ring-rose-400'
                    : 'bg-white text-slate-700 hover:text-rose-500 hover:bg-rose-50 border border-slate-200'
                } ${isLiking ? 'scale-105' : ''}`}
              >
                <Heart className={`w-3.5 h-3.5 ${hasVoted ? 'fill-current' : ''}`} />
                <span>{hasVoted ? '¡Votado!' : 'Votar'}</span>
              </button>
            </div>
          </div>

          {/* Sección de Descripción completa de la receta */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-slate-800">
              <Utensils className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700">
                Sobre este plato
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                {food.description ||
                  'Deliciosa receta casera tradicional preparada con ingredientes frescos, seleccionada especialmente para disfrutar en familia o amigos.'}
              </p>
            </div>
          </div>

          {/* Ficha técnica rápida */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Categoría
              </span>
              <p className="text-xs sm:text-sm font-extrabold text-slate-800">
                {food.category || 'General'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Creador
              </span>
              <p className="text-xs sm:text-sm font-extrabold text-slate-800 truncate">
                {getCreatorDisplayName()}
              </p>
            </div>
          </div>
        </div>

        {/* Pie de acciones */}
        <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 flex-shrink-0">
          {canManage && onEdit ? (
            <button
              onClick={() => {
                onClose();
                onEdit(food);
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-orange-600 hover:bg-white text-xs font-bold transition-all shadow-xs"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Modificar Plato</span>
            </button>
          ) : (
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>¿Qué comemos hoy?</span>
            </div>
          )}

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all active:scale-95"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
