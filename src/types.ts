export interface Food {
  id: string;
  name: string;
  image_url: string;
  category: string;
  categories?: string[];
  description?: string;
  votes_count: number;
  created_by?: string;
  user_id?: string;
  user_email?: string;
  created_at?: string;
  is_global?: boolean;
}

/**
 * Obtiene la lista completa de categorías de un plato con fallback seguro a ['General'].
 * Maneja tanto el formato múltiple `categories: string[]` como el formato clásico `category: string`.
 */
export function getFoodCategories(food: { category?: string; categories?: string[] | null }): string[] {
  if (Array.isArray(food.categories) && food.categories.length > 0) {
    const cleaned = food.categories.map((c) => (typeof c === 'string' ? c.trim() : '')).filter(Boolean);
    if (cleaned.length > 0) return cleaned;
  }
  if (food.category && food.category.trim()) {
    return [food.category.trim()];
  }
  return ['General'];
}

export interface Vote {
  id: string;
  food_id: string;
  user_name: string;
  created_at?: string;
  is_global?: boolean;
}

export type Category = string;

export type MainTabFilter = 'all' | 'my-foods' | 'others' | 'favorites';

export type UserRole = 'root_admin' | 'superadmin' | 'user';

export interface AdminUserItem {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  last_sign_in_at: string | null;
}

export interface GameScore {
  id: string;
  game_name: string;
  user_name: string;
  score: number;
  created_at: string;
}
