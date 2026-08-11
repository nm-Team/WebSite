// Home page scroll restoration, loaded in <head> before any paint.
// The browser's native restoration only fires after the first painted frame
// on this page, flashing the page top before jumping to the saved position,
// so it is disabled and the position is replayed manually by the inline
// script at the end of the page. While data-nm-home-restore is pending,
// index.css keeps the body hidden, so the first painted frame is already at
// the restored position.
try {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (parseInt(sessionStorage.getItem("nmHomeScrollY"), 10) > 0) {
        document.documentElement.setAttribute("data-nm-home-restore", "pending");
        // The header links transition visibility with a 0.5s delay, which
        // would also delay the inherited visibility flip when the page is
        // revealed; keep their transitions suppressed until then.
        document.documentElement.setAttribute("data-nm-home-no-transition", "");
    }
    addEventListener("pagehide", function () {
        try {
            sessionStorage.setItem("nmHomeScrollY", String(window.scrollY));
        } catch (e) { }
    });
} catch (e) { }
