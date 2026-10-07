import React, { useState, useEffect } from 'react';
import { useNavigation, AppRoute } from '../context/NavigationContext';
import { useCart } from '../context/CartContext';
import { bakeryStore } from '../lib/bakeryStore';
import { SiteSettings } from '../types/bakery';
import { ShoppingBag, Menu, X, Shield, ChevronRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentRoute, navigate } = useNavigation();
  const { itemCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    bakeryStore.getSiteSettings().then(setSettings);
    const unsubscribe = bakeryStore.subscribe(() => {
      bakeryStore.getSiteSettings().then(setSettings);
    });
    return unsubscribe;
  }, []);

  const navLinks: { label: string; route: AppRoute }[] = [
    { label: 'Home', route: '/' },
    { label: 'About Us', route: '/about' },
    { label: 'Menu', route: '/menu' },
    { label: 'Reviews', route: '/reviews' },
    { label: 'Order', route: '/order' },
  ];

  const handleNavClick = (route: AppRoute) => {
    navigate(route);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-950/10 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Zone 1: Brand & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavClick('/')}
              className="flex items-center gap-3.5 group text-left focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 rounded-xl p-1.5 -m-1.5 transition-all"
            >
              {settings?.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt="Esteria Bakery"
                  className="h-14 sm:h-16 w-auto max-w-[220px] sm:max-w-[260px] object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-102"
                />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-md border border-amber-300/80 flex items-center justify-center text-[#221109] font-serif font-extrabold text-2xl sm:text-3xl tracking-tight transition-transform duration-200 group-hover:scale-105 shrink-0">
                    E
                  </div>
                  <div>
                    <span className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-[#221109] group-hover:text-amber-800 transition-colors inline-flex items-baseline">
                      Esteria Bakery
                      <span className="text-amber-500 font-black ml-0.5 text-2xl">.</span>
                    </span>
                  </div>
                </div>
              )}
            </button>
          </div>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {navLinks.map((item) => {
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => handleNavClick(item.route)}
                  className={`relative py-1 transition-colors ${
                    isActive
                      ? 'text-amber-800 font-semibold'
                      : 'text-[#452A1E] hover:text-amber-700'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions (Cart & Subtle Admin Icon) */}
          <div className="flex items-center gap-3">
            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="View Shopping Cart"
              className="relative p-2.5 rounded-full text-[#3D2314] hover:bg-amber-50 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 bg-amber-500 text-stone-950 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center tabular-nums shadow-xs">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Subtle Admin Icon */}
            <button
              onClick={() => handleNavClick('/admin')}
              title="Admin Management Dashboard"
              aria-label="Admin Dashboard"
              className="p-2.5 rounded-full text-[#7B5B49] hover:text-[#2D1A12] hover:bg-stone-100 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <Shield className="w-4 h-4 opacity-75 hover:opacity-100 transition-opacity" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              className="md:hidden p-2 rounded-lg text-[#3D2314] hover:bg-amber-50 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-amber-950/10 px-4 pt-2 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="divide-y divide-amber-950/5">
            {navLinks.map((item) => {
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => handleNavClick(item.route)}
                  className={`w-full flex items-center justify-between py-3.5 text-base font-medium text-left ${
                    isActive ? 'text-amber-800 font-semibold' : 'text-[#3D2314]'
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight className={`w-4 h-4 ${isActive ? 'text-amber-500' : 'text-stone-300'}`} />
                </button>
              );
            })}
            <button
              onClick={() => handleNavClick('/admin')}
              className="w-full flex items-center justify-between py-3.5 text-sm font-medium text-stone-500 text-left"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4" /> Admin Portal
              </span>
              <ChevronRight className="w-4 h-4 text-stone-300" />
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={() => handleNavClick('/order')}
              className="w-full py-3 bg-amber-500 text-[#2D1A12] font-semibold rounded-lg hover:bg-amber-400 transition-colors shadow-xs"
            >
              Order on WhatsApp
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
