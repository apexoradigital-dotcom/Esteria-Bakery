import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useCart } from '../context/CartContext';
import { formatNaira } from '../lib/bakeryStore';
import { X, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export const ProductModal: React.FC = () => {
  const { selectedProductForModal, closeProductModal, navigate } = useNavigation();
  const { addToCart, setIsCartOpen } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [specialNote, setSpecialNote] = useState('');
  const [addedAnimation, setAddedAnimation] = useState(false);

  if (!selectedProductForModal) return null;

  const product = selectedProductForModal;
  const itemTotal = product.price * quantity;

  const handleAddToCart = () => {
    addToCart(product, quantity, specialNote);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      closeProductModal();
      setIsCartOpen(true);
    }, 400);
  };

  const handleDirectCheckout = () => {
    addToCart(product, quantity, specialNote);
    closeProductModal();
    navigate('/order');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-amber-950/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeProductModal}
          aria-label="Close product preview"
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 text-stone-700 hover:text-stone-950 hover:bg-white shadow-sm transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Media */}
        <div className="relative h-64 sm:h-72 w-full bg-amber-50/50 overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                '/src/assets/images/hero_nigerian_bakery_spread_1791355942203.jpg';
            }}
          />
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-md text-xs font-semibold text-amber-900 shadow-xs">
            {product.category_name || 'Pastry'}
          </div>
        </div>

        {/* Product Details */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-serif text-2xl font-bold text-[#2D1A12]">
                {product.name}
              </h3>
              <span className="font-sans font-bold text-xl text-amber-900 tabular-nums shrink-0">
                {formatNaira(product.price)}
              </span>
            </div>
            <p className="mt-2 text-stone-600 text-sm leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Ingredients & Allergy Advice */}
          {product.ingredients && product.ingredients.length > 0 && (
            <div className="bg-amber-50/40 rounded-xl p-3.5 border border-amber-900/10 space-y-2 text-xs">
              <div>
                <span className="font-bold text-[#2D1A12] block uppercase tracking-wider text-[10px]">
                  Ingredients List:
                </span>
                <p className="text-stone-700 leading-relaxed mt-0.5">
                  {product.ingredients.join(' · ')}
                </p>
              </div>

              {product.allergens && product.allergens.length > 0 && (
                <div className="pt-1.5 border-t border-amber-950/10">
                  <span className="font-bold text-amber-900 block uppercase tracking-wider text-[10px]">
                    Allergy Information:
                  </span>
                  <p className="text-amber-950 font-medium leading-relaxed mt-0.5">
                    {product.allergens.join(' · ')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Customization Note */}
          <div>
            <label className="block text-xs font-semibold text-[#452A1E] uppercase tracking-wider mb-2">
              Special Instructions / Customization (Optional)
            </label>
            <input
              type="text"
              value={specialNote}
              onChange={(e) => setSpecialNote(e.target.value)}
              placeholder="e.g., Birthday inscription, extra pepper, or packing note"
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-stone-800"
            />
          </div>

          {/* Quantity Controls & Total */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
            <div>
              <span className="text-xs text-stone-500 block">Quantity</span>
              <div className="flex items-center gap-3 mt-1 bg-stone-100/80 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-md bg-white text-stone-700 hover:bg-stone-50 flex items-center justify-center shadow-xs transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-bold tabular-nums text-stone-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded-md bg-white text-stone-700 hover:bg-stone-50 flex items-center justify-center shadow-xs transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-stone-500 block">Subtotal</span>
              <span className="font-serif text-2xl font-bold text-[#2D1A12] tabular-nums">
                {formatNaira(itemTotal)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              className={`py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border border-amber-950/20 text-[#2D1A12] hover:bg-amber-50/50 transition-colors ${
                addedAnimation ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : ''
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-amber-700" />
              <span>{addedAnimation ? 'Added to Order!' : 'Add to Order Tray'}</span>
            </button>

            <button
              onClick={handleDirectCheckout}
              className="py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-amber-500 text-[#2D1A12] hover:bg-amber-400 transition-colors shadow-xs"
            >
              <span>Proceed to Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
