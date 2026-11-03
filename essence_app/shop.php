<?php
$page_title = "Shop";
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/header.php';

// Filter inputs
$cat_slug = trim($_GET['cat'] ?? 'all');
$brand_id = intval($_GET['brand'] ?? 0);
$search = trim($_GET['search'] ?? '');
$sort = trim($_GET['sort'] ?? 'newest');
$min_price = floatval($_GET['min_price'] ?? 0);
$max_price = floatval($_GET['max_price'] ?? 10000);

// Base query with parameterized conditions
$sql = "
    SELECT products.*, brands.name AS brand_name, categories.name AS category_name, categories.slug AS category_slug
    FROM products
    LEFT JOIN brands ON products.brand_id = brands.id
    LEFT JOIN categories ON products.category_id = categories.id
    WHERE 1=1
";
$params = [];

if ($cat_slug !== 'all' && !empty($cat_slug)) {
    $sql .= " AND (categories.slug = ? OR categories.name = ?)";
    $params[] = $cat_slug;
    $params[] = $cat_slug;
}

if ($brand_id > 0) {
    $sql .= " AND products.brand_id = ?";
    $params[] = $brand_id;
}

if (!empty($search)) {
    $sql .= " AND (products.name LIKE ? OR products.description LIKE ? OR products.sku LIKE ?)";
    $term = "%" . $search . "%";
    $params[] = $term;
    $params[] = $term;
    $params[] = $term;
}

if ($max_price > 0) {
    $sql .= " AND products.price <= ?";
    $params[] = $max_price;
}

// Sorting
if ($sort === 'price_asc') {
    $sql .= " ORDER BY products.price ASC";
} elseif ($sort === 'price_desc') {
    $sql .= " ORDER BY products.price DESC";
} elseif ($sort === 'rating') {
    $sql .= " ORDER BY products.rating DESC";
} else {
    $sql .= " ORDER BY products.id DESC";
}

$stmt = $conn->prepare($sql);
$stmt->execute($params);
$products = $stmt->fetchAll();

// Categories for sidebar
$catList = $conn->query("SELECT * FROM categories ORDER BY id ASC")->fetchAll();
// Brands for sidebar
$brandList = $conn->query("SELECT * FROM brands ORDER BY id ASC")->fetchAll();
?>

<!-- ##### Breadcumb Area Start ##### -->
<div class="breadcumb_area bg-img" style="background-image: url(img/bg-img/breadcumb.jpg); padding: 50px 0;">
    <div class="container h-100">
        <div class="row h-100 align-items-center">
            <div class="col-12 text-center">
                <h2 style="font-family:'Playfair Display', serif;" class="text-white">Boutique Catalog</h2>
                <p class="text-white small mb-0">Showing <?= count($products) ?> tailored fashion styles</p>
            </div>
        </div>
    </div>
</div>
<!-- ##### Breadcumb Area End ##### -->

