import React from 'react';
import { Product } from '../types/bakery';
import { useNavigation } from '../context/NavigationContext';
import { useCart } from '../context/CartContext';
import { formatNaira } from '../lib/bakeryStore';
import { ShoppingBag, ArrowRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { openProductModal } = useNavigation();
  const { addToCart, setIsCartOpen } = useCart();

  const handleCardClick = () => {
    openProductModal(product);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setIsCartOpen(true);
  };

  return (
    <article
      onClick={handleCardClick}
      className="group bg-white rounded-2xl overflow-hidden border border-amber-950/10 hover:border-amber-900/25 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col h-full"
    >
      {/* Product Image Frame */}
      <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              '/src/assets/images/hero_nigerian_bakery_spread_1791355942203.jpg';
          }}
        />
        
        {/* Availability Marker if unavailable */}
        {!product.is_available && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <span className="text-white text-xs font-semibold tracking-wider uppercase px-3 py-1 bg-stone-800 rounded-md">
              Sold Out Today
            </span>
          </div>
        )}

        {/* Subtle Category text (Unboxed, clean) */}
        {product.category_name && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[11px] font-semibold text-amber-950 px-2.5 py-0.5 rounded shadow-xs">
            {product.category_name}
          </div>
        )}
      </div>

      {/* Content & Ordering Info */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-serif text-lg font-bold text-[#2D1A12] group-hover:text-amber-800 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </div>

          <p className="mt-1.5 text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {product.ingredients && product.ingredients.length > 0 && (
            <div className="mt-2 text-[11px] text-stone-500 line-clamp-1">
              <span className="font-semibold text-stone-700">Ingredients:</span>{' '}
              {product.ingredients.join(', ')}
            </div>
          )}

          {product.allergens && product.allergens.length > 0 && (
            <div className="mt-1 text-[10.5px] text-amber-900/80 font-medium line-clamp-1">
              <span className="font-semibold text-amber-800">Allergens:</span>{' '}
              {product.allergens.join(', ')}
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-medium">
              Price
            </span>
            <span className="font-sans font-bold text-base text-[#2D1A12] tabular-nums">
              {formatNaira(product.price)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {product.is_available && (
              <button
                type="button"
                onClick={handleQuickAdd}
                aria-label={`Quick add ${product.name} to order tray`}
                title="Add to tray"
                className="p-2 rounded-lg bg-stone-100 hover:bg-amber-100 text-[#3D2314] transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handleCardClick}
              disabled={!product.is_available}
              className={`py-2 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                product.is_available
                  ? 'bg-amber-500 hover:bg-amber-400 text-[#2D1A12]'
                  : 'bg-stone-100 text-stone-400 cursor-not-allowed'
              }`}
            >
              <span>{product.is_available ? 'Order' : 'Unavailable'}</span>
              {product.is_available && <ArrowRight className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
