import React, { useState, useMemo } from 'react';
import { Product, Category, Brand } from '../types';
import { ProductCard } from '../components/ProductCard';
import {
  Filter,
  SlidersHorizontal,
  Search,
  Grid3X3,
  List,
  X,
  RotateCcw,
  Check,
  ChevronDown
} from 'lucide-react';

interface ShopPageProps {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  initialCategory?: string;
  onSelectProduct: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  categories,
  brands,
  initialCategory,
  onSelectProduct,
  onQuickView
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(6000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Filtered & Sorted products computation
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory !== 'all') {
          if (p.category_slug !== selectedCategory && p.category_name?.toLowerCase() !== selectedCategory.toLowerCase()) {
            return false;
          }
        }

        // Brand filter
        if (selectedBrand !== 'all') {
          if (p.brand_name?.toLowerCase() !== selectedBrand.toLowerCase()) {
            return false;
          }
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchSku = p.sku.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchSku) return false;
        }

        // Price range
        if (p.price < minPrice || p.price > maxPrice) {
          return false;
        }

        // Stock filter
        if (inStockOnly && p.stock_quantity <= 0) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return b.id - a.id;
      });
  }, [products, selectedCategory, selectedBrand, searchQuery, minPrice, maxPrice, inStockOnly, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSearchQuery('');
    setMinPrice(0);
    setMaxPrice(6000);
    setInStockOnly(false);
    setSortBy('newest');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedBrand !== 'all' ||
    searchQuery.trim() !== '' ||
    minPrice > 0 ||
    maxPrice < 6000 ||
    inStockOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Page Header */}
      <div className="mb-8 border-b border-neutral-100 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-rose-600">Essence Collection</span>
          <h1 className="text-3xl font-black font-serif text-neutral-900 mt-1">Catalog &amp; Boutique</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Showing <strong className="text-neutral-900">{filteredProducts.length}</strong> styles available
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="md:hidden flex items-center gap-2 px-3 py-2 bg-neutral-100 rounded-xl text-xs font-semibold text-neutral-700"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-400 font-medium hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer shadow-xs"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Customer Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs font-semibold text-neutral-500">Active Filters:</span>
          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 text-white rounded-full text-xs capitalize font-medium">
              Category: {selectedCategory}
              <X className="w-3.5 h-3.5 cursor-pointer hover:text-rose-400" onClick={() => setSelectedCategory('all')} />
            </span>
          )}
          {selectedBrand !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 text-white rounded-full text-xs capitalize font-medium">
              Brand: {selectedBrand}
              <X className="w-3.5 h-3.5 cursor-pointer hover:text-rose-400" onClick={() => setSelectedBrand('all')} />
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 text-white rounded-full text-xs font-medium">
              Keyword: "{searchQuery}"
              <X className="w-3.5 h-3.5 cursor-pointer hover:text-rose-400" onClick={() => setSearchQuery('')} />
            </span>
          )}
          {inStockOnly && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 text-white rounded-full text-xs font-medium">
              In Stock Only
              <X className="w-3.5 h-3.5 cursor-pointer hover:text-rose-400" onClick={() => setInStockOnly(false)} />
            </span>
          )}
          {(minPrice > 0 || maxPrice < 6000) && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 text-white rounded-full text-xs font-medium">
              ₹{minPrice} - ₹{maxPrice}
              <X className="w-3.5 h-3.5 cursor-pointer hover:text-rose-400" onClick={() => { setMinPrice(0); setMaxPrice(6000); }} />
            </span>
          )}
          <button
            onClick={handleResetFilters}
            className="text-xs text-rose-600 hover:underline font-semibold ml-2 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset All
          </button>
        </div>
      )}

      {/* Main Layout: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left Sidebar Filters */}
        <aside className={`md:block space-y-6 ${isMobileFilterOpen ? 'block' : 'hidden'}`}>
          <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs space-y-6">
            {/* Search Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-2">
                Search Catalog
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by name, material..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Department / Category Filter */}
            <div className="border-t border-neutral-100 pt-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-3">
                Categories
              </label>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedCategory === 'all'
                      ? 'bg-neutral-900 text-white font-bold'
                      : 'text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <span>All Categories</span>
                  <span className="text-[11px] opacity-75">{products.length}</span>
                </button>
                {categories.map((c) => {
                  const count = products.filter(
                    (p) => p.category_slug === c.slug || p.category_name?.toLowerCase() === c.name.toLowerCase()
                  ).length;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCategory(c.slug)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                        selectedCategory === c.slug
                          ? 'bg-neutral-900 text-white font-bold'
                          : 'text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="text-[11px] opacity-75">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brands Filter */}
            <div className="border-t border-neutral-100 pt-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-3">
                Brands
              </label>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setSelectedBrand('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedBrand === 'all'
                      ? 'bg-neutral-900 text-white font-bold'
                      : 'text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <span>All Brands</span>
                </button>
                {brands.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBrand(b.name.toLowerCase())}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedBrand === b.name.toLowerCase()
                        ? 'bg-neutral-900 text-white font-bold'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <span>{b.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="border-t border-neutral-100 pt-5">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                  Price Limit
                </label>
                <span className="text-xs font-bold text-rose-600">₹{maxPrice.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="500"
                max="6000"
                step="200"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-neutral-400 mt-1">
                <span>₹500</span>
                <span>₹6,000+</span>
              </div>
            </div>

            {/* Availability Filter */}
            <div className="border-t border-neutral-100 pt-5">
              <label className="flex items-center gap-2.5 text-xs font-semibold text-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 accent-rose-600"
                />
                <span>In Stock Products Only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Right Product Grid Area */}
        <main className="md:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-neutral-100 shadow-xs">
              <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-neutral-800">No matching products found</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                No styles match your active filters. Try adjusting price limits or clearing category selections.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-5 px-5 py-2.5 bg-neutral-900 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={onSelectProduct}
                  onQuickView={onQuickView}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
