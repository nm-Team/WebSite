<?php
require_once($_SERVER['DOCUMENT_ROOT'] . "/functions.php");
define("page_title", "about.title");
define("page_keywords", "");
define("page_description", "about.description");
define("page_head_css", array());
define("page_head_js", array());
define("page_body_js", array());
define("page_image", "");
define("page_update", "20220303");
setHeader();
?>
<style>
	.introImage {
		margin: 30px auto;
		max-width: 550px;
	}
</style>
<div class="title center">
	<h1><?php p("about.title"); ?></h1>
</div>
<div class="main">
	<h2><?php p("about.h0"); ?></h2>
	<div class="mainBlock">
		<h1><?php p("about.h1"); ?></h1>
		<p><?php p("about.0"); ?></p>
		<p><?php p("about.1"); ?></p>
		<p><?php p("about.2"); ?></p>
		<p><?php p("about.3"); ?></p>
		<p><?php p("about.4"); ?></p>
		<p><?php p("about.5"); ?></p>
		<center><img class="introImage" src="https://websiteres.nmteam.xyz/nmwebsite/img/nmteam-about-small.png" width="70%"></center>
	</div>
</div>
<div class="main">
	<div class="mainBlock" id="join">
		<h1><?php p("about.h2"); ?></h1>
		<p><?php p("about.6"); ?></p>
		<p><?php p("about.7"); ?></p>
		<a href="/join/" class="indexMoreLink"><?php p("about.8"); ?></a>
	</div>
</div>
<?php setFooter(); ?>