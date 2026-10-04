<?php

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

set_error_handler(function ($severity, $message, $file, $line) {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

$host = getenv('DB_HOST') ?: 'localhost';
$dbname = getenv('DB_NAME') ?: 'devplace';
$username = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASS') ?: '';
$port = getenv('DB_PORT') ?: 3306;

try {
    $pdo = new PDO(
        "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);

    error_log('DB connection failed: ' . $e->getMessage());

    header('Content-Type: application/json; charset=utf-8');
    die(json_encode([
        'success' => false,
        'message' => 'Erro na ligação à base de dados. Verifica as credenciais, a base de dados e se o MySQL está a correr.'
    ], JSON_UNESCAPED_UNICODE));
}

function resolveUserTable(PDO $pdo): array {
    $tableCandidates = ['users', 'user'];
    $nameCandidates = ['name', 'username', 'full_name', 'nome'];
    $emailCandidates = ['email', 'mail'];
    $passwordCandidates = ['password_hash', 'password', 'senha', 'pass'];

    foreach ($tableCandidates as $table) {
        try {
            $columns = $pdo->query("SHOW COLUMNS FROM `{$table}`")->fetchAll(PDO::FETCH_COLUMN);
            $columnNames = array_map('strtolower', $columns);

            $nameField = null;
            foreach ($nameCandidates as $candidate) {
                if (in_array(strtolower($candidate), $columnNames, true)) {
                    $nameField = $candidate;
                    break;
                }
            }

            $emailField = null;
            foreach ($emailCandidates as $candidate) {
                if (in_array(strtolower($candidate), $columnNames, true)) {
                    $emailField = $candidate;
                    break;
                }
            }

            $passwordField = null;
            foreach ($passwordCandidates as $candidate) {
                if (in_array(strtolower($candidate), $columnNames, true)) {
                    $passwordField = $candidate;
                    break;
                }
            }

            if ($emailField && $passwordField) {
                return [
                    'table' => $table,
                    'name_field' => $nameField ?? 'name',
                    'email_field' => $emailField,
                    'password_field' => $passwordField,
                ];
            }
        } catch (PDOException $e) {
            continue;
        }
    }

    return [
        'table' => 'user',
        'name_field' => 'name',
        'email_field' => 'email',
        'password_field' => 'password_hash',
    ];
}
