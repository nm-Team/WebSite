<?php
define('SEARCH_INDEX_URL', 'https://support.nmteam.xyz/search/search_index.json');

header('Content-Type: application/json');

/*
    Search API Documentation:
    
    Parameters:
    - query: Search query string (required, 2-255 characters)
    - location_prefix: Filter results by location prefix (optional)
    - use_regex: Enable regex mode for search terms (optional, default: false)
    
    Usage:
    1. Normal search: search.php?query=nmTeam 支持
    2. With location filter: search.php?query=产品&location_prefix=#_1
    3. Regex search: search.php?query=nm\w+&use_regex=true
    4. Multiple regex terms: search.php?query=nm\w+ 支持.*文档&use_regex=true
    
    Search index format:
{
  "config": {
    "lang": [
      "en"
    ],
    "separator": "[\\s\\u200b\\u3000\\-、。，．？！；]+",
    "pipeline": [
      "stemmer"
    ]
  },
  "docs": [
    {
      "location": "",
      "title": "nmTeam 支持",
      "text": "nmTeam 支持 \u003Cp\u003E在此获取 nmTeam 旗下产品的支持。\u003C/p\u003E \u003Cp\u003E"
    },
    {
      "location": "#_1",
      "title": "产品和服务",
      "text": "nmBot nmTeam 账号 联系方式 \u003Cp\u003E"
    },
    ...
    ]
}
*/

// Get query parameter
$query = isset($_GET['query']) ? trim($_GET['query']) : '';

$location_prefix = isset($_GET['location_prefix']) ? trim($_GET['location_prefix']) : '';

// Get regex mode parameter (default: false for backward compatibility)
$useRegex = isset($_GET['use_regex']) && $_GET['use_regex'] === 'true';

// Validate query
if (empty($query)) {
  die(json_encode(['status' => 'error', 'message' => 'QUERY_EMPTY']));
}

// Validate query length
if (strlen($query) < 2 || strlen($query) > 255) {
  die(json_encode(['status' => 'error', 'message' => 'QUERY_LENGTH_ERROR']));
}

// Fetch search index
$searchIndex = @file_get_contents(SEARCH_INDEX_URL);

if ($searchIndex === false) {
  die(json_encode(['status' => 'error', 'message' => 'SEARCH_INDEX_FETCH_ERROR']));
}

$searchIndex = json_decode($searchIndex, true);

// Process search query, case-insensitive, divide by space
$searchTerms = explode(' ', $query);
$results = [];

// Validate regex patterns if using regex mode
if ($useRegex) {
  foreach ($searchTerms as $term) {
    if (@preg_match('/' . $term . '/ui', '') === false) {
      die(json_encode(['status' => 'error', 'message' => 'INVALID_REGEX_PATTERN', 'invalid_term' => $term]));
    }
  }
}

// Search through documents
foreach ($searchIndex['docs'] as $item) {
  // Prefix
  if (!empty($location_prefix) && stripos($item['location'], $location_prefix) === false) {
    continue; // Skip this item if location prefix doesn't match
  }

  $allTermsMatch = true;

  foreach ($searchTerms as $term) {
    $titleMatch = false;
    $textMatch = false;

    if ($useRegex) {
      // Use regex matching with case-insensitive and unicode flags
      $titleMatch = preg_match('/' . $term . '/ui', $item['title']);
      $textMatch = preg_match('/' . $term . '/ui', $item['text']);
    } else {
      // Use simple string matching (original behavior)
      $titleMatch = stripos($item['title'], $term) !== false;
      $textMatch = stripos($item['text'], $term) !== false;
    }

    if (!$titleMatch && !$textMatch) {
      $allTermsMatch = false;
      break; // No need to check other terms if one doesn't match
    }
  }

  if ($allTermsMatch) {
    $results[] = $item;
  }
}

// Prepare response
$response = [
  'status' => 'success',
  'query' => $query,
  'results' => $results
];
// Return JSON response
echo json_encode($response);
// End of script
