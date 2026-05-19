<?php
declare(strict_types=1);

$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$trimmed = trim($uri, '/');

if ($trimmed === '') {
    require __DIR__ . '/../../../index.php';
    return;
}

$segments = explode('/', $trimmed);

if (count($segments) >= 3 && $segments[0] === 'products' && $segments[1] === 'overview') {
    $_GET['product'] = $segments[2];
    require __DIR__ . '/../../../products/overview.php';
    return;
}

$candidate = __DIR__ . '/../../..' . DIRECTORY_SEPARATOR . $trimmed;

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
require __DIR__ . '/../../../404.php';
