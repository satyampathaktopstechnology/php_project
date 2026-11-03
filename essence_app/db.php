<?php
/**
 * Essence Fashion Store - Simple, Secure Database Connection with Prepared Statements
 * Uses PDO with SQLite for zero-config reliability, full SQL injection protection, and portability.
 */

$database_file = __DIR__ . '/fashion_store.sqlite';

try {
    $conn = new PDO("sqlite:" . $database_file);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false); // Enforce true parameterized queries
    $conn->exec("PRAGMA foreign_keys = ON;");
} catch (PDOException $e) {
    die("Database Connection Error: " . $e->getMessage());
}

// Function to auto-initialize and seed tables if first run
function init_essence_database($conn) {
    $conn->exec("
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
            stock_quantity INTEGER NOT NULL DEFAULT 10,
            is_featured INTEGER DEFAULT 0,
            is_popular INTEGER DEFAULT 0,
            rating REAL DEFAULT 4.5,
            review_count INTEGER DEFAULT 12,
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
            status TEXT NOT NULL DEFAULT 'processing',
            payment_method TEXT NOT NULL,
            payment_status TEXT NOT NULL DEFAULT 'unpaid',
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
            size TEXT DEFAULT 'M',
            color TEXT DEFAULT '#111827',
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
            rating INTEGER NOT NULL,
            comment TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS contact_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT NOT NULL,
            message TEXT NOT NULL,
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
            user_id INTEGER,
            product_id INTEGER REFERENCES products(id),
            device_type TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    ");

    // Check if initial users exist using prepared statement
    $stmt = $conn->prepare("SELECT COUNT(*) AS total FROM users");
    $stmt->execute();
    if ($stmt->fetch()['total'] == 0) {
        $insertUser = $conn->prepare("INSERT INTO users (name, email, password_hash, role, avatar, phone) VALUES (?, ?, ?, ?, ?, ?)");
        
        $insertUser->execute([
            'Alexander Vance (Admin)',
            'admin@essence.com',
            password_hash('admin123', PASSWORD_BCRYPT),
            'admin',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
            '+91 98765 43210'
        ]);

        $insertUser->execute([
            'Sophia Martinez (Editor)',
            'editor@essence.com',
            password_hash('editor123', PASSWORD_BCRYPT),
            'editor',
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
            '+91 98765 43211'
        ]);

        $insertUser->execute([
            'Jessica Taylor (Subscriber)',
            'customer@essence.com',
            password_hash('customer123', PASSWORD_BCRYPT),
            'subscriber',
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
            '+91 98765 43212'
        ]);
    }

    // Check brands
    $stmt = $conn->prepare("SELECT COUNT(*) AS total FROM brands");
    $stmt->execute();
    if ($stmt->fetch()['total'] == 0) {
        $insertBrand = $conn->prepare("INSERT INTO brands (name, logo, description) VALUES (?, ?, ?)");
        $insertBrand->execute(['Mango', 'img/core-img/brand1.png', 'Modern European fashion']);
        $insertBrand->execute(['Zara', 'img/core-img/brand2.png', 'Trendsetting contemporary apparel']);
        $insertBrand->execute(['H&M', 'img/core-img/brand3.png', 'Sustainable daily essentials']);
        $insertBrand->execute(['Asos', 'img/core-img/brand4.png', 'Youth street & festival looks']);
        $insertBrand->execute(['Bershka', 'img/core-img/brand5.png', 'Streetwear & denim culture']);
        $insertBrand->execute(['Topshop', 'img/core-img/brand6.png', 'Chic British icon']);
    }

    // Check categories
    $stmt = $conn->prepare("SELECT COUNT(*) AS total FROM categories");
    $stmt->execute();
    if ($stmt->fetch()['total'] == 0) {
        $insertCat = $conn->prepare("INSERT INTO categories (name, slug, image) VALUES (?, ?, ?)");
        $insertCat->execute(['Clothing', 'clothing', 'img/bg-img/bg-2.jpg']);
        $insertCat->execute(['Shoes', 'shoes', 'img/bg-img/bg-3.jpg']);
        $insertCat->execute(['Accessories', 'accessories', 'img/bg-img/bg-4.jpg']);
        $insertCat->execute(['Dresses', 'dresses', 'img/bg-img/bg-5.jpg']);
    }

    // Check products
    $stmt = $conn->prepare("SELECT COUNT(*) AS total FROM products");
    $stmt->execute();
    if ($stmt->fetch()['total'] == 0) {
        $insertProd = $conn->prepare("
            INSERT INTO products (sku, brand_id, category_id, name, price, old_price, description, material, image, stock_quantity, is_featured, is_popular, rating, review_count)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $insertProd->execute(['ESS-001', 1, 4, 'Floral Bohemian Wrap Dress', 1899, 2499, 'Lightweight silhouette with breathable organic cotton blend, flutter sleeves and tie waist.', '100% Organic Cotton', 'img/product-img/product-1.jpg', 24, 1, 1, 4.8, 38]);
        $insertProd->execute(['ESS-002', 2, 1, 'Tailored Linen Oversized Blazer', 3499, 4299, 'Impeccably tailored boyfriend blazer with horn buttons and notched lapels.', '70% French Linen, 30% Lyocell', 'img/product-img/product-2.jpg', 15, 1, 1, 4.9, 52]);
        $insertProd->execute(['ESS-003', 3, 1, 'Ribbed Knit Midi Slip Dress', 1499, 1999, 'Form-flattering ribbed texture knit with subtle side slit and delicate spaghetti straps.', '95% Viscose, 5% Elastane', 'img/product-img/product-3.jpg', 40, 1, 0, 4.6, 29]);
        $insertProd->execute(['ESS-004', 4, 3, 'Quilted Leather Crossbody Bag', 2199, 2899, 'Chic quilted finish with gold-toned chain strap, turn-lock closure, and dual compartments.', 'Vegan Leather & Gold Hardware', 'img/product-img/product-4.jpg', 18, 0, 1, 4.7, 44]);
        $insertProd->execute(['ESS-005', 5, 2, 'Minimalist Strappy Heel Sandals', 2699, 3199, 'Contemporary square-toe block heel with criss-cross ankle ties and padded insole.', 'Synthetic Leather & Rubber Sole', 'img/product-img/product-5.jpg', 22, 1, 1, 4.5, 21]);
        $insertProd->execute(['ESS-006', 6, 1, 'High-Rise Vintage Straight Jeans', 1999, 2599, 'Classic 90s inspired straight leg silhouette with raw cut hem and structured denim.', '100% Rigid Denim Cotton', 'img/product-img/product-6.jpg', 30, 0, 1, 4.8, 67]);
        $insertProd->execute(['ESS-007', 1, 4, 'Emerald Satin Evening Maxi Dress', 3899, 4999, 'Rich liquid satin draping with cowl neckline, low open back, and cascading skirt.', 'Polyester Heavy Silk Satin', 'img/product-img/product-7.jpg', 12, 1, 1, 4.9, 83]);
        $insertProd->execute(['ESS-008', 2, 3, 'Handcrafted Woven Straw Tote Bag', 1299, 1799, 'Summer beachside essential woven from palm fronds with round handles and cotton liner.', 'Natural Rattan & Cotton', 'img/product-img/product-8.jpg', 25, 0, 0, 4.4, 19]);
        $insertProd->execute(['ESS-009', 3, 1, 'Cashmere Blend Turtleneck Sweater', 2499, 3299, 'Ultra-soft knit pullover with dropped shoulders and ribbed cuffs for cozy warmth.', '30% Cashmere, 70% Wool', 'img/product-img/product-9.jpg', 16, 1, 1, 4.9, 41]);
    }

    // Check orders
    $stmt = $conn->prepare("SELECT COUNT(*) AS total FROM orders");
    $stmt->execute();
    if ($stmt->fetch()['total'] == 0) {
        $insertOrder = $conn->prepare("
            INSERT INTO orders (order_number, user_id, customer_name, customer_email, customer_phone, shipping_address, city, state, pincode, subtotal, discount, total, status, payment_method, payment_status, razorpay_order_id, razorpay_payment_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $insertOrder->execute(['ORD-82914', 3, 'Jessica Taylor', 'customer@essence.com', '+91 98765 43212', '42 Rosewood Boulevard, Apartment 3B', 'Mumbai', 'Maharashtra', '400050', 5398, 500, 4898, 'delivered', 'razorpay', 'paid', 'order_test_82914', 'pay_test_82914_xyz']);
        $insertOrder->execute(['ORD-91042', 3, 'Jessica Taylor', 'customer@essence.com', '+91 98765 43212', '42 Rosewood Boulevard, Apartment 3B', 'Mumbai', 'Maharashtra', '400050', 3899, 0, 3899, 'shipped', 'razorpay', 'paid', 'order_test_91042', 'pay_test_91042_abc']);
        $insertOrder->execute(['ORD-94301', 3, 'Jessica Taylor', 'customer@essence.com', '+91 98765 43212', '42 Rosewood Boulevard, Apartment 3B', 'Mumbai', 'Maharashtra', '400050', 2199, 200, 1999, 'processing', 'cod', 'unpaid', null, null]);
        $insertOrder->execute(['ORD-97520', 2, 'Sophia Martinez', 'editor@essence.com', '+91 98765 43211', '18 Park Lane, Jubilee Hills', 'Hyderabad', 'Telangana', '500033', 4198, 400, 3798, 'delivered', 'razorpay', 'paid', 'order_test_97520', 'pay_test_97520_mno']);

        // Insert payments
        $insertPay = $conn->prepare("INSERT INTO payments (order_id, payment_id, amount, currency, status, method) VALUES (?, ?, ?, 'INR', 'paid', ?)");
        $insertPay->execute([1, 'pay_test_82914_xyz', 4898, 'razorpay']);
        $insertPay->execute([2, 'pay_test_91042_abc', 3899, 'razorpay']);
        $insertPay->execute([4, 'pay_test_97520_mno', 3798, 'razorpay']);
    }

    // Check blogs
    $stmt = $conn->prepare("SELECT COUNT(*) AS total FROM blog_posts");
    $stmt->execute();
    if ($stmt->fetch()['total'] == 0) {
        $insertBlog = $conn->prepare("INSERT INTO blog_posts (title, slug, category, author, excerpt, content, image, views) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $insertBlog->execute([
            'Sustainable Luxury: The Evolution of Conscious Wardrobes',
            'sustainable-luxury-wardrobes',
            'Sustainability',
            'Sophia Martinez',
            'How modern designers are redefining haute couture through low-impact textiles, zero-waste patterning, and closed-loop manufacturing.',
            'Fashion is at a pivotal crossroads. For decades, consumer culture prioritized velocity and novelty over longevity. Today, discerning fashion aficionados are demanding radical transparency, biodegradable organic cottons, and timeless investment silhouettes.',
            'img/bg-img/blog1.jpg',
            1420
        ]);
        $insertBlog->execute([
            'Runway to Sidewalk: Top Autumn Color Palettes Decoded',
            'autumn-color-palettes',
            'Trends',
            'Alexander Vance',
            'From earthy terracotta to electrifying cobalt accents, explore the tones steering this seasons international street style.',
            'Step into the golden hour of autumn fashion. The prevailing palette balances warm desert neutrals with sudden shocks of electric vibrancy.',
            'img/bg-img/blog2.jpg',
            2180
        ]);
        $insertBlog->execute([
            'The Capsule Wardrobe: 10 Essential Pieces Every Woman Needs',
            'capsule-wardrobe-essentials',
            'Style Guide',
            'Jessica Taylor',
            'Streamline your daily dressing ritual with these timeless, high-mileage wardrobe pillars that mix and match effortlessly.',
            'A true capsule wardrobe is not about restriction—it is about liberation. When every blazer, tailored trouser, crisp poplin shirt, and structured slip dress harmonizes with one another, getting dressed in the morning becomes an invigorating art form.',
            'img/bg-img/blog3.jpg',
            3560
        ]);
    }
}

init_essence_database($conn);
?>