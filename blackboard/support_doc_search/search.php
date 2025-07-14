<?php
define('SEARCH_INDEX_URL', 'https://support.nmteam.xyz/search/search_index.json');

header('Content-Type: application/json');

/*
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
$searchTerms = explode(' ', strtolower($query));
$results = [];

// Search through documents
foreach ($searchIndex['docs'] as $item) {
    // Prefix
    if (!empty($location_prefix) && stripos($item['location'], $location_prefix) === false) {
        continue; // Skip this item if location prefix doesn't match
    }

    $allTermsMatch = true;

    foreach ($searchTerms as $term) {
        if (stripos($item['title'], $term) === false && stripos($item['text'], $term) === false) {
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
