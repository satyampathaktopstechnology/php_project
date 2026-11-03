<?php

require_once __DIR__ . '/../config.php';

header('Content-Type: application/json; charset=utf-8');

$action = $_GET['action'] ?? ($_POST['action'] ?? '');

function jsonResponse($data, $status = 200)
{
    http_response_code($status);
    echo json_encode($data);
    exit;
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'status') {
        if (!empty($_SESSION['user_id'])) {
            jsonResponse([
                'loggedIn' => true,
                'user' => [
                    'id' => $_SESSION['user_id'],
                    'name' => $_SESSION['user_name'],
                    'email' => $_SESSION['user_email'],
                ],
            ]);
        }

        jsonResponse(['loggedIn' => false]);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && in_array($action, ['register', 'login'], true)) {
        jsonResponse(['success' => false, 'message' => 'Account services have been removed.'], 503);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'logout') {
        session_unset();
        session_destroy();
        jsonResponse(['success' => true, 'message' => 'Signed out successfully.']);
    }

    jsonResponse(['success' => false, 'message' => 'Invalid request.'], 400);
} catch (Throwable $exception) {
    error_log('Auth API error: ' . $exception->getMessage());
    jsonResponse(['success' => false, 'message' => 'The account service is unavailable.'], 500);
}
