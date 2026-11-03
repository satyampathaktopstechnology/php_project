import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  ShoppingBag,
  Heart,
  User as UserIcon,
  Search,
  Menu,
  X,
  Shield,
  LayoutDashboard,
  LogOut,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenSearch }) => {
  const { user, logout, setIsAuthModalOpen, setAuthModalMode, hasRole } = useAuth();
  const { cart, wishlistIds, setIsCartOpen, subtotal } = useCart();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlistIds.length;

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'shop', label: 'Shop' },
    { id: 'dresses', label: 'Dresses' },
    { id: 'shoes', label: 'Shoes' },
    { id: 'accessories', label: 'Accessories' },
    { id: 'blog', label: 'Blog' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-100 shadow-xs">
      {/* Top Banner Announcement */}
      <div className="bg-neutral-900 text-white text-[11px] py-1.5 px-4 text-center tracking-wider font-medium flex items-center justify-center gap-2">
        <span className="hidden sm:inline">✨ <strong>ESSENCE SPRING COLLECTION</strong>: Complimentary Express Shipping Across India.</span>
        <span className="bg-rose-600 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Use Code: ESSENCE10</span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-neutral-700 hover:text-neutral-900"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => setCurrentTab('home')}
              className="flex items-center gap-2 text-left group"
            >
              <img
                src="/img/core-img/logo.png"
                alt="Essence"
                className="h-8 md:h-9 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <span className="font-serif font-black text-2xl tracking-widest text-neutral-900 group-hover:text-rose-600 transition-colors">
                ESSENCE
              </span>
            </button>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-7">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => setCurrentTab(link.id)}
                className={`text-xs font-semibold uppercase tracking-widest transition-all py-1.5 border-b-2 ${
                  currentTab === link.id
                    ? 'border-neutral-900 text-neutral-900 font-bold'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300'
                }`}
              >
                {link.label}
              </button>
            ))}

            {/* Admin or Editor dashboard link */}
            {hasRole(['admin', 'editor']) && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentTab === 'admin'
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard ({user?.role.toUpperCase()})</span>
              </button>
            )}

            {/* Subscriber My Orders link */}
            {user?.role === 'subscriber' && (
              <button
                onClick={() => setCurrentTab('account')}
                className={`text-xs font-semibold uppercase tracking-wider py-1.5 border-b-2 ${
                  currentTab === 'account'
                    ? 'border-neutral-900 text-neutral-900'
                    : 'border-transparent text-emerald-700 hover:text-emerald-900'
                }`}
              >
                My Account
              </button>
            )}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Search Button */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors"
              title="Search products"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => setCurrentTab('wishlist')}
              className="p-2 text-neutral-600 hover:text-rose-600 relative transition-colors"
              title="Wishlist"
              aria-label="Wishlist"
            >
              <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'text-rose-600 fill-rose-100' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-all relative text-neutral-800"
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-neutral-900" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden md:inline font-bold text-xs text-neutral-900">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </button>

            {/* User Profile / Auth */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 p-1 rounded-full border border-neutral-200 hover:border-neutral-400 transition-all"
                  >
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-500 mr-1 hidden sm:inline" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-neutral-100 py-2 z-50 animate-fadeIn"
                      onMouseLeave={() => setIsUserMenuOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-neutral-100">
                        <p className="text-xs font-bold text-neutral-800">{user.name}</p>
                        <p className="text-[11px] text-neutral-400 truncate">{user.email}</p>
                        <span className={`inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          user.role === 'admin' ? 'bg-rose-100 text-rose-700' : user.role === 'editor' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {user.role} role
                        </span>
                      </div>

                      {hasRole(['admin', 'editor']) && (
                        <button
                          onClick={() => {
                            setCurrentTab('admin');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 font-medium"
                        >
                          <LayoutDashboard className="w-4 h-4 text-neutral-500" />
                          <span>Admin &amp; Analytics Dashboard</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setCurrentTab('account');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 font-medium"
                      >
                        <UserIcon className="w-4 h-4 text-neutral-500" />
                        <span>My Account &amp; Orders</span>
                      </button>

                      <div className="border-t border-neutral-100 my-1"></div>

                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-neutral-900 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-100 bg-white px-4 pt-3 pb-6 space-y-2 animate-fadeIn">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                setCurrentTab(link.id);
                setIsMobileMenuOpen(false);
              }}
              className={`block w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold uppercase tracking-wider ${
                currentTab === link.id
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {link.label}
            </button>
          ))}

          {hasRole(['admin', 'editor']) && (
            <button
              onClick={() => {
                setCurrentTab('admin');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Admin Dashboard ({user?.role.toUpperCase()})</span>
            </button>
          )}

          {user?.role === 'subscriber' && (
            <button
              onClick={() => {
                setCurrentTab('account');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              My Account &amp; Order History
            </button>
          )}
        </div>
      )}
    </header>
  );
};
