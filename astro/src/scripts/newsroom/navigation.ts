const header = document.querySelector<HTMLElement>('#newsroom-header');
const headerSlot = document.querySelector<HTMLElement>('.newsroom-header-slot');
const toggle = document.querySelector<HTMLButtonElement>('#newsroom-menu-toggle');
const panel = document.querySelector<HTMLElement>('#newsroom-extended-menu');
const searchToggle = header?.querySelector<HTMLAnchorElement>('[data-newsroom-search-toggle]');
const backdrop = document.querySelector<HTMLElement>('[data-newsroom-backdrop]');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let returnFocus: HTMLElement | null = null;
let stickyUpdatePending = false;

function updateStickyState() {
  stickyUpdatePending = false;
  if (!header || !headerSlot) return;
  header.toggleAttribute('data-stuck', headerSlot.getBoundingClientRect().top <= 0);
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
    window.dispatchEvent(new CustomEvent('newsroom-navigation-open'));
    header.style.setProperty('--newsroom-header-offset', `${Math.max(0, header.getBoundingClientRect().top)}px`);
  }
  header.querySelectorAll('[data-nav-menu-extended]').forEach((element) => element.setAttribute('data-nav-menu-extended', String(open)));
  header.dataset.navMenuExtended = String(open);
  document.body.dataset.navMenuExtended = String(open);
  document.body.style.overflow = open || document.getElementById('pageHeader')?.hasAttribute('open') ? 'hidden' : '';
  toggle.setAttribute('aria-expanded', String(open));
  searchToggle?.setAttribute('aria-expanded', String(open));
  panel.inert = !open;
  document.querySelectorAll<HTMLElement>('#newsroom-main, #newsroom-footer, #fcont').forEach((element) => { element.inert = open; });
  if (open) panel.querySelector<HTMLElement>('a, input, button')?.focus({ preventScroll: true });
  else if (header.contains(document.activeElement)) returnFocus?.focus({ preventScroll: true });
}

panel?.addEventListener('transitionend', (event) => {
  if (event.target === panel && event.propertyName === 'opacity' && header?.dataset.navMenuExtended === 'false') {
    header.removeAttribute('data-menu-visible');
  }
});

toggle?.addEventListener('click', (event) => setOpen(toggle.getAttribute('aria-expanded') !== 'true', event.detail === 0));
searchToggle?.addEventListener('click', (event) => {
  event.preventDefault();
  setOpen(toggle?.getAttribute('aria-expanded') !== 'true', event.detail === 0);
  if (toggle?.getAttribute('aria-expanded') === 'true') document.getElementById('newsroom-query')?.focus({ preventScroll: true });
});
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
  document.querySelectorAll<HTMLElement>('.newsroom-shell, #fcont').forEach((element) => { element.inert = open; });
});

const cards = document.querySelectorAll('.newsroom-shell .come-out-animation');
const cardObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) entry.target.toggleAttribute('data-come-out-animation', entry.isIntersecting);
});
function updateCardMotion() {
  if (motionPreference.matches && header?.dataset.navMenuExtended === 'false') header.removeAttribute('data-menu-visible');
  cardObserver.disconnect();
  for (const card of cards) {
    card.removeAttribute('data-come-out-animation');
    if (!motionPreference.matches) cardObserver.observe(card);
  }
}
updateCardMotion();
motionPreference.addEventListener('change', updateCardMotion);
