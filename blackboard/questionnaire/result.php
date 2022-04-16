<?php
require_once($_SERVER['DOCUMENT_ROOT'] . "/functions.php");
$questionnaire_json = json_decode(file_get_contents("./json/" . addslashes($_GET['id']) . ".json"));
if (!isset($questionnaire_json)) die(header("Location: /404"));
define("page_title", t("questionnaire.result.title_" . addslashes($_GET['status'])) . " - " . t("questionnaire.title"));
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
    <h1><?php p("questionnaire.result.title_" . addslashes($_GET['status'])); ?></h1>
</div>
<div class="mainBlock main">
    <p style="margin-bottom: 13px;">
        <center><?php echo str_replace("{name}", $questionnaire_json->title, str_replace("{error}", (addslashes($_GET['code']) == addslashes($_GET['code']) ? t("questionnaire.result.error_code." . addslashes($_GET['code'])) : "questionnaire.result.error_code." . addslashes($_GET['code'])), t("questionnaire.result.info_" . addslashes($_GET['status'])))); ?></center>
    </p>
</div>
<?php setFooter(); ?>