<?php
include "db.php";

$id = $_GET['id'] ?? 0;

// Get product
$sql = "SELECT * FROM products WHERE id = $id";
$result = mysqli_query($conn, $sql);

$product = mysqli_fetch_assoc($result);

if (!$product) {
    die("Product not found");
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="description" content="">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <!-- The above 4 meta tags *must* come first in the head; any other head content must come *after* these tags -->

    <!-- Title  -->
    <title><?= htmlspecialchars($product['name']) ?> | Essence</title>

    <!-- Favicon  -->
    <link rel="icon" href="img/core-img/favicon.ico">

    <!-- Core Style CSS -->
    <link rel="stylesheet" href="css/core-style.css?v=20261030g">
    <link rel="stylesheet" href="style.css?v=20261030x">
    <link rel="stylesheet" href="css/essence-unified.css?v=20261102">

</head>

<body>
    <!-- ##### Header Area Start ##### -->
    <header class="header_area">
        <div class="classy-nav-container breakpoint-off d-flex align-items-center justify-content-between">
            <!-- Classy Menu -->
            <nav class="classy-navbar" id="essenceNav">
                <!-- Logo -->
                <a class="nav-brand" href="index.php"><img src="img/core-img/logo.png" alt=""></a>
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
                            <li><a href="#">Shop</a>
                                <div class="megamenu">
                                    <ul class="single-mega cn-col-4">
                                        <li class="title">Women's Collection</li>
                                        <li><a href="shop.php">Dresses</a></li>
                                        <li><a href="shop.php">Blouses &amp; Shirts</a></li>
                                        <li><a href="shop.php">T-shirts</a></li>
                                        <li><a href="shop.php">Rompers</a></li>
                                        <li><a href="shop.php">Bras &amp; Panties</a></li>
                                    </ul>
                                    <ul class="single-mega cn-col-4">
                                        <li class="title">Men's Collection</li>
                                        <li><a href="shop.php">T-Shirts</a></li>
                                        <li><a href="shop.php">Polo</a></li>
                                        <li><a href="shop.php">Shirts</a></li>
                                        <li><a href="shop.php">Jackets</a></li>
                                        <li><a href="shop.php">Trench</a></li>
                                    </ul>
                                    <ul class="single-mega cn-col-4">
                                        <li class="title">Kid's Collection</li>
                                        <li><a href="shop.php">Dresses</a></li>
                                        <li><a href="shop.php">Shirts</a></li>
                                        <li><a href="shop.php">T-shirts</a></li>
                                        <li><a href="shop.php">Jackets</a></li>
                                        <li><a href="shop.php">Trench</a></li>
                                    </ul>
                                    <div class="single-mega cn-col-4">
                                        <img src="img/bg-img/bg-6.jpg" alt="">
                                    </div>
                                </div>
                            </li>
                            <li><a href="#">Pages</a>
                                <ul class="dropdown">
                                    <li><a href="index.php">Home</a></li>
                                    <li><a href="shop.php">Shop</a></li>
                                    <li><a href="shop.php">Shop Products</a></li>
                                    <li><a href="checkout.php">Checkout</a></li>
                                    <li><a href="blog.php">Blog</a></li>
                                    <li><a href="single-blog.php">Single Blog</a></li>
                                    <li><a href="regular-page.php">Regular Page</a></li>
                                    <li><a href="contact.php">Contact</a></li>
                                </ul>
                            </li>
                            <li><a href="blog.php">Blog</a></li>
                            <li><a href="contact.php">Contact</a></li>
                        </ul>
                    </div>
                    <!-- Nav End -->
                </div>
            </nav>

            <!-- Header Meta Data -->
            <div class="header-meta d-flex clearfix justify-content-end">
                <!-- Search Area -->
                <div class="search-area">
                    <form action="#" method="post">
                        <input type="search" name="search" id="headerSearch" placeholder="Type for search">
                        <button type="submit"><i class="fa fa-search" aria-hidden="true"></i></button>
                    </form>
                </div>
                <!-- Favourite Area -->
                <div class="favourite-area">
                    <a href="wishlist.php" aria-label="View wishlist" title="View wishlist">
                        <img src="img/core-img/heart.svg" alt="">
                        <span class="wishlist-count" aria-live="polite">0</span>
                    </a>
                </div>
                <!-- User Login Info -->
                <div class="user-login-info">
                    <a href="user_info_page.php" aria-label="My account"><img src="img/core-img/user.svg" alt=""></a>
                </div>
                <!-- Cart Area -->
                <div class="cart-area">
                    <a href="checkout.php" id="essenceCartBtn" aria-label="View shopping cart" title="View shopping cart">
                        <img src="img/core-img/bag.svg" alt="">
                        <span class="cart-count" aria-live="polite">0</span>
                    </a>
                </div>
            </div>

        </div>
    </header>
    <!-- ##### Header Area End ##### -->
    <!-- ##### Single Product Details Area Start ##### -->
    <main class="product-detail-page">
        <div class="container product-detail-container">
        <section class="single_product_details_area d-flex align-items-center" data-product-id="<?= (int) $product['id'] ?>">

        <!-- Single Product Thumb -->
<div class="single_product_thumb clearfix">
    <img
        src="img/product-img/<?php echo htmlspecialchars($product['image']); ?>"
        width="300"
        alt="<?php echo htmlspecialchars($product['name']); ?>"
        class="selected-product-image"
    >
</div>>

        <!-- Single Product Description -->
        <div class="single_product_desc clearfix" data-product-id="<?= (int) $product['id'] ?>">
            <span><?= htmlspecialchars($product['brand']) ?></span>
            <h2><?= htmlspecialchars($product['name']) ?></h2>
            <div class="detail-rating" aria-label="Rated 4.8 out of 5">
                <span>★★★★★</span>
                <small>4.8 (124 reviews)</small>
            </div>
            <p class="product-price">
                <?php if (!empty($product['old_price'])): ?>
                    <span class="old-price">₹.<?= number_format((float) $product['old_price'], 2) ?></span>
                <?php endif; ?>
                <?= '₹.' . number_format((float) $product['price'], 2) ?>
            </p>
         <p class="stock-status">
             <?php if ($product['stock_quantity'] > 0) { ?>
                    <i class="fa fa-check-circle"></i>
                         In stock (<?php echo (int)$product['stock_quantity']; ?> available)
                         <?php } else { ?>
                         Out of stock
              <?php } ?>
      </p>

<p class="product-desc">
    <?php echo htmlspecialchars($product['description']); ?>
</p>

            <!-- Form -->
            <form class="cart-form clearfix" method="post" onsubmit="return false;">
                <!-- Select Box -->
                <div class="select-box d-flex mt-50 mb-30">
                    <select name="select" id="productSize" class="mr-5">
                        <option value="XL">Size: XL</option>
                        <option value="X">Size: X</option>
                        <option value="M">Size: M</option>
                        <option value="S">Size: S</option>
                    </select>
                        <select name="productColor" id="productColor">
                            <?php if (!empty($product['colors']) && is_array($product['colors'])): ?>
                                <?php foreach ($product['colors'] as $color): ?>
                                    <option value="<?= htmlspecialchars($color) ?>">
                                        Color: <?= htmlspecialchars($color) ?>
                                    </option>
                                <?php endforeach; ?>
                            <?php else: ?>
                                <option value="">No colors available</option>
                            <?php endif; ?>
                        </select>
                </div>
                <!-- Cart & Favourite Box -->
                <div class="cart-fav-box d-flex align-items-center">
                    <!-- Cart -->
                    <button
                        type="button"
                        name="addtocart"
                        value="<?php echo (int)$product['id']; ?>"
                        class="btn essence-btn detail-add-cart"
                        <?php echo ($product['stock_quantity'] <= 0) ? 'disabled' : ''; ?>
                    >
                        Add to cart
                    </button>
                                        <div class="product-favourite ml-4">
                        <a href="#" class="favme fa fa-heart"></a>
                    </div>
                </div>
            </form>

            <div class="product-meta">
                <p><strong>SKU:</strong> <span><?= htmlspecialchars($product['sku']) ?></span></p>
                <p><strong>Material:</strong> <span><?= htmlspecialchars($product['material']) ?></span></p>
                <p><strong>Category:</strong> <span>Women's Dresses</span></p>
            </div>
            <div class="product-delivery-info">
                <div><i class="fa fa-truck" aria-hidden="true"></i><span><strong>Free delivery</strong><small>On orders over ₹2,000</small></span></div>
                <div><i class="fa fa-refresh" aria-hidden="true"></i><span><strong>Easy returns</strong><small>Within 30 days</small></span></div>
            </div>
        </div>
        </section>
        </div>
    </main>
    <!-- ##### Single Product Details Area End ##### -->

    <!-- ##### Footer Area Start ##### -->
    <footer class="footer_area clearfix">
        <div class="container">
            <div class="row">
                <!-- Single Widget Area -->
                <div class="col-12 col-md-6">
                    <div class="single_widget_area d-flex mb-30">
                        <!-- Logo -->
                        <div class="footer-logo mr-50">
                            <a href="#"><img src="img/core-img/logo2.png" alt=""></a>
                        </div>
                        <!-- Footer Menu -->
                        <div class="footer_menu">
                            <ul>
                                <li><a href="shop.php">Shop</a></li>
                                <li><a href="blog.php">Blog</a></li>
                                <li><a href="contact.php">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <!-- Single Widget Area -->
                <div class="col-12 col-md-6">
                    <div class="single_widget_area mb-30">
                        <ul class="footer_widget_menu">
                            <li><a href="#">Order Status</a></li>
                            <li><a href="#">Payment Options</a></li>
                            <li><a href="#">Shipping and Delivery</a></li>
                            <li><a href="#">Guides</a></li>
                            <li><a href="#">Privacy Policy</a></li>
                            <li><a href="#">Terms of Use</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="row align-items-end">
                <!-- Single Widget Area -->
                <div class="col-12 col-md-6">
                    <div class="single_widget_area">
                        <div class="footer_heading mb-30">
                            <h6>Subscribe</h6>
                        </div>
                        <div class="subscribtion_form">
                            <form action="#" method="post">
                                <input type="email" name="mail" class="mail" placeholder="Your email here">
                                <button type="submit" class="submit"><i class="fa fa-long-arrow-right" aria-hidden="true"></i></button>
                            </form>
                        </div>
                    </div>
                </div>
                <!-- Single Widget Area -->
                <div class="col-12 col-md-6">
                    <div class="single_widget_area">
                        <div class="footer_social_area">
                            <a href="#" data-toggle="tooltip" data-placement="top" title="Facebook"><i class="fa fa-facebook" aria-hidden="true"></i></a>
                            <a href="#" data-toggle="tooltip" data-placement="top" title="Instagram"><i class="fa fa-instagram" aria-hidden="true"></i></a>
                            <a href="#" data-toggle="tooltip" data-placement="top" title="Twitter"><i class="fa fa-twitter" aria-hidden="true"></i></a>
                            <a href="#" data-toggle="tooltip" data-placement="top" title="Pinterest"><i class="fa fa-pinterest" aria-hidden="true"></i></a>
                            <a href="#" data-toggle="tooltip" data-placement="top" title="Youtube"><i class="fa fa-youtube-play" aria-hidden="true"></i></a>
                        </div>
                    </div>
                </div>
            </div>

<div class="row mt-5">
                <div class="col-md-12 text-center">
                    <p>
                        <!-- Link back to Colorlib can't be removed. Template is licensed under CC BY 3.0. -->
    Copyright &copy;<script>document.write(new Date().getFullYear());</script> All rights reserved | Made with <i class="fa fa-heart-o" aria-hidden="true"></i> by <a href="https://colorlib.com" target="_blank">Colorlib</a>, distributed by <a href="https://themewagon.com/" target="_blank">ThemeWagon</a>
    <!-- Link back to Colorlib can't be removed. Template is licensed under CC BY 3.0. -->
                    </p>
                </div>
            </div>

        </div>
    </footer>
    <!-- ##### Footer Area End ##### -->

    <!-- jQuery (Necessary for All JavaScript Plugins) -->
    <script src="js/jquery/jquery-2.2.4.min.js"></script>
    <!-- Popper js -->
    <script src="js/popper.min.js"></script>
    <!-- Bootstrap js -->
    <script src="js/bootstrap.min.js"></script>
    <!-- Plugins js -->
    <script src="js/plugins.js"></script>
    <!-- Classy Nav js -->
    <script src="js/classy-nav.min.js"></script>
    <!-- Active js -->
    <script src="js/active.js?v=20261030x"></script>

</body>

</html>