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
// window.onresize=function() {
	// if (document.body.clientWidth > 700)
		// document.getElementById("map-box-main").style.visibility = "visible";
	// else {
		// document.getElementById("map-box-main").style.visibility = "hidden";
		// document.getElementById("cover").style.visibility = "hidden";

	// }

// }
