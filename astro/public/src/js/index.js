// header icon + hero-to-header flight animation (threshold-triggered, Microsoft Store style)

var nmHero = document.querySelector(".indexHeader");
var nmReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var nmFlightDuration = 560;
var nmFlightEase = "cubic-bezier(0.22, 1, 0.36, 1)";
var nmMorphed = null;

var nmFlyers = [
    {
        source: document.querySelector(".indexHeaderLogo"),
        target: document.querySelector("#pageHeader .left .logo"),
        base: "translate(-50%, -50%)",
        scaleByFont: false,
        clone: null
    },
    {
        source: document.querySelector(".indexHeaderName"),
        target: document.querySelector("#pageHeader .left .name"),
        base: "translate(-50%, 0)",
        scaleByFont: true,
        clone: null
    }
];

// Uniform scale: font-size ratio for text (exact glyph match), box ratio otherwise.
function nmUniformScale(f, fromRect, toRect) {
    if (f.scaleByFont) {
        var s = parseFloat(window.getComputedStyle(f.source).fontSize);
        var t = parseFloat(window.getComputedStyle(f.target).fontSize);
        if (s > 0 && t > 0) return t / s;
    }
    return fromRect.height > 0 ? toRect.height / fromRect.height : 1;
}

// Ink bounds of an element's text, for baseline-accurate alignment of the wordmark.
function nmGlyphRect(el) {
    if (!el.firstChild) return el.getBoundingClientRect();
    var range = document.createRange();
    range.selectNodeContents(el);
    var rect = range.getBoundingClientRect();
    range.detach();
    return rect.width > 0 && rect.height > 0 ? rect : el.getBoundingClientRect();
}

