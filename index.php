<?php
require_once($_SERVER['DOCUMENT_ROOT'] . "/functions.php");
define("page_title", "");
define("page_keywords", "nmTeam,主页,首页,Homepage");
define("page_description", "nmTeam HomePage");
define("page_head_css", array("/src/css/index.css", "/src/css/swiper-bundle.min.css"));
define("page_head_js", array("/src/js/swiper-bundle.min.js"));
define("page_body_js", array("/src/js/index.js"));
define("page_image", "");
define("page_update", "");
setHeader();
?>
<script>
	newsRoomLoadingI18n = '<?php p("index.newslist_loading"); ?>';
	newsRoomTimeI18n = '<?php p("index.newslist_date_area_label"); ?>';
	newsRoomLoadFailedI18n = '<?php p("index.newslist_error"); ?>';
	newsRoomRetryI18n = '<?php p("index.retry"); ?>';
</script>
<div class="indexHeader">
	<i></i>
</div>
<div class="main">
	<div class="mainBlock center widepadding">
		<h1><?php p("index.what_is_nmteam"); ?></h1>
		<p><?php p("index.nmteam_is_this_a"); ?></p>
		<p><?php p("index.nmteam_is_this_b"); ?></p>
		<div class="indexMoreLinks">
			<a target="_blank" href="/aboutus">
				<span><?php p("index.nmteam_about_link"); ?></span>
				<svg class="svg" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
					<path d="M761.056 532.128c0.512-0.992 1.344-1.824 1.792-2.848 8.8-18.304 5.92-40.704-9.664-55.424L399.936 139.744c-19.264-18.208-49.632-17.344-67.872 1.888-18.208 19.264-17.376 49.632 1.888 67.872l316.96 299.84-315.712 304.288c-19.072 18.4-19.648 48.768-1.248 67.872 9.408 9.792 21.984 14.688 34.56 14.688 12 0 24-4.48 33.312-13.44l350.048-337.376c0.672-0.672 0.928-1.6 1.6-2.304 0.512-0.48 1.056-0.832 1.568-1.344C757.76 538.88 759.2 535.392 761.056 532.128z" p-id="2301"></path>
				</svg>
			</a>
		</div>
	</div>
	<div class="mainBlock center widepadding">
		<h1><?php p("index.what_we_does"); ?></h1>
		<p><?php p("index.what_we_does_ans"); ?></p>
		<div class="swiper cardSwiper productsSwiper" data-grow>
			<div class="swiper-wrapper">
				<a href="/products/overview/nmBrowser-StartPage" target="_self" class="swiper-slide" style="background-image: url(https://websiteres.nmteam.xyz/producticon/nmBrowser/logo@128.png)">
					<p>nmBrowser StartPage</p>
				</a>
				<a href="/products/overview/nmFun<?php echo lang == "zh_CN" || lang == "zh_HK" || lang == "hu_MA" ? "" : "?lang=zh_CN"; ?>" target="_self" class="swiper-slide" style="background-image: url(https://websiteres.nmteam.xyz/producticon/nmFun/logo.svg)">
					<p>nmFun</p>
				</a>
				<a href="/products/overview/nmChat" target="_self" class="swiper-slide" style="background-image: url(https://websiteres.nmteam.xyz/producticon/nmTeam/logo@128.png)">
					<p>nmChat</p>
				</a>
				<a href="/products/overview/nmBot-Telegram<?php echo lang == "zh_CN" || lang == "zh_HK" || lang == "hu_MA" ? "" : "?lang=zh_CN"; ?>" target="_self" class="swiper-slide" style="background-image: url(https://websiteres.nmteam.xyz/producticon/nmBot/logo@128.png)">
					<p>nmBot</p>
				</a>
			</div>
			<div class="swiper-button-prev"></div>
			<div class="swiper-button-next"></div>
		</div>
		<div class="indexMoreLinks">
			<a target="_blank" href="/products">
				<span><?php p("index.more_products"); ?></span>
				<svg class="svg" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
					<path d="M761.056 532.128c0.512-0.992 1.344-1.824 1.792-2.848 8.8-18.304 5.92-40.704-9.664-55.424L399.936 139.744c-19.264-18.208-49.632-17.344-67.872 1.888-18.208 19.264-17.376 49.632 1.888 67.872l316.96 299.84-315.712 304.288c-19.072 18.4-19.648 48.768-1.248 67.872 9.408 9.792 21.984 14.688 34.56 14.688 12 0 24-4.48 33.312-13.44l350.048-337.376c0.672-0.672 0.928-1.6 1.6-2.304 0.512-0.48 1.056-0.832 1.568-1.344C757.76 538.88 759.2 535.392 761.056 532.128z" p-id="2301"></path>
				</svg>
			</a>
		</div>
	</div>
	<div class="mainBlock center widepadding">
		<h1><?php p("index.newslist"); ?></h1>
		<div class="swiper cardSwiper newsSwiper" data-grow>
			<div class="swiper-wrapper" id="newsSwiperItems">Loading...</div>
			<div class="swiper-button-prev"></div>
			<div class="swiper-button-next"></div>
		</div>
		<div class="indexMoreLinks">
			<a target="_blank" href="https://newsroom.nmteam.xyz?ref=nmteam.xyz">
				<span><?php p("index.newslist_more"); ?></span>
				<svg class="svg" style="transform:scale(0.81)" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
					<path d="M924.402464 1023.068211H0.679665V99.345412h461.861399v98.909208H99.596867v725.896389h725.896389V561.206811h98.909208z" p-id="3093"></path>
					<path d="M930.805104 22.977336l69.965436 69.965436-453.492405 453.492404-69.965435-69.901489z" p-id="3094"></path>
					<path d="M1022.464381 304.030081h-98.917201V99.345412H709.230573V0.428211h313.233808z"></path>
				</svg>
			</a>
		</div>
	</div>
	<div class="mainBlock center widepadding">
		<h1><?php p("index.connect_us"); ?></h1>
		<p><?php p("index.connect_para"); ?></p>
		<div class="indexMoreLinks">
			<a href="https://github.com/nm-Team" target="_blank"><b>GitHub&nbsp;</b>@nmTeam<svg class="svg" style="transform:scale(0.81)" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
					<path d="M924.402464 1023.068211H0.679665V99.345412h461.861399v98.909208H99.596867v725.896389h725.896389V561.206811h98.909208z" p-id="3093"></path>
					<path d="M930.805104 22.977336l69.965436 69.965436-453.492405 453.492404-69.965435-69.901489z" p-id="3094"></path>
					<path d="M1022.464381 304.030081h-98.917201V99.345412H709.230573V0.428211h313.233808z"></path>
				</svg></a>
			<a href="https://t.me/nmteamnewsroom" target="_blank"><b>Telegram&nbsp;</b>@nmteamnewsroom<svg class="svg" style="transform:scale(0.81)" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
					<path d="M924.402464 1023.068211H0.679665V99.345412h461.861399v98.909208H99.596867v725.896389h725.896389V561.206811h98.909208z" p-id="3093"></path>
					<path d="M930.805104 22.977336l69.965436 69.965436-453.492405 453.492404-69.965435-69.901489z" p-id="3094"></path>
					<path d="M1022.464381 304.030081h-98.917201V99.345412H709.230573V0.428211h313.233808z"></path>
				</svg></a>
		</div>
		<h2><?php p("index.join_us"); ?></h2>
		<p><?php p("index.join_para"); ?></p>
		<p><?php p("index.join_para_2"); ?></p>
		<div class="indexMoreLinks">
			<a target="_blank" href="/join">
				<span><?php p("index.join_us_link"); ?></span>
				<svg class="svg" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
					<path d="M761.056 532.128c0.512-0.992 1.344-1.824 1.792-2.848 8.8-18.304 5.92-40.704-9.664-55.424L399.936 139.744c-19.264-18.208-49.632-17.344-67.872 1.888-18.208 19.264-17.376 49.632 1.888 67.872l316.96 299.84-315.712 304.288c-19.072 18.4-19.648 48.768-1.248 67.872 9.408 9.792 21.984 14.688 34.56 14.688 12 0 24-4.48 33.312-13.44l350.048-337.376c0.672-0.672 0.928-1.6 1.6-2.304 0.512-0.48 1.056-0.832 1.568-1.344C757.76 538.88 759.2 535.392 761.056 532.128z" p-id="2301"></path>
				</svg>
			</a>
		</div>
	</div>
</div>
<img src="https://websiteres.nmteam.xyz/nmwebsite/index/nmTeam_Website_Lemon_Line_Img.png" class="lemonLine" ondragstart="return false;" oncontextmenu="return false;" alt="Lemon Production Line">
<?php setFooter(); ?>