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

    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';
    $passwordNormalized = trim((string) $password);

    if ($email === '' || $password === '') {
        http_response_code(400);

        echo json_encode([
            'success' => false,
            'message' => 'Preencha o email e a senha.'
        ]);

        exit;
    }

    $stmt = $pdo->prepare(
        "SELECT
            id,
            `{$nameField}` AS username,
            `{$emailField}` AS email,
            `{$passwordField}` AS password_hash
         FROM `{$table}`
         WHERE `{$emailField}` = :email
         LIMIT 1"
    );

    $stmt->execute([
        ':email' => $email,
    ]);

    $user = $stmt->fetch();

    $storedPassword = $user['password_hash'] ?? '';
    $storedPasswordNormalized = trim((string) $storedPassword);
    $isPasswordValid = false;

    if ($user) {
        $isPasswordValid = password_verify($password, $storedPassword)
            || hash_equals((string) $storedPasswordNormalized, (string) $passwordNormalized)
            || hash_equals((string) md5($passwordNormalized), (string) $storedPasswordNormalized)
            || hash_equals((string) sha1($passwordNormalized), (string) $storedPasswordNormalized)
            || hash_equals((string) hash('sha256', $passwordNormalized), (string) $storedPasswordNormalized)
            || hash_equals((string) hash('sha512', $passwordNormalized), (string) $storedPasswordNormalized);
    }

    if (!$user || !$isPasswordValid) {
        http_response_code(401);

        echo json_encode([
            'success' => false,
            'message' => 'Email ou senha incorretos.'
        ]);

        exit;
    }

    unset($user['password_hash']);

    ob_clean();
    echo json_encode([
        'success' => true,
        'message' => 'Login efetuado com sucesso!',
        'user' => $user,
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);

    error_log('Login error: ' . $e->getMessage());

    ob_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao fazer login. Verifica se a tabela de utilizadores e os campos estão corretos.'
    ], JSON_UNESCAPED_UNICODE);
}