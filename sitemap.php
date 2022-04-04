<?php
require_once($_SERVER['DOCUMENT_ROOT'] . "/functions.php");
define("page_title", "sitemap.title");
define("page_keywords", "site map,sitemap,网站地图,站点地图");
define("page_description", "sitemap.description");
define("page_head_css", array());
define("page_head_js", array());
define("page_body_js", array());
define("page_image", "");
define("page_update", "");
setHeader();
?>
	<style>
		.item h2 {
			text-align: left;
			padding-left: 0;
			padding-right: 0;
		}
	</style>
	<div class="title center">
		<h1>nmTeam Sitemap</h1>
	</div>
	<div class="main" id="smapBox">
		<center>Getting nmTeam sitemap...</center>
	</div>
	<script>
		function loadSMap() {
			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function () {
				if (this.readyState == 4 && this.status == 200) {
					smapBox.innerHTML = "";
					smapItems = xhttp.responseXML.getElementsByTagName("channel")[0];
					for (i = 0; i < smapItems.getElementsByTagName("item").length; i++) {
						smi = smapItems.getElementsByTagName("item")[i];
						smapBox.innerHTML += `<div class="item"><h2><a href="{{link}}" title="{{title}}">{{title}}</a></h2><p class="desc">{{desc}}</p><p class="link">{{link}}</p></div>`.replace(/{{link}}/g, smi.getElementsByTagName("link")[0].innerHTML).replace(/{{desc}}/g, smi.getElementsByTagName("description")[0].innerHTML).replace(/{{title}}/g, smi.getElementsByTagName("title")[0].innerHTML);
					}
				}
			};
			xhttp.open("GET", "ror.xml", true);
			xhttp.send();
		}
		loadSMap();
	</script>
	<?php setFooter(); ?>