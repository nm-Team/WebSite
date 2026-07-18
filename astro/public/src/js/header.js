logURL = "https://accounts.nmteam.xyz";
enableAccount = true;

// 这是在每一页上都会执行的 js
window.onscroll = function () { setHeader(); };
setHeader();
function setHeader() {
	// Only toggle "hidden" so page-specific classes like "hidetitle" survive.
	if (window.scrollY < 80 && disallowHideHeader !== true)
		document.getElementById("pageHeader").classList.add("hidden");
	else document.getElementById("pageHeader").classList.remove("hidden");
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