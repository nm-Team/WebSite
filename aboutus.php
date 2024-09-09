<?php
require_once($_SERVER['DOCUMENT_ROOT'] . "/functions.php");
define("page_title", "about.title");
define("page_keywords", "");
define("page_description", "about.description");
define("page_head_css", array());
define("page_head_js", array());
define("page_body_js", array());
define("page_image", "");
define("page_update", "20240909");
setHeader();
?>
<style>
	.introImage {
		margin: 30px auto;
		max-width: 550px;
	}
</style>
<div class="title center">
	<h1><?php p("about.title"); ?></h1>
</div>
<div class="main">
	<div class="mainBlock">
		<!-- Thank you for reading this :-) -->
		<?php
		// i18n is not used here, we directly echo the text by language
		$text = 'ERROR';
		switch (lang) {
			case 'zh_CN':
				$text = 'nmTeam 由 agou 和其他联合创始人于 2021 年 6 月 14 日创建。
自创建以来，nmTeam 一直致力于为用户提供优质、有趣、好用的“nm”产品。
2022 年，我们推出了 Telegram 群组管理机器人 <a href="/products/overview?product=nmBot-Telegram">nmBot</a>。截至 2024 年 8 月，这款机器人已斩获超 14,000 个活跃群组和 250,000 位活跃用户的使用。';
				break;
			case 'en_US':
			default:
				$text = 'nmTeam was founded by agou and other co-founders on June 14, 2021.
Since its inception, nmTeam has been committed to providing users with high-quality, interesting, and easy-to-use "nm" products.
In 2022, we launched the Telegram group management bot <a href="/products/overview?product=nmBot-Telegram">nmBot</a>. As of August 2024, this bot has won the use of over 14,000 active groups and 250,000 active users.';
				break;
			case 'zh_HK':
				$text = 'nmTeam 由 agou 和其他聯合創始人於 2021 年 6 月 14 日創建。
自創建以來，nmTeam 一直致力於為用戶提供優質、有趣、好用的“nm”產品。
2022 年，我們推出了 Telegram 群組管理機器人 <a href="/products/overview?product=nmBot-Telegram">nmBot</a>。截至 2024 年 8 月，這款機器人已斬獲超 14,000 個活躍群組和 250,000 位活躍用戶的使用。';
				break;
			case 'ja_JP':
				$text = 'nmTeam は 2021 年 6 月 14 日に agou と他の共同創設者によって設立されました。
設立以来、nmTeam はユーザーに高品質で面白く、使いやすい「nm」製品を提供することに取り組んでいます。
2022 年、私たちは Telegram グループ管理ボット <a href="/products/overview?product=nmBot-Telegram">nmBot</a> をリリースしました。2024 年 8 月時点で、このボットは 14,000 を超えるアクティブグループと 250,000 を超えるアクティブユーザーの使用を獲得しています。';
				break;
			case 'hu_MA':
				$text = 'nmTeam 甴 agou 啝娸彵聅匼創始亾纡 2021 姩 6 仴 14 ㄖ創踺。
洎創踺姒唻，nmTeam ①矗臸劦纡潙鼡戶諟栱沋質、洧趣、恏鼡哋“nm”浐闆。
2022 姩，莪們蓷炪孒 Telegram 羣蒩涫理僟噐亾 <a href="/products/overview?product=nmBot-Telegram">nmBot</a>。截臸 2024 姩 8 仴，適窾僟噐亾巳斬镬趫 14,000 個萿跞羣蒩啝 250,000 莅萿跞鼡戶哋使鼡。';
				break;
		}
		// replace \n with <br>
		$text = '<p>' . str_replace("\n", "</p><p>", $text) . '</p>';
		echo $text;
		?>
	</div>

	<!-- <h2><?php p("about.h0"); ?></h2> -->
	<div class="mainBlock">
		<h1><?php p("about.h1"); ?></h1>
		<p><?php p("about.0"); ?></p>
		<p><?php p("about.1"); ?></p>
		<p><?php p("about.2"); ?></p>
		<p><?php p("about.3"); ?></p>
		<p><?php p("about.4"); ?></p>
		<p><?php p("about.5"); ?></p>
		<center><img class="introImage" src="https://websiteres.nmteam.xyz/nmwebsite/img/nmteam-about-small.png" width="70%"></center>
	</div>
</div>
<div class="main">
	<div class="mainBlock" id="join">
		<h1><?php p("about.h2"); ?></h1>
		<p><?php p("about.6"); ?></p>
		<p><?php p("about.7"); ?></p>
		<a href="/join/" class="indexMoreLink"><?php p("about.8"); ?></a>
	</div>
</div>
<?php setFooter(); ?>