import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from './UserContext';
import { sanitizeText } from '../lib/sanitize';

const DEFAULT_CATEGORIES: string[] = [
  'General',
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
  'Postres',
  'Desayuno',
];

interface CategoryContextType {
  categories: string[];
  categoriesWithAll: string[];
  isLoadingCategories: boolean;
  refreshCategories: () => Promise<void>;
  addCategory: (name: string) => Promise<{ success: boolean; error?: string }>;
  deleteCategory: (
    name: string,
    onSuccessReassign?: () => void
  ) => Promise<{ success: boolean; error?: string }>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSuperUser } = useUser();
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(true);

  // Consultar categorías desde Supabase
  const refreshCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name, display_order')
        .order('display_order', { ascending: true });

      if (error) {
        console.warn('Advertencia al cargar categorías:', error.message);
        return;
      }

      if (data && data.length > 0) {
        // Asegurar que 'General' esté presente
        const names = data.map((c) => c.name.trim()).filter(Boolean);
        if (!names.includes('General')) {
          names.unshift('General');
        }
        setCategories(names);
      }
    } catch (err) {
      console.error('Error al sincronizar categorías:', err);
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  // Carga inicial y suscripción Realtime
  useEffect(() => {
    refreshCategories();

    // Suscripción al canal de cambios en tiempo real
    const channel = supabase
      .channel('public:categories_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        () => {
          refreshCategories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshCategories]);

  // Añadir nueva categoría (solo superusuarios)
  const addCategory = async (name: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSuperUser) {
      return { success: false, error: 'Solo los superusuarios pueden añadir categorías.' };
    }

    const clean = sanitizeText(name);
    if (!clean || clean.length < 2) {
      return { success: false, error: 'El nombre debe tener al menos 2 caracteres.' };
    }

    if (clean.toLowerCase() === 'todas') {
      return { success: false, error: '"Todas" es un filtro reservado del sistema.' };
    }

    // Capitalizar primera letra de forma elegante
    const formattedName = clean.charAt(0).toUpperCase() + clean.slice(1);

    if (categories.some((c) => c.toLowerCase() === formattedName.toLowerCase())) {
      return { success: false, error: `La categoría "${formattedName}" ya existe.` };
    }

    try {
      const nextOrder = categories.length;
      const { error } = await supabase
        .from('categories')
        .insert({ name: formattedName, display_order: nextOrder });

      if (error) {
        return { success: false, error: error.message };
      }

      // Actualización optimista instantánea
      setCategories((prev) => [...prev, formattedName]);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al guardar la categoría.' };
    }
  };

  // Eliminar categoría reasignando platos a 'General' (solo superusuarios)
  const deleteCategory = async (
    name: string,
    onSuccessReassign?: () => void
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isSuperUser) {
      return { success: false, error: 'Solo los superusuarios pueden eliminar categorías.' };
    }

    const trimmed = name.trim();
    if (trimmed.toLowerCase() === 'general' || trimmed.toLowerCase() === 'todas') {
      return { success: false, error: 'No se puede eliminar la categoría base "General".' };
    }

    try {
      // 1. Reasignar platos existentes que usen esta categoría a 'General'
      const { error: updateError } = await supabase
        .from('foods')
        .update({ category: 'General' })
        .eq('category', trimmed);

      if (updateError) {
        console.warn('Aviso al reasignar platos:', updateError.message);
      }

      // 2. Eliminar la categoría de la tabla
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('name', trimmed);

      if (deleteError) {
        return { success: false, error: deleteError.message };
      }

      // Actualización optimista del estado local
      setCategories((prev) => prev.filter((c) => c.toLowerCase() !== trimmed.toLowerCase()));

      // Callback para refrescar platos en la vista principal
      onSuccessReassign?.();

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al eliminar la categoría.' };
    }
  };

  const categoriesWithAll = ['Todas', ...categories.filter((c) => c !== 'Todas')];

  return (
    <CategoryContext.Provider
      value={{
        categories,
        categoriesWithAll,
        isLoadingCategories,
        refreshCategories,
        addCategory,
        deleteCategory,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories debe ser usado dentro de un CategoryProvider');
  }
  return context;
};
