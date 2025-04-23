<?php

// Configurações
$apiServerUrl = "https://vitatop.tecskill.com.br/rest.php";
$appId = "Basic 50119e057567b086d83fe5dd18336042ff2cf7bef3c24807bc55e34dbe5a";

// Recebe os dados do POST
$postData = file_get_contents('php://input');
$data = json_decode($postData);

// Log para depuração
error_log("POST Data: " . $postData);
error_log("Decoded Data: " . print_r($data, true));

// Verifica se os dados foram recebidos corretamente
if (!$data || !isset($data->userName) || !isset($data->userPassword)) {
    error_log("Invalid data received");
    header("HTTP/1.1 400 Bad Request");
    echo json_encode(["error" => "Dados inválidos"]);
    exit();
}

// Dados de login
$userName = trim($data->userName ?? '');
$userPassword = trim($data->userPassword ?? '');

// Validações mínimas
if (empty($userName) || empty($userPassword)) {
    http_response_code(400);
    echo json_encode(["error" => "Usuário e senha são obrigatórios"]);
    exit();
}

// Opcional: limitar tamanho
if (strlen($userName) > 100 || strlen($userPassword) > 100) {
    http_response_code(400);
    echo json_encode(["error" => "Usuário ou senha muito longos"]);
    exit();
}

// Cabeçalhos da requisição para o backend
$headers = array(
    "Content-Type: application/json",
    "Authorization: " . $appId
);

// Dados para enviar ao backend
$requestData = json_encode(array(
    'class' => 'ApplicationAuthenticationRestService',
    'method' => 'getToken',
    'login' => $userName,
    'password' => $userPassword
));

// Configuração da requisição para o backend
$ch = curl_init($apiServerUrl);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
curl_setopt($ch, CURLOPT_POSTFIELDS, $requestData);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

// Executa a requisição e pega a resposta
$response = curl_exec($ch);

// Verifica se houve algum erro na requisição cURL
if (curl_errno($ch)) {
    error_log("cURL Error: " . curl_error($ch));
    header("HTTP/1.1 500 Internal Server Error");
    echo json_encode(["error" => "Erro na requisição: " . curl_error($ch)]);
    exit();
}

// Verifica se a resposta não está vazia
if (empty($response)) {
    error_log("Empty response from backend");
    header("HTTP/1.1 500 Internal Server Error");
    echo json_encode(["error" => "Resposta vazia do backend"]);
    exit();
}

// Retorna a resposta para o cliente
header('Content-Type: application/json');
echo $response;

// Fecha a requisição
curl_close($ch);
