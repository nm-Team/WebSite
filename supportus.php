<?php
require_once($_SERVER['DOCUMENT_ROOT'] . "/functions.php");
define("page_title", "supportus.title");
define("page_keywords", "支持nmTeam,support,赞助,sponsor,帮助我们,help");
define("page_description", "supportus.description");
define("page_head_css", array());
define("page_head_js", array());
define("page_body_js", array("/src/js/tab.js"));
define("page_image", "");
$sponser_json = json_decode(file_get_contents($_SERVER['DOCUMENT_ROOT'] . "/src/json/sponsor.json"));
define("page_update", "$sponser_json->update");
setHeader();
?>
<style>
	.sTab {
		width: 100%;
		max-width: 600px;
		line-height: 2;
		margin: 0 auto 30px auto;
		overflow-x: auto;
	}

	.sTab thead {
		font-weight: bold;
	}

	.sTab td:not(td + td) {
		padding: 5px 0;
		display: inline-flex;
		justify-content: center;
	}

	.sTab i {
		display: inline-block;
		flex-grow: 0;
		flex-shrink: 0;
		width: 30px;
		height: 30px;
		background-image: url(https://static.hdslb.com/images/akari.jpg);
		background-size: 30px 30px;
		border-radius: 20px;
		margin-right: 4px;
	}

	.sTab td+td {
		text-align: end;
		min-width: 5em;
	}
</style>
<div class="title center">
	<h1><?php p("supportus.title"); ?></h1>
</div>
<div class="main mainBlock">
	<p><?php p("supportus.para"); ?></p>
	<br>
	<div class="tabView sponsorTab" id="sponsorTab">
		<div class="tabHeader">
			<button data-tab="afdian"><?php p("supportus.links.afdian"); ?></button>
			<button data-tab="patreon"><?php p("supportus.links.patreon"); ?></button>
			<button data-tab="crypto"><?php p("supportus.crypto"); ?></button>
		</div>
		<div class="tabContents">
			<div class="content" data-tab="afdian">
				<div class="indexMoreLinks">
					<a target="_blank" href="https://afdian.com/@nmTeam?ref=nmteam.xyz">
						<span><?php p("supportus.links.afdian"); ?></span>
						<svg class="svg" style="transform:scale(0.81)" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
							<path d="M924.402464 1023.068211H0.679665V99.345412h461.861399v98.909208H99.596867v725.896389h725.896389V561.206811h98.909208z" p-id="3093"></path>
							<path d="M930.805104 22.977336l69.965436 69.965436-453.492405 453.492404-69.965435-69.901489z" p-id="3094"></path>
							<path d="M1022.464381 304.030081h-98.917201V99.345412H709.230573V0.428211h313.233808z"></path>
						</svg>
					</a>
				</div>
			</div>
			<div class="content" data-tab="patreon">
				<div class="indexMoreLinks">
					<a target="_blank" href="https://www.patreon.com/nmteam?ref=nmteam.xyz">
						<span><?php p("supportus.links.patreon"); ?></span>
						<svg class="svg" style="transform:scale(0.81)" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
							<path d="M924.402464 1023.068211H0.679665V99.345412h461.861399v98.909208H99.596867v725.896389h725.896389V561.206811h98.909208z" p-id="3093"></path>
							<path d="M930.805104 22.977336l69.965436 69.965436-453.492405 453.492404-69.965435-69.901489z" p-id="3094"></path>
							<path d="M1022.464381 304.030081h-98.917201V99.345412H709.230573V0.428211h313.233808z"></path>
						</svg>
					</a>
				</div>
			</div>
			<div class="content" data-tab="crypto">
				<p>
					<?php p("supportus.crypto_address"); ?>:
					<span class="address" style="user-select: all; --webkit-user-select: all;">
						TWvJ6bghs8XM38VHDvUV9unJGZzbnmTeam
					</span>
				</p>
				<div class="indexMoreLinks">
					<a target="_self" href="javascript:copyCryptoAddress()">
						<span><?php p("supportus.copy_crypto_address"); ?></span>
						<svg class="svg" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
							<path d="M761.056 532.128c0.512-0.992 1.344-1.824 1.792-2.848 8.8-18.304 5.92-40.704-9.664-55.424L399.936 139.744c-19.264-18.208-49.632-17.344-67.872 1.888-18.208 19.264-17.376 49.632 1.888 67.872l316.96 299.84-315.712 304.288c-19.072 18.4-19.648 48.768-1.248 67.872 9.408 9.792 21.984 14.688 34.56 14.688 12 0 24-4.48 33.312-13.44l350.048-337.376c0.672-0.672 0.928-1.6 1.6-2.304 0.512-0.48 1.056-0.832 1.568-1.344C757.76 538.88 759.2 535.392 761.056 532.128z" p-id="2301"></path>
						</svg>
					</a>
				</div>
				<script>
					function copyCryptoAddress() {
						const el = document.createElement('textarea');
						el.value = document.querySelector('.content[data-tab="crypto"] span.address').innerText;
						document.body.appendChild(el);
						el.select();
						document.execCommand('copy');
						document.body.removeChild(el);
						alert("<?php p("supportus.copy_crypto_address_success"); ?>");
					}
				</script>
				<p>
					<br>
					<?php p("supportus.crypto_only_accept_tron"); ?>
				</p>
				<p>
					<img src="/src/img/tron.jpg" alt="TRON" style="width: 100%; max-width: 300px;">
				</p>
			</div>
		</div>
	</div>
	<h2><?php p("supportus.tks_sponsor"); ?> (<?php p("supportus.tks_sponsor_part"); ?>)</h2>
	<table class="sTab">
		<thead>
			<td><i style="background: none;"></i><?php p("supportus.table.name"); ?></td>
			<td><?php p("supportus.table.amount"); ?><span style="visibility: hidden"> CNY</span></td>
		</thead>
		<tbody>
			<?php
			foreach ($sponser_json->sponsor as $sponsor) {
			?>
				<tr>
					<td><i style="background-image: url(<?php echo $sponsor->avatar; ?>);" title="<?php p("supportus.table.avatar"); ?>"></i><span><?php echo $sponsor->name; ?></span></td>
					<td><?php echo $sponsor->amount; ?> CNY</td>
				</tr>
			<?php
			}
			?>
		</tbody>
	</table>
	<h2><?php p("supportus.tks_other"); ?></h2>
	<table class="sTab">
		<tbody>
			<?php
			foreach ($sponser_json->other as $other) {
			?>
				<tr>
					<td><i style="background-image: url(<?php echo $other->avatar; ?>);" title="<?php p("supportus.table.avatar"); ?>"></i><b><?php echo $other->name; ?>:&nbsp;</b><span><?php echo $other->contribution; ?></span></td>
				</tr>
			<?php
			}
			?>
		</tbody>
	</table>
	<p class="updateDate" style="font-size: 14px;"><?php p("supportus.sponsors_info_note"); ?></p>
</div>
<?php setFooter(); ?>
<script>
	focusTab($("#sponsorTab"), "afdian");
</script>