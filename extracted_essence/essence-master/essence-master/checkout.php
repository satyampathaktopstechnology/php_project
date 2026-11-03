
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Checkout Page</title>

    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            color: #333;
        }

        header {
            background: white;
            padding: 20px 8%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #ddd;
        }

        header h2 {
            margin: 0;
            color: #333;
        }

        nav a {
            text-decoration: none;
            color: #333;
            margin-left: 20px;
        }

        .container {
            max-width: 1100px;
            margin: 40px auto;
           
        }

        h1 {
            text-align: center;
            margin-bottom: 30px;
        }

        .checkout {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
        }

        .box {
            background: white;
            padding: 25px;
            border-radius: 6px;
            border: 1px solid #ddd;
        }

        h3 {
            margin-top: 0;
            margin-bottom: 20px;
        }

        label {
            display: block;
            margin: 12px 0 6px;
        }

        input {
            width: 100%;
            padding: 12px;
            border: 1px solid #ccc;
            border-radius: 4px;
            padding:12px;
        }

        .order-row {
            display: flex;
            justify-content: space-between;
            padding: 21px 0;
            border-bottom: 1px solid #eee;
            
        }

        .payment {
            margin: 15px 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .payment label {
            display: inline;
            margin: 0;
            line-height: 20px;
            cursor: pointer;
        }

        .payment input[type="radio"] {
            width: 16px;
            height: 16px;
            margin: 0;
            padding: 0;
            flex: 0 0 16px;
            accent-color: #f05a66;
        }

        .place-order {
            width: 100%;
            padding: 14px;
            background: #f05a66;
            color: white;
            border: none;
            cursor: pointer;
            margin-top: 20px;
            border-radius: 4px;
            font-size: 16px;
        }

        .print-btn {
            padding: 12px 20px;
            background: #333;
            color: white;
            border: none;
            cursor: pointer;
            margin-bottom: 20px;
        }

        .checkout-product-empty {
            padding: 16px 0;
            color: #777;
            text-align: center;
        }

        .checkout-product-row {
            gap: 10px;
        }

        .checkout-product-row .checkout-product-name {
            flex: 1;
        }

        .checkout-controls {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .checkout-controls button {
            width: 28px;
            height: 28px;
            padding: 0;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: #fff;
            color: #333;
            cursor: pointer;
        }

        .checkout-controls .remove-item {
            width: auto;
            padding: 0 8px;
            border: 0;
            color: #f05a66;
        }

        .order-message {
            display: none;
            margin-top: 15px;
            padding: 12px;
            border-radius: 4px;
            background: #e8f6ed;
            color: #247a43;
            text-align: center;
        }

        .place-order:disabled {
            background: #aaa;
            cursor: not-allowed;
        }

        footer {
            background: #222;
            color: white;
            text-align: center;
            padding: 25px;
            margin-top: 40px;
        }

        @media(max-width: 700px) {
            .checkout {
                grid-template-columns: 1fr;
            }

            header {
                flex-direction: column;
                gap: 15px;
            }
        }

        @media print {
            body {
                background: white;
            }

            .print-btn {
                display: none;
            }

            .container {
                margin: 10px auto;
            }

            footer {
                background: white;
                color: black;
                border-top: 1px solid #ddd;
            }

            .place-order {
                background: #f05a66 !important;
                color: white !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
    </style>
</head>

<body>

<!-- Header and Navigation -->
<header>
    <h2>ESSENCE</h2>

    <nav>
        <a href="index.php">Home</a>
        <a href="shop.php">Shop</a>
        <a href="wishlist.php">Wishlist</a>
        <a href="checkout.php">Checkout</a>
    </nav>
</header>

<div class="container">

    <h1>Checkout</h1>

    <div class="checkout">

        <!-- Billing Address -->
        <div class="box">

            <h3>Billing Address</h3>

            <form id="billingForm">
                <label>First Name</label>
                <input type="text" name="first_name" placeholder="First Name" required>

                <label>Last Name</label>
                <input type="text" name="last_name" placeholder="Last Name" required>

                <label>Email Address</label>
                <input type="email" name="email" placeholder="Email" required>

                <label>Phone Number</label>
                <input type="tel" name="phone" placeholder="Phone Number" required>

                <label>Address</label>
                <input type="text" name="address" placeholder="Street Address" required>

                <label>City</label>
                <input type="text" name="city" placeholder="City" required>

                <label>State</label>
                <input type="text" name="state" placeholder="State" required>

                <label>Postcode</label>
                <input type="text" name="postcode" placeholder="Postcode" required>
            </form>

        </div>

        <!-- Order Details -->
        <div class="box">

            <h3>Your Order</h3>

            <div class="order-row">
                <span>Product</span>
                <span>Total</span>
            </div>
            <div id="checkoutProductList"></div>

            <div class="order-row">
                <strong>Subtotal</strong>
                <strong id="checkoutSubtotal">₹0.00</strong>
            </div>

            <div class="order-row">
                <span>Shipping</span>
                <span>Free</span>
            </div>

            <div class="order-row">
                <strong>Total</strong>
                <strong id="checkoutTotal">₹0.00</strong>
            </div>

            <!-- Payment Methods -->
            <h3 style="margin-top:25px;">Payment Methods</h3>

            <div class="payment">
                <input type="radio" name="payment" id="cod" checked>
                <label for="cod">Cash on Delivery</label>
            </div>

            <div class="payment">
                <input type="radio" name="payment" id="paypal">
                <label for="paypal">PayPal</label>
            </div>

            <div class="payment">
                <input type="radio" name="payment" id="card">
                <label for="card">Credit / Debit Card</label>
            </div>

            <button type="button" class="place-order">
                Place Order
            </button>
            <div id="orderMessage" class="order-message" role="status"></div>

        </div>

    </div>
</div>

<!-- Footer -->
<footer>
    <h3>ESSENCE</h3>
    <p>Fashion Ecommerce Website</p>
    <p>Copyright © 2026 All Rights Reserved.</p>
</footer>

<script>
    function getCheckoutCart() {
        try {
            var cart = JSON.parse(localStorage.getItem('essence_cart') || '{}');
            return cart && typeof cart === 'object' && !Array.isArray(cart) ? cart : {};
        } catch (error) {
            return {};
        }
    }

    function saveCheckoutCart(cart) {
        localStorage.setItem('essence_cart', JSON.stringify(cart));
        renderCheckout();
    }

    function formatPrice(value) {
        return '₹' + (Number(value) || 0).toFixed(2);
    }

    function escapeCheckoutHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function renderCheckout() {
        var cart = getCheckoutCart();
        var productList = document.getElementById('checkoutProductList');
        var subtotalElement = document.getElementById('checkoutSubtotal');
        var totalElement = document.getElementById('checkoutTotal');
        var placeOrderButton = document.querySelector('.place-order');
        var ids = Object.keys(cart);
        var subtotal = 0;
        var html = '';

        ids.forEach(function (id) {
            var item = cart[id] || {};
            var quantity = Math.max(1, Number(item.quantity) || 1);
            var price = Number(item.price) || 0;
            var name = item.name || item.title || 'Product';
            var lineTotal = price * quantity;
            subtotal += lineTotal;

            html +=
                '<div class="order-row checkout-product-row" data-cart-id="' + escapeCheckoutHtml(id) + '">' +
                    '<span class="checkout-product-name">' + escapeCheckoutHtml(name) + ' × ' + quantity + '</span>' +
                    '<span>' + formatPrice(lineTotal) + '</span>' +
                    '<div class="checkout-controls">' +
                        '<button type="button" class="decrease-item" aria-label="Decrease quantity">−</button>' +
                        '<button type="button" class="increase-item" aria-label="Increase quantity">+</button>' +
                        '<button type="button" class="remove-item" aria-label="Remove item">Remove</button>' +
                    '</div>' +
                '</div>';
        });

        if (!ids.length) {
            html = '<div class="checkout-product-empty">Your cart is empty.</div>';
        }

        productList.innerHTML = html;
        subtotalElement.textContent = formatPrice(subtotal);
        totalElement.textContent = formatPrice(subtotal);
        placeOrderButton.disabled = ids.length === 0;
    }

    document.getElementById('checkoutProductList').addEventListener('click', function (event) {
        var button = event.target.closest('button');
        if (!button) return;

        var row = button.closest('.checkout-product-row');
        var id = row.getAttribute('data-cart-id');
        var cart = getCheckoutCart();
        if (!id || !cart[id]) return;

        var quantity = Math.max(1, Number(cart[id].quantity) || 1);

        if (button.classList.contains('increase-item')) {
            cart[id].quantity = quantity + 1;
        } else if (button.classList.contains('decrease-item')) {
            if (quantity <= 1) {
                delete cart[id];
            } else {
                cart[id].quantity = quantity - 1;
            }
        } else {
            delete cart[id];
        }

        saveCheckoutCart(cart);
    });

    document.querySelector('.place-order').addEventListener('click', function () {
        var billingForm = document.getElementById('billingForm');
        var cart = getCheckoutCart();

        if (!Object.keys(cart).length) {
            alert('Your cart is empty.');
            return;
        }

        if (!billingForm.checkValidity()) {
            billingForm.reportValidity();
            return;
        }

        var message = document.getElementById('orderMessage');
        message.textContent = 'Order placed successfully!';
        message.style.display = 'block';
        localStorage.removeItem('essence_cart');
        renderCheckout();
        billingForm.reset();
    });

    window.addEventListener('storage', function (event) {
        if (event.key === 'essence_cart') renderCheckout();
    });

    renderCheckout();
</script>

</body>
</html>
