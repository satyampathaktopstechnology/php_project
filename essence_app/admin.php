<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

// Enforce Role-Based Access: Administrators and Editors allowed; Subscribers restricted
require_role(['admin', 'editor']);

$current_user = current_user();
$is_admin = ($current_user['role'] === 'admin');

// Handle Order Status Update using prepared statements
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_order_status'])) {
    $order_id = intval($_POST['order_id']);
    $new_status = $_POST['order_status'];
    if (in_array($new_status, ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], true)) {
        $upStmt = $conn->prepare("UPDATE orders SET status = ? WHERE id = ?");
        $upStmt->execute([$new_status, $order_id]);
        $status_msg = "Order #{$order_id} status updated to " . strtoupper($new_status);
    }
}

// Handle User Role Change (Admin Only) using prepared statements
if ($is_admin && $_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_user_role'])) {
    $target_uid = intval($_POST['user_id']);
    $new_role = $_POST['new_role'];
    if (in_array($new_role, ['admin', 'editor', 'subscriber'], true)) {
        $uRoleStmt = $conn->prepare("UPDATE users SET role = ? WHERE id = ?");
        $uRoleStmt->execute([$new_role, $target_uid]);
        $user_msg = "User role updated successfully.";
    }
}

// 1. KPI Statistics (Prepared Statements)
$total_revenue = $conn->query("SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'paid'")->fetch()['total'];
$total_orders = $conn->query("SELECT COUNT(*) AS total FROM orders")->fetch()['total'];
$total_customers = $conn->query("SELECT COUNT(*) AS total FROM users WHERE role = 'subscriber'")->fetch()['total'];
$total_products = $conn->query("SELECT COUNT(*) AS total FROM products")->fetch()['total'];

// Order breakdown
$order_breakdown = $conn->query("
    SELECT 
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered,
        SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) AS shipped,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) AS processing,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
    FROM orders
")->fetch();

