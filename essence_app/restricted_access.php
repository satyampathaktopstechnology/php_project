<?php
$current_user = current_user();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Access Restricted - Essence Fashion Store</title>
    <link rel="stylesheet" href="css/bootstrap.min.css">
    <link rel="stylesheet" href="css/core-style.css">
    <link rel="stylesheet" href="style.css">
    <style>
        body { background: #f9f9fb; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .restricted-card { max-width: 580px; margin: 80px auto; background: #fff; padding: 40px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); text-align: center; }
        .lock-icon { width: 64px; height: 64px; line-height: 64px; border-radius: 16px; background: #ffe4e6; color: #e11d48; font-size: 28px; margin: 0 auto 20px; }
        .btn-role-admin { background: #e11d48; color: #fff; font-weight: 600; padding: 10px 18px; border-radius: 8px; border: none; text-decoration: none; display: inline-block; }
        .btn-role-admin:hover { background: #be123c; color: #fff; }
        .btn-role-editor { background: #2563eb; color: #fff; font-weight: 600; padding: 10px 18px; border-radius: 8px; border: none; text-decoration: none; display: inline-block; }
        .btn-role-editor:hover { background: #1d4ed8; color: #fff; }
    </style>
</head>
<body>
    <div class="container">
        <div class="restricted-card">
            <div class="lock-icon">🔒</div>
            <span class="badge badge-danger text-uppercase px-3 py-1 font-weight-bold" style="background:#e11d48;">Restricted Access &bull; 403 Forbidden</span>
            <h2 class="mt-3 font-weight-bold">Restricted Dashboard Access</h2>
            <p class="text-muted mt-2" style="font-size:14px;">
                You are currently signed in as <strong><?= htmlspecialchars($current_user['name'] ?? 'User') ?></strong> with the role of <span class="badge badge-info text-uppercase"><?= htmlspecialchars($current_user['role'] ?? 'subscriber') ?></span>.
                Subscriber accounts are restricted from accessing management dashboards and product editing tools.
            </p>

            <div class="bg-light p-3 rounded text-left my-4" style="font-size:13px;">
                <p class="font-weight-bold mb-2 text-dark">Role Access Guide:</p>
                <div class="mb-1 text-muted">&bull; <strong class="text-danger">Administrator</strong>: Full access to Analytics, Products, Orders, User Roles, and Settings.</div>
                <div class="mb-1 text-muted">&bull; <strong class="text-primary">Editor</strong>: Catalog management, add/edit products, update order statuses.</div>
                <div class="text-muted">&bull; <strong class="text-success">Subscriber</strong>: Customer shopping, order tracking, wishlist, and profile.</div>
            </div>

            <p class="font-weight-bold text-dark mb-3" style="font-size:13px;">Test With Authorized Role (One-Click Demo Switcher):</p>
            <div class="d-flex justify-content-center flex-wrap" style="gap:10px;">
                <a href="?switch_role=admin" class="btn-role-admin">Switch to Admin (Alexander)</a>
                <a href="?switch_role=editor" class="btn-role-editor">Switch to Editor (Sophia)</a>
            </div>

            <div class="mt-4 pt-3 border-top">
                <a href="index.php" class="text-secondary small font-weight-bold">&larr; Return to Essence Store Homepage</a>
            </div>
        </div>
    </div>
</body>
</html>
