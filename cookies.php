<?php
require_once($_SERVER['DOCUMENT_ROOT'] . "/functions.php");
define("page_title", "cookies.title");
define("page_keywords", "cookies");
define("page_description", "cookies.description");
define("page_head_css", array());
define("page_head_js", array());
define("page_body_js", array());
define("page_image", "");
define("page_update", "20240908");
setHeader();
?>
<style>
	.cookieSettingBox {
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 20px 0;
	}

	.cookieSettingBox label {
		margin-inline-end: 15px;
	}
</style>
<div class="title center">
	<h1><?php p('cookies.title'); ?></h1>
</div>
<div class="main mainBlock">
	<center><?php p('cookies.description'); ?></center>
	<h2>
		<?php p('cookies.necessary_cookies_title'); ?>
	</h2>
	<center>
		<?php p('cookies.necessary_cookies_description'); ?>
	</center>
	<h2>
		<?php p('cookies.optional_cookies_title'); ?>
	</h2>
	<center>
		<?php p('cookies.optional_cookies_description'); ?>
	</center>
	<div class="cookieSettingBox">
		<label for="operationCookiesSwitchButton"><?php p('cookies.optional_cookies_title'); ?></label>
		<div class="select-radio-box">
			<input type="checkbox" id="operationCookiesSwitchButton" class="operationCookiesSwitchButton" checked="<?php echo $_COOKIE['operationCookies'] == 'true' ? 'checked' : ''; ?>" />
			<div class="select-switch">
				<div class="select-cursor"></div>
				<div class="select-label select-label-on"><?php p('cookies.cookies_on'); ?></div>
				<div class="select-label select-label-off"><?php p('cookies.cookies_off'); ?></div>
			</div>
		</div>
	</div>
</div>

<script>
	window.onload = $('.operationCookiesSwitchButton').change(function() {
		if ($(this).prop('checked')) {
			setCookie('operationCookies', 'true', 36500000);
		} else {
			setCookie('operationCookies', 'false', 36500000);
		}
	});
</script>
<script>
	localStorage.cookieTipv0Checked = 'true';
</script>
<?php setFooter(); ?>