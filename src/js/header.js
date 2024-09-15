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

window.onscroll = function () { setHeader(); };
setHeader();
function setHeader() {
	if (window.scrollY < 80 && disallowHideHeader !== true)
		document.getElementById("pageHeader").className = "header hidden";
	else document.getElementById("pageHeader").className = "header ";
}

// 登录账户
window.onload = function () {
	accountBox.setAttribute("onclick", "window.location.href='" + logURL + "'");
}

function openHeader(to) {
	if (to === false || (to !== true && document.getElementById("pageHeader").getAttribute("open") == "true")) {
		document.getElementById("pageHeader").removeAttribute("open");
		document.body.style.overflow = "auto";
	}
	else {
		document.getElementById("pageHeader").setAttribute("open", "true");
		document.body.style.overflow = "hidden";
	}
}

window.onresize = function () {
	openHeader(false);
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