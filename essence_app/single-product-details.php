<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

$id = intval($_GET['id'] ?? 1);

// Fetch product with prepared statement
$stmt = $conn->prepare("
    SELECT products.*, brands.name AS brand_name, categories.name AS category_name
    FROM products
    LEFT JOIN brands ON products.brand_id = brands.id
    LEFT JOIN categories ON products.category_id = categories.id
    WHERE products.id = ?
");
$stmt->execute([$id]);
$product = $stmt->fetch();

if (!$product) {
    header("Location: shop.php");
    exit;
}

$page_title = $product['name'];
require_once __DIR__ . '/header.php';

// Handle Review Submission using prepared statements
$review_success = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['submit_review'])) {
    $r_name = trim($_POST['reviewer_name'] ?? 'Verified Shopper');
    $r_rating = intval($_POST['rating'] ?? 5);
    $r_comment = trim($_POST['comment'] ?? '');

    if (!empty($r_comment)) {
        $rStmt = $conn->prepare("INSERT INTO reviews (product_id, user_name, rating, comment) VALUES (?, ?, ?, ?)");
        $rStmt->execute([$id, $r_name, $r_rating, $r_comment]);
        $review_success = "Your review has been submitted successfully!";
    }
}

// Fetch Reviews using prepared statements
$revStmt = $conn->prepare("SELECT * FROM reviews WHERE product_id = ? ORDER BY id DESC");
$revStmt->execute([$id]);
$reviews = $revStmt->fetchAll();

// Related products
$relStmt = $conn->prepare("SELECT * FROM products WHERE id != ? ORDER BY id DESC LIMIT 4");
$relStmt->execute([$id]);
$related = $relStmt->fetchAll();
?>

