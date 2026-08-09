// header icon + hero-to-header flight animation (threshold-triggered, Microsoft Store style)

var nmHero = document.querySelector(".indexHeader");
var nmReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var nmFlightDuration = 560;
var nmFlightEase = "cubic-bezier(0.22, 1, 0.36, 1)";
var nmHandoffDuration = 280;
var nmHandoffEase = "cubic-bezier(0.33, 1, 0.68, 1)";
var nmAnimationGeneration = 0;
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

// Reuse the inline hero artwork so the final handoff never waits on the
// header's remote logo asset.
var nmLogoFlyer = nmFlyers[0];
if (nmLogoFlyer.source && nmLogoFlyer.target) {
    var nmHeroLogoImage = window.getComputedStyle(nmLogoFlyer.source).backgroundImage;
    if (nmHeroLogoImage && nmHeroLogoImage !== "none") {
        nmLogoFlyer.target.style.backgroundImage = nmHeroLogoImage;
    }
}

// Uniform scale: ink-width ratio for text (the header wordmark may use a
// different weight/tracking than the hero, so font-size alone does not
// guarantee a matching landing width), box ratio otherwise.
function nmUniformScale(f, fromAnchor, toAnchor) {
    if (f.scaleByFont) {
        if (fromAnchor.width > 0 && toAnchor.width > 0) return toAnchor.width / fromAnchor.width;
        var s = parseFloat(window.getComputedStyle(f.source).fontSize);
        var t = parseFloat(window.getComputedStyle(f.target).fontSize);
        if (s > 0 && t > 0) return t / s;
    }
    return fromAnchor.height > 0 ? toAnchor.height / fromAnchor.height : 1;
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

// The mobile menu keeps transitioning .left for 0.7s after it closes
// (scale(1.2) translate(...) snapping back). A target rect measured during
// that window is stale by the time the flight lands, so cancel the leftover
// transition before reading any target geometry. While the menu is open the
// transform is the legitimate resting state and must be kept.
function nmSettleBrandTransition(f) {
    var header = document.getElementById("pageHeader");
    if (!header || header.hasAttribute("open") || !f.target || !f.target.closest) return;
    var brand = f.target.closest(".left");
    if (!brand) return;
    brand.style.setProperty("transition", "none", "important");
    void brand.offsetHeight;
    brand.style.removeProperty("transition");
}

// Fly a fixed-position clone of the hero element onto its header counterpart.
function nmFlyForward(f, generation, onDone) {
    if (!f.source || !f.target) { onDone(); return; }
    // Cancel any still-running entrance animation and flush, so every
    // measurement below reflects the element's natural position.
    f.source.style.animation = "none";
    f.source.style.transition = "none";
    f.source.style.transform = "";
    void f.source.offsetHeight;
    nmSettleBrandTransition(f);

    // If a previous flight is still airborne, its current rendered rect is
    // the visual starting point; the fresh clone reproduces it below with an
    // initial transform on top of the source's natural geometry.
    var interrupted = nmKillClone(f);

    var fromBox = f.source.getBoundingClientRect();
    var fromAnchor = f.scaleByFont ? nmGlyphRect(f.source) : fromBox;
    var toBox = f.target.getBoundingClientRect();
    var toAnchor = f.scaleByFont ? nmGlyphRect(f.target) : toBox;

    var from = nmRectCenter(fromAnchor);
    var to = nmRectCenter(toAnchor);
    var d = {
        dx: to.x - from.x,
        dy: to.y - from.y,
        scale: nmUniformScale(f, fromAnchor, toAnchor)
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
    clone.style.opacity = "1";
    clone.style.zIndex = "999";
    clone.style.pointerEvents = "none";
    if (interrupted) {
        var cur = nmRectCenter(f.lastCloneRect);
        var startScale = fromBox.width > 0 ? f.lastCloneRect.width / fromBox.width : 1;
        clone.style.transform = "translate(" + (cur.x - from.x).toFixed(2) + "px, " +
            (cur.y - from.y).toFixed(2) + "px) scale(" + startScale.toFixed(4) + ")";
    }
    document.body.appendChild(clone);
    f.clone = clone;

    f.source.style.visibility = "hidden";

    // Commit the start state before the next frame applies the destination.
    void clone.offsetHeight;

    requestAnimationFrame(function () {
        if (generation !== nmAnimationGeneration || f.clone !== clone) return;
        clone.style.transition = "transform " + nmFlightDuration + "ms " + nmFlightEase;
        clone.style.transform = "translate(" + d.dx.toFixed(2) + "px, " + d.dy.toFixed(2) + "px)" +
            " scale(" + d.scale.toFixed(4) + ")";
    });

    var finished = false;
    var fallback;
    var finish = function () {
        if (finished) return;
        finished = true;
        onDone();
    };
    clone.addEventListener("transitionend", function onEnd(ev) {
        if (ev.target !== clone || ev.propertyName !== "transform") return;
        clone.removeEventListener("transitionend", onEnd);
        clearTimeout(fallback);
        finish();
    });
    fallback = setTimeout(finish, nmFlightDuration + 160);
}

// Fly the original element back into the hero by transitioning its transform to base.
function nmFlyBack(f, generation) {
    if (!f.source || !f.target) return;
    f.source.style.animation = "none";
    f.source.style.transition = "none";
    f.source.style.transform = "";
    void f.source.offsetHeight;
    nmSettleBrandTransition(f);
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
        scale: nmUniformScale(f, naturalAnchor, fromAnchor)
    };
    f.source.style.transform = f.base +
        " translate(" + d.dx.toFixed(2) + "px, " + d.dy.toFixed(2) + "px) scale(" + d.scale.toFixed(4) + ")";
    f.source.style.visibility = "visible";

    // Commit the translated start state before returning to the hero position.
    void f.source.offsetHeight;

    requestAnimationFrame(function () {
        if (generation !== nmAnimationGeneration || f.source.style.visibility === "hidden") return;
        f.source.style.transition = "transform " + nmFlightDuration + "ms " + nmFlightEase;
        f.source.style.transform = f.base;
        setTimeout(function () {
            if (generation !== nmAnimationGeneration || f.source.style.visibility === "hidden") return;
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

// Fade only the overlay clone; the fully opaque header stays visible beneath it.
function nmFadeCloneIntoHeader(f, generation) {
    var clone = f.clone;
    if (!clone) return;

    clone.style.transition = "none";
    clone.style.opacity = "1";
    void clone.offsetHeight;

    requestAnimationFrame(function () {
        if (generation !== nmAnimationGeneration || !nmMorphed || f.clone !== clone) return;

        var finished = false;
        var fallback;
        var finish = function () {
            if (finished) return;
            finished = true;
            clearTimeout(fallback);
            clone.removeEventListener("transitionend", onEnd);
            if (generation !== nmAnimationGeneration || f.clone !== clone) return;
            clone.remove();
            f.clone = null;
        };
        var onEnd = function (ev) {
            if (ev.target !== clone || ev.propertyName !== "opacity") return;
            finish();
        };

        clone.addEventListener("transitionend", onEnd);
        clone.style.transition = "opacity " + nmHandoffDuration + "ms " + nmHandoffEase;
        clone.style.opacity = "0";
        fallback = setTimeout(finish, nmHandoffDuration + 160);
    });
}

function nmApplyState(morphed) {
    if (nmMorphed === morphed) return;
    var el = document.getElementById("pageHeader");
    var generation = ++nmAnimationGeneration;

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
            nmFlyForward(f, generation, function () {
                if (generation !== nmAnimationGeneration) return;
                remaining -= 1;
                if (remaining > 0 || !nmMorphed) return;
                // Reveal the real header at full opacity, then blend away only
                // the overlay clones so the composite never becomes transparent.
                var left = el.querySelector(".left");
                if (left) left.style.setProperty("transition", "none", "important");
                el.classList.remove("hidetitle");
                if (left) {
                    void left.offsetHeight;
                }
                if (left) left.style.removeProperty("transition");
                nmFlyers.forEach(function (g) {
                    nmFadeCloneIntoHeader(g, generation);
                });
            });
        });
    } else {
        el.classList.add("hidetitle");
        el.classList.add("hidden");
        nmFlyers.forEach(function (f) {
            nmFlyBack(f, generation);
        });
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
