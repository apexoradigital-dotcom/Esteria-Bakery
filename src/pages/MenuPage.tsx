import React, { useEffect, useState, useMemo } from 'react';
import { Product, Category } from '../types/bakery';
import { bakeryStore } from '../lib/bakeryStore';
import { ProductCard } from '../components/ProductCard';
import { Search, SlidersHorizontal, Sparkles, RefreshCw } from 'lucide-react';

export const MenuPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMenu = async () => {
    try {
      setLoading(true);
      setError(null);
      const [prods, cats] = await Promise.all([
        bakeryStore.getProducts(),
        bakeryStore.getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error(err);
      setError("We couldn't load the menu right now. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
    const unsub = bakeryStore.subscribe(() => {
      loadMenu();
    });
    return unsub;
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        item.category_id === selectedCategory ||
        item.category_name?.toLowerCase() === selectedCategory.toLowerCase();

      const matchesSearch =
        searchQuery.trim() === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAvailability = !showOnlyAvailable || item.is_available;

      return matchesCategory && matchesSearch && matchesAvailability;
    });
  }, [products, selectedCategory, searchQuery, showOnlyAvailable]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 pb-24">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest font-bold text-amber-800">
          Our Fresh Daily Offerings
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D1A12] leading-tight">
          Esteria Bakery Menu &amp; Pricing
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          From warm golden pastries and small chops platters to custom celebration cakes, browse our complete selection made fresh to order.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-950/10 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          
          {/* Instant Search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search meat pie, puff-puff, chocolate cake..."
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-stone-900"
            />
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center gap-2 text-xs font-medium text-stone-600 self-end md:self-auto">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showOnlyAvailable}
                onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </div>

        {/* Category Tabs (Segmented Buttons) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs font-semibold">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-[#2D1A12] shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            All Items ({products.length})
          </button>

          {categories.map((cat) => {
            const count = products.filter(
              (p) => p.category_id === cat.id || p.category_name?.toLowerCase() === cat.name.toLowerCase()
            ).length;
            const isSelected = selectedCategory === cat.id || selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-amber-500 text-[#2D1A12] shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200'
                }`}
              >
                {cat.name} {count > 0 ? `(${count})` : ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3">
          <p className="text-sm font-medium text-rose-800">{error}</p>
          <button
            onClick={loadMenu}
            className="py-2 px-4 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-80 bg-stone-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredProducts.length === 0 && (
        <div className="p-12 text-center bg-stone-50 rounded-3xl border border-stone-200 space-y-4 max-w-lg mx-auto">
          <Sparkles className="w-8 h-8 text-amber-600 mx-auto opacity-70" />
          <h3 className="font-serif text-xl font-bold text-[#2D1A12]">
            No matching items found
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            We couldn't find any pastries matching your current filter. Try resetting your search or viewing All Items.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setShowOnlyAvailable(false);
            }}
            className="py-2 px-5 bg-amber-500 text-[#2D1A12] font-semibold text-xs rounded-lg hover:bg-amber-400 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Product Cards: Grouped by Category when 'All', or filtered by active category */}
      {!loading && !error && filteredProducts.length > 0 && (
        <div className="space-y-16">
          {selectedCategory === 'all' && searchQuery.trim() === '' ? (
            // Grouped Category by Category: Cakes together, Pastries together, Finger Foods together, Small Chops together, Fresh Fruit Juice together
            categories.map((cat) => {
              const catItems = filteredProducts.filter(
                (p) => p.category_id === cat.id || p.category_name?.toLowerCase() === cat.name.toLowerCase()
              );
              if (catItems.length === 0) return null;

              return (
                <section key={cat.id} className="space-y-6">
                  <div className="flex items-baseline justify-between border-b border-amber-950/10 pb-3">
                    <div>
                      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1A12]">
                        {cat.name}
                      </h2>
                      {cat.description && (
                        <p className="text-xs text-stone-500 mt-1">{cat.description}</p>
                      )}
                    </div>
                    <span className="text-xs font-bold text-stone-400">
                      {catItems.length} {catItems.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {catItems.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </section>
              );
            })
          ) : (
            // Filtered category or search results
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
