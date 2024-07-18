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

define("help_center", "https://docs.nmteam.xyz");
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
			<button data-tab="support-documentation"><?php p("support.support_documentation"); ?></button>
			<button data-tab="email"><?php p("support.via_email"); ?></button>
			<button data-tab="telegram"><?php p("support.via_telegram"); ?></button>
		</div>
		<div class="tabContents">
			<div class="content" data-tab="support-documentation">
				<div class="indexMoreLinks">
					<a target="_blank" href="<?php echo help_center; ?>">
						<span><?php p("support.open_support_documentation"); ?></span>
						<svg class="svg" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
							<path d="M761.056 532.128c0.512-0.992 1.344-1.824 1.792-2.848 8.8-18.304 5.92-40.704-9.664-55.424L399.936 139.744c-19.264-18.208-49.632-17.344-67.872 1.888-18.208 19.264-17.376 49.632 1.888 67.872l316.96 299.84-315.712 304.288c-19.072 18.4-19.648 48.768-1.248 67.872 9.408 9.792 21.984 14.688 34.56 14.688 12 0 24-4.48 33.312-13.44l350.048-337.376c0.672-0.672 0.928-1.6 1.6-2.304 0.512-0.48 1.056-0.832 1.568-1.344C757.76 538.88 759.2 535.392 761.056 532.128z" p-id="2301"></path>
						</svg>
					</a>
				</div>
				<iframe src="<?php echo help_center; ?>" frameborder="0" style="width: 100%; height: 100vh;"></iframe>
			</div>
			<div class="content" data-tab="email">
				<!-- <h2><?php p("support.via_email"); ?></h2> -->
				<p><?php p("support.via_email_description"); ?></p>
				<p><?php p("support.support_email"); ?><a href="mailto:support@nmteam.xyz">support@nmteam.xyz</a></p>
			</div>
			<div class="content" data-tab="telegram">
				<p><?php p("support.via_telegram_description"); ?></p>
				<p><?php p("support.support_telegram"); ?><a href="https://nmteamsupportbot.t.me">@nmteamsupportbot</a></p>
			</div>
		</div>
	</div>
</div>
<?php setFooter(); ?>
<script>
	focusTab($("#supportTab"), "support-documentation");
</script>