<!-- ##### Shop Grid Area Start ##### -->
<section class="shop_grid_area section-padding-80">
    <div class="container">
        <div class="row">
            <!-- Sidebar Area (Filters) -->
            <div class="col-12 col-md-4 col-lg-3">
                <div class="shop_sidebar_area bg-white p-4 rounded shadow-sm border mb-4">
                    <!-- Search input -->
                    <div class="widget mb-4">
                        <h6 class="widget-title mb-3 small text-uppercase font-weight-bold">Search Catalog</h6>
                        <form action="shop.php" method="GET">
                            <input type="text" name="search" class="form-control form-control-sm" placeholder="Search keywords..." value="<?= htmlspecialchars($search) ?>">
                            <input type="hidden" name="cat" value="<?= htmlspecialchars($cat_slug) ?>">
                        </form>
                    </div>

                    <!-- Categories Filter -->
                    <div class="widget mb-4">
                        <h6 class="widget-title mb-3 small text-uppercase font-weight-bold">Departments</h6>
                        <ul class="list-unstyled small mb-0">
                            <li class="mb-2">
                                <a href="shop.php?cat=all" class="<?= $cat_slug === 'all' ? 'font-weight-bold text-danger' : 'text-dark' ?>">
                                    All Departments
                                </a>
                            </li>
                            <?php foreach ($catList as $c): ?>
                                <li class="mb-2">
                                    <a href="shop.php?cat=<?= urlencode($c['slug']) ?>" class="<?= $cat_slug === $c['slug'] ? 'font-weight-bold text-danger' : 'text-dark' ?>">
                                        <?= htmlspecialchars($c['name']) ?>
                                    </a>
                                </li>
                            <?php endforeach; ?>
                        </ul>
                    </div>

                    <!-- Brands Filter -->
                    <div class="widget mb-4">
                        <h6 class="widget-title mb-3 small text-uppercase font-weight-bold">Brands</h6>
                        <ul class="list-unstyled small mb-0">
                            <li class="mb-2">
                                <a href="shop.php?brand=0&cat=<?= urlencode($cat_slug) ?>" class="<?= $brand_id === 0 ? 'font-weight-bold text-danger' : 'text-dark' ?>">
                                    All Brands
                                </a>
                            </li>
                            <?php foreach ($brandList as $b): ?>
                                <li class="mb-2">
                                    <a href="shop.php?brand=<?= $b['id'] ?>&cat=<?= urlencode($cat_slug) ?>" class="<?= $brand_id == $b['id'] ? 'font-weight-bold text-danger' : 'text-dark' ?>">
                                        <?= htmlspecialchars($b['name']) ?>
                                    </a>
                                </li>
                            <?php endforeach; ?>
                        </ul>
                    </div>

                    <!-- Reset button -->
                    <div>
                        <a href="shop.php" class="btn btn-sm btn-outline-secondary btn-block">Reset All Filters</a>
                    </div>
                </div>
            </div>

            <!-- Products Grid Area -->
            <div class="col-12 col-md-8 col-lg-9">
                <!-- Shop Top Bar -->
                <div class="shop_grid_product_area mb-4">
                    <div class="row align-items-center">
                        <div class="col-12 col-md-6">
                            <p class="small text-muted mb-0">Found <strong><?= count($products) ?></strong> items</p>
                        </div>
                        <div class="col-12 col-md-6 text-md-right mt-2 mt-md-0">
                            <form action="shop.php" method="GET" class="d-inline-flex align-items-center">
                                <input type="hidden" name="cat" value="<?= htmlspecialchars($cat_slug) ?>">
                                <input type="hidden" name="brand" value="<?= $brand_id ?>">
                                <input type="hidden" name="search" value="<?= htmlspecialchars($search) ?>">
                                <span class="small text-muted mr-2">Sort:</span>
                                <select name="sort" class="form-control form-control-sm w-auto" onchange="this.form.submit()">
                                    <option value="newest" <?= $sort === 'newest' ? 'selected' : '' ?>>Newest First</option>
                                    <option value="price_asc" <?= $sort === 'price_asc' ? 'selected' : '' ?>>Price: Low to High</option>
                                    <option value="price_desc" <?= $sort === 'price_desc' ? 'selected' : '' ?>>Price: High to Low</option>
                                    <option value="rating" <?= $sort === 'rating' ? 'selected' : '' ?>>Top Customer Rated</option>
                                </select>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- Products Row -->
                <div class="row">
                    <?php if (count($products) === 0): ?>
                        <div class="col-12 text-center py-5">
                            <p class="text-muted">No products matched your search filters.</p>
                            <a href="shop.php" class="btn btn-sm btn-dark">Clear Filters</a>
                        </div>
                    <?php else: ?>
                        <?php foreach ($products as $p): ?>
                            <?php
                            $discount = ($p['old_price'] && $p['old_price'] > $p['price'])
                                ? round((($p['old_price'] - $p['price']) / $p['old_price']) * 100)
                                : 0;
                            ?>
                            <div class="col-12 col-sm-6 col-lg-4 mb-4">
                                <div class="single-product-wrapper card border-0 shadow-sm rounded-lg overflow-hidden h-100">
                                    <div class="product-img position-relative" style="height: 300px; overflow: hidden; background:#f5f5f5;">
                                        <a href="single-product-details.php?id=<?= $p['id'] ?>">
                                            <img src="<?= htmlspecialchars($p['image']) ?>" alt="<?= htmlspecialchars($p['name']) ?>" style="width:100%; height:100%; object-fit:cover;">
                                        </a>

                                        <?php if ($discount > 0): ?>
                                            <div class="product-badge offer-badge" style="position:absolute; top:10px; left:10px;">
                                                <span class="badge badge-danger px-2 py-1"><?= $discount ?>% OFF</span>
                                            </div>
                                        <?php endif; ?>

                                        <div class="product-favourite" style="position:absolute; top:10px; right:10px;">
                                            <a href="wishlist.php?add=<?= $p['id'] ?>" class="favme fa fa-heart text-white bg-dark p-2 rounded-circle" style="opacity:0.8;" title="Save item"></a>
                                        </div>
                                    </div>

                                    <div class="product-description p-3 d-flex flex-column justify-content-between flex-grow-1">
                                        <div>
                                            <span class="text-muted small text-uppercase font-weight-bold" style="font-size:10px;"><?= htmlspecialchars($p['brand_name'] ?? 'Essence') ?></span>
                                            <h6 class="mt-1 mb-2">
                                                <a href="single-product-details.php?id=<?= $p['id'] ?>" class="text-dark font-weight-bold text-truncate d-block">
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
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</section>
<!-- ##### Shop Grid Area End ##### -->

<?php require_once __DIR__ . '/footer.php'; ?>