import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UserContextType {
  userName: string;
  setUserName: (name: string) => void;
  user: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  signOut: () => Promise<void>;
  userVotes: Set<string>;
  toggleVote: (foodId: string) => Promise<boolean>;
  isLoadingVotes: boolean;
  favorites: Set<string>;
  toggleFavorite: (foodId: string) => void;
  isFavorite: (foodId: string) => boolean;
  isAuthModalOpen: boolean;
  authModalReason: string | undefined;
  openAuthModal: (reason?: string) => void;
  closeAuthModal: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const DEFAULT_AVATARS = ['👨‍🍳', '👩‍🍳', '🍕', '🌮', '🍣', '🥑', '🍔', '🥗'];

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalReason, setAuthModalReason] = useState<string | undefined>(undefined);

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

  // Alternar plato favorito
  const toggleFavorite = (foodId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(foodId)) {
        next.delete(foodId);
      } else {
        next.add(foodId);
      }
      // Guardar en localStorage
      try {
        const key = getFavStorageKey(user);
        localStorage.setItem(key, JSON.stringify(Array.from(next)));
      } catch (err) {
        console.error('Error al guardar favoritos:', err);
      }
      return next;
    });
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

  const openAuthModal = (reason?: string) => {
    setAuthModalReason(reason);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalReason(undefined);
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      loadFavorites(null);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  const setUserName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    localStorage.setItem('que_comemos_user', trimmed);
    setUserNameState(trimmed);
  };

  // Cargar votos del usuario actual desde Supabase
  useEffect(() => {
    const fetchUserVotes = async () => {
      try {
        setIsLoadingVotes(true);
        const { data, error } = await supabase
          .from('votes')
          .select('food_id')
          .eq('user_name', userName);

        if (!error && data) {
          setUserVotes(new Set(data.map((v) => v.food_id)));
        }
      } catch (err) {
        console.error('Error al cargar votos del usuario:', err);
      } finally {
        setIsLoadingVotes(false);
      }
    };

    fetchUserVotes();
  }, [userName]);

  // Alternar voto (dar / quitar me gusta)
  const toggleVote = async (foodId: string): Promise<boolean> => {
    const hasVoted = userVotes.has(foodId);

    // Optimistic update
    setUserVotes((prev) => {
      const next = new Set(prev);
      if (hasVoted) next.delete(foodId);
      else next.add(foodId);
      return next;
    });

    try {
      if (hasVoted) {
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('food_id', foodId)
          .eq('user_name', userName);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('votes').insert([
          {
            food_id: foodId,
            user_name: userName,
          },
        ]);

        if (error) throw error;
      }
      return true;
    } catch (err) {
      console.error('Error al actualizar voto:', err);
      // Revertir optimismo
      setUserVotes((prev) => {
        const next = new Set(prev);
        if (hasVoted) next.add(foodId);
        else next.delete(foodId);
        return next;
      });
      return false;
    }
  };

  return (
    <UserContext.Provider
      value={{
        userName,
        setUserName,
        user,
        isAuthenticated: !!user,
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
