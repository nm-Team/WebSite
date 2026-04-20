<?php
require_once(__DIR__ . "/config.php");
require_once(__DIR__ . "/security.php");
require_once($_SERVER['DOCUMENT_ROOT'] . "/class/mysql.php");
require_once($_SERVER['DOCUMENT_ROOT'] . "/class/redis.php");
require_once($_SERVER['DOCUMENT_ROOT'] . "/class/session.php");

$questionnaire_id = questionnaire_get_request_id();
if ($questionnaire_id === null) {
    header("Location: /404");
    exit;
}

$questionnaire_json = questionnaire_load_definition($questionnaire_id);
if ($questionnaire_json === null) {
    header("Location: /404");
    exit;
}

function questionnaire_fail_submit($questionnaire_id, $code)
{
    questionnaire_redirect_result($questionnaire_id, "error", $code);
}

$data = array();
foreach ($questionnaire_json->questions as $index => $question) {
    $question_key = 'q_' . $index;
    $raw_answer = isset($_POST[$question_key]) ? $_POST[$question_key] : null;

    $is_required = isset($question->must) && $question->must === true;
    $is_filter_bound = isset($question->filter_bind) && $question->filter_bind !== "";

    if ($is_required && !$is_filter_bound) {
        $is_empty_answer = true;
        if (is_array($raw_answer)) {
            foreach ($raw_answer as $answer_value) {
                if (is_scalar($answer_value) && trim((string)$answer_value) !== "") {
                    $is_empty_answer = false;
                    break;
                }
            }
        } elseif (is_scalar($raw_answer)) {
            $is_empty_answer = trim((string)$raw_answer) === "";
        }

        if ($is_empty_answer) {
            questionnaire_fail_submit($questionnaire_id, "EMPTY_ANSWER");
        }
    }

    if (is_array($raw_answer)) {
        $normalized_answers = array();
        foreach ($raw_answer as $answer_value) {
            if (!is_scalar($answer_value)) {
                continue;
            }

            $normalized_answers[] = (string)$answer_value;
        }

        $data[$question_key] = json_encode($normalized_answers, JSON_UNESCAPED_UNICODE);
    } else {
        $data[$question_key] = is_scalar($raw_answer) ? (string)$raw_answer : "";
    }
}

if (!empty($questionnaire_json->requireLog)) {
    $session_id = isset($_COOKIE['sessionid']) ? $_COOKIE['sessionid'] : '';
    if (!is_string($session_id) || $session_id === '' || strlen($session_id) > 128) {
        questionnaire_fail_submit($questionnaire_id, "LOG_VERIFY_ERROR");
    }

    $redis = new CodyRedis(redis_host, redis_port, redis_pass);
    $session = new CodySession($session_id, $redis);

    if (!isset($session->data['uid']) || !is_numeric($session->data['uid'])) {
        questionnaire_fail_submit($questionnaire_id, "LOG_VERIFY_ERROR");
    }

    $data['uid'] = (int)$session->data['uid'];
}

$client_ip = isset($_SERVER['REMOTE_ADDR']) ? (string)$_SERVER['REMOTE_ADDR'] : '';
$data['ip'] = substr($client_ip, 0, 255);
if ($data['ip'] === '') {
    $data['ip'] = '0.0.0.0';
}

$current_time = time();
$start_time = filter_input(INPUT_POST, 'starttime', FILTER_VALIDATE_INT);
if ($start_time === false || $start_time === null) {
    $start_time = $current_time;
}
if ($start_time > ($current_time + 60) || $start_time < ($current_time - 86400)) {
    $start_time = $current_time;
}

$data['starttime'] = $start_time;
$data['submittime'] = $current_time;

$sql = "CREATE TABLE IF NOT EXISTS `" . $questionnaire_id . "`(";
$sql .= "`aid` int(11) NOT NULL AUTO_INCREMENT,";
if (!empty($questionnaire_json->requireLog)) {
    $sql .= "`uid` int(11) NOT NULL,";
}
$sql .= "`ip` varchar(255) NOT NULL,";
$sql .= "`starttime` int(11) NOT NULL,";
$sql .= "`submittime` int(11) NOT NULL,";
foreach ($questionnaire_json->questions as $index => $question) {
    $column_type = (isset($question->type) && $question->type === "multiple") ? "json" : "text";
    $sql .= "`q_" . (int)$index . "` " . $column_type . ",";
}
$sql .= "PRIMARY KEY (`aid`)";
$sql .= ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

$db = new CodyMySQL(mysql_host, mysql_port, mysql_user, mysql_pass, mysql_database);
if (!$db->query($sql)) {
    questionnaire_fail_submit($questionnaire_id, "SERVER_ERROR");
}

if (!empty($questionnaire_json->requireLog) && isset($questionnaire_json->limit) && (int)$questionnaire_json->limit > 0) {
    $sql = "SELECT COUNT(*) AS total FROM `" . $questionnaire_id . "` WHERE `uid` = " . (int)$data['uid'];
    $res = $db->get($sql);
    if (!$res || (int)$res[0]['total'] >= (int)$questionnaire_json->limit) {
        questionnaire_fail_submit($questionnaire_id, "REACH_ACCOUNT_LIMIT");
    }
}

$escaped_ip = $db->escape($data['ip']);
$sql = "SELECT COUNT(*) AS total FROM `" . $questionnaire_id . "` WHERE `ip` = '" . $escaped_ip . "' AND `submittime` > " . ($data['submittime'] - 600);
$res = $db->get($sql);
if ($res && (int)$res[0]['total'] > 0) {
    questionnaire_fail_submit($questionnaire_id, "REACH_IP_LIMIT");
}

if (!$db->insert($data, $questionnaire_id)) {
    questionnaire_fail_submit($questionnaire_id, "SERVER_ERROR");
}

questionnaire_redirect_result($questionnaire_id, "success", "SUCCESS");
