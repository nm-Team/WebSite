<?php
declare(strict_types=1);

ini_set('display_errors', '0');
error_reporting(E_ALL & ~E_WARNING & ~E_NOTICE & ~E_DEPRECATED);

$projectRoot = realpath(__DIR__ . '/../../..');
if ($projectRoot === false) {
    http_response_code(500);
    echo 'Router bootstrap failed: project root not found.';
    return;
}

$_SERVER['DOCUMENT_ROOT'] = $projectRoot;

$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$trimmed = trim($uri, '/');
$requestPath = str_replace('/', DIRECTORY_SEPARATOR, ltrim($uri, '/'));
$staticCandidate = $projectRoot . DIRECTORY_SEPARATOR . $requestPath;

if ($requestPath !== '' && is_file($staticCandidate)) {
    $resolvedStatic = realpath($staticCandidate);
    if ($resolvedStatic === false || !str_starts_with($resolvedStatic, $projectRoot . DIRECTORY_SEPARATOR)) {
        http_response_code(403);
        echo 'Forbidden';
        return;
    }
    $extension = strtolower(pathinfo($staticCandidate, PATHINFO_EXTENSION));
    $mimeTypes = [
        'css' => 'text/css; charset=UTF-8',
        'js' => 'application/javascript; charset=UTF-8',
        'json' => 'application/json; charset=UTF-8',
        'svg' => 'image/svg+xml',
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif' => 'image/gif',
        'webp' => 'image/webp',
        'ico' => 'image/x-icon',
        'woff' => 'font/woff',
        'woff2' => 'font/woff2',
        'ttf' => 'font/ttf',
        'otf' => 'font/otf',
        'txt' => 'text/plain; charset=UTF-8',
        'xml' => 'application/xml; charset=UTF-8',
        'pdf' => 'application/pdf',
    ];
    if (array_key_exists($extension, $mimeTypes)) {
        header('Content-Type: ' . $mimeTypes[$extension]);
    }
    readfile($resolvedStatic);
    return;
}

if ($trimmed === '') {
    require $projectRoot . DIRECTORY_SEPARATOR . 'index.php';
    return;
}

$segments = explode('/', $trimmed);

$aliases = [
    'business-cooperation' => 'business_cooperation.php',
];

if (array_key_exists($trimmed, $aliases)) {
    require $projectRoot . DIRECTORY_SEPARATOR . $aliases[$trimmed];
    return;
}

if (count($segments) >= 3 && $segments[0] === 'products' && $segments[1] === 'overview') {
    $_GET['product'] = $segments[2];
    require $projectRoot . DIRECTORY_SEPARATOR . 'products' . DIRECTORY_SEPARATOR . 'overview.php';
    return;
}

$candidate = $projectRoot . DIRECTORY_SEPARATOR . $trimmed;

if (is_dir($candidate)) {
    $index = $candidate . DIRECTORY_SEPARATOR . 'index.php';
    if (is_file($index)) {
        require $index;
        return;
    }
}

if (!str_ends_with($candidate, '.php')) {
    $candidate .= '.php';
}

if (is_file($candidate)) {
    require $candidate;
    return;
}

http_response_code(404);
require $projectRoot . DIRECTORY_SEPARATOR . '404.php';
