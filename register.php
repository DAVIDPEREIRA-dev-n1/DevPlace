<?php

header('Content-Type: application/json');

require_once 'db.php';

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$username = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if ($username === '' || $email === '' || $password === '') {

    http_response_code(400);

    echo json_encode([
        "message" => "Preencha todos os campos."
    ]);

    exit;
}

if (strlen($username) > 30) {

    http_response_code(400);

    echo json_encode([
        "message" => "O nome de utilizador deve ter no máximo 30 caracteres."
    ]);

    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

    http_response_code(400);

    echo json_encode([
        "message" => "Email inválido."
    ]);

    exit;
}

if (strlen($password) < 6) {

    http_response_code(400);

    echo json_encode([
        "message" => "A password deve ter pelo menos 6 caracteres."
    ]);

    exit;
}


// Verificar se username ou email já existem

$stmt = $pdo->prepare(
    "SELECT id FROM users
     WHERE username = :username
     OR email = :email
     LIMIT 1"
);

$stmt->execute([
    ':username' => $username,
    ':email' => $email
]);

if ($stmt->fetch()) {

    http_response_code(409);

    echo json_encode([
        "message" => "Username ou email já está registado."
    ]);

    exit;
}


// Criar hash seguro da password

$passwordHash = password_hash(
    $password,
    PASSWORD_DEFAULT
);


// Inserir utilizador

$stmt = $pdo->prepare(
    "INSERT INTO users
    (username, email, password_hash)
    VALUES
    (:username, :email, :password_hash)"
);

$stmt->execute([

    ':username' => $username,

    ':email' => $email,

    ':password_hash' => $passwordHash

]);


echo json_encode([

    "success" => true,

    "message" => "Conta criada com sucesso."

]);