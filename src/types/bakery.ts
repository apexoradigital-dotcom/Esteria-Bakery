export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  category_name?: string;
  image_url: string;
  image_path?: string;
  is_available: boolean;
  is_featured: boolean;
  display_order: number;
  ingredients?: string[];
  allergens?: string[];
  created_at: string;
  updated_at?: string;
}

export type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled';

export interface OrderItem {
  id: string;
  order_id?: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  custom_instructions?: string;
}

export interface Order {
  id: string;
  customer_name: string;
  phone: string;
  whatsapp_number: string;
  email?: string;
  order_type: 'delivery' | 'pickup';
  address?: string;
  location?: string;
  city?: string;
  state?: string;
  preferred_date: string;
  preferred_time: string;
  special_instructions?: string;
  total_amount: number;
  status: OrderStatus;
  items: OrderItem[];
  created_at: string;
  updated_at?: string;
}

export interface Review {
  id: string;
  customer_name: string;
  rating: number; // 1 to 5
  review_text: string;
  location?: string;
  approved: boolean;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  hero_title: string;
  hero_description: string;
  hero_image_url: string;
  logo_url: string;
  about_title: string;
  about_text: string;
  mission_text: string;
  values_text: string;
  contact_phone: string;
  contact_whatsapp: string;
  contact_location: string;
  final_cta_title: string;
  final_cta_subtitle: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  specialNote?: string;
}
