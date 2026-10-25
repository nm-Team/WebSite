import { createRenderer } from './renderer';
import { type Point, type Rect, releaseVelocity, scene } from './scene';
import { LemonSimulation } from './simulation';

export async function createRuntime(root: HTMLElement, failed: (error: unknown) => void, animate = true) {
  const canvas = root.querySelector('canvas');
  const controls = root.querySelector<HTMLElement>('[data-lemon-controls]');
  const machine = root.querySelector<HTMLElement>('[data-machine]');
  const basket = root.querySelector<HTMLButtonElement>('[data-basket]');
  const notice = root.querySelector<HTMLElement>('[data-notice]');
  if (!canvas || !controls || !machine || !basket || !notice) throw new Error('Incomplete lemon production line markup.');
  const renderer = await createRenderer(canvas);
  const simulation = new LemonSimulation();
  const events = new AbortController();
  const signal = events.signal;
  const buttons = new Map<number, HTMLButtonElement>();
  let frame = 0;
  let visible = false;
  let active = true;
  let destroyed = false;
  let width = root.getBoundingClientRect().width;
  let previous = 0;
  let accumulated = 0;
  let suppressClick = false;
  let announcedCollections = 0;
  let pointer: { id: number; origin: Point; offset: Point; moved: boolean; samples: (Point & { time: number })[] } | null = null;

  function label(key: string): string {
    const value = root.getAttribute(`data-label-${key}`);
    if (!value) throw new Error(`Missing lemon production line label: ${key}`);
    return value;
  }

  function setAttribute(element: HTMLElement, name: string, value: string): void {
    if (element.getAttribute(name) !== value) element.setAttribute(name, value);
  }

  function position(element: HTMLElement, rect: Rect): void {
    const scale = width / scene.width;
    element.style.transform = `translate(${rect.x * scale}px, ${rect.y * scale}px)`;
    element.style.width = `${rect.width * scale}px`;
    element.style.height = `${rect.height * scale}px`;
  }

  function render(): void {
    renderer.draw(simulation);
    const state = !animate ? 'static' : simulation.collecting > 0 ? 'collecting' : 'running';
    setAttribute(root, 'data-state', state);
    setAttribute(root, 'data-collected', String(simulation.count));
    setAttribute(root, 'data-collections', String(simulation.collections));
    setAttribute(basket!, 'aria-label', label('waiting').replace('{count}', String(simulation.count)));
    setAttribute(basket!, 'aria-disabled', String(simulation.count === 0 || simulation.collecting > 0));
    if (simulation.collections > announcedCollections && root.contains(document.activeElement)) notice!.textContent = label('collected');
    announcedCollections = simulation.collections;
    const ids = new Set(simulation.lemons.map(lemon => lemon.id));
    for (const [id, button] of buttons) {
      if (!ids.has(id)) {
        if (document.activeElement === button) basket!.focus({ preventScroll: true });
        button.remove();
        buttons.delete(id);
      }
    }
    for (const lemon of simulation.lemons) {
      let button = buttons.get(lemon.id);
      if (!button) {
        button = document.createElement('button');
        button.type = 'button';
        button.className = 'lemon-line__hotspot lemon-line__fruit';
        button.dataset.lemon = String(lemon.id);
        button.setAttribute('aria-describedby', 'lemon-line-instructions');
        controls!.append(button);
        buttons.set(lemon.id, button);
      }
      const hidden = !simulation.isVisible(lemon);
      if (hidden && document.activeElement === button) basket!.focus({ preventScroll: true });
      button.hidden = hidden;
      setAttribute(button, 'aria-label', label(lemon.held ? 'selected' : 'lemon'));
      setAttribute(button, 'aria-pressed', String(lemon.held));
      setAttribute(button, 'data-stamped', String(lemon.stamped));
      const size = Math.max(76, 44 * scene.width / width);
      position(button, { x: lemon.body.position.x - size / 2, y: lemon.body.position.y - size / 2, width: size, height: size });
      button.style.zIndex = '1';
    }
  }

  function fail(error: unknown): void {
    destroy();
    failed(error);
  }

  function tick(time: number): void {
    frame = 0;
    if (destroyed || !visible || !active) return;
    try {
      accumulated += previous ? Math.min((time - previous) / 1000, 0.05) : 0;
      previous = time;
      let steps = 0;
      while (accumulated >= scene.step && steps++ < 3) {
        simulation.step();
        accumulated -= scene.step;
      }
      render();
      if (simulation.needsAnimation) frame = requestAnimationFrame(tick);
      else previous = 0;
    } catch (error) { fail(error); }
  }

  function wake(): void {
    if (animate && !frame && !destroyed && active && visible) frame = requestAnimationFrame(tick);
  }

  function world(event: PointerEvent): Point {
    const rect = root.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * scene.width / rect.width, y: (event.clientY - rect.top) * scene.height / rect.height };
  }

  function cancelPointer(): void {
    const captured = pointer;
    pointer = null;
    simulation.release();
    if (captured && root.hasPointerCapture(captured.id)) root.releasePointerCapture(captured.id);
  }

  root.addEventListener('pointerdown', event => {
    root.dataset.input = 'pointer';
    if (event.isPrimary) suppressClick = false;
    if (!event.isPrimary || event.button !== 0 || pointer) return;
    if (simulation.held) { simulation.release(); wake(); }
    if (!(event.target instanceof Element) || !event.target.closest('[data-lemon]')) return;
    const point = world(event);
    const candidates = simulation.lemons.filter(lemon => simulation.isVisible(lemon)
      && Math.hypot(lemon.body.position.x - point.x, lemon.body.position.y - point.y) <= Math.max(60, 32 * scene.width / width));
    candidates.sort((a, b) => Math.hypot(a.body.position.x - point.x, a.body.position.y - point.y)
      - Math.hypot(b.body.position.x - point.x, b.body.position.y - point.y));
    const nearest = candidates[0];
    const lemon = nearest && simulation.grab(nearest.id);
    if (!lemon) return;
    pointer = { id: event.pointerId, origin: point, offset: { x: lemon.body.position.x - point.x, y: lemon.body.position.y - point.y },
      moved: false, samples: [{ ...lemon.body.position, time: event.timeStamp }] };
    root.setPointerCapture(event.pointerId);
    wake();
  }, { signal });

  root.addEventListener('pointermove', event => {
    if (!pointer || event.pointerId !== pointer.id) return;
    const point = world(event);
    if (Math.hypot(point.x - pointer.origin.x, point.y - pointer.origin.y) * width / scene.width > 4) pointer.moved = true;
    simulation.moveHeld({ x: point.x + pointer.offset.x, y: point.y + pointer.offset.y });
    if (simulation.held) pointer.samples.push({ ...simulation.held.body.position, time: event.timeStamp });
    pointer.samples = pointer.samples.filter(sample => event.timeStamp - sample.time <= 100);
    wake();
  }, { signal });

  root.addEventListener('pointerup', event => {
    if (!pointer || event.pointerId !== pointer.id) return;
    const completed = pointer;
    pointer = null;
    suppressClick = true;
    simulation.release(completed.moved ? releaseVelocity(completed.samples, event.timeStamp) : undefined);
    if (root.hasPointerCapture(event.pointerId)) root.releasePointerCapture(event.pointerId);
    wake();
  }, { signal });

  for (const name of ['pointercancel', 'lostpointercapture'] as const) {
    root.addEventListener(name, () => {
      if (pointer) { cancelPointer(); suppressClick = false; wake(); }
    }, { signal });
  }

  root.addEventListener('click', event => {
    if (suppressClick) { suppressClick = false; return; }
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest('[data-basket]')) simulation.collect();
    else if (event.detail === 0 && target?.closest<HTMLElement>('[data-lemon]')) {
      // Native keyboard and assistive activation can pick up a fruit for arrow
      // key movement. Pointer clicks never leave a fruit selected.
      if (simulation.held) simulation.release();
      else simulation.grab(Number(target.closest<HTMLElement>('[data-lemon]')!.dataset.lemon));
    }
    wake();
  }, { signal });

  root.addEventListener('keydown', event => {
    root.dataset.input = 'keyboard';
    if (!simulation.held) return;
    const direction: Record<string, Point> = { ArrowLeft: { x: -16, y: 0 }, ArrowRight: { x: 16, y: 0 }, ArrowUp: { x: 0, y: -16 }, ArrowDown: { x: 0, y: 16 } };
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!event.repeat) cancelPointer();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancelPointer();
    } else if (direction[event.key]) {
      event.preventDefault();
      const point = simulation.held.body.position;
      simulation.moveHeld({ x: point.x + direction[event.key].x, y: point.y + direction[event.key].y });
    }
    wake();
  }, { signal });
  document.addEventListener('keydown', event => {
    if (event.key === 'Tab') root.dataset.input = 'keyboard';
  }, { signal });
  root.addEventListener('contextmenu', event => {
    if (event.target instanceof Element && event.target.closest('[data-lemon]')) event.preventDefault();
  }, { signal });
  root.addEventListener('dragstart', event => event.preventDefault(), { signal });
  canvas.addEventListener('contextlost', () => fail(new Error('Lemon production line lost its drawing context.')), { signal });
  window.addEventListener('blur', () => {
    cancelPointer();
    suppressClick = true;
    wake();
  }, { signal });

  function resize(): void {
    if (destroyed) return;
    try {
      const nextWidth = Math.max(1, root.getBoundingClientRect().width);
      if (pointer && nextWidth !== width) {
        cancelPointer();
        suppressClick = true;
      }
      width = nextWidth;
      renderer.resize(width);
      position(machine!, scene.machine);
      position(basket!, scene.basket);
      render();
    } catch (error) { fail(error); }
  }
  const observer = new ResizeObserver(resize);
  observer.observe(root);
  window.addEventListener('resize', resize, { signal });
  resize();
  if (!destroyed) {
    root.dataset.motion = animate ? 'animated' : 'reduced';
    root.dataset.ready = 'true';
  }

  function destroy(): void {
    if (destroyed) return;
    destroyed = true;
    cancelAnimationFrame(frame);
    cancelPointer();
    events.abort();
    observer.disconnect();
    simulation.destroy();
    for (const button of buttons.values()) button.remove();
    buttons.clear();
    delete root.dataset.ready;
    delete root.dataset.state;
  }

  return {
    destroy,
    setVisibility(intersecting: boolean, pageActive: boolean): void {
      visible = intersecting;
      active = pageActive;
      if (!visible || !active) {
        cancelAnimationFrame(frame);
        frame = 0;
        previous = 0;
        accumulated = 0;
        cancelPointer();
      } else wake();
    },
  };
}
