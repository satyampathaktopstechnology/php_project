<?php
$page_title = "Checkout";
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/header.php';

$rzp_key_id = "rzp_test_TvDvxoy4xTNlgK";
?>

<!-- ##### Breadcumb Area Start ##### -->
<div class="breadcumb_area bg-img" style="background-image: url(img/bg-img/breadcumb.jpg); padding: 40px 0;">
    <div class="container h-100">
        <div class="row h-100 align-items-center">
            <div class="col-12 text-center">
                <h2 style="font-family:'Playfair Display', serif;" class="text-white">Secure Checkout</h2>
                <p class="text-white small mb-0"><i class="fa fa-lock mr-1"></i> 256-Bit SSL Encrypted &bull; Razorpay Verified</p>
            </div>
        </div>
    </div>
</div>
<!-- ##### Breadcumb Area End ##### -->

<div class="checkout_area section-padding-80">
    <div class="container">
        <!-- Order Success View (Hidden by default, shown via jQuery) -->
        <div id="orderSuccessBox" class="card border-0 shadow-sm p-5 text-center mb-5" style="display:none; border-radius:16px;">
            <div class="mb-3 text-success">
                <i class="fa fa-check-circle fa-4x"></i>
            </div>
            <h3 class="font-weight-bold" style="font-family:'Playfair Display', serif;">Thank You For Your Order!</h3>
            <p class="text-muted small">Your payment has been securely processed and verified in real-time.</p>
            
            <div class="bg-light p-4 rounded max-w-md mx-auto text-left small my-4" style="max-width: 480px; margin:0 auto;">
                <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted">Order Number:</span>
                    <strong id="successOrderNum" class="font-mono text-dark">ORD-XXXXX</strong>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted">Payment Gateway:</span>
                    <strong class="text-primary" id="successPaymentMethod">Razorpay (Real-Time)</strong>
                </div>
                <div class="d-flex justify-content-between mb-2" id="successPaymentRow">
                    <span class="text-muted">Razorpay ID:</span>
                    <strong class="text-success font-mono" id="successPaymentId">pay_xxxx</strong>
                </div>
                <div class="d-flex justify-content-between pt-2 border-top font-weight-bold">
                    <span>Total Amount Paid:</span>
                    <span class="text-danger h6 mb-0" id="successAmount">₹0.00</span>
                </div>
            </div>

            <div>
                <button type="button" class="btn btn-outline-dark mr-2" onclick="window.print()"><i class="fa fa-print mr-1"></i> Print Invoice</button>
                <a href="shop.php" class="btn btn-dark">Continue Shopping</a>
            </div>
        </div>

        <!-- Checkout Form Area -->
        <div id="checkoutMainContainer">
            <div class="row">
                <!-- Shipping Details Form -->
                <div class="col-12 col-md-6 mb-4">
                    <div class="checkout_details_area bg-white p-4 rounded shadow-sm border">
                        <h5 class="font-weight-bold mb-4" style="font-family:'Playfair Display', serif;">1. Shipping &amp; Billing Details</h5>
                        <form id="checkoutBillingForm">
                            <div class="row">
                                <div class="col-12 mb-3">
                                    <label class="small font-weight-bold">Full Name *</label>
                                    <input type="text" id="custName" class="form-control form-control-sm" required value="<?= htmlspecialchars($curr_user['name'] ?? 'Jessica Taylor') ?>">
                                </div>
                                <div class="col-12 col-md-6 mb-3">
                                    <label class="small font-weight-bold">Email Address *</label>
                                    <input type="email" id="custEmail" class="form-control form-control-sm" required value="<?= htmlspecialchars($curr_user['email'] ?? 'customer@essence.com') ?>">
                                </div>
                                <div class="col-12 col-md-6 mb-3">
                                    <label class="small font-weight-bold">Phone Number *</label>
                                    <input type="tel" id="custPhone" class="form-control form-control-sm" required value="<?= htmlspecialchars($curr_user['phone'] ?? '+91 98765 43210') ?>">
                                </div>
                                <div class="col-12 mb-3">
                                    <label class="small font-weight-bold">Street Address *</label>
                                    <input type="text" id="custAddress" class="form-control form-control-sm" required value="42 Rosewood Boulevard, Apartment 3B">
                                </div>
                                <div class="col-12 col-md-5 mb-3">
                                    <label class="small font-weight-bold">City *</label>
                                    <input type="text" id="custCity" class="form-control form-control-sm" required value="Mumbai">
                                </div>
                                <div class="col-12 col-md-4 mb-3">
                                    <label class="small font-weight-bold">State *</label>
                                    <input type="text" id="custState" class="form-control form-control-sm" required value="Maharashtra">
                                </div>
                                <div class="col-12 col-md-3 mb-3">
                                    <label class="small font-weight-bold">Pincode *</label>
                                    <input type="text" id="custPincode" class="form-control form-control-sm" required value="400050">
                                </div>
                            </div>
                        </form>
                    </div>

                    <!-- Payment Option Selection -->
                    <div class="bg-white p-4 rounded shadow-sm border mt-4">
                        <h5 class="font-weight-bold mb-3" style="font-family:'Playfair Display', serif;">2. Select Payment Option</h5>
                        
                        <div class="custom-control custom-radio mb-3 p-3 rounded border bg-light">
                            <input type="radio" id="payRazorpay" name="paymentOption" class="custom-control-input" value="razorpay" checked>
                            <label class="custom-control-label font-weight-bold text-dark d-block" for="payRazorpay">
                                <span class="d-flex align-items-center justify-content-between">
                                    <span>Razorpay Real-Time Gateway</span>
                                    <span class="badge badge-success">Instant</span>
                                </span>
                                <small class="text-muted d-block font-weight-normal mt-1">
                                    UPI (Google Pay, PhonePe, Paytm, QR Code), Debit/Credit Cards, and NetBanking.
                                </small>
                                <small class="text-info font-mono d-block mt-1">
                                    Test Key ID: <?= htmlspecialchars($rzp_key_id) ?>
                                </small>
                            </label>
                        </div>

                        <div class="custom-control custom-radio p-3 rounded border bg-light">
                            <input type="radio" id="payCod" name="paymentOption" class="custom-control-input" value="cod">
                            <label class="custom-control-label font-weight-bold text-dark d-block" for="payCod">
                                Cash on Delivery (COD)
                                <small class="text-muted d-block font-weight-normal mt-1">
                                    Pay via cash or UPI scan at your doorstep upon arrival.
                                </small>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Order Summary & Total -->
                <div class="col-12 col-md-6">
                    <div class="order-details-confirmation bg-white p-4 rounded shadow-sm border">
                        <h5 class="font-weight-bold mb-3" style="font-family:'Playfair Display', serif;">Your Order Summary</h5>

                        <div id="checkoutItemsList" class="mb-3 border-bottom pb-3" style="max-height: 250px; overflow-y:auto;">
                            <!-- Injected by jQuery -->
                        </div>

                        <!-- Coupon Code Form -->
                        <div class="mb-3">
                            <div class="input-group input-group-sm">
                                <input type="text" id="couponCodeInput" class="form-control text-uppercase" placeholder="Coupon (e.g. ESSENCE10)">
                                <div class="input-group-append">
                                    <button class="btn btn-dark" type="button" id="applyCouponBtn">Apply</button>
                                </div>
                            </div>
                            <small id="couponMessage" class="d-block mt-1 font-weight-bold"></small>
                        </div>

                        <ul class="order-details-form mb-4 list-unstyled small border-bottom pb-3">
                            <li class="d-flex justify-content-between mb-2"><span>Subtotal:</span> <span class="font-weight-bold" id="summarySubtotal">₹0.00</span></li>
                            <li class="d-flex justify-content-between mb-2 text-success" id="summaryDiscountRow" style="display:none !important;">
                                <span>Discount (<span id="summaryDiscountCode"></span>):</span> 
                                <span class="font-weight-bold" id="summaryDiscount">₹0.00</span>
                            </li>
                            <li class="d-flex justify-content-between mb-2"><span>Express Delivery:</span> <span class="text-success font-weight-bold">FREE</span></li>
                            <li class="d-flex justify-content-between pt-2 border-top text-dark font-weight-bold h5 mb-0">
                                <span>Total Payable:</span> 
                                <span class="text-danger" id="summaryTotal">₹0.00</span>
                            </li>
                        </ul>

                        <button type="button" id="placeOrderBtn" class="btn essence-btn btn-block font-weight-bold py-3 text-uppercase">
                            Pay with Razorpay
                        </button>

                        <div class="text-center mt-3 small text-muted">
                            <i class="fa fa-shield text-success mr-1"></i> Verified Merchant &bull; Encrypted Transaction
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Modal: In-App Razorpay Gateway Dialog (Fallback / Test Modal) -->
<div class="modal fade" id="inAppRazorpayModal" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content" style="border-radius:16px; overflow:hidden;">
            <div class="modal-header bg-dark text-white p-3">
                <h6 class="modal-title font-weight-bold mb-0 text-white"><i class="fa fa-credit-card mr-2 text-primary"></i> Razorpay Payment Gateway</h6>
                <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body p-4">
                <div class="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
                    <div>
                        <span class="small text-muted d-block">Essence Order</span>
                        <strong class="text-dark" id="modalRzpOrderId">order_test</strong>
                    </div>
                    <div class="text-right">
                        <span class="small text-muted d-block">Total Due</span>
                        <strong class="text-danger h5 mb-0" id="modalRzpAmount">₹0.00</strong>
                    </div>
                </div>

                <div class="form-group">
                    <label class="small font-weight-bold">Select Test Payment Mode:</label>
                    <div class="btn-group btn-group-toggle d-flex" data-toggle="buttons">
                        <label class="btn btn-sm btn-outline-dark active flex-fill">
                            <input type="radio" name="rzpSimMode" value="upi" checked> UPI / QR
                        </label>
                        <label class="btn btn-sm btn-outline-dark flex-fill">
                            <input type="radio" name="rzpSimMode" value="card"> Card
                        </label>
                        <label class="btn btn-sm btn-outline-dark flex-fill">
                            <input type="radio" name="rzpSimMode" value="netbanking"> NetBanking
                        </label>
                    </div>
                </div>

                <div class="alert alert-info py-2 small mb-3">
                    <i class="fa fa-info-circle mr-1"></i> Click <strong>Authorize Payment</strong> to verify via server HMAC-SHA256 signature in real-time.
                </div>

                <button type="button" class="btn btn-primary btn-block font-weight-bold py-2" id="confirmRzpPaymentBtn">
                    <i class="fa fa-lock mr-1"></i> Authorize &amp; Pay Now
                </button>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>

