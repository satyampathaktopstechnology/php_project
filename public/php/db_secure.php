<?php
/**
 * Essence Fashion Store - Secure Database Connection with Prepared Statements
 * Prevents SQL Injection using PDO with emulated prepares disabled
 */

$host = 'localhost';
$db   = 'fashion_store';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false, // Crucial: Disables emulation to force true parameterized prepared statements
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    // In production, log error privately, never expose raw DB errors
    error_log("Database connection error: " . $e->getMessage());
}
?>
