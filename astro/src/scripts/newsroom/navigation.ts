const header = document.querySelector<HTMLElement>('#newsroom-header');
const toggle = document.querySelector<HTMLButtonElement>('#newsroom-menu-toggle');
const panel = document.querySelector<HTMLElement>('#newsroom-extended-menu');
const searchToggle = header?.querySelector<HTMLAnchorElement>('[data-newsroom-search-toggle]');
const backdrop = document.querySelector<HTMLElement>('[data-newsroom-backdrop]');
let returnFocus: HTMLElement | null = null;

function setOpen(open: boolean) {
  if (!header || !toggle || !panel) return;
  if ((header.dataset.navMenuExtended === 'true') === open) return;
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
  if (backdrop) backdrop.hidden = !open;
  panel.inert = !open;
  document.querySelectorAll<HTMLElement>('#newsroom-main, #newsroom-footer').forEach((element) => { element.inert = open; });
  if (open) panel.querySelector<HTMLElement>('a, input, button')?.focus({ preventScroll: true });
  else if (header.contains(document.activeElement)) returnFocus?.focus({ preventScroll: true });
}

toggle?.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
searchToggle?.addEventListener('click', (event) => {
  event.preventDefault();
  setOpen(toggle?.getAttribute('aria-expanded') !== 'true');
  if (toggle?.getAttribute('aria-expanded') === 'true') document.getElementById('newsroom-query')?.focus({ preventScroll: true });
});
backdrop?.addEventListener('click', () => setOpen(false));
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
window.addEventListener('site-navigation-toggle', (event) => {
  const open = (event as CustomEvent<{ open: boolean }>).detail.open;
  if (open) setOpen(false);
  const shell = document.querySelector<HTMLElement>('.newsroom-shell');
  if (shell) shell.inert = open;
});

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
