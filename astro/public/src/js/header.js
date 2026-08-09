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

let headerCloseTimerId;
function clearHeaderClosingState(pageHeader) {
	clearTimeout(headerCloseTimerId);
	pageHeader.removeAttribute("data-closing");
}

function openHeader(to) {
	const pageHeader = document.getElementById("pageHeader");
	const isOpen = pageHeader.getAttribute("open") === "true";
	if (to === false || (to !== true && isOpen)) {
		if (isOpen) {
			clearHeaderClosingState(pageHeader);
			pageHeader.setAttribute("data-closing", "true");
			headerCloseTimerId = setTimeout(function () {
				pageHeader.removeAttribute("data-closing");
			}, 700);
		}
		pageHeader.removeAttribute("open");
		document.body.style.overflow = "auto";
	}
	else {
		clearHeaderClosingState(pageHeader);
		pageHeader.setAttribute("open", "true");
		document.body.style.overflow = "hidden";
	}
}

window.addEventListener("scroll", function () {
	const pageHeader = document.getElementById("pageHeader");
	if (pageHeader.hasAttribute("data-closing")) clearHeaderClosingState(pageHeader);
}, { passive: true });

window.onresize = function () {
	openHeader(false);
}

// Cookie 提示 
if (localStorage.cookieTipv0Checked != "true") setTimeout(() => {
	pageCookieConfirmDialog.setAttribute("data-status", "open");
}, 3000);
