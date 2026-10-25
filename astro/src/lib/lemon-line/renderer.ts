import { assets, rampAngle, scene } from './scene';
import type { Lemon, LemonSimulation } from './simulation';

type Artwork = Record<keyof typeof assets, HTMLImageElement>;

async function loadImage(src: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = src;
  try {
    await image.decode();
  } catch (cause) {
    throw new Error(`Unable to decode lemon production artwork: ${src}`, { cause });
  }
  return image;
}

export async function createRenderer(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D is unavailable for the lemon production line.');
  const artwork = Object.fromEntries(await Promise.all(Object.entries(assets).map(async ([key, src]) => (
    [key, await loadImage(src)]
  )))) as Artwork;
  const ctx = context;

  function drawLemon(lemon: Lemon, simulation: LemonSimulation): void {
    ctx.save();
    const progress = lemon.collected && simulation.collecting > 0 ? 1 - simulation.collecting / 0.35 : 0;
    ctx.translate(lemon.body.position.x, lemon.body.position.y + progress * 25);
    ctx.rotate(scene.artworkAngle + lemon.body.angle);
    const squash = Math.min(0.04, lemon.impact * 0.25);
    ctx.scale((1 + squash) * (1 - progress * 0.3), (1 - squash) * (1 - progress * 0.3));
    ctx.globalAlpha = 1 - progress;
    ctx.drawImage(lemon.stamped ? artwork.stamped : artwork.lemon,
      -scene.lemonSize / 2, -scene.lemonSize / 2, scene.lemonSize, scene.lemonSize);
    ctx.restore();
  }

  return {
    resize(width: number): void {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(width * scene.height / scene.width * ratio));
    },
    draw(simulation: LemonSimulation): void {
      ctx.setTransform(canvas.width / scene.width, 0, 0, canvas.height / scene.height, 0, 0);
      ctx.clearRect(0, 0, scene.width, scene.height);
      // Every fruit, including held fruit, stays behind both equipment housings.
      for (const lemon of simulation.lemons) drawLemon(lemon, simulation);
      ctx.drawImage(artwork.belts, 0, 0, scene.width, scene.height);
      ctx.fillStyle = 'rgba(75, 75, 75, 0.4)';
      for (let x = 325 + simulation.beltPhase; x < scene.beltEnd - 24; x += 70) {
        ctx.beginPath();
        ctx.arc(x, scene.beltTop, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      const rampLength = Math.hypot(scene.rampEnd.x - scene.rampStart.x, scene.rampEnd.y - scene.rampStart.y);
      for (let distance = simulation.beltPhase; distance < rampLength; distance += 70) {
        const x = scene.rampStart.x + distance * Math.cos(rampAngle);
        const y = scene.rampStart.y + distance * Math.sin(rampAngle);
        ctx.beginPath();
        ctx.arc(x, y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.save();
      const pulse = Math.sin(simulation.machinePulse / 0.16 * Math.PI);
      ctx.translate(0, -pulse * 0.8);
      ctx.filter = pulse > 0 ? `brightness(${1 + pulse * 0.04})` : 'none';
      ctx.drawImage(artwork.machine, 0, 0, scene.width, scene.height);
      ctx.restore();
      ctx.save();
      const bounce = simulation.collecting > 0
        ? Math.sin(simulation.collecting / 0.35 * Math.PI) * 3
        : 0;
      ctx.translate(0, bounce);
      ctx.drawImage(artwork.basket, 0, 0, scene.width, scene.height);
      ctx.restore();
    },
  };
}
