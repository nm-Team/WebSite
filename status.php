<?php
require_once($_SERVER['DOCUMENT_ROOT'] . "/functions.php");
define("page_title", "status_page.title");
define("page_keywords", "系统状态,status,service,服务状态,SLA");
define("page_description", "status_page.description");
define("page_head_css", array());
define("page_head_js", array());
define("page_body_js", array());
define("page_image", "");
define("page_update", "");
setHeader();
?>
<div class="title center">
	<h1><?php p("status_page.title"); ?></h1>
</div>
<div class="main">
	<p>
		<center><?php p("status_page.redirecting"); ?></center>
	</p>
</div>
<?php setFooter(); ?>
<script>
	window.location.href = "https://status.nmteam.xyz";
</script>