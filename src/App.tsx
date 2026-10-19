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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from './lib/supabase';
import { Food, Category, MainTabFilter } from './types';
import { Navbar } from './components/Navbar';
import { FoodCard } from './components/FoodCard';
import { RouletteModal } from './components/RouletteModal';
import { AddFoodModal } from './components/AddFoodModal';
import { EditFoodModal } from './components/EditFoodModal';
import { AuthModal } from './components/AuthModal';
import { AdminUsersModal } from './components/AdminUsersModal';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { UserProvider, useUser } from './context/UserContext';

const CATEGORIES: Category[] = [
  'Todas',
  'Tradicional',
  'Carnes',
  'Pescados',
  'Sopas',
  'Arroces',
  'Italiana',
  'Americana',
  'Mexicana',
  'Japonesa',
  'Saludable',
];

function MainApp() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Todas');
  const [sortBy, setSortBy] = useState<'votes' | 'recent' | 'name'>('votes');
  const [mainTab, setMainTab] = useState<MainTabFilter>('all');

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

    // Suscripción Realtime a cambios en la tabla 'foods'
    const channel = supabase
      .channel('public:foods_changes')
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

      // 3. Si el usuario está autenticado, ve sus propias recetas creadas
      if (user) {
        if (f.user_id && f.user_id === user.id) return true;
        if (f.user_email && f.user_email.toLowerCase() === user.email?.toLowerCase()) return true;
        const emailPrefix = user.email ? user.email.split('@')[0].toLowerCase() : '';
        if (
          f.created_by &&
          (f.created_by.toLowerCase() === user.email?.toLowerCase() ||
            f.created_by.toLowerCase() === emailPrefix)
        ) {
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

  // Conteo de platos por pestaña
  const myFoodsCount = useMemo(() => {
    if (!user) return 0;
    const userEmailPrefix = user.email ? user.email.split('@')[0].toLowerCase() : '';
    return visibleFoods.filter(
      (f) =>
        (f.user_id && f.user_id === user.id) ||
        (f.user_email && f.user_email.toLowerCase() === user.email?.toLowerCase()) ||
        (user.email &&
          (f.created_by?.toLowerCase() === user.email.toLowerCase() ||
            f.created_by?.toLowerCase() === userEmailPrefix))
    ).length;
  }, [visibleFoods, user]);

  const favoritesCount = useMemo(() => {
    return visibleFoods.filter((f) => favorites.has(f.id)).length;
  }, [visibleFoods, favorites]);

  // Filtrado y ordenación
  const filteredFoods = useMemo(() => {
    const userEmailPrefix = user?.email ? user.email.split('@')[0].toLowerCase() : '';

    return visibleFoods
      .filter((f) => {
        // 1. Filtro por pestaña principal
        if (mainTab === 'my-foods') {
          const isMine =
            (f.user_id && f.user_id === user?.id) ||
            (f.user_email && f.user_email.toLowerCase() === user?.email?.toLowerCase()) ||
            (user?.email &&
              (f.created_by?.toLowerCase() === user.email.toLowerCase() ||
                f.created_by?.toLowerCase() === userEmailPrefix));
          if (!isMine) return false;
        } else if (mainTab === 'favorites') {
          if (!favorites.has(f.id)) return false;
        }

        // 2. Filtro por categoría
        const matchesCategory =
          selectedCategory === 'Todas' || f.category === selectedCategory;

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
  }, [visibleFoods, mainTab, selectedCategory, searchQuery, sortBy, user, favorites]);

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
    if (selectedCategory !== 'Todas') {
      return `Girando entre ${roulettePool.length} platos de la categoría "${selectedCategory}"`;
    }
    return `${roulettePool.length} platos en la ruleta. ¡Deja que el destino decida!`;
  }, [mainTab, selectedCategory, roulettePool]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Barra de Navegación */}
      <Navbar totalFoods={visibleFoods.length} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Banner Hero Central */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 via-amber-600 to-rose-600 text-white p-6 sm:p-10 shadow-2xl shadow-orange-600/20">
          <div className="absolute -right-10 -bottom-10 opacity-15 pointer-events-none text-9xl">
            🥘
          </div>
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md mb-3 border border-white/20">
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              <span>Decisión sin discusiones</span>
            </div>

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              ¿No sabes qué comer hoy?
            </h2>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-orange-100 font-medium leading-relaxed">
              Vota con tu grupo o familia tus comidas preferidas y deja que la ruleta interactiva decida el menú de hoy por ti.
            </p>

            {/* Botones de Acción Hero */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => setIsRouletteOpen(true)}
                className="group relative px-6 py-3.5 rounded-2xl bg-white text-orange-600 font-black text-sm sm:text-base shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
              >
                <span className="text-xl">🎯</span>
                <span>
                  {mainTab === 'favorites'
                    ? '¡Girar Favoritos!'
                    : mainTab === 'my-foods'
                    ? '¡Girar Mis Platos!'
                    : '¡Girar la Ruleta!'}
                </span>
                <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold">
                  {roulettePool.length}
                </span>
              </button>

              <button
                onClick={handleQuickPick}
                className="px-5 py-3.5 rounded-2xl bg-black/20 hover:bg-black/30 border border-white/30 text-white font-bold text-sm sm:text-base backdrop-blur-md transition-all flex items-center space-x-2 active:scale-95"
              >
                <Dices className="w-4 h-4" />
                <span>Elección Rápida</span>
              </button>
            </div>
          </div>
        </section>

        {/* Podio Top 3 Platos Más Votados */}
        {topVoted.length > 0 && mainTab === 'all' && (
          <section className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                  Favoritos de la Comunidad
                </h3>
              </div>
              <span className="text-xs text-slate-400">En tiempo real</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {topVoted.map((dish, idx) => (
                <div
                  key={dish.id}
                  onClick={() => {
                    setHighlightedFoodId(dish.id);
                    setSelectedRecipe(dish);
                  }}
                  className="flex items-center space-x-3 p-2.5 rounded-xl bg-slate-50 hover:bg-orange-50/60 border border-slate-100 transition-all cursor-pointer group"
                >
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
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
                      ❤️ {dish.votes_count} votos
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pestañas Principales: Todos / Mis Platos / Favoritos */}
        <div className="flex items-center space-x-2 p-1.5 bg-slate-200/70 backdrop-blur-md rounded-2xl w-fit shadow-inner">
          <button
            onClick={() => handleTabChange('all')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              mainTab === 'all'
                ? 'bg-white text-orange-600 shadow-md scale-102'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Todos los platos</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
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
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              mainTab === 'my-foods'
                ? 'bg-white text-orange-600 shadow-md scale-102'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Mis Platos</span>
            {isAuthenticated ? (
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                  mainTab === 'my-foods'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-slate-300/80 text-slate-700'
                }`}
              >
                {myFoodsCount}
              </span>
            ) : (
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          <button
            onClick={() => handleTabChange('favorites')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              mainTab === 'favorites'
                ? 'bg-white text-amber-600 shadow-md scale-102'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Star
              className={`w-4 h-4 ${
                mainTab === 'favorites'
                  ? 'fill-amber-400 text-amber-500'
                  : 'text-amber-500'
              }`}
            />
            <span>Favoritos</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                mainTab === 'favorites'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-300/80 text-slate-700'
              }`}
            >
              {favoritesCount}
            </span>
          </button>
        </div>

        {/* Barra de Filtros, Búsqueda y Ordenación */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Buscador */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por plato, ingrediente o receta..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all shadow-sm"
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
                className="px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/30 shadow-sm cursor-pointer"
              >
                <option value="votes">🔥 Más votados</option>
                <option value="recent">✨ Más recientes</option>
                <option value="name">🔤 Nombre A-Z</option>
              </select>

              <button
                onClick={fetchFoods}
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-orange-600 hover:border-orange-200 transition-all shadow-sm"
                title="Refrescar lista"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Categorías (Pills) */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 shadow-sm ${
                    active
                      ? 'bg-orange-500 text-white shadow-orange-500/25 scale-105'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </section>

        {/* Cuadrícula de Tarjetas de Comidas */}
        <section>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl h-72 border border-slate-100 animate-pulse p-4 flex flex-col justify-between"
                >
                  <div className="w-full h-44 bg-slate-200 rounded-2xl" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredFoods.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-10 text-center space-y-3">
              <div className="text-5xl">
                {mainTab === 'favorites' ? '⭐' : mainTab === 'my-foods' ? '👨‍🍳' : '🍲'}
              </div>
              <h3 className="text-lg font-bold text-slate-800">
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
                  : 'No hay ningún plato que coincida con tus filtros actuales.'}
              </p>

              {mainTab === 'favorites' ? (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {filteredFoods.map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  onDelete={handleDeleteFood}
                  onEdit={setEditingFood}
                  onSelect={(f) => setSelectedRecipe(f)}
                  isHighlighted={highlightedFoodId === food.id}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Botón Flotante para Añadir Comida (FAB) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={handleOpenAddFood}
          className="group flex items-center space-x-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-sm shadow-xl shadow-orange-500/35 hover:scale-108 active:scale-95 transition-all duration-200 border-2 border-white"
          title={isAuthenticated ? 'Añadir nuevo plato a la carta' : 'Inicia sesión para añadir platos'}
        >
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          <span className="hidden sm:inline">Añadir Comida</span>
          {!isAuthenticated && <Lock className="w-3.5 h-3.5 text-white/80" />}
        </button>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <p>
          ¿Qué comemos hoy? 🍽️ • Desarrollado con React, Vite, Tailwind CSS y Supabase • Listo para Vercel
        </p>
      </footer>

      {/* Modales */}
      <RouletteModal
        isOpen={isRouletteOpen}
        onClose={() => setIsRouletteOpen(false)}
        foods={roulettePool}
        subtitle={rouletteSubtitle}
        onSelectWinner={(winner) => {
          setHighlightedFoodId(winner.id);
          setIsRouletteOpen(false);
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
    </div>
  );
}

export function App() {
  return (
    <UserProvider>
      <MainApp />
    </UserProvider>
  );
}

export default App;
