import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Dices,
  Flame,
  Search,
  RefreshCw,
  Trophy,
  Lock,
  Star,
  ChefHat,
  LayoutGrid,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from './lib/supabase';
import { Food, MainTabFilter } from './types';
import { Navbar } from './components/Navbar';
import { FoodCard } from './components/FoodCard';
import { RouletteModal } from './components/RouletteModal';
import { AddFoodModal } from './components/AddFoodModal';
import { EditFoodModal } from './components/EditFoodModal';
import { AuthModal } from './components/AuthModal';
import { AdminUsersModal } from './components/AdminUsersModal';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { ArcadeModal } from './components/ArcadeModal';
import { ManageCategoriesModal } from './components/ManageCategoriesModal';
import { Toast } from './components/Toast';
import { UserProvider, useUser } from './context/UserContext';
import { CategoryProvider, useCategories } from './context/CategoryContext';
import { playConfettiPop } from './lib/sound';

function MainApp() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { categories } = useCategories();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => [...categories]);
  const [hasInitializedCategories, setHasInitializedCategories] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'votes' | 'recent' | 'name'>('votes');
  const [mainTab, setMainTab] = useState<MainTabFilter>('all');

  // Inicializar con todas las categorías activas en cuanto categories esté disponible
  useEffect(() => {
    if (categories.length > 0 && !hasInitializedCategories) {
      setSelectedCategories([...categories]);
      setHasInitializedCategories(true);
    }
  }, [categories, hasInitializedCategories]);

  // Sincronizar si se añade o elimina una categoría en la base de datos
  useEffect(() => {
    if (hasInitializedCategories) {
      setSelectedCategories((prev) => {
        const prevAllSelected = categories.length > 0 && categories.every((c) => prev.includes(c));
        if (prevAllSelected) {
          return [...categories];
        }
        return prev.filter((c) => categories.includes(c));
      });
    }
  }, [categories, hasInitializedCategories]);

  // Comprobar si todas las categorías están actualmente activas
  const isAllSelected =
    categories.length > 0 && categories.every((cat) => selectedCategories.includes(cat));

  // Manejador del botón "Todas": selecciona todas o resetea todas
  const handleToggleAll = () => {
    if (isAllSelected) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories([...categories]);
    }
  };

  // Manejador para conmutar un filtro individual
  const handleToggleCategory = (cat: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(cat)) {
        return prev.filter((c) => c !== cat);
      } else {
        return [...prev, cat];
      }
    });
  };

  // Autenticación, Roles y Favoritos
  const {
    user,
    isAuthenticated,
    isSuperUser,
    superadminEmails,
    favorites,
    isAuthModalOpen,
    closeAuthModal,
    openAuthModal,
    authModalReason,
    isAdminModalOpen,
    closeAdminModal,
  } = useUser();

  // Modales
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);
  const [rouletteAutoSpin, setRouletteAutoSpin] = useState(false);
  const [isArcadeOpen, setIsArcadeOpen] = useState(false);
  const [isArcadePulsing, setIsArcadePulsing] = useState(true);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Food | null>(null);
  const [highlightedFoodId, setHighlightedFoodId] = useState<string | null>(null);

  // Apertura protegida del modal de añadir plato
  const handleOpenAddFood = () => {
    if (isAuthenticated) {
      setIsAddModalOpen(true);
    } else {
      openAuthModal('Inicia sesión con tu correo electrónico para añadir platos a la carta.');
    }
  };

  // Cambio de pestaña con protección si no está autenticado
  const handleTabChange = (tab: MainTabFilter) => {
    if (tab === 'my-foods' && !isAuthenticated) {
      openAuthModal('Inicia sesión con tu correo para ver y gestionar los platos que has creado.');
      return;
    }
    if (tab === 'favorites' && !isAuthenticated) {
      openAuthModal('Inicia sesión con tu correo para guardar y consultar tus platos favoritos.');
      return;
    }
    setMainTab(tab);
  };

  // Cargar lista de comidas desde Supabase
  const fetchFoods = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .order('votes_count', { ascending: false });

      if (error) throw error;
      if (data) setFoods(data as Food[]);
    } catch (err) {
      console.error('Error al cargar comidas de Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();

    // Deep-linking: Si la URL contiene ?food=<id>, abrir y destacar automáticamente la receta compartida
    try {
      const params = new URLSearchParams(window.location.search);
      const sharedFoodId = params.get('food');
      if (sharedFoodId) {
        setHighlightedFoodId(sharedFoodId);
      }
    } catch {
      // Ignorar
    }

    // Suscripción Realtime a cambios en las tablas 'foods' y 'votes'
    const channel = supabase
      .channel('public:community_feed_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'foods' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const inserted = payload.new as Food;
            setFoods((prev) => {
              if (prev.some((f) => f.id === inserted.id)) return prev;
              return [inserted, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Food;
            if (updated && updated.id) {
              setFoods((prevFoods) =>
                prevFoods.map((f) => (f.id === updated.id ? { ...f, ...updated } : f))
              );
              // Si el plato actualizado es el que está abierto en el modal de detalle, actualizar su estado de inmediato
              setSelectedRecipe((prevRecipe) =>
                prevRecipe && prevRecipe.id === updated.id ? { ...prevRecipe, ...updated } : prevRecipe
              );
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id: string })?.id;
            if (deletedId) {
              setFoods((prev) => prev.filter((f) => f.id !== deletedId));
              setSelectedRecipe((prev) => (prev && prev.id === deletedId ? null : prev));
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newVote = payload.new as { food_id: string };
            if (newVote?.food_id) {
              setFoods((prevFoods) =>
                prevFoods.map((f) =>
                  f.id === newVote.food_id
                    ? { ...f, votes_count: (f.votes_count || 0) + 1 }
                    : f
                )
              );
              setSelectedRecipe((prev) =>
                prev && prev.id === newVote.food_id
                  ? { ...prev, votes_count: (prev.votes_count || 0) + 1 }
                  : prev
              );
            }
          } else if (payload.eventType === 'DELETE') {
            const oldVote = payload.old as { food_id?: string };
            if (oldVote?.food_id) {
              setFoods((prevFoods) =>
                prevFoods.map((f) =>
                  f.id === oldVote.food_id
                    ? { ...f, votes_count: Math.max(0, (f.votes_count || 0) - 1) }
                    : f
                )
              );
              setSelectedRecipe((prev) =>
                prev && prev.id === oldVote.food_id
                  ? { ...prev, votes_count: Math.max(0, (prev.votes_count || 0) - 1) }
                  : prev
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Eliminar comida (Protegido por Supabase Auth)
  const handleDeleteFood = async (id: string) => {
    if (!isAuthenticated) {
      openAuthModal('Debes iniciar sesión con tu correo para eliminar platos de la carta.');
      return;
    }

    try {
      const { error } = await supabase.from('foods').delete().eq('id', id);
      if (error) throw error;
      setFoods((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error('Error al eliminar comida:', err);
    }
  };

  // Añadir nueva comida a la lista
  const handleFoodAdded = (newFood: Food) => {
    setFoods((prev) => [newFood, ...prev]);
  };

  // Actualización reactiva optimista de votos en el estado local de comidas
  const handleOptimisticVote = useCallback((foodId: string, delta: number) => {
    setFoods((prevFoods) =>
      prevFoods.map((f) =>
        f.id === foodId
          ? { ...f, votes_count: Math.max(0, (f.votes_count || 0) + delta) }
          : f
      )
    );
    setSelectedRecipe((prevRecipe) =>
      prevRecipe && prevRecipe.id === foodId
        ? { ...prevRecipe, votes_count: Math.max(0, (prevRecipe.votes_count || 0) + delta) }
        : prevRecipe
    );
  }, []);

  // Apertura automática de receta compartida por enlace directo (?food=<id>)
  useEffect(() => {
    if (foods.length === 0) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const sharedFoodId = params.get('food');
      if (sharedFoodId) {
        const found = foods.find((f) => f.id === sharedFoodId);
        if (found) {
          setSelectedRecipe(found);
          setHighlightedFoodId(found.id);
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    } catch {
      // Ignorar restricciones en entornos sin manipulación de historial
    }
  }, [foods]);

  // Actualizar comida tras edición (actualización local inmediata + refresco de referencias)
  const handleFoodUpdated = (updatedFood: Food) => {
    // 1. Actualización inmutable estricta en el array foods
    setFoods((prevFoods) =>
      prevFoods.map((f) => (f.id === updatedFood.id ? { ...f, ...updatedFood } : f))
    );

    // 2. Si el modal de detalle estaba abierto con este plato, actualizarlo inmediatamente con la nueva referencia
    setSelectedRecipe((prevRecipe) =>
      prevRecipe && prevRecipe.id === updatedFood.id ? { ...prevRecipe, ...updatedFood } : prevRecipe
    );

    // 3. Cerrar el modal de edición
    setEditingFood(null);
  };

  // Regla de Visibilidad y Moderación:
  // - Feed Principal: Solo recetas oficiales o creadas por superusuarios.
  // - Superusuarios: Pueden ver todo para moderar.
  // - Usuario autenticado: Ve las oficiales/superadmin + sus propias recetas creadas.
  const isFoodVisible = useCallback(
    (f: Food) => {
      // 1. Receta oficial o de superusuario
      const isSuperadminRecipe =
        !f.user_email ||
        f.created_by === 'Anónimo' ||
        superadminEmails.has(f.user_email.toLowerCase()) ||
        f.user_email.toLowerCase() === 'dianrie@hotmail.com';

      if (isSuperadminRecipe) return true;

      // 2. Si el usuario actual es superadmin, ve todas para moderar
      if (isSuperUser) return true;

      // 3. Si el usuario está autenticado, ve sus propias recetas creadas (estrictamente por ID o email)
      if (user) {
        if (f.user_id && f.user_id === user.id) return true;
        if (f.user_email && f.user_email.toLowerCase() === user.email?.toLowerCase()) return true;
        if (f.created_by && (f.created_by === user.id || (user.email && f.created_by.toLowerCase() === user.email.toLowerCase()))) {
          return true;
        }
      }

      // Ocultar recetas no oficiales de terceros a visitantes o usuarios no propietarios
      return false;
    },
    [user, isSuperUser, superadminEmails]
  );

  // Platos visibles según moderación y permisos
  const visibleFoods = useMemo(() => {
    return foods.filter(isFoodVisible);
  }, [foods, isFoodVisible]);

  // Conteo de platos por pestaña (evaluado estrictamente por auth.uid y email)
  const myFoodsCount = useMemo(() => {
    if (!user) return 0;
    return visibleFoods.filter(
      (f) =>
        (f.user_id && f.user_id === user.id) ||
        (f.user_email && f.user_email.toLowerCase() === user.email?.toLowerCase()) ||
        (f.created_by && (f.created_by === user.id || (user.email && f.created_by.toLowerCase() === user.email.toLowerCase())))
    ).length;
  }, [visibleFoods, user]);

  const favoritesCount = useMemo(() => {
    return visibleFoods.filter((f) => favorites.has(f.id)).length;
  }, [visibleFoods, favorites]);

  // Filtrado y ordenación
  const filteredFoods = useMemo(() => {
    return visibleFoods
      .filter((f) => {
        // 1. Filtro por pestaña principal
        if (mainTab === 'my-foods') {
          const isMine =
            (f.user_id && f.user_id === user?.id) ||
            (f.user_email && f.user_email.toLowerCase() === user?.email?.toLowerCase()) ||
            (f.created_by && (f.created_by === user?.id || (user?.email && f.created_by.toLowerCase() === user.email.toLowerCase())));
          if (!isMine) return false;
        } else if (mainTab === 'favorites') {
          if (!favorites.has(f.id)) return false;
        }

        // 2. Filtro por categoría (selección múltiple)
        const matchesCategory = isAllSelected
          ? true
          : selectedCategories.includes(f.category || 'General');

        // 3. Filtro por búsqueda
        const matchesSearch =
          f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'votes') return b.votes_count - a.votes_count;
        if (sortBy === 'recent') {
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        }
        return a.name.localeCompare(b.name);
      });
  }, [visibleFoods, mainTab, selectedCategories, isAllSelected, searchQuery, sortBy, user, favorites]);

  // Pool de platos para la ruleta (respeta filtros si hay elementos, o usa el total visible)
  const roulettePool = useMemo(() => {
    return filteredFoods.length > 0 ? filteredFoods : visibleFoods;
  }, [filteredFoods, visibleFoods]);

  // Elección rápida aleatoria directa (abre el Modal de Detalle de Receta)
  const handleQuickPick = () => {
    if (roulettePool.length === 0) return;
    const randomPick = roulettePool[Math.floor(Math.random() * roulettePool.length)];

    setHighlightedFoodId(randomPick.id);
    setSelectedRecipe(randomPick);
    playConfettiPop();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.5 },
    });
  };

  // Top 3 platos más votados
  const topVoted = useMemo(() => {
    return [...visibleFoods].sort((a, b) => b.votes_count - a.votes_count).slice(0, 3);
  }, [visibleFoods]);

  // Subtítulo contextual para la ruleta
  const rouletteSubtitle = useMemo(() => {
    if (mainTab === 'favorites') {
      return `Girando entre tus ${roulettePool.length} platos favoritos ⭐`;
    }
    if (mainTab === 'my-foods') {
      return `Girando entre tus ${roulettePool.length} platos creados 👨‍🍳`;
    }
    if (!isAllSelected && selectedCategories.length > 0) {
      if (selectedCategories.length === 1) {
        return `Girando entre ${roulettePool.length} platos de la categoría "${selectedCategories[0]}"`;
      }
      return `Girando entre ${roulettePool.length} platos de ${selectedCategories.length} categorías seleccionadas`;
    }
    return `${roulettePool.length} platos en la ruleta. ¡Deja que el destino decida!`;
  }, [mainTab, isAllSelected, selectedCategories, roulettePool]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Barra de Navegación */}
      <Navbar totalFoods={visibleFoods.length} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-3 sm:py-6 space-y-4 sm:space-y-6">
        {/* Banner Hero Central — compacto en móvil */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600 via-amber-600 to-rose-600 text-white p-4 sm:p-8 shadow-xl shadow-orange-600/20">
          {/* Botón Nave Espacial Retro (Minijuego Arkanoid) */}
          <button
            type="button"
            onClick={() => setIsArcadeOpen(true)}
            onAnimationEnd={() => setIsArcadePulsing(false)}
            title="Jugar al Arkanoid"
            aria-label="Jugar al Arkanoid"
            className={`absolute top-3 right-3 sm:top-4 sm:right-4 z-20 group flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/30 backdrop-blur-md border border-white/25 hover:border-white/40 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer text-white ${
              isArcadePulsing ? 'animate-pulse-subtle hover:animate-none' : ''
            }`}
          >
            <svg
              className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-200 group-hover:text-amber-100 group-hover:-translate-y-0.5 group-hover:scale-110 transition-transform duration-150 drop-shadow-xs"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M11 2h2v2h-2zM10 4h4v2h-4zM9 6h6v2H9zM8 8h8v2H8zM7 10h10v2H7zM6 12h12v2H6zM4 14h16v2H4zM2 16h20v2H2zM4 18h2v2H4zM18 18h2v2h-2zM10 18h4v2h-4zM11 20h2v2h-2z" />
            </svg>
            <span className="hidden sm:inline-block text-[11px] font-bold text-white/95 group-hover:text-white tracking-tight">
              Arkanoid
            </span>
          </button>

          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none text-8xl">
            🥘
          </div>
          <div className="absolute top-0 right-1/4 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-md mb-2 border border-white/20">
              <Flame className="w-3 h-3 text-amber-300" />
              <span>Decisión sin discusiones</span>
            </div>

            <h2 className="text-lg sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
              ¿No sabes qué comer hoy?
            </h2>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-orange-100 font-medium leading-relaxed hidden sm:block">
              Vota con tu grupo o familia tus comidas preferidas y deja que la ruleta interactiva decida el menú de hoy por ti.
            </p>

            {/* Botones de Acción Hero */}
            <div className="mt-3 sm:mt-5 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setRouletteAutoSpin(true);
                  setIsRouletteOpen(true);
                }}
                className="group relative px-4 py-2 sm:px-6 sm:py-3 rounded-xl bg-white text-orange-600 font-black text-sm shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
              >
                <span className="text-base sm:text-xl">🎯</span>
                <span>
                  {mainTab === 'favorites'
                    ? '¡Girar Favoritos!'
                    : mainTab === 'my-foods'
                    ? '¡Girar Mis Platos!'
                    : '¡Girar la Ruleta!'}
                </span>
                <span className="ml-1 text-[11px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold">
                  {roulettePool.length}
                </span>
              </button>

              <button
                onClick={handleQuickPick}
                className="px-3 py-2 sm:px-5 sm:py-3 rounded-xl bg-black/20 hover:bg-black/30 border border-white/30 text-white font-bold text-xs sm:text-sm backdrop-blur-md transition-all flex items-center space-x-2 active:scale-95"
              >
                <Dices className="w-4 h-4" />
                <span>Elección Rápida</span>
              </button>
            </div>
          </div>
        </section>

        {/* Podio Top 3 Platos Más Votados */}
        {topVoted.length > 0 && mainTab === 'all' && (
          <section className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                  Favoritos de la Comunidad
                </h3>
              </div>
              <span className="text-xs text-slate-400">En tiempo real</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {topVoted.map((dish, idx) => (
                <div
                  key={dish.id}
                  onClick={() => {
                    setHighlightedFoodId(dish.id);
                    setSelectedRecipe(dish);
                  }}
                  className="flex items-center space-x-3 p-2 rounded-xl bg-slate-50 hover:bg-orange-50/60 border border-slate-100 transition-all cursor-pointer group"
                >
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={dish.image_url}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                    <span className="absolute top-0 left-0 bg-black/60 text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-br">
                      #{idx + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate group-hover:text-orange-600 transition-colors">
                      {dish.name}
                    </h4>
                    <span className="text-[11px] text-orange-600 font-semibold">
                      ❤️ {dish.votes_count || 0} {dish.votes_count === 1 ? 'voto' : 'votos'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Zona sticky: pestañas + búsqueda + categorías */}
        <div className="sticky top-14 sm:top-16 z-30 bg-slate-50/95 backdrop-blur-md pt-1 pb-3 -mx-3 sm:-mx-6 px-3 sm:px-6 space-y-3 border-b border-slate-200/60 shadow-sm">
          {/* Pestañas Principales: Todos / Mis Platos / Favoritos */}
          <div className="flex items-center space-x-1.5 p-1 bg-slate-200/70 backdrop-blur-md rounded-2xl w-fit shadow-inner">
            <button
              onClick={() => handleTabChange('all')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mainTab === 'all'
                  ? 'bg-white text-orange-600 shadow-md scale-102'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Todos</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                  mainTab === 'all'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-slate-300/80 text-slate-700'
                }`}
              >
                {visibleFoods.length}
              </span>
            </button>

            <button
              onClick={() => handleTabChange('my-foods')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mainTab === 'my-foods'
                  ? 'bg-white text-orange-600 shadow-md scale-102'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Mis Platos</span>
              {isAuthenticated ? (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                    mainTab === 'my-foods'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-slate-300/80 text-slate-700'
                  }`}
                >
                  {myFoodsCount}
                </span>
              ) : (
                <Lock className="w-3 h-3 text-slate-400" />
              )}
            </button>

            {isAuthenticated && (
              <button
                onClick={() => handleTabChange('favorites')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  mainTab === 'favorites'
                    ? 'bg-white text-amber-600 shadow-md scale-102'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    mainTab === 'favorites'
                      ? 'fill-amber-400 text-amber-500'
                      : 'text-amber-500'
                  }`}
                />
                <span>Favoritos</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                    mainTab === 'favorites'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-300/80 text-slate-700'
                  }`}
                >
                  {favoritesCount}
                </span>
              </button>
            )}
          </div>

          {/* Barra de Filtros, Búsqueda y Ordenación */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            {/* Buscador */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar plato, ingrediente..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all shadow-sm"
              />
            </div>

            {/* Ordenación */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline flex-shrink-0">
                Ordenar:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'votes' | 'recent' | 'name')}
                className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/30 shadow-sm cursor-pointer"
              >
                <option value="votes">🔥 Más votados</option>
                <option value="recent">✨ Más recientes</option>
                <option value="name">🔤 Nombre A-Z</option>
              </select>

              <button
                onClick={fetchFoods}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-orange-600 hover:border-orange-200 transition-all shadow-sm"
                title="Refrescar lista"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Categorías (Pills con Selección Múltiple) */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {/* Botón "Todas" */}
            <button
              type="button"
              onClick={handleToggleAll}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex-shrink-0 shadow-sm cursor-pointer select-none ${
                isAllSelected
                  ? 'bg-orange-500 text-white shadow-orange-500/25 scale-105'
                  : 'bg-white hover:bg-slate-100 text-slate-500 border border-slate-200/80 hover:text-slate-800'
              }`}
              title={
                isAllSelected
                  ? 'Todas las categorías activas (clic para deseleccionar)'
                  : 'Seleccionar todas las categorías'
              }
            >
              Todas
            </button>

            {/* Píldoras individuales */}
            {categories.map((cat) => {
              const isSelected = selectedCategories.includes(cat);
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => handleToggleCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex-shrink-0 shadow-xs cursor-pointer select-none ${
                    isSelected
                      ? 'bg-orange-500 text-white shadow-orange-500/20 scale-[1.02]'
                      : 'bg-slate-100/90 hover:bg-slate-200 text-slate-400 border border-slate-200/70 hover:text-slate-600'
                  }`}
                  title={
                    isSelected
                      ? `Desactivar filtro "${cat}"`
                      : `Activar filtro "${cat}"`
                  }
                >
                  {cat}
                </button>
              );
            })}

            {/* Botón de Gestión de Categorías para Superusuarios */}
            {isSuperUser && (
              <button
                type="button"
                onClick={() => setIsManageCategoriesOpen(true)}
                className="px-2.5 py-1 rounded-full text-xs font-bold transition-all flex-shrink-0 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 flex items-center space-x-1 shadow-xs active:scale-95 cursor-pointer"
                title="Añadir o gestionar categorías de filtros (Superusuario)"
              >
                <Plus className="w-3.5 h-3.5 text-amber-600" />
                <span>Categoría</span>
              </button>
            )}
          </div>
        </div>

        {/* Cuadrícula de Tarjetas de Comidas */}
        <section>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl sm:rounded-3xl h-64 sm:h-72 border border-slate-100 animate-pulse p-3 sm:p-4 flex flex-col justify-between"
                >
                  <div className="w-full h-36 sm:h-44 bg-slate-200 rounded-xl sm:rounded-2xl" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredFoods.length === 0 ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-6 sm:p-10 text-center space-y-3">
              <div className="text-4xl sm:text-5xl">
                {mainTab === 'favorites' ? '⭐' : mainTab === 'my-foods' ? '👨‍🍳' : '🍲'}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                {mainTab === 'favorites'
                  ? 'Aún no tienes platos favoritos'
                  : mainTab === 'my-foods'
                  ? 'Aún no has añadido platos a la carta'
                  : 'No se encontraron comidas'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                {mainTab === 'favorites'
                  ? 'Pulsa en el icono de la estrella ⭐ de cualquier tarjeta para guardarla en tus favoritos y poder elegir rápidamente entre ellos.'
                  : mainTab === 'my-foods'
                  ? 'Crea tus platos favoritos con foto e ingredientes para que entren en la ruleta del grupo.'
                  : selectedCategories.length === 0
                  ? 'No tienes ninguna categoría activa. Pulsa en "Todas" o activa alguna para ver platos.'
                  : 'No hay ningún plato que coincida con tus filtros actuales.'}
              </p>

              {selectedCategories.length === 0 ? (
                <button
                  type="button"
                  onClick={handleToggleAll}
                  className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 shadow-md transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Activar todas las categorías</span>
                </button>
              ) : mainTab === 'favorites' ? (
                <button
                  onClick={() => setMainTab('all')}
                  className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 shadow-md transition-all"
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span>Explorar todos los platos</span>
                </button>
              ) : (
                <button
                  onClick={handleOpenAddFood}
                  className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 shadow-md transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir plato ahora</span>
                  {!isAuthenticated && <Lock className="w-3 h-3 text-white/80" />}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {filteredFoods.map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  onDelete={handleDeleteFood}
                  onEdit={setEditingFood}
                  onSelect={(f) => setSelectedRecipe(f)}
                  onOptimisticVote={handleOptimisticVote}
                  isHighlighted={highlightedFoodId === food.id}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Botón Flotante para Añadir Comida (FAB) */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40">
        <button
          onClick={handleOpenAddFood}
          className="group flex items-center space-x-2 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-sm shadow-xl shadow-orange-500/35 hover:scale-108 active:scale-95 transition-all duration-200 border-2 border-white"
          title={isAuthenticated ? 'Añadir nuevo plato a la carta' : 'Inicia sesión para añadir platos'}
        >
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          <span className="hidden sm:inline">Añadir Comida</span>
          {!isAuthenticated && <Lock className="w-3.5 h-3.5 text-white/80" />}
        </button>
      </div>

      {/* Footer */}
      <footer className="mt-14 sm:mt-20 border-t border-slate-100 bg-transparent py-4 text-center text-xs text-slate-300">
        <p>¿Qué comemos hoy? 🍽️</p>
      </footer>

      {/* Modales */}
      <RouletteModal
        isOpen={isRouletteOpen}
        onClose={() => {
          setIsRouletteOpen(false);
          setRouletteAutoSpin(false);
        }}
        foods={roulettePool}
        subtitle={rouletteSubtitle}
        autoSpin={rouletteAutoSpin}
        onAutoSpinHandled={() => setRouletteAutoSpin(false)}
        onSelectWinner={(winner) => {
          setHighlightedFoodId(winner.id);
          setIsRouletteOpen(false);
          setRouletteAutoSpin(false);
          setSelectedRecipe(winner);
        }}
      />

      <RecipeDetailModal
        isOpen={!!selectedRecipe}
        food={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        onEdit={(food) => {
          setSelectedRecipe(null);
          setEditingFood(food);
        }}
        onSpinAgain={() => {
          setSelectedRecipe(null);
          setRouletteAutoSpin(true);
          setIsRouletteOpen(true);
        }}
        onOptimisticVote={handleOptimisticVote}
      />

      <ArcadeModal
        isOpen={isArcadeOpen}
        onClose={() => setIsArcadeOpen(false)}
      />

      <AddFoodModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onFoodAdded={handleFoodAdded}
      />

      <EditFoodModal
        isOpen={!!editingFood}
        food={editingFood}
        onClose={() => setEditingFood(null)}
        onFoodUpdated={handleFoodUpdated}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        description={authModalReason}
      />

      <AdminUsersModal
        isOpen={isAdminModalOpen}
        onClose={closeAdminModal}
        onUserDeleted={fetchFoods}
      />

      <ManageCategoriesModal
        isOpen={isManageCategoriesOpen}
        onClose={() => setIsManageCategoriesOpen(false)}
        foods={foods}
        onFoodsReassigned={fetchFoods}
      />

      <Toast />
    </div>
  );
}

export function App() {
  return (
    <UserProvider>
      <CategoryProvider>
        <MainApp />
      </CategoryProvider>
    </UserProvider>
  );
}

export default App;
