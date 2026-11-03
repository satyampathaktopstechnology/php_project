<?php
/**
 * Essence Fashion Store - Auth API Endpoint
 * Handles login, register, status, and logout via JSON
 * Completely protected with PDO prepared statements
 */
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../auth.php';

$action = $_GET['action'] ?? ($_POST['action'] ?? '');
$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true) ?? $_POST;

function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

try {
    // 1. Session Status Check
    if ($action === 'status' || $_SERVER['REQUEST_METHOD'] === 'GET') {
        if (is_logged_in()) {
            jsonResponse([
                'loggedIn' => true,
                'user' => current_user()
            ]);
        }
        jsonResponse(['loggedIn' => false, 'user' => null]);
    }

    // 2. Login via Prepared Statements
    if ($action === 'login') {
        $email = trim($body['email'] ?? '');
        $password = trim($body['password'] ?? '');

        if (empty($email) || empty($password)) {
            jsonResponse(['success' => false, 'message' => 'Email and password are required.'], 400);
        }

        $stmt = $conn->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([strtolower($email)]);
        $user = $stmt->fetch();

        if (!$user) {
            jsonResponse(['success' => false, 'message' => 'Invalid email or password.'], 401);
        }

        $isValid = password_verify($password, $user['password_hash']) || ($user['password_hash'] === hash('sha256', $password));

        if (!$isValid) {
            jsonResponse(['success' => false, 'message' => 'Invalid email or password.'], 401);
        }

        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_role'] = $user['role'];
        $_SESSION['user_avatar'] = $user['avatar'];

        jsonResponse([
            'success' => true,
            'message' => "Welcome back, {$user['name']}!",
            'user' => current_user()
        ]);
    }

    // 3. Register via Prepared Statements
    if ($action === 'register') {
        $name = trim($body['name'] ?? '');
        $email = strtolower(trim($body['email'] ?? ''));
        $password = trim($body['password'] ?? '');
        $role = $body['role'] ?? 'subscriber';

        if (empty($name) || empty($email) || empty($password)) {
            jsonResponse(['success' => false, 'message' => 'Name, email, and password are required.'], 400);
        }

        if (strlen($password) < 6) {
            jsonResponse(['success' => false, 'message' => 'Password must be at least 6 characters.'], 400);
        }

        $checkStmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $checkStmt->execute([$email]);
        if ($checkStmt->fetch()) {
            jsonResponse(['success' => false, 'message' => 'An account with this email already exists.'], 409);
        }

        $allowedRoles = ['admin', 'editor', 'subscriber'];
        $userRole = in_array($role, $allowedRoles, true) ? $role : 'subscriber';
        $hashed = password_hash($password, PASSWORD_DEFAULT);

        $insertStmt = $conn->prepare("
            INSERT INTO users (name, email, password_hash, role)
            VALUES (?, ?, ?, ?)
        ");
        $insertStmt->execute([$name, $email, $hashed, $userRole]);
        $newId = $conn->lastInsertId();

        session_regenerate_id(true);
        $_SESSION['user_id'] = $newId;
        $_SESSION['user_name'] = $name;
        $_SESSION['user_email'] = $email;
        $_SESSION['user_role'] = $userRole;

        jsonResponse([
            'success' => true,
            'message' => 'Account registered successfully!',
            'user' => current_user()
        ], 201);
    }

    // 4. Logout
    if ($action === 'logout') {
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        session_destroy();
        jsonResponse(['success' => true, 'message' => 'Signed out successfully.']);
    }

    jsonResponse(['success' => false, 'message' => 'Invalid action.'], 400);
} catch (Throwable $e) {
    jsonResponse(['success' => false, 'message' => 'Server error: ' . $e->getMessage()], 500);
}
