<?php
require_once($_SERVER['DOCUMENT_ROOT'] . "/functions.php");
$questionnaire_json = json_decode(file_get_contents("./json/" . addslashes($_GET['id']) . ".json"));
if (!isset($questionnaire_json)) die(header("Location: /404"));
define("page_title", $questionnaire_json->title . " - " . t("questionnaire.title"));
define("page_keywords", "");
define("page_description", $questionnaire_json->description . "questionnaire.description");
define("page_head_css", array("/src/css/questionnaire.css"));
define("page_head_js", array());
define("page_body_js", array("/src/js/questionnaire.js"));
define("page_image", "");
define("page_update", "$questionnaire_json->time");
setHeader();
?>
<script>
    questionnaireI18n = <?php echo json_encode(t("questionnaire")); ?>;
    requireLog = <?php echo $questionnaire_json->requireLog ? "true" : "false"; ?>;
    var quesAnswerList = [];
</script>
<div class="title center">
    <h1><?php echo $questionnaire_json->title; ?></h1>
</div>
<form class="main" id="mainForm" method="POST" action="submit.php?id=<?php echo $_GET['id']; ?>" onsubmit="return false;">
    <div class="questionnaireDescription">
        <?php echo $questionnaire_json->description; ?>
        <?php
        if (isset($questionnaire_json->requireLog) && isset($questionnaire_json->limit)) {
            echo '<div class="limit">' . str_replace("{t}", $questionnaire_json->limit, t("questionnaire.limit")) . '</div>';
        }
        ?>
    </div>
    <?php
    if ($questionnaire_json->requireLog) {
    ?><div class="question" id="sessionDiv" data-type="input" style="display: none;">
            <div class="questionTitle">
                <p class="mustAnswer"></p>
                <p id="sessionNameP"><?php p("questionnaire.account.title"); ?></p>
            </div>
            <div class="questionDescription"><?php p("questionnaire.account.description"); ?></div>
            <div class="questionAnswers">
                <input id="sessionid" name="sessionid" style="display: none;" data-type="text" type="text" readonly class="answer" placeholder="Loading">
            </div>
        </div><?php
            }
            foreach ($questionnaire_json->questions as $index => $question) {
                ?>
        <div class="question" id="q_<?php echo $index; ?>" <?php echo $question->id?'data-filter-id="'.$question->id.'" ':""; ?> <?php echo $question->filter_bind?' data-filter-bind="'.$question->filter_bind.'" ':""; ?> <?php echo $question->filter_value?' style="display: none" data-filter-value="'.$question->filter_value.'" ':""; ?> data-type="<?php echo $question->type; ?>" data-qid="<?php echo $index; ?>" data-must-answer="<?php echo ($question->must ? "true" : "false"); ?>" <?php echo ($question->type == "multiple" && (isset($question->max_num) || isset($question->min_num)) ? "data-num-limit='" . str_replace("{max}", (isset($question->max_num) ? $question->max_num : count($question->answers)), str_replace("{min}", (isset($question->min_num) ? $question->min_num : "1"), "{min},{max}")) . "'" : ""); ?>>
            <div class="questionTitle">
                <p class="mustAnswer"><?php echo ($question->must ? "*" : ""); ?></p>
                <p><?php echo ($question->type == "multiple" ? "<span class='tTip'>[" . t("questionnaire.multiple") . "] </span>" : ""); ?><?php echo $question->title; ?></p>
            </div>
            <div class="questionDescription">
                <?php echo (isset($question->description) && !empty($question->description) ? $question->description : ""); ?>
                <?php echo ($question->type == "multiple" && isset($question->max_num) || isset($question->min_num) ? "<p>" . str_replace("{max}", (isset($question->max_num) ? $question->max_num : count($question->answers)), str_replace("{min}", (isset($question->min_num) ? $question->min_num : "1"), ($question->min_num == $question->max_num ? t("questionnaire.select_sin_limit") : t("questionnaire.select_num_limit")))) . "</p>" : ""); ?>
                <p class="dTip"></p>
            </div>
            <div class="questionAnswers">
                <?php
                switch ($question->type) {
                    case "input":
                    case "textarea":
                        echo "<" . $question->type . " data-type='text' name='q_" . $index . "' type='" . (isset($question->filter) ? $question->filter : "text") . "' class='answer' placeholder='" . $question->placeholder . "'></" . $question->type . ">";
                        break;
                    case "single":
                    case "multiple":
                        foreach ($question->answers as $answer) {
                            echo "<label class='input' for='" . $index . "_" . $answer->value . "'><input id='" . $index . "_" . $answer->value . "' type='" . ($question->type == "single" ? "radio" : "checkbox") . "' name='q_" . $index . ($question->type == "multiple" ? "[]" : "") . "' value='" . $answer->value . "'>" . $answer->text . "</label>";
                        }
                }
                ?>
            </div>
        </div>
        <script>
            quesAnswerList.push(<?php echo ($question->must ? "false" : "true"); ?>);
        </script>
    <?php
            }
    ?>
    <input id="starttime" name="starttime" style="display: none;" data-type="text" type="text" readonly class="answer" placeholder="Loading" value="<?php echo time(); ?>">
    <div class="submitDiv">
        <button type="button" onclick="submitQue();"><?php echo t("questionnaire.submit"); ?></button>
    </div>
</form>
<div id="logRequireDiv" class="mainBlock main" style="display: none;">
    <p style="margin-bottom: 13px;">
        <center><?php p("questionnaire.log_require"); ?></center>
    </p>
    <div class="submitDiv">
        <button class="submit" type="button" onclick="accountBox.click();"><?php echo t("account.click_to_log"); ?></button>
    </div>
</div>
<div id="logErrDiv" class="mainBlock main" style="display: none;">
    <p style="margin-bottom: 13px;">
        <center><?php p("questionnaire.account.error"); ?></center>
    </p>
    <div class="submitDiv">
    </div>
</div>
<?php setFooter(); ?>