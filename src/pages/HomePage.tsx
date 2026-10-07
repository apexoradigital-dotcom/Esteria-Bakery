import React, { useEffect, useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { Product, Category, Review, SiteSettings } from '../types/bakery';
import { bakeryStore } from '../lib/bakeryStore';
import { ProductCard } from '../components/ProductCard';
import {
  Sparkles,
  Heart,
  Clock,
  Award,
  ArrowRight,
  Star,
  Quote,
  CheckCircle2,
  Calendar,
  PartyPopper,
  Briefcase,
  Cake,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { navigate } = useNavigation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [allProds, allCats, allRevs, siteSet] = await Promise.all([
          bakeryStore.getProducts(),
          bakeryStore.getCategories(),
          bakeryStore.getReviews(true),
          bakeryStore.getSiteSettings(),
        ]);
        setProducts(allProds);
        setCategories(allCats);
        setReviews(allRevs.slice(0, 3));
        setSettings(siteSet);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const unsub = bakeryStore.subscribe(loadData);
    return unsub;
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/60 via-amber-50/20 to-white pt-8 pb-16 md:py-20 border-b border-amber-950/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headline & Action */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-100/90 text-amber-950 rounded-md text-xs font-bold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>SAVOUR THE FLAVOUR IN EVERY BITE...</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#2D1A12] leading-[1.15] text-balance">
                Freshly Baked, Baked With Love.
              </h1>

              <p className="text-base sm:text-lg text-[#55382B] leading-relaxed max-w-2xl">
                {settings?.hero_description ||
                  'Delicious Nigerian pastries, custom celebration cakes, and irresistible small chops made fresh daily for birthdays, office meetings, and everyday indulgence.'}
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  onClick={() => navigate('/menu')}
                  className="py-3.5 px-8 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#2D1A12] font-bold text-sm tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2.5"
                >
                  <span>Explore Our Menu</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Trust markers */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-stone-600 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Fresh Morning Baking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Real Butter &amp; Premium Ingredients</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Same-Day WhatsApp Confirmations</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Asset with movement */}
            <div className="lg:col-span-5 relative">
              {/* Warm decorative glow behind frame */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-amber-400/25 via-amber-200/35 to-amber-500/15 rounded-[2.5rem] blur-xl opacity-75 pointer-events-none" />

              <div className="animate-hero-float relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-amber-100">
                <img
                  src={
                    settings?.hero_image_url ||
                    '/src/assets/images/hero_nigerian_bakery_spread_1791355942203.jpg'
                  }
                  alt="Freshly baked Nigerian meat pies, cakes and pastries by Esteria Bakery"
                  className="animate-hero-kenburns w-full h-80 sm:h-96 lg:h-[460px] object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      '/src/assets/images/product_nigerian_meat_pie_1791355953310.jpg';
                  }}
                />

                {/* Floating badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-amber-950/10 shadow-lg flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold tracking-wider uppercase text-amber-800 block">
                      Daily Special
                    </span>
                    <span className="font-serif text-base font-bold text-[#2D1A12]">
                      Golden Flaky Meat Pies &amp; Puff-Puff
                    </span>
                  </div>
                  <button
                    onClick={() => navigate('/menu')}
                    className="text-xs font-bold text-amber-700 hover:text-amber-900 underline flex items-center gap-1"
                  >
                    View All
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. WELCOME / BRAND INTRO */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="text-xs uppercase tracking-widest font-bold text-amber-800">
          Welcome to Esteria Bakery
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2D1A12] leading-tight text-balance">
          Baking Nigerian favorites with authentic recipes, rich ingredients, and pure dedication.
        </h2>
        <p className="text-stone-600 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
          At Esteria Bakery, we create delicious pastries, beautiful cakes, and irresistible finger foods made to bring people together. Whether you are hosting an intimate family brunch, stocking office tea-breaks, or celebrating milestone birthdays, every item is baked fresh for your table.
        </p>
      </section>

      {/* 3. POPULAR TREATS (4 SAMPLES FROM EACH PRODUCT CATEGORY) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-amber-950/10 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Customer Favorites
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1A12] mt-1">
              Popular Treats
            </h2>
          </div>
          <button
            onClick={() => navigate('/menu')}
            className="text-sm font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <span>View Full Menu &amp; Categories</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 bg-stone-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-14">
            {categories.map((category) => {
              const categoryProducts = products
                .filter(
                  (p) =>
                    p.category_id === category.id ||
                    p.category_name?.toLowerCase() === category.name.toLowerCase()
                )
                .slice(0, 4); // 4 samples from each product category

              if (categoryProducts.length === 0) return null;

              return (
                <div key={category.id} className="space-y-5">
                  <div className="flex items-baseline justify-between border-b border-stone-100 pb-3">
                    <div>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2D1A12]">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-xs text-stone-500 mt-0.5">{category.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => navigate('/menu')}
                      className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 shrink-0"
                    >
                      <span>Explore all {category.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categoryProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. WHY CHOOSE ESTERIA BAKERY */}
      <section className="bg-amber-50/40 border-y border-amber-950/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-widest font-bold text-amber-800">
              Our Promise
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#2D1A12]">
              Why Choose Esteria Bakery?
            </h2>
            <p className="text-stone-600 text-sm">
              We never compromise on the flavor, warmth, and quality that Nigerians love.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-amber-950/10 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#2D1A12]">
                Freshly Made Daily
              </h3>
              <p className="text-stone-600 text-xs leading-relaxed">
                Baked in small batches every morning. We do not store stale pastries or reheat old bakes.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-amber-950/10 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#2D1A12]">
                Quality Ingredients
              </h3>
              <p className="text-stone-600 text-xs leading-relaxed">
                Real butter, savory seasoned minced meats, pure vanilla, and wholesome baking.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-amber-950/10 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#2D1A12]">
                Beautifully Presented
              </h3>
              <p className="text-stone-600 text-xs leading-relaxed">
                Neat catering platters, custom cake inscriptions, and premium pastry boxes ready to serve.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-amber-950/10 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#2D1A12]">
                Made For Every Occasion
              </h3>
              <p className="text-stone-600 text-xs leading-relaxed">
                From single meat pie cravings to 200-pack event small chops and 3-tier celebration cakes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. OCCASIONS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-widest font-bold text-amber-800">
            Catering &amp; Celebrations
          </span>
          <h2 className="font-serif text-3xl font-bold text-[#2D1A12]">
            Baked For Every Nigerian Occasion
          </h2>
          <p className="text-stone-600 text-sm">
            Whatever the gathering, we bring warm Nigerian bakery joy straight to your guests.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl border border-amber-950/10 bg-white hover:border-amber-500/40 transition-colors space-y-3">
            <Cake className="w-6 h-6 text-amber-700" />
            <h3 className="font-serif font-bold text-base text-[#2D1A12]">
              Birthdays &amp; Anniversaries
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Custom tiered birthday cakes and cupcakes made with personalized messages.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-amber-950/10 bg-white hover:border-amber-500/40 transition-colors space-y-3">
            <PartyPopper className="w-6 h-6 text-amber-700" />
            <h3 className="font-serif font-bold text-base text-[#2D1A12]">
              Parties &amp; Small Chops Trays
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Deluxe 50 and 100-piece platters of crispy samosas, spring rolls, puff-puff, and peppered bites.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-amber-950/10 bg-white hover:border-amber-500/40 transition-colors space-y-3">
            <Briefcase className="w-6 h-6 text-amber-700" />
            <h3 className="font-serif font-bold text-base text-[#2D1A12]">
              Corporate &amp; Board Meetings
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Neatly packaged executive meat pie and sausage roll boxes for conferences, training, and office breaks.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-amber-950/10 bg-white hover:border-amber-500/40 transition-colors space-y-3">
            <Calendar className="w-6 h-6 text-amber-700" />
            <h3 className="font-serif font-bold text-base text-[#2D1A12]">
              Weddings &amp; Traditional Events
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Large quantity pastry supply and celebration dessert tables coordinated directly with your event planner.
            </p>
          </div>
        </div>
      </section>

      {/* 6. CUSTOMER REVIEWS PREVIEW */}
      <section className="bg-stone-50/70 border-y border-stone-200/60 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest font-bold text-amber-800">
                Real Testimonials
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1A12] mt-1">
                Loved by Food Lovers Across Nigeria
              </h2>
            </div>
            <button
              onClick={() => navigate('/reviews')}
              className="text-sm font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <span>Read All Customer Reviews</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-amber-200" />
                  <p className="text-stone-700 text-sm leading-relaxed italic">
                    "{rev.review_text}"
                  </p>
                </div>
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="font-serif font-bold text-[#2D1A12]">
                    — {rev.customer_name}
                  </span>
                  {rev.location && (
                    <span className="text-stone-400">{rev.location}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#2D1A12] rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
              {settings?.final_cta_title || 'Ready to Treat Yourself?'}
            </h2>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              {settings?.final_cta_subtitle ||
                'Browse our menu, customize your order, and chat with our bakery team on WhatsApp for prompt delivery.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => navigate('/order')}
              className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#2D1A12] font-bold text-sm tracking-wide transition-all shadow-md"
            >
              Order on WhatsApp
            </button>
            <button
              onClick={() => navigate('/menu')}
              className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-colors"
            >
              View Full Menu
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