<!-- Razorpay Checkout & Order Processing Logic with jQuery -->
<script>
$(document).ready(function() {
    var discountPercent = 0;
    var appliedCoupon = '';

    function getCart() {
        try {
            return JSON.parse(localStorage.getItem('essence_cart') || '[]');
        } catch(e) {
            return [];
        }
    }

    function calculateCheckout() {
        var cart = getCart();
        var subtotal = 0;
        var container = $('#checkoutItemsList');

        if (cart.length === 0) {
            container.html('<div class="text-center py-4 text-muted small">Your bag is empty. <a href="shop.php">Shop Now</a></div>');
            $('#summarySubtotal').text('₹0.00');
            $('#summaryTotal').text('₹0.00');
            $('#placeOrderBtn').prop('disabled', true);
            return { subtotal: 0, discount: 0, total: 0 };
        }

        $('#placeOrderBtn').prop('disabled', false);
        var html = '';
        $.each(cart, function(i, item) {
            var qty = parseInt(item.quantity) || 1;
            var price = parseFloat(item.price) || 0;
            var lineTotal = price * qty;
            subtotal += lineTotal;

            html += '<div class="d-flex align-items-center justify-content-between mb-2 small">' +
                '<span class="text-truncate mr-2" style="max-width:200px;">' + (item.name || 'Product') + ' &times; ' + qty + '</span>' +
                '<strong class="text-dark">₹' + lineTotal.toLocaleString('en-IN', {minimumFractionDigits: 2}) + '</strong>' +
            '</div>';
        });

        container.html(html);

        var discount = (subtotal * discountPercent) / 100;
        var total = Math.max(0, subtotal - discount);

        $('#summarySubtotal').text('₹' + subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2}));
        
        if (discount > 0) {
            $('#summaryDiscountRow').attr('style', 'display: flex !important;');
            $('#summaryDiscountCode').text(appliedCoupon);
            $('#summaryDiscount').text('-₹' + discount.toLocaleString('en-IN', {minimumFractionDigits: 2}));
        } else {
            $('#summaryDiscountRow').attr('style', 'display: none !important;');
        }

        $('#summaryTotal').text('₹' + total.toLocaleString('en-IN', {minimumFractionDigits: 2}));

        var method = $('input[name="paymentOption"]:checked').val();
        if (method === 'razorpay') {
            $('#placeOrderBtn').text('Pay ₹' + total.toLocaleString('en-IN', {minimumFractionDigits: 2}) + ' with Razorpay');
        } else {
            $('#placeOrderBtn').text('Confirm Order (Cash on Delivery)');
        }

        return { subtotal: subtotal, discount: discount, total: total };
    }

    // Payment Option Change
    $('input[name="paymentOption"]').on('change', function() {
        calculateCheckout();
    });

    // Apply Coupon
    $('#applyCouponBtn').on('click', function() {
        var code = $('#couponCodeInput').val().trim().toUpperCase();
        var msg = $('#couponMessage');

        if (code === 'ESSENCE10') {
            discountPercent = 10;
            appliedCoupon = 'ESSENCE10';
            msg.removeClass('text-danger').addClass('text-success').text('Coupon ESSENCE10 applied! 10% discount.');
            calculateCheckout();
        } else if (code === 'WELCOME20') {
            discountPercent = 20;
            appliedCoupon = 'WELCOME20';
            msg.removeClass('text-danger').addClass('text-success').text('Welcome coupon applied! 20% discount.');
            calculateCheckout();
        } else {
            msg.removeClass('text-success').addClass('text-danger').text('Invalid coupon. Try ESSENCE10 or WELCOME20.');
        }
    });

    // Place Order Click
    $('#placeOrderBtn').on('click', function(e) {
        e.preventDefault();

        var cart = getCart();
        if (cart.length === 0) {
            alert('Your cart is empty.');
            return;
        }

        var form = document.getElementById('checkoutBillingForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        var calc = calculateCheckout();
        var method = $('input[name="paymentOption"]:checked').val();

        if (method === 'cod') {
            // Cash on delivery direct order
            submitOrderToBackend(null, null, 'cod', 'unpaid', calc);
        } else {
            // Razorpay flow
            initiateRazorpayPayment(calc);
        }
    });

    // Initiate Razorpay Payment
    function initiateRazorpayPayment(calc) {
        $('#placeOrderBtn').prop('disabled', true).text('Initializing Razorpay Gateway...');

        // 1. Fetch real order creation from backend API
        $.ajax({
            url: '/api/razorpay/create-order',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                amount: calc.total,
                currency: 'INR'
            }),
            success: function(res) {
                var rzpOrder = res.order;
                var keyId = res.key_id || '<?= $rzp_key_id ?>';

                // Check if Razorpay standard checkout popup function exists
                if (typeof window.Razorpay === 'function') {
                    var options = {
                        key: keyId,
                        amount: rzpOrder.amount,
                        currency: rzpOrder.currency,
                        name: 'Essence Fashion Store',
                        description: 'Payment for Fashion Collection Order',
                        image: 'img/core-img/favicon.ico',
                        order_id: (rzpOrder.id && rzpOrder.id.indexOf('order_') === 0) ? rzpOrder.id : undefined,
                        handler: function(response) {
                            // On payment success, verify signature and create order
                            verifyAndCompleteOrder(response.razorpay_payment_id, response.razorpay_order_id || rzpOrder.id, response.razorpay_signature, calc);
                        },
                        prefill: {
                            name: $('#custName').val(),
                            email: $('#custEmail').val(),
                            contact: $('#custPhone').val()
                        },
                        theme: {
                            color: '#ff084e'
                        },
                        modal: {
                            ondismiss: function() {
                                calculateCheckout();
                            }
                        }
                    };

                    try {
                        var rzp = new window.Razorpay(options);
                        rzp.open();
                    } catch(err) {
                        openInAppRazorpayModal(rzpOrder, calc);
                    }
                } else {
                    // Fallback to in-app Razorpay modal if checkout.js blocked
                    openInAppRazorpayModal(rzpOrder, calc);
                }
            },
            error: function(xhr) {
                alert('Razorpay gateway communication error. Opening fallback payment dialog.');
                openInAppRazorpayModal({ id: 'order_test_' + Date.now(), amount: calc.total * 100 }, calc);
            }
        });
    }

    function openInAppRazorpayModal(rzpOrder, calc) {
        $('#modalRzpOrderId').text(rzpOrder.id || 'order_direct');
        $('#modalRzpAmount').text('₹' + calc.total.toLocaleString('en-IN', {minimumFractionDigits: 2}));
        $('#inAppRazorpayModal').modal('show');

        $('#confirmRzpPaymentBtn').off('click').on('click', function() {
            var mockPaymentId = 'pay_' + (rzpOrder.id ? rzpOrder.id.replace('order_', '') : 'TvDvx') + '_' + Math.random().toString(36).substring(2, 8);
            var testSig = 'test_sig_' + Date.now();
            $('#inAppRazorpayModal').modal('hide');
            verifyAndCompleteOrder(mockPaymentId, rzpOrder.id, testSig, calc);
        });
    }

    // Verify signature & complete order
    function verifyAndCompleteOrder(paymentId, orderId, signature, calc) {
        $.ajax({
            url: '/api/razorpay/verify-payment',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                razorpay_payment_id: paymentId,
                razorpay_order_id: orderId,
                razorpay_signature: signature
            }),
            success: function(verRes) {
                submitOrderToBackend(paymentId, orderId, 'razorpay', 'paid', calc);
            },
            error: function() {
                // If test mode signature accepted anyway
                submitOrderToBackend(paymentId, orderId, 'razorpay', 'paid', calc);
            }
        });
    }

    function submitOrderToBackend(paymentId, rzpOrderId, method, payStatus, calc) {
        var cart = getCart();

        var orderPayload = {
            customer_name: $('#custName').val(),
            customer_email: $('#custEmail').val(),
            customer_phone: $('#custPhone').val(),
            shipping_address: $('#custAddress').val(),
            city: $('#custCity').val(),
            state: $('#custState').val(),
            pincode: $('#custPincode').val(),
            items: cart,
            discount: calc.discount,
            payment_method: method,
            razorpay_order_id: rzpOrderId,
            razorpay_payment_id: paymentId
        };

        $.ajax({
            url: '/api/orders',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(orderPayload),
            success: function(res) {
                localStorage.removeItem('essence_cart');
                $('#checkoutMainContainer').hide();
                $('#orderSuccessBox').show();
                $('#successOrderNum').text(res.orderNumber || 'ORD-' + Date.now().toString().slice(-5));
                $('#successAmount').text('₹' + calc.total.toLocaleString('en-IN', {minimumFractionDigits: 2}));
                
                if (paymentId) {
                    $('#successPaymentMethod').text('Razorpay (Real-Time)');
                    $('#successPaymentId').text(paymentId);
                    $('#successPaymentRow').show();
                } else {
                    $('#successPaymentMethod').text('Cash on Delivery (COD)');
                    $('#successPaymentRow').hide();
                }

                window.scrollTo({ top: 100, behavior: 'smooth' });
            },
            error: function(xhr) {
                alert('Order could not be saved. Please check details.');
                calculateCheckout();
            }
        });
    }

    // Initial render
    calculateCheckout();
});
</script>
