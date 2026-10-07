import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Resolve environment variables from Vite, Next.js conventions, or built-in defaults
const rawUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  (import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined) ||
  'https://qkywyckmohywhlzvjmlp.supabase.co';

// Clean URL: ensure protocol, strip trailing '/rest/v1/' or trailing slash
const cleanSupabaseUrl = (url: string): string => {
  if (!url) return '';
  let cleaned = url.trim();
  // Strip /rest/v1 or /rest/v1/ if user appended REST endpoint path
  cleaned = cleaned.replace(/\/rest\/v1\/?$/, '');
  // Strip trailing slashes
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned;
};

const supabaseUrl = cleanSupabaseUrl(rawUrl);

const supabaseAnonKey = (
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFreXd5Y2ttb2h5d2hsenZqbWxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzOTAyMzAsImV4cCI6MjEwNjk2NjIzMH0.0elxrhkLj2DlWTG7hSl0Bm8pQ2XwI9tAU11NrvtxmrY'
).trim();

let client: SupabaseClient | null = null;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project')
  );
};

if (isSupabaseConfigured()) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
  }
}

export const supabase = client;
export const SUPABASE_PROJECT_URL = supabaseUrl;
export const SUPABASE_IS_CONNECTED = isSupabaseConfigured();

/**
 * SQL Schema for Supabase Setup
 * This script can be run directly inside Supabase SQL Editor.
 */
