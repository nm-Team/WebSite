import Matter from 'matter-js';

import { basketFloorAngle, basketFloorAt, basketInterior, clamp, inside, type Point, processingArea, rampAngle, scene, surfaceAt } from './scene';

const { Bodies, Body, Composite, Engine, Query, Sleeping } = Matter;

export interface Lemon {
  id: number;
  body: Matter.Body;
  stamped: boolean;
  onBelt: boolean;
  reserved: boolean;
  collected: boolean;
  held: boolean;
  settledFor: number;
  impact: number;
  previousVy: number;
}

export class LemonSimulation {
  readonly engine = Engine.create({ enableSleeping: true, positionIterations: 8, velocityIterations: 8 });
  readonly lemons: Lemon[] = [];
  readonly belts: Matter.Body[];
  collecting = 0;
  collections = 0;
  machinePulse = 0;
  beltPhase = 0;
  speed = 0;
  private nextId = 1;
  private supply = 0;
  private disposed = false;

  constructor() {
    this.engine.gravity.y = 1.1;
    const radius = scene.beltRadius;
    const rampTop = { x: -100, y: surfaceAt(-100) };
    const normal = { x: -Math.sin(rampAngle), y: Math.cos(rampAngle) };
    const ramp = Bodies.rectangle(
      (rampTop.x + scene.rampEnd.x) / 2 + normal.x * radius,
      (rampTop.y + scene.rampEnd.y) / 2 + normal.y * radius,
      Math.hypot(scene.rampEnd.x - rampTop.x, scene.rampEnd.y - rampTop.y) + 2 * radius,
      2 * radius, { isStatic: true, angle: rampAngle, friction: 0, chamfer: { radius, quality: 12 } },
    );
    const flat = Bodies.rectangle((scene.flatStart + scene.flatEnd) / 2, scene.beltTop + radius,
      scene.flatEnd - scene.flatStart + 2 * radius, 2 * radius,
      { isStatic: true, friction: 0, chamfer: { radius, quality: 12 } });
    this.belts = [ramp, flat];
    // Matter sets friction to 1 when a body becomes static. Restore the
    // surface materials after construction so the motor and inertia agree.
    for (const belt of this.belts) belt.friction = 0;
    const basket = scene.basket;
    const basketBodies = [
      // A shallow slope feeds the lower row toward the free space on the right.
      Bodies.rectangle(basket.x + basket.width / 2 - 50 * Math.sin(basketFloorAngle),
        basketInterior.y + basketInterior.height + 50 * Math.cos(basketFloorAngle)
          - (basketInterior.width + 14) / 2 * Math.sin(basketFloorAngle),
        basketInterior.width + 14, 100, { isStatic: true, angle: basketFloorAngle, friction: 0.008, frictionStatic: 0 }),
      Bodies.rectangle(basketInterior.x - 3.5, basket.y + basket.height / 2, 7, basket.height, { isStatic: true, friction: 0.01 }),
      Bodies.rectangle(basketInterior.x + basketInterior.width + 3.5, basket.y + basket.height / 2, 7, basket.height, { isStatic: true, friction: 0.01 }),
    ];
    for (const body of basketBodies) { body.friction = 0.008; body.frictionStatic = 0; }
    Composite.add(this.engine.world, [...this.belts, ...basketBodies]);
    for (let x = 32; x < scene.beltEnd; x += scene.initialSpacing) {
      const lemon = this.add({ x, y: this.supportHeight(x) }, x >= processingArea.x);
      lemon.onBelt = true;
    }
    const firstX = basketInterior.x + basketInterior.width - scene.lemonRadius.x;
    const first = this.add({ x: firstX, y: basketFloorAt(firstX) - scene.lemonRadius.y / Math.cos(basketFloorAngle) }, true);
    first.collected = true;
    Sleeping.set(first.body, true);
  }

  get count(): number { return this.lemons.filter(lemon => lemon.collected).length; }
  get occupied(): number { return this.lemons.filter(lemon => lemon.collected || lemon.reserved).length; }
  get full(): boolean { return this.count >= scene.capacity; }
  get held(): Lemon | undefined { return this.lemons.find(lemon => lemon.held); }
  get needsAnimation(): boolean { return !this.disposed; }

  private supportHeight(x: number): number {
    const slope = x < scene.rampEnd.x ? Math.tan(rampAngle) : 0;
    return surfaceAt(x) - Math.hypot(scene.lemonRadius.x * slope, scene.lemonRadius.y);
  }

