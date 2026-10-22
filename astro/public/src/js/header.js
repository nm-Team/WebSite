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
let flowHeaderPreviousFocus = null;
function clearHeaderClosingState(pageHeader) {
	clearTimeout(headerCloseTimerId);
	pageHeader.removeAttribute("data-closing");
}

function setMenuExpanded(expanded) {
	const menuToggle = document.getElementById("menu-toggle");
	if (!menuToggle) return;
	menuToggle.setAttribute("aria-expanded", expanded ? "true" : "false");
	menuToggle.setAttribute("data-nav-menu-extended", expanded ? "true" : "false");
}

function openHeader(to) {
	const pageHeader = document.getElementById("pageHeader");
	const isOpen = pageHeader.getAttribute("open") === "true";
	const flowMode = pageHeader.parentElement.dataset.navigationMode === "flow";
	const willOpen = !(to === false || (to !== true && isOpen));
	if (flowMode && isOpen !== willOpen) {
		window.dispatchEvent(new CustomEvent("site-navigation-toggle", { detail: { open: willOpen } }));
	}
	if (to === false || (to !== true && isOpen)) {
		if (isOpen) {
			clearHeaderClosingState(pageHeader);
			pageHeader.setAttribute("data-closing", "true");
			headerCloseTimerId = setTimeout(function () {
				pageHeader.removeAttribute("data-closing");
			}, 700);
		}
		pageHeader.removeAttribute("open");
		setMenuExpanded(false);
		document.body.style.overflow = "auto";
		if (flowMode && isOpen && pageHeader.contains(document.activeElement)) flowHeaderPreviousFocus?.focus({ preventScroll: true });
	}
	else {
		if (flowMode && !isOpen) flowHeaderPreviousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		clearHeaderClosingState(pageHeader);
		pageHeader.setAttribute("open", "true");
		setMenuExpanded(true);
		document.body.style.overflow = "hidden";
		if (flowMode) requestAnimationFrame(() => pageHeader.querySelector(".links a")?.focus({ preventScroll: true }));
	}
}

window.addEventListener("newsroom-navigation-open", function () {
	if (document.getElementById("pageHeader").hasAttribute("open")) openHeader(false);
});

document.addEventListener("keydown", function (event) {
	const pageHeader = document.getElementById("pageHeader");
	if (pageHeader.parentElement.dataset.navigationMode !== "flow" || !pageHeader.hasAttribute("open")) return;
	if (event.key === "Escape") { event.preventDefault(); openHeader(false); return; }
	if (event.key !== "Tab") return;
	const focusable = Array.from(pageHeader.querySelectorAll("a[href], button")).filter((element) => element.getClientRects().length > 0);
	const first = focusable[0];
	const last = focusable[focusable.length - 1];
	if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
	else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
});

window.addEventListener("scroll", function () {
	const pageHeader = document.getElementById("pageHeader");
	if (pageHeader.hasAttribute("data-closing")) clearHeaderClosingState(pageHeader);
}, { passive: true });

window.onresize = function () {
	openHeader(false);
}

let cookieDialogPreviousFocus = null;

function openCookieDialog() {
	const dialog = document.getElementById("pageCookieConfirmDialog");
	if (!dialog) return;
	const activeElement = document.activeElement;
	cookieDialogPreviousFocus = activeElement instanceof HTMLElement ? activeElement : null;
	dialog.setAttribute("data-status", "open");
	requestAnimationFrame(() => {
		const firstAction = dialog.querySelector("button");
		if (firstAction instanceof HTMLElement) firstAction.focus();
	});
}

function closeCookieDialog() {
	const dialog = document.getElementById("pageCookieConfirmDialog");
	if (!dialog) return;
	dialog.setAttribute("data-status", "close");
	if (dialog.contains(document.activeElement)) {
		const returnFocus = cookieDialogPreviousFocus?.isConnected && cookieDialogPreviousFocus !== document.body
			? cookieDialogPreviousFocus
			: document.querySelector(".skip-to-content");
		if (returnFocus instanceof HTMLElement) returnFocus.focus({ preventScroll: true });
	}
	cookieDialogPreviousFocus = null;
}

window.acceptCookieConsent = function () {
	localStorage.cookieTipv0Checked = "true";
	closeCookieDialog();
};

// Cookie prompt
function scheduleCookieDialog() {
	if (localStorage.cookieTipv0Checked !== "true") setTimeout(openCookieDialog, 3000);
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", scheduleCookieDialog, { once: true });
} else {
	scheduleCookieDialog();
}