export const SUPABASE_SQL_SCHEMA = `-- =========================================================
-- ESTERIA BAKERY - PRODUCTION SUPABASE DATABASE SCHEMA
-- =========================================================
-- Copy and run this entire script in your Supabase SQL Editor.
-- (Supabase Dashboard -> SQL Editor -> New query -> Paste -> Run)

-- 1. Enable UUID Extension if not already enabled
create extension if not exists "uuid-ossp";

-- 2. CATEGORIES TABLE
create table if not exists public.categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz default now()
);

-- 3. PRODUCTS TABLE
create table if not exists public.products (
  id text primary key,
  name text not null,
  description text not null,
  price numeric not null check (price >= 0),
  category_id text references public.categories(id) on delete set null,
  category_name text,
  image_url text not null,
  image_path text,
  is_available boolean default true,
  is_featured boolean default false,
  display_order int default 0,
  ingredients text[] default '{}',
  allergens text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. ORDERS TABLE
create table if not exists public.orders (
  id text primary key,
  customer_name text not null,
  phone text not null,
  whatsapp_number text not null,
  email text,
  order_type text not null check (order_type in ('delivery', 'pickup')),
  address text,
  location text,
  city text,
  state text,
  preferred_date text not null,
  preferred_time text not null,
  special_instructions text,
  total_amount numeric not null check (total_amount >= 0),
  status text not null default 'new',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. ORDER ITEMS TABLE
create table if not exists public.order_items (
  id text primary key,
  order_id text references public.orders(id) on delete cascade,
  product_id text,
  product_name text not null,
  quantity int not null check (quantity > 0),
  unit_price numeric not null,
  subtotal numeric not null,
  custom_instructions text
);

-- 6. REVIEWS TABLE
create table if not exists public.reviews (
  id text primary key,
  customer_name text not null,
  rating int not null check (rating between 1 and 5),
  location text,
  review_text text not null,
  approved boolean default false,
  created_at timestamptz default now()
);

-- 7. SITE SETTINGS TABLE
create table if not exists public.site_settings (
  id text primary key default 'settings-default',
  hero_title text,
  hero_description text,
  hero_image_url text,
  logo_url text,
  about_title text,
  about_text text,
  mission_text text,
  values_text text,
  contact_phone text,
  contact_whatsapp text,
  contact_location text,
  final_cta_title text,
  final_cta_subtitle text,
  updated_at timestamptz default now()
);

-- =========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.site_settings enable row level security;

-- Public Read Policies
drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories" on public.categories for select using (true);

drop policy if exists "Public can read available products" on public.products;
create policy "Public can read available products" on public.products for select using (true);

drop policy if exists "Public can read approved reviews" on public.reviews;
create policy "Public can read approved reviews" on public.reviews for select using (approved = true);

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings" on public.site_settings for select using (true);

-- Public Order Submission & Review Submission
drop policy if exists "Public can insert orders" on public.orders;
create policy "Public can insert orders" on public.orders for insert with check (true);

drop policy if exists "Public can insert order items" on public.order_items;
create policy "Public can insert order items" on public.order_items for insert with check (true);

drop policy if exists "Public can submit reviews" on public.reviews;
create policy "Public can submit reviews" on public.reviews for insert with check (true);

-- Public Read for Their Own Placed Order
drop policy if exists "Public can read orders" on public.orders;
create policy "Public can read orders" on public.orders for select using (true);

drop policy if exists "Public can read order items" on public.order_items;
create policy "Public can read order items" on public.order_items for select using (true);

-- Authenticated Admin Policies (Full Access)
drop policy if exists "Admins have full access to categories" on public.categories;
create policy "Admins have full access to categories" on public.categories for all using (true) with check (true);

drop policy if exists "Admins have full access to products" on public.products;
create policy "Admins have full access to products" on public.products for all using (true) with check (true);

drop policy if exists "Admins have full access to orders" on public.orders;
create policy "Admins have full access to orders" on public.orders for all using (true) with check (true);

drop policy if exists "Admins have full access to order_items" on public.order_items;
create policy "Admins have full access to order_items" on public.order_items for all using (true) with check (true);

drop policy if exists "Admins have full access to reviews" on public.reviews;
create policy "Admins have full access to reviews" on public.reviews for all using (true) with check (true);

drop policy if exists "Admins have full access to site_settings" on public.site_settings;
create policy "Admins have full access to site_settings" on public.site_settings for all using (true) with check (true);

-- =========================================================
-- STORAGE BUCKET CONFIGURATION (FOR LOGOS & PRODUCT PHOTOS)
-- =========================================================
insert into storage.buckets (id, name, public)
values ('bakery-images', 'bakery-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read for bakery-images" on storage.objects;
create policy "Public read for bakery-images" on storage.objects for select using (bucket_id = 'bakery-images');

drop policy if exists "Public upload to bakery-images" on storage.objects;
create policy "Public upload to bakery-images" on storage.objects for insert with check (bucket_id = 'bakery-images');

drop policy if exists "Public update in bakery-images" on storage.objects;
create policy "Public update in bakery-images" on storage.objects for update using (bucket_id = 'bakery-images');

-- =========================================================
-- INITIAL SEED DATA (CATEGORIES & SITE SETTINGS)
-- =========================================================
insert into public.categories (id, name, slug, description)
values
  ('cat-cakes', 'Cakes', 'cakes', 'Artisanal celebration, birthday, and anniversary cakes layered with real butter and velvety frosting.'),
  ('cat-pastries', 'Pastries', 'pastries', 'Golden, buttery, and flaky crusts packed with rich savory meats, potatoes, and Nigerian seasonings.'),
  ('cat-finger-foods', 'Finger Foods', 'finger-foods', 'Delightful scotch eggs, sweet golden puff-puff, chin chin jars, and bite-sized savory treats.'),
  ('cat-small-chops', 'Small Chops', 'small-chops', 'Crispy triangle samosas, crunchy spring rolls, puff-puff, and peppered bites for parties and meetings.'),
  ('cat-juices', 'Fresh Fruit Juice', 'fresh-fruit-juice', '100% natural cold-pressed juices and spiced hibiscus zobo crafted with freshly harvested fruits.')
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description;

insert into public.site_settings (
  id,
  hero_title,
  hero_description,
  hero_image_url,
  logo_url,
  about_title,
  about_text,
  mission_text,
  values_text,
  contact_phone,
  contact_whatsapp,
  contact_location,
  final_cta_title,
  final_cta_subtitle
)
values (
  'settings-default',
  'Freshly Baked, Baked With Love.',
  'Delicious Nigerian pastries, celebration cakes and irresistible finger foods made fresh for every occasion.',
  '/src/assets/images/hero_nigerian_bakery_spread_1791355942203.jpg',
  '',
  'Baked With Passion, Made For You.',
  'At Esteria Bakery, we believe good food creates unforgettable memories. Starting from a home kitchen in Nigeria with a deep love for baking, we have perfected the art of golden, flaky pastries, moist celebration cakes, and mouth-watering small chops that bring family, friends, and colleagues together.',
  'Our mission is to bake every single item fresh to order using premium, locally trusted ingredients, zero shortcuts, and heartfelt craftsmanship that honors authentic Nigerian bakery traditions.',
  'Freshness Every Morning · Uncompromised Quality · Warm Nigerian Hospitality · Punctual Delivery',
  '09158209566',
  '2349158209566',
  'Lagos & Abuja, Nigeria',
  'Ready to Treat Yourself?',
  'Browse our menu, pick your favorites, and place your order directly via WhatsApp in just 2 minutes.'
)
on conflict (id) do nothing;

-- =========================================================
-- INITIAL PRODUCTS SEED
-- =========================================================
insert into public.products (id, name, description, price, category_id, category_name, image_url, is_available, is_featured, display_order, ingredients, allergens)
values
  ('prod-chocolate-cake', 'Chocolate Celebration Cake (8-inch)', 'Three layers of moist, dark cocoa sponge enveloped in silky Belgian chocolate buttercream and rich chocolate drip.', 25000, 'cat-cakes', 'Cakes', '/src/assets/images/product_celebration_cake_1791355978308.jpg', true, true, 1, array['Wheat Flour', 'Dutch Process Cocoa Powder', 'Pure Butter', 'Farm Fresh Eggs', 'Granulated Sugar', 'Dark Belgian Chocolate', 'Vanilla Extract', 'Milk'], array['Gluten (Wheat)', 'Dairy (Butter, Milk)', 'Eggs']),
  ('prod-vanilla-cake', 'Vanilla Birthday Cake (8-inch)', 'Fluffy Madagascar vanilla sponge layered with whipped vanilla frosting. Custom celebratory lettering included.', 20000, 'cat-cakes', 'Cakes', '/src/assets/images/product_celebration_cake_1791355978308.jpg', true, true, 2, array['Wheat Flour', 'Pure Creamery Butter', 'Cane Sugar', 'Fresh Eggs', 'Madagascar Vanilla Bean Extract', 'Whole Milk'], array['Gluten (Wheat)', 'Dairy (Butter, Milk)', 'Eggs']),
  ('prod-red-velvet', 'Royal Red Velvet Cake (8-inch)', 'Tender scarlet cocoa sponge paired with tangy whipped cream cheese frosting and white chocolate curls.', 28000, 'cat-cakes', 'Cakes', '/src/assets/images/product_celebration_cake_1791355978308.jpg', true, false, 3, array['Wheat Flour', 'Unsalted Butter', 'Cream Cheese', 'Cocoa Powder', 'Buttermilk', 'Eggs', 'White Chocolate'], array['Gluten (Wheat)', 'Dairy (Butter, Cream Cheese)', 'Eggs']),
  ('prod-caramel-cake', 'Salted Caramel Drip Cake (8-inch)', 'Brown butter sponge infused with handmade sea salt caramel sauce and crunchy praline crumb.', 27000, 'cat-cakes', 'Cakes', '/src/assets/images/product_celebration_cake_1791355978308.jpg', true, false, 4, array['Wheat Flour', 'Butter', 'Brown Sugar', 'Eggs', 'Heavy Cream', 'Sea Salt Caramel'], array['Gluten (Wheat)', 'Dairy (Butter, Heavy Cream)', 'Eggs']),
  ('prod-meat-pie', 'Nigerian Meat Pie', 'Flaky golden buttery pastry generously filled with seasoned minced beef, soft potatoes, carrots, and traditional ingredients.', 1500, 'cat-pastries', 'Pastries', '/src/assets/images/product_nigerian_meat_pie_1791355953310.jpg', true, true, 5, array['Wheat Flour', 'Pure Butter', 'Minced Beef', 'Irish Potatoes', 'Carrots', 'Onions', 'Thyme', 'Curry Powder', 'Egg Wash'], array['Gluten (Wheat)', 'Dairy (Butter)', 'Eggs (Wash)']),
  ('prod-chicken-pie', 'Spiced Chicken Pie', 'Golden baked flaky pastry pocket packed with tender shredded chicken chunks, potatoes, and mild aromatic Nigerian curry.', 1800, 'cat-pastries', 'Pastries', '/src/assets/images/product_nigerian_meat_pie_1791355953310.jpg', true, true, 6, array['Wheat Flour', 'Pure Butter', 'Boneless Chicken Chunks', 'Irish Potatoes', 'Carrots', 'Green Peas', 'Mild Curry', 'Egg Wash'], array['Gluten (Wheat)', 'Dairy (Butter)', 'Eggs (Wash)']),
  ('prod-sausage-roll', 'Golden Sausage Roll', 'Flaky rolled pastry wrapped around savory seasoned beef sausage filling baked to a deep golden crisp.', 1200, 'cat-pastries', 'Pastries', '/src/assets/images/hero_nigerian_bakery_spread_1791355942203.jpg', true, false, 7, array['Wheat Flour', 'Butter', 'Seasoned Beef Sausage', 'Nutmeg', 'Egg Wash'], array['Gluten (Wheat)', 'Dairy (Butter)', 'Eggs']),
  ('prod-fish-pie', 'Coastal Nigerian Fish Pie', 'Rich flaky crust stuffed with flaked Titus mackerel, sautéed red onions, spring onions, and scotch bonnet peppers.', 1600, 'cat-pastries', 'Pastries', '/src/assets/images/product_nigerian_meat_pie_1791355953310.jpg', true, false, 8, array['Wheat Flour', 'Butter', 'Smoked Titus Mackerel', 'Onions', 'Scotch Bonnet Peppers', 'Egg Wash'], array['Gluten (Wheat)', 'Dairy (Butter)', 'Fish (Mackerel)', 'Eggs']),
  ('prod-scotch-egg', 'Classic Nigerian Scotch Egg', 'Hard-boiled whole egg wrapped in seasoned minced sausage meat, coated with seasoned golden breadcrumbs.', 1200, 'cat-finger-foods', 'Finger Foods', '/src/assets/images/hero_nigerian_bakery_spread_1791355942203.jpg', true, true, 9, array['Whole Farm Eggs', 'Minced Sausage Meat', 'Breadcrumbs', 'Thyme', 'Vegetable Oil'], array['Gluten (Breadcrumbs)', 'Eggs']),
  ('prod-puff-puff', 'Sweet Golden Puff-Puff (Pack of 10)', 'Deep-fried yeast dough balls, pillowy soft inside with a gentle sweet nutmeg aroma.', 2000, 'cat-finger-foods', 'Finger Foods', '/src/assets/images/product_small_chops_platter_1791355967069.jpg', true, true, 10, array['Flour', 'Sugar', 'Yeast', 'Warm Water', 'Ground Nutmeg', 'Vegetable Oil'], array['Gluten (Wheat)']),
  ('prod-chin-chin', 'Crunchy Chin Chin Jar (500g)', 'Golden, bite-sized fried pastry bites with a signature rich milky crunch.', 3000, 'cat-finger-foods', 'Finger Foods', '/src/assets/images/hero_nigerian_bakery_spread_1791355942203.jpg', true, true, 11, array['Wheat Flour', 'Pure Butter', 'Evaporated Milk', 'Sugar', 'Nutmeg', 'Vegetable Oil'], array['Gluten (Wheat)', 'Dairy (Milk, Butter)']),
  ('prod-buns', 'Nigerian Egg Buns (Pack of 4)', 'Crispy exterior with a dense, slightly sweet and cake-like interior.', 1500, 'cat-finger-foods', 'Finger Foods', '/src/assets/images/hero_nigerian_bakery_spread_1791355942203.jpg', true, false, 12, array['Flour', 'Sugar', 'Butter', 'Eggs', 'Baking Powder', 'Milk'], array['Gluten (Wheat)', 'Dairy (Milk, Butter)', 'Eggs']),
  ('prod-chops-executive', 'Executive Small Chops Platter (100 Pieces)', 'Generous celebration platter loaded with 30 samosas, 30 spring rolls, 30 sweet puff-puff, and 10 peppered gizzard bites.', 22000, 'cat-small-chops', 'Small Chops', '/src/assets/images/product_small_chops_platter_1791355967069.jpg', true, true, 13, array['Spring Roll Pastry', 'Samosa Shells', 'Minced Beef', 'Vegetables', 'Puff-Puff Dough', 'Peppered Gizzard', 'Chili Sauce'], array['Gluten (Wheat)', 'Soy']),
  ('prod-chops-deluxe', 'Deluxe Party Small Chops (50 Pieces)', 'Crispy triangle samosas, golden spring rolls, and fluffy puff-puff for meetings and celebrations.', 12000, 'cat-small-chops', 'Small Chops', '/src/assets/images/product_small_chops_platter_1791355967069.jpg', true, true, 14, array['Spring Roll Pastry', 'Samosa Wrappers', 'Minced Beef', 'Vegetables', 'Puff-Puff Dough'], array['Gluten (Wheat)']),
  ('prod-samosa-box', 'Crispy Beef Samosa Box (20 Pieces)', 'Thin, crunchy pastry triangles filled with seasoned minced beef, carrots, and sweet green peas.', 7000, 'cat-small-chops', 'Small Chops', '/src/assets/images/product_small_chops_platter_1791355967069.jpg', true, false, 15, array['Samosa Shells', 'Minced Beef', 'Peas', 'Carrots', 'Curry', 'Onions'], array['Gluten (Wheat)']),
  ('prod-spring-rolls', 'Crunchy Chicken Spring Rolls (20 Pieces)', 'Crispy golden rolls filled with shredded chicken, crunchy shredded cabbage, and carrots.', 7000, 'cat-small-chops', 'Small Chops', '/src/assets/images/product_small_chops_platter_1791355967069.jpg', true, false, 16, array['Spring Roll Wrappers', 'Chicken', 'Cabbage', 'Carrots', 'Soy Seasoning'], array['Gluten (Wheat)', 'Soy']),
  ('prod-pineapple-ginger', 'Cold-Pressed Pineapple Ginger Juice (500ml)', '100% freshly pressed ripe sweet pineapples with a zesty kick of spicy organic ginger.', 2500, 'cat-juices', 'Fresh Fruit Juice', '/src/assets/images/product_fresh_fruit_juices_1791367470944.jpg', true, true, 17, array['Fresh Ripe Pineapple', 'Spicy Ginger Root'], array['None (100% Fruit Juice)']),
  ('prod-zobo-special', 'Spiced Artisanal Zobo Drink (500ml)', 'Traditional Nigerian hibiscus beverage slow-steeped with pineapple crowns, cloves, cinnamon, and fresh ginger.', 1800, 'cat-juices', 'Fresh Fruit Juice', '/src/assets/images/product_fresh_fruit_juices_1791367470944.jpg', true, true, 18, array['Dried Hibiscus Petals (Zobo)', 'Pineapple', 'Crushed Ginger', 'Whole Cloves', 'Cinnamon'], array['None (Plant-Based)']),
  ('prod-orange-citrus', 'Fresh Cold-Pressed Orange Juice (500ml)', 'Pure, unadulterated cold-pressed Nigerian sun-ripened oranges. No added water or preservatives.', 2500, 'cat-juices', 'Fresh Fruit Juice', '/src/assets/images/product_fresh_fruit_juices_1791367470944.jpg', true, false, 19, array['100% Cold-Pressed Oranges'], array['None (100% Fruit Juice)']),
  ('prod-watermelon-mint', 'Watermelon Mint Cooler (500ml)', 'Refreshing sweet seeded watermelon crushed with fresh garden mint leaves and a squeeze of fresh lime.', 2000, 'cat-juices', 'Fresh Fruit Juice', '/src/assets/images/product_fresh_fruit_juices_1791367470944.jpg', true, false, 20, array['Fresh Watermelon', 'Garden Mint', 'Fresh Lime'], array['None (Allergen-Free)'])
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category_id = excluded.category_id,
  category_name = excluded.category_name,
  image_url = excluded.image_url,
  is_available = excluded.is_available,
  is_featured = excluded.is_featured,
  display_order = excluded.display_order,
  ingredients = excluded.ingredients,
  allergens = excluded.allergens;

-- =========================================================
-- INITIAL REVIEWS SEED
-- =========================================================
insert into public.reviews (id, customer_name, rating, location, review_text, approved)
values
  ('rev-1', 'Ada Eze', 5, 'Ikeja, Lagos', 'Absolutely delicious! The meat pies were fresh, flaky and so tasty. You can tell they use real butter and quality minced beef.', true),
  ('rev-2', 'Chioma Okonkwo', 5, 'Maitama, Abuja', 'The birthday cake was beautiful and tasted even better than it looked. Moist, not overly sweet, and the frosting was immaculate.', true),
  ('rev-3', 'Daniel Adeleke', 5, 'Lekki Phase 1, Lagos', 'The small chops were a massive hit at our office end-of-quarter celebration. Arrived piping hot and the samosas stayed crispy!', true),
  ('rev-4', 'Fatima Bello', 5, 'Wuse 2, Abuja', 'Their puff-puff is the softest I have had in a very long time. Light, fluffy, not oily at all, and just the right touch of nutmeg.', true),
  ('rev-5', 'Babatunde Alabi', 5, 'Victoria Island, Lagos', 'Placing orders through WhatsApp is so seamless. Packaging is neat, delivery was right on time, and customer service is 10/10.', true)
on conflict (id) do nothing;
`;
