<?php
/**
 * Essence Fashion Store - Real-time Razorpay Payment Verification (PHP)
 * Uses Key Secret from rzp-key_eefeebd8.csv for HMAC-SHA256 signature verification
 */
require_once __DIR__ . '/db_secure.php';
require_once __DIR__ . '/auth_check.php';

header('Content-Type: application/json');

$key_secret = "xDgn2N9talijRr8TQ67tXv56";

$input = json_decode(file_get_contents('php://input'), true);

$razorpay_order_id = $input['razorpay_order_id'] ?? '';
$razorpay_payment_id = $input['razorpay_payment_id'] ?? '';
$razorpay_signature = $input['razorpay_signature'] ?? '';
$order_id = $input['order_id'] ?? '';

if (empty($razorpay_order_id) || empty($razorpay_payment_id)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing payment parameters']);
    exit;
}

// Compute expected HMAC SHA-256 signature
$expected_signature = hash_hmac('sha256', $razorpay_order_id . '|' . $razorpay_payment_id, $key_secret);

if (!hash_equals($expected_signature, $razorpay_signature)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid Razorpay payment signature']);
    exit;
}

// Update order and payments table using prepared statements
try {
    $stmt = $pdo->prepare("UPDATE orders SET payment_status = 'paid', status = 'processing', razorpay_payment_id = ? WHERE id = ? OR order_number = ?");
    $stmt->execute([$razorpay_payment_id, $order_id, $order_id]);

    echo json_encode([
        'success' => true,
        'verified' => true,
        'message' => 'Payment verified successfully in real-time!',
        'payment_id' => $razorpay_payment_id
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database update error: ' . $e->getMessage()]);
}
?>
