logURL = "https://accounts.nmteam.xyz";
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

// 页面更新日期
if (fcont.getAttribute("updatetime") && fcont.getAttribute("updatetime").length == 8) {
	fcont.outerHTML = "<div class='updateDate'><span data-i18n='page_update'></span>" + fcont.getAttribute("updatetime").slice(0, 4) + "<span data-i18n='page_update_y'></span>" + fcont.getAttribute("updatetime").slice(4, 6) + "<span data-i18n='page_update_m'></span>" + fcont.getAttribute("updatetime").slice(6, 8) + "<span data-i18n='page_update_d'></span></div>" + fcont.outerHTML;
}

window.onscroll = function () { setHeader(); };
setHeader();
function setHeader() {
	if (window.scrollY < 80)
		document.getElementById("pageHeader").className = "header hidden";
	else document.getElementById("pageHeader").className = "header ";
}

// 登录账户
window.onload = function () {
	if (enableAccount) {
		returnWord = "";
		getInfo(function () {
			accountInfo = returnWord;
			accountBox.setAttribute("onclick", "window.location.href='" + logURL + "?name=target.website&returnto=" + window.location.href + "&msg=msg.website'");
			if (accountInfo == -1) {
				userName.innerHTML = accountI18n.click_to_log;
			}
			else if (accountInfo == -2) {
				userName.innerHTML = accountI18n.unable_to_load;
			}
			else {
				avatarBox.setAttribute("style", "background-image:url(" + accountInfo['avatar'] + ")");
				userName.innerHTML = accountInfo['nick'];
				accountBox.setAttribute("onclick", "window.open('" + logURL + "/info?sessionid=" + getCookie("PHPSESSID") + "')");
			}
		});
	}
	else userName.innerHTML = accountI18n.click_to_log;
}

function headerClick() {
	if (window.innerWidth > 600) {
		window.location.href = "/";
	}
	else if (pageHeader.getAttribute("open") == "true") {
		pageHeader.removeAttribute("open");
		document.body.style.overflow = "auto";
	}
	else {
		pageHeader.setAttribute("open", "true");
		document.body.style.overflow = "hidden";
	}
}

window.onresize = function () {
	pageHeader.removeAttribute("open");
	document.body.style.overflow = "auto";
}

// Cookie 提示 
if (localStorage.cookieTipv0Checked != "true") setTimeout(() => {
	pageCookieConfirmDialog.setAttribute("data-status", "open");
}, 3000);

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i].trim();
		if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
	}
	return "";
}

function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
	var r = window.location.search.substr(1).match(reg);  //匹配目标参数
	if (r != null) return unescape(r[2]); return null; //返回参数值
}

function changeURLParam(name, value) {
	var url = document.URL, resultUrl = '';
	var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
	var r = window.location.search.substr(1).match(reg);
	var replaceText = name + '=' + value;
	if (r != null) {
		var tmp = url.replace(unescape(name + '=' + r[2]), replaceText);
		resultUrl = (tmp);
	} else {
		if (url.match('[\?]')) {
			resultUrl = url + '&' + replaceText;
		}
		else {
			resultUrl = url + '?' + replaceText;
		}
	}
	history.replaceState(null, null, resultUrl);
}