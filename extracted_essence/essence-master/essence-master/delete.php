<?php 
include"db.php";
if (isset($_GET['id'])) {

    $id = $_GET['id'];

    $delete = mysqli_query($conn, "DELETE FROM products WHERE id = '$id'");

    if ($delete) {
        header("Location: admin.php");
        exit;
    }
}


?>