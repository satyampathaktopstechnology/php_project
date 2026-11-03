<?php
/**
 * Essence Fashion Store - Authentication & Role-Based Access Control (RBAC)
 * Simple, clean PHP session management for Administrators, Editors, and Subscribers.
 */

if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    session_start();
}

require_once __DIR__ . '/db.php';

// Quick Demo Switcher helper: ?switch_role=admin|editor|subscriber
if (isset($_GET['switch_role'])) {
    $target_role = strtolower(trim($_GET['switch_role']));
    if (in_array($target_role, ['admin', 'editor', 'subscriber'], true)) {
        $stmt = $conn->prepare("SELECT * FROM users WHERE role = ? LIMIT 1");
        $stmt->execute([$target_role]);
        $demoUser = $stmt->fetch();
        if ($demoUser) {
            session_regenerate_id(true);
            $_SESSION['user_id'] = $demoUser['id'];
            $_SESSION['user_name'] = $demoUser['name'];
            $_SESSION['user_email'] = $demoUser['email'];
            $_SESSION['user_role'] = $demoUser['role'];
            $_SESSION['user_avatar'] = $demoUser['avatar'];

            $redirect = $_SERVER['HTTP_REFERER'] ?? 'index.php';
            // If redirected to login, send to role home
            if (strpos($redirect, 'login.php') !== false) {
                $redirect = ($demoUser['role'] === 'subscriber') ? 'index.php' : 'admin.php';
            }
            header("Location: " . $redirect);
            exit;
        }
    }
}

function is_logged_in() {
    return !empty($_SESSION['user_id']);
}

function current_user() {
    if (!is_logged_in()) return null;
    return [
        'id' => $_SESSION['user_id'],
        'name' => $_SESSION['user_name'] ?? 'User',
        'email' => $_SESSION['user_email'] ?? '',
        'role' => $_SESSION['user_role'] ?? 'subscriber',
        'avatar' => $_SESSION['user_avatar'] ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    ];
}

function has_role($roles) {
    if (!is_logged_in()) return false;
    if (is_string($roles)) $roles = [$roles];
    $currentRole = $_SESSION['user_role'] ?? 'subscriber';
    return in_array($currentRole, $roles, true);
}

function require_login() {
    if (!is_logged_in()) {
        header("Location: login.php?msg=" . urlencode("Please sign in to access this page."));
        exit;
    }
}

function require_role($allowed_roles) {
    require_login();
    if (is_string($allowed_roles)) $allowed_roles = [$allowed_roles];

    $currentRole = $_SESSION['user_role'] ?? 'subscriber';
    if (!in_array($currentRole, $allowed_roles, true)) {
        // Display beautiful, clear restricted access screen
        include __DIR__ . '/restricted_access.php';
        exit;
    }
}
?>
