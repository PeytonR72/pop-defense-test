import { Maps, drawPath } from '../maps/MapDefinitions';
import type { MapDefinition } from '../maps/Map';
import { WaveManager } from './WaveManager';
import { ParticleManager } from './Particles';
import { AudioManager } from './Audio';
import { UIManager } from '../ui/UIManager';
import { Tower } from '../entities/Tower';
import type { TargetingMode } from '../entities/Tower';
import { createTower, TowerDefinitions } from '../entities/TowerTypes';
import { Projectile } from '../entities/Projectile';
import { Input } from './Input';

export enum State {
  Menu,
  MapSelect,
  Playing,
  GameOver,
  Victory
}

export class Game {
  public state: State = State.Menu;
  public currentMap: MapDefinition | null = null;

  public waveManager: WaveManager;
  public particleManager: ParticleManager;
  public audioManager: AudioManager;
  public uiManager: UIManager;
  public input: Input;

  // Economy & Meta
  public lives: number = 100;
  public cash: number = 500;
  public playSpeed: number = 1;

  public towers: Tower[] = [];
  public projectiles: Projectile[] = [];

  private nextTowerId = 0;

  constructor(public canvas: HTMLCanvasElement, public ctx: CanvasRenderingContext2D, input: Input) {
    this.input = input;
    this.waveManager = new WaveManager();
    this.particleManager = new ParticleManager();
    this.audioManager = new AudioManager();
    this.uiManager = new UIManager(canvas.width, canvas.height);
  }

  public resize(w: number, h: number) {
    this.uiManager.resize(w, h);
  }

  public startGame(mapIndex: number) {
    this.currentMap = Maps[mapIndex];
    this.state = State.Playing;

    // Reset state
    this.lives = 100;
    this.cash = 600;
    this.towers = [];
    this.projectiles = [];
    this.waveManager = new WaveManager();
    this.playSpeed = 1;
    this.uiManager.selectedTowerIndex = -1;
    this.uiManager.selectedBuiltTower = null;
  }

  public update(dt: number) {
    // Process input
    let click = this.input.getNextClick();
    while (click) {
      this.handleClick(click.x, click.y);
      click = this.input.getNextClick();
    }

    if (this.state !== State.Playing) return;

    // Support Play Speed
    for (let s = 0; s < this.playSpeed; s++) {
      this.updateSimulation(dt);
    }
  }

