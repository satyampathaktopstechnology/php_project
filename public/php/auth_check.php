<?php
/**
 * Essence Fashion Store - Secure Session & Role-Based Access Control (RBAC)
 * Controls access for:
 *  - 'admin': Full access to all dashboards, analytics, user, and product management
 *  - 'editor': Catalog and content management, cannot delete users or change system settings
 *  - 'subscriber': Customer dashboard only (order tracking, profile, wishlist)
 */

if (session_status() === PHP_SESSION_NONE) {
    // Configure secure session cookie parameters
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    ini_set('session.cookie_samesite', 'Strict');
    session_start();
}

// Ensure user is authenticated
function check_authenticated() {
    if (empty($_SESSION['user_id'])) {
        header("Location: login.php?error=" . urlencode("Please sign in to access this page."));
        exit;
    }
}

// Role-based access enforcement
function require_role($allowed_roles = ['admin']) {
    check_authenticated();

    $current_role = $_SESSION['user_role'] ?? 'subscriber';

    if (!in_array($current_role, $allowed_roles, true)) {
        http_response_code(403);
        include __DIR__ . '/restricted_access.php';
        exit;
    }
}

// Helper to check if current user has permission
function has_role($role) {
    return isset($_SESSION['user_role']) && $_SESSION['user_role'] === $role;
}
?>
