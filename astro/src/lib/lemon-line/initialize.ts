import type { createRuntime } from './runtime';

type Runtime = Awaited<ReturnType<typeof createRuntime>>;

export function initializeLemonLine(root: HTMLElement): () => void {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let runtime: Runtime | undefined;
  let loading = false;
  let near = false;
  let visible = false;
  let pageActive = true;
  let disposed = false;
  let failed = false;
  let generation = 0;
  const events = new AbortController();
  const signal = events.signal;

  function updateVisibility(): void {
    runtime?.setVisibility(visible, pageActive && !document.hidden);
  }

  function fallback(error: unknown): void {
    failed = true;
    runtime?.destroy();
    runtime = undefined;
    delete root.dataset.ready;
    root.dataset.fallback = 'true';
    console.error('[LemonProductionLine] Showing static artwork after animation failure.', error);
  }

  async function load(): Promise<void> {
    if (!near || disposed || failed || runtime || loading) return;
    loading = true;
    const current = ++generation;
    try {
      const { createRuntime } = await import('./runtime');
      if (current !== generation || disposed) return;
      const created = await createRuntime(root, error => {
        if (!disposed && current === generation) fallback(error);
      }, !reduced.matches);
      if (current !== generation || disposed || failed) created.destroy();
      else { runtime = created; updateVisibility(); }
    } catch (error) {
      if (!disposed && current === generation) fallback(error);
    } finally {
      loading = false;
      // A motion preference can change twice while images are decoding.
      // Start the current generation after the stale initialization finishes.
      if (current !== generation) void load();
    }
  }

  const preload = new IntersectionObserver(entries => {
    near = entries[0]?.isIntersecting ?? false;
    void load();
  }, { rootMargin: '200px' });
  const visibility = new IntersectionObserver(entries => {
    visible = entries[0]?.isIntersecting ?? false;
    updateVisibility();
  });
  preload.observe(root);
  visibility.observe(root);
  document.addEventListener('visibilitychange', updateVisibility, { signal });
  reduced.addEventListener('change', () => {
    generation++;
    runtime?.destroy();
    runtime = undefined;
    void load();
  }, { signal });
  window.addEventListener('pagehide', event => {
    pageActive = false;
    updateVisibility();
    if (!event.persisted) destroy();
  }, { signal });
  window.addEventListener('pageshow', () => { pageActive = true; updateVisibility(); }, { signal });

  function destroy(): void {
    disposed = true;
    generation++;
    events.abort();
    preload.disconnect();
    visibility.disconnect();
    runtime?.destroy();
  }
  return destroy;
}
