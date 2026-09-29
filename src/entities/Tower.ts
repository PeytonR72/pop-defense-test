import { Enemy } from './Enemy';

export interface TowerUpgrade {
  name: string;
  cost: number;
  damageBonus?: number;
  rangeBonus?: number;
  fireRateBonus?: number; // negative is faster
  special?: string;
}

export type TargetingMode = 'First' | 'Last' | 'Strong' | 'Weak';

export class Tower {
  public id: number;
  public x: number;
  public y: number;
  public upgradesApplied: number = 0;

  public cooldown: number = 0;
  public targetingMode: TargetingMode = 'First';
  public buffMultiplier: number = 1.0;

  constructor(
    public name: string,
    public cost: number,
    public damage: number,
    public range: number,
    public fireRate: number, // ms between shots
    public color: string,
    public radius: number,
    public upgrades: TowerUpgrade[],
    id: number,
    x: number,
    y: number
  ) {
    this.id = id;
    this.x = x;
    this.y = y;
  }

  public getSellValue(): number {
    let totalCost = this.cost;
    for (let i = 0; i < this.upgradesApplied; i++) {
      totalCost += this.upgrades[i].cost;
    }
    return Math.floor(totalCost * 0.7);
  }

  public upgrade() {
    if (this.upgradesApplied < this.upgrades.length) {
      const upg = this.upgrades[this.upgradesApplied];
      if (upg.damageBonus) this.damage += upg.damageBonus;
      if (upg.rangeBonus) this.range += upg.rangeBonus;
      if (upg.fireRateBonus) this.fireRate += upg.fireRateBonus;
      this.upgradesApplied++;
    }
  }

  public getNextUpgrade(): TowerUpgrade | null {
    if (this.upgradesApplied < this.upgrades.length) {
      return this.upgrades[this.upgradesApplied];
    }
    return null;
  }

  // To be overridden by specific tower types
  public update(dt: number, _enemies: Enemy[], _addProjectile: (p: any) => void) {
    if (this.cooldown > 0) {
      this.cooldown -= dt;
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    // A simple base drawing, can be overridden
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw little upgrade indicators
    ctx.fillStyle = '#fff';
    for (let i = 0; i < this.upgradesApplied; i++) {
      ctx.fillRect(this.x - this.radius + i * 6 + 2, this.y + this.radius + 2, 4, 4);
    }
  }

  public findTarget(enemies: Enemy[]): Enemy | null {
    let validEnemies = enemies.filter(e => {
      const dx = e.x - this.x;
      const dy = e.y - this.y;
      return Math.sqrt(dx * dx + dy * dy) <= this.range && !e.isDead && !e.hasReachedEnd;
    });

    if (validEnemies.length === 0) return null;

    switch (this.targetingMode) {
      case 'Last':
        return validEnemies.sort((a, b) => a.distanceTraveled - b.distanceTraveled)[0];
      case 'Strong':
        return validEnemies.sort((a, b) => b.health - a.health)[0];
      case 'Weak':
        return validEnemies.sort((a, b) => a.health - b.health)[0];
      case 'First':
      default:
        return validEnemies.sort((a, b) => b.distanceTraveled - a.distanceTraveled)[0];
    }
  }
}