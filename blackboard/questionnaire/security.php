<?php

function questionnaire_escape_html($value)
{
  return htmlspecialchars((string)$value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function questionnaire_is_valid_id($id)
{
  return is_string($id) && preg_match('/^[A-Za-z0-9_]{1,64}$/', $id) === 1;
}

function questionnaire_get_request_id()
{
  if (!isset($_GET['id']) || !questionnaire_is_valid_id($_GET['id'])) {
    return null;
  }

  return $_GET['id'];
}

function questionnaire_get_json_path($questionnaire_id)
{
  if (!questionnaire_is_valid_id($questionnaire_id)) {
    return null;
  }

  $base_dir = realpath(__DIR__ . '/json');
  if ($base_dir === false) {
    return null;
  }

  $file_path = $base_dir . DIRECTORY_SEPARATOR . $questionnaire_id . '.json';
  $real_path = realpath($file_path);
  if ($real_path === false) {
    return null;
  }

  if (strpos($real_path, $base_dir . DIRECTORY_SEPARATOR) !== 0) {
    return null;
  }

  return $real_path;
}

function questionnaire_load_definition($questionnaire_id)
{
  $json_path = questionnaire_get_json_path($questionnaire_id);
  if ($json_path === null) {
    return null;
  }

  $json_content = file_get_contents($json_path);
  if ($json_content === false) {
    return null;
  }

  $decoded = json_decode($json_content);
  if (!is_object($decoded) || !isset($decoded->questions) || !is_array($decoded->questions)) {
    return null;
  }

  return $decoded;
}

function questionnaire_redirect_result($questionnaire_id, $status, $code)
{
  $query = http_build_query(array(
    'id' => $questionnaire_id,
    'status' => $status,
    'code' => $code
  ));

  header('Location: result.php?' . $query);
  exit;
}
