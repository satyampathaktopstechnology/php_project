<?php
/**
 * Essence Fashion Store - Delete Product (Admin Only)
 * Protected with Prepared Statements and Strict Role Validation
 */
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

// Strict Role Check: Only Administrators can delete catalog products
require_role(['admin']);

if (isset($_GET['id'])) {
    $id = intval($_GET['id']);

    if ($id > 0) {
        // Prepared Statement: prevents SQL injection
        $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
        $stmt->execute([$id]);

        header("Location: admin.php?msg=" . urlencode("Product #{$id} deleted successfully."));
        exit;
    }
}

header("Location: admin.php");
exit;