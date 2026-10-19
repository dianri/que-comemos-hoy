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
  | 'Italiana'
  | 'Arroces'
  | 'Americana'
  | 'Mexicana'
  | 'Japonesa'
  | 'Saludable'
  | 'General';

export type MainTabFilter = 'all' | 'my-foods' | 'favorites';
