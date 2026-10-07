import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types/bakery';

export type AppRoute = '/' | '/about' | '/menu' | '/reviews' | '/order' | '/admin';

interface NavigationContextType {
  currentRoute: AppRoute;
  navigate: (route: AppRoute, replace?: boolean) => void;
  selectedProductForModal: Product | null;
  openProductModal: (product: Product) => void;
  closeProductModal: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

function normalizePath(pathname: string): AppRoute {
  if (pathname.startsWith('/about')) return '/about';
  if (pathname.startsWith('/menu')) return '/menu';
  if (pathname.startsWith('/reviews')) return '/reviews';
  if (pathname.startsWith('/order')) return '/order';
  if (pathname.startsWith('/admin')) return '/admin';
  return '/';
}

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    if (typeof window === 'undefined') return '/';
    return normalizePath(window.location.pathname);
  });

  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(normalizePath(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (route: AppRoute, replace = false) => {
    setCurrentRoute(route);
    if (typeof window !== 'undefined') {
      if (replace) {
        window.history.replaceState({}, '', route);
      } else {
        window.history.pushState({}, '', route);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openProductModal = (product: Product) => {
    setSelectedProductForModal(product);
  };

  const closeProductModal = () => {
    setSelectedProductForModal(null);
  };

  return (
    <NavigationContext.Provider
      value={{
        currentRoute,
        navigate,
        selectedProductForModal,
        openProductModal,
        closeProductModal,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
