<?php
/**
 * Essence Fashion Store - Product Edit
 * Role Protected: Administrators and Editors
 * Protected with Prepared Statements and Parameterized Queries
 */
$page_title = "Edit Product";
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

require_role(['admin', 'editor']);

if (!isset($_GET['id'])) {
    header("Location: product_manage.php");
    exit;
}

$id = intval($_GET['id']);

// Fetch using parameterized Prepared Statement
$stmt = $conn->prepare("SELECT * FROM products WHERE id = ?");
$stmt->execute([$id]);
$product = $stmt->fetch();

if (!$product) {
    die("Product not found");
}

$brands = $conn->query("SELECT * FROM brands ORDER BY name ASC")->fetchAll();
$categories = $conn->query("SELECT * FROM categories ORDER BY name ASC")->fetchAll();

$success_msg = "";
$error_msg = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_product'])) {
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
    $imagePath = $product['image'];

    if (!empty($_POST['image_url'])) {
        $imagePath = trim($_POST['image_url']);
    }

    if (!empty($_FILES['image']['name'])) {
        $folder = __DIR__ . "/img/product-img/";
        if (!is_dir($folder)) {
            mkdir($folder, 0777, true);
        }
        $cleanFilename = preg_replace('/[^a-zA-Z0-9._-]/', '', $_FILES['image']['name']);
        if (move_uploaded_file($_FILES['image']['tmp_name'], $folder . $cleanFilename)) {
            $imagePath = 'img/product-img/' . $cleanFilename;
        }
    }

    if (empty($name) || $price <= 0) {
        $error_msg = "Product name and positive price are required.";
    } else {
        // Prepared Statement: prevents SQL injection
        $updateStmt = $conn->prepare("
            UPDATE products SET
                name = ?,
                brand_id = ?,
                category_id = ?,
                price = ?,
                old_price = ?,
                description = ?,
                material = ?,
                image = ?,
                stock_quantity = ?,
                is_featured = ?,
                is_popular = ?
            WHERE id = ?
        ");

        $updateStmt->execute([
            $name, $brand_id, $category_id, $price, $old_price, $description, $material,
            $imagePath, $stock_quantity, $is_featured, $is_popular, $id
        ]);

        $success_msg = "Product details updated successfully!";

        // Refresh product data
        $stmt->execute([$id]);
        $product = $stmt->fetch();
    }
}

require_once __DIR__ . '/header.php';
?>

<div class="breadcumb_area bg-img" style="background-image: url(img/bg-img/breadcumb.jpg); padding: 40px 0;">
    <div class="container h-100">
        <div class="row h-100 align-items-center">
            <div class="col-12 text-center">
                <h2 style="font-family:'Playfair Display', serif;" class="text-white">Edit: <?= htmlspecialchars($product['name']) ?></h2>
                <p class="text-white small mb-0">SKU: <?= htmlspecialchars($product['sku']) ?> &bull; Prepared Statements Protected</p>
            </div>
        </div>
    </div>
</div>

<div class="section-padding-80">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-12 col-md-8">
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

                <div class="card border-0 shadow-sm p-4 rounded-lg bg-white">
                    <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                        <h5 class="font-weight-bold mb-0" style="font-family:'Playfair Display', serif;">Edit Product Specifications</h5>
                        <a href="product_manage.php" class="btn btn-sm btn-outline-secondary">
                            <i class="fa fa-arrow-left mr-1"></i> Back to Products
                        </a>
                    </div>

                    <form method="POST" enctype="multipart/form-data">
                        <div class="form-group">
                            <label class="small font-weight-bold">Product Title *</label>
                            <input type="text" name="productname" class="form-control" required value="<?= htmlspecialchars($product['name']) ?>">
                        </div>

                        <div class="form-row">
                            <div class="col-md-6 form-group">
                                <label class="small font-weight-bold">Brand</label>
                                <select name="brand_id" class="form-control">
                                    <?php foreach ($brands as $b): ?>
                                        <option value="<?= $b['id'] ?>" <?= $product['brand_id'] == $b['id'] ? 'selected' : '' ?>>
                                            <?= htmlspecialchars($b['name']) ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            <div class="col-md-6 form-group">
                                <label class="small font-weight-bold">Category</label>
                                <select name="category_id" class="form-control">
                                    <?php foreach ($categories as $c): ?>
                                        <option value="<?= $c['id'] ?>" <?= $product['category_id'] == $c['id'] ? 'selected' : '' ?>>
                                            <?= htmlspecialchars($c['name']) ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="col-md-6 form-group">
                                <label class="small font-weight-bold">Regular Price (₹) *</label>
                                <input type="number" step="0.01" name="price" class="form-control" required value="<?= $product['price'] ?>">
                            </div>
                            <div class="col-md-6 form-group">
                                <label class="small font-weight-bold">Original / Strikethrough Price (₹)</label>
                                <input type="number" step="0.01" name="old_price" class="form-control" value="<?= $product['old_price'] ?? '' ?>">
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="col-md-6 form-group">
                                <label class="small font-weight-bold">Fabric / Material</label>
                                <input type="text" name="material" class="form-control" value="<?= htmlspecialchars($product['material'] ?? '') ?>">
                            </div>
                            <div class="col-md-6 form-group">
                                <label class="small font-weight-bold">Inventory Units</label>
                                <input type="number" name="stock_quantity" class="form-control" value="<?= $product['stock_quantity'] ?>">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="small font-weight-bold">Product Image</label>
                            <div class="d-flex align-items-center mb-2">
                                <img src="<?= htmlspecialchars($product['image']) ?>" alt="" style="width: 50px; height: 60px; object-fit: cover; border-radius: 4px;" class="mr-3 border">
                                <input type="text" name="image_url" class="form-control form-control-sm" value="<?= htmlspecialchars($product['image']) ?>" placeholder="Image path or URL">
                            </div>
                            <input type="file" name="image" class="form-control-file small">
                        </div>

                        <div class="form-group">
                            <label class="small font-weight-bold">Product Description</label>
                            <textarea name="description" rows="4" class="form-control"><?= htmlspecialchars($product['description'] ?? '') ?></textarea>
                        </div>

                        <div class="form-row mb-4">
                            <div class="col-6">
                                <div class="custom-control custom-checkbox">
                                    <input type="checkbox" name="is_featured" class="custom-control-input" id="editFeat" <?= $product['is_featured'] ? 'checked' : '' ?>>
                                    <label class="custom-control-label small" for="editFeat">Mark as Featured</label>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="custom-control custom-checkbox">
                                    <input type="checkbox" name="is_popular" class="custom-control-input" id="editPop" <?= $product['is_popular'] ? 'checked' : '' ?>>
                                    <label class="custom-control-label small" for="editPop">Show in Popular Carousel</label>
                                </div>
                            </div>
                        </div>

                        <button type="submit" name="update_product" class="btn btn-dark btn-block font-weight-bold py-2">
                            <i class="fa fa-save mr-1"></i> Update Product
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
