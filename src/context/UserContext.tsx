import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Food, UserRole } from '../types';
import { sanitizeText } from '../lib/sanitize';

interface UserContextType {
  userName: string;
  setUserName: (name: string) => void;
  user: User | null;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  isSuperUser: boolean;
  isRootSuperAdmin: boolean;
  superadminEmails: Set<string>;
  refreshRoles: () => Promise<void>;
  canManageFood: (food: Food) => boolean;
  isAuthLoading: boolean;
  signOut: () => Promise<void>;
  userVotes: Set<string>;
  toggleVote: (foodId: string, onOptimisticDelta?: (delta: number) => void) => Promise<boolean>;
  isLoadingVotes: boolean;
  favorites: Set<string>;
  toggleFavorite: (foodId: string) => boolean;
  isFavorite: (foodId: string) => boolean;
  isAuthModalOpen: boolean;
  authModalReason: string | undefined;
  openAuthModal: (reason?: string) => void;
  closeAuthModal: () => void;
  isAdminModalOpen: boolean;
  openAdminModal: () => void;
  closeAdminModal: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const DEFAULT_AVATARS = ['👨‍🍳', '👩‍🍳', '🍕', '🌮', '🍣', '🥑', '🍔', '🥗'];
const ROOT_ADMIN_EMAIL = 'dianrie@hotmail.com';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalReason, setAuthModalReason] = useState<string | undefined>(undefined);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [superadminEmails, setSuperadminEmails] = useState<Set<string>>(new Set([ROOT_ADMIN_EMAIL]));

  const [userName, setUserNameState] = useState<string>(() => {
    const saved = localStorage.getItem('que_comemos_user');
    if (saved) return saved;
    const randomAvatar = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
    const randomId = Math.floor(100 + Math.random() * 900);
    return `Gourmet-${randomId} ${randomAvatar}`;
  });

  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [isLoadingVotes, setIsLoadingVotes] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Clave dinámica de favoritos según usuario autenticado o invitado
  const getFavStorageKey = useCallback((currentUser: User | null) => {
    return currentUser?.email
      ? `que_comemos_favs_${currentUser.email}`
      : 'que_comemos_favs_guest';
  }, []);

  // Cargar favoritos del almacenamiento local
  const loadFavorites = useCallback((currentUser: User | null) => {
    try {
      const key = getFavStorageKey(currentUser);
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setFavorites(new Set(parsed));
          return;
        }
      }
      setFavorites(new Set());
    } catch {
      setFavorites(new Set());
    }
  }, [getFavStorageKey]);

  // Consultar roles de superusuarios en la base de datos
  const refreshRoles = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('user_roles').select('user_email, role');
      if (error) {
        console.warn('Advertencia al consultar roles:', error.message);
      }
      const admins = new Set<string>([ROOT_ADMIN_EMAIL]);
      if (data) {
        data.forEach((r) => {
          if (r.role === 'root_admin' || r.role === 'superadmin') {
            admins.add(r.user_email.toLowerCase());
          }
        });
      }
      setSuperadminEmails(admins);

      if (user?.email) {
        const emailLower = user.email.toLowerCase();
        if (emailLower === ROOT_ADMIN_EMAIL) {
          setUserRole('root_admin');
        } else {
          const match = data?.find((r) => r.user_email.toLowerCase() === emailLower);
          setUserRole((match?.role as UserRole) || 'user');
        }
      } else {
        setUserRole(null);
      }
    } catch (err) {
      console.error('Error al sincronizar roles:', err);
    }
  }, [user]);

  // Alternar plato favorito (solo usuarios autenticados)
  const toggleFavorite = (foodId: string): boolean => {
    if (!user) {
      openAuthModal('Inicia sesión con tu correo para guardar tus platos favoritos.');
      return false;
    }

    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(foodId)) {
        next.delete(foodId);
      } else {
        next.add(foodId);
      }
      try {
        const key = getFavStorageKey(user);
        localStorage.setItem(key, JSON.stringify(Array.from(next)));
      } catch (err) {
        console.error('Error al guardar favoritos:', err);
      }
      return next;
    });
    return true;
  };

  const isFavorite = (foodId: string) => {
    return favorites.has(foodId);
  };

  // 1. Escuchar sesión de Supabase Auth
  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      const initialUser = session?.user ?? null;
      setUser(initialUser);
      loadFavorites(initialUser);

      if (initialUser?.email) {
        const currentSaved = localStorage.getItem('que_comemos_user');
        if (!currentSaved || currentSaved.startsWith('Gourmet-')) {
          const emailName = initialUser.email.split('@')[0];
          setUserNameState(emailName);
          localStorage.setItem('que_comemos_user', emailName);
        }
      }
      setIsAuthLoading(false);
    });

    // Suscribirse a cambios de estado de autenticación (login, logout, magic link callback)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const changedUser = session?.user ?? null;
      setUser(changedUser);
      loadFavorites(changedUser);

      if (changedUser?.email) {
        const currentSaved = localStorage.getItem('que_comemos_user');
        if (!currentSaved || currentSaved.startsWith('Gourmet-')) {
          const emailName = changedUser.email.split('@')[0];
          setUserNameState(emailName);
          localStorage.setItem('que_comemos_user', emailName);
        }
      }
      setIsAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadFavorites]);

  // Actualizar roles cada vez que cambia el usuario
  useEffect(() => {
    refreshRoles();
  }, [user, refreshRoles]);

  const openAuthModal = (reason?: string) => {
    setAuthModalReason(reason);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalReason(undefined);
  };

  const openAdminModal = () => {
    setIsAdminModalOpen(true);
  };

  const closeAdminModal = () => {
    setIsAdminModalOpen(false);
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserRole(null);
      loadFavorites(null);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  const setUserName = (name: string) => {
    // Sanitizar para eliminar etiquetas HTML y espacios antes de guardar
    const trimmed = sanitizeText(name);
    if (!trimmed) return;
    // Limitar longitud máxima para prevenir abusos
    const safe = trimmed.slice(0, 40);
    localStorage.setItem('que_comemos_user', safe);
    setUserNameState(safe);
  };

  // Cargar votos del usuario actual desde Supabase asociados a su auth.uid()
  useEffect(() => {
    let isMounted = true;

    const fetchUserVotes = async () => {
      if (!user) {
        setUserVotes(new Set());
        setIsLoadingVotes(false);
        return;
      }

      try {
        setIsLoadingVotes(true);
        // Consultar votos del usuario por auth.uid() (user_id) con fallback por user_name
        const { data, error } = await supabase
          .from('votes')
          .select('food_id')
          .or(`user_id.eq.${user.id},user_name.eq.${userName}`);

        if (error) {
          console.error('Error al cargar votos del usuario desde Supabase:', error);
          return;
        }

        if (isMounted && data) {
          setUserVotes(new Set(data.map((v) => v.food_id)));
        }
      } catch (err) {
        console.error('Error al cargar votos del usuario:', err);
      } finally {
        if (isMounted) {
          setIsLoadingVotes(false);
        }
      }
    };

    fetchUserVotes();

    return () => {
      isMounted = false;
    };
  }, [user, userName]);

  // Suscripción Realtime a cambios en la tabla 'votes' para el usuario actual
  useEffect(() => {
    if (!user) return;

    const votesChannel = supabase
      .channel(`public:user_votes_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newVote = payload.new as { food_id: string; user_id?: string; user_name?: string };
            if (newVote && (newVote.user_id === user.id || newVote.user_name === userName)) {
              setUserVotes((prev) => new Set(prev).add(newVote.food_id));
            }
          } else if (payload.eventType === 'DELETE') {
            const oldVote = payload.old as { food_id?: string; user_id?: string; user_name?: string };
            if (oldVote?.food_id && (oldVote.user_id === user.id || oldVote.user_name === userName)) {
              setUserVotes((prev) => {
                const next = new Set(prev);
                next.delete(oldVote.food_id!);
                return next;
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(votesChannel);
    };
  }, [user, userName]);

  // Alternar voto (dar / quitar me gusta) - Sincronizado con Supabase y auth.uid()
  const toggleVote = async (
    foodId: string,
    onOptimisticDelta?: (delta: number) => void
  ): Promise<boolean> => {
    if (!user) {
      openAuthModal('Inicia sesión con tu correo para votar por tus platos favoritos.');
      return false;
    }

    const hasVoted = userVotes.has(foodId);
    const delta = hasVoted ? -1 : 1;

    // 1. Actualización optimista inmediata en el estado del usuario y en el contador del componente
    setUserVotes((prev) => {
      const next = new Set(prev);
      if (hasVoted) next.delete(foodId);
      else next.add(foodId);
      return next;
    });
    onOptimisticDelta?.(delta);

    try {
      if (hasVoted) {
        // Eliminar voto en Supabase filtrando por food_id y user_id
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('food_id', foodId)
          .or(`user_id.eq.${user.id},user_name.eq.${userName}`);

        if (error) throw error;
      } else {
        // Insertar voto en Supabase garantizando user_id (auth.uid) y user_name
        const { error } = await supabase.from('votes').insert([
          {
            food_id: foodId,
            user_id: user.id,
            user_name: userName || user.email?.split('@')[0] || 'Gourmet',
          },
        ]);

        if (error) throw error;
      }
      return true;
    } catch (err) {
      console.error('Error al actualizar voto en Supabase:', err);
      // Revertir optimismo si falló la operación en Supabase
      setUserVotes((prev) => {
        const next = new Set(prev);
        if (hasVoted) next.add(foodId);
        else next.delete(foodId);
        return next;
      });
      onOptimisticDelta?.(-delta);
      return false;
    }
  };

  // Jerarquía de Superusuarios
  const isRootSuperAdmin = user?.email?.toLowerCase() === ROOT_ADMIN_EMAIL;
  const isSuperUser = isRootSuperAdmin || userRole === 'superadmin' || userRole === 'root_admin';

  const canManageFood = useCallback(
    (food: Food) => {
      if (!user) return false;
      // 1. Superusuarios (raíz y delegados) tienen permisos de gestión total
      if (isSuperUser) return true;
      // 2. Coincidencia estricta por user_id (auth.uid)
      if (food.user_id && food.user_id === user.id) return true;
      // 3. Coincidencia estricta por user_email único registrado
      if (food.user_email && food.user_email.toLowerCase() === user.email?.toLowerCase()) return true;
      // 4. Coincidencia por created_by si coincide con el UID o el email exacto
      if (
        food.created_by &&
        (food.created_by === user.id ||
          (user.email && food.created_by.toLowerCase() === user.email.toLowerCase()))
      ) {
        return true;
      }
      return false;
    },
    [user, isSuperUser]
  );

  return (
    <UserContext.Provider
      value={{
        userName,
        setUserName,
        user,
        isAuthenticated: !!user,
        userRole,
        isSuperUser,
        isRootSuperAdmin,
        superadminEmails,
        refreshRoles,
        canManageFood,
        isAuthLoading,
        signOut,
        userVotes,
        toggleVote,
        isLoadingVotes,
        favorites,
        toggleFavorite,
        isFavorite,
        isAuthModalOpen,
        authModalReason,
        openAuthModal,
        closeAuthModal,
        isAdminModalOpen,
        openAdminModal,
        closeAdminModal,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe ser usado dentro de un UserProvider');
  }
  return context;
};
