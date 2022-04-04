<?php
require_once($_SERVER['DOCUMENT_ROOT'] . "/functions.php");
define("page_title", "supportus.title");
define("page_keywords", "支持nmTeam,support,赞助,sponsor,帮助我们,help");
define("page_description", "supportus.description");
define("page_head_css", array());
define("page_head_js", array());
define("page_body_js", array());
define("page_image", "");
define("page_update", "20220402");
setHeader();
?>
<div class="title center">
	<h1><?php p("supportus.title"); ?></h1>
</div>
<div class="main mainBlock">
	<p><?php p("supportus.para"); ?></p>
	<a href="https://afdian.net/@nmTeam" class="indexMoreLink" target="_blank"><?php p("supportus.l0"); ?></a>
	<h2><?php p("supportus.tks_supporter"); ?></h2>
</div>
<?php setFooter(); ?>