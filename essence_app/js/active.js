(function ($) {
    'use strict';

    var favoritesKey = 'essence_favorites';

    function getFavorites() {
        try {
            var stored = JSON.parse(localStorage.getItem(favoritesKey) || '{}');

            if (Array.isArray(stored)) {
                var favorites = {};
                stored.forEach(function (product) {
                    if (product && product.id) {
                        favorites[product.id] = product;
                    }
                });
                return favorites;
            }

            return stored && typeof stored === 'object' ? stored : {};
        } catch (error) {
            return {};
        }
    }

    function saveFavorites(favorites) {
        localStorage.setItem(favoritesKey, JSON.stringify(favorites));
    }

    function getCart() {
        try {
            var cart = JSON.parse(localStorage.getItem('essence_cart') || '{}');
            return cart && typeof cart === 'object' && !Array.isArray(cart) ? cart : {};
        } catch (error) {
            return {};
        }
    }

    function saveCart(cart) {
        localStorage.setItem('essence_cart', JSON.stringify(cart));
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function money(value) {
        return '₹.' + (Number(value) || 0).toFixed(2);
    }

    function getCatalogProduct(id, item) {
        var catalog = Array.isArray(window.ESSENCE_CATALOG) ? window.ESSENCE_CATALOG : [];
        var match = catalog.find(function (product) {
            return String(product.id) === String(id);
        });

        if (match) return match;
        return {
            id: String(id),
            name: item.title || item.name || 'Product',
            brand: item.brand || '',
            image: item.image || 'img/product-img/product-1.jpg',
            price: Number(item.price) || 0
        };
    }

    function renderCheckoutCart() {
        var cartList = $('#dynamicCartList');
        var orderSummary = $('#dynamicOrderSummary');
        if (!cartList.length && !orderSummary.length) return;

        var cart = getCart();
        var ids = Object.keys(cart);
        var quantity = 0;
        var subtotal = 0;
        var sideItems = '';
        var orderItems = '';

        ids.forEach(function (id) {
            var item = cart[id] || {};
            var quantityForItem = Math.max(1, Number(item.quantity) || 1);
            var product = getCatalogProduct(id, item);
            var lineTotal = Number(product.price) * quantityForItem;

            quantity += quantityForItem;
            subtotal += lineTotal;
            sideItems +=
                '<div class="single-cart-item checkout-cart-item" data-cart-id="' + escapeHtml(id) + '">' +
                    '<a href="' + escapeHtml(product.id ? 'single-product-details.php?id=' + product.id : item.href || '#') + '" class="product-image">' +
                        '<img src="' + escapeHtml(product.image) + '" class="cart-thumb" alt="' + escapeHtml(product.name) + '">' +
                        '<div class="cart-item-desc">' +
                            (product.brand ? '<span class="badge">' + escapeHtml(product.brand) + '</span>' : '') +
                            '<h6>' + escapeHtml(product.name) + '</h6>' +
                            '<p class="price">' + money(lineTotal) + '</p>' +
                        '</div>' +
                    '</a>' +
                    '<div class="checkout-cart-controls">' +
                        '<button type="button" class="checkout-cart-decrease" aria-label="Decrease quantity">−</button>' +
                        '<span>' + quantityForItem + '</span>' +
                        '<button type="button" class="checkout-cart-increase" aria-label="Increase quantity">+</button>' +
                        '<button type="button" class="checkout-cart-remove" aria-label="Remove ' + escapeHtml(product.name) + '">Remove</button>' +
                    '</div>' +
                '</div>';

            orderItems += '<li><span>' + escapeHtml(product.name) + ' × ' + quantityForItem + '</span><span>' + money(lineTotal) + '</span></li>';
        });

        if (!ids.length) {
            sideItems = '<p class="checkout-cart-empty">Your cart is empty.</p>';
        }

        cartList.html(sideItems);
        $('#sideCartSubtotal, .order-subtotal').text(money(subtotal));
        $('#sideCartTotal, .order-total').text(money(subtotal));

        if (orderSummary.length) {
            orderSummary.find('.dynamic-order-product, .dynamic-order-empty').remove();
            if (!ids.length) {
                orderSummary.find('.dynamic-order-empty').remove();
                orderSummary.find('li').first().after('<li class="dynamic-order-empty"><span>Your cart is empty</span><span>₹.0.00</span></li>');
            } else {
                orderSummary.find('li').first().after(
                    orderItems.replace(/<li>/g, '<li class="dynamic-order-product">')
                );
            }
        }
    }

    function renderShopCart() {
        var cartList = $('#shopCartList');
        if (!cartList.length) return;

        var cart = getCart();
        var ids = Object.keys(cart);
        var quantity = 0;
        var subtotal = 0;
        var html = '';

        ids.forEach(function (id) {
            var item = cart[id] || {};
            var quantityForItem = Math.max(1, Number(item.quantity) || 1);
            var product = getCatalogProduct(id, item);
            var price = Number(product.price) || Number(item.price) || 0;
            quantity += quantityForItem;
            subtotal += price * quantityForItem;

            html +=
                '<div class="shop-cart-item" data-cart-id="' + escapeHtml(id) + '">' +
                    '<a href="' + escapeHtml(product.id ? 'single-product-details.php?id=' + product.id : item.href || '#') + '">' +
                        '<img src="' + escapeHtml(product.image) + '" alt="' + escapeHtml(product.name) + '">' +
                    '</a>' +
                    '<div>' +
                        '<h6>' + escapeHtml(product.name) + '</h6>' +
                        '<p class="price">' + money(price * quantityForItem) + '</p>' +
                    '</div>' +
                    '<button type="button" class="shop-cart-remove" aria-label="Remove ' + escapeHtml(product.name) + '">&times;</button>' +
                '</div>';
        });

        if (!ids.length) {
            html = '<p class="shop-cart-empty">Your cart is empty.</p>';
        }

        cartList.html(html);
        $('#sideCartCount').text(quantity);
        $('#shopCartSubtotal, #shopCartTotal').text(money(subtotal));
    }

    function productDetails(button) {
        var card = $(button).closest('.single-product-wrapper, .single_product_desc, .single-product-content, .single_product_details_area');
        var title = card.find('h6, h2').first().text().trim() || 'Saved product';
        var image = card.find('.product-img img, img.product-photo').first().attr('src') ||
            card.find('img').first().attr('src') ||
            'img/product-img/product-1.jpg';
        var detailLink = card.find('a[href*="single-product-details.php"]').first().attr('href');
        var currentDetailUrl = window.location.pathname.split('/').pop() + window.location.search;
        var href = detailLink ||
            card.find('a[href]:not([href="#"])').first().attr('href') ||
            (window.location.pathname.indexOf('single-product-details.php') !== -1 ? currentDetailUrl : 'shop.php');
        var brand = card.find('.product-description > span, .single_product_desc > span').first().text().trim();
        var price = card.find('.product-price').first().text().trim().replace(/\s+/g, ' ');
        var id = card.attr('data-product-id');

        if (!id) {
            id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        }

        return {
            id: String(id || title),
            title: title,
            image: image,
            href: href,
            brand: brand,
            price: price
        };
    }

    function renderWishlist(animateCount) {
        var favorites = getFavorites();
        var count = Object.keys(favorites).length;
        var favoriteArea = $('.favourite-area');
        var countBadge = favoriteArea.find('.wishlist-count');
        var cart = {};

        try {
            cart = JSON.parse(localStorage.getItem('essence_cart') || '{}');
            if (!cart || typeof cart !== 'object' || Array.isArray(cart)) {
                cart = {};
            }
        } catch (error) {
            cart = {};
        }

        var cartQuantity = Object.keys(cart).reduce(function (total, id) {
            var item = cart[id];
            return total + (item && (Number(item.quantity) || 1));
        }, 0);
        var cartBadge = $('.cart-area a .cart-count, .cart-area a span');
        cartBadge.text(cartQuantity).toggle(cartQuantity > 0);
        $('.cart-area a').attr(
            'aria-label',
            cartQuantity === 1 ? 'View shopping cart, 1 item' : 'View shopping cart, ' + cartQuantity + ' items'
        );

        countBadge.text(count).toggle(count > 0);
        if (animateCount) {
            countBadge.removeClass('count-bump');
            void countBadge[0].offsetWidth;
            countBadge.addClass('count-bump');
            window.setTimeout(function () {
                countBadge.removeClass('count-bump');
            }, 380);
        }
    }

    if ($.fn.classyNav) {
        $('#essenceNav').classyNav();
    }

    // Mark the matching top-level page and dropdown link as active.
    var currentPage = window.location.pathname.split('/').pop().toLowerCase() || 'index.php';
    $('.classynav a').removeClass('active');
    $('.classynav a').each(function () {
        var linkPage = $(this).attr('href');
        if (!linkPage || linkPage === '#') {
            return;
        }

        linkPage = linkPage.split(/[?#]/)[0].split('/').pop().toLowerCase();
        if (linkPage === currentPage) {
            $(this).addClass('active');
            $(this).closest('li').addClass('cn-dropdown-item active');
        }
    });

    if ($.fn.owlCarousel) {
        $('.popular-products-slides').owlCarousel({
            items: 4,
            margin: 30,
            loop: true,
            nav: false,
            dots: false,
            autoplay: true,
            autoplayTimeout: 5000,
            smartSpeed: 1000,
            responsive: {
                0: { items: 1 },
                576: { items: 2 },
                768: { items: 3 },
                992: { items: 4 }
            }
        });

        $('.product_thumbnail_slides').owlCarousel({
            items: 1,
            margin: 0,
            loop: true,
            nav: true,
            navText: [
                "<img src='img/core-img/long-arrow-left.svg' alt=''>",
                "<img src='img/core-img/long-arrow-right.svg' alt=''>"
            ],
            dots: false,
            autoplay: true,
            autoplayTimeout: 5000,
            smartSpeed: 1000
        });
    }

    var favButtons = $('.favme');
    var favorites = getFavorites();

    favButtons.each(function () {
        var product = productDetails(this);
        $(this).toggleClass('active', Object.prototype.hasOwnProperty.call(favorites, product.id));
    });

    favButtons.on('click', function (event) {
        event.preventDefault();

        var button = $(this);
        var product = productDetails(button[0]);
        var currentFavorites = getFavorites();

        if (Object.prototype.hasOwnProperty.call(currentFavorites, product.id)) {
            delete currentFavorites[product.id];
        } else {
            currentFavorites[product.id] = product;
        }

        saveFavorites(currentFavorites);
        button.toggleClass('active');
        button.addClass('is_animating');
        window.setTimeout(function () {
            button.removeClass('is_animating');
        }, 350);
        renderWishlist(true);
    });

    renderWishlist();
    renderCheckoutCart();
    renderShopCart();

    window.addEventListener('storage', function (event) {
        if (event.key === 'essence_cart' || event.key === 'essence_favorites') {
            renderWishlist(false);
            renderCheckoutCart();
            renderShopCart();
        }
    });

    $('[data-cart-product]').on('click', function (event) {
        event.preventDefault();
        var button = $(this);
        var product = productDetails(button[0]);
        product.id = String(button.attr('data-cart-product') || product.id);
        product.title = button.attr('data-cart-name') || product.title;
        product.image = button.attr('data-cart-image') || product.image;
        product.href = button.attr('data-cart-href') || product.href;
        var cart = getCart();
        var numericPrice = Number(button.attr('data-cart-price')) || 0;

        if (cart[product.id]) {
            cart[product.id].quantity = (Number(cart[product.id].quantity) || 1) + 1;
        } else {
            cart[product.id] = {
                id: product.id,
                title: product.title,
                name: product.title,
                image: product.image,
                href: product.href,
                brand: product.brand,
                price: numericPrice,
                quantity: 1
            };
        }

        saveCart(cart);
        renderWishlist(false);
        renderShopCart();
        button.addClass('added').text('Added to Cart');
        window.setTimeout(function () {
            button.removeClass('added').text('Add to Cart');
        }, 1400);
    });

    $(document).on('click', '.shop-cart-remove', function (event) {
        event.preventDefault();
        var id = String($(this).closest('.shop-cart-item').attr('data-cart-id') || '');
        var cart = getCart();
        if (!id || !cart[id]) return;
        delete cart[id];
        saveCart(cart);
        renderWishlist(false);
        renderShopCart();
    });

    $('.detail-add-cart').on('click', function () {
        var button = $(this);
        var product = productDetails(this);
        var cart = {};

        try {
            cart = JSON.parse(localStorage.getItem('essence_cart') || '{}');
            if (!cart || typeof cart !== 'object' || Array.isArray(cart)) cart = {};
        } catch (error) {
            cart = {};
        }

        if (cart[product.id]) {
            cart[product.id].quantity = (Number(cart[product.id].quantity) || 1) + 1;
        } else {
            cart[product.id] = {
                id: product.id,
                title: product.title,
                image: product.image,
                href: product.href,
                quantity: 1
            };
        }

        localStorage.setItem('essence_cart', JSON.stringify(cart));
        renderWishlist(false);
        var cartBadge = $('.cart-area a .cart-count, .cart-area a span');
        cartBadge.removeClass('count-bump');
        void cartBadge[0].offsetWidth;
        cartBadge.addClass('count-bump');
        window.setTimeout(function () {
            cartBadge.removeClass('count-bump');
        }, 380);
        button.addClass('added').text('Added to Cart');
        window.setTimeout(function () {
            button.removeClass('added').text('Add to cart');
        }, 1400);
    });

    $(document).on('click', '.checkout-cart-increase, .checkout-cart-decrease, .checkout-cart-remove', function (event) {
        event.preventDefault();
        var control = $(this);
        var item = control.closest('.checkout-cart-item');
        var id = String(item.attr('data-cart-id') || '');
        var cart = getCart();
        if (!id || !cart[id]) return;

        var currentQuantity = Math.max(1, Number(cart[id].quantity) || 1);
        if (control.hasClass('checkout-cart-increase')) {
            cart[id].quantity = currentQuantity + 1;
        } else if (control.hasClass('checkout-cart-decrease')) {
            if (currentQuantity <= 1) {
                delete cart[id];
            } else {
                cart[id].quantity = currentQuantity - 1;
            }
        } else {
            delete cart[id];
        }

        saveCart(cart);
        renderWishlist(false);
        renderCheckoutCart();
    });

    var cartOverlay = $('.cart-bg-overlay');
    var cartWrapper = $('.right-side-cart-area');

    $('#essenceCartBtn, #rightSideCart').on('click', function (event) {
        if (cartWrapper.length === 0) {
            return;
        }
        event.preventDefault();
        cartOverlay.toggleClass('cart-bg-overlay-on');
        cartWrapper.toggleClass('cart-on');
    });

    cartOverlay.on('click', function () {
        $(this).removeClass('cart-bg-overlay-on');
        cartWrapper.removeClass('cart-on');
    });

    $(window).on('scroll', function () {
        $('.header_area').toggleClass('sticky', $(window).scrollTop() > 0);
    });

    if ($.fn.niceSelect) {
        $('select').niceSelect();
    }

    if ($.fn.slider) {
        $('.slider-range-price').each(function () {
            var slider = $(this);
            slider.slider({
                range: true,
                min: slider.data('min'),
                max: slider.data('max'),
                values: [slider.data('value-min'), slider.data('value-max')],
                slide: function (event, ui) {
                    var unit = slider.data('unit');
                    var label = slider.data('label-result');
                    slider.closest('.slider-range').find('.range-price')
                        .html(label + ' ' + unit + ui.values[0] + ' - ' + unit + ui.values[1]);
                }
            });
        });
    }

    if ($.fn.scrollUp) {
        $.scrollUp({
            scrollSpeed: 1000,
            easingType: 'easeInOutQuart',
            scrollText: '<i class="fa fa-angle-up" aria-hidden="true"></i>'
        });
    }

    if ($.fn.tooltip) {
        $('[data-toggle="tooltip"]').tooltip();
    }

    $("a[href='#']").on('click', function (event) {
        event.preventDefault();
    });

})(jQuery);