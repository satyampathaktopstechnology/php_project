<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

$curr_user = current_user();

// Count wishlist
$wishlist_count = 0;
if (is_logged_in()) {
    $wlStmt = $conn->prepare("SELECT COUNT(*) AS total FROM wishlist WHERE user_id = ?");
    $wlStmt->execute([$curr_user['id']]);
    $wishlist_count = $wlStmt->fetch()['total'] ?? 0;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="description" content="Essence - Fashion Lifestyle E-Commerce Store with Razorpay Payment and RBAC Management">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title><?= isset($page_title) ? htmlspecialchars($page_title) . " - " : "" ?>Essence Fashion Store</title>

    <!-- Favicon -->
    <link rel="icon" href="img/core-img/favicon.ico">

    <!-- Core Style CSS -->
    <link rel="stylesheet" href="css/core-style.css">
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="css/bootstrap.min.css">
    <link rel="stylesheet" href="css/font-awesome.min.css">

    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap" rel="stylesheet">

    <!-- Razorpay Standard Checkout Script -->
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

    <style>
        .demo-top-bar { background: #111827; color: #d1d5db; font-size: 11.5px; padding: 6px 15px; border-bottom: 1px solid #1f2937; }
        .demo-top-bar a.badge-role { padding: 4px 9px; border-radius: 4px; font-weight: 600; text-decoration: none; color: white; display: inline-block; margin-left: 4px; }
        .badge-admin { background: #e11d48; }
        .badge-editor { background: #2563eb; }
        .badge-sub { background: #10b981; }
        .active-role-pill { background: #1f2937; border: 1px solid #374151; padding: 2px 8px; border-radius: 4px; color: #fff; }
        .essence-cart-drawer { position: fixed; top: 0; right: -420px; width: 400px; max-width: 90vw; height: 100vh; background: #fff; z-index: 99999; box-shadow: -5px 0 25px rgba(0,0,0,0.15); transition: right 0.35s ease; display: flex; flex-direction: column; }
        .essence-cart-drawer.open { right: 0; }
        .cart-drawer-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 99998; }
        .cart-drawer-overlay.open { display: block; }
        .badge-count { position: absolute; top: -5px; right: -8px; background: #ff084e; color: #fff; font-size: 10px; width: 17px; height: 17px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
    </style>
</head>
<body>
    <!-- Top Interactive Demo Role Bar -->
    <div class="demo-top-bar">
        <div class="container-fluid d-flex flex-wrap justify-content-between align-items-center">
            <div class="d-flex align-items-center mb-1 mb-md-0">
                <span class="mr-2 font-weight-bold text-white text-uppercase" style="letter-spacing:0.5px;">Role-Based Access:</span>
                <?php if ($curr_user): ?>
                    <span class="active-role-pill">
                        <?= htmlspecialchars($curr_user['name']) ?> 
                        <strong class="text-uppercase">(<?= htmlspecialchars($curr_user['role']) ?>)</strong>
                    </span>
                <?php else: ?>
                    <span class="text-muted">Guest / Unauthenticated</span>
                <?php endif; ?>
                <span class="ml-2 text-muted d-none d-lg-inline">&bull; Protected with SQL Prepared Statements</span>
            </div>

            <div class="d-flex align-items-center flex-wrap">
                <span class="text-muted mr-1 small d-none d-sm-inline">Switch Role:</span>
                <a href="?switch_role=admin" class="badge-role badge-admin" title="Switch to Full Administrator">👑 Admin</a>
                <a href="?switch_role=editor" class="badge-role badge-editor" title="Switch to Editor (Catalog & Products)">✍️ Editor</a>
                <a href="?switch_role=subscriber" class="badge-role badge-sub" title="Switch to Customer/Subscriber">🛍️ Subscriber</a>

                <?php if ($curr_user): ?>
                    <a href="logout.php" class="ml-2 text-danger font-weight-bold" style="text-decoration:none;" title="Sign Out">Sign Out</a>
                <?php else: ?>
                    <a href="login.php" class="ml-2 text-white font-weight-bold" style="text-decoration:none;">Sign In</a>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <!-- ##### Header Area Start ##### -->
    <header class="header_area">
        <div class="classy-nav-container breakpoint-off d-flex align-items-center justify-content-between">
            <!-- Classy Menu -->
            <nav class="classy-navbar" id="essenceNav">
                <!-- Logo -->
                <a class="nav-brand" href="index.php"><img src="img/core-img/logo.png" alt="Essence" style="height:36px;"></a>
                <!-- Navbar Toggler -->
                <div class="classy-navbar-toggler">
                    <span class="navbarToggler"><span></span><span></span><span></span></span>
                </div>
                <!-- Menu -->
                <div class="classy-menu">
                    <!-- close btn -->
                    <div class="classycloseIcon">
                        <div class="cross-wrap"><span class="top"></span><span class="bottom"></span></div>
                    </div>
                    <!-- Nav Start -->
                    <div class="classynav">
                        <ul>
                            <li><a href="index.php">Home</a></li>
                            <li><a href="shop.php">Shop</a></li>
                            <li><a href="shop.php?cat=dresses">Dresses</a></li>
                            <li><a href="shop.php?cat=shoes">Shoes</a></li>
                            <li><a href="shop.php?cat=accessories">Accessories</a></li>
                            <li><a href="blog.php">Blog</a></li>
                            <li><a href="contact.php">Contact</a></li>

                            <?php if ($curr_user && in_array($curr_user['role'], ['admin', 'editor'], true)): ?>
                                <li>
                                    <a href="admin.php" class="font-weight-bold text-danger">
                                        <i class="fa fa-dashboard mr-1"></i> Dashboard (<?= strtoupper($curr_user['role']) ?>)
                                    </a>
                                </li>
                            <?php endif; ?>
                        </ul>
                    </div>
                    <!-- Nav End -->
                </div>
            </nav>

            <!-- Header Meta Data -->
            <div class="header-meta d-flex clearfix justify-content-end align-items-center">
                <!-- Search Area -->
                <div class="search-area mr-3">
                    <form action="shop.php" method="get">
                        <input type="search" name="search" id="headerSearch" placeholder="Type for products...">
                        <button type="submit"><i class="fa fa-search" aria-hidden="true"></i></button>
                    </form>
                </div>

                <!-- Favourite Area -->
                <div class="favourite-area position-relative mr-3">
                    <a href="wishlist.php" title="View Wishlist"><img src="img/core-img/heart.svg" alt="Wishlist"></a>
                    <span class="badge-count wishlist-counter"><?= $wishlist_count ?></span>
                </div>

                <!-- User Login info -->
                <div class="user-login-info mr-3">
                    <?php if ($curr_user): ?>
                        <a href="<?= in_array($curr_user['role'], ['admin', 'editor']) ? 'admin.php' : 'wishlist.php' ?>" title="Signed in as <?= htmlspecialchars($curr_user['name']) ?>">
                            <img src="img/core-img/user.svg" alt="User">
                        </a>
                    <?php else: ?>
                        <a href="login.php" title="Sign In"><img src="img/core-img/user.svg" alt="User"></a>
                    <?php endif; ?>
                </div>

                <!-- Cart Area Trigger -->
                <div class="cart-area position-relative">
                    <a href="javascript:void(0);" id="essenceCartBtn" title="Shopping Bag">
                        <img src="img/core-img/bag.svg" alt="Bag">
                        <span class="badge-count cart-counter">0</span>
                    </a>
                </div>
            </div>
        </div>
    </header>
    <!-- ##### Header Area End ##### -->

    <!-- ##### Slide-Out Shopping Bag Drawer (jQuery Powered) ##### -->
    <div class="cart-drawer-overlay" id="cartOverlay"></div>
    <div class="essence-cart-drawer" id="essenceCartDrawer">
        <div class="d-flex justify-content-between align-items-center p-3 border-bottom bg-dark text-white">
            <h6 class="mb-0 text-white font-weight-bold text-uppercase" style="letter-spacing:1px;">Shopping Bag</h6>
            <button type="button" class="close text-white" id="closeCartBtn">&times;</button>
        </div>
        <div class="p-3 flex-grow-1 overflow-auto" id="cartItemsContainer">
            <!-- Dynamic Cart Items injected by jQuery -->
            <div class="text-center py-5 text-muted small">Your bag is empty.</div>
        </div>
        <div class="p-3 border-top bg-light">
            <div class="d-flex justify-content-between mb-2 small text-muted">
                <span>Subtotal</span>
                <span class="font-weight-bold text-dark" id="cartSubtotal">₹0.00</span>
            </div>
            <div class="d-flex justify-content-between mb-3 font-weight-bold">
                <span>Estimated Total</span>
                <span class="text-danger font-weight-bold h5 mb-0" id="cartTotal">₹0.00</span>
            </div>
            <a href="checkout.php" class="btn btn-block btn-dark font-weight-bold py-2 text-uppercase" style="letter-spacing:1px; font-size:12px;">
                Proceed To Checkout &rarr;
            </a>
        </div>
    </div>
