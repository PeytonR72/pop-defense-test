import { Tower } from './Tower';
import type { TowerUpgrade } from './Tower';
import { Projectile } from './Projectile';
import { Enemy } from './Enemy';

let nextProjId = 0;

export function createTower(type: string, x: number, y: number, id: number): Tower | null {

  // Upgrade paths
  const basicUpgrades: TowerUpgrade[] = [
    { name: 'Faster Firing', cost: 50, fireRateBonus: -200 },
    { name: 'More Damage', cost: 100, damageBonus: 5 },
    { name: 'Elite Shooter', cost: 250, damageBonus: 10, rangeBonus: 30, fireRateBonus: -100 }
  ];

  const sniperUpgrades: TowerUpgrade[] = [
    { name: 'Longer Barrel', cost: 150, rangeBonus: 200 },
    { name: 'High Caliber', cost: 300, damageBonus: 30 },
    { name: 'Armor Piercing', cost: 500, damageBonus: 50, special: 'pierce' }
  ];

  const splashUpgrades: TowerUpgrade[] = [
    { name: 'Bigger Bang', cost: 100, special: 'radiusUp1' },
    { name: 'Shrapnel', cost: 200, damageBonus: 5 },
    { name: 'MOAB Buster', cost: 450, damageBonus: 20, special: 'radiusUp2' }
  ];

  const slowUpgrades: TowerUpgrade[] = [
    { name: 'Deep Freeze', cost: 120, special: 'longerSlow' },
    { name: 'Wider Aura', cost: 200, rangeBonus: 50 },
    { name: 'Arctic Blast', cost: 400, special: 'maxSlow' }
  ];

  const poisonUpgrades: TowerUpgrade[] = [
    { name: 'Toxic Brew', cost: 150, damageBonus: 2 }, // dot damage
    { name: 'Corrosive', cost: 250, damageBonus: 3 },
    { name: 'Plague', cost: 500, special: 'chainPoison' }
  ];

  const laserUpgrades: TowerUpgrade[] = [
    { name: 'Focus Lens', cost: 200, fireRateBonus: -200 },
    { name: 'Overcharge', cost: 400, damageBonus: 8 },
    { name: 'Death Ray', cost: 800, damageBonus: 20, rangeBonus: 50 }
  ];

  const supportUpgrades: TowerUpgrade[] = [
    { name: 'Rally', cost: 300, special: 'buffRange' },
    { name: 'Inspire', cost: 500, special: 'buffFireRate' },
    { name: 'Command Center', cost: 1000, special: 'buffDamage' }
  ];

  const multishotUpgrades: TowerUpgrade[] = [
    { name: 'Twin Shot', cost: 250, special: 'shot2' },
    { name: 'Triple Shot', cost: 500, special: 'shot3' },
    { name: 'Bullet Hell', cost: 1200, special: 'shot5', fireRateBonus: -100 }
  ];

  const chainLightningUpgrades: TowerUpgrade[] = [
    { name: 'Static Charge', cost: 300, special: 'chain3' },
    { name: 'High Voltage', cost: 600, damageBonus: 5 },
    { name: 'Thunderstorm', cost: 1200, special: 'chain5', rangeBonus: 40 }
  ];

  const trapUpgrades: TowerUpgrade[] = [
    { name: 'Spike Factory', cost: 150, fireRateBonus: -500 },
    { name: 'Caltrops', cost: 300, damageBonus: 5 },
    { name: 'Minefield', cost: 800, damageBonus: 20, special: 'explosiveTrap' }
  ];

  class StandardShooter extends Tower {
    public update(dt: number, enemies: Enemy[], addProjectile: (p: any) => void) {
      if (this.cooldown > 0) {
        this.cooldown -= dt;
      }
      if (this.cooldown <= 0) {
        const target = this.findTarget(enemies);
        if (target) {
          const p = new Projectile(this.x, this.y, target, this.damage * this.buffMultiplier, 300, 'Normal', '#ff9800', nextProjId++);
          addProjectile(p);
          this.cooldown = this.fireRate / this.buffMultiplier;
        }
      }
    }
  }

  class SniperTower extends Tower {
    public update(dt: number, enemies: Enemy[], addProjectile: (p: any) => void) {
      if (this.cooldown > 0) this.cooldown -= dt;
      if (this.cooldown <= 0) {
        const target = this.findTarget(enemies);
        if (target) {
          const isPierce = this.upgradesApplied >= 3;
          const p = new Projectile(this.x, this.y, target, this.damage * this.buffMultiplier, 1000, isPierce ? 'Pierce' : 'Normal', '#3e2723', nextProjId++, {
            pierceCount: isPierce ? 3 : 1,
            targetPos: { x: target.x, y: target.y }
          });
          addProjectile(p);
          this.cooldown = this.fireRate / this.buffMultiplier;
        }
      }
    }
  }

  class SplashTower extends Tower {
    public update(dt: number, enemies: Enemy[], addProjectile: (p: any) => void) {
      if (this.cooldown > 0) this.cooldown -= dt;
      if (this.cooldown <= 0) {
        const target = this.findTarget(enemies);
        if (target) {
          let splashRadius = 50;
          if (this.upgradesApplied >= 1) splashRadius = 75;
          if (this.upgradesApplied >= 3) splashRadius = 100;

          const p = new Projectile(this.x, this.y, target, this.damage * this.buffMultiplier, 250, 'Splash', '#f44336', nextProjId++, { splashRadius });
          addProjectile(p);
          this.cooldown = this.fireRate / this.buffMultiplier;
        }
      }
    }
  }

  class SlowTower extends Tower {
    public update(dt: number, enemies: Enemy[], addProjectile: (p: any) => void) {
      if (this.cooldown > 0) this.cooldown -= dt;
      if (this.cooldown <= 0) {
        const target = this.findTarget(enemies); // Find closest, but really we want to hit one not frozen
        if (target) {
          let freezeDuration = 2000;
          if (this.upgradesApplied >= 1) freezeDuration = 3000;
          if (this.upgradesApplied >= 3) freezeDuration = 5000;

          const p = new Projectile(this.x, this.y, target, this.damage * this.buffMultiplier, 400, 'Slow', '#00bcd4', nextProjId++, { freezeDuration });
          addProjectile(p);
          this.cooldown = this.fireRate / this.buffMultiplier;
        }
      }
    }
  }

  class PoisonTower extends Tower {
    public update(dt: number, enemies: Enemy[], addProjectile: (p: any) => void) {
      if (this.cooldown > 0) this.cooldown -= dt;
      if (this.cooldown <= 0) {
        // prefer targets without poison
        let target: Enemy | null | undefined = enemies.find(e => {
           const dx = e.x - this.x; const dy = e.y - this.y;
           return Math.sqrt(dx*dx + dy*dy) <= this.range && !e.isDead && !e.hasReachedEnd && e.poisonTimer <= 0;
        });
        if (!target) target = this.findTarget(enemies); // fallback

        if (target) {
          const duration = 5000;
          const chain = this.upgradesApplied >= 3;
          const p = new Projectile(this.x, this.y, target, this.damage * this.buffMultiplier, 200, 'Poison', '#4caf50', nextProjId++, { duration, chain });
          addProjectile(p);
          this.cooldown = this.fireRate / this.buffMultiplier;
        }
      }
    }
  }

  class LaserTower extends Tower {
    public update(dt: number, enemies: Enemy[], addProjectile: (p: any) => void) {
      if (this.cooldown > 0) this.cooldown -= dt;
      if (this.cooldown <= 0) {
        const target = this.findTarget(enemies);
        if (target) {
          const p = new Projectile(this.x, this.y, target, this.damage * this.buffMultiplier, 0, 'Laser', '#00e5ff', nextProjId++);
          addProjectile(p);
          this.cooldown = this.fireRate / this.buffMultiplier;
        }
      }
    }
  }

  // Aura buffer (no projectiles)
  class SupportTower extends Tower {
    public buffMultiplier = 1;
    public update(_dt: number, _enemies: Enemy[], _addProjectile: (p: any) => void) {
      // Support tower applies buff in Game loop to nearby towers
    }
  }

  class MultishotTower extends Tower {
    public update(dt: number, enemies: Enemy[], addProjectile: (p: any) => void) {
      if (this.cooldown > 0) this.cooldown -= dt;
      if (this.cooldown <= 0) {
        const target = this.findTarget(enemies);
        if (target) {
          let count = 1;
          if (this.upgradesApplied >= 1) count = 2;
          if (this.upgradesApplied >= 2) count = 3;
          if (this.upgradesApplied >= 3) count = 5;

          for(let i=0; i<count; i++) {
            // slight delay or offset, we'll just offset target position slightly
            // We cannot just clone the enemy object with spread because it loses prototype methods like takeDamage.
            // Instead we just provide a custom target pos via extraParams to a piercing style projectile that does normal homing
            // or we just use normal target but offset its visual position. Let's just create a mock target object with the required properties and proxy to the real target.
            const p = new Projectile(this.x, this.y, target, this.damage * this.buffMultiplier, 350, 'Normal', '#ffeb3b', nextProjId++);
            // Add jitter directly to the projectile's starting pos or trajectory
            p.x += (Math.random()*20-10);
            p.y += (Math.random()*20-10);
            addProjectile(p);
          }
          this.cooldown = this.fireRate / this.buffMultiplier;
        }
      }
    }
  }

  class ChainLightningTower extends Tower {
    public update(dt: number, enemies: Enemy[], addProjectile: (p: any) => void) {
      if (this.cooldown > 0) this.cooldown -= dt;
      if (this.cooldown <= 0) {
        const target = this.findTarget(enemies);
        if (target) {
          let chainCount = 2;
          if (this.upgradesApplied >= 1) chainCount = 3;
          if (this.upgradesApplied >= 3) chainCount = 5;

          const p = new Projectile(this.x, this.y, target, this.damage * this.buffMultiplier, 600, 'Lightning', '#ffc107', nextProjId++, { chainCount, hitIds: [] });
          addProjectile(p);
          this.cooldown = this.fireRate / this.buffMultiplier;
        }
      }
    }
  }

  class TrapTower extends Tower {
    public update(dt: number, _enemies: Enemy[], addProjectile: (p: any) => void) {
      if (this.cooldown > 0) this.cooldown -= dt;
      if (this.cooldown <= 0) {
        // Just drops a trap on the nearest path
        // For simplicity, we drop it near the tower's location as a stationary projectile
        const isExplosive = this.upgradesApplied >= 3;
        const p = new Projectile(this.x, this.y, null, this.damage * this.buffMultiplier, 0, isExplosive ? 'ExplosiveTrap' : 'SpikeTrap', '#795548', nextProjId++);
        p.isDead = false; // it stays alive until stepped on

        // Let's drop it slightly offset so they don't all perfectly stack visually
        p.x += (Math.random() * 20 - 10);
        p.y += (Math.random() * 20 - 10);

        addProjectile(p);
        this.cooldown = this.fireRate / this.buffMultiplier;
      }
    }
  }

  switch(type) {
    case 'Basic': return new StandardShooter('Peashooter', 100, 5, 120, 800, '#8bc34a', 15, basicUpgrades, id, x, y);
    case 'Sniper': return new SniperTower('Sniper', 250, 25, 400, 2000, '#5d4037', 15, sniperUpgrades, id, x, y);
    case 'Splash': return new SplashTower('Bombard', 300, 15, 150, 1500, '#d32f2f', 18, splashUpgrades, id, x, y);
    case 'Slow': return new SlowTower('Cryo Ray', 200, 2, 120, 1000, '#00bcd4', 16, slowUpgrades, id, x, y);
    case 'Poison': return new PoisonTower('Venom Spitter', 250, 2, 130, 1200, '#4caf50', 16, poisonUpgrades, id, x, y);
    case 'Laser': return new LaserTower('Pulse Laser', 400, 8, 140, 500, '#00e5ff', 14, laserUpgrades, id, x, y);
    case 'Support': return new SupportTower('Aura Beacon', 350, 0, 100, 9999, '#ffeb3b', 18, supportUpgrades, id, x, y);
    case 'Multishot': return new MultishotTower('Gatling', 500, 4, 130, 900, '#ff9800', 16, multishotUpgrades, id, x, y);
    case 'Chain': return new ChainLightningTower('Tesla Coil', 600, 10, 150, 1500, '#ffc107', 16, chainLightningUpgrades, id, x, y);
    case 'Trap': return new TrapTower('Spike Factory', 200, 15, 80, 2000, '#795548', 16, trapUpgrades, id, x, y);
  }

  return null;
}

