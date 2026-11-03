<?php
$page_title = "Home";
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/header.php';

// Fetch popular products using prepared statement
$popularStmt = $conn->prepare("
    SELECT products.*, brands.name AS brand_name, categories.slug AS category_slug
    FROM products
    LEFT JOIN brands ON products.brand_id = brands.id
    LEFT JOIN categories ON products.category_id = categories.id
    ORDER BY products.is_popular DESC, products.id DESC
    LIMIT 8
");
$popularStmt->execute();
$popular_products = $popularStmt->fetchAll();

// Fetch categories
$catStmt = $conn->prepare("SELECT * FROM categories ORDER BY id ASC");
$catStmt->execute();
$categories = $catStmt->fetchAll();

// Fetch brands
$brandStmt = $conn->prepare("SELECT * FROM brands ORDER BY id ASC");
$brandStmt->execute();
$brands = $brandStmt->fetchAll();
?>

<!-- ##### Welcome Area Start ##### -->
<section class="welcome_area bg-img background-overlay" style="background-image: url(img/bg-img/bg-1.jpg);">
    <div class="container h-100">
        <div class="row h-100 align-items-center">
            <div class="col-12">
                <div class="hero-content">
                    <h6>Spring / Summer Collection 2026</h6>
                    <h2 style="font-family: 'Playfair Display', serif;">New Modern Essentials</h2>
                    <p class="text-white mb-4" style="max-width: 500px;">
                        Curated silhouettes with breathable European linen, pure silks, and artisanal tailoring.
                    </p>
                    <a href="shop.php" class="btn essence-btn">Explore Collection &rarr;</a>
                </div>
            </div>
        </div>
    </div>
</section>
<!-- ##### Welcome Area End ##### -->

<!-- ##### Top Catagory Area Start ##### -->
<div class="top_catagory_area section-padding-80 clearfix">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-12 text-center mb-5">
                <div class="section-heading">
                    <h2>Shop By Department</h2>
                </div>
            </div>

            <?php foreach ($categories as $index => $cat): ?>
                <div class="col-12 col-sm-6 col-md-3">
                    <div class="single_catagory_area d-flex align-items-center justify-content-center bg-img mb-4" 
                         style="background-image: url(<?= htmlspecialchars($cat['image']) ?>); height: 280px; border-radius: 12px; overflow:hidden;">
                        <div class="catagory-content">
                            <a href="shop.php?cat=<?= urlencode($cat['slug']) ?>" class="btn btn-light font-weight-bold px-3 py-2 text-uppercase" style="font-size:12px; letter-spacing:1px;">
                                <?= htmlspecialchars($cat['name']) ?>
                            </a>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</div>
<!-- ##### Top Catagory Area End ##### -->

<!-- ##### CTA Area Start ##### -->
<div class="cta-area">
    <div class="container">
        <div class="row">
            <div class="col-12">
                <div class="cta-content bg-img background-overlay" style="background-image: url(img/bg-img/bg-5.jpg); border-radius: 16px; overflow:hidden;">
                    <div class="h-100 d-flex align-items-center justify-content-end p-5">
                        <div class="cta--text">
                            <h6>-20% Special Voucher</h6>
                            <h2 class="text-white" style="font-family: 'Playfair Display', serif;">Seasonal Promotion</h2>
                            <p class="text-white small mb-3">Redeem code <strong>WELCOME20</strong> during Razorpay checkout for 20% off.</p>
                            <a href="shop.php" class="btn essence-btn">Shop With Discount</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<!-- ##### CTA Area End ##### -->

<!-- ##### New Arrivals Area Start ##### -->
<section class="new_arrivals_area section-padding-80 clearfix">
    <div class="container">
        <div class="row">
            <div class="col-12">
                <div class="section-heading text-center">
                    <h2>Popular In Store</h2>
                </div>
            </div>
        </div>
    </div>

    <div class="container">
        <div class="row">
            <?php foreach ($popular_products as $p): ?>
                <?php
                $discount = ($p['old_price'] && $p['old_price'] > $p['price'])
                    ? round((($p['old_price'] - $p['price']) / $p['old_price']) * 100)
                    : 0;
                ?>
                <div class="col-12 col-sm-6 col-lg-3 mb-4">
                    <div class="single-product-wrapper card border-0 shadow-sm rounded-lg overflow-hidden h-100">
                        <!-- Product Image -->
                        <div class="product-img position-relative" style="height: 320px; overflow: hidden; background:#f5f5f5;">
                            <a href="single-product-details.php?id=<?= $p['id'] ?>">
                                <img src="<?= htmlspecialchars($p['image']) ?>" alt="<?= htmlspecialchars($p['name']) ?>" style="width:100%; height:100%; object-fit:cover;">
                            </a>
                            
                            <?php if ($discount > 0): ?>
                                <div class="product-badge offer-badge" style="position:absolute; top:12px; left:12px;">
                                    <span class="badge badge-danger px-2 py-1"><?= $discount ?>% OFF</span>
                                </div>
                            <?php endif; ?>

                            <!-- Favourite / Wishlist -->
                            <div class="product-favourite" style="position:absolute; top:12px; right:12px;">
                                <a href="wishlist.php?add=<?= $p['id'] ?>" class="favme fa fa-heart text-white bg-dark p-2 rounded-circle" style="opacity:0.8;" title="Add to Wishlist"></a>
                            </div>
                        </div>

                        <!-- Product Description -->
                        <div class="product-description p-3 d-flex flex-column justify-content-between flex-grow-1">
                            <div>
                                <span class="text-muted small text-uppercase font-weight-bold" style="font-size:10px;"><?= htmlspecialchars($p['brand_name'] ?? 'Essence') ?></span>
                                <h6 class="mt-1 mb-2">
                                    <a href="single-product-details.php?id=<?= $p['id'] ?>" class="text-dark font-weight-bold text-truncate d-block" title="<?= htmlspecialchars($p['name']) ?>">
                                        <?= htmlspecialchars($p['name']) ?>
                                    </a>
                                </h6>
                            </div>

                            <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                                <div>
                                    <span class="font-weight-bold text-dark h6 mb-0">₹<?= number_format($p['price'], 2) ?></span>
                                    <?php if ($p['old_price']): ?>
                                        <span class="text-muted small ml-1" style="text-decoration: line-through;">₹<?= number_format($p['old_price'], 2) ?></span>
                                    <?php endif; ?>
                                </div>

                                <button 
                                    type="button" 
                                    class="btn btn-sm btn-outline-dark add-to-cart-btn"
                                    data-id="<?= $p['id'] ?>"
                                    data-name="<?= htmlspecialchars($p['name']) ?>"
                                    data-price="<?= $p['price'] ?>"
                                    data-image="<?= htmlspecialchars($p['image']) ?>"
                                >
                                    <i class="fa fa-shopping-bag mr-1"></i> Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>

        <div class="text-center mt-4">
            <a href="shop.php" class="btn btn-outline-dark px-4 py-2 font-weight-bold text-uppercase" style="letter-spacing:1px; font-size:12px;">
                View Full Catalog &rarr;
            </a>
        </div>
    </div>
</section>
<!-- ##### New Arrivals Area End ##### -->

<!-- ##### Brands Area Start ##### -->
<div class="brands-area bg-light py-5">
    <div class="container">
        <p class="text-center text-muted small text-uppercase font-weight-bold mb-4" style="letter-spacing:2px;">Featured Brand Partners</p>
        <div class="row align-items-center justify-content-center text-center">
            <?php foreach ($brands as $b): ?>
                <div class="col-4 col-sm-2 mb-3">
                    <img src="<?= htmlspecialchars($b['logo']) ?>" alt="<?= htmlspecialchars($b['name']) ?>" style="max-height: 30px; filter: grayscale(100%); opacity:0.7;">
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</div>
<!-- ##### Brands Area End ##### -->

<?php require_once __DIR__ . '/footer.php'; ?>