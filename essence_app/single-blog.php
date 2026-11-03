<?php
/**
 * Essence Fashion Store - Single Blog Article
 * Protected with Prepared Statements
 */
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

$id = intval($_GET['id'] ?? 1);

// Fetch article with Prepared Statement
$stmt = $conn->prepare("SELECT * FROM blog_posts WHERE id = ?");
$stmt->execute([$id]);
$post = $stmt->fetch();

if (!$post) {
    // Fallback to first article
    $stmt = $conn->query("SELECT * FROM blog_posts ORDER BY id ASC LIMIT 1");
    $post = $stmt->fetch();
}

// Increment views
if ($post) {
    $conn->prepare("UPDATE blog_posts SET views = views + 1 WHERE id = ?")->execute([$post['id']]);
}

// Related articles
$relatedStmt = $conn->prepare("SELECT * FROM blog_posts WHERE id != ? ORDER BY id DESC LIMIT 3");
$relatedStmt->execute([$post['id']]);
$related = $relatedStmt->fetchAll();

$page_title = $post['title'];
require_once __DIR__ . '/header.php';
?>

<div class="breadcumb_area bg-img" style="background-image: url(img/bg-img/breadcumb.jpg); padding: 40px 0;">
    <div class="container h-100">
        <div class="row h-100 align-items-center">
            <div class="col-12 text-center">
                <h2 style="font-family:'Playfair Display', serif;" class="text-white"><?= htmlspecialchars($post['title']) ?></h2>
                <p class="text-white small mb-0">By <?= htmlspecialchars($post['author']) ?> &bull; <?= date('F j, Y', strtotime($post['created_at'])) ?> &bull; <?= $post['views'] + 1 ?> Views</p>
            </div>
        </div>
    </div>
</div>

<div class="single-blog-wrapper section-padding-80">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-12 col-lg-8">
                <div class="card border-0 shadow-sm p-4 p-md-5 rounded-lg bg-white mb-5">
                    <img src="<?= htmlspecialchars($post['image']) ?>" alt="<?= htmlspecialchars($post['title']) ?>" class="img-fluid rounded mb-4" style="width: 100%; max-height: 440px; object-fit: cover;">

                    <div class="blog-content">
                        <p class="lead font-weight-normal text-muted mb-4"><?= htmlspecialchars($post['excerpt']) ?></p>
                        <div class="text-secondary" style="line-height: 1.8; font-size: 15px;">
                            <?= nl2br(htmlspecialchars($post['content'])) ?>
                        </div>
                    </div>

                    <hr class="my-4">

                    <div class="d-flex justify-content-between align-items-center">
                        <div class="small text-muted">
                            <span class="mr-3"><i class="fa fa-folder-open-o mr-1"></i> Haute Couture &bull; Sustainability</span>
                            <span><i class="fa fa-heart-o mr-1 text-danger"></i> 142 Likes</span>
                        </div>
                        <a href="blog.php" class="btn btn-sm btn-outline-dark">
                            <i class="fa fa-arrow-left mr-1"></i> Back to Journal
                        </a>
                    </div>
                </div>

                <!-- Related Articles -->
                <div class="mb-5">
                    <h5 class="font-weight-bold mb-4" style="font-family:'Playfair Display', serif;">You May Also Enjoy</h5>
                    <div class="row">
                        <?php foreach ($related as $r): ?>
                            <div class="col-12 col-md-4 mb-3">
                                <div class="card h-100 border-0 shadow-sm rounded-lg overflow-hidden">
                                    <a href="single-blog.php?id=<?= $r['id'] ?>">
                                        <img src="<?= htmlspecialchars($r['image']) ?>" alt="" style="height: 140px; width:100%; object-fit: cover;">
                                    </a>
                                    <div class="card-body p-3">
                                        <h6 class="font-weight-bold small mb-1">
                                            <a href="single-blog.php?id=<?= $r['id'] ?>" class="text-dark"><?= htmlspecialchars($r['title']) ?></a>
                                        </h6>
                                        <span class="text-muted small"><?= date('M d, Y', strtotime($r['created_at'])) ?></span>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>