// Global list of tower types for UI
export const TowerDefinitions = [
  { type: 'Basic', name: 'Peashooter', cost: 100, color: '#8bc34a', desc: 'Cheap, balanced shooter.' },
  { type: 'Sniper', name: 'Sniper', cost: 250, color: '#5d4037', desc: 'Huge range, high damage, slow.' },
  { type: 'Splash', name: 'Bombard', cost: 300, color: '#d32f2f', desc: 'Deals damage in an area.' },
  { type: 'Slow', name: 'Cryo Ray', cost: 200, color: '#00bcd4', desc: 'Slows enemies down.' },
  { type: 'Poison', name: 'Venom Spitter', cost: 250, color: '#4caf50', desc: 'Deals damage over time.' },
  { type: 'Laser', name: 'Pulse Laser', cost: 400, color: '#00e5ff', desc: 'Fast, instant-hit beam.' },
  { type: 'Support', name: 'Aura Beacon', cost: 350, color: '#ffeb3b', desc: 'Buffs nearby towers.' },
  { type: 'Multishot', name: 'Gatling', cost: 500, color: '#ff9800', desc: 'Fires multiple projectiles.' },
  { type: 'Chain', name: 'Tesla Coil', cost: 600, color: '#ffc107', desc: 'Lightning chains to nearby foes.' },
  { type: 'Trap', name: 'Spike Factory', cost: 200, color: '#795548', desc: 'Drops traps on the path.' }
];