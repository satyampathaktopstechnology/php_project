import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

interface WishlistPageProps {
  onSelectProduct: (product: Product) => void;
  onNavigateToShop: () => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ onSelectProduct, onNavigateToShop }) => {
  const { wishlistIds, toggleWishlist, addToCart } = useCart();
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success && data.products) {
          const matched = data.products.filter((p: Product) => wishlistIds.includes(p.id));
          setWishlistProducts(matched);
        }
      } catch (err) {
        console.error('Error loading wishlist:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlistIds]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-neutral-500">Loading your saved items...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn space-y-8">
      {/* Header */}
      <div className="border-b border-neutral-100 pb-6 flex items-baseline justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-rose-600">Saved Favorites</span>
          <h1 className="text-3xl font-black font-serif text-neutral-900 mt-1">My Wishlist</h1>
        </div>
        <span className="text-xs font-semibold text-neutral-500">
          {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} saved
        </span>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-neutral-100 shadow-xs max-w-lg mx-auto">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-neutral-900">Your wishlist is currently empty</h2>
          <p className="text-xs text-neutral-500 mt-1.5 max-w-sm mx-auto">
            Bookmark your favorite dresses, blazers, and accessories while you browse.
          </p>
          <button
            onClick={onNavigateToShop}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 hover:bg-rose-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-md"
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl overflow-hidden border border-neutral-100 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div
                className="relative aspect-[3/4] bg-neutral-100 overflow-hidden cursor-pointer"
                onClick={() => onSelectProduct(product)}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/img/product-img/product-1.jpg';
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product.id);
                  }}
                  className="absolute top-3 right-3 p-2 bg-white/90 text-rose-600 rounded-full hover:bg-white transition-colors shadow-xs"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">
                    {product.brand_name || 'Essence'}
                  </span>
                  <h3
                    onClick={() => onSelectProduct(product)}
                    className="text-xs font-semibold text-neutral-800 hover:text-rose-600 transition-colors line-clamp-1 cursor-pointer"
                  >
                    {product.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-sm font-bold text-neutral-900">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    {product.old_price && (
                      <span className="text-xs text-neutral-400 line-through">
                        ₹{product.old_price.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    addToCart(product, 1, 'M', '#111827');
                    toggleWishlist(product.id);
                  }}
                  className="mt-4 w-full py-2.5 bg-neutral-900 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Move to Bag</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
