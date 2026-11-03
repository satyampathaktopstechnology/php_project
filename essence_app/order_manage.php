<?php
/**
 * Essence Fashion Store - Order Management
 * Role Protected: Administrators and Editors
 * Uses Prepared Statements for all database queries
 */
$page_title = "Manage Orders";
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

// Role validation: Admin and Editor only
require_role(['admin', 'editor']);

$current_user = current_user();
$status_filter = $_GET['status'] ?? 'all';

// Query with prepared statements
if ($status_filter !== 'all' && in_array($status_filter, ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], true)) {
    $stmt = $conn->prepare("
        SELECT orders.*, users.name AS user_name, users.email AS user_email
        FROM orders
        LEFT JOIN users ON orders.user_id = users.id
        WHERE orders.status = ?
        ORDER BY orders.id DESC
    ");
    $stmt->execute([$status_filter]);
} else {
    $stmt = $conn->prepare("
        SELECT orders.*, users.name AS user_name, users.email AS user_email
        FROM orders
        LEFT JOIN users ON orders.user_id = users.id
        ORDER BY orders.id DESC
    ");
    $stmt->execute();
}
$orders = $stmt->fetchAll();

// Counts for filter tabs
$countStmt = $conn->query("
    SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) AS processing,
        SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) AS shipped,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
    FROM orders
");
$counts = $countStmt->fetch();

require_once __DIR__ . '/header.php';
?>

<div class="breadcumb_area bg-img" style="background-image: url(img/bg-img/breadcumb.jpg); padding: 40px 0;">
    <div class="container h-100">
        <div class="row h-100 align-items-center">
            <div class="col-12 text-center">
                <h2 style="font-family:'Playfair Display', serif;" class="text-white">Order Management</h2>
                <p class="text-white small mb-0">Role: <?= strtoupper(htmlspecialchars($current_user['role'])) ?> &bull; Prepared Statements Protected</p>
            </div>
        </div>
    </div>
</div>

<div class="section-padding-80">
    <div class="container-fluid px-lg-5">
        <?php if (isset($_GET['msg'])): ?>
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <i class="fa fa-check-circle mr-2"></i> <?= htmlspecialchars($_GET['msg']) ?>
                <button type="button" class="close" data-dismiss="alert">&times;</button>
            </div>
        <?php endif; ?>

        <!-- Quick Actions & Status Tabs -->
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-4">
            <div class="btn-group btn-group-sm mb-2 mb-md-0" role="group">
                <a href="order_manage.php" class="btn <?= $status_filter === 'all' ? 'btn-dark' : 'btn-outline-dark' ?>">
                    All Orders <span class="badge badge-light ml-1"><?= $counts['total'] ?></span>
                </a>
                <a href="order_manage.php?status=pending" class="btn <?= $status_filter === 'pending' ? 'btn-dark' : 'btn-outline-dark' ?>">
                    Pending <span class="badge badge-warning ml-1"><?= $counts['pending'] ?></span>
                </a>
                <a href="order_manage.php?status=processing" class="btn <?= $status_filter === 'processing' ? 'btn-dark' : 'btn-outline-dark' ?>">
                    Processing <span class="badge badge-info ml-1"><?= $counts['processing'] ?></span>
                </a>
                <a href="order_manage.php?status=shipped" class="btn <?= $status_filter === 'shipped' ? 'btn-dark' : 'btn-outline-dark' ?>">
                    Shipped <span class="badge badge-primary ml-1"><?= $counts['shipped'] ?></span>
                </a>
                <a href="order_manage.php?status=delivered" class="btn <?= $status_filter === 'delivered' ? 'btn-dark' : 'btn-outline-dark' ?>">
                    Delivered <span class="badge badge-success ml-1"><?= $counts['delivered'] ?></span>
                </a>
            </div>

            <div>
                <a href="admin.php" class="btn btn-sm btn-outline-secondary mr-2">
                    <i class="fa fa-tachometer mr-1"></i> Dashboard
                </a>
                <a href="product_manage.php" class="btn btn-sm btn-outline-dark">
                    <i class="fa fa-tags mr-1"></i> Products
                </a>
            </div>
        </div>

        <!-- Orders Table Card -->
        <div class="card border-0 shadow-sm rounded-lg overflow-hidden">
            <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                <h6 class="font-weight-bold mb-0 text-dark">
                    <i class="fa fa-shopping-bag mr-2 text-danger"></i> Orders List (<?= count($orders) ?> items)
                </h6>
            </div>
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="thead-light small font-weight-bold">
                        <tr>
                            <th>Order No</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Payment</th>
                            <th>Fulfillment Status</th>
                            <th>Date</th>
                            <th class="text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody class="small">
                        <?php if (empty($orders)): ?>
                            <tr>
                                <td colspan="7" class="text-center py-5 text-muted">
                                    <i class="fa fa-folder-open-o fa-2x d-block mb-2 text-secondary"></i>
                                    No orders found matching this filter.
                                </td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($orders as $ord): 
                                $statusBadge = 'secondary';
                                if ($ord['status'] === 'delivered') $statusBadge = 'success';
                                elseif ($ord['status'] === 'shipped') $statusBadge = 'primary';
                                elseif ($ord['status'] === 'processing') $statusBadge = 'info';
                                elseif ($ord['status'] === 'pending') $statusBadge = 'warning';
                                elseif ($ord['status'] === 'cancelled') $statusBadge = 'danger';

                                $payBadge = ($ord['payment_status'] === 'paid') ? 'success' : 'warning';
                            ?>
                                <tr>
                                    <td>
                                        <strong class="font-mono text-dark"><?= htmlspecialchars($ord['order_number']) ?></strong>
                                    </td>
                                    <td>
                                        <div class="font-weight-bold text-dark"><?= htmlspecialchars($ord['customer_name']) ?></div>
                                        <div class="text-muted small"><?= htmlspecialchars($ord['customer_email']) ?></div>
                                    </td>
                                    <td>
                                        <strong class="text-dark">₹<?= number_format($ord['total'], 2) ?></strong>
                                    </td>
                                    <td>
                                        <span class="badge badge-<?= $payBadge ?> text-uppercase"><?= htmlspecialchars($ord['payment_status']) ?></span>
                                        <small class="d-block text-muted mt-1"><?= strtoupper(htmlspecialchars($ord['payment_method'])) ?></small>
                                        <?php if (!empty($ord['razorpay_payment_id'])): ?>
                                            <span class="text-info font-mono small d-block"><?= htmlspecialchars($ord['razorpay_payment_id']) ?></span>
                                        <?php endif; ?>
                                    </td>
                                    <td>
                                        <span class="badge badge-<?= $statusBadge ?> px-2 py-1 text-uppercase">
                                            <?= htmlspecialchars($ord['status']) ?>
                                        </span>
                                    </td>
                                    <td class="text-muted">
                                        <?= date('M d, Y', strtotime($ord['created_at'])) ?>
                                    </td>
                                    <td class="text-right">
                                        <a href="order_edit.php?id=<?= $ord['id'] ?>" class="btn btn-sm btn-outline-dark">
                                            <i class="fa fa-pencil mr-1"></i> Edit
                                        </a>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
