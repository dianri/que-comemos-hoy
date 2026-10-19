export interface Food {
  id: string;
  name: string;
  image_url: string;
  category: string;
  description?: string;
  votes_count: number;
  created_by?: string;
  user_id?: string;
  user_email?: string;
  created_at?: string;
}

export interface Vote {
  id: string;
  food_id: string;
  user_name: string;
  created_at?: string;
}

export type Category =
  | 'Todas'
  | 'Tradicional'
  | 'Carnes'
  | 'Pescados'
  | 'Sopas'
  | 'Arroces'
  | 'Italiana'
  | 'Americana'
  | 'Mexicana'
  | 'Japonesa'
  | 'Saludable'
  | 'General';

export type MainTabFilter = 'all' | 'my-foods' | 'favorites';

export type UserRole = 'root_admin' | 'superadmin' | 'user';

export interface AdminUserItem {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  last_sign_in_at: string | null;
}
