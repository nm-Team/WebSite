<?php
require_once($_SERVER['DOCUMENT_ROOT'] . "/functions.php");
define("page_title", "supportus.title");
define("page_keywords", "支持nmTeam,support,赞助,sponsor,帮助我们,help");
define("page_description", "supportus.description");
define("page_head_css", array());
define("page_head_js", array());
define("page_body_js", array());
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
	<div class="indexMoreLinks">
		<a target="_blank" href="https://afdian.net/@nmTeam?ref=nmteam.xyz">
			<span><?php p("supportus.links.afdian"); ?></span>
			<svg class="svg" style="transform:scale(0.81)" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
				<path d="M924.402464 1023.068211H0.679665V99.345412h461.861399v98.909208H99.596867v725.896389h725.896389V561.206811h98.909208z" p-id="3093"></path>
				<path d="M930.805104 22.977336l69.965436 69.965436-453.492405 453.492404-69.965435-69.901489z" p-id="3094"></path>
				<path d="M1022.464381 304.030081h-98.917201V99.345412H709.230573V0.428211h313.233808z"></path>
			</svg>
		</a>
		<a target="_blank" href="https://www.patreon.com/nmteam?ref=nmteam.xyz">
			<span><?php p("supportus.links.patreon"); ?></span>
			<svg class="svg" style="transform:scale(0.81)" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
				<path d="M924.402464 1023.068211H0.679665V99.345412h461.861399v98.909208H99.596867v725.896389h725.896389V561.206811h98.909208z" p-id="3093"></path>
				<path d="M930.805104 22.977336l69.965436 69.965436-453.492405 453.492404-69.965435-69.901489z" p-id="3094"></path>
				<path d="M1022.464381 304.030081h-98.917201V99.345412H709.230573V0.428211h313.233808z"></path>
			</svg>
		</a>
	</div>
	<h2><?php p("supportus.tks_sponsor"); ?></h2>
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