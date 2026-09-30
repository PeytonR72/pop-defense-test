import { Enemy } from './Enemy';

export class Projectile {
  public id: number;
  public x: number;
  public y: number;
  public target: Enemy | null = null;
  public isDead: boolean = false;

  constructor(
    public sourceX: number,
    public sourceY: number,
    target: Enemy | null,
    public damage: number,
    public speed: number, // pixels per second
    public type: string,
    public color: string,
    id: number,
    public extraParams?: any // for splash radius, chain count, pierce count, etc.
  ) {
    this.x = sourceX;
    this.y = sourceY;
    this.target = target;
    this.id = id;

    // For linear non-homing projectiles (like laser/pierce) we might store target dir
    if (this.extraParams && this.extraParams.targetPos) {
      const dx = this.extraParams.targetPos.x - this.x;
      const dy = this.extraParams.targetPos.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      this.extraParams.vx = (dx / dist) * this.speed;
      this.extraParams.vy = (dy / dist) * this.speed;
    }
  }

  public update(dt: number, enemies: Enemy[], onHit: (p: Projectile, e: Enemy) => void) {
    if (this.isDead) return;

    if (this.type === 'Laser') {
      // Instant hit
      if (this.target && !this.target.isDead) {
        onHit(this, this.target);
      }
      this.isDead = true;
      return;
    }

    if (this.type === 'Pierce') {
      // Moves linearly, hits anything it touches
      this.x += this.extraParams.vx * (dt / 1000);
      this.y += this.extraParams.vy * (dt / 1000);

      this.extraParams.distanceTraveled = (this.extraParams.distanceTraveled || 0) + this.speed * (dt / 1000);
      if (this.extraParams.distanceTraveled > 1000) { // arbitrary max distance
        this.isDead = true;
        return;
      }

      for (const e of enemies) {
        if (e.isDead) continue;
        if (this.extraParams.hitList && this.extraParams.hitList.includes(e.id)) continue;

        const dx = e.x - this.x;
        const dy = e.y - this.y;
        if (Math.sqrt(dx * dx + dy * dy) <= e.radius + 5) {
          onHit(this, e);
          if (!this.extraParams.hitList) this.extraParams.hitList = [];
          this.extraParams.hitList.push(e.id);
          this.extraParams.pierceCount--;
          if (this.extraParams.pierceCount <= 0) {
            this.isDead = true;
            break;
          }
        }
      }
      return;
    }

    if (this.type === 'SpikeTrap' || this.type === 'ExplosiveTrap') {
      // Trap logic - stationary until stepped on
      for (const e of enemies) {
        if (e.isDead) continue;
        const dx = e.x - this.x;
        const dy = e.y - this.y;
        if (Math.sqrt(dx * dx + dy * dy) <= e.radius + 15) { // trigger radius
          onHit(this, e);
          this.isDead = true;
          break;
        }
      }
      return;
    }

    // Homing logic (default)
    if (!this.target || this.target.isDead) {
      this.isDead = true; // Could try to find a new target, but fizzle is fine for now
      return;
    }

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const moveDist = this.speed * (dt / 1000);

    if (dist <= moveDist + this.target.radius) {
      onHit(this, this.target);
      this.isDead = true;
    } else {
      this.x += (dx / dist) * moveDist;
      this.y += (dy / dist) * moveDist;
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    if (this.type === 'Laser' && this.target && !this.isDead) {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(this.sourceX, this.sourceY);
      ctx.lineTo(this.target.x, this.target.y);
      ctx.stroke();
      return;
    }

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}