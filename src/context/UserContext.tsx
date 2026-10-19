import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface UserContextType {
  userName: string;
  setUserName: (name: string) => void;
  userVotes: Set<string>;
  toggleVote: (foodId: string) => Promise<boolean>;
  isLoadingVotes: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const DEFAULT_AVATARS = ['👨‍🍳', '👩‍🍳', '🍕', '🌮', '🍣', '🥑', '🍔', '🥗'];

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userName, setUserNameState] = useState<string>(() => {
    const saved = localStorage.getItem('que_comemos_user');
    if (saved) return saved;
    const randomAvatar = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
    const randomId = Math.floor(100 + Math.random() * 900);
    return `Gourmet-${randomId} ${randomAvatar}`;
  });

  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [isLoadingVotes, setIsLoadingVotes] = useState<boolean>(true);

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
        // Eliminar voto
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('food_id', foodId)
          .eq('user_name', userName);

        if (error) throw error;
      } else {
        // Añadir voto
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
        userVotes,
        toggleVote,
        isLoadingVotes,
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