  add(position: Point, stamped = false): Lemon {
    // Fine polygon sides roll along the shallow floor without catching on facets.
    const vertices = Array.from({ length: 64 }, (_, i) => {
      const angle = i * Math.PI / 32;
      return { x: Math.cos(angle) * scene.lemonRadius.x, y: Math.sin(angle) * scene.lemonRadius.y };
    });
    const body = Bodies.fromVertices(position.x, position.y, [vertices], {
      restitution: 0.08, friction: 0.025, frictionStatic: 0, frictionAir: 0.002, sleepThreshold: 45,
    });
    const lemon: Lemon = {
      id: this.nextId++, body, stamped, onBelt: false, reserved: false,
      collected: false, held: false, settledFor: 0, impact: 0, previousVy: 0,
    };
    this.lemons.push(lemon);
    Composite.add(this.engine.world, body);
    return lemon;
  }

  private process(lemon: Lemon): void {
    if (!lemon.stamped && inside(lemon.body.position, processingArea)) {
      lemon.stamped = true;
      this.machinePulse = 0.16;
    }
  }

  grab(id: number): Lemon | undefined {
    const lemon = this.lemons.find(item => item.id === id);
    if (!lemon || lemon.collected || this.held) return undefined;
    lemon.held = true;
    lemon.reserved = false;
    lemon.onBelt = false;
    lemon.settledFor = 0;
    Body.setStatic(lemon.body, true);
    return lemon;
  }

