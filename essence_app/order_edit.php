<?php
/**
 * Essence Fashion Store - Order Status Editor
 * Protected with Prepared Statements and Strict Role Validation
 */
$page_title = "Edit Order";
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

require_role(['admin', 'editor']);

if (!isset($_GET['id'])) {
    header("Location: order_manage.php");
    exit;
}

$order_id = intval($_GET['id']);

// Fetch order using Prepared Statement
$stmt = $conn->prepare("SELECT * FROM orders WHERE id = ?");
$stmt->execute([$order_id]);
$order = $stmt->fetch();

if (!$order) {
    die("Order not found");
}

// Fetch order items using Prepared Statement
$itemsStmt = $conn->prepare("SELECT * FROM order_items WHERE order_id = ?");
$itemsStmt->execute([$order_id]);
$items = $itemsStmt->fetchAll();

// Handle status update
$success_msg = "";
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_order'])) {
    $new_status = $_POST['status'];
    $new_payment_status = $_POST['payment_status'];

    $valid_statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    $valid_payments = ['unpaid', 'paid', 'refunded'];

    if (in_array($new_status, $valid_statuses, true) && in_array($new_payment_status, $valid_payments, true)) {
        // Prepared Statement: prevents SQL injection
        $upStmt = $conn->prepare("UPDATE orders SET status = ?, payment_status = ? WHERE id = ?");
        $upStmt->execute([$new_status, $new_payment_status, $order_id]);

        // Refresh
        $order['status'] = $new_status;
        $order['payment_status'] = $new_payment_status;
        $success_msg = "Order #{$order['order_number']} status updated successfully!";
    }
}

require_once __DIR__ . '/header.php';
?>

<div class="breadcumb_area bg-img" style="background-image: url(img/bg-img/breadcumb.jpg); padding: 40px 0;">
    <div class="container h-100">
        <div class="row h-100 align-items-center">
            <div class="col-12 text-center">
                <h2 style="font-family:'Playfair Display', serif;" class="text-white">Order Details &bull; <?= htmlspecialchars($order['order_number']) ?></h2>
                <p class="text-white small mb-0">Role-Based Order Fulfillment &bull; Prepared Statements Protected</p>
            </div>
        </div>
    </div>
</div>

