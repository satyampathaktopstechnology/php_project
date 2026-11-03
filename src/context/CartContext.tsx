import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  discountCode: string;
  discountAmount: number;
  finalTotal: number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  wishlistIds: number[];
  toggleWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('essence_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);

  // Persist cart
  useEffect(() => {
    localStorage.setItem('essence_cart', JSON.stringify(cart));
  }, [cart]);

  // Load wishlist from server if logged in
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!token) {
        // Fallback to local storage
        try {
          const local = localStorage.getItem('essence_wishlist_ids');
          setWishlistIds(local ? JSON.parse(local) : []);
        } catch {
          setWishlistIds([]);
        }
        return;
      }

      try {
        const res = await fetch('/api/wishlist', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.items) {
          setWishlistIds(data.items.map((it: any) => it.id));
        }
      } catch (err) {
        console.error('Failed to fetch wishlist', err);
      }
    };

    fetchWishlist();
  }, [token]);

  const addToCart = (product: Product, quantity = 1, size = 'M', color = '#111827') => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (it) => it.id === product.id && it.size === size && it.color === color
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            id: product.id,
            sku: product.sku,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity,
            size,
            color,
            brand_name: product.brand_name
          }
        ];
      }
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }

    setCart((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index].quantity = quantity;
      }
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    setDiscountCode('');
    setDiscountPercent(0);
    localStorage.removeItem('essence_cart');
  };

  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'ESSENCE10') {
      setDiscountCode('ESSENCE10');
      setDiscountPercent(10);
      return { success: true, message: 'Coupon applied! 10% discount added.' };
    } else if (clean === 'WELCOME20') {
      setDiscountCode('WELCOME20');
      setDiscountPercent(20);
      return { success: true, message: 'Welcome coupon applied! 20% discount added.' };
    } else {
      return { success: false, message: 'Invalid or expired coupon code. Try ESSENCE10 or WELCOME20' };
    }
  };

  const removeCoupon = () => {
    setDiscountCode('');
    setDiscountPercent(0);
  };

  const subtotal = cart.reduce((acc, it) => acc + (it.price * it.quantity), 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const toggleWishlist = async (productId: number) => {
    const isCurrentlySaved = wishlistIds.includes(productId);

    if (token) {
      try {
        const res = await fetch('/api/wishlist/toggle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ product_id: productId })
        });
        const data = await res.json();
        if (data.success) {
          if (data.saved) {
            setWishlistIds((prev) => [...prev, productId]);
          } else {
            setWishlistIds((prev) => prev.filter((id) => id !== productId));
          }
          return;
        }
      } catch (err) {
        console.error('Error toggling wishlist on server', err);
      }
    }

    // Local state toggle
    if (isCurrentlySaved) {
      const next = wishlistIds.filter((id) => id !== productId);
      setWishlistIds(next);
      localStorage.setItem('essence_wishlist_ids', JSON.stringify(next));
    } else {
      const next = [...wishlistIds, productId];
      setWishlistIds(next);
      localStorage.setItem('essence_wishlist_ids', JSON.stringify(next));
    }
  };

  const isInWishlist = (productId: number) => wishlistIds.includes(productId);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        discountCode,
        discountAmount,
        finalTotal,
        applyCoupon,
        removeCoupon,
        isCartOpen,
        setIsCartOpen,
        wishlistIds,
        toggleWishlist,
        isInWishlist
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
