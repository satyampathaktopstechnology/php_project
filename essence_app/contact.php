<?php
/**
 * Essence Fashion Store - Contact Us
 * Form secured with PDO Prepared Statements
 */
$page_title = "Contact Us";
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

$success_msg = "";
$error_msg = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['send_message'])) {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $subject = trim($_POST['subject'] ?? 'Customer Inquiry');
    $message = trim($_POST['message'] ?? '');

    if (empty($name) || empty($email) || empty($message)) {
        $error_msg = "Please fill in all required fields (Name, Email, and Message).";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error_msg = "Please enter a valid email address.";
    } else {
        // Prepared Statement: prevents SQL injection
        $stmt = $conn->prepare("INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)");
        $stmt->execute([$name, $email, $subject, $message]);
        $success_msg = "Thank you, {$name}! Your message has been received. Our team will contact you within 24 hours.";
    }
}

require_once __DIR__ . '/header.php';
?>

<div class="breadcumb_area bg-img" style="background-image: url(img/bg-img/breadcumb.jpg); padding: 40px 0;">
    <div class="container h-100">
        <div class="row h-100 align-items-center">
            <div class="col-12 text-center">
                <h2 style="font-family:'Playfair Display', serif;" class="text-white">Get In Touch</h2>
                <p class="text-white small mb-0"><i class="fa fa-envelope-o mr-1"></i> We are here to assist with any questions or styling guidance</p>
            </div>
        </div>
    </div>
</div>

<div class="section-padding-80">
    <div class="container">
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
            <!-- Contact Form -->
            <div class="col-12 col-md-7 mb-4">
                <div class="card border-0 shadow-sm p-4 rounded-lg bg-white">
                    <h5 class="font-weight-bold mb-3" style="font-family:'Playfair Display', serif;">Send Us A Message</h5>
                    <p class="text-muted small mb-4">Have an order question, sizing query, or feedback? Complete the form below.</p>

                    <form method="POST">
                        <div class="form-row">
                            <div class="col-md-6 form-group">
                                <label class="small font-weight-bold">Your Name *</label>
                                <input type="text" name="name" class="form-control" required placeholder="Jane Doe" value="<?= htmlspecialchars($curr_user['name'] ?? '') ?>">
                            </div>
                            <div class="col-md-6 form-group">
                                <label class="small font-weight-bold">Email Address *</label>
                                <input type="email" name="email" class="form-control" required placeholder="jane@example.com" value="<?= htmlspecialchars($curr_user['email'] ?? '') ?>">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="small font-weight-bold">Subject</label>
                            <input type="text" name="subject" class="form-control" placeholder="Order status / Styling advice">
                        </div>

                        <div class="form-group mb-4">
                            <label class="small font-weight-bold">Message *</label>
                            <textarea name="message" rows="5" class="form-control" required placeholder="How can we assist you today?"></textarea>
                        </div>

                        <button type="submit" name="send_message" class="btn btn-dark font-weight-bold py-2 px-4">
                            <i class="fa fa-paper-plane mr-1"></i> Send Message
                        </button>
                    </form>
                </div>
            </div>

            <!-- Contact Information Cards -->
            <div class="col-12 col-md-5">
                <div class="card border-0 shadow-sm p-4 rounded-lg bg-white mb-4">
                    <h5 class="font-weight-bold mb-3" style="font-family:'Playfair Display', serif;">Flagship Boutique</h5>
                    
                    <div class="d-flex mb-3">
                        <div class="text-danger mr-3"><i class="fa fa-map-marker fa-lg"></i></div>
                        <div class="small">
                            <strong>Essence Studio &amp; Boutique</strong><br>
                            10 Boulevard Haussmann, Paris / Bandra West, Mumbai 400050
                        </div>
                    </div>

                    <div class="d-flex mb-3">
                        <div class="text-primary mr-3"><i class="fa fa-phone fa-lg"></i></div>
                        <div class="small">
                            <strong>Customer Care Line</strong><br>
                            +91 (022) 4987-6543 / Mon-Sat: 9:00 AM – 8:00 PM IST
                        </div>
                    </div>

                    <div class="d-flex mb-3">
                        <div class="text-success mr-3"><i class="fa fa-envelope fa-lg"></i></div>
                        <div class="small">
                            <strong>Concierge Email</strong><br>
                            care@essencefashion.com &bull; press@essencefashion.com
                        </div>
                    </div>
                </div>

                <div class="card border-0 shadow-sm p-4 rounded-lg text-white" style="background: linear-gradient(135deg, #111827 0%, #1f2937 100%);">
                    <h6 class="font-weight-bold text-white mb-2"><i class="fa fa-credit-card mr-2 text-danger"></i> Secure Payment Gateway</h6>
                    <p class="small text-muted mb-0">All orders are processed through 256-bit encrypted Razorpay infrastructure supporting instant UPI, credit/debit cards, and NetBanking.</p>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>