<!-- ##### Single Product Details Area Start ##### -->
<section class="single_product_details_area section-padding-80 clearfix">
    <div class="container">
        <!-- Breadcrumb -->
        <nav aria-label="breadcrumb" class="mb-4">
            <ol class="breadcrumb bg-transparent p-0 small">
                <li class="breadcrumb-item"><a href="index.php" class="text-muted">Home</a></li>
                <li class="breadcrumb-item"><a href="shop.php" class="text-muted">Shop</a></li>
                <li class="breadcrumb-item active text-dark font-weight-bold" aria-current="page"><?= htmlspecialchars($product['name']) ?></li>
            </ol>
        </nav>

        <div class="row">
            <!-- Product Gallery Image -->
            <div class="col-12 col-md-6 mb-4">
                <div class="single_product_thumb bg-light rounded overflow-hidden shadow-sm p-2 text-center" style="min-height: 480px;">
                    <img id="mainProductImg" src="<?= htmlspecialchars($product['image']) ?>" alt="<?= htmlspecialchars($product['name']) ?>" style="max-height: 480px; width: auto; object-fit: contain;">
                </div>
            </div>

            <!-- Product Description Details -->
            <div class="col-12 col-md-6">
                <div class="single_product_desc">
                    <span class="text-muted text-uppercase small font-weight-bold"><?= htmlspecialchars($product['brand_name'] ?? 'Essence Atelier') ?></span>
                    <h3 class="font-weight-bold text-dark mt-1" style="font-family:'Playfair Display', serif;"><?= htmlspecialchars($product['name']) ?></h3>
                    <p class="text-muted font-mono small mb-2">SKU: <?= htmlspecialchars($product['sku']) ?></p>

                    <div class="d-flex align-items-center mb-3">
                        <div class="text-warning mr-2">
                            <?php for ($i = 1; $i <= 5; $i++): ?>
                                <i class="fa fa-star<?= $i <= round($product['rating']) ? '' : '-o' ?>"></i>
                            <?php endfor; ?>
                        </div>
                        <span class="small font-weight-bold text-dark"><?= number_format($product['rating'], 1) ?></span>
                        <span class="small text-muted ml-2">(<?= count($reviews) ?> Reviews)</span>
                    </div>

                    <div class="product-price mb-3">
                        <span class="h3 font-weight-bold text-dark">₹<?= number_format($product['price'], 2) ?></span>
                        <?php if ($product['old_price']): ?>
                            <span class="h5 text-muted ml-2" style="text-decoration: line-through;">₹<?= number_format($product['old_price'], 2) ?></span>
                            <span class="badge badge-danger ml-2">SAVE ₹<?= number_format($product['old_price'] - $product['price'], 2) ?></span>
                        <?php endif; ?>
                    </div>

                    <p class="product-desc text-muted small leading-relaxed mb-4">
                        <?= nl2br(htmlspecialchars($product['description'])) ?>
                    </p>

                    <div class="bg-light p-3 rounded mb-4 small">
                        <div class="row">
                            <div class="col-6 mb-2"><strong>Material:</strong> <?= htmlspecialchars($product['material'] ?? '100% Cotton') ?></div>
                            <div class="col-6 mb-2"><strong>Category:</strong> <?= htmlspecialchars($product['category_name'] ?? 'Fashion') ?></div>
                            <div class="col-6"><strong>Stock:</strong> <span class="badge badge-success"><?= $product['stock_quantity'] ?> in stock</span></div>
                            <div class="col-6"><strong>Delivery:</strong> Free Express Shipping</div>
                        </div>
                    </div>

                    <!-- Quantity and Add to cart -->
                    <div class="cart-fav-box d-flex align-items-center mb-4">
                        <div class="mr-3" style="width: 80px;">
                            <input type="number" id="productQuantity" class="form-control text-center font-weight-bold" value="1" min="1" max="<?= $product['stock_quantity'] ?>">
                        </div>
                        <button 
                            type="button" 
                            class="btn essence-btn add-to-cart-btn mr-3"
                            data-id="<?= $product['id'] ?>"
                            data-name="<?= htmlspecialchars($product['name']) ?>"
                            data-price="<?= $product['price'] ?>"
                            data-image="<?= htmlspecialchars($product['image']) ?>"
                        >
                            <i class="fa fa-shopping-bag mr-2"></i> Add To Bag
                        </button>
                        <a href="wishlist.php?add=<?= $product['id'] ?>" class="btn btn-outline-danger p-2 px-3" title="Save to Wishlist">
                            <i class="fa fa-heart"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Customer Reviews Section -->
        <div class="row mt-5 pt-5 border-top">
            <div class="col-12 col-md-6 mb-4">
                <h4 class="font-weight-bold mb-3" style="font-family:'Playfair Display', serif;">Customer Reviews</h4>
                <?php if (count($reviews) === 0): ?>
                    <p class="text-muted small">No reviews yet for this product. Be the first to share your thoughts!</p>
                <?php else: ?>
                    <?php foreach ($reviews as $r): ?>
                        <div class="bg-white p-3 rounded border mb-3 shadow-sm">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <span class="font-weight-bold text-dark small"><?= htmlspecialchars($r['user_name']) ?></span>
                                <div class="text-warning small">
                                    <?php for ($i = 1; $i <= 5; $i++): ?>
                                        <i class="fa fa-star<?= $i <= $r['rating'] ? '' : '-o' ?>"></i>
                                    <?php endfor; ?>
                                </div>
                            </div>
                            <p class="mb-1 text-muted small"><?= nl2br(htmlspecialchars($r['comment'])) ?></p>
                            <span class="text-muted" style="font-size:10px;"><?= htmlspecialchars($r['created_at']) ?></span>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>

            <!-- Submit Review Form -->
            <div class="col-12 col-md-6">
                <div class="bg-light p-4 rounded shadow-sm border">
                    <h5 class="font-weight-bold mb-3 text-dark">Write a Review</h5>
                    <?php if (!empty($review_success)): ?>
                        <div class="alert alert-success py-2 small"><?= $review_success ?></div>
                    <?php endif; ?>
                    <form method="POST" action="single-product-details.php?id=<?= $product['id'] ?>">
                        <div class="form-group">
                            <label class="small font-weight-bold">Your Name</label>
                            <input type="text" name="reviewer_name" class="form-control form-control-sm" required value="<?= htmlspecialchars($curr_user['name'] ?? 'Shopper') ?>">
                        </div>
                        <div class="form-group">
                            <label class="small font-weight-bold">Rating</label>
                            <select name="rating" class="form-control form-control-sm">
                                <option value="5">5 Stars - Outstanding</option>
                                <option value="4">4 Stars - Very Good</option>
                                <option value="3">3 Stars - Average</option>
                                <option value="2">2 Stars - Below Expectation</option>
                                <option value="1">1 Star - Poor</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="small font-weight-bold">Comment</label>
                            <textarea name="comment" rows="3" class="form-control form-control-sm" required placeholder="How was the fit, material, and comfort?"></textarea>
                        </div>
                        <button type="submit" name="submit_review" class="btn btn-dark btn-sm font-weight-bold px-4">Submit Review</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</section>
<!-- ##### Single Product Details Area End ##### -->

<?php require_once __DIR__ . '/footer.php'; ?>