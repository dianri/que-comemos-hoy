export interface Food {
  id: string;
  name: string;
  image_url: string;
  category: string;
  description?: string;
  votes_count: number;
  created_by?: string;
  created_at?: string;
}

export interface Vote {
  id: string;
  food_id: string;
  user_name: string;
  created_at?: string;
}

export type Category = 'Todas' | 'Tradicional' | 'Italiana' | 'Arroces' | 'Americana' | 'Mexicana' | 'Japonesa' | 'Saludable' | 'General';
