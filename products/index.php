<?php
require_once($_SERVER['DOCUMENT_ROOT'] . "/functions.php");
define("page_title", "products.title");
define("page_keywords", "");
define("page_description", "products.description");
define("page_head_css", array("/src/css/products.css", "/src/css/products_overview.css"));
define("page_head_js", array());
define("page_body_js", array("/src/js/products.js", "/src/js/products_overview.js"));
define("page_image", "");
define("page_update", "");
setHeader();
?>
<!-- 过渡i18n方案 -->
<script>
	productI18n = <?php echo json_encode(t("products")); ?>;
</script>
<!-- 过渡页面，以后将使用php改写 -->
<div class="title center">
	<h1><span><?php p("products.title"); ?></span></h1>
</div>
<div class="products-overview products-page" id="products_overview_inner"></div>
<div class="products_footer">
	<div id="products_footer_explain_by_javascript"></div>
	<p><?php p("products.explain"); ?></p>
</div>
<?php setFooter(); ?>