  private updateSimulation(dt: number) {
    this.particleManager.update(dt);

    if (!this.currentMap) return;

    this.waveManager.update(
      dt,
      this.currentMap,
      this.canvas.width,
      this.canvas.height,
      (dmg) => {
        this.lives -= dmg;
        this.audioManager.playError();
        if (this.lives <= 0) {
          this.lives = 0;
          this.state = State.GameOver;
        }
      },
      (reward, x, y) => {
        this.cash += reward;
        this.audioManager.playHit();
        this.particleManager.spawnHit(x, y, '#ffeb3b');
      }
    );

    // Update Towers
    const enemies = this.waveManager.enemies;
    for (const t of this.towers) {
      t.update(dt, enemies, (p: Projectile) => {
        this.projectiles.push(p);
        this.audioManager.playShoot();
      });

      // Clear buffs from previous frame
      t.buffMultiplier = 1;
    }

    // Handle Support Tower Buffs
    for (const t of this.towers) {
      if (t.name === 'Aura Beacon') {
        let buffAmt = 1.1; // 10% buff base
        if (t.upgradesApplied >= 1) buffAmt = 1.2;
        if (t.upgradesApplied >= 3) buffAmt = 1.4;
        for (const other of this.towers) {
          if (other === t) continue;
          const dist = Math.sqrt(Math.pow(t.x - other.x, 2) + Math.pow(t.y - other.y, 2));
          if (dist <= t.range) {
             other.buffMultiplier = Math.max(other.buffMultiplier, buffAmt);
          }
        }
      }
    }

    // Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.update(dt, enemies, (proj, enemy) => {
        enemy.takeDamage(proj.damage);
        this.particleManager.spawnHit(enemy.x, enemy.y, proj.color);

        if (proj.type === 'Splash' || proj.type === 'ExplosiveTrap') {
          this.audioManager.playExplosion();
          this.particleManager.spawnExplosion(proj.x, proj.y, '#f44336');
          const radius = proj.extraParams?.splashRadius || 50;
          for (const e of enemies) {
            if (e === enemy) continue; // Already damaged
            if (e.isDead) continue;
            const dist = Math.sqrt(Math.pow(e.x - proj.x, 2) + Math.pow(e.y - proj.y, 2));
            if (dist <= radius) {
              e.takeDamage(proj.damage * 0.5);
            }
          }
        } else if (proj.type === 'Slow') {
          enemy.freezeTimer = proj.extraParams?.freezeDuration || 2000;
        } else if (proj.type === 'Poison') {
          enemy.poisonTimer = proj.extraParams?.duration || 5000;
          enemy.poisonDamage = proj.damage; // dot per second
        } else if (proj.type === 'Lightning') {
          // Chain lightning
          let chainsLeft = proj.extraParams?.chainCount || 2;
          let hitIds = proj.extraParams?.hitIds || [enemy.id];
          hitIds.push(enemy.id);

          let currentE = enemy;
          for (let c = 0; c < chainsLeft; c++) {
            // Find closest enemy not hit
            let nextE = null;
            let minDist = 150; // chain range
            for (const e of enemies) {
              if (e.isDead || hitIds.includes(e.id)) continue;
              const dist = Math.sqrt(Math.pow(e.x - currentE.x, 2) + Math.pow(e.y - currentE.y, 2));
              if (dist < minDist) {
                minDist = dist;
                nextE = e;
              }
            }
            if (nextE) {
              nextE.takeDamage(proj.damage * 0.8);
              hitIds.push(nextE.id);
              // Draw visual chain immediately
              this.particleManager.spawnHit(nextE.x, nextE.y, '#ffc107');
              currentE = nextE;
            } else {
              break;
            }
          }
        }
      });

      if (p.isDead) {
        this.projectiles.splice(i, 1);
      }
    }

    if (this.waveManager.round > this.waveManager.maxRounds && !this.waveManager.isRoundActive) {
      this.state = State.Victory;
    }
  }

  private handleClick(x: number, y: number) {
    if (this.state === State.Menu) {
      this.audioManager.init();
      this.state = State.MapSelect;
      return;
    }

    if (this.state === State.GameOver || this.state === State.Victory) {
      this.state = State.Menu;
      return;
    }

    if (this.state === State.MapSelect) {
      const mapWidth = 200;
      const mapHeight = 150;
      const gap = 40;
      const startX = this.canvas.width / 2 - (Maps.length * mapWidth + (Maps.length - 1) * gap) / 2;
      const my = this.canvas.height / 2 - mapHeight / 2;

      for (let i = 0; i < Maps.length; i++) {
        const mx = startX + i * (mapWidth + gap);
        if (x >= mx && x <= mx + mapWidth && y >= my && y <= my + mapHeight) {
          this.startGame(i);
          return;
        }
      }
      return;
    }

    if (this.state === State.Playing) {
      const clickedUI = this.uiManager.handleHUDClick(
        x, y, this.cash, this.playSpeed,
        (s) => this.playSpeed = s,
        () => {
          if (this.uiManager.selectedBuiltTower) {
            const t = this.uiManager.selectedBuiltTower;
            const upg = t.getNextUpgrade();
            if (upg && this.cash >= upg.cost) {
              this.cash -= upg.cost;
              t.upgrade();
              this.audioManager.playBuild();
            } else {
              this.audioManager.playError();
            }
          }
        },
        () => {
          if (this.uiManager.selectedBuiltTower) {
            this.cash += this.uiManager.selectedBuiltTower.getSellValue();
            this.towers = this.towers.filter(t => t !== this.uiManager.selectedBuiltTower);
            this.uiManager.selectedBuiltTower = null;
            this.audioManager.playBuild();
          }
        },
        () => {
          if (this.uiManager.selectedBuiltTower) {
            const modes: TargetingMode[] = ['First', 'Last', 'Strong', 'Weak'];
            const idx = modes.indexOf(this.uiManager.selectedBuiltTower.targetingMode);
            this.uiManager.selectedBuiltTower.targetingMode = modes[(idx + 1) % modes.length];
          }
        }
      );

      if (clickedUI) return;

      // Start wave button check
      if (this.uiManager.isHoveringNextWave && !this.waveManager.isRoundActive) {
         this.waveManager.startNextRound();
         this.audioManager.playBuild();
         return;
      }

      // Handle placing a tower
      if (this.uiManager.selectedTowerIndex >= 0) {
        const def = TowerDefinitions[this.uiManager.selectedTowerIndex];
        if (this.cash >= def.cost) {
          const t = createTower(def.type, x, y, this.nextTowerId++);
          if (t) {
            this.cash -= def.cost;
            this.towers.push(t);
            this.audioManager.playBuild();
            this.uiManager.selectedTowerIndex = -1; // deselect after build
          }
        } else {
          this.audioManager.playError();
        }
        return;
      }

      // Handle selecting a built tower
      this.uiManager.selectedBuiltTower = null;
      for (const t of this.towers) {
        const dx = t.x - x;
        const dy = t.y - y;
        if (Math.sqrt(dx * dx + dy * dy) <= t.radius + 10) {
          this.uiManager.selectedBuiltTower = t;
          break;
        }
      }
    }
  }

  public draw() {
    if (this.state === State.Menu) {
      this.uiManager.drawMenu(this.ctx);
    } else if (this.state === State.MapSelect) {
      // Hover logic for map select
      const mapWidth = 200;
      const mapHeight = 150;
      const gap = 40;
      const startX = this.canvas.width / 2 - (Maps.length * mapWidth + (Maps.length - 1) * gap) / 2;
      const my = this.canvas.height / 2 - mapHeight / 2;
      this.uiManager.hoveredMapIndex = -1;
      for (let i = 0; i < Maps.length; i++) {
        const mx = startX + i * (mapWidth + gap);
        if (this.input.mouseX >= mx && this.input.mouseX <= mx + mapWidth && this.input.mouseY >= my && this.input.mouseY <= my + mapHeight) {
          this.uiManager.hoveredMapIndex = i;
          break;
        }
      }
      this.uiManager.drawMapSelect(this.ctx);
    } else if (this.state === State.Playing) {
      if (this.currentMap) {
        this.currentMap.drawBackground(this.ctx, this.canvas.width, this.canvas.height);
        drawPath(this.ctx, this.currentMap, this.canvas.width, this.canvas.height);
      }

      for (const t of this.towers) t.draw(this.ctx);
      this.waveManager.draw(this.ctx);
      for (const p of this.projectiles) p.draw(this.ctx);
      this.particleManager.draw(this.ctx);

      this.uiManager.drawHUD(this.ctx, this.lives, this.cash, this.waveManager.round, this.input.mouseX, this.input.mouseY, this.waveManager.isRoundActive, this.playSpeed);
    } else if (this.state === State.GameOver) {
      this.uiManager.drawGameOver(this.ctx);
    } else if (this.state === State.Victory) {
      this.uiManager.drawVictory(this.ctx);
    }
  }
}