import type { MapDefinition } from '../maps/Map';
import { getMapPath } from '../maps/MapDefinitions';

export class Enemy {
  public id: number;
  public x: number = 0;
  public y: number = 0;
  public pathIndex: number = 0;
  public distanceTraveled: number = 0;
  public isDead: boolean = false;
  public hasReachedEnd: boolean = false;

  // Effects
  public freezeTimer: number = 0;
  public poisonTimer: number = 0;
  public poisonDamage: number = 0;

  constructor(
    public maxHealth: number,
    public health: number,
    public speed: number,
    public reward: number,
    public radius: number,
    public color: string,
    public type: string,
    id: number
  ) {
    this.id = id;
  }

  public update(dt: number, mapDef: MapDefinition, canvasWidth: number, canvasHeight: number) {
    if (this.isDead || this.hasReachedEnd) return;

    // Apply poison
    if (this.poisonTimer > 0) {
      this.poisonTimer -= dt;
      this.health -= this.poisonDamage * (dt / 1000); // dps
      if (this.health <= 0) {
        this.isDead = true;
        return;
      }
    }

    // Apply slow
    let currentSpeed = this.speed;
    if (this.freezeTimer > 0) {
      this.freezeTimer -= dt;
      currentSpeed *= 0.5; // 50% slow
    }

    const points = getMapPath(mapDef, canvasWidth, canvasHeight);

    if (this.pathIndex === 0 && this.x === 0 && this.y === 0) {
      this.x = points[0].x;
      this.y = points[0].y;
    }

    const target = points[this.pathIndex + 1];
    if (!target) {
      this.hasReachedEnd = true;
      return;
    }

    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // speed is per second relative to a base width to make it resolution independent somewhat, but for now just raw pixels per second
    const moveDist = (currentSpeed * canvasWidth / 1000) * (dt / 1000);

    if (dist <= moveDist) {
      this.x = target.x;
      this.y = target.y;
      this.pathIndex++;
      this.distanceTraveled += dist;
    } else {
      this.x += (dx / dist) * moveDist;
      this.y += (dy / dist) * moveDist;
      this.distanceTraveled += moveDist;
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw health bar
    const hpPercent = this.health / this.maxHealth;
    ctx.fillStyle = 'red';
    ctx.fillRect(this.x - this.radius, this.y - this.radius - 8, this.radius * 2, 4);
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(this.x - this.radius, this.y - this.radius - 8, this.radius * 2 * hpPercent, 4);

    // Draw effects
    if (this.freezeTimer > 0) {
      ctx.strokeStyle = '#00bcd4';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    if (this.poisonTimer > 0) {
      ctx.fillStyle = 'rgba(76, 175, 80, 0.5)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  public takeDamage(amount: number) {
    this.health -= amount;
    if (this.health <= 0) {
      this.isDead = true;
    }
  }
}