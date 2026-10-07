import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigation } from '../context/NavigationContext';
import { formatNaira } from '../lib/bakeryStore';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, totalAmount, isCartOpen, setIsCartOpen } = useCart();
  const { navigate } = useNavigation();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/order');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-amber-950/10 animate-in slide-in-from-right duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-amber-50/40">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-700" />
            <h3 className="font-serif text-lg font-bold text-[#2D1A12]">
              Your Order Tray
            </h3>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            aria-label="Close tray"
            className="p-2 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-stone-500">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-700">
                <ShoppingBag className="w-8 h-8 opacity-60" />
              </div>
              <p className="font-serif text-lg font-medium text-stone-800">
                Your tray is currently empty
              </p>
              <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
                Add some golden Nigerian meat pies, fluffy puff-puff, or custom celebration cakes to start your order!
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/menu');
                }}
                className="mt-2 py-2 px-5 bg-amber-500 text-[#2D1A12] font-semibold text-xs rounded-lg hover:bg-amber-400 transition-colors"
              >
                Explore Menu
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="flex items-start gap-3 p-3 bg-stone-50/70 rounded-xl border border-stone-200/60 relative group"
              >
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="w-16 h-16 rounded-lg object-cover bg-stone-200 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      '/src/assets/images/hero_nigerian_bakery_spread_1791355942203.jpg';
                  }}
                />
                <div className="flex-1 min-w-0 pr-6">
                  <h4 className="font-serif font-semibold text-sm text-[#2D1A12] truncate">
                    {item.product.name}
                  </h4>
                  <div className="text-xs font-semibold text-amber-900 tabular-nums mt-0.5">
                    {formatNaira(item.product.price)} each
                  </div>
                  {item.specialNote && (
                    <div className="text-[11px] text-stone-500 italic mt-0.5 truncate">
                      "{item.specialNote}"
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-md px-1 py-0.5">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 text-stone-600 hover:text-stone-900"
                        aria-label="Decrease"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-bold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 text-stone-600 hover:text-stone-900"
                        aria-label="Increase"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-xs font-bold text-stone-800 tabular-nums ml-auto">
                      {formatNaira(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.product.id)}
                  aria-label="Remove item"
                  className="absolute top-2.5 right-2.5 text-stone-400 hover:text-rose-600 p-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-stone-200 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-stone-600">Subtotal</span>
              <span className="font-serif text-xl font-bold text-[#2D1A12] tabular-nums">
                {formatNaira(totalAmount)}
              </span>
            </div>

            <p className="text-[11px] text-stone-500 leading-tight">
              Delivery fees will be confirmed on WhatsApp based on your delivery address in Lagos or Abuja.
            </p>

            <button
              onClick={handleCheckout}
              className="w-full py-3.5 px-4 bg-amber-500 text-[#2D1A12] font-bold text-sm rounded-xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Continue to Order Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
