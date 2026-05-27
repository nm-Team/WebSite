logURL = "https://accounts.nmteam.xyz";
enableAccount = true;

// 这是在每一页上都会执行的 js
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