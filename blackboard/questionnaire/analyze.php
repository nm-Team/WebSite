<?php
require_once($_SERVER['DOCUMENT_ROOT'] . "/functions.php");
require_once("./config.php");
require_once($_SERVER['DOCUMENT_ROOT'] . "/class/mysql.php");
require_once($_SERVER['DOCUMENT_ROOT'] . "/class/redis.php");
require_once($_SERVER['DOCUMENT_ROOT'] . "/class/session.php");
?><span style="display: none;"><?php
                                $questionnaire_json = json_decode(file_get_contents("./json/" . addslashes($_GET['id']) . ".json"));
                                ?></span>
<?php if (!isset($questionnaire_json)) {
    $questionnaire_json = array("title" => t("questionnaire.backstage.tip.not_found"), "description" => "");
    $error_code = "not_found";
}
define("page_title", $questionnaire_json->title . " - " . t("questionnaire.backstage.title"));
define("page_keywords", "");
define("page_description", $questionnaire_json->description . t("questionnaire.description"));
define("page_head_css", array("/src/css/questionnaire.css", "/src/css/questionnaire_backstage.css"));
define("page_head_js", array("/src/js/chart.min.js"));
define("page_body_js", array("/src/js/tab.js"));
define("page_image", "");
define("page_update", "");
setHeader();
$ana_start = microtime(true);
$redis = new CodyRedis(redis_host, redis_port, redis_pass);
$session = new CodySession(addslashes($_COOKIE['sessionid']), $redis);

if (!isset($session->data['uid'])) {
    $error_code = "not_log";
} else {
    $uid = $session->data['uid'];
    if ($session->data['admin'] != "1") {
        $error_code = "not_admin";
    }
}
?>
<script>
    questionnaireI18n = <?php echo json_encode(t("questionnaire")); ?>;
</script>
<div class="title center">
    <h1><?php p("questionnaire.backstage.title") ?></h1>
</div>
<?php
if (isset($error_code)) {
?>

    <div class="mainBlock main">
        <p style="margin-bottom: 13px;">
            <center><?php p("questionnaire.backstage.tip.$error_code"); ?></center>
        </p>
    </div>
<?php
    die(setFooter());
};

$db = new CodyMySQL(mysql_host, mysql_port, mysql_user, mysql_pass, mysql_database);
$sql = "SELECT * FROM `" . addslashes($_GET['id']) . "` WHERE 1";
$data = $db->get($sql);
// print_r($data);

