<?php
require_once __DIR__ . '/db_secure.php';
require_once __DIR__ . '/auth_check.php';

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        $error = "Please provide both email and password.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = "Please enter a valid email address.";
    } else {
        // Robust protection against SQL Injection using prepared statements and parameterized queries
        $stmt = $pdo->prepare("SELECT id, name, email, password_hash, role, avatar FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([strtolower($email)]);
        $user = $stmt->fetch();

        if ($user && (password_verify($password, $user['password_hash']) || hash('sha256', $password . '_essence_salt') === $user['password_hash'])) {
            // Secure Session Management: Regenerate session ID to prevent Session Fixation attacks
            session_regenerate_id(true);

            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['user_role'] = $user['role'];
            $_SESSION['last_login'] = time();

            // Redirect based on role
            if ($user['role'] === 'admin') {
                header("Location: admin.php");
            } elseif ($user['role'] === 'editor') {
                header("Location: product_manage.php");
            } else {
                header("Location: dashboard_subscriber.php");
            }
            exit;
        } else {
            $error = "Invalid email or password. Please try again.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Essence Fashion Store</title>
    <link rel="stylesheet" href="../css/bootstrap.min.css">
    <style>
        body { background: #f9f9fb; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .auth-card { max-width: 440px; margin: 80px auto; background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
        .btn-essence { background: #ff3f6c; color: white; font-weight: 600; padding: 12px; border: none; border-radius: 6px; width: 100%; }
        .btn-essence:hover { background: #e02f5a; color: white; }
    </style>
</head>
<body>
<div class="container">
    <div class="auth-card">
        <h3 class="text-center font-weight-bold mb-1">Welcome Back</h3>
        <p class="text-center text-muted mb-4">Sign in to your Essence account</p>

        <?php if (!empty($error)): ?>
            <div class="alert alert-danger"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
        <?php endif; ?>

        <form method="POST" action="login.php" novalidate>
            <div class="form-group">
                <label>Email Address</label>
                <input type="email" name="email" class="form-control" placeholder="name@example.com" required value="<?= htmlspecialchars($_POST['email'] ?? '', ENT_QUOTES, 'UTF-8') ?>">
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" name="password" class="form-control" placeholder="••••••••" required>
            </div>
            <button type="submit" class="btn btn-essence mt-2">Sign In</button>
        </form>

        <div class="mt-4 pt-3 border-top text-center text-muted small">
            <span>Demo Accounts:</span><br>
            <strong>admin@essence.com</strong> (Admin) &bull; <strong>editor@essence.com</strong> (Editor) &bull; <strong>customer@essence.com</strong> (Subscriber)<br>
            Password: <em>admin123 / editor123 / customer123</em>
        </div>
    </div>
</div>
</body>
</html>
