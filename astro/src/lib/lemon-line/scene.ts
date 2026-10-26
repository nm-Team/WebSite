export interface Point { x: number; y: number }
export interface Rect extends Point { width: number; height: number }

// Coordinates are projected directly from the supplied PowerPoint SVG.
const sx = 1296 / 4192;
const sy = 393 / 1272;
const project = (x: number, y: number): Point => ({ x: (x - 47) * sx, y: (y - 928) * sy });

export const scene = {
  width: 1296,
  height: 393,
  machine: { ...project(2069, 1074), width: 718 * sx, height: 813 * sy },
  basket: { ...project(3348.5, 1732.5), width: 829 * sx, height: 347 * sy },
  beltTop: (1639 - 928) * sy,
  beltEnd: (3330 - 47) * sx,
  beltRadius: 70.5 * sy,
  flatStart: project(1089.5, 1639).x,
  flatEnd: project(3259.5, 1639).x,
  rampStart: project(135.482, 1854.76),
  rampEnd: project(908.771, 1640.82),
  lemonSize: 104,
  // Narrow collision bodies allow four fruit across without scaling the artwork.
  lemonRadius: { x: 26, y: 26 },
  initialSpacing: 96,
  spawnX: -80,
  artworkAngle: Math.atan2(0.00018935, 0.000307229),
  capacity: 5,
  maxLemons: 18,
  speed: 64,
  supplyInterval: 1.5,
  settleDuration: 0.45,
  step: 1 / 60,
} as const;

// Let the full-size artwork meet the frame with a small amount of natural overhang.
export const basketInterior: Rect = {
  x: scene.basket.x + 12,
  y: scene.basket.y,
  width: scene.basket.width - 24,
  height: scene.basket.height - 12,
};

export const basketFloorAngle = Math.PI / 60;

export function basketFloorAt(x: number): number {
  const right = basketInterior.x + basketInterior.width / 2
    + (basketInterior.width + 14) / 2 * Math.cos(basketFloorAngle);
  return basketInterior.y + basketInterior.height + (x - right) * Math.tan(basketFloorAngle);
}

export const rampAngle = Math.atan2(scene.rampEnd.y - scene.rampStart.y, scene.rampEnd.x - scene.rampStart.x);
export const processingArea: Rect = {
  x: scene.machine.x + 28, y: scene.machine.y + 20,
  width: scene.machine.width - 56, height: scene.beltTop - scene.machine.y + 15,
};

export const assets = {
  lemon: '/src/img/lemon-line/lemon.svg',
  stamped: '/src/img/lemon-line/lemon-stamped.svg',
  belts: '/src/img/lemon-line/belts.svg',
  machine: '/src/img/lemon-line/machine.svg',
  basket: '/src/img/lemon-line/basket.svg',
} as const;

export function inside(point: Point, rect: Rect, padding = 0): boolean {
  return point.x >= rect.x - padding && point.x <= rect.x + rect.width + padding
    && point.y >= rect.y - padding && point.y <= rect.y + rect.height + padding;
}

export function surfaceAt(x: number): number {
  if (x >= 290) return scene.beltTop;
  return scene.rampStart.y + (x - scene.rampStart.x)
    * (scene.rampEnd.y - scene.rampStart.y) / (scene.rampEnd.x - scene.rampStart.x);
}

export function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value));
}

export function releaseVelocity(samples: readonly (Point & { time: number })[], now: number): Point {
  const recent = samples.filter(sample => now - sample.time <= 80);
  const first = recent[0];
  const last = recent.at(-1);
  if (!first || !last || last.time <= first.time || now - last.time > 40) return { x: 0, y: 0 };
  const seconds = (last.time - first.time) / 1000;
  const x = (last.x - first.x) / seconds;
  const y = (last.y - first.y) / seconds;
  const factor = Math.min(1, 900 / Math.hypot(x, y));
  return { x: x * factor, y: y * factor };
}
