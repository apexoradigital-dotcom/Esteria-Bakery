import React from 'react';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { MenuPage } from './pages/MenuPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { OrderPage } from './pages/OrderPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { MessageCircle } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentRoute } = useNavigation();

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#2D1A12] selection:bg-amber-100 selection:text-[#2D1A12]">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Page Body */}
      <main className="flex-1">
        {currentRoute === '/' && <HomePage />}
        {currentRoute === '/about' && <AboutPage />}
        {currentRoute === '/menu' && <MenuPage />}
        {currentRoute === '/reviews' && <ReviewsPage />}
        {currentRoute === '/order' && <OrderPage />}
        {currentRoute === '/admin' && <AdminDashboard />}
      </main>

      {/* Floating WhatsApp Quick Action on public pages */}
      {currentRoute !== '/admin' && (
        <aside aria-label="WhatsApp quick chat" className="fixed bottom-6 left-6 z-30">
          <a
            href="https://wa.me/2349158209566?text=Hello%20Esteria%20Bakery,%20I%20would%20like%20to%20place%20an%20order."
            target="_blank"
            rel="noreferrer"
            aria-label="Orders on WhatsApp"
            className="flex items-center gap-2.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group text-xs font-bold"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Orders on WhatsApp</span>
          </a>
        </aside>
      )}

      {/* Interactive Cart and Product Modals */}
      <ProductModal />
      <CartDrawer />

      {/* Global Footer (shown on public pages) */}
      {currentRoute !== '/admin' && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <NavigationProvider>
      <CartProvider>
        <MainContent />
      </CartProvider>
    </NavigationProvider>
  );
}