  moveHeld(position: Point): void {
    const lemon = this.held;
    if (!lemon) return;
    const body = lemon.body;
    const target = { x: clamp(position.x, -150, scene.width + 100), y: clamp(position.y, -160, scene.height + 100) };
    const dx = target.x - body.position.x;
    const dy = target.y - body.position.y;
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 6));
    const obstacles = Composite.allBodies(this.engine.world).filter(other => other !== body);
    const tryMove = (point: Point): boolean => {
      const before = { ...body.position };
      Body.setPosition(body, point);
      if (Query.collides(body, obstacles).some(collision => collision.depth > 0.4)) {
        Body.setPosition(body, before);
        return false;
      }
      return true;
    };
    // Sweep through small movements and slide along contacts. The held body
    // stays solid, so releasing never re-enables deeply overlapping shapes.
    for (let i = 0; i < steps; i++) {
      if (!tryMove({ x: body.position.x + dx / steps, y: body.position.y + dy / steps })) {
        tryMove({ x: body.position.x + dx / steps, y: body.position.y });
        tryMove({ x: body.position.x, y: body.position.y + dy / steps });
      }
      this.process(lemon);
    }
  }

  release(velocity: Point = { x: 0, y: 0 }): void {
    const lemon = this.held;
    if (!lemon) return;
    lemon.held = false;
    Body.setStatic(lemon.body, false);
    Sleeping.set(lemon.body, false);
    const factor = Math.min(1, 900 / Math.max(1, Math.hypot(velocity.x, velocity.y)));
    Body.setVelocity(lemon.body, { x: velocity.x * factor / 60, y: velocity.y * factor / 60 });
    Body.setAngularVelocity(lemon.body, clamp(velocity.x / 12000, -0.07, 0.07));
    this.process(lemon);
  }

  collect(): boolean {
    if (this.count === 0 || this.collecting > 0) return false;
    this.collecting = 0.35;
    return true;
  }

  private emptyBasket(): void {
    for (const lemon of [...this.lemons]) if (lemon.collected) this.remove(lemon);
    this.collecting = 0;
    this.collections++;
    for (const lemon of this.lemons) Sleeping.set(lemon.body, false);
  }

  private remove(lemon: Lemon): void {
    // Matter retains inactive pairs when both bodies are asleep. Wake a
    // removed body so its old contacts are released on the next update.
    Sleeping.set(lemon.body, false);
    Composite.remove(this.engine.world, lemon.body);
    this.lemons.splice(this.lemons.indexOf(lemon), 1);
  }

  isVisible(lemon: Lemon): boolean {
    if (lemon.collected) return false;
    const { min, max } = lemon.body.bounds;
    const machine = scene.machine;
    return min.x < machine.x || max.x > machine.x + machine.width
      || min.y < machine.y || max.y > machine.y + machine.height;
  }

  private isInBasket(lemon: Lemon): boolean {
    const { body } = lemon;
    const basket = scene.basket;
    // The shallow basket permits a raised pile in its rightmost three quarters.
    // Keep the rim gate at the entrance and one unit of wall/floor contact slop.
    const pastRim = body.position.y >= basket.y || body.position.x >= basket.x + basket.width / 4;
    return !lemon.onBelt && !lemon.held && pastRim
      && body.bounds.min.x >= basketInterior.x - 1
      && body.bounds.max.x <= basketInterior.x + basketInterior.width + 1
      && body.bounds.max.y <= basketFloorAt(body.position.x) + 1;
  }

  step(seconds = scene.step): void {
    if (this.disposed) return;
    const dt = Math.min(seconds, scene.step);
    this.machinePulse = Math.max(0, this.machinePulse - dt);
    if (this.collecting > 0) {
      this.collecting = Math.max(0, this.collecting - dt);
      if (!this.collecting) this.emptyBasket();
    }
    const target = scene.speed;
    this.speed += clamp(target - this.speed, -scene.speed * dt / 0.24, scene.speed * dt / 0.24);
    this.beltPhase = (this.beltPhase + this.speed * dt) % 70;
    this.supply += dt;
    if (this.occupied < scene.capacity && this.supply >= scene.supplyInterval && this.lemons.length < scene.maxLemons
      && !this.lemons.some(lemon => Math.abs(lemon.body.position.x - scene.spawnX) < scene.initialSpacing
        && Math.abs(lemon.body.position.y - this.supportHeight(scene.spawnX)) < 65)) {
      const lemon = this.add({ x: scene.spawnX, y: this.supportHeight(scene.spawnX) });
      lemon.onBelt = true;
      this.supply = 0;
    }

    for (const lemon of this.lemons) {
      lemon.impact = Math.max(0, lemon.impact - dt);
      this.process(lemon);
      const body = lemon.body;
      // Keep the lower row free to roll aside while the basket fills.
      if (!lemon.held && body.position.x >= scene.basket.x && body.position.x <= scene.basket.x + scene.basket.width
        && body.position.y >= scene.basket.y - 2 * scene.lemonRadius.y) Sleeping.set(body, false);
      if (lemon.held || lemon.collected) continue;
      lemon.previousVy = body.velocity.y;
      const touching = Query.collides(body, this.belts).length > 0;
      const supported = lemon.onBelt && body.bounds.max.y >= surfaceAt(body.position.x) - 4 && body.velocity.y > -0.7;
      lemon.onBelt = (touching || supported) && body.position.y < surfaceAt(body.position.x) + 4
        && body.position.x < scene.beltEnd;
      if (!lemon.onBelt) continue;
      if (body.position.x > scene.beltEnd - 55 && !lemon.reserved && this.occupied < scene.capacity) lemon.reserved = true;
      const speed = this.speed;
      if (speed > 0) {
        Sleeping.set(body, false);
        const angle = body.position.x < scene.rampEnd.x ? rampAngle : 0;
        const tangent = { x: Math.cos(angle), y: Math.sin(angle) };
        const current = body.velocity.x * tangent.x + body.velocity.y * tangent.y;
        const next = current + clamp(speed / 60 - current, -700 * dt / 60, 700 * dt / 60);
        const gravity = this.engine.gravity.y * this.engine.gravity.scale * (dt * 1000) ** 2 * tangent.y;
        const correction = (next - gravity) / (1 - body.frictionAir) - current;
        Body.setVelocity(body, { x: body.velocity.x + correction * tangent.x, y: body.velocity.y + correction * tangent.y });
        Body.setAngularVelocity(body, clamp(-body.angle * 0.09, -0.02, 0.02));
      } else {
        Body.setVelocity(body, { x: 0, y: 0 });
        Body.setAngularVelocity(body, 0);
        Sleeping.set(body, true);
      }
    }

    Engine.update(this.engine, dt * 1000);
    const basket = scene.basket;
    for (const lemon of [...this.lemons]) {
      this.process(lemon);
      if (lemon.held) continue;
      const body = lemon.body;
      if (body.position.x < -170 || body.position.x > scene.width + 170 || body.position.y > scene.height + 170) {
        this.remove(lemon);
        continue;
      }
      if (lemon.collected && this.collecting > 0) continue;
      const inBasket = this.isInBasket(lemon);
      if (!inBasket) lemon.collected = false;
      if (inBasket && !lemon.collected && !lemon.reserved && this.count < scene.capacity) {
        // A fruit that actually arrives takes priority over an incoming
        // reservation, including one stranded above the basket mouth.
        if (this.occupied >= scene.capacity) {
          const incoming = this.lemons.find(other => other.reserved && !this.isInBasket(other));
          if (incoming) incoming.reserved = false;
        }
        if (this.occupied < scene.capacity) lemon.reserved = true;
      }
      if (lemon.reserved && !lemon.onBelt && !inBasket && (body.position.x < basket.x - 60 || body.position.y > basket.y + basket.height)) lemon.reserved = false;
      if (inBasket && (lemon.reserved || lemon.collected) && body.speed < 0.25 && Math.abs(body.angularVelocity) < 0.02) {
        lemon.settledFor += dt;
        if (lemon.settledFor >= scene.settleDuration && this.collecting === 0) {
          lemon.collected = true;
          lemon.reserved = false;
          body.restitution = 0.05;
        }
      } else lemon.settledFor = 0;
      if (lemon.previousVy > 1.2 && body.velocity.y < lemon.previousVy * 0.5) lemon.impact = 0.16;
    }
    if (this.full && this.collecting === 0
      && this.lemons.filter(lemon => lemon.collected).every(lemon => lemon.settledFor >= scene.settleDuration)) this.collect();
  }

  destroy(): void {
    this.disposed = true;
    Composite.clear(this.engine.world, false);
    Engine.clear(this.engine);
    this.lemons.length = 0;
  }
}
