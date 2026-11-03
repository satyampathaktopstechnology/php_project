import React from 'react';
import { ShieldCheck, Heart, ArrowUp } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-neutral-950 text-neutral-400 text-xs border-t border-neutral-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info (2 Cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-2xl tracking-widest text-white">
                ESSENCE
              </span>
            </div>
            <p className="text-neutral-400 leading-relaxed max-w-sm">
              Curating elevated fashion since 2018. Designed with timeless tailoring, sustainable fabrics, and effortless contemporary silhouette engineering.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] text-neutral-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Secured by Razorpay Payments &bull; 256-Bit SSL Protection</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-widest text-xs">Shop Departments</h4>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">Complete Catalog</button></li>
              <li><button onClick={() => onNavigate('dresses')} className="hover:text-white transition-colors">Evening &amp; Day Dresses</button></li>
              <li><button onClick={() => onNavigate('shoes')} className="hover:text-white transition-colors">Artisanal Footwear</button></li>
              <li><button onClick={() => onNavigate('accessories')} className="hover:text-white transition-colors">Bags &amp; Accessories</button></li>
              <li><button onClick={() => onNavigate('wishlist')} className="hover:text-white transition-colors">Personal Wishlist</button></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-widest text-xs">Customer Care</h4>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">Contact &amp; Showrooms</button></li>
              <li><button onClick={() => onNavigate('account')} className="hover:text-white transition-colors">Track Order Delivery</button></li>
              <li><button onClick={() => onNavigate('blog')} className="hover:text-white transition-colors">Fashion Editorial</button></li>
              <li><span className="text-neutral-500">Free Express Shipping in India</span></li>
              <li><span className="text-neutral-500">30-Day Hassle-Free Returns</span></li>
            </ul>
          </div>

          {/* Portal Management */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-widest text-xs">Portal &amp; Security</h4>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate('admin')} className="hover:text-rose-400 font-semibold transition-colors">Admin &amp; Analytics Dashboard</button></li>
              <li><button onClick={() => onNavigate('account')} className="hover:text-white transition-colors">Subscriber Portal</button></li>
              <li><span className="text-neutral-500">SQL Injection Prepared Statements</span></li>
              <li><span className="text-neutral-500">Real-Time Razorpay Webhooks</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-400">
          <p>&copy; {new Date().getFullYear()} Essence Fashion Store. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <span className="text-neutral-400">Accepted: UPI &bull; Cards &bull; NetBanking &bull; COD</span>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white transition-colors"
              title="Scroll to top"
              aria-label="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
