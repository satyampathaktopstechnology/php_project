import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { Search, X, ArrowRight, Star } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchTerm)}`);
        const data = await res.json();
        if (data.success) {
          setResults(data.products || []);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-neutral-100">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-neutral-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search dresses, linen blazers, bags, sandals, jackets..."
            className="flex-1 text-sm md:text-base focus:outline-none text-neutral-800 placeholder-neutral-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs text-neutral-400 hover:text-neutral-700 font-semibold"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-full"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestions / Results */}
        <div className="max-h-96 overflow-y-auto p-4">
          {loading && (
            <div className="py-8 text-center text-xs text-neutral-400 animate-pulse">
              Searching Essence catalog...
            </div>
          )}

          {!loading && searchTerm && results.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm font-medium text-neutral-700">No products found matching "{searchTerm}"</p>
              <p className="text-xs text-neutral-400 mt-1">Try searching for 'Dress', 'Blazer', 'Tote', or 'Jeans'</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Matching Products ({results.length})
              </p>
              {results.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    onClose();
                    onSelectProduct(product);
                  }}
                  className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-neutral-50 cursor-pointer transition-colors group"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-14 object-cover rounded-md bg-neutral-100 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/img/product-img/product-1.jpg';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-neutral-800 group-hover:text-rose-600 transition-colors truncate">
                      {product.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-neutral-900">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      {product.brand_name && (
                        <span className="text-[10px] text-neutral-400 uppercase font-medium">
                          &bull; {product.brand_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          )}

          {!searchTerm && (
            <div className="py-4">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {['Bohemian Dress', 'Linen Blazer', 'Leather Bag', 'Heels', 'Denim Jeans', 'Cashmere'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchTerm(tag)}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium rounded-full transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
