<?php
require_once($_SERVER['DOCUMENT_ROOT'] . "/functions.php");
define("page_title", "nmFun「启程测试」");
define("page_keywords", ",nmFun,启程测试");
define("page_description", "nmFun 启程测试");
define("page_head_css", array());
define("page_head_js", array());
define("page_body_js", array());
define("page_image", "");
define("page_update", "20220329");
setHeader();
?>
<div class="title center">
	<h1>nmFun「启程测试」</h1>
</div>
<div class="main">
	<div class="nmfun-page-overview" id="ovp" alt="nmFun's Icon"></div>
	<style>
		.nmfun-page-overview {
			height: 50vh;
			background-image: url(https://websiteres.nmteam.xyz/producticon/nmFun/logo.svg);
			background-position-x: center;
			background-position-y: 100%;
			background-size: 50vh;
			background-repeat: no-repeat;
		}

		.btn {
			border: 1px solid #00000000;
			border-radius: 500px;
			font-size: 14px;
			margin: 20px;
			padding: 5px 11px;
			flex-shrink: 0;
			word-break: keep-all;
			cursor: pointer;
			--button-positive-color: rgb(255, 255, 255);
			--button-positive-background: rgb(255, 208, 0);
			--button-positive-border: rgb(255, 208, 0);
			color: var(--button-positive-color);
			background: var(--button-positive-background);
			border-color: var(--button-positive-border);
		}
	</style>
	<script>
		setInterval(() => {
			ch();
		}, 1);

		function ch() {
			ovp.style.backgroundSize = ((0.5 * window.outerHeight) - (0.8 * window.scrollY)) + "px";
		}
	</script>
	<div class="mainBlock center widepadding">
		<h2>nmFun「启程测试」报名已截止，感谢关注。</h2>
		<!-- <h2>nmFun「启程测试」即将开始！</h2> -->
		<p>nmTeam 即将创新性的推出乐子站 nmFun。</p>
		<p>nmFun 将重新定义人们看乐子的方式。nmFun 包含网络、生活等多个分类和图片、视频、聊天记录等多种形式的乐子，你可以任由喜好，自由翱翔。</p>
		<p>nmFun 的开发工作正在紧锣密鼓的进行中，其中前端开发工作进度可观。</p>
		<p>为了更好的进行 nmFun 的后续开发工作，nmTeam 推出 nmFun「启程测试」，欢迎各位 nm 人踊跃参加。</p>
		<!-- <h2>如何参加 nmFun「启程测试」</h2> -->
		<!-- <p>请通过此问卷报名参加 nmFun「启程测试」。</p> -->
		<!-- <center><button class="btn" title="点击报名" onclick="bmb.style.display='block';">点击报名</button></center> -->
		<!-- <h2>nmFun「启程测试」具体时间及参与方式将通过邮件告知。</h2> -->
	</div>
</div>
<iframe border="0" id="bmb" style="position: fixed; top: 0; bottom: 0; left: 0; right: 0; width: 100%; height: 100%; border: 0; z-index: 9999999; background-color: #fff; display: none;" src="https://wj.qq.com/s2/9340216/e713/"></iframe>
<?php setFooter(); ?>