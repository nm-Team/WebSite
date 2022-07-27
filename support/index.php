<?php
require_once($_SERVER['DOCUMENT_ROOT'] . "/functions.php");
define("page_title", "support.title");
define("page_keywords", "");
define("page_description", "support.description");
define("page_head_css", array());
define("page_head_js", array());
define("page_body_js", array("/src/js/tab.js"));
define("page_image", "");
define("page_update", "20220727");
setHeader();
?>
<div class="title center">
	<h1><?php p("support.title"); ?></h1>
</div>
<div class="main">
	<div class="mainBlock center widepadding">
		<p><?php p("support.description"); ?></p>
	</div>
	<div class="tabView supportTab" id="supportTab">
		<div class="tabHeader">
			<button data-tab="email"><?php p("support.via_email"); ?></button>
			<!-- <button data-tab="community"><?php p("support.community"); ?></button> -->
		</div>
		<div class="tabContents">
			<div class="content" data-tab="email">
				<!-- <h2><?php p("support.via_email"); ?></h2> -->
				<p><?php p("support.via_email_description"); ?></p>
				<p><?php p("support.support_email"); ?><a href="mailto:support@nmteam.xyz">support@nmteam.xyz</a></p>
			</div>
			<div class="content" data-tab="community">
			</div>
		</div>
	</div>
</div>
<?php setFooter(); ?>
<script>
	focusTab($("#supportTab"), "email");
</script>