<?php
require_once($_SERVER['DOCUMENT_ROOT'] . "/functions.php");
require_once(__DIR__ . "/security.php");

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

$status = isset($_GET['status']) && in_array($_GET['status'], array('success', 'error'), true)
    ? $_GET['status']
    : 'error';
$code = isset($_GET['code']) && preg_match('/^[A-Z0-9_]{1,64}$/', $_GET['code']) === 1
    ? $_GET['code']
    : 'UNKNOWN_ERROR';

define("page_title", t("questionnaire.result.title_" . $status) . " - " . t("questionnaire.title"));
define("page_keywords", "");
define("page_description", $questionnaire_json->description . t("questionnaire.description"));
define("page_head_css", array("/src/css/questionnaire.css"));
define("page_head_js", array());
define("page_body_js", array("/src/js/questionnaire.js"));
define("page_image", "");
define("page_update", "$questionnaire_json->time");
setHeader();
?>
<script>
    questionnaireI18n = <?php echo json_encode(t("questionnaire")); ?>;
</script>
<div class="title center">
    <h1><?php p("questionnaire.result.title_" . $status); ?></h1>
</div>
<div class="mainBlock main">
    <p style="margin-bottom: 13px;">
        <center><?php
                $error_text_key = "questionnaire.result.error_code." . $code;
                $error_text = t($error_text_key);
                if ($error_text === $error_text_key) {
                    $error_text = $code;
                }

                $info_text = t("questionnaire.result.info_" . $status);
                $result_text = str_replace(
                    "{name}",
                    (string)$questionnaire_json->title,
                    str_replace("{error}", $error_text, $info_text)
                );
                echo questionnaire_escape_html($result_text);
                ?></center>
    </p>
</div>
<?php setFooter(); ?>