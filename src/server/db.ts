import Database from 'better-sqlite3';
import path from 'path';
import crypto from 'crypto';

const dbPath = path.resolve(process.cwd(), 'essence_app/fashion_store.sqlite');
export const db = new Database(dbPath);

// Enable WAL mode for high performance concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_essence_salt').digest('hex');
}

export function initDatabase() {
  // Create tables using prepared statement execution
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'editor', 'subscriber')),
      avatar TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_active DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      logo TEXT,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      image TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT UNIQUE,
      brand_id INTEGER REFERENCES brands(id),
      category_id INTEGER REFERENCES categories(id),
      name TEXT NOT NULL,
      price REAL NOT NULL,
      old_price REAL,
      description TEXT,
      material TEXT,
      image TEXT NOT NULL,
      gallery TEXT,
      stock_quantity INTEGER NOT NULL DEFAULT 10,
      is_featured INTEGER DEFAULT 0,
      is_popular INTEGER DEFAULT 0,
      rating REAL DEFAULT 4.5,
      review_count INTEGER DEFAULT 12,
      sizes TEXT DEFAULT '["S","M","L","XL"]',
      colors TEXT DEFAULT '["#111827","#e11d48","#2563eb","#10b981"]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      user_id INTEGER REFERENCES users(id),
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      subtotal REAL NOT NULL,
      discount REAL DEFAULT 0,
      total REAL NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')) DEFAULT 'processing',
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL CHECK(payment_status IN ('unpaid', 'paid', 'refunded', 'failed')) DEFAULT 'unpaid',
      razorpay_order_id TEXT,
      razorpay_payment_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id),
      product_name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      size TEXT,
      color TEXT,
      image TEXT
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      payment_id TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'INR',
      status TEXT NOT NULL DEFAULT 'paid',
      method TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS wishlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id),
      user_name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      comment TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'unread',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      author TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      image TEXT NOT NULL,
      views INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      page_url TEXT,
      product_id INTEGER,
      user_id INTEGER,
      device_type TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedInitialData();
}

