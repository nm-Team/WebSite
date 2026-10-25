import Matter from 'matter-js';
import { describe, expect, it } from 'vitest';

import { basketFloorAngle, basketFloorAt, basketInterior, processingArea, releaseVelocity, scene } from '@/lib/lemon-line/scene';
import { LemonSimulation } from '@/lib/lemon-line/simulation';

function advance(simulation: LemonSimulation, seconds: number): void {
  for (let i = 0; i < seconds * 60; i++) simulation.step();
}

function positions(simulation: LemonSimulation): string {
  return JSON.stringify(simulation.lemons.map(lemon => ({
    id: lemon.id, x: Math.round(lemon.body.position.x), y: Math.round(lemon.body.position.y),
    reserved: lemon.reserved, collected: lemon.collected, belt: lemon.onBelt,
  })));
}

function emptySimulation(): LemonSimulation {
  const simulation = new LemonSimulation();
  for (const lemon of simulation.lemons) Matter.Composite.remove(simulation.engine.world, lemon.body);
  simulation.lemons.length = 0;
  return simulation;
}

describe('lemon production simulation', () => {
  it('starts with a dense line and marks every lemon that has already passed the processor', () => {
    const simulation = new LemonSimulation();
    expect(simulation.lemons.filter(lemon => lemon.onBelt)).toHaveLength(11);
    for (const lemon of simulation.lemons) {
      if (lemon.body.position.x >= processingArea.x) expect(lemon.stamped).toBe(true);
    }
    expect(simulation.lemons.filter(lemon => !simulation.isVisible(lemon)).length).toBeGreaterThan(1);
    simulation.destroy();
  });

  it('marks a lemon dragged into the processor and keeps it hidden while held and released', () => {
    const simulation = new LemonSimulation();
    const lemon = simulation.lemons[0];
    simulation.grab(lemon.id);
    simulation.moveHeld({ x: 32, y: 0 });
    simulation.moveHeld({ x: scene.machine.x + 110, y: 0 });
    simulation.moveHeld({ x: scene.machine.x + 110, y: 120 });
    expect(lemon.stamped).toBe(true);
    expect(simulation.isVisible(lemon)).toBe(false);
    simulation.release();
    expect(simulation.isVisible(lemon)).toBe(false);
    advance(simulation, 3);
    expect(lemon.stamped).toBe(true);
    simulation.destroy();
  });

  it('keeps a lemon carried above the machine unmarked', () => {
    const simulation = new LemonSimulation();
    const raw = simulation.lemons[0];
    simulation.grab(raw.id);
    simulation.moveHeld({ x: 32, y: 0 });
    simulation.moveHeld({ x: scene.basket.x + 170, y: 0 });
    simulation.moveHeld({ x: scene.basket.x + 170, y: scene.basket.y - 60 });
    simulation.release();
    for (let frame = 0; frame < 5 * 60 && !raw.collected; frame++) simulation.step();
    expect(raw.stamped).toBe(false);
    expect(raw.collected, positions(simulation)).toBe(true);
    simulation.destroy();
  });

  it('moves at the same speed as the conveyor dots once accelerated', () => {
    const simulation = new LemonSimulation();
    const lemon = simulation.lemons.find(lemon => lemon.body.position.x === 416)!;
    advance(simulation, 0.5);
    const x = lemon.body.position.x;
    const phase = simulation.beltPhase;
    advance(simulation, 1);
    expect(lemon.body.position.x - x).toBeCloseTo(scene.speed, 0);
    expect((simulation.beltPhase - phase + 70) % 70).toBeCloseTo(scene.speed, 1);
    simulation.destroy();
  });

  it('uses the same startup acceleration for outgoing and upstream fruit', () => {
    const simulation = new LemonSimulation();
    const outgoing = simulation.lemons.filter(lemon => lemon.onBelt).at(-1)!;
    simulation.step();
    expect(outgoing.reserved).toBe(true);
    expect(outgoing.body.velocity.x * 60).toBeCloseTo(simulation.speed, 1);
    simulation.destroy();
  });

  it('leaves the conveyor under gravity without an upward or forward launch', () => {
    const simulation = new LemonSimulation();
    const lemon = simulation.lemons.filter(lemon => lemon.onBelt).at(-1)!;
    const basketBodies = simulation.engine.world.bodies.filter(body => body.isStatic && !simulation.belts.includes(body));
    let leftBelt = false;
    let previousVx = 0;
    for (let i = 0; i < 120 && lemon.body.position.y < scene.beltTop + 30; i++) {
      simulation.step();
      leftBelt ||= !lemon.onBelt;
      // A later impact with the basket can legitimately reverse vertical speed.
      if (Matter.Query.collides(lemon.body, basketBodies).length > 0) break;
      expect(lemon.body.velocity.x * 60 - previousVx).toBeLessThan(120);
      expect(lemon.body.velocity.y).toBeGreaterThan(-0.2);
      previousVx = lemon.body.velocity.x * 60;
    }
    expect(leftBelt, positions(simulation)).toBe(true);
    simulation.destroy();
  });

  it('matches the dot speed along the inclined surface', () => {
    const simulation = new LemonSimulation();
    const lemon = simulation.lemons.find(lemon => lemon.body.position.x === 128)!;
    advance(simulation, 0.5);
    const before = { ...lemon.body.position };
    advance(simulation, 1);
    expect(Math.hypot(lemon.body.position.x - before.x, lemon.body.position.y - before.y)).toBeCloseTo(scene.speed, 0);
    simulation.destroy();
  });

  it('keeps held fruit solid and releases it without a position jump', () => {
    const simulation = new LemonSimulation();
    const lemon = simulation.lemons[0];
    const other = simulation.lemons.find(lemon => lemon.body.position.x === 416)!;
    simulation.grab(lemon.id);
    simulation.moveHeld({ x: 32, y: 0 });
    simulation.moveHeld({ x: other.body.position.x, y: 0 });
    simulation.moveHeld({ ...other.body.position });
    const contacts = Matter.Query.collides(lemon.body, [other.body]);
    expect(contacts.every(contact => contact.depth <= 0.4)).toBe(true);
    expect(lemon.body.position.y).toBeLessThan(other.body.position.y - 50);
    const before = { ...lemon.body.position };
    simulation.release();
    simulation.step();
    expect(Math.hypot(lemon.body.position.x - before.x, lemon.body.position.y - before.y)).toBeLessThan(2);
    simulation.destroy();
  });

  it('collects partial baskets while production keeps moving', () => {
    const simulation = new LemonSimulation();
    const before = positions(simulation);
    expect(simulation.count).toBe(1);
    expect(simulation.collect()).toBe(true);
    expect(simulation.collect()).toBe(false);
    advance(simulation, 0.4);
    expect(simulation.collections).toBe(1);
    expect(positions(simulation)).not.toBe(before);
    for (let frame = 0; frame < 600 && simulation.count === 0; frame++) simulation.step();
    expect(simulation.count).toBeGreaterThan(0);
    expect(simulation.collect()).toBe(true);
    expect(simulation.needsAnimation).toBe(true);
    simulation.destroy();
    expect(simulation.needsAnimation).toBe(false);
  });

  it('releases reservations on grab and recycles escaped objects', () => {
    const simulation = new LemonSimulation();
    advance(simulation, 0.3);
    const reserved = simulation.lemons.find(lemon => lemon.reserved)!;
    const occupied = simulation.occupied;
    expect(simulation.grab(reserved.id)).toBe(reserved);
    expect(simulation.occupied).toBe(occupied - 1);
    simulation.release();
    Matter.Body.setPosition(reserved.body, { x: scene.width + 180, y: scene.height });
    simulation.step();
    expect(simulation.lemons).not.toContain(reserved);
    simulation.destroy();
  });

  it('spawns the entire sprite outside the left edge and moves it into view', () => {
    const simulation = new LemonSimulation();
    const initialIds = new Set(simulation.lemons.map(lemon => lemon.id));
    for (let frame = 0; frame < 180 && simulation.lemons.every(lemon => initialIds.has(lemon.id)); frame++) simulation.step();
    const incoming = simulation.lemons.find(lemon => !initialIds.has(lemon.id))!;
    expect(incoming).toBeDefined();
    expect(incoming.body.position.x + scene.lemonSize / Math.SQRT2).toBeLessThan(0);
    advance(simulation, 1.5);
    expect(incoming.body.position.x).toBeGreaterThan(0);
    simulation.destroy();
  });

  it('keeps the rim gate at the entrance and the wall bounds across the basket', () => {
    const simulation = new LemonSimulation();
    let maximumCount = 0;
    for (let frame = 0; frame < 40 * 60; frame++) {
      simulation.step();
      maximumCount = Math.max(maximumCount, simulation.count);
      if (simulation.collecting > 0) continue;
      for (const lemon of simulation.lemons.filter(lemon => lemon.collected)) {
        if (lemon.body.position.x < scene.basket.x + scene.basket.width / 4) {
          expect(lemon.body.position.y, positions(simulation)).toBeGreaterThanOrEqual(scene.basket.y);
        }
        expect(lemon.body.bounds.min.x).toBeGreaterThanOrEqual(basketInterior.x - 1);
        expect(lemon.body.bounds.max.x).toBeLessThanOrEqual(basketInterior.x + basketInterior.width + 1);
      }
    }
    expect(maximumCount).toBeGreaterThanOrEqual(3);
    simulation.destroy();
  });

  it.each([
    { fraction: 0.25 - 0.01, collected: false },
    { fraction: 0.25 + 0.01, collected: true },
    { fraction: 0.5, collected: true },
    { fraction: 0.75, collected: true },
  ])('counts a raised, settled pile at basket fraction $fraction: $collected', ({ fraction, collected }) => {
    const simulation = emptySimulation();
    const x = scene.basket.x + scene.basket.width * fraction;
    const floorY = basketFloorAt(x);
    const pile = Array.from({ length: 3 }, (_, row) => simulation.add({
      x, y: floorY - scene.lemonRadius.x * (1 + 2 * row),
    }));
    // Start with a resting pile to isolate the region boundary. The natural
    // pile test below exercises settling with the full collision simulation.
    for (const lemon of pile) {
      Matter.Body.setAngle(lemon.body, Math.PI / 2);
      Matter.Sleeping.set(lemon.body, true);
    }
    const [lower, , upper] = pile;
    advance(simulation, 1);
    expect(upper.body.position.y).toBeLessThan(scene.basket.y);
    expect(lower.collected).toBe(true);
    expect(upper.collected, positions(simulation)).toBe(collected);
    simulation.destroy();
  });

  it('does not count a flying lemon above the raised-pile area before it settles', () => {
    const simulation = emptySimulation();
    const lemon = simulation.add({ x: scene.basket.x + scene.basket.width * 0.8, y: 50 });
    advance(simulation, 0.3);
    expect(lemon.body.position.y).toBeLessThan(scene.basket.y);
    expect(lemon.collected).toBe(false);
    expect(simulation.count).toBe(0);
    simulation.destroy();
  });

  it('settles four fruit side by side on the original basket floor', () => {
    const simulation = emptySimulation();
    const basket = basketInterior;
    const pitch = basket.width / 4;
    const fruit = Array.from({ length: 4 }, (_, column) => simulation.add({
      x: basket.x + (column + 0.5) * pitch,
      y: basket.y + 45,
    }, true));
    advance(simulation, 1.2);
    expect(simulation.count, positions(simulation)).toBe(4);
    expect(simulation.collecting).toBe(0);
    expect(simulation.collections).toBe(0);
    for (const lemon of fruit) {
      expect(Math.abs(lemon.body.bounds.max.y - basketFloorAt(lemon.body.position.x))).toBeLessThan(1);
      expect(lemon.body.bounds.min.x).toBeGreaterThanOrEqual(basket.x - 1);
      expect(lemon.body.bounds.max.x).toBeLessThanOrEqual(basket.x + basket.width + 1);
      expect(Matter.Query.collides(lemon.body, fruit.filter(other => other !== lemon).map(other => other.body))
        .every(contact => contact.depth <= 0.4)).toBe(true);
    }
    simulation.destroy();
  });

  it.each([0, Math.PI / 3, Math.PI / 2])('keeps rotated fruit inside the inset basket walls and floor at angle %s', angle => {
    const simulation = emptySimulation();
    const fruit = [-1, 1].map(direction => {
      const lemon = simulation.add({
        x: basketInterior.x + basketInterior.width / 2 + direction * (basketInterior.width / 2 - 30),
        y: basketInterior.y + 40,
      });
      Matter.Body.setAngle(lemon.body, angle);
      Matter.Body.setVelocity(lemon.body, { x: direction * 2, y: 0 });
      return lemon;
    });
    advance(simulation, 1.2);
    for (const lemon of fruit) {
      expect(lemon.body.bounds.min.x).toBeGreaterThanOrEqual(basketInterior.x - 1);
      expect(lemon.body.bounds.max.x).toBeLessThanOrEqual(basketInterior.x + basketInterior.width + 1);
      expect(Math.abs(lemon.body.bounds.max.y - basketFloorAt(lemon.body.position.x))).toBeLessThan(1);
      // Reserve enough room for the 104-unit artwork, including rotated leaf tips.
      expect(lemon.body.position.x - scene.lemonSize / 2).toBeGreaterThanOrEqual(scene.basket.x - 7);
      expect(lemon.body.position.x + scene.lemonSize / 2).toBeLessThanOrEqual(scene.basket.x + scene.basket.width + 7);
      expect(lemon.body.position.y + scene.lemonSize / 2).toBeLessThanOrEqual(scene.basket.y + scene.basket.height + 3);
    }
    simulation.destroy();
  });

  it('waits at four fruit and collects only after the fifth settles', () => {
    const simulation = emptySimulation();
    const basket = basketInterior;
    const pitch = basket.width / 4;
    const fruit = Array.from({ length: 4 }, (_, column) => {
      const x = basket.x + (column + 0.5) * pitch;
      return simulation.add({ x, y: basketFloorAt(x) - scene.lemonRadius.y / Math.cos(basketFloorAngle) }, true);
    });
    advance(simulation, 1.2);
    expect(simulation.count, positions(simulation)).toBe(4);
    expect(simulation.collections).toBe(0);
    expect(simulation.collecting).toBe(0);
    fruit.push(simulation.add({ x: basket.x + 2 * pitch, y: basket.y - 10 }, true));
    advance(simulation, 0.3);
    expect(simulation.collecting).toBe(0);
    expect(simulation.collections).toBe(0);
    advance(simulation, 1);
    expect(simulation.collections, positions(simulation)).toBe(1);
    for (const lemon of fruit) expect(simulation.lemons).not.toContain(lemon);
    simulation.destroy();
  });

  it('automatically collects the first naturally formed pile of five', () => {
    const simulation = new LemonSimulation();
    for (let frame = 0; frame < 20 * 60 && simulation.collecting === 0; frame++) simulation.step();
    expect(simulation.count, positions(simulation)).toBe(5);
    expect(simulation.collecting).toBeGreaterThan(0);
    advance(simulation, 0.4);
    expect(simulation.collections).toBe(1);
    simulation.destroy();
  });

  it('gives arrived fruit priority over reservations still outside the basket', () => {
    const simulation = emptySimulation();
    const incoming = Array.from({ length: 5 }, (_, i) => simulation.add({ x: scene.basket.x + 60, y: -300 - i * 70 }));
    for (const lemon of incoming) lemon.reserved = true;
    const arrived = simulation.add({ x: scene.basket.x + 130, y: basketFloorAt(scene.basket.x + 130) - scene.lemonRadius.y });
    advance(simulation, 0.7);
    expect(arrived.collected).toBe(true);
    expect(simulation.occupied).toBe(scene.capacity);
    expect(incoming.filter(lemon => lemon.reserved)).toHaveLength(4);
    simulation.destroy();
  });

  it('recycles repeated partial collections over five minutes without unbounded objects', () => {
    const simulation = new LemonSimulation();
    let maximum = 0;
    for (let i = 0; i < 300 * 60; i++) {
      simulation.step();
      if (i % 180 === 0) simulation.collect();
      maximum = Math.max(maximum, simulation.lemons.length);
      expect(simulation.count).toBeLessThanOrEqual(scene.capacity);
    }
    expect(simulation.collections, positions(simulation)).toBeGreaterThan(20);
    expect(maximum).toBeLessThanOrEqual(scene.maxLemons);
    simulation.step();
    const liveBodies = new Set(simulation.engine.world.bodies);
    expect(simulation.engine.pairs.list.every((pair: Matter.Pair) => liveBodies.has(pair.bodyA) && liveBodies.has(pair.bodyB))).toBe(true);
    simulation.destroy();
    expect(simulation.engine.world.bodies).toHaveLength(0);
  }, 15_000);

  it('automatically collects five-fruit baskets for five minutes without a prolonged jam', () => {
    const simulation = new LemonSimulation();
    let lastCollection = 0;
    let collections = 0;
    let longestWait = 0;
    for (let frame = 0; frame < 300 * 60; frame++) {
      simulation.step();
      if (simulation.collections > collections) {
        collections = simulation.collections;
        lastCollection = frame;
      }
      longestWait = Math.max(longestWait, frame - lastCollection);
      expect(simulation.lemons.length).toBeLessThanOrEqual(scene.maxLemons);
    }
    expect(collections, positions(simulation)).toBeGreaterThanOrEqual(20);
    expect(longestWait).toBeLessThan(30 * 60);
    simulation.destroy();
  }, 15_000);

});

it('uses recent pointer motion, limits throws, and drops stationary releases', () => {
  expect(releaseVelocity([{ x: 0, y: 0, time: 0 }, { x: 10, y: 5, time: 50 }], 50)).toEqual({ x: 200, y: 100 });
  const fast = releaseVelocity([{ x: 0, y: 0, time: 0 }, { x: 1000, y: 1000, time: 50 }], 50);
  expect(Math.hypot(fast.x, fast.y)).toBeCloseTo(900);
  expect(releaseVelocity([{ x: 0, y: 0, time: 0 }, { x: 100, y: 0, time: 40 }], 100)).toEqual({ x: 0, y: 0 });
});
