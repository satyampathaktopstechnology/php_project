<?php
/**
 * Essence Fashion Store - Blog / Editorial
 * Dynamic articles from PDO SQLite database
 */
$page_title = "Fashion Journal";
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

// Fetch articles with prepared statements
$stmt = $conn->prepare("SELECT * FROM blog_posts ORDER BY id DESC");
$stmt->execute();
$blogs = $stmt->fetchAll();

require_once __DIR__ . '/header.php';
?>

<div class="breadcumb_area bg-img" style="background-image: url(img/bg-img/breadcumb.jpg); padding: 40px 0;">
    <div class="container h-100">
        <div class="row h-100 align-items-center">
            <div class="col-12 text-center">
                <h2 style="font-family:'Playfair Display', serif;" class="text-white">Fashion &amp; Style Journal</h2>
                <p class="text-white small mb-0"><i class="fa fa-newspaper-o mr-1"></i> Trends, Runway Insights, and Sustainable Dressing</p>
            </div>
        </div>
    </div>
</div>

<div class="blog-wrapper section-padding-80">
    <div class="container">
        <div class="row">
            <?php foreach ($blogs as $b): ?>
                <div class="col-12 col-md-6 col-lg-4 mb-4">
                    <div class="card h-100 border-0 shadow-sm rounded-lg overflow-hidden">
                        <a href="single-blog.php?id=<?= $b['id'] ?>">
                            <img src="<?= htmlspecialchars($b['image']) ?>" alt="<?= htmlspecialchars($b['title']) ?>" class="card-img-top" style="height: 240px; object-fit: cover;">
                        </a>
                        <div class="card-body p-4 d-flex flex-column justify-content-between">
                            <div>
                                <div class="d-flex justify-content-between text-muted small mb-2">
                                    <span><i class="fa fa-user-circle-o mr-1"></i> <?= htmlspecialchars($b['author']) ?></span>
                                    <span><i class="fa fa-eye mr-1"></i> <?= $b['views'] ?> views</span>
                                </div>
                                <h5 class="font-weight-bold mb-2" style="font-family:'Playfair Display', serif;">
                                    <a href="single-blog.php?id=<?= $b['id'] ?>" class="text-dark"><?= htmlspecialchars($b['title']) ?></a>
                                </h5>
                                <p class="text-muted small mb-3">
                                    <?= htmlspecialchars($b['excerpt']) ?>
                                </p>
                            </div>
                            <div>
                                <a href="single-blog.php?id=<?= $b['id'] ?>" class="font-weight-bold small text-dark text-uppercase">
                                    Read Article <i class="fa fa-arrow-right ml-1 text-danger"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>