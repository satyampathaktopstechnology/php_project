import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { X, Star, ShoppingBag, Heart, ShieldCheck, Check } from 'lucide-react';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onViewFullDetails: (product: Product) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onViewFullDetails
}) => {
  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('#111827');
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  if (!product) return null;

  const isSaved = isInWishlist(product.id);
  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  const colors = [
    { name: 'Noir Black', hex: '#111827' },
    { name: 'Crimson Rose', hex: '#e11d48' },
    { name: 'Royal Sapphire', hex: '#2563eb' },
    { name: 'Emerald Forest', hex: '#10b981' }
  ];

  const handleAdd = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden relative max-h-[90vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-neutral-400 hover:text-neutral-800 p-1.5 rounded-full bg-white/80 hover:bg-neutral-100 transition-colors shadow-xs"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Section */}
        <div className="md:w-1/2 bg-neutral-100 relative min-h-[300px] md:min-h-full">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-top"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/img/product-img/product-1.jpg';
            }}
          />
          {product.brand_name && (
            <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs text-neutral-800 text-[11px] font-bold px-2.5 py-1 rounded shadow-xs tracking-wider uppercase">
              {product.brand_name}
            </span>
          )}
        </div>

        {/* Product Info Section */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-neutral-500 font-medium">
                {product.rating.toFixed(1)} ({product.review_count} reviews)
              </span>
            </div>

            <h2 className="text-xl font-bold font-serif text-neutral-900 leading-snug">{product.name}</h2>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">SKU: {product.sku}</p>

            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-2xl font-bold text-neutral-900">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.old_price && product.old_price > product.price && (
                <span className="text-sm text-neutral-400 line-through">
                  ₹{product.old_price.toLocaleString('en-IN')}
                </span>
              )}
              {product.old_price && product.old_price > product.price && (
                <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                  Save ₹{(product.old_price - product.price).toLocaleString('en-IN')}
                </span>
              )}
            </div>

            <p className="text-xs text-neutral-600 mt-4 leading-relaxed line-clamp-3">
              {product.description}
            </p>

            {/* Size Selector */}
            <div className="mt-5">
              <div className="flex justify-between items-center text-xs font-semibold text-neutral-700 mb-2">
                <span>Select Size</span>
                <span className="text-neutral-400 font-normal">Standard Fit</span>
              </div>
              <div className="flex gap-2">
                {sizes.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`w-10 h-10 rounded-lg text-xs font-semibold transition-all flex items-center justify-center ${
                      selectedSize === sz
                        ? 'bg-neutral-900 text-white shadow-sm ring-2 ring-neutral-900'
                        : 'border border-neutral-200 text-neutral-700 hover:border-neutral-400 bg-neutral-50'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Palette */}
            <div className="mt-4">
              <span className="block text-xs font-semibold text-neutral-700 mb-2">Color Swatch</span>
              <div className="flex gap-2.5">
                {colors.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setSelectedColor(c.hex)}
                    className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                      selectedColor === c.hex ? 'ring-2 ring-rose-500 ring-offset-2 scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    {selectedColor === c.hex && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-4 flex items-center gap-4">
              <span className="text-xs font-semibold text-neutral-700">Quantity</span>
              <div className="flex items-center border border-neutral-300 rounded-lg bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-2.5 py-1 text-neutral-500 hover:text-neutral-800 text-sm font-semibold"
                >
                  -
                </button>
                <span className="px-3 text-xs font-bold text-neutral-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-2.5 py-1 text-neutral-500 hover:text-neutral-800 text-sm font-semibold"
                >
                  +
                </button>
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">In Stock ({product.stock_quantity} available)</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-6 pt-4 border-t border-neutral-100 space-y-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 py-3 bg-neutral-900 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{addedAnimation ? 'Added to Bag!' : 'Add to Bag'}</span>
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className={`p-3 rounded-xl border transition-colors ${
                  isSaved
                    ? 'border-rose-300 bg-rose-50 text-rose-600'
                    : 'border-neutral-200 text-neutral-600 hover:text-rose-600 hover:bg-neutral-50'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-rose-500' : ''}`} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onViewFullDetails(product);
              }}
              className="w-full text-center py-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 hover:underline transition-colors"
            >
              View Full Product Specifications &amp; Reviews &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
