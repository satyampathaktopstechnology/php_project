<?php
/**
 * Essence Fashion Store - Product Management
 * Role Protected: Administrators & Editors
 * Completely protected against SQL Injection via PDO Prepared Statements
 */
$page_title = "Manage Products";
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

require_role(['admin', 'editor']);

$current_user = current_user();
$is_admin = ($current_user['role'] === 'admin');

$success_msg = "";
$error_msg = "";

// Fetch brands and categories for dropdowns
$brands = $conn->query("SELECT * FROM brands ORDER BY name ASC")->fetchAll();
$categories = $conn->query("SELECT * FROM categories ORDER BY name ASC")->fetchAll();

// Handle Add Product via POST using Prepared Statements
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_product'])) {
    $name = trim($_POST['productname'] ?? '');
    $brand_id = intval($_POST['brand_id'] ?? 1);
    $category_id = intval($_POST['category_id'] ?? 1);
    $price = floatval($_POST['price'] ?? 0);
    $old_price = !empty($_POST['old_price']) ? floatval($_POST['old_price']) : null;
    $description = trim($_POST['description'] ?? '');
    $material = trim($_POST['material'] ?? '');
    $stock_quantity = intval($_POST['stock_quantity'] ?? 10);
    $is_featured = isset($_POST['is_featured']) ? 1 : 0;
    $is_popular = isset($_POST['is_popular']) ? 1 : 0;

    if (empty($name) || $price <= 0) {
        $error_msg = "Please provide a valid product name and price.";
    } else {
        // Image upload handling or fallback
        $imagePath = 'img/product-img/product-1.jpg';
        if (!empty($_FILES['image']['name'])) {
            $folder = __DIR__ . "/img/product-img/";
            if (!is_dir($folder)) {
                mkdir($folder, 0777, true);
            }
            $cleanFilename = preg_replace('/[^a-zA-Z0-9._-]/', '', $_FILES['image']['name']);
            $target = $folder . $cleanFilename;
            if (move_uploaded_file($_FILES['image']['tmp_name'], $target)) {
                $imagePath = 'img/product-img/' . $cleanFilename;
            }
        } elseif (!empty($_POST['image_url'])) {
            $imagePath = trim($_POST['image_url']);
        }

        // Insert using parameterized Prepared Statement
        $insertStmt = $conn->prepare("
            INSERT INTO products (
                name, brand_id, category_id, price, old_price, description, material,
                image, stock_quantity, is_featured, is_popular
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $insertStmt->execute([
            $name, $brand_id, $category_id, $price, $old_price, $description, $material,
            $imagePath, $stock_quantity, $is_featured, $is_popular
        ]);

        $newId = $conn->lastInsertId();
        $sku = "DRS" . str_pad($newId, 3, "0", STR_PAD_LEFT);

        $skuStmt = $conn->prepare("UPDATE products SET sku = ? WHERE id = ?");
        $skuStmt->execute([$sku, $newId]);

        $success_msg = "Product '{$name}' (SKU: {$sku}) added to catalog successfully!";
    }
}

// Fetch all catalog products
$products = $conn->query("
    SELECT products.*, brands.name AS brand_name, categories.name AS category_name
    FROM products
    LEFT JOIN brands ON products.brand_id = brands.id
    LEFT JOIN categories ON products.category_id = categories.id
    ORDER BY products.id DESC
")->fetchAll();

require_once __DIR__ . '/header.php';
?>

<div class="breadcumb_area bg-img" style="background-image: url(img/bg-img/breadcumb.jpg); padding: 40px 0;">
    <div class="container h-100">
        <div class="row h-100 align-items-center">
            <div class="col-12 text-center">
                <h2 style="font-family:'Playfair Display', serif;" class="text-white">Product Catalog Management</h2>
                <p class="text-white small mb-0">Role: <?= strtoupper(htmlspecialchars($current_user['role'])) ?> &bull; Prepared Statements Protected</p>
            </div>
        </div>
    </div>
</div>

<div class="section-padding-80">
    <div class="container-fluid px-lg-5">

        <?php if (!empty($success_msg)): ?>
            <div class="alert alert-success alert-dismissible fade show mb-4" role="alert">
                <i class="fa fa-check-circle mr-2"></i> <?= htmlspecialchars($success_msg) ?>
                <button type="button" class="close" data-dismiss="alert">&times;</button>
            </div>
        <?php endif; ?>

        <?php if (!empty($error_msg)): ?>
            <div class="alert alert-danger alert-dismissible fade show mb-4" role="alert">
                <i class="fa fa-exclamation-triangle mr-2"></i> <?= htmlspecialchars($error_msg) ?>
                <button type="button" class="close" data-dismiss="alert">&times;</button>
            </div>
        <?php endif; ?>

        <div class="row">
            <!-- Left: Add New Product Form -->
            <div class="col-12 col-lg-4 mb-4">
                <div class="card border-0 shadow-sm p-4 rounded-lg bg-white sticky-top" style="top: 20px;">
                    <h5 class="font-weight-bold mb-3" style="font-family:'Playfair Display', serif;">
                        <i class="fa fa-plus-circle text-danger mr-2"></i> Add New Product
                    </h5>
                    <p class="small text-muted mb-4">Add fresh inventory styles. Updates catalog across store in real-time.</p>

                    <form method="POST" enctype="multipart/form-data">
                        <div class="form-group mb-2">
                            <label class="small font-weight-bold">Product Title *</label>
                            <input type="text" name="productname" class="form-control form-control-sm" required placeholder="e.g. Silk Evening Gown">
                        </div>

                        <div class="form-row mb-2">
                            <div class="col-6">
                                <label class="small font-weight-bold">Brand</label>
                                <select name="brand_id" class="form-control form-control-sm">
                                    <?php foreach ($brands as $b): ?>
                                        <option value="<?= $b['id'] ?>"><?= htmlspecialchars($b['name']) ?></option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            <div class="col-6">
                                <label class="small font-weight-bold">Category</label>
                                <select name="category_id" class="form-control form-control-sm">
                                    <?php foreach ($categories as $c): ?>
                                        <option value="<?= $c['id'] ?>"><?= htmlspecialchars($c['name']) ?></option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                        </div>

                        <div class="form-row mb-2">
                            <div class="col-6">
                                <label class="small font-weight-bold">Price (₹) *</label>
                                <input type="number" step="0.01" name="price" class="form-control form-control-sm" required placeholder="2499.00">
                            </div>
                            <div class="col-6">
                                <label class="small font-weight-bold">Old Price (₹)</label>
                                <input type="number" step="0.01" name="old_price" class="form-control form-control-sm" placeholder="2999.00">
                            </div>
                        </div>

                        <div class="form-group mb-2">
                            <label class="small font-weight-bold">Material / Fabric</label>
                            <input type="text" name="material" class="form-control form-control-sm" placeholder="e.g. 100% Pure Mulberry Silk">
                        </div>

                        <div class="form-group mb-2">
                            <label class="small font-weight-bold">Stock Inventory</label>
                            <input type="number" name="stock_quantity" class="form-control form-control-sm" value="25">
                        </div>

                        <div class="form-group mb-2">
                            <label class="small font-weight-bold">Image URL or File</label>
                            <input type="text" name="image_url" class="form-control form-control-sm mb-1" placeholder="img/product-img/product-1.jpg">
                            <input type="file" name="image" class="form-control-file small">
                        </div>

                        <div class="form-group mb-3">
                            <label class="small font-weight-bold">Description</label>
                            <textarea name="description" rows="3" class="form-control form-control-sm" placeholder="Styling tips, fit, and details..."></textarea>
                        </div>

                        <div class="form-row mb-3">
                            <div class="col-6">
                                <div class="custom-control custom-checkbox small">
                                    <input type="checkbox" name="is_featured" class="custom-control-input" id="checkFeat" checked>
                                    <label class="custom-control-label" for="checkFeat">Featured</label>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="custom-control custom-checkbox small">
                                    <input type="checkbox" name="is_popular" class="custom-control-input" id="checkPop" checked>
                                    <label class="custom-control-label" for="checkPop">Popular</label>
                                </div>
                            </div>
                        </div>

                        <button type="submit" name="add_product" class="btn btn-dark btn-block font-weight-bold py-2">
                            <i class="fa fa-save mr-1"></i> Save Product
                        </button>
                    </form>
                </div>
            </div>

            <!-- Right: Current Catalog Table -->
            <div class="col-12 col-lg-8">
                <div class="card border-0 shadow-sm rounded-lg overflow-hidden">
                    <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                        <h6 class="font-weight-bold mb-0 text-dark">
                            <i class="fa fa-tags mr-2 text-danger"></i> Catalog Inventory (<?= count($products) ?> items)
                        </h6>
                        <div>
                            <a href="admin.php" class="btn btn-sm btn-outline-dark">
                                <i class="fa fa-tachometer mr-1"></i> Analytics Dashboard
                            </a>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="thead-light small font-weight-bold">
                                <tr>
                                    <th>Style</th>
                                    <th>Brand / Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th class="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="small">
                                <?php foreach ($products as $p): ?>
                                    <tr>
                                        <td>
                                            <div class="d-flex align-items-center">
                                                <img src="<?= htmlspecialchars($p['image']) ?>" alt="" style="width: 42px; height: 50px; object-fit: cover; border-radius: 4px;" class="mr-3">
                                                <div>
                                                    <strong class="text-dark d-block"><?= htmlspecialchars($p['name']) ?></strong>
                                                    <span class="text-muted font-mono small">SKU: <?= htmlspecialchars($p['sku']) ?></span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span class="badge badge-light border"><?= htmlspecialchars($p['brand_name'] ?? 'Essence') ?></span>
                                            <small class="d-block text-muted mt-1"><?= htmlspecialchars($p['category_name'] ?? 'Clothing') ?></small>
                                        </td>
                                        <td>
                                            <strong class="text-dark">₹<?= number_format($p['price'], 2) ?></strong>
                                            <?php if (!empty($p['old_price'])): ?>
                                                <small class="text-muted text-decoration-line-through d-block">₹<?= number_format($p['old_price'], 2) ?></small>
                                            <?php endif; ?>
                                        </td>
                                        <td>
                                            <?php if ($p['stock_quantity'] > 5): ?>
                                                <span class="badge badge-success"><?= $p['stock_quantity'] ?> In Stock</span>
                                            <?php else: ?>
                                                <span class="badge badge-danger"><?= $p['stock_quantity'] ?> Low</span>
                                            <?php endif; ?>
                                        </td>
                                        <td class="text-right">
                                            <a href="product_edit.php?id=<?= $p['id'] ?>" class="btn btn-sm btn-outline-dark mr-1" title="Edit">
                                                <i class="fa fa-pencil"></i>
                                            </a>
                                            <?php if ($is_admin): ?>
                                                <a href="delete.php?id=<?= $p['id'] ?>" class="btn btn-sm btn-outline-danger" onclick="return confirm('Are you sure you want to delete this product?');" title="Delete (Admin Only)">
                                                    <i class="fa fa-trash"></i>
                                                </a>
                                            <?php else: ?>
                                                <button class="btn btn-sm btn-outline-secondary" disabled title="Only Administrators can delete products">
                                                    <i class="fa fa-lock"></i>
                                                </button>
                                            <?php endif; ?>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
