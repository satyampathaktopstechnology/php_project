<?php
/**
 * Essence Fashion Store - Wishlist
 * Fully dynamic with PDO prepared statements and local storage fallback
 */
$page_title = "My Wishlist";
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

$curr_user = current_user();

// Handle remove item from wishlist via POST
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['remove_wishlist_id']) && is_logged_in()) {
    $wl_id = intval($_POST['remove_wishlist_id']);
    $delStmt = $conn->prepare("DELETE FROM wishlist WHERE id = ? AND user_id = ?");
    $delStmt->execute([$wl_id, $curr_user['id']]);
    header("Location: wishlist.php?msg=" . urlencode("Item removed from your wishlist."));
    exit;
}

$wishlist_items = [];
if (is_logged_in()) {
    $stmt = $conn->prepare("
        SELECT wishlist.id AS wishlist_id, products.*, brands.name AS brand_name
        FROM wishlist
        INNER JOIN products ON wishlist.product_id = products.id
        LEFT JOIN brands ON products.brand_id = brands.id
        WHERE wishlist.user_id = ?
        ORDER BY wishlist.id DESC
    ");
    $stmt->execute([$curr_user['id']]);
    $wishlist_items = $stmt->fetchAll();
}

require_once __DIR__ . '/header.php';
?>

<div class="breadcumb_area bg-img" style="background-image: url(img/bg-img/breadcumb.jpg); padding: 40px 0;">
    <div class="container h-100">
        <div class="row h-100 align-items-center">
            <div class="col-12 text-center">
                <h2 style="font-family:'Playfair Display', serif;" class="text-white">Saved Wishlist</h2>
                <p class="text-white small mb-0"><i class="fa fa-heart text-danger mr-1"></i> Your Curated Favorite Styles</p>
            </div>
        </div>
    </div>
</div>

<div class="section-padding-80">
    <div class="container">
        <?php if (isset($_GET['msg'])): ?>
            <div class="alert alert-success alert-dismissible fade show mb-4" role="alert">
                <i class="fa fa-check-circle mr-2"></i> <?= htmlspecialchars($_GET['msg']) ?>
                <button type="button" class="close" data-dismiss="alert">&times;</button>
            </div>
        <?php endif; ?>

        <?php if (!is_logged_in()): ?>
            <div class="alert alert-info py-3 mb-4 d-flex align-items-center justify-content-between">
                <div>
                    <i class="fa fa-info-circle mr-2"></i> Sign in to save your wishlist permanently across all your devices.
                </div>
                <a href="login.php" class="btn btn-sm btn-dark">Sign In</a>
            </div>
        <?php endif; ?>

        <div class="row">
            <?php if (empty($wishlist_items)): ?>
                <div class="col-12 text-center py-5">
                    <div class="mb-3 text-muted">
                        <i class="fa fa-heart-o fa-4x text-secondary"></i>
                    </div>
                    <h4 style="font-family:'Playfair Display', serif;">Your Wishlist is Empty</h4>
                    <p class="text-muted small">Explore our latest arrivals and tap the heart icon to save items here.</p>
                    <a href="shop.php" class="btn btn-dark mt-2">Explore Collection</a>
                </div>
            <?php else: ?>
                <?php foreach ($wishlist_items as $item): ?>
                    <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
                        <div class="card h-100 border-0 shadow-sm rounded-lg overflow-hidden position-relative">
                            <form method="POST" class="position-absolute" style="top: 10px; right: 10px; z-index: 10;">
                                <input type="hidden" name="remove_wishlist_id" value="<?= $item['wishlist_id'] ?>">
                                <button type="submit" class="btn btn-sm btn-light rounded-circle shadow-sm text-danger" title="Remove">
                                    <i class="fa fa-times"></i>
                                </button>
                            </form>

                            <a href="single-product-details.php?id=<?= $item['id'] ?>">
                                <img src="<?= htmlspecialchars($item['image']) ?>" alt="<?= htmlspecialchars($item['name']) ?>" class="card-img-top" style="height: 280px; object-fit: cover;">
                            </a>

                            <div class="card-body p-3 d-flex flex-column justify-content-between">
                                <div>
                                    <span class="text-muted small text-uppercase"><?= htmlspecialchars($item['brand_name'] ?? 'Essence') ?></span>
                                    <h6 class="font-weight-bold mb-1 mt-1 text-truncate">
                                        <a href="single-product-details.php?id=<?= $item['id'] ?>" class="text-dark"><?= htmlspecialchars($item['name']) ?></a>
                                    </h6>
                                    <div class="mb-2">
                                        <strong class="text-dark">₹<?= number_format($item['price'], 2) ?></strong>
                                        <?php if (!empty($item['old_price'])): ?>
                                            <small class="text-muted text-decoration-line-through ml-1">₹<?= number_format($item['old_price'], 2) ?></small>
                                        <?php endif; ?>
                                    </div>
                                </div>

                                <button type="button" class="btn btn-sm btn-outline-dark btn-block mt-2 add-to-bag-btn" 
                                    data-id="<?= $item['id'] ?>"
                                    data-name="<?= htmlspecialchars($item['name']) ?>"
                                    data-price="<?= $item['price'] ?>"
                                    data-image="<?= htmlspecialchars($item['image']) ?>">
                                    <i class="fa fa-shopping-bag mr-1"></i> Move to Bag
                                </button>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