<div class="section-padding-80">
    <div class="container">
        <?php if (!empty($success_msg)): ?>
            <div class="alert alert-success alert-dismissible fade show mb-4" role="alert">
                <i class="fa fa-check-circle mr-2"></i> <?= htmlspecialchars($success_msg) ?>
                <button type="button" class="close" data-dismiss="alert">&times;</button>
            </div>
        <?php endif; ?>

        <div class="row">
            <!-- Left: Order Items & Customer Details -->
            <div class="col-12 col-md-7 mb-4">
                <div class="card border-0 shadow-sm p-4 rounded-lg mb-4">
                    <h5 class="font-weight-bold mb-3" style="font-family:'Playfair Display', serif;">Customer &amp; Shipping Info</h5>
                    <div class="small text-muted mb-3">
                        <div class="mb-1"><strong class="text-dark">Customer Name:</strong> <?= htmlspecialchars($order['customer_name']) ?></div>
                        <div class="mb-1"><strong class="text-dark">Email:</strong> <?= htmlspecialchars($order['customer_email']) ?></div>
                        <div class="mb-1"><strong class="text-dark">Phone:</strong> <?= htmlspecialchars($order['customer_phone'] ?: 'N/A') ?></div>
                        <div class="mb-1"><strong class="text-dark">Address:</strong> <?= htmlspecialchars($order['shipping_address']) ?>, <?= htmlspecialchars($order['city']) ?>, <?= htmlspecialchars($order['state']) ?> - <?= htmlspecialchars($order['pincode']) ?></div>
                        <div><strong class="text-dark">Order Date:</strong> <?= date('F j, Y, g:i A', strtotime($order['created_at'])) ?></div>
                    </div>

                    <?php if (!empty($order['razorpay_payment_id'])): ?>
                        <div class="p-3 bg-light rounded small border">
                            <strong class="text-success"><i class="fa fa-check-circle mr-1"></i> Razorpay Payment Verified</strong>
                            <div class="mt-1 font-mono text-dark">Payment ID: <?= htmlspecialchars($order['razorpay_payment_id']) ?></div>
                            <?php if (!empty($order['razorpay_order_id'])): ?>
                                <div class="font-mono text-muted">Order ID: <?= htmlspecialchars($order['razorpay_order_id']) ?></div>
                            <?php endif; ?>
                        </div>
                    <?php endif; ?>
                </div>

                <div class="card border-0 shadow-sm p-4 rounded-lg">
                    <h5 class="font-weight-bold mb-3" style="font-family:'Playfair Display', serif;">Order Items</h5>
                    <div class="table-responsive">
                        <table class="table table-sm align-middle small mb-0">
                            <thead class="thead-light">
                                <tr>
                                    <th>Item</th>
                                    <th>Specs</th>
                                    <th>Qty</th>
                                    <th class="text-right">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($items as $item): ?>
                                    <tr>
                                        <td>
                                            <div class="d-flex align-items-center">
                                                <img src="<?= htmlspecialchars($item['image']) ?>" alt="" style="width: 36px; height: 42px; object-fit: cover; border-radius: 4px;" class="mr-2">
                                                <strong class="text-dark"><?= htmlspecialchars($item['product_name']) ?></strong>
                                            </div>
                                        </td>
                                        <td class="text-muted">Size: <?= htmlspecialchars($item['size']) ?></td>
                                        <td>&times; <?= $item['quantity'] ?></td>
                                        <td class="text-right font-weight-bold">₹<?= number_format($item['price'] * $item['quantity'], 2) ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                    <div class="d-flex justify-content-between pt-3 border-top mt-3">
                        <span class="font-weight-bold">Total Amount:</span>
                        <strong class="text-danger h5 mb-0">₹<?= number_format($order['total'], 2) ?></strong>
                    </div>
                </div>
            </div>

            <!-- Right: Status Update Form -->
            <div class="col-12 col-md-5">
                <div class="card border-0 shadow-sm p-4 rounded-lg bg-white">
                    <h5 class="font-weight-bold mb-3" style="font-family:'Playfair Display', serif;">Update Order Status</h5>
                    
                    <form method="POST">
                        <div class="form-group">
                            <label class="small font-weight-bold">Fulfillment Status</label>
                            <select name="status" class="form-control form-control-sm">
                                <?php
                                $statuses = [
                                    'pending' => 'Pending Review',
                                    'processing' => 'Processing & Packaging',
                                    'shipped' => 'Dispatched / In Transit',
                                    'delivered' => 'Delivered to Customer',
                                    'cancelled' => 'Cancelled'
                                ];
                                foreach ($statuses as $val => $lbl): ?>
                                    <option value="<?= $val ?>" <?= $order['status'] === $val ? 'selected' : '' ?>>
                                        <?= $lbl ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="small font-weight-bold">Payment Status</label>
                            <select name="payment_status" class="form-control form-control-sm">
                                <option value="unpaid" <?= $order['payment_status'] === 'unpaid' ? 'selected' : '' ?>>Unpaid (Pending Settlement)</option>
                                <option value="paid" <?= $order['payment_status'] === 'paid' ? 'selected' : '' ?>>Paid (Verified)</option>
                                <option value="refunded" <?= $order['payment_status'] === 'refunded' ? 'selected' : '' ?>>Refunded</option>
                            </select>
                        </div>

                        <button type="submit" name="update_order" class="btn btn-dark btn-block font-weight-bold py-2 mt-4">
                            <i class="fa fa-save mr-1"></i> Save Changes
                        </button>

                        <a href="order_manage.php" class="btn btn-outline-secondary btn-block small mt-2">
                            <i class="fa fa-arrow-left mr-1"></i> Back to Orders List
                        </a>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
