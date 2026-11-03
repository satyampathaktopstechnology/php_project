import React from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onQuickView
}) => {
  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const isSaved = isInWishlist(product.id);

  const discountPercent = product.old_price && product.old_price > product.price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-xl overflow-hidden border border-neutral-100 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col relative">
      {/* Product Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 cursor-pointer" onClick={() => onSelectProduct(product)}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/img/product-img/product-1.jpg';
          }}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {discountPercent > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs tracking-wider">
              {discountPercent}% OFF
            </span>
          )}
          {product.is_featured === 1 && (
            <span className="bg-neutral-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs">
              TRENDING
            </span>
          )}
          {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs">
              LOW STOCK
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 z-10 shadow-xs ${
            isSaved
              ? 'bg-rose-50 text-rose-500 hover:bg-rose-100'
              : 'bg-white/80 backdrop-blur-xs text-neutral-600 hover:text-rose-500 hover:bg-white'
          }`}
          aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Quick Actions Hover Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="flex-1 py-2 px-3 bg-white text-neutral-900 text-xs font-semibold rounded-lg shadow hover:bg-neutral-100 transition-colors flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, 1, 'M', '#111827');
            }}
            className="p-2 bg-rose-600 text-white rounded-lg shadow hover:bg-rose-500 transition-colors"
            title="Quick Add to Bag"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-neutral-400 font-medium uppercase tracking-wider mb-1">
            <span>{product.brand_name || 'Essence Studio'}</span>
            <div className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
          </div>

          <h3
            onClick={() => onSelectProduct(product)}
            className="text-sm font-semibold text-neutral-800 hover:text-rose-600 transition-colors line-clamp-1 cursor-pointer"
          >
            {product.name}
          </h3>
        </div>

        <div className="mt-3 pt-2 border-t border-neutral-100 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-neutral-900">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.old_price && product.old_price > product.price && (
              <span className="text-xs text-neutral-400 line-through">
                ₹{product.old_price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, 1, 'M', '#111827');
            }}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>+ Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
