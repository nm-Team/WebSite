const header = document.querySelector<HTMLElement>('#newsroom-header');
const toggle = document.querySelector<HTMLButtonElement>('#newsroom-menu-toggle');
const panel = document.querySelector<HTMLElement>('#newsroom-extended-menu');
let returnFocus: HTMLElement | null = null;

function setOpen(open: boolean) {
  if (!header || !toggle || !panel) return;
  if (open) returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : toggle;
  header.querySelectorAll('[data-nav-menu-extended]').forEach((element) => element.setAttribute('data-nav-menu-extended', String(open)));
  header.dataset.navMenuExtended = String(open);
  document.body.dataset.navMenuExtended = String(open);
  toggle.setAttribute('aria-expanded', String(open));
  panel.inert = !open;
  if (open) panel.querySelector<HTMLElement>('a, input, button')?.focus({ preventScroll: true });
  else if (header.contains(document.activeElement)) returnFocus?.focus({ preventScroll: true });
}

toggle?.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
header?.querySelector('[data-newsroom-search-toggle]')?.addEventListener('click', (event) => {
  event.preventDefault();
  setOpen(toggle?.getAttribute('aria-expanded') !== 'true');
  if (toggle?.getAttribute('aria-expanded') === 'true') document.getElementById('newsroom-query')?.focus({ preventScroll: true });
});
document.addEventListener('keydown', (event) => {
  if (toggle?.getAttribute('aria-expanded') !== 'true' || !header) return;
  if (event.key === 'Escape') { event.preventDefault(); setOpen(false); }
  if (event.key === 'Tab') {
    const focusable = [...header.querySelectorAll<HTMLElement>('a[href], button, input')].filter((element) => element.tabIndex >= 0 && element.getClientRects().length > 0 && !element.closest('[inert]'));
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
});
window.addEventListener('resize', () => setOpen(false));

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.setAttribute('data-come-out-animation', '');
      observer.unobserve(entry.target);
    }
  });
  document.querySelectorAll('.newsroom-shell .come-out-animation').forEach((element) => observer.observe(element));
}
