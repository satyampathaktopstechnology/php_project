import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { DemoRoleBar } from './components/DemoRoleBar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { QuickViewModal } from './components/QuickViewModal';
import { SearchModal } from './components/SearchModal';

// Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { WishlistPage } from './pages/WishlistPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { SubscriberAccountPage } from './pages/SubscriberAccountPage';
import { BlogPage } from './pages/BlogPage';
import { ContactPage } from './pages/ContactPage';

import { Product, Category, Brand, BlogPost } from './types';

function MainApp() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string | undefined>(undefined);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // App-wide data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial collections
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes, brandRes, blogRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
          fetch('/api/brands'),
          fetch('/api/blogs')
        ]);

        const [prodData, catData, brandData, blogData] = await Promise.all([
          prodRes.json(),
          catRes.json(),
          brandRes.json(),
          blogRes.json()
        ]);

        if (prodData.success) setProducts(prodData.products || []);
        if (catData.success) setCategories(catData.categories || []);
        if (brandData.success) setBrands(brandData.brands || []);
        if (blogData.success) setBlogs(blogData.blogs || []);
      } catch (err) {
        console.error('Error fetching initial data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelectProduct = (product: Product) => {
    setSelectedProductId(product.id);
    setCurrentTab('product-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToShop = (categorySlug?: string) => {
    if (categorySlug) {
      setCurrentTab(categorySlug);
    } else {
      setCurrentTab('shop');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToBlog = (slug?: string) => {
    setSelectedBlogSlug(slug);
    setCurrentTab('blog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-neutral-900 font-sans selection:bg-rose-500 selection:text-white">
      {/* 1. Quick Switcher Bar for Role-Based Access testing */}
      <DemoRoleBar />

      {/* 2. Responsive Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* 3. Main Dynamic Content Switcher */}
      <main className="flex-1">
        {loading ? (
          <div className="py-32 text-center">
            <div className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-neutral-500">Preparing Essence boutique collection...</p>
          </div>
        ) : (
          <>
            {currentTab === 'home' && (
              <HomePage
                products={products}
                categories={categories}
                brands={brands}
                blogs={blogs}
                onSelectProduct={handleSelectProduct}
                onQuickView={setQuickViewProduct}
                onNavigateToShop={handleNavigateToShop}
                onNavigateToBlog={handleNavigateToBlog}
              />
            )}

            {currentTab === 'shop' && (
              <ShopPage
                products={products}
                categories={categories}
                brands={brands}
                onSelectProduct={handleSelectProduct}
                onQuickView={setQuickViewProduct}
              />
            )}

            {currentTab === 'dresses' && (
              <ShopPage
                products={products}
                categories={categories}
                brands={brands}
                initialCategory="dresses"
                onSelectProduct={handleSelectProduct}
                onQuickView={setQuickViewProduct}
              />
            )}

            {currentTab === 'shoes' && (
              <ShopPage
                products={products}
                categories={categories}
                brands={brands}
                initialCategory="shoes"
                onSelectProduct={handleSelectProduct}
                onQuickView={setQuickViewProduct}
              />
            )}

            {currentTab === 'accessories' && (
              <ShopPage
                products={products}
                categories={categories}
                brands={brands}
                initialCategory="accessories"
                onSelectProduct={handleSelectProduct}
                onQuickView={setQuickViewProduct}
              />
            )}

            {currentTab === 'product-details' && selectedProductId && (
              <ProductDetailsPage
                productId={selectedProductId}
                onSelectProduct={handleSelectProduct}
                onQuickView={setQuickViewProduct}
                onNavigateToShop={() => setCurrentTab('shop')}
              />
            )}

            {currentTab === 'wishlist' && (
              <WishlistPage
                onSelectProduct={handleSelectProduct}
                onNavigateToShop={() => setCurrentTab('shop')}
              />
            )}

            {currentTab === 'checkout' && (
              <CheckoutPage
                onOrderSuccess={(_orderId, _orderNumber) => {
                  // After order placed
                }}
                onNavigateToShop={() => setCurrentTab('shop')}
              />
            )}

            {currentTab === 'admin' && (
              <AdminDashboardPage
                onNavigateToShop={() => setCurrentTab('shop')}
                onNavigateToAccount={() => setCurrentTab('account')}
              />
            )}

            {currentTab === 'account' && (
              <SubscriberAccountPage
                onNavigateToShop={() => setCurrentTab('shop')}
                onNavigateToWishlist={() => setCurrentTab('wishlist')}
              />
            )}

            {currentTab === 'blog' && (
              <BlogPage
                blogs={blogs}
                selectedBlogSlug={selectedBlogSlug}
                onSelectBlog={setSelectedBlogSlug}
                onNavigateToShop={() => setCurrentTab('shop')}
              />
            )}

            {currentTab === 'contact' && (
              <ContactPage />
            )}
          </>
        )}
      </main>

      {/* 4. Footer */}
      <Footer onNavigate={(tab) => {
        setCurrentTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} />

      {/* 5. Global Drawers & Modals */}
      <CartDrawer
        onNavigateToCheckout={() => setCurrentTab('checkout')}
        onNavigateToShop={() => setCurrentTab('shop')}
      />

      <AuthModal />

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onViewFullDetails={handleSelectProduct}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={handleSelectProduct}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
