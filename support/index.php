<?php
require_once($_SERVER['DOCUMENT_ROOT'] . "/functions.php");
define("page_title", "support.title");
define("page_keywords", "");
define("page_description", "support.description");
define("page_head_css", array());
define("page_head_js", array());
define("page_body_js", array("/src/js/tab.js"));
define("page_image", "");
define("page_update", "20240718");
setHeader();

?>
<div class="title center">
	<h1><?php p("support.title"); ?></h1>
</div>
<!-- Now support will directly jump to support -->
<div class="main">
	<div class="mainBlock center widepadding">
		<p><?php p("support.description"); ?></p>
	</div>
</div>
<?php setFooter(); ?>

<!-- Redirect -->
<script>
	window.location.href = "https://support.nmteam.xyz";
</script>