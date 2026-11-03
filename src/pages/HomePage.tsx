import React, { useState } from 'react';
import { Product, Category, Brand, BlogPost } from '../types';
import { ProductCard } from '../components/ProductCard';
import {
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Truck,
  Sparkles,
  Heart,
  Send,
  CheckCircle,
  TrendingUp,
  Percent
} from 'lucide-react';

interface HomePageProps {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  blogs: BlogPost[];
  onSelectProduct: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onNavigateToShop: (categorySlug?: string) => void;
  onNavigateToBlog: (slug?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  categories,
  brands,
  blogs,
  onSelectProduct,
  onQuickView,
  onNavigateToShop,
  onNavigateToBlog
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'dresses' | 'clothing' | 'accessories' | 'shoes'>('all');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const filterProducts = () => {
    if (activeTab === 'all') return products.slice(0, 8);
    return products.filter((p) => p.category_slug === activeTab).slice(0, 8);
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubmitted(true);
    setTimeout(() => {
      setNewsletterEmail('');
      setNewsletterSubmitted(false);
    }, 4000);
  };

  return (
    <div className="space-y-16 pb-12 animate-fadeIn">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-neutral-900 text-white min-h-[520px] md:min-h-[620px] flex items-center">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/img/bg-img/bg-1.jpg"
            alt="Essence Fashion Hero"
            className="w-full h-full object-cover object-top opacity-50"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-900/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold uppercase tracking-wider backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Spring / Summer 2026 Collection</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-serif tracking-tight leading-none text-white">
              Couture Meets <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-300 to-amber-200">
                Modern Grace.
              </span>
            </h1>

            <p className="text-sm md:text-base text-neutral-300 leading-relaxed font-light">
              Discover curated luxury essentials tailored for contemporary living. From flowing Parisian silks to architectural linen tailoring.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={() => onNavigateToShop()}
                className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl hover:shadow-rose-600/30 flex items-center gap-2 group cursor-pointer"
              >
                <span>Discover Collection</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigateToShop('dresses')}
                className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs uppercase tracking-widest rounded-xl transition-all backdrop-blur-xs border border-white/20 cursor-pointer"
              >
                Explore Dresses
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white rounded-2xl border border-neutral-100 shadow-sm">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-900">Complimentary Shipping</h4>
              <p className="text-[11px] text-neutral-500">Free delivery on all orders</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-900">Instant Razorpay</h4>
              <p className="text-[11px] text-neutral-500">UPI, Cards, NetBanking, COD</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-900">30-Day Hassle-Free</h4>
              <p className="text-[11px] text-neutral-500">Effortless exchanges &amp; returns</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-900">Certified Authentic</h4>
              <p className="text-[11px] text-neutral-500">100% designer verified goods</p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Categories Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold tracking-widest text-rose-600 uppercase">Shop By Category</span>
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-neutral-900 mt-1">Curated Departments</h2>
          </div>
          <button
            onClick={() => onNavigateToShop()}
            className="text-xs font-bold uppercase tracking-wider text-neutral-800 hover:text-rose-600 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <div
              key={cat.id}
              onClick={() => onNavigateToShop(cat.slug)}
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-900 cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-90"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `/img/bg-img/bg-${idx + 2}.jpg`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end">
                <span className="text-[10px] text-rose-300 font-bold uppercase tracking-widest mb-1">Explore</span>
                <h3 className="text-xl font-bold text-white font-serif">{cat.name}</h3>
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-white/90 font-medium group-hover:text-rose-400 transition-colors">
                  <span>Shop Collection</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured / Popular Products Grid with Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold tracking-widest text-rose-600 uppercase">Season Highlights</span>
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-neutral-900 mt-1">Popular In Store</h2>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'dresses', label: 'Dresses' },
              { id: 'clothing', label: 'Clothing' },
              { id: 'shoes', label: 'Footwear' },
              { id: 'accessories', label: 'Accessories' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filterProducts().map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
              onQuickView={onQuickView}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => onNavigateToShop()}
            className="px-8 py-3.5 bg-white border-2 border-neutral-900 hover:bg-neutral-900 hover:text-white text-neutral-900 font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-sm"
          >
            Explore Complete Catalog &rarr;
          </button>
        </div>
      </section>

      {/* Big Promotional Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-neutral-900 text-white shadow-2xl">
          <img
            src="/img/bg-img/bg-7.jpg"
            alt="Mid Season Sale"
            className="w-full h-[400px] object-cover object-center opacity-40"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/70 to-transparent flex items-center">
            <div className="max-w-xl p-8 md:p-14 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500 text-white text-[11px] font-extrabold uppercase tracking-wider">
                <Percent className="w-3.5 h-3.5" />
                Special Limited Offer
              </span>
              <h2 className="text-3xl md:text-5xl font-black font-serif leading-tight">
                Get 20% Off Your First Order
              </h2>
              <p className="text-xs md:text-sm text-neutral-300 leading-relaxed font-light">
                Use code <strong className="text-rose-400 font-mono font-bold">WELCOME20</strong> at checkout to redeem an instant 20% savings on all designer clothing, accessories, and shoes.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onNavigateToShop()}
                  className="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg inline-flex items-center gap-2"
                >
                  <span>Shop The Sale</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Carousel / Marquee */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-y border-neutral-100">
        <p className="text-center text-xs font-bold tracking-widest text-neutral-400 uppercase mb-8">
          Featured Brand Partners
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-8 items-center justify-center opacity-75 grayscale hover:grayscale-0 transition-all">
          {brands.map((brand) => (
            <div key={brand.id} className="flex items-center justify-center p-2 hover:scale-105 transition-transform">
              <img
                src={brand.logo}
                alt={brand.name}
                className="h-7 sm:h-9 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/img/core-img/brand1.png';
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Fashion Journal / Blog Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold tracking-widest text-rose-600 uppercase">Editorial</span>
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-neutral-900 mt-1">From The Journal</h2>
          </div>
          <button
            onClick={() => onNavigateToBlog()}
            className="text-xs font-bold uppercase tracking-wider text-neutral-800 hover:text-rose-600 flex items-center gap-1 group"
          >
            <span>All Articles</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogs.slice(0, 3).map((blog) => (
            <div
              key={blog.id}
              onClick={() => onNavigateToBlog(blog.slug)}
              className="bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col"
            >
              <div className="aspect-[16/10] overflow-hidden bg-neutral-100">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/img/bg-img/blog1.jpg';
                  }}
                />
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    {blog.category}
                  </span>
                  <h3 className="text-base font-bold text-neutral-900 group-hover:text-rose-600 transition-colors mt-2 font-serif line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-2 line-clamp-2 leading-relaxed">
                    {blog.excerpt}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400 font-medium">
                  <span>By {blog.author}</span>
                  <span className="text-rose-600 font-semibold group-hover:translate-x-1 transition-transform">Read Story &rarr;</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-neutral-100 rounded-3xl p-8 md:p-14 text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold tracking-widest text-rose-600 uppercase">Stay Ahead of Trends</span>
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-neutral-900 mt-2">
            Join The Essence Society
          </h2>
          <p className="text-xs md:text-sm text-neutral-500 mt-2 max-w-md mx-auto">
            Receive exclusive seasonal previews, invitations to private showroom events, and 10% off your next purchase.
          </p>

          <form onSubmit={handleNewsletter} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-neutral-900 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Subscribe</span>
            </button>
          </form>

          {newsletterSubmitted && (
            <p className="text-xs text-emerald-600 font-semibold mt-3 flex items-center justify-center gap-1.5 animate-fadeIn">
              <CheckCircle className="w-4 h-4" /> Thank you for subscribing! Your welcome discount code is ESSENCE10.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};
