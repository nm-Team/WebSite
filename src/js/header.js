logURL = "https://accounts.nmteam.ml";
enableAccount = true;

// 这是在每一页上都会执行的 js
function loadc(name) {
	let xhr = new XMLHttpRequest(),
		okStatus = document.location.protocol === "file:" ? 0 : 200;
	xhr.open('GET', name, false);
	xhr.overrideMimeType("text/html;charset=utf-8");//默认为utf-8
	xhr.send(null);
	return xhr.status === okStatus ? xhr.responseText : null;
}
c = loadc("/header.html");
hcont.innerHTML = c;
c = loadc("/footer.html");
fcont.innerHTML = c;
var sit = 0;
function go() {
	if (sit == 0) {
		document.getElementById("map-box-main").className = "map-box-opened";
		document.getElementById("header-main").className = "header-main-opened";
		// document.getElementById("header-box").className = "map-box-opened";
		cover.className = "cover-opened";
		sit = 1;
	}
	else {
		document.getElementById("map-box-main").className = "";
		document.getElementById("header-main").className = "";
		// document.getElementById("header-box").className = "";
		cover.className = "";
		sit = 0;
	}
}
function stop() {
	document.getElementById("map-box-main").className = "";
	document.getElementById("header-main").className = "";
	// document.getElementById("header-box").className = "";
	cover.className = "";
	sit = 0;
}

// 页面更新日期
if (fcont.getAttribute("updatetime") && fcont.getAttribute("updatetime").length == 8) {
	fcont.innerHTML = "<div class='updateDate'><span data-i18n='page_update'></span>" + fcont.getAttribute("updatetime").slice(0, 4) + "<span data-i18n='page_update_y'></span>" + fcont.getAttribute("updatetime").slice(4, 6) + "<span data-i18n='page_update_m'></span>" + fcont.getAttribute("updatetime").slice(6, 8) + "<span data-i18n='page_update_d'></span></div>" + fcont.innerHTML;
}
// window.onresize=function() {
// if (document.body.clientWidth > 700)
// document.getElementById("map-box-main").style.visibility = "visible";
// else {
// document.getElementById("map-box-main").style.visibility = "hidden";
// document.getElementById("cover").style.visibility = "hidden";

// }

// }

window.onscroll = function () { setHeader(); };
window.onload = function () { setHeader(); };
function setHeader() {
	if (window.scrollY < 70)
		document.getElementById("header-main").className = "height hidden";
	else document.getElementById("header-main").className = "height ";
}


// Fuck IE
if (window.navigator.userAgent.indexOf('MSIE ') > 0 &&
	window.confirm('Your browser is not supported, click \'OK\' to update.')) {
	window.location = 'https://www.google.cn/chrome/';
}

// 登录账户
window.onload = function () {
	if (enableAccount) {
		getInfo(function () {
			accountInfo = returnWord;
			headerAccountA.setAttribute("href", "" + logURL + "?name=target.website&returnto=" + window.location.href + "&msg=msg.website");
			headerAccountA.setAttribute("target", "_self");
			if (accountInfo == -1) {
				nickBox.innerHTML = "<span data-i18n='account.click_to_log'></span>";
			}
			else if (accountInfo == -2) {
				nickBox.innerHTML = "<span data-i18n='account.unable_to_load'></span>";
			}
			else {
				avatarBox.setAttribute("src", accountInfo['avatar']);
				nickBox.innerHTML = accountInfo['nick'];
				headerAccountA.setAttribute("href", "" + logURL + "/info.html");
				headerAccountA.setAttribute("target", "_blank");
			}
			changeLanguage();
		});
	}
	else nickBox.innerHTML = "<span data-i18n='account.click_to_log'></span>";
	changeLanguage();
}
