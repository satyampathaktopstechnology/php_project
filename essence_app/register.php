<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $phone = trim($_POST['phone'] ?? '');
    $role = $_POST['role'] ?? 'subscriber';

    if (!in_array($role, ['subscriber', 'editor', 'admin'], true)) {
        $role = 'subscriber';
    }

    if (empty($name) || empty($email) || empty($password)) {
        $error = "Please fill in all required fields.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = "Please enter a valid email address.";
    } elseif (strlen($password) < 6) {
        $error = "Password must be at least 6 characters long.";
    } else {
        // Parameterized query to check existing email
        $checkStmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $checkStmt->execute([strtolower($email)]);
        if ($checkStmt->fetch()) {
            $error = "An account with this email address already exists.";
        } else {
            // Prepared statement insert
            $hash = password_hash($password, PASSWORD_BCRYPT);
            $insert = $conn->prepare("INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)");
            $insert->execute([$name, strtolower($email), $hash, $role, $phone]);

            // Auto-login
            $userId = $conn->lastInsertId();
            $_SESSION['user_id'] = $userId;
            $_SESSION['user_name'] = $name;
            $_SESSION['user_email'] = strtolower($email);
            $_SESSION['user_role'] = $role;

            if (in_array($role, ['admin', 'editor'], true)) {
                header("Location: admin.php");
            } else {
                header("Location: index.php");
            }
            exit;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create Account - Essence Fashion Store</title>
    <link rel="stylesheet" href="css/bootstrap.min.css">
    <link rel="stylesheet" href="style.css">
    <style>
        body { background: #f4f5f8; font-family: 'Poppins', sans-serif; }
        .auth-container { max-width: 460px; margin: 40px auto; background: #fff; padding: 40px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
        .btn-essence { background: #000; color: #fff; font-weight: 600; padding: 12px; border: none; border-radius: 8px; width: 100%; letter-spacing: 1px; text-transform: uppercase; font-size: 13px; transition: all 0.3s; }
        .btn-essence:hover { background: #ff084e; color: #fff; }
    </style>
</head>
<body>
    <div class="container">
        <div class="auth-container">
            <div class="text-center mb-4">
                <a href="index.php"><img src="img/core-img/logo.png" alt="Essence" style="height: 38px;"></a>
                <h4 class="mt-3 font-weight-bold" style="font-family: 'Playfair Display', serif;">Join Essence</h4>
                <p class="text-muted small">Create your account with role permissions</p>
            </div>

            <?php if (!empty($error)): ?>
                <div class="alert alert-danger py-2 small"><?= htmlspecialchars($error) ?></div>
            <?php endif; ?>

            <form method="POST" action="register.php">
                <div class="form-group">
                    <label class="small font-weight-bold">Full Name *</label>
                    <input type="text" name="name" class="form-control form-control-sm" required placeholder="Jessica Taylor" value="<?= htmlspecialchars($_POST['name'] ?? '') ?>">
                </div>

                <div class="form-group">
                    <label class="small font-weight-bold">Email Address *</label>
                    <input type="email" name="email" class="form-control form-control-sm" required placeholder="name@example.com" value="<?= htmlspecialchars($_POST['email'] ?? '') ?>">
                </div>

                <div class="form-group">
                    <label class="small font-weight-bold">Phone Number</label>
                    <input type="tel" name="phone" class="form-control form-control-sm" placeholder="+91 98765 43210" value="<?= htmlspecialchars($_POST['phone'] ?? '') ?>">
                </div>

                <div class="form-group">
                    <label class="small font-weight-bold">Password *</label>
                    <input type="password" name="password" class="form-control form-control-sm" required placeholder="At least 6 characters">
                </div>

                <div class="form-group">
                    <label class="small font-weight-bold">Select Account Role</label>
                    <select name="role" class="form-control form-control-sm">
                        <option value="subscriber">Subscriber (Customer)</option>
                        <option value="editor">Editor (Product Catalog &amp; Blogs)</option>
                        <option value="admin">Administrator (Full Access)</option>
                    </select>
                    <small class="text-muted">Choose your role for testing role-based dashboard access.</small>
                </div>

                <button type="submit" class="btn btn-essence mt-2">Create Account</button>
            </form>

            <div class="text-center mt-3">
                <span class="small text-muted">Already have an account? <a href="login.php" class="font-weight-bold text-dark">Sign In</a></span>
            </div>

            <div class="text-center mt-3 pt-2 border-top">
                <a href="index.php" class="small text-secondary">&larr; Back to Store</a>
            </div>
        </div>
    </div>
</body>
</html>
