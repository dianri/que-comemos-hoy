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
}

/**
 * Obtiene el nombre legible del autor o chef de un plato.
 * - Si el plato pertenece al usuario actualmente conectado, muestra su nombre o apodo de sesión.
 * - Si el plato tiene user_email o un autor identificado, formatea el nombre real (ej. 'Chef Belenroll' o 'Chef Dianrie').
 * - Si el plato no tiene creador o es anónimo, devuelve 'Receta Oficial'.
 */
export function getFoodCreatorDisplayName(
  food: {
    created_by?: string;
    user_id?: string;
    user_email?: string;
  },
  currentUser?: { id?: string; email?: string | null } | null,
  currentUserName?: string
): string {
  // 1. Si la receta pertenece al usuario activo conectado (verificado por id o email)
  if (currentUser) {
    const isMine =
      (food.user_id && food.user_id === currentUser.id) ||
      (food.user_email && currentUser.email && food.user_email.toLowerCase() === currentUser.email.toLowerCase()) ||
      (food.created_by && (food.created_by === currentUser.id || (currentUser.email && food.created_by.toLowerCase() === currentUser.email.toLowerCase())));

    if (isMine && currentUserName) {
      return currentUserName;
    }
  }

  // 2. Si no tiene datos de creador ni email, o está marcado explícitamente como 'anónimo'
  const isAnonymous =
    (!food.created_by || food.created_by.trim() === '' || food.created_by.toLowerCase() === 'anónimo' || food.created_by.toLowerCase() === 'anonimo') &&
    (!food.user_email || food.user_email.trim() === '') &&
    !food.user_id;

  if (isAnonymous) {
    return 'Receta Oficial';
  }

  // 3. Obtener el identificador base del autor: preferir user_email si está disponible
  let rawAuthor = '';
  if (food.user_email && food.user_email.trim()) {
    rawAuthor = food.user_email.trim();
  } else if (food.created_by && food.created_by.trim()) {
    rawAuthor = food.created_by.trim();
  }

  // 4. Si el string es un UUID y no tenemos email disponible
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawAuthor);
  if (isUUID) {
    return 'Chef de la Comunidad';
  }

  // 5. Si es un email (o contiene @), extraer la parte del nombre de usuario
  let clean = rawAuthor;
  if (clean.includes('@')) {
    clean = clean.split('@')[0].trim();
  }

  if (!clean || clean.toLowerCase() === 'anónimo' || clean.toLowerCase() === 'anonimo') {
    return 'Receta Oficial';
  }

  if (clean.toLowerCase() === 'dianrie') {
    return 'Chef Dianrie';
  }

  // Formatear nombres compuestos o con separadores (ej. "juan.perez" -> "Juan Perez")
  const formattedWords = clean
    .split(/[._-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const finalName = formattedWords || (clean.charAt(0).toUpperCase() + clean.slice(1));
  return finalName.toLowerCase().startsWith('chef') ? finalName : `Chef ${finalName}`;
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
