<?php
require_once($_SERVER['DOCUMENT_ROOT'] . "/functions.php");
define("page_title", " - " . t("products.title"));
define("page_keywords", "");
define("page_description", "products.description");
define("page_head_css", array("/src/css/products.css", "/src/css/products_detail.css"));
define("page_head_js", array());
define("page_body_js", array("/src/js/products.js", "/src/js/products_detail.js"));
define("page_image", "");
define("page_update", "");
setHeader();
?>
<!-- 过渡i18n方案 -->
<script>
	productI18n = <?php echo json_encode(t("products")); ?>;
	pName = "<?php echo $_GET["product"]; ?>";
</script>
<!-- 过渡页面，以后将使用php改写 -->
<div class="products-detail products-page" id="products_detail_inner"></div>
<div class="products_footer">
	<div id="products_footer_explain_by_javascript"></div>
</div>
<div id="products_child_inner"></div>
<?php setFooter(); ?>