function nmRectCenter(rect) {
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

// Fly a fixed-position clone of the hero element onto its header counterpart.
function nmFlyForward(f, onDone) {
    if (!f.source || !f.target) { onDone(); return; }
    // Cancel any still-running entrance animation and flush, so every
    // measurement below reflects the element's natural position.
    f.source.style.animation = "none";
    f.source.style.transition = "none";
    f.source.style.transform = "";
    void f.source.offsetHeight;
    var fromBox, fromAnchor;
    if (nmKillClone(f)) {
        fromBox = f.lastCloneRect;
        fromAnchor = fromBox;
    } else {
        fromBox = f.source.getBoundingClientRect();
        fromAnchor = f.scaleByFont ? nmGlyphRect(f.source) : fromBox;
    }
    var toBox = f.target.getBoundingClientRect();
    var toAnchor = f.scaleByFont ? nmGlyphRect(f.target) : toBox;

    var from = nmRectCenter(fromAnchor);
    var to = nmRectCenter(toAnchor);
    var d = {
        dx: to.x - from.x,
        dy: to.y - from.y,
        scale: nmUniformScale(f, fromBox, toBox)
    };

    var clone = f.source.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.style.animation = "none";
    clone.style.position = "fixed";
    clone.style.left = fromBox.left + "px";
    clone.style.top = fromBox.top + "px";
    clone.style.width = fromBox.width + "px";
    clone.style.height = fromBox.height + "px";
    clone.style.margin = "0";
    clone.style.transform = "none";
    clone.style.transformOrigin = "center";
    clone.style.transition = "none";
    clone.style.zIndex = "999";
    clone.style.pointerEvents = "none";
    document.body.appendChild(clone);
    f.clone = clone;

    f.source.style.visibility = "hidden";

    requestAnimationFrame(function () {
        if (!f.clone) return;
        clone.style.transition = "transform " + nmFlightDuration + "ms " + nmFlightEase;
        clone.style.transform = "translate(" + d.dx.toFixed(2) + "px, " + d.dy.toFixed(2) + "px)" +
            " scale(" + d.scale.toFixed(4) + ")";
    });

    var finished = false;
    var finish = function () {
        if (finished) return;
        finished = true;
        onDone();
    };
    clone.addEventListener("transitionend", function onEnd(ev) {
        if (ev.propertyName !== "transform") return;
        clone.removeEventListener("transitionend", onEnd);
        finish();
    });
    setTimeout(finish, nmFlightDuration + 160);
}

// Fly the original element back into the hero by transitioning its transform to base.
function nmFlyBack(f) {
    if (!f.source || !f.target) return;
    f.source.style.animation = "none";
    f.source.style.transition = "none";
    f.source.style.transform = "";
    void f.source.offsetHeight;
    var naturalBox = f.source.getBoundingClientRect();
    var naturalAnchor = f.scaleByFont ? nmGlyphRect(f.source) : naturalBox;
    var fromBox = f.target.getBoundingClientRect();
    var fromAnchor = f.scaleByFont ? nmGlyphRect(f.target) : fromBox;
    if (nmKillClone(f)) {
        fromBox = f.lastCloneRect;
        fromAnchor = fromBox;
    }

    var from = nmRectCenter(fromAnchor);
    var natural = nmRectCenter(naturalAnchor);
    var d = {
        dx: from.x - natural.x,
        dy: from.y - natural.y,
        scale: nmUniformScale(f, naturalBox, fromBox)
    };
    f.source.style.transform = f.base +
        " translate(" + d.dx.toFixed(2) + "px, " + d.dy.toFixed(2) + "px) scale(" + d.scale.toFixed(4) + ")";
    f.source.style.visibility = "visible";

    requestAnimationFrame(function () {
        if (f.source.style.visibility === "hidden") return;
        f.source.style.transition = "transform " + nmFlightDuration + "ms " + nmFlightEase;
        f.source.style.transform = f.base;
        setTimeout(function () {
            if (f.source.style.visibility === "hidden") return;
            f.source.style.transition = "";
        }, nmFlightDuration + 60);
    });
}

// Remove a live flight clone, remembering its current rendered rect for seamless retargeting.
function nmKillClone(f) {
    if (!f.clone) return false;
    f.lastCloneRect = f.clone.getBoundingClientRect();
    f.clone.remove();
    f.clone = null;
    return true;
}

function nmApplyState(morphed) {
    if (nmMorphed === morphed) return;
    var el = document.getElementById("pageHeader");

    // Snap without animation on first run or when reduced motion is preferred.
    if (nmMorphed === null || nmReduceMotion) {
        nmMorphed = morphed;
        el.classList.toggle("hidden", !morphed);
        el.classList.toggle("hidetitle", !morphed);
        nmFlyers.forEach(function (f) {
            if (f.source) f.source.style.visibility = morphed ? "hidden" : "visible";
        });
        return;
    }
    nmMorphed = morphed;

    if (morphed) {
        el.classList.add("hidetitle");
        el.classList.remove("hidden");
        var remaining = nmFlyers.length;
        nmFlyers.forEach(function (f) {
            nmFlyForward(f, function () {
                remaining -= 1;
                if (remaining > 0 || !nmMorphed) return;
                // Hard swap in one frame: reveal the real header title instantly
                // underneath the opaque clones, then remove them right away.
                var left = el.querySelector(".left");
                if (left) left.style.transition = "none";
                el.classList.remove("hidetitle");
                if (left) {
                    void left.offsetHeight;
                    left.style.transition = "";
                }
                nmFlyers.forEach(function (g) {
                    if (g.clone) { g.clone.remove(); g.clone = null; }
                });
            });
        });
    } else {
        el.classList.add("hidetitle");
        el.classList.add("hidden");
        nmFlyers.forEach(nmFlyBack);
    }
}

function setHeader() {
    if (!nmHero) return;
    var heroH = nmHero.getBoundingClientRect().height;
    nmApplyState(window.scrollY > Math.max(heroH * 0.5, 120));
}

window.onscroll = setHeader;
window.onresize = function () {
    openHeader(false);
    setHeader();
};

setHeader();

// index Newsroom Article

loadNews();

function loadNews() {
    $("#newsSwiperItems").html(`<center><span>${newsRoomLoadingI18n}<span></center>`);

    $.ajax("https://newsroom.nmteam.xyz/api/posts?showContent=false&pageSize=5&page=1", {
        type: "GET",
        async: true,
        data: {},
        crossDomain: true,
        datatype: "jsonp",
        success: function (data) {
            let newsHTML = ``;
            if (data['status'] == 200) {
                data['data'].forEach(function (value) {
                    // catch the first image [1]: https://newsroom.nmteam.xyz/usr/uploads/2024/03/132030924.png
                    const image = value['text'].match(/\[[^\]]+\]:\s*(https?:\/\/[^\s]+)/)?.[1] ?? null;
                    newsHTML += `<a class="swiper-slide" href="${value['permalink']}" target="_blank" title="${value['title']}">
                        <div class="newsImage" style="${!image ? 'display: none;' : ''}background-image: url('${image}');"></div>
                        <h3>${value['title']}</h3>
                        <div class="time" aria-label="${newsRoomTimeI18n}: ${value['year']}-${value['month']}-${value['day']}"><svg aria-label="${newsRoomTimeI18n}" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M512 1024C229.229714 1024 0 794.770286 0 512S229.229714 0 512 0s512 229.229714 512 512-229.229714 512-512 512z m0-73.142857c242.358857 0 438.857143-196.498286 438.857143-438.857143S754.358857 73.142857 512 73.142857 73.142857 269.641143 73.142857 512s196.498286 438.857143 438.857143 438.857143z m36.571429-694.857143v256.365714l255.963428-0.365714 0.073143 73.142857-329.179429 0.475429V256h73.142858z" p-id="3478"></path></svg>${value['year']}-${value['month']}-${value['day']}</div>
                    </a>`;
                });
            }
            $("#newsSwiperItems").html(newsHTML);
        },
        error: function () {
            $("#newsSwiperItems").html(`<center><span>${newsRoomLoadFailedI18n}</span><div class="indexMoreLinks"><a href="javascript:" onclick="loadNews();" data-button-type="no"><span>${newsRoomRetryI18n}</span></a></div></center>`);

        }
    });
}