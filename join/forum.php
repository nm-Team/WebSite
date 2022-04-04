<?php
require_once($_SERVER['DOCUMENT_ROOT'] . "/functions.php");
define("page_title", "join.join_register_page.title");
define("page_keywords", "欢迎你,加入nmTeam,招人,招贤纳财");
define("page_description", "join.join_register_page.description");
define("page_head_css", array("/src/css/join.css"));
define("page_head_js", array());
define("page_body_js", array("/src/js/join.js"));
define("page_image", "");
define("page_update", "20220331");
setHeader();
?>
<div class="title center">
    <h1><?php p("join.join_register_page.title"); ?></h1>
</div>
<div class="main">
    <div class="mainBlock">
        <p><?php p("join.join_register_page.tip"); ?></p>
    </div>
</div>
<?php setFooter(); ?>