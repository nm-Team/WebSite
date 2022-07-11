<?php
require_once("config.php");
require_once($_SERVER['DOCUMENT_ROOT'] . "/class/mysql.php");
require_once($_SERVER['DOCUMENT_ROOT'] . "/class/redis.php");
require_once($_SERVER['DOCUMENT_ROOT'] . "/class/session.php");
$questionnaire_json = json_decode(file_get_contents("./json/" . addslashes($_GET['id']) . ".json"));

$data = array();
foreach ($questionnaire_json->questions as $index => $question) {
    if ($question->must == true && str_replace(" ", "", $_POST['q_' . $index]) == "") {
        if (!$question->filter_bind) {
            die(header("Location: result.php?id=" . addslashes($_GET['id'])  . "&status=error&code=EMPTY_ANSWER"));
        }
    }
    if (is_array($_POST['q_' . $index])) {
        $data['q_' . $index] = array();
        foreach ($_POST['q_' . $index] as $index2 => $d) {
            $data['q_' . $index][] = addslashes($d);
        }
        $data['q_' . $index] = json_encode($data['q_' . $index]);
    } else {
        $data['q_' . $index] = addslashes($_POST['q_' . $index]);
    }
}

if ($questionnaire_json->requireLog) {
    $redis = new CodyRedis(redis_host, redis_port, redis_pass);
    $session = new CodySession(addslashes($_POST['sessionid']), $redis);

    if (!isset($session->data['uid'])) {
        die(header("Location: result.php?id=" . addslashes($_GET['id'])  . "&status=error&code=LOG_VERIFY_ERROR"));
    } else {
        $data['uid'] = $session->data['uid'];
    }
}

$data['ip'] = isset($_SERVER['HTTP_CLIENT_IP'])
    ? $_SERVER['HTTP_CLIENT_IP']
    : (isset($_SERVER['HTTP_X_FORWARDED_FOR'])
        ? $_SERVER['HTTP_X_FORWARDED_FOR']
        : $_SERVER['REMOTE_ADDR']);

$data['starttime'] = addslashes($_POST['starttime']);
$data['submittime'] = time();

$sql = "CREATE TABLE IF NOT EXISTS `" . addslashes($_GET['id']) . "`(";
$sql .= "`aid` int(11) NOT NULL AUTO_INCREMENT,";
if ($questionnaire_json->requireLog) {
    $sql .= "`uid` int(11) NOT NULL,";
}
$sql .= "`ip` varchar(255) NOT NULL,";
$sql .= "`starttime` int(11) NOT NULL,";
$sql .= "`submittime` int(11) NOT NULL,";
foreach ($questionnaire_json->questions as $index => $question) {
    if (is_array($data['q_' . $index]))
        $sql .= "`q_" . $index . "` json,";
    else $sql .= "`q_" . $index . "` text,";
}
$sql .= "PRIMARY KEY (`aid`)";
$sql .= ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

$db = new CodyMySQL(mysql_host, mysql_port, mysql_user, mysql_pass, mysql_database);
$db->query($sql);

if ($questionnaire_json->requireLog && isset($questionnaire_json->limit) && $questionnaire_json->limit > 0) {
    $sql = "SELECT COUNT(*) FROM `" . addslashes($_GET['id']) . "` WHERE `uid` = " . $data['uid'];
    $res = $db->get($sql);
    if ($res[0]['COUNT(*)'] >= $questionnaire_json->limit) {
        echo "REACH_ACCOUNT_LIMIT";
        die(header("Location: result.php?id=" . addslashes($_GET['id'])  . "&status=error&code=REACH_ACCOUNT_LIMIT"));
    }
}

$sql = "SELECT COUNT(*) FROM `" . addslashes($_GET['id']) . "` WHERE `ip` = '" . $data['ip'] . "' AND `submittime` > " . ($data['starttime'] - 600);
$res = $db->get($sql);
if ($res[0]['COUNT(*)'] > 0) {
    echo "REACH_IP_LIMIT";
    die(header("Location: result.php?id=" . addslashes($_GET['id'])  . "&status=error&code=REACH_IP_LIMIT"));
}
echo $db->insert($data, addslashes($_GET['id']));

header("Location: result.php?id=" . addslashes($_GET['id'])  . "&status=success&code=SUCCESS");
