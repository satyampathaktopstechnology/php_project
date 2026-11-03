
<?php
include "db.php";

$id = $_GET['id'];

// Get product details
$result = mysqli_query($conn, "SELECT * FROM products WHERE id = '$id'");

$row = mysqli_fetch_assoc($result);

if (!$row) {
    die("Product not found");
}

// Update product
if (isset($_POST['update'])) {

    $brand_id = $_POST['brand_id'];
    $productname = $_POST['productname'];
    $price = $_POST['price'];
    $old_price = $_POST['old_price'];
    $description = mysqli_real_escape_string($conn, $_POST['description']);
    $material = $_POST['material'];
    $image = $_FILES['image']['name'];
    $temp = $_FILES['image']['tmp_name'];
    $stock_quantity = $_POST['stock_quantity'];

    $folder = "img/product-img/";

     if(!is_dir($folder)){
        mkdir($folder, 0777, true);
    }

    move_uploaded_file($temp, $folder.$image);

    $sql = "update products set brand_id='$brand_id',
                                name='$productname',
                                price='$price',
                                old_price='$old_price',
                                description='$description',
                                material='$material',
                                image='$image',
                                stock_quantity='$stock_quantity'
                                where id='$id'";



    if($conn->query($sql)===true){
        header("location: product_manage.php");
    }


}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Update Product</title>
    <link rel="stylesheet" href="css/bootstrap.min.css">
    <link rel="stylesheet" href="css/essence-unified.css?v=20261102">
</head>
<body>

<h2>Update Product</h2>

<form method="POST" enctype="multipart/form-data">

    Brand ID:
    <input type="number" name="brand_id" value="<?php echo $row['brand_id']; ?>"><br><br>

    Product Name:
    <input type="text" name="productname" value="<?php echo $row['name']; ?>"><br><br>

    Price:
    <input type="number" name="price" step="0.01" value="<?php echo $row['price']; ?>"><br><br>

    Old Price:
    <input type="number" name="old_price" step="0.01" value="<?php echo $row['old_price']; ?>"><br><br>

    Description:
    <textarea name="description"><?php echo $row['description']; ?></textarea><br><br>

    Material:
    <input type="text" name="material" value="<?php echo $row['material']; ?>"><br><br>

    Product Image:
    <input type="file" name="image"><br><br>

    Stock Quantity:
    <input type="number" name="stock_quantity" value="<?php echo $row['stock_quantity']; ?>"><br><br>

    <button type="submit" name="update">Update Product</button>

</form>

</body>
</html>
