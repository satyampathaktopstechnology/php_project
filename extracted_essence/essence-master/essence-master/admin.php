<?php
include "db.php";


$product_count = mysqli_fetch_assoc(mysqli_query($conn, "SELECT COUNT(*) AS total FROM products"))['total'];

$order_count = mysqli_fetch_assoc(mysqli_query($conn, "SELECT COUNT(*) AS total FROM orders"))['total'];

$user_count = mysqli_fetch_assoc(mysqli_query($conn, "SELECT COUNT(*) AS total FROM users"))['total'];

$revenue = mysqli_fetch_assoc(mysqli_query($conn, "SELECT SUM(amount) AS total FROM payments WHERE status='paid'"))['total'] ?? 0;



$recent_orders = mysqli_query($conn, "
    SELECT orders.*, users.name AS customer_name,
    (SELECT status FROM payments WHERE payments.order_id = orders.id ORDER BY payments.id DESC LIMIT 1) AS payment_status
    FROM orders
    LEFT JOIN users ON orders.user_id = users.id
    ORDER BY orders.id DESC LIMIT 5
");


// Fetch products with brand names
$products = mysqli_query($conn, "
    SELECT products.*, brands.name AS brand_name
    FROM products
    LEFT JOIN brands ON products.brand_id = brands.id
    ORDER BY products.id DESC
");


// Fetch all orders
$orders = mysqli_query($conn, "
    SELECT orders.*, users.name AS customer_name
    FROM orders
    LEFT JOIN users ON orders.user_id = users.id
    ORDER BY orders.id DESC
");


// Fetch payments
$payments = mysqli_query($conn, "
    SELECT payments.*, orders.user_id, users.name AS customer_name
    FROM payments
    LEFT JOIN orders ON payments.order_id = orders.id
    LEFT JOIN users ON orders.user_id = users.id
    ORDER BY payments.id DESC
");

function status_css_class($status) {
    $class = strtolower(trim((string) $status));
    $class = preg_replace('/[^a-z0-9]+/', '-', $class);
    $class = trim($class, '-') ?: 'pending';

    $known_classes = ['paid', 'delivered', 'pending', 'processing', 'shipped', 'cancelled', 'failed', 'refunded'];
    return in_array($class, $known_classes, true) ? $class : 'pending';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>Essence Admin Dashboard</title>
    <link rel="icon" href="img/core-img/favicon.ico">
    <link rel="stylesheet" href="css/bootstrap.min.css">
    <link rel="stylesheet" href="css/font-awesome.min.css">
    <link rel="stylesheet" href="css/core-style.css?v=20261102">
    <link rel="stylesheet" href="css/essence-unified.css?v=20261102">
    <style>
        :root { --admin-ink: #242424; --admin-muted: #777; --admin-accent: #ff3f6c; --admin-bg: #f4f5f7; }
        * { box-sizing: border-box; }
        body { margin: 0; background: var(--admin-bg); color: var(--admin-ink); font-family: "Montserrat", Arial, sans-serif; }
        .admin-shell { min-height: 100vh; display: grid; grid-template-columns: 240px minmax(0, 1fr); }
        .admin-sidebar { position: fixed; width: 240px; height: 100vh; padding: 28px 18px; background: #fff; border-right: 1px solid #e8e8e8; }
        .admin-brand { display: block; margin: 0 10px 36px; }
        .admin-brand img { max-width: 130px; }
        .admin-nav button { width: 100%; border: 0; border-radius: 5px; background: transparent; color: #666; padding: 12px 14px; margin-bottom: 5px; text-align: left; cursor: pointer; }
        .admin-nav button i { width: 28px; color: #999; }
        .admin-nav button.active, .admin-nav button:hover { background: var(--admin-accent); color: #fff; }
        .admin-nav button.active i, .admin-nav button:hover i { color: #fff; }
        .admin-main { grid-column: 2; padding: 28px 34px 50px; }
        .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .admin-header h1 { margin: 0; font-size: 28px; }
        .admin-header a { color: var(--admin-ink); text-decoration: none; font-size: 13px; }
        .stat-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-bottom: 24px; }
        .stat-card { min-height: 120px; padding: 20px; border-radius: 7px; background: #fff; box-shadow: 0 4px 18px rgba(0,0,0,.04); }
        .stat-card span { display: block; color: var(--admin-muted); font-size: 12px; text-transform: uppercase; }
        .stat-card strong { display: block; margin-top: 12px; font-size: 24px; }
        .admin-panel { display: none; }
        .admin-panel.active { display: block; }
        .panel-card { margin-bottom: 24px; padding: 22px; border-radius: 7px; background: #fff; box-shadow: 0 4px 18px rgba(0,0,0,.04); }
        .panel-card h2 { margin: 0 0 18px; font-size: 18px; }
        .table-wrap { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 13px 10px; border-bottom: 1px solid #eee; font-size: 13px; text-align: left; }
        th { color: var(--admin-muted); text-transform: uppercase; font-size: 11px; }
        .product-thumb { width: 48px; height: 48px; object-fit: cover; border-radius: 4px; vertical-align: middle; margin-right: 10px; }
        .status { display: inline-block; min-width: 78px; padding: 5px 9px; border-radius: 20px; text-align: center; font-size: 11px; }
        .status-paid { background: #e3f5ea; color: #247a43; }
        .status-delivered { background: #e3f5ea; color: #247a43; }
        .status-pending { background: #fff1d6; color: #966a0c; }
        .status-processing { background: #fff1d6; color: #966a0c; }
        .status-shipped { background: #e6efff; color: #385fa7; }
        .status-cancelled { background: #fdeaea; color: #a94442; }
        .status-failed { background: #fdeaea; color: #a94442; }
        .status-refunded { background: #eeeafb; color: #6846a5; }
        .admin-tools { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .admin-tools input { width: 260px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; }
        .admin-btn { border: 0; border-radius: 4px; background: var(--admin-ink); color: #fff; padding: 9px 14px; text-decoration: none; font-size: 12px; }
        .admin-btn:hover { color: #fff; }
        .payment-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .payment-card { border: 1px solid #e9e9e9; border-radius: 6px; padding: 18px; }
        .payment-card strong { display: block; margin-bottom: 8px; }
        @media (max-width: 992px) {
            .admin-shell { grid-template-columns: 1fr; }
            .admin-sidebar { position: static; width: 100%; height: auto; }
            .admin-main { grid-column: 1; padding: 24px 18px; }
            .admin-nav { display: flex; gap: 4px; overflow-x: auto; }
            .admin-nav button { width: auto; white-space: nowrap; }
            .stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .payment-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 540px) {
            .stat-grid { grid-template-columns: 1fr; }
            .admin-header { align-items: flex-start; gap: 12px; }
            .admin-tools { align-items: stretch; flex-direction: column; gap: 10px; }
            .admin-tools input { width: 100%; }
        }
    </style>
</head>
<body>
    <div class="admin-shell">
        <aside class="admin-sidebar">
            <a class="admin-brand" href="index.php" aria-label="Essence home">
                <img src="img/core-img/logo.png" alt="Essence">
            </a>
            <nav class="admin-nav" aria-label="Admin navigation">
                <button type="button" class="active" data-panel="dashboard"><i class="fa fa-dashboard"></i> Dashboard</button>
                <button type="button" data-panel="products"><i class="fa fa-shopping-bag"></i> Products</button>
                <button type="button" data-panel="orders"><i class="fa fa-list-alt"></i> Orders</button>
                <button type="button" data-panel="payments"><i class="fa fa-credit-card"></i> Payments</button>
                 <!-- <button type="button" data-panel="products"><i class="fa fa-shopping-bag"></i></a> Products</button> -->
            </nav>
        </aside>

        <main class="admin-main">
            <header class="admin-header">
                <h1>Admin Dashboard</h1>
                <a href="index.php"><i class="fa fa-arrow-left"></i> View Store</a>
            </header>

            <section class="admin-panel active" id="dashboard">
          <div class="stat-grid">

            <div class="stat-card">
                <span>Total Products</span>
                <strong><?php echo $product_count; ?></strong>
            </div>

            <div class="stat-card">
                <span>Total Orders</span>
                <strong><?php echo $order_count; ?></strong>
            </div>

            <div class="stat-card">
                <span>Total Customers</span>
                <strong><?php echo $user_count; ?></strong>
            </div>

            <div class="stat-card">
                <span>Total Revenue</span>
                <strong>₹<?php echo number_format((float)$revenue, 2); ?></strong>
            </div>

        </div>


                <div class="panel-card">
                    <h2>Recent Orders</h2>

                    <div class="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Customer</th>
                                    <th>Total</th>
                                    <th>Payment</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>

                            <?php while($row = mysqli_fetch_assoc($recent_orders)){ ?>

                                <tr>
                                    <td>#<?php echo $row['id']; ?></td>

                                    <td>
                                        <?php echo htmlspecialchars($row['customer_name'] ?? 'Guest'); ?>
                                    </td>

                                    <td>
                                        ₹<?php echo number_format($row['total_amount'], 2); ?>
                                    </td>

                                    <td>
                                        <span class="status status-<?php echo status_css_class($row['payment_status'] ?? 'Pending'); ?>">
                                            <?php echo htmlspecialchars($row['payment_status'] ?? 'Pending'); ?>
                                        </span>
                                    </td>

                                    <td>
                                        <span class="status status-<?php echo status_css_class($row['order_status']); ?>">
                                            <?php echo htmlspecialchars($row['order_status']); ?>
                                        </span>
                                    </td>
                                    <td>
                                            <a href="order_edit.php?id=<?php echo $row['id']; ?>"
                                            class="btn btn-primary">
                                                Update Status
                                            </a>
                                    </td>


                                </tr>

                            <?php } ?>

                            </tbody>
                        </table>
                    </div>
                </div>

            </section>
<!-- -------------------------------------------------------------------------------------------------------------------------------- -->
           <section class="admin-panel" id="products">
                <div class="panel-card">

                    <h2>Product Catalog</h2>

                    <div class="admin-tools">
                        <input type="search" id="productSearch" placeholder="Search products or brands">

                        <div>
                            <a class="admin-btn" href="shop.php">Open Store</a>

                            <a class="admin-btn" href="product_manage.php">Manage Products</a>
                        </div>
                    </div>

                    <div class="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Image</th>
                                    <th>Product Name</th>
                                    <th>Brand</th>
                                    <th>SKU</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>

                            <?php while($row = mysqli_fetch_assoc($products)){ ?>

                                <tr class="product-row">

                                    <td><?php echo $row['id']; ?></td>

                                    <td>
                                        <img src="img/product-img/<?php echo htmlspecialchars($row['image']); ?>"
                                            class="product-thumb" alt="Product">
                                    </td>

                                    <td><?php echo htmlspecialchars($row['name']); ?></td>

                                    <td><?php echo htmlspecialchars($row['brand_name'] ?? 'N/A'); ?></td>

                                    <td><?php echo htmlspecialchars($row['sku']); ?></td>

                                    <td>₹<?php echo number_format($row['price'], 2); ?></td>

                                    <td><?php echo $row['stock_quantity']; ?></td>

                                    <td>
                                        <a href="product_edit.php?id=<?php echo $row['id']; ?>"
                                        class="btn btn-primary btn-sm">
                                            <i class="fa fa-edit"></i> Edit
                                        </a>
                                         <a href="delete.php?id=<?php echo $row['id']; ?>"
                                        class="btn btn-danger btn-sm">
                                            <i class="fa fa-trash"></i> Delete
                                        </a>

                                    </td>

                                </tr>

                            <?php } ?>

                            </tbody>
                        </table>
                    </div>

                </div>
            </section>
<!-- ----------------------------------------------------------------------------------------------------------------------------------- -->
            <section class="admin-panel" id="orders">
                <div class="panel-card">
                    <h2>All Orders</h2>
                    <div class="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Total Amount</th>
                                    <th>Shipping</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>action</th>
                                </tr>
                            </thead>

                            <tbody>

                            <?php while($row = mysqli_fetch_assoc($orders)){ ?>

                            <tr>
                                <td>#<?php echo $row['id']; ?></td>

                                <td><?php echo htmlspecialchars($row['customer_name'] ?? 'Guest'); ?></td>

                                <td>₹<?php echo number_format($row['total_amount'], 2); ?></td>

                                <td>₹<?php echo number_format($row['shipping_amount'], 2); ?></td>

                                <td>
                                    <span class="status status-<?php echo status_css_class($row['order_status']); ?>">
                                        <?php echo htmlspecialchars($row['order_status']); ?>
                                    </span>
                                </td>

                                <td><?php echo date('d M Y', strtotime($row['created_at'])); ?></td>
                                <td>
                                 <a href="order_edit.php?id=<?php echo $row['id']; ?>"
                                    class="btn btn-primary">
                                     Update Status
                                </a>
                                </td>
                            </tr>

                            <?php } ?>

                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
<!-- -------------------------------------------------------------------------------------------------------------------------------- -->
            <section class="admin-panel" id="payments">
                <div class="panel-card">
                    <h2>Payments</h2>
                    <div class="table-wrap" style="margin-bottom: 24px;">
                        <table>
                                    <thead>
                                        <tr>
                                            <th>Payment ID</th>
                                            <th>Order ID</th>
                                            <th>Customer</th>
                                            <th>Gateway</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                    <?php while($row = mysqli_fetch_assoc($payments)){ ?>

                                    <tr>
                                        <td><?php echo $row['id']; ?></td>

                                        <td>#<?php echo $row['order_id']; ?></td>

                                        <td><?php echo htmlspecialchars($row['customer_name'] ?? 'Guest'); ?></td>

                                        <td><?php echo htmlspecialchars($row['gateway']); ?></td>

                                        <td>₹<?php echo number_format($row['amount'], 2); ?></td>

                                        <td>
                                            <span class="status status-<?php echo status_css_class($row['status']); ?>">
                                                <?php echo htmlspecialchars($row['status']); ?>
                                            </span>
                                        </td>

                                        <td><?php echo date('d M Y', strtotime($row['created_at'])); ?></td>

                                        
                                    </tr>




                                    <?php } ?>

                                    </tbody>
                                </table>
                    </div>
                    <h2>Payment Integration</h2>
                    <div class="payment-grid">
                        <div class="payment-card">
                            <strong>Razorpay</strong>
                            <span class="status status-processing">Not connected</span>
                            <p class="mt-3 mb-0">Recommended for UPI, cards, net banking and wallets.</p>
                        </div>
                        <div class="payment-card">
                            <strong>Stripe</strong>
                            <span class="status status-processing">Not connected</span>
                            <p class="mt-3 mb-0">Use for international card payments and subscriptions.</p>
                        </div>
                        <div class="payment-card">
                            <strong>Cash on Delivery</strong>
                            <span class="status status-paid">Available</span>
                            <p class="mt-3 mb-0">Payment remains pending until delivery is confirmed.</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </div>
<!-- ---------------------------------------------------------------------------------------------------------------------------------- -->
<script>
        document.querySelectorAll('.admin-nav button').forEach(function (button) {
            button.addEventListener('click', function () {
                document.querySelectorAll('.admin-nav button').forEach(function (item) { item.classList.remove('active'); });
                document.querySelectorAll('.admin-panel').forEach(function (panel) { panel.classList.remove('active'); });
                button.classList.add('active');
                var panel = document.getElementById(button.dataset.panel);
                if (panel) panel.classList.add('active');
            });
        });

        var productSearch = document.getElementById('productSearch');

        if (productSearch) {
            productSearch.addEventListener('input', function () {
                var search = this.value.toLowerCase();

                document.querySelectorAll('.product-row').forEach(function (row) {
                    if (row.textContent.toLowerCase().includes(search)) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });
            });
        }
    </script>
</body>
</html>
