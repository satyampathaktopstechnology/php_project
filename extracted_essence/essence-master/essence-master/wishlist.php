
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wishlist | Essence</title>

    <link rel="stylesheet" href="css/core-style.css">
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="css/essence-unified.css">
</head>
<body>

<!-- Header -->
<header class="header_area">
    <div class="classy-nav-container d-flex align-items-center justify-content-between">

        <nav class="classy-navbar" id="essenceNav">
            <a href="index.php">
                <img src="img/core-img/logo.png" alt="Essence">
            </a>

            <div class="classy-menu">
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

        <div class="header-meta d-flex">

            <div class="favourite-area">
                <a href="wishlist.php">
                    <img src="img/core-img/heart.svg" alt="Wishlist">
                    <span class="wishlist-count">0</span>
                </a>
            </div>

            <div class="cart-area">
                <a href="checkout.php">
                    <img src="img/core-img/bag.svg" alt="Cart">
                    <span>0</span>
                </a>
            </div>

        </div>
    </div>
</header>

<!-- Wishlist -->
<main class="wishlist-page">
    <div class="container">

        <div class="wishlist-page-heading">
            <div>
                <span>Your Collection</span>
                <h1>My Wishlist</h1>
            </div>

            <span id="wishlistPageCount" class="wishlist-page-count">0 items</span>
        </div>

        <div id="wishlistGrid" class="row wishlist-grid"></div>

    </div>
</main>

<!-- Footer -->
<footer class="footer_area">
    <div class="container text-center">
        <p>
            Copyright &copy; <script>document.write(new Date().getFullYear());</script>
            Essence. All rights reserved.
        </p>
    </div>
</footer>

<script src="js/jquery/jquery-2.2.4.min.js"></script>
<script src="js/bootstrap.min.js"></script>
<script src="js/plugins.js"></script>
<script src="js/classy-nav.min.js"></script>
<script src="js/active.js?v=20261103"></script>

<!-- Wishlist JavaScript -->
<script>
(function () {

    const storageKey = 'essence_favorites';
    const grid = document.getElementById('wishlistGrid');
    const count = document.getElementById('wishlistPageCount');

    function getWishlist() {
        try {
            return JSON.parse(localStorage.getItem(storageKey)) || {};
        } catch (error) {
            return {};
        }
    }

    function getCart() {
        try {
            return JSON.parse(localStorage.getItem('essence_cart')) || {};
        } catch (error) {
            return {};
        }
    }

    function updateCartCount() {
        const cart = getCart();

        let total = Object.values(cart).reduce(function (sum, item) {
            return sum + (Number(item.quantity) || 1);
        }, 0);

        document.querySelector('.cart-area a span').textContent = total;
    }

    function renderWishlist() {

        const wishlist = getWishlist();
        const products = Object.values(wishlist);

        count.textContent = products.length + ' items';

        document.querySelector('.wishlist-count').textContent = products.length;

        if (products.length === 0) {
            grid.innerHTML = `
                <div class="col-12">
                    <div class="wishlist-empty-page">
                        <h2>Your wishlist is empty</h2>
                        <p>Save products you love and they will appear here.</p>
                        <a href="shop.php" class="btn essence-btn">
                            Continue Shopping
                        </a>
                    </div>
                </div>
            `;
            return;
        }

        grid.innerHTML = products.map(function (product) {

            const detailLink = product.href ||
                'single-product-details.php?id=' + encodeURIComponent(product.id);

            return `
                <div class="col-12 col-md-6 col-lg-4 wishlist-grid-item">
                    <article class="wishlist-product-card">

                        <a class="wishlist-product-image" href="${detailLink}">
                            <img src="${product.image || 'img/product-img/product-1.jpg'}"
                                 alt="Product">
                        </a>

                        <div class="wishlist-product-details">

                            <span class="wishlist-product-brand">
                                ${product.brand || 'Essence'}
                            </span>

                            <h2>${product.title || 'Product'}</h2>

                            <p class="wishlist-product-price">
                                ${product.price || ''}
                            </p>

                            <button class="wishlist-add-cart"
                                    data-product-id="${product.id}">
                                Add to Cart
                            </button>

                            <button class="wishlist-remove"
                                    data-product-id="${product.id}">
                                Remove
                            </button>

                        </div>
                    </article>
                </div>
            `;

        }).join('');

        updateCartCount();
    }

    grid.addEventListener('click', function (event) {

        const productId = event.target.dataset.productId;

        if (!productId) return;

        const wishlist = getWishlist();

        if (event.target.classList.contains('wishlist-remove')) {

            delete wishlist[productId];

            localStorage.setItem(storageKey, JSON.stringify(wishlist));

            renderWishlist();
        }

        if (event.target.classList.contains('wishlist-add-cart')) {

            const product = wishlist[productId];
            const cart = getCart();

            if (!product) return;

            if (cart[productId]) {
                cart[productId].quantity++;
            } else {
                cart[productId] = {
                    ...product,
                    quantity: 1
                };
            }

            localStorage.setItem('essence_cart', JSON.stringify(cart));

            updateCartCount();

            event.target.textContent = 'Added';
        }

    });

    renderWishlist();

})();
</script>

</body>
</html>