?>
<div class="mainBlock main">
    <p><b><?php p("questionnaire.backstage.name"); ?></b><?php echo $questionnaire_json->title; ?></p>
    <br>
    <p><a href="<?php echo 'https://' . $_SERVER['SERVER_NAME'] . '/blackboard/questionnaire/' . addslashes($_GET['id']); ?>"><?php p("questionnaire.backstage.link"); ?></a> </p>
    <br>
    <div class="tabView" id="sTab">
        <div class="tabHeader">
            <button data-tab="a"><?php p("questionnaire.backstage.data_type.analyze"); ?></button>
            <button data-tab="o"><?php p("questionnaire.backstage.data_type.origin"); ?></button>
            <button data-tab="p"><?php p("questionnaire.backstage.data_type.preview"); ?></button>
            <button data-tab="j"><?php p("questionnaire.backstage.data_type.JSON"); ?></button>
        </div>
        <div class="tabContents">
            <div class="content" data-tab="a">
                <h2><?php p("questionnaire.backstage.data_type.analyze"); ?></h2>
                <h3><?php p("questionnaire.backstage.analyze.overview"); ?></h3>
                <div class="overview">
                    <div class="overviewBlock">
                        <p class="num"><?php echo count($data); ?></p>
                        <p class="otitle"><?php p("questionnaire.backstage.analyze.result_num"); ?></p>
                    </div>
                    <div class="overviewBlock">
                        <p class="num"><?php
                                        $t_sum = 0;
                                        foreach ($data as $d) {
                                            $t_sum += $d['submittime'] - $d['starttime'];
                                        }
                                        echo (int)($t_sum / count($data));
                                        ?>s</p>
                        <p class="otitle"><?php p("questionnaire.backstage.analyze.time"); ?></p>
                    </div>
                </div>
                <h3><?php p("questionnaire.backstage.analyze.detail"); ?></h3>
                <?php
                foreach ($questionnaire_json->questions as $index => $question) {
                ?>
                    <div class="question" id="ana_q_<?php echo $index; ?>" data-type="<?php echo $question->type; ?>" data-qid="<?php echo $index; ?>" data-must-answer="<?php echo ($question->must ? "true" : "false"); ?>" <?php echo ($question->type == "multiple" && (isset($question->max_num) || isset($question->min_num)) ? "data-num-limit='" . str_replace("{max}", (isset($question->max_num) ? $question->max_num : count($question->answers)), str_replace("{min}", (isset($question->min_num) ? $question->min_num : "1"), "{min},{max}")) . "'" : ""); ?>>
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
                            <?php if ($question->type == "single" || $question->type == "multiple") { ?>
                                <canvas class="chart" id="anaChart_<?php echo $index; ?>"></canvas>
                                <script>
                                    var ctx = document.getElementById('anaChart_<?php echo $index; ?>').getContext('2d');
                                    var chart = new Chart(ctx, {
                                        // 要创建的图表类型
                                        type: '<?php echo ($question->type == "single" ? "pie" : "bar"); ?>',
                                        // 数据集
                                        data: {
                                            labels: [
                                                <?php
                                                foreach ($question->answers as $answer) {
                                                ?> "<?php echo $answer->text; ?>",
                                                <?php
                                                }
                                                ?>
                                            ],
                                            datasets: [{
                                                label: "<?php echo $question->title; ?>",
                                                backgroundColor: ['#EAD050', <?php if ($question->type == "single") { ?> '#E8C200', '#9C8648', '#624F42'
                                                    <?php } ?>
                                                ],
                                                data: [
                                                    <?php
                                                    foreach ($question->answers as $answer) {
                                                    ?> <?php
                                                        $count = 0;
                                                        foreach ($data as $d) {
                                                            if (($question->type == "single" && $answer->value == (string)$d["q_" . $index])
                                                                || ($question->type != "single" && in_array($answer->value, (json_decode($d["q_$index"]) !== null ? json_decode($d["q_$index"]) : array())))
                                                            ) {
                                                                $count++;
                                                            }
                                                        }
                                                        echo $count;
                                                        ?>,
                                                    <?php
                                                    }
                                                    ?>
                                                ],
                                            }]
                                        },

                                        // 配置选项
                                        options: {}
                                    });
                                </script>
                            <?php } else {
                            }
                            ?>
                        </div>
                    </div>
                <?php
                }
                ?>
            </div>
            <div class="content" data-tab="o">
                <h2><?php p("questionnaire.backstage.data_type.origin"); ?></h2>
                <?php
                foreach (array_reverse($data) as $d) {
                ?>
                    <details>
                        <summary class="oSummary">
                            <?php
                            if ($questionnaire_json->requireLog == true) {
                            ?><b><?php p("questionnaire.backstage.origin.uid"); ?>: </b><?php echo $d['uid']; ?>&Tab;
                            <?php
                            }
                            ?>
                            <b><?php p("questionnaire.backstage.origin.id"); ?>: </b><?php echo $d['aid']; ?>&Tab;
                            <b><?php p("questionnaire.backstage.origin.ip"); ?>: </b><?php echo $d['ip']; ?>
                            <br>
                            <b><?php p("questionnaire.backstage.origin.submit_time"); ?>: </b><?php echo date("Y-m-d H:i:s", $d['submittime']); ?>&Tab;
                            <!-- <b><?php p("questionnaire.backstage.origin.start_time"); ?>: </b><?php echo date("Y-m-d H:i:s", $d['starttime']); ?>&nbsp;&nbsp;&nbsp; -->
                            <b><?php p("questionnaire.backstage.origin.time"); ?>: </b><?php echo ($d['submittime'] - $d['starttime']); ?>s
                        </summary>
                        <div>
                            <?php
                            foreach ($questionnaire_json->questions as $index => $question) {
                            ?>
                                <div class="question" id="q_<?php echo $index; ?>" data-type="<?php echo $question->type; ?>" data-qid="<?php echo $index; ?>" data-must-answer="<?php echo ($question->must ? "true" : "false"); ?>" <?php echo ($question->type == "multiple" && (isset($question->max_num) || isset($question->min_num)) ? "data-num-limit='" . str_replace("{max}", (isset($question->max_num) ? $question->max_num : count($question->answers)), str_replace("{min}", (isset($question->min_num) ? $question->min_num : "1"), "{min},{max}")) . "'" : ""); ?>>
                                    <div class="questionTitle">
                                        <p class="mustAnswer"><?php echo ($question->must ? "*" : ""); ?></p>
                                        <p><?php echo ($question->type == "multiple" ? "<span class='tTip'>[" . t("questionnaire.multiple") . "] </span>" : ""); ?><?php echo $question->title; ?></p>
                                    </div>
                                    <div class="questionDescription">
                                        <?php echo (isset($question->description) && !empty($question->description) ? $question->description : ""); ?>
                                    </div>
                                    <div class="questionAnswers">
                                        <?php
                                        echo "<b>" . t("questionnaire.backstage.origin.answer") . ":</b> ";
                                        switch ($question->type) {
                                            case "input":
                                            case "textarea":
                                                echo "<p>" . $d["q_$index"] . "</p>";
                                                break;
                                            case "single":
                                                foreach ($question->answers as $answer) {
                                                    if (in_array($answer->value, (array)$d["q_$index"])) echo "<p>" . $answer->text . "</p>";
                                                }
                                                break;
                                            case "multiple":
                                                foreach ($question->answers as $answer) {
                                                    if ($d["q_$index"] && in_array($answer->value, json_decode($d["q_$index"]))) echo "<p>" . $answer->text . "</p>";
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
                        </div>
                    </details>
                <?php
                }
                ?>
            </div>
            <div class="content" data-tab="p">
                <h2><?php p("questionnaire.backstage.data_type.preview"); ?></h2>
                <?php
                foreach ($questionnaire_json->questions as $index => $question) {
                ?>
                    <div class="question" id="q_<?php echo $index; ?>" data-type="<?php echo $question->type; ?>" data-qid="<?php echo $index; ?>" data-must-answer="<?php echo ($question->must ? "true" : "false"); ?>" <?php echo ($question->type == "multiple" && (isset($question->max_num) || isset($question->min_num)) ? "data-num-limit='" . str_replace("{max}", (isset($question->max_num) ? $question->max_num : count($question->answers)), str_replace("{min}", (isset($question->min_num) ? $question->min_num : "1"), "{min},{max}")) . "'" : ""); ?>>
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
            </div>
            <div class="content" data-tab="j">
                <h2><?php p("questionnaire.backstage.data_type.JSON"); ?></h2>
                <pre><?php echo file_get_contents("./json/" . addslashes($_GET['id']) . ".json"); ?></pre>
            </div>
        </div>
    </div>
</div>
<?php
$ana_end = microtime(true);
echo '<div class="updateDate">' . t("questionnaire.backstage.gentime") . (($ana_end - $ana_start) * 1000) . 'ms</div>';
?>
<?php setFooter(); ?>
<script>
    focusTab($("#sTab"), "a");
</script>