<?php

ob_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';

try {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);

    if (!is_array($data)) {
        http_response_code(400);

        echo json_encode([
            'success' => false,
            'message' => 'Pedido inválido.'
        ]);

        exit;
    }

    $userConfig = resolveUserTable($pdo);
    $table = $userConfig['table'];
    $nameField = $userConfig['name_field'];
    $emailField = $userConfig['email_field'];
    $passwordField = $userConfig['password_field'];

    $username = trim($data['name'] ?? '');
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';

    if ($username === '' || $email === '' || $password === '') {
        http_response_code(400);

        echo json_encode([
            'success' => false,
            'message' => 'Preencha todos os campos.'
        ]);

        exit;
    }

    if (strlen($username) > 30) {
        http_response_code(400);

        echo json_encode([
            'success' => false,
            'message' => 'O nome de utilizador deve ter no máximo 30 caracteres.'
        ]);

        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);

        echo json_encode([
            'success' => false,
            'message' => 'Email inválido.'
        ]);

        exit;
    }

    if (strlen($password) < 6) {
        http_response_code(400);

        echo json_encode([
            'success' => false,
            'message' => 'A password deve ter pelo menos 6 caracteres.'
        ]);

        exit;
    }

    $checkStmt = $pdo->prepare(
        "SELECT id FROM `{$table}`
         WHERE `{$nameField}` = :name_value
         OR `{$emailField}` = :email
         LIMIT 1"
    );

    $checkStmt->execute([
        ':name_value' => $username,
        ':email' => $email,
    ]);

    if ($checkStmt->fetch()) {
        http_response_code(409);

        echo json_encode([
            'success' => false,
            'message' => 'Username ou email já está registado.'
        ]);

        exit;
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $isPlainPasswordColumn = in_array(strtolower($passwordField), ['password', 'senha', 'pass'], true);
    $insertPasswordValue = $isPlainPasswordColumn ? $password : $passwordHash;

    $insertStmt = $pdo->prepare(
        "INSERT INTO `{$table}` (`{$nameField}`, `{$emailField}`, `{$passwordField}`)
         VALUES (:name_value, :email, :password_value)"
    );

    $insertStmt->execute([
        ':name_value' => $username,
        ':email' => $email,
        ':password_value' => $insertPasswordValue,
    ]);

    ob_clean();
    echo json_encode([
        'success' => true,
        'message' => 'Conta criada com sucesso.'
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);

    error_log('Register error: ' . $e->getMessage());

    ob_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao criar conta. Verifica se a tabela de utilizadores existe e se os campos estão corretos.'
    ], JSON_UNESCAPED_UNICODE);
} 