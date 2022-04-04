<?php
require_once($_SERVER['DOCUMENT_ROOT'] . "/functions.php");
define("page_title", "pagebases.page_not_found.title");
define("page_keywords", "404,页面不存在,错误");
define("page_description", "");
define("page_head_css", array());
define("page_head_js", array());
define("page_body_js", array());
define("page_image", "/src/img/notfound.png");
define("page_update", "19700101");
setHeader();
?>
<div class="title center">
	<h1>Oops!</h1>
</div>
<div class="main">
	<p>
		<center><img src="/src/img/notfound.png" style="width: 100%; max-width: 900px;" title="<?php p("pagebases.page_not_found.img_title"); ?>></center>
		</p>
		<div>
			<a href=" /#" class="indexMoreLink"><?php p("about.8"); ?></a>
</div>
</div>
<?php setFooter(); ?>