
<?php
include "db.php";

if (!isset($_GET['id'])) {
    die("Order ID is missing");
}

$id = (int) $_GET['id'];

$result = mysqli_query($conn, "SELECT * FROM orders WHERE id = $id");

$row = mysqli_fetch_assoc($result);

if (!$row) {
    die("Order not found");
}

// Update Status
if (isset($_POST['update'])) {

    $status = $_POST['order_status'];

    $stmt = mysqli_prepare($conn,
        "UPDATE orders SET order_status = ? WHERE id = ?"
    );

    mysqli_stmt_bind_param($stmt, "si", $status, $id);

    if (mysqli_stmt_execute($stmt)) {
        header("Location: order_manage.php");
        exit;
    } else {
        echo "Status update failed";
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Update Order Status</title>
    <link rel="stylesheet" href="css/bootstrap.min.css">
    <link rel="stylesheet" href="css/essence-unified.css?v=20261102">
</head>

<body class="container mt-5">

    <h2>Update Order #<?php echo $id; ?></h2>

    <form method="POST">

        <label>Order Status</label>

        <select name="order_status" class="form-control mb-3">

            <?php
            $statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

            foreach ($statuses as $status) {
            ?>
                <option value="<?php echo $status; ?>"
                    <?php if ($row['order_status'] == $status) echo 'selected'; ?>>
                    <?php echo $status; ?>
                </option>
            <?php } ?>

        </select>

        <button type="submit" name="update" class="btn btn-success">
            Update Status
        </button>

        <a href="order_manage.php" class="btn btn-secondary">
            Back
        </a>

    </form>

</body>
</html>
