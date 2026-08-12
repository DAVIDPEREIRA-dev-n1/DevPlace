<?php

header('Content-Type: application/json');

require_once 'db.php';

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';


if ($email === '' || $password === '') {

    http_response_code(400);

    echo json_encode([
        "message" => "Preencha o email e a password."
    ]);

    exit;
}


// Procurar utilizador

$stmt = $pdo->prepare(
    "SELECT
        id,
        username,
        email,
        password_hash,
        bio,
        avatar,
        created_at
     FROM users
     WHERE email = :email
     LIMIT 1"
);

$stmt->execute([
    ':email' => $email
]);

$user = $stmt->fetch();


if (!$user || !password_verify(
    $password,
    $user['password_hash']
)) {

    http_response_code(401);

    echo json_encode([
        "message" => "Email ou password incorretos."
    ]);

    exit;
}


// Não enviar o hash da password para o JavaScript

unset($user['password_hash']);


// Adaptar nomes para o teu JS

$user['name'] = $user['username'];

$user['location'] = '';


echo json_encode([

    "success" => true,

    "user" => $user

]);