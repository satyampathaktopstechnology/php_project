    <!-- ##### Footer Area Start ##### -->
    <footer class="footer_area clearfix bg-dark text-white pt-5">
        <div class="container">
            <div class="row">
                <!-- Single Footer Area -->
                <div class="col-12 col-md-6 col-lg-3">
                    <div class="single_widget_area mb-4">
                        <!-- Footer Logo -->
                        <div class="footer-logo mb-3">
                            <a href="index.php"><img src="img/core-img/logo2.png" alt="Essence" style="height:32px;"></a>
                        </div>
                        <p class="text-muted small" style="line-height:1.8;">
                            Essence curates conscious luxury fashion with sustainable textiles, ethical atelier tailoring, and contemporary silhouettes.
                        </p>
                    </div>
                </div>

                <!-- Single Footer Area -->
                <div class="col-12 col-sm-6 col-md-3 col-lg-3">
                    <div class="single_widget_area mb-4">
                        <div class="widget-title mb-3">
                            <h6 class="text-white text-uppercase" style="letter-spacing:1px; font-size:13px;">Departments</h6>
                        </div>
                        <ul class="list-unstyled small" style="line-height:2.2;">
                            <li><a href="shop.php" class="text-muted">All Collections</a></li>
                            <li><a href="shop.php?cat=dresses" class="text-muted">Evening &amp; Day Dresses</a></li>
                            <li><a href="shop.php?cat=shoes" class="text-muted">Footwear &amp; Heels</a></li>
                            <li><a href="shop.php?cat=accessories" class="text-muted">Bags &amp; Accessories</a></li>
                        </ul>
                    </div>
                </div>

                <!-- Single Footer Area -->
                <div class="col-12 col-sm-6 col-md-3 col-lg-3">
                    <div class="single_widget_area mb-4">
                        <div class="widget-title mb-3">
                            <h6 class="text-white text-uppercase" style="letter-spacing:1px; font-size:13px;">Customer Care</h6>
                        </div>
                        <ul class="list-unstyled small" style="line-height:2.2;">
                            <li><a href="contact.php" class="text-muted">Store Locations &amp; FAQ</a></li>
                            <li><a href="checkout.php" class="text-muted">Order Checkout</a></li>
                            <li><a href="wishlist.php" class="text-muted">Saved Wishlist</a></li>
                            <li><span class="text-muted">Free Express Delivery Across India</span></li>
                        </ul>
                    </div>
                </div>

                <!-- Single Footer Area -->
                <div class="col-12 col-md-6 col-lg-3">
                    <div class="single_widget_area mb-4">
                        <div class="widget-title mb-3">
                            <h6 class="text-white text-uppercase" style="letter-spacing:1px; font-size:13px;">Management &amp; Security</h6>
                        </div>
                        <ul class="list-unstyled small" style="line-height:2.2;">
                            <li><a href="admin.php" class="text-danger font-weight-bold">Analytics &amp; Admin Dashboard</a></li>
                            <li><a href="product_manage.php" class="text-muted">Catalog &amp; Product Management</a></li>
                            <li><a href="order_manage.php" class="text-muted">Order Tracking &amp; Status</a></li>
                            <li><span class="text-muted">SQL Prepared Statements Protected</span></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="row mt-4 pt-4 border-top border-secondary">
                <div class="col-12 text-center text-muted small pb-4">
                    <p class="mb-0">&copy; <?= date('Y') ?> Essence Fashion Store. Powered by PHP, PDO Prepared Statements &amp; jQuery.</p>
                </div>
            </div>
        </div>
    </footer>
    <!-- ##### Footer Area End ##### -->

    <!-- ##### jQuery & Bootstrap Plugins ##### -->
    <script src="js/jquery/jquery-2.2.4.min.js"></script>
    <script src="js/popper.min.js"></script>
    <script src="js/bootstrap.min.js"></script>
    <script src="js/plugins.js"></script>
    <script src="js/classy-nav.min.js"></script>

    <!-- Global jQuery Cart & Drawer Manager -->
    <script>
    $(document).ready(function() {
        // Cart Helper functions
        function getCart() {
            try {
                return JSON.parse(localStorage.getItem('essence_cart') || '[]');
            } catch (e) {
                return [];
            }
        }

        function saveCart(cart) {
            localStorage.setItem('essence_cart', JSON.stringify(cart));
            renderCart();
        }

        function renderCart() {
            var cart = getCart();
            var totalCount = 0;
            var subtotal = 0;
            var container = $('#cartItemsContainer');
            
            if (cart.length === 0) {
                container.html('<div class="text-center py-5 text-muted small"><i class="fa fa-shopping-bag fa-2x mb-2 d-block text-secondary"></i>Your bag is empty.</div>');
                $('.cart-counter').text('0');
                $('#cartSubtotal').text('₹0.00');
                $('#cartTotal').text('₹0.00');
                return;
            }

            var html = '';
            $.each(cart, function(index, item) {
                var qty = parseInt(item.quantity) || 1;
                var price = parseFloat(item.price) || 0;
                var lineTotal = price * qty;
                totalCount += qty;
                subtotal += lineTotal;

                html += '<div class="d-flex align-items-center mb-3 pb-3 border-bottom position-relative">' +
                    '<img src="' + (item.image || 'img/product-img/product-1.jpg') + '" style="width:55px; height:65px; object-fit:cover; border-radius:6px;" class="mr-3">' +
                    '<div class="flex-grow-1 pr-2">' +
                        '<h6 class="mb-1 small font-weight-bold text-dark text-truncate" style="max-width:180px;">' + (item.name || 'Product') + '</h6>' +
                        '<div class="small text-muted mb-1">₹' + price.toLocaleString('en-IN') + ' &times; ' + qty + '</div>' +
                        '<div class="btn-group btn-group-sm" role="group">' +
                            '<button type="button" class="btn btn-outline-secondary py-0 px-2 btn-cart-dec" data-index="' + index + '">-</button>' +
                            '<span class="btn btn-light py-0 px-2 font-weight-bold disabled">' + qty + '</span>' +
                            '<button type="button" class="btn btn-outline-secondary py-0 px-2 btn-cart-inc" data-index="' + index + '">+</button>' +
                        '</div>' +
                    '</div>' +
                    '<div class="text-right">' +
                        '<div class="font-weight-bold text-dark small">₹' + lineTotal.toLocaleString('en-IN') + '</div>' +
                        '<button type="button" class="btn btn-link text-danger p-0 mt-2 btn-cart-del" data-index="' + index + '" style="font-size:11px;">Remove</button>' +
                    '</div>' +
                '</div>';
            });

            container.html(html);
            $('.cart-counter').text(totalCount);
            $('#cartSubtotal').text('₹' + subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2}));
            $('#cartTotal').text('₹' + subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2}));
        }

        // Cart Drawer Toggles
        $('#essenceCartBtn').on('click', function(e) {
            e.preventDefault();
            $('#essenceCartDrawer').addClass('open');
            $('#cartOverlay').addClass('open');
            renderCart();
        });

        $('#closeCartBtn, #cartOverlay').on('click', function() {
            $('#essenceCartDrawer').removeClass('open');
            $('#cartOverlay').removeClass('open');
        });

        // Cart Item Controls
        $(document).on('click', '.btn-cart-inc', function() {
            var idx = $(this).data('index');
            var cart = getCart();
            if (cart[idx]) {
                cart[idx].quantity = (parseInt(cart[idx].quantity) || 1) + 1;
                saveCart(cart);
            }
        });

        $(document).on('click', '.btn-cart-dec', function() {
            var idx = $(this).data('index');
            var cart = getCart();
            if (cart[idx]) {
                var current = (parseInt(cart[idx].quantity) || 1);
                if (current <= 1) {
                    cart.splice(idx, 1);
                } else {
                    cart[idx].quantity = current - 1;
                }
                saveCart(cart);
            }
        });

        $(document).on('click', '.btn-cart-del', function() {
            var idx = $(this).data('index');
            var cart = getCart();
            cart.splice(idx, 1);
            saveCart(cart);
        });

        // Add to Cart Buttons
        $(document).on('click', '.add-to-cart-btn', function(e) {
            e.preventDefault();
            var btn = $(this);
            var id = btn.data('id');
            var name = btn.data('name');
            var price = btn.data('price');
            var image = btn.data('image');
            var qty = parseInt($('#productQuantity').val()) || 1;

            var cart = getCart();
            var found = false;
            $.each(cart, function(i, item) {
                if (item.id == id) {
                    item.quantity = (parseInt(item.quantity) || 1) + qty;
                    found = true;
                    return false;
                }
            });

            if (!found) {
                cart.push({
                    id: id,
                    name: name,
                    price: price,
                    image: image,
                    quantity: qty
                });
            }

            saveCart(cart);

            // Open drawer
            $('#essenceCartDrawer').addClass('open');
            $('#cartOverlay').addClass('open');
        });

        // Initial render
        renderCart();
    });
    </script>
</body>
</html>
