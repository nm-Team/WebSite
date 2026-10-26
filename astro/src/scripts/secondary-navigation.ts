export {};

const header = document.querySelector<HTMLElement>('.secondary-navigation');
const headerSlot = document.querySelector<HTMLElement>('.secondary-navigation-slot');
const toggle = header?.querySelector<HTMLButtonElement>('.secondary-navigation-toggle');
const panel = header?.querySelector<HTMLElement>('.secondary-navigation-panel');
const backdrop = headerSlot?.querySelector<HTMLElement>('.secondary-navigation-backdrop');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const gutterElements = [...document.querySelectorAll<HTMLElement>('.secondary-navigation .site-name-text, .secondary-navigation-links, .secondary-navigation-toggle, .secondary-navigation-panel-content')];
const gutterAnimations = new Map<HTMLElement, Animation>();
let returnFocus: HTMLElement | null = null;
let stickyUpdatePending = false;
let menuRevision = 0;

function cancelGutterAnimations() {
  for (const animation of gutterAnimations.values()) animation.cancel();
  gutterAnimations.clear();
}

function updateStickyState() {
  stickyUpdatePending = false;
  if (!header || !headerSlot) return;
  const stuck = headerSlot.getBoundingClientRect().top <= 0;
  if (header.hasAttribute('data-stuck') === stuck) return;
  // Capture the visible positions before cancelling an interrupted movement.
  const previous = gutterElements.map((element) => element.getBoundingClientRect().left);
  cancelGutterAnimations();
  header.toggleAttribute('data-stuck', stuck);
  if (motionPreference.matches) return;
  const current = gutterElements.map((element) => element.getBoundingClientRect());
  // Resolve responsive gutters once, then move only the content so WebKit can composite the animation.
  gutterElements.forEach((element, index) => {
    const offset = previous[index] - current[index].left;
    if (offset === 0 || current[index].width === 0) return;
    const animation = element.animate([
      { transform: `translateX(${offset}px)` },
      { transform: 'translateX(0)' },
    ], { duration: 300, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' });
    gutterAnimations.set(element, animation);
    animation.addEventListener('finish', () => {
      if (gutterAnimations.get(element) === animation) gutterAnimations.delete(element);
    }, { once: true });
  });
}

function scheduleStickyUpdate() {
  if (stickyUpdatePending) return;
  stickyUpdatePending = true;
  requestAnimationFrame(updateStickyState);
}

updateStickyState();
window.addEventListener('scroll', scheduleStickyUpdate, { passive: true });
window.addEventListener('resize', scheduleStickyUpdate);
window.addEventListener('pageshow', scheduleStickyUpdate);

function setOpen(open: boolean, instant = false) {
  if (!header || !toggle || !panel) return;
  if ((header.dataset.navMenuExtended === 'true') === open) return;
  const closingAnimation = !instant && !motionPreference.matches && Number.parseFloat(getComputedStyle(panel).opacity) > 0;
  header.toggleAttribute('data-menu-visible', open || closingAnimation);
  header.dataset.instantToggle = String(instant);
  if (open) returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : toggle;
  if (open) {
    window.dispatchEvent(new CustomEvent('secondary-navigation-open'));
    header.style.setProperty('--secondary-navigation-offset', `${Math.max(0, header.getBoundingClientRect().top)}px`);
  }
  header.querySelectorAll('[data-nav-menu-extended]').forEach((element) => element.setAttribute('data-nav-menu-extended', String(open)));
  header.dataset.navMenuExtended = String(open);
  const revision = ++menuRevision;
  header.removeAttribute('data-menu-scrollable');
  if (open) requestAnimationFrame(() => {
    if (!header || revision !== menuRevision) return;
    // Interrupted transitions reject their finished promise; only the latest toggle may enable scrolling.
    void Promise.allSettled(header.getAnimations().map((animation) => animation.finished)).then(() => {
      if (revision === menuRevision) header.setAttribute('data-menu-scrollable', '');
    });
  });
  document.body.dataset.navMenuExtended = String(open);
  document.body.style.overflow = open || document.getElementById('pageHeader')?.hasAttribute('open') ? 'hidden' : '';
  toggle.setAttribute('aria-expanded', String(open));
  panel.inert = !open;
  document.querySelectorAll<HTMLElement>('main, #fcont').forEach((element) => { element.inert = open; });
  if (open) panel.querySelector<HTMLElement>('a, input, button')?.focus({ preventScroll: true });
  else if (header.contains(document.activeElement)) returnFocus?.focus({ preventScroll: true });
}

panel?.addEventListener('transitionend', (event) => {
  if (event.target === panel && event.propertyName === 'opacity' && header?.dataset.navMenuExtended === 'false') {
    header.removeAttribute('data-menu-visible');
  }
});

toggle?.addEventListener('click', (event) => setOpen(toggle.getAttribute('aria-expanded') !== 'true', event.detail === 0));
backdrop?.addEventListener('click', () => setOpen(false));
document.addEventListener('keydown', (event) => {
  if (toggle?.getAttribute('aria-expanded') !== 'true' || !header) return;
  if (event.key === 'Escape') { event.preventDefault(); setOpen(false, true); }
  if (event.key === 'Tab') {
    const focusable = [...header.querySelectorAll<HTMLElement>('a[href], button, input')].filter((element) => element.tabIndex >= 0 && element.getClientRects().length > 0 && !element.closest('[inert]'));
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
});
window.addEventListener('resize', () => setOpen(false, true));
window.addEventListener('site-navigation-toggle', (event) => {
  const open = (event as CustomEvent<{ open: boolean }>).detail.open;
  if (open) setOpen(false, true);
  document.querySelectorAll<HTMLElement>('[data-secondary-navigation-content], #fcont').forEach((element) => { element.inert = open; });
});

motionPreference.addEventListener('change', () => {
  if (motionPreference.matches) cancelGutterAnimations();
  if (motionPreference.matches && header?.dataset.navMenuExtended === 'false') header.removeAttribute('data-menu-visible');
});
