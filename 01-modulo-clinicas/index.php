<?php
/**
 * Hospital 360 — Módulo Clínicas & OpenEMR Entrypoint
 */
header('Content-Type: application/json; charset=utf-8');

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($uri === '/health') {
    echo json_encode([
        'status' => 'healthy',
        'module' => '01-modulo-clinicas',
        'service' => 'OpenEMR Gateway',
        'version' => 'v7.0-rn-ind',
        'timestamp' => date('c')
    ]);
    exit;
}

if ($uri === '/api/triagem') {
    $input = json_decode(file_get_contents('php://input'), true);
    echo json_encode([
        'success' => true,
        'encounter_id' => rand(1000, 9999),
        'status' => 'AGUARDANDO_CONSULTORIO',
        'timestamp' => date('c')
    ]);
    exit;
}

echo json_encode([
    'service' => 'Hospital 360 - Modulo Clinicas (OpenEMR Gateway)',
    'status' => 'running',
    'endpoints' => ['/health', '/api/triagem']
]);
