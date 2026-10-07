import React, { useState, useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import {
  Product,
  Category,
  Order,
  OrderStatus,
  Review,
  SiteSettings,
} from '../types/bakery';
import { bakeryStore, formatNaira } from '../lib/bakeryStore';
import { isSupabaseConfigured, SUPABASE_SQL_SCHEMA, SUPABASE_PROJECT_URL } from '../lib/supabase';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Star,
  FileText,
  Image as ImageIcon,
  Settings as SettingsIcon,
  LogOut,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Upload,
  MessageCircle,
  Search,
  ExternalLink,
  Shield,
  Key,
  Check,
  AlertCircle,
  Save,
} from 'lucide-react';

type AdminTab =
  | 'overview'
  | 'products'
  | 'categories'
  | 'orders'
  | 'reviews'
  | 'content'
  | 'logo'
  | 'settings';

export const AdminDashboard: React.FC = () => {
  const { navigate } = useNavigation();

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    bakeryStore.isAdminAuthenticated()
  );
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Data collections
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Toast / notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshAllData = async () => {
    setLoading(true);
    try {
      const [prods, cats, ords, revs, sett] = await Promise.all([
        bakeryStore.getProducts(),
        bakeryStore.getCategories(),
        bakeryStore.getOrders(),
        bakeryStore.getReviews(false),
        bakeryStore.getSiteSettings(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setOrders(ords);
      setReviews(revs);
      setSettings(sett);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshAllData();
      const unsub = bakeryStore.subscribe(refreshAllData);
      return unsub;
    }
  }, [isAuthenticated]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    const ok = await bakeryStore.loginAdmin(loginPassword);
    setLoginLoading(false);
    if (ok) {
      setIsAuthenticated(true);
      setLoginPassword('');
    } else {
      setLoginError('Invalid administrator password. Please try again.');
    }
  };

  const handleLogout = () => {
    bakeryStore.logoutAdmin();
    setIsAuthenticated(false);
  };

  // -------------------------------------------------------------
  // PRODUCTS MANAGEMENT STATE & ACTIONS
  // -------------------------------------------------------------
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // Form fields for product
  const [pName, setPName] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pPrice, setPPrice] = useState<number>(1500);
  const [pCategory, setPCategory] = useState('');
  const [pImageUrl, setPImageUrl] = useState('');
  const [pAvailable, setPAvailable] = useState(true);
  const [pFeatured, setPFeatured] = useState(false);
  const [pOrder, setPOrder] = useState<number>(1);
  const [uploadingImage, setUploadingImage] = useState(false);

  const openNewProductForm = () => {
    setEditingProduct(null);
    setPName('');
    setPDesc('');
    setPPrice(1500);
    setPCategory(categories[0]?.id || 'cat-pastries');
    setPImageUrl('/src/assets/images/hero_nigerian_bakery_spread_1791355942203.jpg');
    setPAvailable(true);
    setPFeatured(false);
    setPOrder(products.length + 1);
    setIsAddingProduct(true);
  };

  const openEditProductForm = (prod: Product) => {
    setEditingProduct(prod);
    setPName(prod.name);
    setPDesc(prod.description);
    setPPrice(prod.price);
    setPCategory(prod.category_id);
    setPImageUrl(prod.image_url);
    setPAvailable(prod.is_available);
    setPFeatured(prod.is_featured);
    setPOrder(prod.display_order);
    setIsAddingProduct(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) return;

    const catObj = categories.find((c) => c.id === pCategory);

    await bakeryStore.saveProduct({
      id: editingProduct?.id,
      name: pName.trim(),
      description: pDesc.trim(),
      price: Number(pPrice) || 0,
      category_id: pCategory,
      category_name: catObj?.name || 'Pastry',
      image_url: pImageUrl,
      is_available: pAvailable,
      is_featured: pFeatured,
      display_order: Number(pOrder) || 1,
    });

    setIsAddingProduct(false);
    setEditingProduct(null);
    showToast(editingProduct ? 'Product updated successfully!' : 'New product created!');
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      await bakeryStore.deleteProduct(id);
      showToast('Product removed.');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const url = await bakeryStore.uploadMedia(file, 'products');
      setPImageUrl(url);
      showToast('Image uploaded!');
    } catch {
      alert('Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  // -------------------------------------------------------------
  // CATEGORIES MANAGEMENT
  // -------------------------------------------------------------
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    await bakeryStore.saveCategory({
      name: newCatName.trim(),
      slug: newCatName.trim().toLowerCase().replace(/\s+/g, '-'),
      description: newCatDesc.trim() || undefined,
    });

    setNewCatName('');
    setNewCatDesc('');
    showToast('Category created!');
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (confirm(`Delete category "${name}"? Products in this category will become uncategorized.`)) {
      await bakeryStore.deleteCategory(id);
      showToast('Category deleted.');
    }
  };

  // -------------------------------------------------------------
  // ORDERS MANAGEMENT
  // -------------------------------------------------------------
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await bakeryStore.updateOrderStatus(orderId, status);
    showToast(`Order #${orderId} marked as ${status}`);
  };

  // -------------------------------------------------------------
  // REVIEWS MANAGEMENT
  // -------------------------------------------------------------
  const handleToggleReviewApproval = async (reviewId: string, current: boolean) => {
    await bakeryStore.setReviewApproval(reviewId, !current);
    showToast(!current ? 'Review approved and published!' : 'Review hidden from public.');
  };

  const handleDeleteReview = async (id: string) => {
    if (confirm('Delete this customer review?')) {
      await bakeryStore.deleteReview(id);
      showToast('Review removed.');
    }
  };

  // -------------------------------------------------------------
  // WEBSITE CONTENT SETTINGS
  // -------------------------------------------------------------
  const [contentForm, setContentForm] = useState<Partial<SiteSettings>>({});

  useEffect(() => {
    if (settings) {
      setContentForm({
        hero_title: settings.hero_title,
        hero_description: settings.hero_description,
        hero_image_url: settings.hero_image_url,
        about_title: settings.about_title,
        about_text: settings.about_text,
        mission_text: settings.mission_text,
        values_text: settings.values_text,
        final_cta_title: settings.final_cta_title,
        final_cta_subtitle: settings.final_cta_subtitle,
      });
    }
  }, [settings]);

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    await bakeryStore.saveSiteSettings(contentForm);
    showToast('Website content updated successfully!');
  };

  // -------------------------------------------------------------
  // LOGO MANAGEMENT
  // -------------------------------------------------------------
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUrlInput, setLogoUrlInput] = useState('');

  useEffect(() => {
    if (settings?.logo_url) {
      setLogoUrlInput(settings.logo_url);
    }
  }, [settings?.logo_url]);

  const handleSaveLogoUrl = async () => {
    if (!logoUrlInput.trim()) return;
    await bakeryStore.saveSiteSettings({ logo_url: logoUrlInput.trim() });
    showToast('Bakery logo URL saved!');
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLogoUploading(true);
      const url = await bakeryStore.uploadMedia(file, 'brand-logo');
      await bakeryStore.saveSiteSettings({ logo_url: url });
      setLogoUrlInput(url);
      showToast('Bakery logo updated and active!');
    } catch {
      alert('Failed to upload logo.');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (confirm('Remove custom logo and restore the default Esteria Bakery wordmark?')) {
      await bakeryStore.saveSiteSettings({ logo_url: '' });
      setLogoUrlInput('');
      showToast('Logo removed.');
    }
  };

  // -------------------------------------------------------------
  // SETTINGS: PASSWORD CHANGE
  // -------------------------------------------------------------
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwChangeStatus, setPwChangeStatus] = useState<string | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwChangeStatus(null);
    const res = await bakeryStore.changeAdminPassword(oldPassword, newPassword);
    if (res.success) {
      setOldPassword('');
      setNewPassword('');
      setPwChangeStatus('Password successfully updated!');
      showToast('Password changed!');
    } else {
      setPwChangeStatus(res.message);
    }
  };

  // -------------------------------------------------------------
  // LOGIN SCREEN (If not authenticated)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-amber-950/10 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-[#2D1A12] font-serif font-bold text-2xl flex items-center justify-center mx-auto shadow-xs">
              E
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#2D1A12]">
              Esteria Bakery Admin
            </h1>
            <p className="text-xs text-stone-500">
              Sign in to manage products, categories, orders, reviews, and website branding.
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#452A1E] mb-1">
                Admin Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-[#2D1A12] font-bold text-sm rounded-xl transition-colors shadow-xs"
            >
              {loginLoading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-xs text-stone-500 hover:text-stone-800 transition-colors"
            >
              &larr; Back to Esteria Bakery Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED DASHBOARD
  // -------------------------------------------------------------
  const pendingOrders = orders.filter((o) => o.status === 'new' || o.status === 'confirmed');
  const availableCount = products.filter((p) => p.is_available).length;

  return (
    <div className="min-h-screen bg-stone-100/60 pb-20">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-xl text-xs font-semibold shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom duration-200">
          <CheckCircle className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner / Breadcrumb */}
      <div className="bg-white border-b border-stone-200 px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500 text-[#2D1A12] font-serif font-bold text-lg flex items-center justify-center">
            E
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold text-[#2D1A12] flex items-center gap-2">
              <span>Esteria Bakery Business Portal</span>
              {isSupabaseConfigured() ? (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Supabase Live Sync
                </span>
              ) : (
                <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                  Instant Active Storage
                </span>
              )}
            </h1>
            <p className="text-xs text-stone-500">
              Manage live pastry prices, cakes, orders, and customer reviews without coding.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="py-2 px-3.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Store</span>
          </button>

          <button
            onClick={handleLogout}
            className="py-2 px-3.5 rounded-lg bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* SIDEBAR NAVIGATION */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-stone-200 p-3 shadow-xs space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'overview'
                  ? 'bg-amber-500 text-[#2D1A12]'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'products'
                  ? 'bg-amber-500 text-[#2D1A12]'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                <span>Products &amp; Pastries</span>
              </div>
              <span className="text-[11px] font-mono opacity-80">{products.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'categories'
                  ? 'bg-amber-500 text-[#2D1A12]'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4" />
                <span>Categories</span>
              </div>
              <span className="text-[11px] font-mono opacity-80">{categories.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'orders'
                  ? 'bg-amber-500 text-[#2D1A12]'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4" />
                <span>Customer Orders</span>
              </div>
              {pendingOrders.length > 0 && (
                <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                  {pendingOrders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'reviews'
                  ? 'bg-amber-500 text-[#2D1A12]'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4" />
                <span>Customer Reviews</span>
              </div>
              <span className="text-[11px] font-mono opacity-80">{reviews.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('content')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'content'
                  ? 'bg-amber-500 text-[#2D1A12]'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Website Content</span>
            </button>

            <button
              onClick={() => setActiveTab('logo')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'logo'
                  ? 'bg-amber-500 text-[#2D1A12]'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Logo &amp; Brand Icon</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'settings'
                  ? 'bg-amber-500 text-[#2D1A12]'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Settings &amp; Database</span>
            </button>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                    <span className="text-xs text-stone-500 font-medium block">Total Products</span>
                    <span className="font-serif text-3xl font-bold text-[#2D1A12] tabular-nums mt-1 block">
                      {products.length}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                      {availableCount} available today
                    </span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                    <span className="text-xs text-stone-500 font-medium block">Total Orders</span>
                    <span className="font-serif text-3xl font-bold text-[#2D1A12] tabular-nums mt-1 block">
                      {orders.length}
                    </span>
                    <span className="text-[11px] text-amber-800 font-semibold mt-1 block">
                      {pendingOrders.length} pending action
                    </span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                    <span className="text-xs text-stone-500 font-medium block">Total Reviews</span>
                    <span className="font-serif text-3xl font-bold text-[#2D1A12] tabular-nums mt-1 block">
                      {reviews.length}
                    </span>
                    <span className="text-[11px] text-stone-500 font-semibold mt-1 block">
                      {reviews.filter((r) => r.approved).length} approved &amp; live
                    </span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                    <span className="text-xs text-stone-500 font-medium block">Active Categories</span>
                    <span className="font-serif text-3xl font-bold text-[#2D1A12] tabular-nums mt-1 block">
                      {categories.length}
                    </span>
                    <span className="text-[11px] text-stone-500 font-semibold mt-1 block">
                      Pastries, Cakes, Small Chops
                    </span>
                  </div>
                </div>

                {/* Quick actions & recent orders */}
                <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-bold text-[#2D1A12]">
                      Recent Customer Orders
                    </h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-bold text-amber-800 hover:underline"
                    >
                      View All Orders
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <p className="text-xs text-stone-500 py-6 text-center">
                      No orders placed yet. Test the order flow on the front end!
                    </p>
                  ) : (
                    <div className="divide-y divide-stone-100">
                      {orders.slice(0, 4).map((ord) => (
                        <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-stone-900">{ord.customer_name}</span>
                            <span className="text-stone-400 font-mono ml-2">#{ord.id}</span>
                            <p className="text-stone-500">
                              {ord.items.map((i) => `${i.product_name} (${i.quantity})`).join(', ')}
                            </p>
                          </div>
                          <div className="text-right space-y-1">
                            <span className="font-bold text-stone-900 tabular-nums block">
                              {formatNaira(ord.total_amount)}
                            </span>
                            <span className="capitalize px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 inline-block">
                              {ord.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Direct quick management cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3">
                    <h4 className="font-serif font-bold text-stone-900 text-sm">
                      Add a New Cake or Pastry
                    </h4>
                    <p className="text-xs text-stone-500">
                      Add red velvet cakes, sausage rolls, or party small chops packs. Set the price in Nigerian Naira.
                    </p>
                    <button
                      onClick={() => {
                        setActiveTab('products');
                        openNewProductForm();
                      }}
                      className="py-2 px-4 bg-amber-500 text-[#2D1A12] rounded-lg font-semibold text-xs hover:bg-amber-400 transition-colors"
                    >
                      + Create Product
                    </button>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3">
                    <h4 className="font-serif font-bold text-stone-900 text-sm">
                      Update Website Story &amp; Hero
                    </h4>
                    <p className="text-xs text-stone-500">
                      Edit the headline, about story, or WhatsApp ordering phone number without touching code.
                    </p>
                    <button
                      onClick={() => setActiveTab('content')}
                      className="py-2 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-semibold text-xs transition-colors"
                    >
                      Edit Website Content
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PRODUCTS */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search bakery products..."
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 text-stone-900"
                    />
                  </div>

                  <button
                    onClick={openNewProductForm}
                    className="py-2 px-4 bg-amber-500 hover:bg-amber-400 text-[#2D1A12] font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Product</span>
                  </button>
                </div>

                {/* Product Add / Edit Modal Drawer */}
                {isAddingProduct && (
                  <div className="bg-white p-6 rounded-2xl border-2 border-amber-500 shadow-md space-y-5 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                      <h3 className="font-serif text-lg font-bold text-[#2D1A12]">
                        {editingProduct ? `Edit "${editingProduct.name}"` : 'Create New Bakery Item'}
                      </h3>
                      <button
                        onClick={() => setIsAddingProduct(false)}
                        className="text-xs text-stone-500 hover:text-stone-900"
                      >
                        Cancel
                      </button>
                    </div>

                    <form onSubmit={handleSaveProduct} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Product Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={pName}
                            onChange={(e) => setPName(e.target.value)}
                            placeholder="e.g., Nigerian Meat Pie"
                            className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 text-stone-900"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Price in Naira (₦) *
                          </label>
                          <input
                            type="number"
                            required
                            min="0"
                            value={pPrice}
                            onChange={(e) => setPPrice(Number(e.target.value))}
                            placeholder="1500"
                            className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 text-stone-900 tabular-nums"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Category *
                          </label>
                          <select
                            value={pCategory}
                            onChange={(e) => setPCategory(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 text-stone-900"
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Display Order (Sort)
                          </label>
                          <input
                            type="number"
                            value={pOrder}
                            onChange={(e) => setPOrder(Number(e.target.value))}
                            className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 text-stone-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Description
                        </label>
                        <textarea
                          rows={2}
                          value={pDesc}
                          onChange={(e) => setPDesc(e.target.value)}
                          placeholder="Describe the golden crust, flavor, seasoning, filling..."
                          className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 text-stone-900"
                        />
                      </div>

                      {/* Image selector & Upload */}
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-stone-700">
                          Product Image URL or Upload New
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={pImageUrl}
                            onChange={(e) => setPImageUrl(e.target.value)}
                            placeholder="Image URL"
                            className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                          />
                          <label className="cursor-pointer py-2 px-3 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-semibold text-stone-800 flex items-center gap-1.5 shrink-0">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{uploadingImage ? 'Uploading...' : 'Upload File'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                        {pImageUrl && (
                          <div className="flex items-center gap-3 pt-1">
                            <img
                              src={pImageUrl}
                              alt="Preview"
                              className="w-16 h-12 object-cover rounded border border-stone-200"
                            />
                            <span className="text-[11px] text-stone-500">Image Preview</span>
                          </div>
                        )}
                      </div>

                      {/* Toggles */}
                      <div className="flex items-center gap-6 pt-2">
                        <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pAvailable}
                            onChange={(e) => setPAvailable(e.target.checked)}
                            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
                          />
                          <span>Available for Ordering</span>
                        </label>

                        <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pFeatured}
                            onChange={(e) => setPFeatured(e.target.checked)}
                            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
                          />
                          <span>Featured on Home Page</span>
                        </label>
                      </div>

                      <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                        <button
                          type="button"
                          onClick={() => setIsAddingProduct(false)}
                          className="py-2 px-4 text-xs font-semibold text-stone-600 hover:text-stone-900"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="py-2 px-6 bg-amber-500 hover:bg-amber-400 text-[#2D1A12] font-bold text-xs rounded-lg transition-colors"
                        >
                          Save Product
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Products Table */}
                <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Item</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Price (₦)</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Featured</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 text-stone-700">
                        {products
                          .filter(
                            (p) =>
                              p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                              p.category_name?.toLowerCase().includes(productSearch.toLowerCase())
                          )
                          .map((prod) => (
                            <tr key={prod.id} className="hover:bg-stone-50/60 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={prod.image_url}
                                    alt={prod.name}
                                    className="w-10 h-10 rounded-lg object-cover bg-stone-100 shrink-0"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        '/src/assets/images/hero_nigerian_bakery_spread_1791355942203.jpg';
                                    }}
                                  />
                                  <div>
                                    <span className="font-bold text-stone-900 block">{prod.name}</span>
                                    <span className="text-[11px] text-stone-400 line-clamp-1 max-w-xs">
                                      {prod.description}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 font-medium">{prod.category_name}</td>
                              <td className="py-3 px-4 font-bold text-amber-950 tabular-nums">
                                {formatNaira(prod.price)}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    prod.is_available
                                      ? 'bg-emerald-50 text-emerald-800'
                                      : 'bg-rose-50 text-rose-800'
                                  }`}
                                >
                                  {prod.is_available ? 'Available' : 'Sold Out'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                {prod.is_featured ? (
                                  <span className="text-amber-600 font-bold text-[10px]">★ Yes</span>
                                ) : (
                                  <span className="text-stone-300 text-[10px]">—</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => openEditProductForm(prod)}
                                    title="Edit"
                                    className="p-1.5 text-stone-500 hover:text-amber-800 hover:bg-amber-50 rounded"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                    title="Delete"
                                    className="p-1.5 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CATEGORIES */}
            {activeTab === 'categories' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4 shadow-xs">
                  <h3 className="font-serif text-lg font-bold text-[#2D1A12]">
                    Create New Category
                  </h3>
                  <form onSubmit={handleCreateCategory} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      required
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="Category Name (e.g. Dessert Cups, Savory Rolls)"
                      className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                    />
                    <input
                      type="text"
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      placeholder="Short description"
                      className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                    />
                    <button
                      type="submit"
                      className="py-2 px-5 bg-amber-500 text-[#2D1A12] font-bold text-xs rounded-lg hover:bg-amber-400 transition-colors shrink-0"
                    >
                      Add Category
                    </button>
                  </form>
                </div>

                <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
                  <div className="divide-y divide-stone-100">
                    {categories.map((cat) => {
                      const count = products.filter(
                        (p) => p.category_id === cat.id || p.category_name?.toLowerCase() === cat.name.toLowerCase()
                      ).length;
                      return (
                        <div key={cat.id} className="p-4 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-stone-900 text-sm block">{cat.name}</span>
                            <span className="text-stone-500">{cat.description || 'No description'}</span>
                            <span className="text-[11px] text-amber-800 font-semibold block mt-1">
                              {count} products in this category
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 rounded"
                            title="Delete category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-stone-200 p-4 flex items-center justify-between">
                  <span className="font-serif font-bold text-sm text-[#2D1A12]">
                    Total Orders: {orders.length}
                  </span>
                  <span className="text-xs text-stone-500">
                    Click WhatsApp icon to chat with customer directly
                  </span>
                </div>

                {orders.length === 0 ? (
                  <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center text-stone-500 text-xs">
                    No customer orders yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((ord) => {
                      const whatsappDirectLink = `https://wa.me/234${ord.whatsapp_number.replace(/^0/, '').replace(/[^0-9]/g, '')}`;

                      return (
                        <div
                          key={ord.id}
                          className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4 shadow-xs"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs bg-stone-100 text-stone-800 px-2 py-0.5 rounded">
                                  #{ord.id}
                                </span>
                                <span className="font-serif font-bold text-stone-900 text-base">
                                  {ord.customer_name}
                                </span>
                              </div>
                              <span className="text-[11px] text-stone-400 mt-0.5 block">
                                Placed:{' '}
                                {new Date(ord.created_at).toLocaleString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              {/* Status Dropdown */}
                              <select
                                value={ord.status}
                                onChange={(e) =>
                                  handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)
                                }
                                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-stone-200 bg-stone-50 text-stone-800 capitalize focus:ring-2 focus:ring-amber-500"
                              >
                                <option value="new">New</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="preparing">Preparing</option>
                                <option value="ready">Ready</option>
                                <option value="out_for_delivery">Out for Delivery</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>

                              {/* WhatsApp Direct Chat */}
                              <a
                                href={whatsappDirectLink}
                                target="_blank"
                                rel="noreferrer"
                                title="Chat on WhatsApp"
                                className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg flex items-center gap-1 text-xs font-semibold transition-colors"
                              >
                                <MessageCircle className="w-4 h-4" />
                                <span className="hidden sm:inline">WhatsApp</span>
                              </a>
                            </div>
                          </div>

                          {/* Customer & Location */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-stone-50/70 p-3 rounded-xl border border-stone-100">
                            <div>
                              <span className="text-stone-400 block text-[10px] uppercase font-semibold">
                                Contact
                              </span>
                              <span className="font-medium text-stone-800">Phone: {ord.phone}</span>
                              {ord.email && <span className="block text-stone-500">{ord.email}</span>}
                            </div>
                            <div>
                              <span className="text-stone-400 block text-[10px] uppercase font-semibold">
                                Logistics ({ord.order_type})
                              </span>
                              <span className="font-medium text-stone-800">
                                {ord.address ? `${ord.address}, ` : ''}
                                {ord.location || 'Bakery pickup'}
                              </span>
                              {ord.city && <span className="block text-stone-500">{ord.city}</span>}
                            </div>
                            <div>
                              <span className="text-stone-400 block text-[10px] uppercase font-semibold">
                                Schedule
                              </span>
                              <span className="font-medium text-stone-800">
                                {ord.preferred_date}
                              </span>
                              <span className="block text-stone-500">{ord.preferred_time}</span>
                            </div>
                          </div>

                          {/* Items Breakdown */}
                          <div className="space-y-1.5 text-xs">
                            <span className="text-[10px] uppercase font-semibold text-stone-400 block">
                              Order Items
                            </span>
                            <div className="divide-y divide-stone-100">
                              {ord.items.map((item, idx) => (
                                <div key={idx} className="py-1 flex justify-between">
                                  <span>
                                    {item.product_name} <strong className="font-mono">× {item.quantity}</strong>
                                    {item.custom_instructions && (
                                      <span className="text-stone-400 italic ml-2">
                                        ("{item.custom_instructions}")
                                      </span>
                                    )}
                                  </span>
                                  <span className="tabular-nums font-semibold text-stone-900">
                                    {formatNaira(item.subtotal)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {ord.special_instructions && (
                            <div className="p-2.5 bg-amber-50 rounded-lg text-xs text-amber-900">
                              <strong>Special Note:</strong> {ord.special_instructions}
                            </div>
                          )}

                          <div className="flex justify-between items-center pt-2 border-t border-stone-100 text-sm">
                            <span className="font-medium text-stone-600">Total Charged</span>
                            <span className="font-serif font-bold text-lg text-amber-950 tabular-nums">
                              {formatNaira(ord.total_amount)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-2xl border border-stone-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#2D1A12]">
                      Manage Customer Reviews
                    </h3>
                    <p className="text-xs text-stone-500">
                      Only approved reviews are displayed publicly on the website.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-sm text-stone-900">
                            {rev.customer_name}
                          </span>
                          {rev.location && (
                            <span className="text-xs text-stone-400">({rev.location})</span>
                          )}
                          <div className="flex text-amber-400">
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-stone-700 italic">
                          "{rev.review_text}"
                        </p>

                        <span className="text-[10px] text-stone-400 block">
                          Submitted on {new Date(rev.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleToggleReviewApproval(rev.id, rev.approved)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                            rev.approved
                              ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                              : 'bg-stone-100 text-stone-700 hover:bg-amber-100'
                          }`}
                        >
                          {rev.approved ? <Check className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{rev.approved ? 'Approved (Live)' : 'Approve & Publish'}</span>
                        </button>

                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          title="Delete review"
                          className="p-1.5 text-stone-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: WEBSITE CONTENT */}
            {activeTab === 'content' && (
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h3 className="font-serif text-lg font-bold text-[#2D1A12]">
                    Website Content Management
                  </h3>
                  <p className="text-xs text-stone-500">
                    Edit homepage headlines, promotional copy, and about us content.
                  </p>
                </div>

                <form onSubmit={handleSaveContent} className="space-y-5">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                      Hero Section
                    </h4>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Hero Main Headline
                      </label>
                      <input
                        type="text"
                        value={contentForm.hero_title || ''}
                        onChange={(e) =>
                          setContentForm({ ...contentForm, hero_title: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Hero Supporting Description
                      </label>
                      <textarea
                        rows={2}
                        value={contentForm.hero_description || ''}
                        onChange={(e) =>
                          setContentForm({ ...contentForm, hero_description: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Hero Image URL
                      </label>
                      <input
                        type="text"
                        value={contentForm.hero_image_url || ''}
                        onChange={(e) =>
                          setContentForm({ ...contentForm, hero_image_url: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-stone-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                      About Us &amp; Story Page
                    </h4>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        About Headline
                      </label>
                      <input
                        type="text"
                        value={contentForm.about_title || ''}
                        onChange={(e) =>
                          setContentForm({ ...contentForm, about_title: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Bakery Story Text
                      </label>
                      <textarea
                        rows={4}
                        value={contentForm.about_text || ''}
                        onChange={(e) =>
                          setContentForm({ ...contentForm, about_text: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Mission Statement
                      </label>
                      <textarea
                        rows={2}
                        value={contentForm.mission_text || ''}
                        onChange={(e) =>
                          setContentForm({ ...contentForm, mission_text: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-stone-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                      Final Call-to-Action
                    </h4>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Final CTA Title
                      </label>
                      <input
                        type="text"
                        value={contentForm.final_cta_title || ''}
                        onChange={(e) =>
                          setContentForm({ ...contentForm, final_cta_title: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex justify-end">
                    <button
                      type="submit"
                      className="py-2.5 px-6 bg-amber-500 hover:bg-amber-400 text-[#2D1A12] font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save All Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 7: LOGO MANAGEMENT */}
            {activeTab === 'logo' && (
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h3 className="font-serif text-lg font-bold text-[#2D1A12]">
                    Bakery Logo Management
                  </h3>
                  <p className="text-xs text-stone-500">
                    Upload your official Esteria Bakery brand logo to display in the website navigation and footer.
                  </p>
                </div>

                {/* Preview Box */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-stone-700 block">
                    Current Active Logo Preview
                  </span>
                  <div className="p-8 bg-stone-100 rounded-2xl border border-stone-200 flex items-center justify-center min-h-[140px]">
                    {settings?.logo_url ? (
                      <img
                        src={settings.logo_url}
                        alt="Esteria Bakery Logo"
                        className="max-h-20 max-w-[260px] object-contain"
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center font-serif font-bold text-2xl text-[#2D1A12]">
                          E
                        </div>
                        <div>
                          <span className="font-serif text-2xl font-bold text-[#2D1A12] block">
                            Esteria Bakery
                          </span>
                          <span className="text-xs text-stone-500">Default Wordmark</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload & Actions */}
                <div className="space-y-6 pt-2">
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block">
                      Option 1: Upload File from Phone or Computer
                    </span>
                    <p className="text-xs text-stone-500">
                      Choose any picture file (.PNG, .JPG, .SVG, .WEBP) from your device. Transparent background recommended.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <label className="cursor-pointer py-3 px-6 bg-amber-500 hover:bg-amber-400 text-[#2D1A12] font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        <span>{logoUploading ? 'Uploading & Saving...' : 'Choose Logo File to Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>

                      {settings?.logo_url && (
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="py-3 px-4 bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 font-semibold text-xs rounded-xl transition-colors"
                        >
                          Reset to Default Wordmark
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-stone-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block">
                      Option 2: Or Paste a Direct Logo Link / Asset Path
                    </span>
                    <p className="text-xs text-stone-500">
                      If your logo is already hosted or in an image link, paste it below and click Save.
                    </p>
                    <div className="flex gap-2 max-w-lg pt-1">
                      <input
                        type="text"
                        value={logoUrlInput}
                        onChange={(e) => setLogoUrlInput(e.target.value)}
                        placeholder="https://your-domain.com/logo.png"
                        className="flex-1 px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900"
                      />
                      <button
                        type="button"
                        onClick={handleSaveLogoUrl}
                        className="py-2.5 px-5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition-colors shrink-0"
                      >
                        Save URL
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-950/10 text-xs text-amber-950 leading-relaxed">
                    💡 <strong>Live Automatic Update:</strong> As soon as you upload a file or save a URL, your logo is instantly saved and will replace the default text in the top navigation bar and footer!
                  </div>
                </div>
              </div>
            )}

            {/* TAB 8: SETTINGS & DATABASE */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Admin Password Change */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                  <h3 className="font-serif text-base font-bold text-[#2D1A12] flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-600" />
                    <span>Change Admin Password</span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    Update your dashboard password. Stored securely and hashed.
                  </p>

                  {pwChangeStatus && (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs">
                      {pwChangeStatus}
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-3 max-w-sm">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        required
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                      />
                    </div>

                    <button
                      type="submit"
                      className="py-2 px-5 bg-amber-500 hover:bg-amber-400 text-[#2D1A12] font-bold text-xs rounded-lg transition-colors"
                    >
                      Update Password
                    </button>
                  </form>
                </div>

                {/* Supabase Schema Viewer */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-base font-bold text-[#2D1A12]">
                          Supabase Backend Integration
                        </h3>
                        {isSupabaseConfigured() ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Connected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                            Local Mode
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 mt-1">
                        {isSupabaseConfigured()
                          ? `Connected project: ${SUPABASE_PROJECT_URL}`
                          : '⚡ Instant storage active. Run this SQL in your Supabase SQL Editor if connecting a remote database.'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                        showToast('SQL Schema copied to clipboard!');
                      }}
                      className="py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-[#2D1A12] text-xs font-semibold rounded-lg transition-colors shadow-xs w-fit"
                    >
                      Copy SQL Schema
                    </button>
                  </div>

                  <p className="text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-200">
                    <strong>Note:</strong> Make sure you have executed the schema script below in your Supabase project (<strong>SQL Editor &gt; New Query &gt; Run</strong>) so the tables (<code>products</code>, <code>orders</code>, <code>categories</code>, <code>reviews</code>, <code>site_settings</code>) and policies are active.
                  </p>

                  <pre className="p-4 bg-stone-900 text-amber-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-52">
                    {SUPABASE_SQL_SCHEMA}
                  </pre>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
