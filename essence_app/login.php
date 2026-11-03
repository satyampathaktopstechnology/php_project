<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

$error = '';
$msg = $_GET['msg'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        $error = "Please provide both your email and password.";
    } else {
        // Robust protection against SQL Injection using prepared statements
        $stmt = $conn->prepare("SELECT id, name, email, password_hash, role, avatar FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([strtolower($email)]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            session_regenerate_id(true);
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['user_role'] = $user['role'];
            $_SESSION['user_avatar'] = $user['avatar'];

            // Redirect based on role
            if (in_array($user['role'], ['admin', 'editor'], true)) {
                header("Location: admin.php");
            } else {
                header("Location: index.php");
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
    <link rel="stylesheet" href="css/bootstrap.min.css">
    <link rel="stylesheet" href="css/font-awesome.min.css">
    <link rel="stylesheet" href="style.css">
    <style>
        body { background: #f4f5f8; font-family: 'Poppins', sans-serif; }
        .auth-container { max-width: 440px; margin: 60px auto; background: #fff; padding: 40px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
        .btn-essence { background: #000; color: #fff; font-weight: 600; padding: 12px; border: none; border-radius: 8px; width: 100%; letter-spacing: 1px; text-transform: uppercase; font-size: 13px; transition: all 0.3s; }
        .btn-essence:hover { background: #ff084e; color: #fff; }
        .demo-badge { cursor: pointer; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-decoration: none; display: inline-block; transition: all 0.2s; }
        .demo-badge:hover { text-decoration: none; opacity: 0.9; }
    </style>
</head>
<body>
    <div class="container">
        <div class="auth-container">
            <div class="text-center mb-4">
                <a href="index.php"><img src="img/core-img/logo.png" alt="Essence" style="height: 38px;"></a>
                <h4 class="mt-3 font-weight-bold" style="font-family: 'Playfair Display', serif;">Welcome Back</h4>
                <p class="text-muted small">Sign in to your Essence account</p>
            </div>

            <?php if (!empty($msg)): ?>
                <div class="alert alert-info py-2 small"><?= htmlspecialchars($msg) ?></div>
            <?php endif; ?>

            <?php if (!empty($error)): ?>
                <div class="alert alert-danger py-2 small"><?= htmlspecialchars($error) ?></div>
            <?php endif; ?>

            <form method="POST" action="login.php" id="loginForm">
                <div class="form-group">
                    <label class="small font-weight-bold">Email Address</label>
                    <input type="email" name="email" id="email" class="form-control form-control-sm" required placeholder="name@example.com" value="<?= htmlspecialchars($_POST['email'] ?? '') ?>">
                </div>
                <div class="form-group">
                    <label class="small font-weight-bold">Password</label>
                    <input type="password" name="password" id="password" class="form-control form-control-sm" required placeholder="••••••••">
                </div>
                <button type="submit" class="btn btn-essence mt-2">Sign In</button>
            </form>

            <div class="text-center mt-3">
                <span class="small text-muted">Don't have an account? <a href="register.php" class="font-weight-bold text-dark">Register</a></span>
            </div>

            <hr class="my-4">

            <div class="text-center">
                <p class="small text-muted font-weight-bold mb-2">Instant Demo Login (One-Click):</p>
                <div class="d-flex justify-content-center flex-wrap" style="gap:6px;">
                    <a href="?switch_role=admin" class="demo-badge text-white" style="background:#e11d48;" title="Full Administrator Privileges">👑 Admin</a>
                    <a href="?switch_role=editor" class="demo-badge text-white" style="background:#2563eb;" title="Catalog & Product Management">✍️ Editor</a>
                    <a href="?switch_role=subscriber" class="demo-badge text-white" style="background:#10b981;" title="Customer & Subscriber">🛍️ Subscriber</a>
                </div>
            </div>

            <div class="text-center mt-3 pt-2">
                <a href="index.php" class="small text-secondary">&larr; Back to Store</a>
            </div>
        </div>
    </div>

    <!-- jQuery for interactive demo pre-fill -->
    <script src="js/jquery/jquery-2.2.4.min.js"></script>
</body>
</html>
