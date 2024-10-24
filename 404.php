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
		<center><img src="/src/img/notfound.png" style="width: 85%; max-width: 700px;" alt="<?php p("pagebases.page_not_found.img_title"); ?>"></center>
	</p>
	<div>
		<div class="indexMoreLinks">
			<a target="_self" href="/">
				<span><?php p("pagebases.page_not_found.home"); ?></span>
				<svg class="svg" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
					<path d="M761.056 532.128c0.512-0.992 1.344-1.824 1.792-2.848 8.8-18.304 5.92-40.704-9.664-55.424L399.936 139.744c-19.264-18.208-49.632-17.344-67.872 1.888-18.208 19.264-17.376 49.632 1.888 67.872l316.96 299.84-315.712 304.288c-19.072 18.4-19.648 48.768-1.248 67.872 9.408 9.792 21.984 14.688 34.56 14.688 12 0 24-4.48 33.312-13.44l350.048-337.376c0.672-0.672 0.928-1.6 1.6-2.304 0.512-0.48 1.056-0.832 1.568-1.344C757.76 538.88 759.2 535.392 761.056 532.128z" p-id="2301"></path>
				</svg>
			</a>
		</div>
	</div>
</div>
<?php setFooter(); ?>