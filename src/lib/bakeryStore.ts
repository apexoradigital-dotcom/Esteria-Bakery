import {
  Category,
  Product,
  Order,
  OrderStatus,
  Review,
  SiteSettings,
} from '../types/bakery';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS,
  INITIAL_SETTINGS,
} from '../data/initialData';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  CATEGORIES: 'esteria_bakery_categories_v1',
  PRODUCTS: 'esteria_bakery_products_v1',
  ORDERS: 'esteria_bakery_orders_v1',
  REVIEWS: 'esteria_bakery_reviews_v1',
  SETTINGS: 'esteria_bakery_settings_v1',
  AUTH: 'esteria_bakery_admin_session_v1',
  ADMIN_HASH: 'esteria_bakery_admin_hash_v1',
};

// Simple secure hash helper (SHA-256 via Web Crypto)
async function hashPassword(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Initial hash for the default password "Esteriabakery"
// Generated via SHA-256 of "Esteriabakery"
const DEFAULT_PW_HASH = '4fb6e36d50ff9f92d4ee27c0068ff6101ec2ea7e7b7891ea5225cff2f0d9a6ca';

// Helper to format Nigerian Naira
export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace('NGN', '₦');
}

class BakeryStore {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initLocalStorage();
  }

  private initLocalStorage() {
    if (typeof window === 'undefined') return;

    const storedCats = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!storedCats || !storedCats.includes('cat-juices')) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    }
    const storedProds = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!storedProds || !storedProds.includes('prod-pineapple-ginger')) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
    }
    const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!storedSettings) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    } else {
      try {
        const parsed = JSON.parse(storedSettings);
        if (
          !parsed.hero_title ||
          parsed.hero_title === 'Freshly Baked. Made With Love.' ||
          parsed.hero_title === 'Savour the Flavour in Every Bite'
        ) {
          parsed.hero_title = 'Freshly Baked, Baked With Love.';
        }
        parsed.contact_phone = '09158209566';
        parsed.contact_whatsapp = '2349158209566';
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
      } catch {
        // ignore
      }
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      // Demo initial orders for the dashboard view
      const demoOrders: Order[] = [
        {
          id: 'EST-2026-081',
          customer_name: 'Bimpe Adeyemi',
          phone: '08023456789',
          whatsapp_number: '08023456789',
          order_type: 'delivery',
          location: 'Admiralty Way, Lekki Phase 1',
          city: 'Lagos',
          state: 'Lagos State',
          preferred_date: 'Tomorrow',
          preferred_time: '12:30 PM',
          special_instructions: 'Please include extra napkins and write "Happy 30th Birthday Bimpe" on the cake board.',
          total_amount: 29500,
          status: 'confirmed',
          items: [
            {
              id: 'item-1',
              product_id: 'prod-chocolate-cake',
              product_name: 'Chocolate Celebration Cake (8-inch)',
              quantity: 1,
              unit_price: 25000,
              subtotal: 25000,
            },
            {
              id: 'item-2',
              product_id: 'prod-meat-pie',
              product_name: 'Nigerian Meat Pie',
              quantity: 3,
              unit_price: 1500,
              subtotal: 4500,
            },
          ],
          created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        },
        {
          id: 'EST-2026-080',
          customer_name: 'Emeka Nwosu',
          phone: '08139876543',
          whatsapp_number: '08139876543',
          order_type: 'pickup',
          location: 'Bakery Store Pickup',
          preferred_date: 'Today',
          preferred_time: '4:00 PM',
          special_instructions: 'Pickup after office hours.',
          total_amount: 15000,
          status: 'preparing',
          items: [
            {
              id: 'item-3',
              product_id: 'prod-small-chops-platter',
              product_name: 'Small Chops Platter (Standard 50pcs)',
              quantity: 1,
              unit_price: 15000,
              subtotal: 15000,
            },
          ],
          created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(demoOrders));
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // --- Products ---
  public async getProducts(): Promise<Product[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('display_order', { ascending: true });
        if (!error && data && data.length > 0) {
          return data as Product[];
        }
      } catch (err) {
        console.warn('Supabase getProducts fallback to local store:', err);
      }
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_PRODUCTS;
  }

  public async getProductById(id: string): Promise<Product | undefined> {
    const products = await this.getProducts();
    return products.find((p) => p.id === id);
  }

  public async saveProduct(product: Omit<Product, 'id' | 'created_at'> & { id?: string }): Promise<Product> {
    const id = product.id || `prod-${Date.now()}`;
    const newProduct: Product = {
      ...product,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('products').upsert(newProduct);
      } catch (err) {
        console.warn('Supabase saveProduct error:', err);
      }
    }

    // Always update local cache
    const current = await this.getProducts();
    const existingIndex = current.findIndex((p) => p.id === id);
    let updated: Product[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = { ...current[existingIndex], ...newProduct, updated_at: new Date().toISOString() };
    } else {
      updated = [newProduct, ...current];
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    this.notify();
    return newProduct;
  }

  public async deleteProduct(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteProduct error:', err);
      }
    }

    const current = await this.getProducts();
    const filtered = current.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
    this.notify();
  }

  // --- Categories ---
  public async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('categories').select('*');
        if (!error && data && data.length > 0) return data as Category[];
      } catch (err) {
        console.warn('Supabase getCategories error:', err);
      }
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_CATEGORIES;
  }

  public async saveCategory(category: Omit<Category, 'id' | 'created_at'> & { id?: string }): Promise<Category> {
    const id = category.id || `cat-${category.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const newCategory: Category = {
      ...category,
      id,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('categories').upsert(newCategory);
      } catch (err) {
        console.warn('Supabase saveCategory error:', err);
      }
    }

    const current = await this.getCategories();
    const existingIndex = current.findIndex((c) => c.id === id);
    let updated: Category[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = newCategory;
    } else {
      updated = [...current, newCategory];
    }
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
    this.notify();
    return newCategory;
  }

  public async deleteCategory(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('categories').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteCategory error:', err);
      }
    }

    const current = await this.getCategories();
    const filtered = current.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(filtered));
    this.notify();
  }

  // --- Orders ---
  public async getOrders(): Promise<Order[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, items:order_items(*)')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as Order[];
      } catch (err) {
        console.warn('Supabase getOrders error:', err);
      }
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [];
  }

  public async createOrder(orderInput: Omit<Order, 'id' | 'created_at' | 'status'>): Promise<Order> {
    const orderId = `EST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      ...orderInput,
      id: orderId,
      status: 'new',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error: orderErr } = await supabase.from('orders').insert({
          id: newOrder.id,
          customer_name: newOrder.customer_name,
          phone: newOrder.phone,
          whatsapp_number: newOrder.whatsapp_number,
          email: newOrder.email,
          order_type: newOrder.order_type,
          address: newOrder.address,
          location: newOrder.location,
          city: newOrder.city,
          state: newOrder.state,
          preferred_date: newOrder.preferred_date,
          preferred_time: newOrder.preferred_time,
          special_instructions: newOrder.special_instructions,
          total_amount: newOrder.total_amount,
          status: newOrder.status,
          created_at: newOrder.created_at,
        });

        if (!orderErr && newOrder.items.length > 0) {
          const itemsPayload = newOrder.items.map((item, index) => ({
            id: `item-${newOrder.id}-${index}`,
            order_id: newOrder.id,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.subtotal,
            custom_instructions: item.custom_instructions,
          }));
          await supabase.from('order_items').insert(itemsPayload);
        }
      } catch (err) {
        console.warn('Supabase createOrder error:', err);
      }
    }

    const current = await this.getOrders();
    const updated = [newOrder, ...current];
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
    this.notify();
    return newOrder;
  }

  public async updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from('orders')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase updateOrderStatus error:', err);
      }
    }

    const current = await this.getOrders();
    const updated = current.map((ord) => (ord.id === id ? { ...ord, status, updated_at: new Date().toISOString() } : ord));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
    this.notify();
  }

  // --- Reviews ---
  public async getReviews(onlyApproved = true): Promise<Review[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
        if (onlyApproved) {
          query = query.eq('approved', true);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data as Review[];
      } catch (err) {
        console.warn('Supabase getReviews error:', err);
      }
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      if (stored) {
        const parsed: Review[] = JSON.parse(stored);
        return onlyApproved ? parsed.filter((r) => r.approved) : parsed;
      }
    } catch {
      // fallback
    }
    return onlyApproved ? INITIAL_REVIEWS.filter((r) => r.approved) : INITIAL_REVIEWS;
  }

  public async saveReview(review: Omit<Review, 'id' | 'created_at'> & { id?: string }): Promise<Review> {
    const id = review.id || `rev-${Date.now()}`;
    const newRev: Review = {
      ...review,
      id,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('reviews').upsert(newRev);
      } catch (err) {
        console.warn('Supabase saveReview error:', err);
      }
    }

    const current = await this.getReviews(false);
    const existingIndex = current.findIndex((r) => r.id === id);
    let updated: Review[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = newRev;
    } else {
      updated = [newRev, ...current];
    }
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(updated));
    this.notify();
    return newRev;
  }

  public async setReviewApproval(id: string, approved: boolean): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('reviews').update({ approved }).eq('id', id);
      } catch (err) {
        console.warn('Supabase setReviewApproval error:', err);
      }
    }

    const current = await this.getReviews(false);
    const updated = current.map((r) => (r.id === id ? { ...r, approved } : r));
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(updated));
    this.notify();
  }

  public async deleteReview(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('reviews').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteReview error:', err);
      }
    }

    const current = await this.getReviews(false);
    const filtered = current.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(filtered));
    this.notify();
  }

  // --- Site Settings ---
  public async getSiteSettings(): Promise<SiteSettings> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
        if (!error && data) return data as SiteSettings;
      } catch (err) {
        console.warn('Supabase getSiteSettings error:', err);
      }
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_SETTINGS;
  }

  public async saveSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const current = await this.getSiteSettings();
    const merged: SiteSettings = {
      ...current,
      ...settings,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('site_settings').upsert(merged);
      } catch (err) {
        console.warn('Supabase saveSiteSettings error:', err);
      }
    }

    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
    this.notify();
    return merged;
  }

  // --- Image / Media Storage ---
  public async uploadMedia(file: File, folder = 'bakery-media'): Promise<string> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('bakery-images')
          .upload(fileName, file, { upsert: true });

        if (!uploadError) {
          const { data } = supabase.storage.from('bakery-images').getPublicUrl(fileName);
          if (data?.publicUrl) return data.publicUrl;
        }
      } catch (err) {
        console.warn('Supabase storage upload error, falling back to local file reader:', err);
      }
    }

    // Local data URL fallback
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // --- Authentication ---
  public async loginAdmin(password: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'admin@esteriabakery.ng',
          password,
        });
        if (!error && data?.session) {
          localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify({ email: 'admin@esteriabakery.ng', timestamp: Date.now() }));
          return true;
        }
      } catch {
        // Fallback to local hash verification
      }
    }

    // Hash verify: check if custom hash is stored or match default password "Esteriabakery"
    const inputHash = await hashPassword(password);
    const storedHash = localStorage.getItem(STORAGE_KEYS.ADMIN_HASH) || DEFAULT_PW_HASH;

    if (inputHash === storedHash || password === 'Esteriabakery') {
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify({ email: 'admin@esteriabakery.ng', timestamp: Date.now() }));
      return true;
    }
    return false;
  }

  public async changeAdminPassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const isOldValid = await this.loginAdmin(oldPassword);
    if (!isOldValid) {
      return { success: false, message: 'Current password is incorrect.' };
    }

    if (newPassword.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters.' };
    }

    const newHash = await hashPassword(newPassword);
    localStorage.setItem(STORAGE_KEYS.ADMIN_HASH, newHash);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.updateUser({ password: newPassword });
      } catch (err) {
        console.warn('Supabase updateUser password error:', err);
      }
    }

    return { success: true, message: 'Password updated successfully!' };
  }

  public isAdminAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const auth = localStorage.getItem(STORAGE_KEYS.AUTH);
      if (!auth) return false;
      const parsed = JSON.parse(auth);
      // Valid for 7 days
      return Date.now() - parsed.timestamp < 7 * 24 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  }

  public logoutAdmin(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    this.notify();
  }

  // --- WhatsApp URL Generator ---
  public generateWhatsAppUrl(order: Order, whatsappNumber = '2349158209566'): string {
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');

    const itemsText = order.items
      .map((it) => `• ${it.product_name} × ${it.quantity} (${formatNaira(it.subtotal)})`)
      .join('\n');

    const message = `Hello Esteria Bakery, I would like to place an order.

Customer Name: ${order.customer_name}
Phone: ${order.phone}
${order.whatsapp_number && order.whatsapp_number !== order.phone ? `WhatsApp: ${order.whatsapp_number}\n` : ''}Order Type: ${order.order_type === 'delivery' ? 'Delivery' : 'Store Pickup'}
${order.order_type === 'delivery' ? `Delivery Address: ${order.address || ''}, ${order.location || ''}, ${order.city || ''}\n` : ''}Preferred Date: ${order.preferred_date}
Preferred Time: ${order.preferred_time}

Order Items:
${itemsText}

Total: ${formatNaira(order.total_amount)}
Order ID: ${order.id}
${order.special_instructions ? `\nSpecial Instructions:\n${order.special_instructions}\n` : ''}
Thank you!`;

    const encoded = encodeURIComponent(message);
    return `https://wa.me/${cleanNumber}?text=${encoded}`;
  }
}

export const bakeryStore = new BakeryStore();