function seedInitialData() {
  // Check users count with prepared statement
  const userCountStmt = db.prepare('SELECT COUNT(*) as count FROM users');
  const userCount = (userCountStmt.get() as { count: number }).count;

  if (userCount === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, avatar, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertUser.run(
      'Administrator Vance',
      'admin@essence.com',
      hashPassword('admin123'),
      'admin',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      '+91 98765 43210'
    );

    insertUser.run(
      'Sophia Editor',
      'editor@essence.com',
      hashPassword('editor123'),
      'editor',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
      '+91 98765 43211'
    );

    insertUser.run(
      'Jessica Taylor',
      'customer@essence.com',
      hashPassword('customer123'),
      'subscriber',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
      '+91 98765 43212'
    );
  }

  // Check brands
  const brandCountStmt = db.prepare('SELECT COUNT(*) as count FROM brands');
  const brandCount = (brandCountStmt.get() as { count: number }).count;

  if (brandCount === 0) {
    const insertBrand = db.prepare('INSERT INTO brands (name, logo, description) VALUES (?, ?, ?)');
    insertBrand.run('Mango', '/img/core-img/brand1.png', 'Modern European fast-fashion');
    insertBrand.run('Zara', '/img/core-img/brand2.png', 'Trendsetting contemporary apparel');
    insertBrand.run('H&M', '/img/core-img/brand3.png', 'Sustainable daily essentials');
    insertBrand.run('Asos', '/img/core-img/brand4.png', 'Youth fashion and festival looks');
    insertBrand.run('Bershka', '/img/core-img/brand5.png', 'Streetwear & denim culture');
    insertBrand.run('Topshop', '/img/core-img/brand6.png', 'Chic British high street icon');
  }

  // Check categories
  const categoryCountStmt = db.prepare('SELECT COUNT(*) as count FROM categories');
  const categoryCount = (categoryCountStmt.get() as { count: number }).count;

  if (categoryCount === 0) {
    const insertCat = db.prepare('INSERT INTO categories (name, slug, image) VALUES (?, ?, ?)');
    insertCat.run('Clothing', 'clothing', '/img/bg-img/bg-2.jpg');
    insertCat.run('Shoes', 'shoes', '/img/bg-img/bg-3.jpg');
    insertCat.run('Accessories', 'accessories', '/img/bg-img/bg-4.jpg');
    insertCat.run('Dresses', 'dresses', '/img/bg-img/bg-5.jpg');
  }

  // Check products
  const productCountStmt = db.prepare('SELECT COUNT(*) as count FROM products');
  const productCount = (productCountStmt.get() as { count: number }).count;

  if (productCount === 0) {
    const insertProduct = db.prepare(`
      INSERT INTO products (
        sku, brand_id, category_id, name, price, old_price, description, material,
        image, gallery, stock_quantity, is_featured, is_popular, rating, review_count, sizes, colors
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const products = [
      {
        sku: 'ESS-001',
        brand_id: 1,
        category_id: 4,
        name: 'Floral Bohemian Wrap Dress',
        price: 1899,
        old_price: 2499,
        description: 'Lightweight, flowy silhouette crafted with breathable organic cotton blend. Features vibrant botanical motifs, adjustable waist tie, and flutter sleeves suitable for daytime elegance or summer evenings.',
        material: '100% Organic Cotton',
        image: '/img/product-img/product-1.jpg',
        gallery: JSON.stringify(['/img/product-img/product-1.jpg', '/img/product-img/product-big-1.jpg', '/img/product-img/product-2.jpg']),
        stock: 24,
        featured: 1,
        popular: 1,
        rating: 4.8,
        reviews: 38
      },
      {
        sku: 'ESS-002',
        brand_id: 2,
        category_id: 1,
        name: 'Tailored Linen Oversized Blazer',
        price: 3499,
        old_price: 4299,
        description: 'Impeccably tailored boyfriend blazer with double-breasted horn buttons, notched lapels, and flap pockets. Pair with matching trousers or casual denim.',
        material: '70% French Linen, 30% Lyocell',
        image: '/img/product-img/product-2.jpg',
        gallery: JSON.stringify(['/img/product-img/product-2.jpg', '/img/product-img/product-big-2.jpg', '/img/product-img/product-3.jpg']),
        stock: 15,
        featured: 1,
        popular: 1,
        rating: 4.9,
        reviews: 52
      },
      {
        sku: 'ESS-003',
        brand_id: 3,
        category_id: 1,
        name: 'Ribbed Knit Midi Slip Dress',
        price: 1499,
        old_price: 1999,
        description: 'Form-flattering ribbed texture knit featuring a subtle side slit and delicate spaghetti straps. Stretchy, comfortable, and endlessly versatile.',
        material: '95% Viscose, 5% Elastane',
        image: '/img/product-img/product-3.jpg',
        gallery: JSON.stringify(['/img/product-img/product-3.jpg', '/img/product-img/product-big-3.jpg', '/img/product-img/product-4.jpg']),
        stock: 40,
        featured: 1,
        popular: 0,
        rating: 4.6,
        reviews: 29
      },
      {
        sku: 'ESS-004',
        brand_id: 4,
        category_id: 3,
        name: 'Quilted Leather Crossbody Bag',
        price: 2199,
        old_price: 2899,
        description: 'Chic quilted finish with gold-toned chain strap, turn-lock closure, and dual internal compartments for smartphone, cards, and daily essentials.',
        material: 'Vegan Faux Leather & Gold Alloy Hardware',
        image: '/img/product-img/product-4.jpg',
        gallery: JSON.stringify(['/img/product-img/product-4.jpg', '/img/product-img/product-5.jpg']),
        stock: 18,
        featured: 0,
        popular: 1,
        rating: 4.7,
        reviews: 44
      },
      {
        sku: 'ESS-005',
        brand_id: 5,
        category_id: 2,
        name: 'Minimalist Strappy Heel Sandals',
        price: 2699,
        old_price: 3199,
        description: 'Contemporary square-toe block heel with slim criss-cross ankle ties and padded insole for all-day cushioning and sleek night-out flair.',
        material: 'Supple Synthetic Leather & Rubber Sole',
        image: '/img/product-img/product-5.jpg',
        gallery: JSON.stringify(['/img/product-img/product-5.jpg', '/img/product-img/product-6.jpg']),
        stock: 22,
        featured: 1,
        popular: 1,
        rating: 4.5,
        reviews: 21
      },
      {
        sku: 'ESS-006',
        brand_id: 6,
        category_id: 1,
        name: 'High-Rise Vintage Straight Jeans',
        price: 1999,
        old_price: 2599,
        description: 'Classic 90s inspired straight leg silhouette with raw cut hem, structured non-stretch denim that molds to your natural body over time.',
        material: '100% Rigid Denim Cotton',
        image: '/img/product-img/product-6.jpg',
        gallery: JSON.stringify(['/img/product-img/product-6.jpg', '/img/product-img/product-7.jpg']),
        stock: 30,
        featured: 0,
        popular: 1,
        rating: 4.8,
        reviews: 67
      },
      {
        sku: 'ESS-007',
        brand_id: 1,
        category_id: 4,
        name: 'Emerald Satin Evening Maxi Dress',
        price: 3899,
        old_price: 4999,
        description: 'Rich jewel-toned liquid satin draping with cowl neckline, low open back, and cascading floor-length skirt designed for gala and red carpet presence.',
        material: 'Polyester Heavy Silk Satin',
        image: '/img/product-img/product-7.jpg',
        gallery: JSON.stringify(['/img/product-img/product-7.jpg', '/img/product-img/product-8.jpg']),
        stock: 12,
        featured: 1,
        popular: 1,
        rating: 4.9,
        reviews: 83
      },
      {
        sku: 'ESS-008',
        brand_id: 2,
        category_id: 3,
        name: 'Handcrafted Woven Straw Tote Bag',
        price: 1299,
        old_price: 1799,
        description: 'Summer beachside essential woven from natural palm fronds with leather-look round handles and drawstring cotton privacy liner.',
        material: 'Natural Rattan & Cotton Lining',
        image: '/img/product-img/product-8.jpg',
        gallery: JSON.stringify(['/img/product-img/product-8.jpg', '/img/product-img/product-9.jpg']),
        stock: 25,
        featured: 0,
        popular: 0,
        rating: 4.4,
        reviews: 19
      },
      {
        sku: 'ESS-009',
        brand_id: 3,
        category_id: 1,
        name: 'Cashmere Blend Turtleneck Sweater',
        price: 2499,
        old_price: 3299,
        description: 'Ultra-soft, non-itch knit pullover with relaxed dropped shoulders and ribbed cuffs. Provides cozy warmth with luxurious featherlight weight.',
        material: '30% Mongolian Cashmere, 70% Merino Wool',
        image: '/img/product-img/product-9.jpg',
        gallery: JSON.stringify(['/img/product-img/product-9.jpg', '/img/product-img/product-1.jpg']),
        stock: 16,
        featured: 1,
        popular: 1,
        rating: 4.9,
        reviews: 41
      }
    ];

    for (const p of products) {
      insertProduct.run(
        p.sku,
        p.brand_id,
        p.category_id,
        p.name,
        p.price,
        p.old_price,
        p.description,
        p.material,
        p.image,
        p.gallery,
        p.stock,
        p.featured,
        p.popular,
        p.rating,
        p.reviews,
        JSON.stringify(['S', 'M', 'L', 'XL']),
        JSON.stringify(['#111827', '#e11d48', '#2563eb', '#10b981'])
      );
    }
  }

  // Seed sample reviews
  const reviewCountStmt = db.prepare('SELECT COUNT(*) as count FROM reviews');
  const reviewCount = (reviewCountStmt.get() as { count: number }).count;
  if (reviewCount === 0) {
    const insertReview = db.prepare(`
      INSERT INTO reviews (product_id, user_id, user_name, rating, comment, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now', ?))
    `);

    insertReview.run(1, 3, 'Jessica Taylor', 5, 'The fabric quality is breathtaking! Fits like a dream and the print is so rich in person.', '-2 days');
    insertReview.run(1, 2, 'Ananya Sharma', 5, 'Wore this to a garden wedding and received endless compliments. True to size!', '-5 days');
    insertReview.run(2, 3, 'Priya Mehta', 5, 'Outstanding tailoring. Crisp linen that doesn’t crease too excessively. Worth every rupee.', '-1 day');
    insertReview.run(3, 3, 'Rhea Sen', 4, 'Very flattering knit and comfortable all day long. Delivery was super fast via Razorpay checkout!', '-3 days');
  }

  // Seed sample orders & payments
  const orderCountStmt = db.prepare('SELECT COUNT(*) as count FROM orders');
  const orderCount = (orderCountStmt.get() as { count: number }).count;

  if (orderCount === 0) {
    const insertOrder = db.prepare(`
      INSERT INTO orders (
        order_number, user_id, customer_name, customer_email, customer_phone,
        shipping_address, city, state, pincode, subtotal, discount, total,
        status, payment_method, payment_status, razorpay_order_id, razorpay_payment_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))
    `);

    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, price, quantity, size, color, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertPayment = db.prepare(`
      INSERT INTO payments (order_id, payment_id, amount, currency, status, method, created_at)
      VALUES (?, ?, ?, 'INR', ?, ?, datetime('now', ?))
    `);

    // Sample Order 1
    const res1 = insertOrder.run(
      'ORD-82914',
      3,
      'Jessica Taylor',
      'customer@essence.com',
      '+91 98765 43212',
      '42 Rosewood Boulevard, Apartment 3B',
      'Mumbai',
      'Maharashtra',
      '400050',
      5398,
      500,
      4898,
      'delivered',
      'razorpay',
      'paid',
      'order_test_82914',
      'pay_test_82914_xyz',
      '-6 days'
    );
    const orderId1 = Number(res1.lastInsertRowid);
    insertItem.run(orderId1, 1, 'Floral Bohemian Wrap Dress', 1899, 1, 'M', '#e11d48', '/img/product-img/product-1.jpg');
    insertItem.run(orderId1, 2, 'Tailored Linen Oversized Blazer', 3499, 1, 'L', '#111827', '/img/product-img/product-2.jpg');
    insertPayment.run(orderId1, 'pay_test_82914_xyz', 4898, 'paid', 'upi_razorpay', '-6 days');

    // Sample Order 2
    const res2 = insertOrder.run(
      'ORD-91042',
      3,
      'Jessica Taylor',
      'customer@essence.com',
      '+91 98765 43212',
      '42 Rosewood Boulevard, Apartment 3B',
      'Mumbai',
      'Maharashtra',
      '400050',
      3899,
      0,
      3899,
      'shipped',
      'razorpay',
      'paid',
      'order_test_91042',
      'pay_test_91042_abc',
      '-3 days'
    );
    const orderId2 = Number(res2.lastInsertRowid);
    insertItem.run(orderId2, 7, 'Emerald Satin Evening Maxi Dress', 3899, 1, 'S', '#10b981', '/img/product-img/product-7.jpg');
    insertPayment.run(orderId2, 'pay_test_91042_abc', 3899, 'paid', 'card_razorpay', '-3 days');

    // Sample Order 3
    const res3 = insertOrder.run(
      'ORD-94301',
      3,
      'Jessica Taylor',
      'customer@essence.com',
      '+91 98765 43212',
      '42 Rosewood Boulevard, Apartment 3B',
      'Mumbai',
      'Maharashtra',
      '400050',
      2199,
      200,
      1999,
      'processing',
      'cod',
      'unpaid',
      null,
      null,
      '-1 day'
    );
    const orderId3 = Number(res3.lastInsertRowid);
    insertItem.run(orderId3, 4, 'Quilted Leather Crossbody Bag', 2199, 1, 'Standard', '#111827', '/img/product-img/product-4.jpg');

    // Sample Order 4
    const res4 = insertOrder.run(
      'ORD-97520',
      2,
      'Sophia Martinez',
      'editor@essence.com',
      '+91 98765 43211',
      '18 Park Lane, Jubilee Hills',
      'Hyderabad',
      'Telangana',
      '500033',
      4198,
      400,
      3798,
      'delivered',
      'razorpay',
      'paid',
      'order_test_97520',
      'pay_test_97520_mno',
      '-12 days'
    );
    const orderId4 = Number(res4.lastInsertRowid);
    insertItem.run(orderId4, 5, 'Minimalist Strappy Heel Sandals', 2699, 1, '38', '#111827', '/img/product-img/product-5.jpg');
    insertItem.run(orderId4, 3, 'Ribbed Knit Midi Slip Dress', 1499, 1, 'M', '#2563eb', '/img/product-img/product-3.jpg');
    insertPayment.run(orderId4, 'pay_test_97520_mno', 3798, 'paid', 'netbanking_razorpay', '-12 days');
  }

  // Seed sample blogs
  const blogCountStmt = db.prepare('SELECT COUNT(*) as count FROM blog_posts');
  const blogCount = (blogCountStmt.get() as { count: number }).count;
  if (blogCount === 0) {
    const insertBlog = db.prepare(`
      INSERT INTO blog_posts (title, slug, category, author, excerpt, content, image, views, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))
    `);

    insertBlog.run(
      'Sustainable Luxury: The Evolution of Conscious Wardrobes',
      'sustainable-luxury-wardrobes',
      'Sustainability',
      'Sophia Martinez',
      'How modern designers are redefining haute couture through low-impact textiles, zero-waste patterning, and closed-loop manufacturing.',
      'Fashion is at a pivotal crossroads. For decades, consumer culture prioritized velocity and novelty over longevity. Today, discerning fashion aficionados are demanding radical transparency, biodegradable organic cottons, and timeless investment silhouettes. At Essence, our artisanal partner studios source exclusively certified yarns to guarantee beauty without compromise.',
      '/img/bg-img/blog1.jpg',
      1420,
      '-4 days'
    );

    insertBlog.run(
      'Runway to Sidewalk: Top Autumn Color Palettes Decoded',
      'autumn-color-palettes',
      'Trends',
      'Alexander Vance',
      'From earthy terracotta to electrifying cobalt accents, explore the tones steering this season’s international street style.',
      'Step into the golden hour of autumn fashion. The prevailing palette balances warm desert neutrals with sudden shocks of electric vibrancy. Discover how to layer tonal outerwear with contrasting leather accessories for a striking, effortless presence.',
      '/img/bg-img/blog2.jpg',
      2180,
      '-8 days'
    );

    insertBlog.run(
      'The Capsule Wardrobe: 10 Essential Pieces Every Woman Needs',
      'capsule-wardrobe-essentials',
      'Style Guide',
      'Jessica Taylor',
      'Streamline your daily dressing ritual with these timeless, high-mileage wardrobe pillars that mix and match effortlessly.',
      'A true capsule wardrobe is not about restriction—it is about liberation. When every blazer, tailored trouser, crisp poplin shirt, and structured slip dress harmonizes with one another, getting dressed in the morning becomes an invigorating art form rather than a chore.',
      '/img/bg-img/blog3.jpg',
      3560,
      '-14 days'
    );
  }

  // Seed sample activity logs for analytics
  const logCountStmt = db.prepare('SELECT COUNT(*) as count FROM activity_logs');
  const logCount = (logCountStmt.get() as { count: number }).count;
  if (logCount === 0) {
    const insertLog = db.prepare(`
      INSERT INTO activity_logs (event_type, page_url, product_id, user_id, device_type, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now', ?))
    `);

    const days = ['-0 hours', '-2 hours', '-5 hours', '-1 day', '-2 days', '-3 days', '-4 days', '-5 days', '-6 days', '-10 days', '-15 days'];
    const devices = ['desktop', 'mobile', 'tablet'];

    for (const d of days) {
      insertLog.run('page_view', '/', null, null, devices[Math.floor(Math.random() * 3)], d);
      insertLog.run('page_view', '/shop', null, null, devices[Math.floor(Math.random() * 3)], d);
      insertLog.run('product_view', '/product/1', 1, 3, devices[Math.floor(Math.random() * 3)], d);
      insertLog.run('product_view', '/product/2', 2, null, devices[Math.floor(Math.random() * 3)], d);
      insertLog.run('add_to_cart', '/shop', 1, 3, devices[Math.floor(Math.random() * 3)], d);
      insertLog.run('checkout_start', '/checkout', null, 3, devices[Math.floor(Math.random() * 3)], d);
      insertLog.run('order_placed', '/checkout', null, 3, devices[Math.floor(Math.random() * 3)], d);
    }
  }
}
