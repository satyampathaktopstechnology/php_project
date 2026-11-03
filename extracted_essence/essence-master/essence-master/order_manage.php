
<?php
include "db.php";

$orders = mysqli_query($conn, "
    SELECT orders.*, users.name AS customer_name
    FROM orders
    LEFT JOIN users ON orders.user_id = users.id
    ORDER BY orders.id DESC
");

if (!$orders) {
    die("Query Error: " . mysqli_error($conn));
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Manage Orders</title>
    <link rel="stylesheet" href="css/bootstrap.min.css">
    <link rel="stylesheet" href="css/essence-unified.css?v=20261102">
</head>

<body class="container mt-5">

    <h2>Manage Orders</h2>

    <table class="table table-bordered">
        <thead>
            <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Action</th>
            </tr>
        </thead>

        <tbody>
            <?php while ($row = mysqli_fetch_assoc($orders)) { ?>
                <tr>
                    <td><?php echo $row['id']; ?></td>

                    <td>
                        <?php echo htmlspecialchars($row['customer_name'] ?? 'Guest'); ?>
                    </td>

                    <td>
                        ₹<?php echo number_format($row['total_amount'], 2); ?>
                    </td>

                    <td>
                        <?php echo htmlspecialchars($row['order_status']); ?>
                    </td>

                    <td>
                        <a href="order_edit.php?id=<?php echo $row['id']; ?>"
                           class="btn btn-primary btn-sm">
                            Update Status
                        </a>
                    </td>
                </tr>
            <?php } ?>
        </tbody>
    </table>

    <a href="admin.php" class="btn btn-secondary">Back to Dashboard</a>

</body>
</html>
