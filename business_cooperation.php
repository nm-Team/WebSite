<?php
require_once($_SERVER['DOCUMENT_ROOT'] . "/functions.php");
define("page_title", "business_cooperation.title");
define("page_keywords", "");
define("page_description", "business_cooperation.description");
define("page_head_css", array());
define("page_head_js", array());
define("page_body_js", array());
define("page_image", "");
define("page_update", "20241212");
setHeader();
?>
<style>
	.email-btn {
		display: inline-block;
		padding: 8px 20px;
		margin: 5px 0;
		font-size: 17px;
		font-weight: bold;
		text-align: center;
		border-radius: 4px;
		color: #000;
		background-color: #EAD050;
		text-decoration: none;
		user-select: all;
		-webkit-user-select: all;
		-moz-user-select: all;
	}
</style>
<div class="title center">
	<h1><?php p("business_cooperation.title"); ?></h1>
</div>
<div class="main">
	<div class="mainBlock">
		<p><?php p("business_cooperation.content_0"); ?></p>
		<button class="email-btn" onclick="window.location.href='mailto:business@nmteam.xyz'">business@nmteam.xyz</button>
		<p><?php p("business_cooperation.content_1"); ?></p>
	</div>
</div>
<?php setFooter(); ?>