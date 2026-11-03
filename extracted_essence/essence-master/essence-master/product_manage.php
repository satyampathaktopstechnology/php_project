
<?php
include "db.php";

if(isset($_POST['submit'])){

    $brand_id = $_POST['brand_id'];
    $productname = $_POST['productname'];
    $price = $_POST['price'];
    $old_price = $_POST['old_price'];
   $description = mysqli_real_escape_string($conn, $_POST['description']);
    $material = $_POST['material'];
    $image = $_FILES['image']['name'];
    $temp = $_FILES['image']['tmp_name'];
    $stock_quantity = $_POST['stock_quantity'];

    $folder = "img/product-img/";

    if(!is_dir($folder)){
        mkdir($folder, 0777, true);
    }

    move_uploaded_file($temp, $folder.$image);

    $sql = "INSERT INTO products
    (brand_id, name, price, old_price, description, material, image, stock_quantity)
    VALUES
    ('$brand_id', '$productname', '$price', '$old_price', '$description', '$material', '$image', '$stock_quantity')";

    if(mysqli_query($conn, $sql)===true){

        $id = $conn->insert_id;
        $skucode = "DRS".str_pad($id, 3, "0", STR_PAD_LEFT);

        $update = "UPDATE products SET sku='$skucode' WHERE id='$id'";
        mysqli_query($conn, $update);

        header("location: product_manage.php");

    }
    else{
        echo "Error: ".mysqli_error($conn);
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Add Product</title>
    <link rel="stylesheet" href="css/bootstrap.min.css">
    <link rel="stylesheet" href="css/font-awesome.min.css">
    <link rel="stylesheet" href="css/core-style.css?v=20261102">
    <link rel="stylesheet" href="style.css?v=20261102">
    <link rel="stylesheet" href="css/essence-unified.css?v=20261102">
    <style>
        :root {
            --admin-ink: #242424;
            --admin-muted: #777777;
            --admin-accent: #ff3f6c;
            --admin-bg: #f4f5f7;
        }

        * { box-sizing: border-box; }

        body {
            min-height: 100vh;
            margin: 0;
            background: var(--admin-bg);
            color: var(--admin-ink);
            font-family: "Montserrat", Arial, sans-serif;
        }

        .product-form-page {
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding: 150px 20px;
        }

        .product-form-card {
            width: 100%;
            max-width: 760px;
            padding: 32px;
            border-radius: 8px;
            background: #ffffff;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
        }

        .product-form-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 26px;
            padding-bottom: 18px;
            border-bottom: 1px solid #eeeeee;
        }

        .product-form-header h1 {
            margin: 0;
            font-size: 24px;
            letter-spacing: -0.02em;
        }

        .back-link {
            color: var(--admin-muted);
            font-size: 13px;
            text-decoration: none;
        }

        .back-link:hover {
            color: var(--admin-accent);
            text-decoration: none;
        }

        .product-form-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px 20px;
        }

        .form-group-full { grid-column: 1 / -1; }

        .form-group label {
            display: block;
            margin-bottom: 7px;
            color: var(--admin-muted);
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .product-form-card input[type="text"],
        .product-form-card input[type="number"],
        .product-form-card textarea,
        .product-form-card input[type="file"] {
            width: 100%;
            min-height: 42px;
            padding: 10px 12px;
            border: 1px solid #dddddd;
            border-radius: 4px;
            background: #ffffff;
            font-size: 14px;
        }

        .product-form-card textarea {
            min-height: 110px;
            resize: vertical;
        }

        .product-form-card input:focus,
        .product-form-card textarea:focus {
            border-color: var(--admin-accent) !important;
            outline: 0;
            box-shadow: 0 0 0 3px rgba(255, 63, 108, 0.1) !important;
        }

        .product-form-card input[type="file"] {
            padding: 8px;
            line-height: 24px;
        }

        .product-form-actions {
            grid-column: 1 / -1;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 8px;
            padding-top: 20px;
            border-top: 1px solid #eeeeee;
        }

        .product-form-actions .btn {
            min-width: 130px;
            padding: 10px 18px;
            border-radius: 4px;
            font-size: 13px;
            font-weight: 600;
        }

        .btn-primary {
            border-color: var(--admin-accent);
            background: var(--admin-accent);
        }

        .btn-primary:hover,
        .btn-primary:focus {
            border-color: var(--admin-ink);
            background: var(--admin-ink);
        }

        @media (max-width: 600px) {
            .product-form-page { padding: 20px 12px; }
            .product-form-card { padding: 22px 16px; }
            .product-form-header { align-items: flex-start; flex-direction: column; }
            .product-form-grid { grid-template-columns: 1fr; }
            .form-group-full,
            .product-form-actions { grid-column: 1; }
            .product-form-actions { flex-direction: column-reverse; }
            .product-form-actions .btn { width: 100%; }
        }
    </style>
</head>
<body>
    <header class="header_area">
        <div class="classy-nav-container breakpoint-off d-flex align-items-center justify-content-between">
            <nav class="classy-navbar" id="essenceNav">
                <a class="nav-brand" href="index.php"><img src="img/core-img/logo.png" alt="Essence"></a>
                <div class="classy-navbar-toggler">
                    <span class="navbarToggler"><span></span><span></span><span></span></span>
                </div>
                <div class="classy-menu">
                    <div class="classycloseIcon">
                        <div class="cross-wrap"><span class="top"></span><span class="bottom"></span></div>
                    </div>
                    <div class="classynav">
                        <ul>
                            <li><a href="index.php">Home</a></li>
                            <li><a href="shop.php">Shop</a></li>
                            <li><a href="blog.php">Blog</a></li>
                            <li><a href="contact.php">Contact</a></li>
                        </ul>
                    </div>
                </div>
            </nav>

            <div class="header-meta d-flex clearfix justify-content-end">
                <div class="search-area">
                    <form action="shop.php" method="get">
                        <input type="search" name="search" placeholder="Type for search">
                        <button type="submit"><i class="fa fa-search" aria-hidden="true"></i></button>
                    </form>
                </div>
                <div class="favourite-area">
                    <a href="wishlist.php" aria-label="View wishlist"><img src="img/core-img/heart.svg" alt=""></a>
                </div>
                <div class="user-login-info">
                    <a href="admin.php" aria-label="Admin dashboard"><img src="img/core-img/user.svg" alt=""></a>
                </div>
                <div class="cart-area">
                    <a href="checkout.php"><img src="img/core-img/bag.svg" alt=""></a>
                </div>
            </div>
        </div>
    </header>

    <main class="product-form-page">
        <div class="product-form-card">
            <div class="product-form-header">
                <h1>Add New Product</h1>
                <a class="back-link" href="admin.php">&larr; Back to Dashboard</a>
            </div>

            <form method="POST" enctype="multipart/form-data" class="product-form-grid">
                <div class="form-group">
                    <label for="brand_id">Brand ID</label>
                    <input type="number" id="brand_id" name="brand_id" required>
                </div>

                <div class="form-group">
                    <label for="productname">Product Name</label>
                    <input type="text" id="productname" name="productname" required>
                </div>

                <div class="form-group">
                    <label for="price">Price</label>
                    <input type="number" id="price" name="price" step="0.01" min="0" required>
                </div>

                <div class="form-group">
                    <label for="old_price">Old Price</label>
                    <input type="number" id="old_price" name="old_price" step="0.01" min="0">
                </div>

                <div class="form-group form-group-full">
                    <label for="description">Description</label>
                    <textarea id="description" name="description"></textarea>
                </div>

                <div class="form-group">
                    <label for="material">Material</label>
                    <input type="text" id="material" name="material">
                </div>

                <div class="form-group">
                    <label for="stock_quantity">Stock Quantity</label>
                    <input type="number" id="stock_quantity" name="stock_quantity" min="0" required>
                </div>

                <div class="form-group form-group-full">
                    <label for="image">Product Image</label>
                    <input type="file" id="image" name="image" accept="image/*" required>
                </div>

                <div class="product-form-actions">
                    <a href="admin.php" class="btn btn-secondary">Cancel</a>
                    <button type="submit" name="submit" class="btn btn-primary">Add Product</button>
                </div>
            </form>
        </div>
    </main>

    <footer class="footer_area clearfix">
        <div class="container">
            <div class="row">
                <div class="col-12 col-md-6">
                    <div class="single_widget_area d-flex mb-30">
                        <div class="footer-logo mr-50">
                            <a href="index.php"><img src="img/core-img/logo2.png" alt="Essence"></a>
                        </div>
                        <div class="footer_menu">
                            <ul>
                                <li><a href="shop.php">Shop</a></li>
                                <li><a href="blog.php">Blog</a></li>
                                <li><a href="contact.php">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="col-12 col-md-6">
                    <div class="single_widget_area mb-30">
                        <ul class="footer_widget_menu">
                            <li><a href="shop.php">Shop</a></li>
                            <li><a href="checkout.php">Checkout</a></li>
                            <li><a href="wishlist.php">Wishlist</a></li>
                            <li><a href="contact.php">Contact</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="row align-items-end">
                <div class="col-12 col-md-6">
                    <div class="single_widget_area">
                        <div class="footer_heading mb-30"><h6>Subscribe</h6></div>
                        <div class="subscribtion_form">
                            <form action="#" method="post">
                                <input type="email" name="mail" class="mail" placeholder="Your email here">
                                <button type="submit" class="submit"><i class="fa fa-long-arrow-right" aria-hidden="true"></i></button>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="col-12 col-md-6">
                    <div class="single_widget_area">
                        <div class="footer_social_area">
                            <a href="#" title="Facebook"><i class="fa fa-facebook" aria-hidden="true"></i></a>
                            <a href="#" title="Instagram"><i class="fa fa-instagram" aria-hidden="true"></i></a>
                            <a href="#" title="Twitter"><i class="fa fa-twitter" aria-hidden="true"></i></a>
                            <a href="#" title="Pinterest"><i class="fa fa-pinterest" aria-hidden="true"></i></a>
                            <a href="#" title="Youtube"><i class="fa fa-youtube-play" aria-hidden="true"></i></a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row mt-5">
                <div class="col-md-12 text-center">
                    <p>Copyright &copy;<script>document.write(new Date().getFullYear());</script> All rights reserved.</p>
                </div>
            </div>
        </div>
    </footer>

    <script src="js/jquery/jquery-2.2.4.min.js"></script>
    <script src="js/popper.min.js"></script>
    <script src="js/bootstrap.min.js"></script>
    <script src="js/plugins.js"></script>
    <script src="js/classy-nav.min.js"></script>
    <script src="js/active.js?v=20261102"></script>
</body>
</html>
