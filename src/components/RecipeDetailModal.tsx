import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Heart,
  Star,
  ChefHat,
  Pencil,
  Utensils,
  Award,
  Tag,
  Dices,
  Share2,
  Check,
  BookOpen,
  ExternalLink,
  ShoppingBag,
  Globe,
  Send,
  Clock,
  Loader2,
  Lock,
} from 'lucide-react';
import { Food, getFoodCategories, getFoodCreatorDisplayName } from '../types';
import { useUser } from '../context/UserContext';
import { shareFood } from '../lib/share';
import { showToast } from '../lib/toast';
import { supabase } from '../lib/supabase';
import { triggerPushNotification, ensureUserPushSubscribed } from '../lib/pushNotifications';

interface RecipeDetailModalProps {
  isOpen: boolean;
  food: Food | null;
  onClose: () => void;
  onEdit?: (food: Food) => void;
  onSpinAgain?: () => void;
  onQuickPick?: () => void;
  onOptimisticVote?: (foodId: string, delta: number) => void;
  onToggleGlobal?: (food: Food) => void;
  onRequestGlobal?: (food: Food) => Promise<void> | void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'De la Mamá': 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
  Cenas: 'bg-violet-100 text-violet-800 border-violet-200',
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
  Postres: 'bg-pink-100 text-pink-800 border-pink-200',
  Desayuno: 'bg-amber-100 text-amber-800 border-amber-200',
  General: 'bg-slate-100 text-slate-800 border-slate-200',
};

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80';

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  isOpen,
  food,
  onClose,
  onEdit,
  onSpinAgain,
  onQuickPick,
  onOptimisticVote,
  onToggleGlobal,
  onRequestGlobal,
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
  const [isSharing, setIsSharing] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [isRequestingGlobal, setIsRequestingGlobal] = useState(false);
  const [localApprovalStatus, setLocalApprovalStatus] = useState<string | undefined>(undefined);

  const contentRef = useRef<HTMLDivElement>(null);
  const handleQuickPick = onQuickPick || onSpinAgain;

  // Sincronizar estado local de aprobación y restaurar scroll arriba cuando cambia el plato
  useEffect(() => {
    if (food) {
      setLocalApprovalStatus(food.approval_status);
    }
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [food?.id, food?.approval_status, isOpen]);

  if (!isOpen || !food) return null;

  const hasVoted = userVotes.has(food.id);
  const isFav = favorites.has(food.id);
  const canManage = canManageFood(food);
  const foodCategories = getFoodCategories(food);
  const creatorDisplayName = getFoodCreatorDisplayName(food, user, userName);

  // Comprobar si el usuario actual es el propietario/creador del plato
  const isFoodOwner = Boolean(
    user &&
      ((food.user_id && food.user_id === user.id) ||
        (food.user_email &&
          user.email &&
          food.user_email.toLowerCase() === user.email.toLowerCase()) ||
        (food.created_by &&
          (food.created_by === user.id ||
            (user.email && food.created_by.toLowerCase() === user.email.toLowerCase()))))
  );

  const currentApprovalStatus = localApprovalStatus ?? food.approval_status;
  const isPending = currentApprovalStatus === 'pending';

  const handleRequestGlobal = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isRequestingGlobal || !food || isPending) return;

    setIsRequestingGlobal(true);
    try {
      // 1. Solicitar permisos de notificación push al usuario de forma fluida si aún no están activos
      if (user) {
        await ensureUserPushSubscribed(user.id, user.email || '');
      }

      if (onRequestGlobal) {
        await onRequestGlobal(food);
      } else {
        const { error } = await supabase
          .from('foods')
          .update({ approval_status: 'pending' })
          .eq('id', food.id);
        if (error) throw error;

        triggerPushNotification({
          foodId: food.id,
          foodName: food.name,
          userEmail: food.user_email,
          creatorName: food.user_email,
        });
      }

      setLocalApprovalStatus('pending');
      showToast('¡Solicitud enviada a los administradores para el General! ⏳ Te notificaremos cuando sea aprobado.', 'info');
    } catch (err: unknown) {
      console.error('Error al solicitar inclusión en el General:', err);
      showToast('Error al enviar la solicitud. Inténtalo de nuevo.', 'error');
    } finally {
      setIsRequestingGlobal(false);
    }
  };

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking || !food) return;
    setIsLiking(true);
    await toggleVote(food.id, (delta) => {
      onOptimisticVote?.(food.id, delta);
    });
    setTimeout(() => setIsLiking(false), 300);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSharing || !food) return;
    setIsSharing(true);
    try {
      const result = await shareFood(food, creatorDisplayName);
      if (result.success) {
        setIsShared(true);
        if (result.message) {
          showToast(result.message);
        }
        setTimeout(() => setIsShared(false), 2400);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleOpenExternalRecipe = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!food) return;
    const query = encodeURIComponent(`receta de ${food.name}`);
    window.open(`https://www.google.com/search?q=${query}`, '_blank', 'noopener,noreferrer');
  };

  const handleOpenUberEats = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!food) return;
    const query = encodeURIComponent(food.name);
    window.open(`https://www.ubereats.com/search?q=${query}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/65 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-scale-up">
        {/* Foto de alta resolución y encabezado visual */}
        <div className="relative h-44 sm:h-72 w-full overflow-hidden bg-slate-100 flex-shrink-0">
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

          {/* Botón compartir flotante en la cabecera */}
          <button
            onClick={handleShare}
            disabled={isSharing}
            className={`absolute top-3 right-11 sm:top-4 sm:right-14 z-20 p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-all shadow-md active:scale-90 ${
              isShared
                ? 'bg-emerald-500 text-white ring-2 ring-emerald-300'
                : 'bg-black/40 hover:bg-black/60 text-white'
            }`}
            title="Compartir plato"
          >
            {isShared ? (
              <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.5]" />
            ) : (
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>

          {/* Botón cerrar flotante */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-1.5 sm:p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all shadow-md active:scale-90"
            title="Cerrar detalle"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Badges superiores */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex flex-wrap items-center gap-1.5 sm:gap-2 max-w-[80%]">
            {foodCategories.map((cat) => {
              const catColor = CATEGORY_COLORS[cat] || CATEGORY_COLORS.General;
              return (
                <span
                  key={cat}
                  className={`inline-flex items-center px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold backdrop-blur-md shadow-md border ${catColor}`}
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {cat}
                </span>
              );
            })}

            {canManage && (
              <span
                className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 rounded-full text-[10px] sm:text-xs font-bold backdrop-blur-md shadow-md text-white ${
                  isSuperUser ? 'bg-purple-600/90' : 'bg-slate-900/80'
                }`}
              >
                {isSuperUser ? '🛡️ Admin' : 'Tu receta'}
              </span>
            )}

            {!isSuperUser && isFoodOwner && food.is_global && (
              <span
                className="inline-flex items-center space-x-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold backdrop-blur-md shadow-md bg-emerald-600/90 text-white border border-emerald-400/40"
                title="Plato aprobado y publicado en la carta general para toda la comunidad"
              >
                <Globe className="w-3 h-3" />
                <span>Público en carta</span>
              </span>
            )}

            {!isSuperUser && isFoodOwner && !food.is_global && (
              isPending ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold backdrop-blur-md shadow-md bg-amber-500/95 text-white border border-amber-300/40">
                  <Clock className="w-3 h-3" />
                  <span>⏳ Solicitud en revisión</span>
                </span>
              ) : (
                <div className="inline-flex items-center gap-1.5">
                  <span
                    className="inline-flex items-center space-x-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold backdrop-blur-md shadow-md bg-slate-700/85 text-white border border-slate-500/40"
                    title="Plato privado (solo visible para ti)"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Privado</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleRequestGlobal}
                    disabled={isRequestingGlobal}
                    className="inline-flex items-center space-x-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold backdrop-blur-md shadow-md bg-orange-600/95 hover:bg-orange-700 text-white border border-orange-400/40 active:scale-95 transition-transform cursor-pointer"
                    title="Solicitar inclusión en el General"
                  >
                    {isRequestingGlobal ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Send className="w-3 h-3" />
                    )}
                    <span>Solicitar inclusión</span>
                  </button>
                </div>
              )
            )}

            {isSuperUser && (
              <button
                type="button"
                onClick={() => onToggleGlobal?.(food)}
                className={`inline-flex items-center space-x-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold backdrop-blur-md shadow-md transition-transform active:scale-95 cursor-pointer ${
                  food.is_global
                    ? 'bg-emerald-600/90 hover:bg-emerald-700 text-white border border-emerald-400/40'
                    : 'bg-amber-600/90 hover:bg-amber-700 text-white border border-amber-400/40'
                }`}
                title={
                  food.is_global
                    ? 'Plato público en pantalla principal (clic para ocultar)'
                    : 'Plato privado (clic para hacer público a todos)'
                }
              >
                <Globe className="w-3 h-3" />
                <span>{food.is_global ? 'Público en carta' : 'Privado'}</span>
              </button>
            )}
          </div>

          {/* Nombre y datos sobre la imagen en la base */}
          <div className="absolute bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-4 z-20 text-white space-y-0.5 sm:space-y-1">
            <h2 className="text-xl sm:text-3xl font-black tracking-tight drop-shadow-md leading-tight">
              {food.name}
            </h2>
            <div className="flex items-center space-x-2 text-[11px] sm:text-sm text-slate-200">
              <span
                className="flex items-center space-x-1 font-medium bg-black/40 px-2 sm:px-2.5 py-0.5 rounded-full backdrop-blur-sm"
                title={food.user_email ? `Creado por ${creatorDisplayName} (${food.user_email})` : `Creado por ${creatorDisplayName}`}
              >
                <ChefHat className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-400" />
                <span>Creado por {creatorDisplayName}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Contenido del Modal */}
        <div ref={contentRef} className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-3.5 sm:space-y-5">
          {/* Barra de interacción rápida (Popularidad, Compartir, Favorito, Votar) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-3.5 bg-orange-50/70 border border-orange-200/60 rounded-2xl">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center flex-shrink-0">
                <Award className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-[11px] sm:text-xs font-bold text-slate-700">Popularidad</p>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  {food.votes_count === 1 ? '1 voto registrado' : `${food.votes_count} votos en total`}
                </p>
              </div>
            </div>

            {/* Contenedor responsivo: cuadrícula de 3 botones en móvil y fila flex en escritorio */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full sm:w-auto sm:flex sm:items-center">
              {/* Botón Compartir */}
              <button
                type="button"
                onClick={handleShare}
                disabled={isSharing}
                className={`flex items-center justify-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-2 sm:py-1.5 rounded-xl transition-all shadow-xs active:scale-95 text-xs font-bold ${
                  isShared
                    ? 'bg-emerald-500 text-white ring-2 ring-emerald-300'
                    : 'bg-white text-slate-700 hover:text-orange-600 hover:bg-orange-50 border border-slate-200'
                }`}
                title="Compartir receta por WhatsApp o copiar enlace"
              >
                {isShared ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5] flex-shrink-0" />
                    <span className="truncate">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">Compartir</span>
                  </>
                )}
              </button>

              {/* Botón Favorito */}
              <button
                type="button"
                onClick={() => toggleFavorite(food.id)}
                className={`flex items-center justify-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-2 sm:py-1.5 rounded-xl transition-all shadow-xs active:scale-95 text-xs font-bold ${
                  isFav
                    ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300'
                    : 'bg-white text-slate-600 hover:text-amber-600 hover:bg-amber-50 border border-slate-200'
                }`}
                title={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
              >
                <Star className={`w-3.5 h-3.5 flex-shrink-0 ${isFav ? 'fill-amber-950' : ''}`} />
                <span className="truncate">Favorito</span>
              </button>

              {/* Botón Me Gusta */}
              <button
                type="button"
                onClick={handleVote}
                className={`flex items-center justify-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-2 sm:py-1.5 rounded-xl transition-all shadow-xs active:scale-95 text-xs font-bold ${
                  hasVoted
                    ? 'bg-rose-500 text-white shadow-rose-500/25 ring-2 ring-rose-400'
                    : 'bg-white text-slate-700 hover:text-rose-500 hover:bg-rose-50 border border-slate-200'
                } ${isLiking ? 'scale-105' : ''}`}
                title={hasVoted ? 'Quitar tu voto' : 'Votar este plato'}
              >
                <Heart className={`w-3.5 h-3.5 flex-shrink-0 ${hasVoted ? 'fill-current' : ''}`} />
                <span className="truncate">{hasVoted ? '¡Votado!' : 'Votar'}</span>
              </button>
            </div>
          </div>

          {/* Sección de Descripción completa de la receta */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2 text-slate-800">
                <Utensils className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700">
                  Sobre este plato
                </h3>
              </div>

              <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                {/* Botón Paso a paso */}
                <button
                  type="button"
                  onClick={handleOpenExternalRecipe}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 transition-all active:scale-95 cursor-pointer shadow-2xs"
                  title={`Buscar receta de ${food.name} en Google`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  <span>Paso a paso</span>
                  <ExternalLink className="w-3 h-3 text-amber-600/80" />
                </button>

                {/* Botón Pedir en Uber Eats */}
                <button
                  type="button"
                  onClick={handleOpenUberEats}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-all active:scale-95 cursor-pointer shadow-2xs"
                  title={`Buscar "${food.name}" en Uber Eats`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pedir en Uber Eats</span>
                  <ExternalLink className="w-3 h-3 text-emerald-600/80" />
                </button>
              </div>
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
                {foodCategories.length > 1 ? 'Categorías' : 'Categoría'}
              </span>
              <p className="text-xs sm:text-sm font-extrabold text-slate-800">
                {foodCategories.join(', ')}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Creador
              </span>
              <p className="text-xs sm:text-sm font-extrabold text-slate-800 truncate">
                {creatorDisplayName}
              </p>
              {food.user_email && (
                <p className="text-[11px] text-slate-500 font-medium truncate">
                  {food.user_email}
                </p>
              )}
            </div>
          </div>

          {/* Bloque destacado para el creador: Solicitud de inclusión en el General */}
          {!isSuperUser && isFoodOwner && !food.is_global && (
            <div
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                isPending
                  ? 'bg-amber-50/80 border-amber-200/90'
                  : 'bg-gradient-to-r from-orange-50/90 via-amber-50/60 to-orange-50/90 border-orange-200/80 shadow-2xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center space-x-3 min-w-0">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isPending
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    }`}
                  >
                    {isPending ? (
                      <Clock className="w-5 h-5 animate-pulse" />
                    ) : (
                      <Globe className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-extrabold text-slate-800">
                      {isPending
                        ? 'Solicitud pendiente de aprobación'
                        : '¿Quieres compartir este plato en el General?'}
                    </p>
                    <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-relaxed mt-0.5">
                      {isPending
                        ? 'Tu plato está actualmente en revisión por los administradores para ser publicado en la carta pública.'
                        : 'Envía tu receta a moderación para que los administradores la incluyan en la pantalla principal para toda la comunidad.'}
                    </p>
                  </div>
                </div>

                <div className="flex-shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleRequestGlobal}
                    disabled={isPending || isRequestingGlobal}
                    className={`w-full sm:w-auto flex items-center justify-center space-x-2 px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs ${
                      isPending
                        ? 'bg-amber-100/90 text-amber-800 border border-amber-300/70 cursor-default opacity-90'
                        : 'bg-orange-500 hover:bg-orange-600 active:scale-95 text-white shadow-md shadow-orange-500/25 cursor-pointer'
                    }`}
                    title={
                      isPending
                        ? 'La solicitud ya ha sido enviada y está a la espera de revisión'
                        : 'Enviar solicitud de moderación a los administradores'
                    }
                  >
                    {isRequestingGlobal ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                        <span>Enviando solicitud...</span>
                      </>
                    ) : isPending ? (
                      <>
                        <Clock className="w-4 h-4 text-amber-700 flex-shrink-0" />
                        <span>Solicitud pendiente de aprobación</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 flex-shrink-0" />
                        <span>Solicitar inclusión en el General</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bloque de confirmación para el creador: Plato publicado en el General */}
          {!isSuperUser && isFoodOwner && food.is_global && (
            <div className="p-3.5 sm:p-4 rounded-2xl border bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-emerald-50/90 border-emerald-200/80 shadow-2xs">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start sm:items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-extrabold text-slate-800">
                      ¡Tu plato está publicado en la carta general! 🌐🎉
                    </p>
                    <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-relaxed mt-0.5">
                      Esta receta ya está aprobada y es visible para toda la comunidad en la pantalla principal. Cualquier comensal puede verla, votarla y seleccionarla en la ruleta.
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 hidden sm:block">
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300/60">
                    <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
                    <span>Público</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pie de acciones */}
        <div className="p-3.5 sm:p-4 sm:px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center space-x-2 flex-wrap gap-1.5">
            {canManage && onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(food);
                }}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-orange-600 hover:bg-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Modificar</span>
              </button>
            )}

            {handleQuickPick && (
              <button
                type="button"
                onClick={handleQuickPick}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-orange-300 bg-orange-50/70 hover:bg-orange-100 text-orange-700 font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
                title="Elegir otro plato al azar con elección rápida"
              >
                <Dices className="w-4 h-4 text-orange-600" />
                <span>Elección rápida</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all active:scale-95 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
