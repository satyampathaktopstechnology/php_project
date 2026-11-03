<?php
/**
 * Essence Fashion Store - Orders API Endpoint (PHP)
 * Saves orders and items using PDO Prepared Statements & Transactions
 */
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../auth.php';

$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true) ?? $_POST;

function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $cust_name = trim($body['customer_name'] ?? '');
    $cust_email = strtolower(trim($body['customer_email'] ?? ''));
    $cust_phone = trim($body['customer_phone'] ?? '');
    $address = trim($body['shipping_address'] ?? '');
    $city = trim($body['city'] ?? 'Mumbai');
    $state = trim($body['state'] ?? 'Maharashtra');
    $pincode = trim($body['pincode'] ?? '400001');
    $items = $body['items'] ?? [];
    $discount = floatval($body['discount'] ?? 0);
    $pay_method = $body['payment_method'] ?? 'cod';
    $rzp_order_id = $body['razorpay_order_id'] ?? null;
    $rzp_payment_id = $body['razorpay_payment_id'] ?? null;

    if (empty($cust_name) || empty($cust_email) || empty($address) || empty($items)) {
        jsonResponse(['success' => false, 'message' => 'Missing required customer or cart information.'], 400);
    }

    $subtotal = 0;
    foreach ($items as $item) {
        $p = floatval($item['price'] ?? 0);
        $q = intval($item['quantity'] ?? 1);
        $subtotal += ($p * $q);
    }

    $total = max(0, $subtotal - $discount);
    $pay_status = (!empty($rzp_payment_id) && $pay_method === 'razorpay') ? 'paid' : 'unpaid';
    $order_status = ($pay_status === 'paid') ? 'processing' : 'pending';
    $order_number = 'ORD-' . substr(time(), -5) . rand(10, 99);
    $user_id = is_logged_in() ? $_SESSION['user_id'] : null;

    try {
        $conn->beginTransaction();

        // Prepared Statement: prevents SQL injection
        $orderStmt = $conn->prepare("
            INSERT INTO orders (
                order_number, user_id, customer_name, customer_email, customer_phone,
                shipping_address, city, state, pincode, subtotal, discount, total,
                status, payment_method, payment_status, razorpay_order_id, razorpay_payment_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $orderStmt->execute([
            $order_number, $user_id, $cust_name, $cust_email, $cust_phone,
            $address, $city, $state, $pincode, $subtotal, $discount, $total,
            $order_status, $pay_method, $pay_status, $rzp_order_id, $rzp_payment_id
        ]);

        $orderId = $conn->lastInsertId();

        // Insert Order Items with Prepared Statement
        $itemStmt = $conn->prepare("
            INSERT INTO order_items (
                order_id, product_id, product_name, price, quantity, size, color, image
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");

        foreach ($items as $it) {
            $itemStmt->execute([
                $orderId,
                $it['id'] ?? null,
                $it['name'] ?? 'Essence Style',
                floatval($it['price'] ?? 0),
                intval($it['quantity'] ?? 1),
                $it['size'] ?? 'M',
                $it['color'] ?? '#111827',
                $it['image'] ?? 'img/product-img/product-1.jpg'
            ]);
        }

        // Record in payments table if paid
        if (!empty($rzp_payment_id)) {
            $payStmt = $conn->prepare("
                INSERT INTO payments (order_id, payment_id, amount, currency, status, method)
                VALUES (?, ?, ?, 'INR', 'paid', 'razorpay')
            ");
            $payStmt->execute([$orderId, $rzp_payment_id, $total]);
        }

        $conn->commit();

        jsonResponse([
            'success' => true,
            'message' => 'Order created successfully!',
            'orderId' => $orderId,
            'orderNumber' => $order_number,
            'total' => $total,
            'paymentStatus' => $pay_status
        ], 201);
    } catch (Throwable $e) {
        $conn->rollBack();
        jsonResponse(['success' => false, 'message' => 'Failed to save order: ' . $e->getMessage()], 500);
    }
}

jsonResponse(['success' => false, 'message' => 'Invalid request method.'], 405);
