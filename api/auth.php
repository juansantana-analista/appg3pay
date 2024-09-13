<?php

// Configurações
$apiServerUrl = "https://escritorio.g3pay.com.br/rest.php";
$appId = "Basic 50119e057567b086d83fe5dd18336042ff2cf7bef3c24807bc55e34dbe5a";

// Verifica se os dados foram enviados via POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtém os parâmetros
    $userName = isset($_POST['parametro1']) ? $_POST['parametro1'] : '';
    $userPassword = isset($_POST['parametro2']) ? $_POST['parametro2'] : '';
    if($userName && $userPassword) {
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
            header("HTTP/1.1 500 Internal Server Error");
            echo "Erro na requisição: " . curl_error($ch);
            exit();
        }
        
        // Retorna a resposta para o cliente
        echo $response;
        
        // Fecha a requisição
        curl_close($ch);
    }
}