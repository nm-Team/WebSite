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
c = loadc("/header.html");
hcont.innerHTML = c;
c = loadc("/footer.html");
fcont.innerHTML = c;

// 页面更新日期
if (fcont.getAttribute("updatetime") && fcont.getAttribute("updatetime").length == 8) {
	fcont.outerHTML = "<div class='updateDate'><span data-i18n='page_update'></span>" + fcont.getAttribute("updatetime").slice(0, 4) + "<span data-i18n='page_update_y'></span>" + fcont.getAttribute("updatetime").slice(4, 6) + "<span data-i18n='page_update_m'></span>" + fcont.getAttribute("updatetime").slice(6, 8) + "<span data-i18n='page_update_d'></span></div>" + fcont.outerHTML;
}

window.onscroll = function () { setHeader(); };
setHeader();
function setHeader() {
	if (window.scrollY < 130)
		document.getElementById("pageHeader").className = "header hidden";
	else document.getElementById("pageHeader").className = "header ";
}

// 登录账户
window.onload = function () {
	$("#footer_selectLanguageButton span")[0].innerHTML = (languageList[language]);
	if (enableAccount) {
		returnWord = "";
		getInfo(function () {
			accountInfo = returnWord;
			accountBox.setAttribute("onclick", "window.location.href='" + logURL + "?name=target.website&returnto=" + window.location.href + "&msg=msg.website'");
			if (accountInfo == -1) {
				userName.innerHTML = "<span data-i18n='account.click_to_log'></span>";
			}
			else if (accountInfo == -2) {
				userName.innerHTML = "<span data-i18n='account.unable_to_load'></span>";
			}
			else {
				avatarBox.setAttribute("style", "background-image:url(" + accountInfo['avatar'] + ")");
				userName.innerHTML = accountInfo['nick'];
				accountBox.setAttribute("onclick", "window.open('" + logURL + "/info.html?sessionid=" + getCookie("PHPSESSID") + "')");
			}
			changeLanguage();
		});
	}
	else userName.innerHTML = "<span data-i18n='account.click_to_log'></span>";
	changeLanguage();
}

function headerClick() {
	if (window.offsetWidth > 600) {
		window.location.href = "";
	}
	else if (pageHeader.getAttribute("open") == "true")
		pageHeader.removeAttribute("open");
	else pageHeader.setAttribute("open", "true");
}

// footer 切换语言按钮
footer_selectLanguageButton.onclick = function () {
	window.location.href = window.location.origin + "/language.html?bks=" + window.location.href;
}