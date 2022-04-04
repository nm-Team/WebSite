<?php
require_once($_SERVER['DOCUMENT_ROOT'] . "/functions.php");
define("page_title", "language.page.title");
define("page_keywords", "");
define("page_description", "");
define("page_head_css", array("/src/css/lan.css"));
define("page_head_js", array());
define("page_body_js", array("/src/js/language.js"));
define("page_image", "");
define("page_update", "");
setHeader();
?>
<div class="title largepadding">
	<h1><?php p("language.page.title"); ?></h1>
</div>
<div class="main mainBlock">
	<div id="lanList">
		<button class="selection" data-lanid="auto" data-lanname="<?php p("language.page.auto") ?>" data-active="false" title="<?php p("language.page.auto") ?>"><?php p("language.page.auto") ?></button>
		<?php
		foreach (languageList as $lanid => $lan) {
			echo "<button class=\"selection\" data-lanid=\"" . $lanid . "\" data-lanname=\"" . $lan . "\" data-active=\"" . ($lanid == lang ? "true" : "false") . "\" title=\"" . $lan . "\">" . $lan . "</button>";
		}
		?>
	</div>
	<p><?php p("language.page.tip"); ?></p>
</div>

<?php setFooter(); ?>
<script>
	backCallURL = unescape(getQueryVariable("bks"));
	activeLan = "<?php echo lang; ?>";
	languageList = <?php echo json_encode(languageList); ?>;

	function getQueryVariable(variable) {
		var query = window.location.search.substring(1);
		var vars = query.split("&");
		for (var i = 0; i < vars.length; i++) {
			var pair = vars[i].split("=");
			if (pair[0] == "null") {
				return null;
			}
			if (pair[0] == variable) {
				return decodeURI(pair[1]);
			}
		}
		return null;
	}

	$("#lanList .selection").on("click", function() {
		console.log("Switch language to " + $(this).attr("data-lanid"));
		document.cookie = "lang=" + $(this).attr("data-lanid") + ";path=/;max-age=99999999999";
		if (!backCallURL || backCallURL == "undefined") backCallURL = window.location.href;
		window.location.href = backCallURL;
	});
</script>