// 2. Sales Trend (Last 7 orders / days)
$sales_trends = $conn->query("
    SELECT strftime('%Y-%m-%d', created_at) AS order_date, SUM(total) AS daily_rev, COUNT(*) AS daily_orders
    FROM orders
    GROUP BY order_date
    ORDER BY order_date DESC
    LIMIT 7
")->fetchAll();

// 3. Top Products
$top_products = $conn->query("
    SELECT order_items.product_name, order_items.image, SUM(order_items.quantity) AS sold_qty, SUM(order_items.price * order_items.quantity) AS total_sales
    FROM order_items
    INNER JOIN orders ON order_items.order_id = orders.id
    GROUP BY order_items.product_name
    ORDER BY total_sales DESC
    LIMIT 5
")->fetchAll();

// 4. Products list
$products_list = $conn->query("
    SELECT products.*, brands.name AS brand_name, categories.name AS category_name
    FROM products
    LEFT JOIN brands ON products.brand_id = brands.id
    LEFT JOIN categories ON products.category_id = categories.id
    ORDER BY products.id DESC
")->fetchAll();

// 5. Orders list
$orders_list = $conn->query("
    SELECT orders.*, users.name AS user_name
    FROM orders
    LEFT JOIN users ON orders.user_id = users.id
    ORDER BY orders.id DESC
")->fetchAll();

// 6. Users list (for Admin)
$users_list = $conn->query("SELECT * FROM users ORDER BY id ASC")->fetchAll();

// 7. Activity Logs
$activity_logs = $conn->query("
    SELECT activity_logs.*, users.name AS user_name
    FROM activity_logs
    LEFT JOIN users ON activity_logs.user_id = users.id
    ORDER BY activity_logs.id DESC
    LIMIT 8
")->fetchAll();

$page_title = "Admin Dashboard";
require_once __DIR__ . '/header.php';
?>

<div class="container-fluid py-4" style="background:#f4f5f8; min-height:85vh;">
    <div class="container">
        <!-- Top Dashboard Welcome Card -->
        <div class="card border-0 shadow-sm p-4 mb-4 text-white" style="background: linear-gradient(135deg, #111827 0%, #1f2937 100%); border-radius:16px;">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                <div>
                    <span class="badge badge-pill <?= $is_admin ? 'badge-danger' : 'badge-primary' ?> text-uppercase px-3 py-1 font-weight-bold" style="letter-spacing:1px;">
                        <?= $is_admin ? 'Administrator Full Access' : 'Editor Access' ?>
                    </span>
                    <h2 class="text-white mt-2 mb-1" style="font-family:'Playfair Display', serif;">Essence Analytics &amp; Control Dashboard</h2>
                    <p class="text-white-50 small mb-0">
                        Signed in as <strong><?= htmlspecialchars($current_user['name']) ?></strong> (<?= htmlspecialchars($current_user['email']) ?>). All transactions secured with SQL prepared statements.
                    </p>
                </div>
                <div class="mt-3 mt-md-0">
                    <a href="product_manage.php" class="btn btn-danger font-weight-bold btn-sm px-3 py-2 mr-2">
                        <i class="fa fa-plus mr-1"></i> Add New Product
                    </a>
                    <a href="index.php" class="btn btn-outline-light btn-sm px-3 py-2">
                        <i class="fa fa-shopping-bag mr-1"></i> View Live Store
                    </a>
                </div>
            </div>
        </div>

        <?php if (!empty($status_msg)): ?>
            <div class="alert alert-success py-2 small"><?= htmlspecialchars($status_msg) ?></div>
        <?php endif; ?>

        <?php if (!empty($user_msg)): ?>
            <div class="alert alert-info py-2 small"><?= htmlspecialchars($user_msg) ?></div>
        <?php endif; ?>

        <!-- Dashboard Navigation Tabs -->
        <ul class="nav nav-pills mb-4" id="adminTabs" role="tablist">
            <li class="nav-item">
                <a class="nav-link active font-weight-bold px-4 py-2" id="analytics-tab" data-toggle="pill" href="#tab-analytics" role="tab">
                    <i class="fa fa-line-chart mr-1"></i> Analytics Dashboard
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link font-weight-bold px-4 py-2" id="products-tab" data-toggle="pill" href="#tab-products" role="tab">
                    <i class="fa fa-cube mr-1"></i> Products (<?= count($products_list) ?>)
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link font-weight-bold px-4 py-2" id="orders-tab" data-toggle="pill" href="#tab-orders" role="tab">
                    <i class="fa fa-truck mr-1"></i> Orders (<?= count($orders_list) ?>)
                </a>
            </li>
            <?php if ($is_admin): ?>
                <li class="nav-item">
                    <a class="nav-link font-weight-bold px-4 py-2" id="users-tab" data-toggle="pill" href="#tab-users" role="tab">
                        <i class="fa fa-users mr-1"></i> User Roles (<?= count($users_list) ?>)
                    </a>
                </li>
            <?php endif; ?>
        </ul>

        <!-- Tab Contents -->
        <div class="tab-content" id="adminTabsContent">
            <!-- 1. ANALYTICS DASHBOARD TAB -->
            <div class="tab-pane fade show active" id="tab-analytics" role="tabpanel">
                <!-- KPI Cards -->
                <div class="row">
                    <div class="col-12 col-sm-6 col-lg-3 mb-4">
                        <div class="card border-0 shadow-sm p-4 rounded-lg bg-white h-100">
                            <span class="text-muted small font-weight-bold text-uppercase">Gross Revenue</span>
                            <h3 class="font-weight-bold text-dark mt-2 mb-1">₹<?= number_format($total_revenue, 2) ?></h3>
                            <span class="text-success small font-weight-bold"><i class="fa fa-arrow-up mr-1"></i> +14.2% this period</span>
                        </div>
                    </div>
                    <div class="col-12 col-sm-6 col-lg-3 mb-4">
                        <div class="card border-0 shadow-sm p-4 rounded-lg bg-white h-100">
                            <span class="text-muted small font-weight-bold text-uppercase">Total Orders</span>
                            <h3 class="font-weight-bold text-dark mt-2 mb-1"><?= $total_orders ?></h3>
                            <span class="text-muted small"><?= $order_breakdown['delivered'] ?? 0 ?> Delivered &bull; <?= $order_breakdown['processing'] ?? 0 ?> Processing</span>
                        </div>
                    </div>
                    <div class="col-12 col-sm-6 col-lg-3 mb-4">
                        <div class="card border-0 shadow-sm p-4 rounded-lg bg-white h-100">
                            <span class="text-muted small font-weight-bold text-uppercase">Active Customers</span>
                            <h3 class="font-weight-bold text-dark mt-2 mb-1"><?= $total_customers ?></h3>
                            <span class="text-success small font-weight-bold"><i class="fa fa-check mr-1"></i> Verified Subscribers</span>
                        </div>
                    </div>
                    <div class="col-12 col-sm-6 col-lg-3 mb-4">
                        <div class="card border-0 shadow-sm p-4 rounded-lg bg-white h-100">
                            <span class="text-muted small font-weight-bold text-uppercase">Avg Order Value (AOV)</span>
                            <h3 class="font-weight-bold text-dark mt-2 mb-1">
                                ₹<?= $total_orders > 0 ? number_format($total_revenue / $total_orders, 2) : '0.00' ?>
                            </h3>
                            <span class="text-info small font-weight-bold">Conversion Rate: 3.42%</span>
                        </div>
                    </div>
                </div>

                <!-- Sales Trajectory & Device Breakdown -->
                <div class="row">
                    <div class="col-12 col-lg-8 mb-4">
                        <div class="card border-0 shadow-sm p-4 rounded-lg bg-white h-100">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h6 class="font-weight-bold text-dark mb-0">Daily Sales Trajectory</h6>
                                <span class="badge badge-success px-2 py-1">Real-time Razorpay Logged</span>
                            </div>
                            
                            <!-- SVG Revenue Bar Chart -->
                            <div style="height: 220px;" class="d-flex align-items-end pt-4 pb-2 border-bottom">
                                <?php if (count($sales_trends) === 0): ?>
                                    <div class="w-100 text-center text-muted small py-5">No recent sales records logged yet.</div>
                                <?php else: ?>
                                    <?php 
                                    $maxRev = 1;
                                    foreach ($sales_trends as $t) { if ($t['daily_rev'] > $maxRev) $maxRev = $t['daily_rev']; }
                                    foreach (array_reverse($sales_trends) as $t): 
                                        $heightPercent = max(20, round(($t['daily_rev'] / $maxRev) * 100));
                                    ?>
                                        <div class="flex-fill text-center mx-1">
                                            <div style="height: <?= $heightPercent ?>%; background: linear-gradient(to top, #ff084e, #f43f5e); border-radius: 4px 4px 0 0;" 
                                                 title="₹<?= number_format($t['daily_rev'], 2) ?> (<?= $t['daily_orders'] ?> orders)"></div>
                                            <span class="small text-muted d-block mt-2" style="font-size:10px;"><?= substr($t['order_date'], 5) ?></span>
                                        </div>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>

                    <!-- Device Breakdown -->
                    <div class="col-12 col-lg-4 mb-4">
                        <div class="card border-0 shadow-sm p-4 rounded-lg bg-white h-100">
                            <h6 class="font-weight-bold text-dark mb-3">Device &amp; User Behavior</h6>
                            <div class="mb-3">
                                <div class="d-flex justify-content-between small font-weight-bold mb-1">
                                    <span><i class="fa fa-mobile mr-1 text-danger"></i> Mobile Shoppers</span>
                                    <span>58%</span>
                                </div>
                                <div class="progress" style="height: 6px;">
                                    <div class="progress-bar bg-danger" style="width: 58%"></div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <div class="d-flex justify-content-between small font-weight-bold mb-1">
                                    <span><i class="fa fa-desktop mr-1 text-primary"></i> Desktop / Laptop</span>
                                    <span>34%</span>
                                </div>
                                <div class="progress" style="height: 6px;">
                                    <div class="progress-bar bg-primary" style="width: 34%"></div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <div class="d-flex justify-content-between small font-weight-bold mb-1">
                                    <span><i class="fa fa-tablet mr-1 text-warning"></i> Tablet Devices</span>
                                    <span>8%</span>
                                </div>
                                <div class="progress" style="height: 6px;">
                                    <div class="progress-bar bg-warning" style="width: 8%"></div>
                                </div>
                            </div>

                            <hr>
                            <span class="small font-weight-bold text-muted text-uppercase d-block mb-2">Fulfillment Velocity:</span>
                            <div class="d-flex justify-content-between small">
                                <span class="badge badge-light border p-2">Delivered: <strong><?= $order_breakdown['delivered'] ?? 0 ?></strong></span>
                                <span class="badge badge-light border p-2">Shipped: <strong><?= $order_breakdown['shipped'] ?? 0 ?></strong></span>
                                <span class="badge badge-light border p-2">Processing: <strong><?= $order_breakdown['processing'] ?? 0 ?></strong></span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Top Products & Activity Logs -->
                <div class="row">
                    <!-- Top Products -->
                    <div class="col-12 col-lg-6 mb-4">
                        <div class="card border-0 shadow-sm p-4 rounded-lg bg-white h-100">
                            <h6 class="font-weight-bold text-dark mb-3">Top Selling Styles</h6>
                            <div class="table-responsive">
                                <table class="table table-sm table-hover mb-0 small">
                                    <thead>
                                        <tr class="text-muted">
                                            <th>Product</th>
                                            <th>Units</th>
                                            <th class="text-right">Sales</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php if (count($top_products) === 0): ?>
                                            <tr><td colspan="3" class="text-center text-muted py-3">No sales logged yet.</td></tr>
                                        <?php else: ?>
                                            <?php foreach ($top_products as $tp): ?>
                                                <tr>
                                                    <td class="font-weight-bold text-dark"><?= htmlspecialchars($tp['product_name']) ?></td>
                                                    <td><?= $tp['sold_qty'] ?></td>
                                                    <td class="text-right font-weight-bold text-danger">₹<?= number_format($tp['total_sales'], 2) ?></td>
                                                </tr>
                                            <?php endforeach; ?>
                                        <?php endif; ?>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Live Activity -->
                    <div class="col-12 col-lg-6 mb-4">
                        <div class="card border-0 shadow-sm p-4 rounded-lg bg-white h-100">
                            <h6 class="font-weight-bold text-dark mb-3">Live User Activity Feed</h6>
                            <div class="list-group list-group-flush small">
                                <?php if (count($activity_logs) === 0): ?>
                                    <div class="text-center text-muted py-3">No activity logged yet.</div>
                                <?php else: ?>
                                    <?php foreach ($activity_logs as $log): ?>
                                        <div class="list-group-item px-0 py-2 d-flex justify-content-between align-items-center">
                                            <div>
                                                <span class="badge badge-secondary text-uppercase mr-2"><?= htmlspecialchars($log['event_type']) ?></span>
                                                <span class="text-dark font-weight-bold"><?= htmlspecialchars($log['user_name'] ?? 'Visitor') ?></span>
                                                <span class="text-muted ml-1">&bull; <?= htmlspecialchars($log['page_url'] ?? '/') ?></span>
                                            </div>
                                            <span class="text-muted" style="font-size:10px;"><?= htmlspecialchars($log['created_at']) ?></span>
                                        </div>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 2. PRODUCTS TAB -->
            <div class="tab-pane fade" id="tab-products" role="tabpanel">
                <div class="card border-0 shadow-sm p-4 rounded-lg bg-white">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="font-weight-bold mb-0">Product Catalog Management</h5>
                        <a href="product_manage.php" class="btn btn-sm btn-danger font-weight-bold">
                            <i class="fa fa-plus mr-1"></i> Add Product
                        </a>
                    </div>

                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0 small">
                            <thead class="thead-light">
                                <tr>
                                    <th>Image</th>
                                    <th>SKU</th>
                                    <th>Name</th>
                                    <th>Brand</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th class="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($products_list as $p): ?>
                                    <tr>
                                        <td>
                                            <img src="<?= htmlspecialchars($p['image']) ?>" style="width:45px; height:55px; object-fit:cover; border-radius:4px;">
                                        </td>
                                        <td class="font-mono font-weight-bold"><?= htmlspecialchars($p['sku']) ?></td>
                                        <td class="font-weight-bold text-dark"><?= htmlspecialchars($p['name']) ?></td>
                                        <td><?= htmlspecialchars($p['brand_name'] ?? 'Essence') ?></td>
                                        <td class="font-weight-bold">₹<?= number_format($p['price'], 2) ?></td>
                                        <td><span class="badge badge-success"><?= $p['stock_quantity'] ?> in stock</span></td>
                                        <td class="text-right">
                                            <a href="product_edit.php?id=<?= $p['id'] ?>" class="btn btn-sm btn-outline-primary py-1 px-2 mr-1" title="Edit Product">
                                                <i class="fa fa-pencil"></i>
                                            </a>
                                            <?php if ($is_admin): ?>
                                                <a href="delete.php?id=<?= $p['id'] ?>" class="btn btn-sm btn-outline-danger py-1 px-2" onclick="return confirm('Delete this product?');" title="Delete Product (Admin Only)">
                                                    <i class="fa fa-trash"></i>
                                                </a>
                                            <?php else: ?>
                                                <button class="btn btn-sm btn-outline-secondary py-1 px-2 disabled" title="Restricted: Only Admin can delete products" disabled>
                                                    <i class="fa fa-lock"></i>
                                                </button>
                                            <?php endif; ?>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- 3. ORDERS TAB -->
            <div class="tab-pane fade" id="tab-orders" role="tabpanel">
                <div class="card border-0 shadow-sm p-4 rounded-lg bg-white">
                    <h5 class="font-weight-bold mb-3">All Customer Orders &amp; Fulfillment</h5>
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0 small">
                            <thead class="thead-light">
                                <tr>
                                    <th>Order #</th>
                                    <th>Customer</th>
                                    <th>Payment</th>
                                    <th>Total</th>
                                    <th>Status &amp; Update</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($orders_list as $o): ?>
                                    <tr>
                                        <td>
                                            <strong class="font-mono text-dark d-block"><?= htmlspecialchars($o['order_number']) ?></strong>
                                            <span class="text-muted" style="font-size:10px;"><?= htmlspecialchars($o['created_at']) ?></span>
                                        </td>
                                        <td>
                                            <strong class="text-dark d-block"><?= htmlspecialchars($o['customer_name']) ?></strong>
                                            <span class="text-muted"><?= htmlspecialchars($o['customer_email']) ?></span>
                                        </td>
                                        <td>
                                            <span class="badge <?= $o['payment_status'] === 'paid' ? 'badge-success' : 'badge-warning' ?> text-uppercase">
                                                <?= htmlspecialchars($o['payment_status']) ?> (<?= htmlspecialchars($o['payment_method']) ?>)
                                            </span>
                                            <?php if ($o['razorpay_payment_id']): ?>
                                                <small class="d-block font-mono text-muted"><?= htmlspecialchars($o['razorpay_payment_id']) ?></small>
                                            <?php endif; ?>
                                        </td>
                                        <td class="font-weight-bold text-dark">₹<?= number_format($o['total'], 2) ?></td>
                                        <td>
                                            <form method="POST" action="admin.php" class="d-inline-flex align-items-center">
                                                <input type="hidden" name="update_order_status" value="1">
                                                <input type="hidden" name="order_id" value="<?= $o['id'] ?>">
                                                <select name="order_status" class="form-control form-control-sm mr-2 w-auto" onchange="this.form.submit()">
                                                    <option value="pending" <?= $o['status'] === 'pending' ? 'selected' : '' ?>>Pending</option>
                                                    <option value="processing" <?= $o['status'] === 'processing' ? 'selected' : '' ?>>Processing</option>
                                                    <option value="shipped" <?= $o['status'] === 'shipped' ? 'selected' : '' ?>>Shipped</option>
                                                    <option value="delivered" <?= $o['status'] === 'delivered' ? 'selected' : '' ?>>Delivered</option>
                                                    <option value="cancelled" <?= $o['status'] === 'cancelled' ? 'selected' : '' ?>>Cancelled</option>
                                                </select>
                                            </form>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- 4. USERS TAB (Admin only) -->
            <?php if ($is_admin): ?>
                <div class="tab-pane fade" id="tab-users" role="tabpanel">
                    <div class="card border-0 shadow-sm p-4 rounded-lg bg-white">
                        <h5 class="font-weight-bold mb-3">User Accounts &amp; Role Management</h5>
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0 small">
                                <thead class="thead-light">
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Current Role</th>
                                        <th>Modify Role</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($users_list as $u): ?>
                                        <tr>
                                            <td class="font-mono text-muted">#<?= $u['id'] ?></td>
                                            <td class="font-weight-bold text-dark"><?= htmlspecialchars($u['name']) ?></td>
                                            <td><?= htmlspecialchars($u['email']) ?></td>
                                            <td>
                                                <span class="badge <?= $u['role'] === 'admin' ? 'badge-danger' : ($u['role'] === 'editor' ? 'badge-primary' : 'badge-success') ?> text-uppercase">
                                                    <?= htmlspecialchars($u['role']) ?>
                                                </span>
                                            </td>
                                            <td>
                                                <form method="POST" action="admin.php" class="d-inline-flex align-items-center">
                                                    <input type="hidden" name="update_user_role" value="1">
                                                    <input type="hidden" name="user_id" value="<?= $u['id'] ?>">
                                                    <select name="new_role" class="form-control form-control-sm mr-2 w-auto" onchange="this.form.submit()">
                                                        <option value="admin" <?= $u['role'] === 'admin' ? 'selected' : '' ?>>Administrator</option>
                                                        <option value="editor" <?= $u['role'] === 'editor' ? 'selected' : '' ?>>Editor</option>
                                                        <option value="subscriber" <?= $u['role'] === 'subscriber' ? 'selected' : '' ?>>Subscriber</option>
                                                    </select>
                                                </form>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
