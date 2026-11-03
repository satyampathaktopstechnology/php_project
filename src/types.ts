export type UserRole = 'admin' | 'editor' | 'subscriber';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  phone?: string | null;
  created_at?: string;
}

export interface Product {
  id: number;
  sku: string;
  brand_id: number;
  brand_name?: string;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  name: string;
  price: number;
  old_price?: number | null;
  description: string;
  material?: string;
  image: string;
  gallery?: string;
  stock_quantity: number;
  is_featured: number;
  is_popular: number;
  rating: number;
  review_count: number;
  sizes?: string;
  colors?: string;
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
}

export interface Brand {
  id: number;
  name: string;
  logo: string;
  description?: string;
}

export interface CartItem {
  id: number;
  sku?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  brand_name?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id?: number | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  state: string;
  pincode: string;
  subtotal: number;
  discount: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: string;
  payment_status: 'unpaid' | 'paid' | 'refunded' | 'failed';
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  created_at: string;
  items?: OrderItem[];
}

export interface Review {
  id: number;
  product_id: number;
  user_id?: number | null;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  category: string;
  author: string;
  excerpt: string;
  content: string;
  image: string;
  views: number;
  created_at: string;
}

export interface AnalyticsData {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    deliveredOrders: number;
    totalCustomers: number;
    averageOrderValue: number;
    conversionRate: string;
  };
  orderBreakdown: {
    total_orders: number;
    pending_orders: number;
    processing_orders: number;
    shipped_orders: number;
    delivered_orders: number;
    cancelled_orders: number;
  };
  salesTrends: { date: string; revenue: number; orders: number }[];
  topProducts: {
    product_id: number;
    product_name: string;
    image: string;
    units_sold: number;
    total_sales: number;
  }[];
  categoryStats: { name: string; product_count: number }[];
  deviceStats: { device_type: string; count: number }[];
  recentLogs: {
    id: number;
    event_type: string;
    page_url: string;
    user_name: string | null;
    user_role: string | null;
    device_type: string | null;
    created_at: string;
  }[];
}
