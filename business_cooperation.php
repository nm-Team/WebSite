<?php
require_once($_SERVER['DOCUMENT_ROOT'] . "/functions.php");
define("page_title", "business_cooperation.title");
define("page_keywords", "");
define("page_description", "business_cooperation.description");
define("page_head_css", array());
define("page_head_js", array());
define("page_body_js", array());
define("page_image", "");
define("page_update", "20241212");
setHeader();

$business_email_address = "business@nmteam.xyz";
?>
<style>
	.email-btn {
		display: inline-block;
		padding: 8px 20px;
		margin: 5px 0;
		font-size: 17px;
		font-weight: bold;
		text-align: center;
		border-radius: 4px;
		color: #000;
		background-color: #EAD050;
		text-decoration: none;
		user-select: all;
		-webkit-user-select: all;
		-moz-user-select: all;
	}
</style>
<div class="title center">
	<h1><?php p("business_cooperation.title"); ?></h1>
</div>
<div class="main">
	<div class="mainBlock">
		<p><?php p("business_cooperation.content_0"); ?></p>
		<p>
			<button class="email-btn" onclick="window.location.href='mailto:<?php echo $business_email_address; ?>'"><?php echo $business_email_address; ?></button>
			&nbsp;&nbsp;<a href="javascript:" onclick="copyEmail()"><?php p("business_cooperation.copy_email"); ?></a>
		</p>
		<p><?php p("business_cooperation.content_1"); ?></p>
	</div>
</div>

<script>
	function copyEmail() {
		var email = "<?php echo $business_email_address; ?>";
		var tempInput = document.createElement("input");
		tempInput.value = email;
		document.body.appendChild(tempInput);
		tempInput.select();
		document.execCommand("copy");
		document.body.removeChild(tempInput);
	}
</script>
<?php setFooter(); ?>