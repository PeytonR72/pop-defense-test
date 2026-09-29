import { Enemy } from '../entities/Enemy';
import { createEnemy } from '../entities/EnemyTypes';
import type { MapDefinition } from '../maps/Map';

export class WaveManager {
  public round: number = 1;
  public maxRounds: number = 100;

  public enemies: Enemy[] = [];

  private spawnQueue: { type: string, delay: number }[] = [];
  private timeUntilNextSpawn: number = 0;

  public isRoundActive: boolean = false;

  constructor() {}

  public startNextRound() {
    if (this.isRoundActive || this.round > this.maxRounds) return;

    this.isRoundActive = true;
    this.generateWave(this.round);
  }

  private generateWave(round: number) {
    this.spawnQueue = [];
    // const multiplier = 1 + (round * 0.2); // Scaling HP handled at spawn

    let count = 10 + Math.floor(round * 1.5);

    // Wave composition logic
    for (let i = 0; i < count; i++) {
      let type = 'Basic';

      if (round % 10 === 0 && i === count - 1) {
        type = 'Boss';
      } else if (round > 5 && i % 4 === 0) {
        type = 'Fast';
      } else if (round > 15 && i % 5 === 0) {
        type = 'Armored';
      } else if (round > 25 && i % 6 === 0) {
        type = 'Regenerating';
      } else if (round > 35 && i % 7 === 0) {
        type = 'Splitting';
      }

      this.spawnQueue.push({ type, delay: 500 + Math.random() * 500 });
    }

    if (this.spawnQueue.length > 0) {
      this.timeUntilNextSpawn = this.spawnQueue[0].delay;
    }
  }

  public update(dt: number, mapDef: MapDefinition, canvasWidth: number, canvasHeight: number, onLeak: (dmg: number) => void, onKill: (reward: number, x: number, y: number) => void) {
    if (this.isRoundActive && this.spawnQueue.length > 0) {
      this.timeUntilNextSpawn -= dt;
      if (this.timeUntilNextSpawn <= 0) {
        const spawnInfo = this.spawnQueue.shift();
        if (spawnInfo) {
          const multiplier = 1 + (this.round * 0.2);
          this.enemies.push(createEnemy(spawnInfo.type, multiplier));
        }

        if (this.spawnQueue.length > 0) {
          this.timeUntilNextSpawn = this.spawnQueue[0].delay;
        }
      }
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      // Handle regeneration
      if (enemy.type === 'Regenerating' && !enemy.isDead && !enemy.hasReachedEnd) {
        if (enemy.health < enemy.maxHealth) {
          enemy.health += enemy.maxHealth * 0.05 * (dt / 1000); // 5% hp per sec
          if (enemy.health > enemy.maxHealth) enemy.health = enemy.maxHealth;
        }
      }

      enemy.update(dt, mapDef, canvasWidth, canvasHeight);

      if (enemy.hasReachedEnd) {
        let dmg = 1;
        if (enemy.type === 'Boss') dmg = 10;
        onLeak(dmg);
        this.enemies.splice(i, 1);
      } else if (enemy.isDead) {
        onKill(enemy.reward, enemy.x, enemy.y);

        // Handle Splitting
        if (enemy.type === 'Splitting') {
          const multiplier = 1 + (this.round * 0.2);
          for(let j=0; j<2; j++) {
            const splitEnemy = createEnemy('Fast', multiplier * 0.5); // weaker fast enemies
            splitEnemy.x = enemy.x + (Math.random() * 20 - 10);
            splitEnemy.y = enemy.y + (Math.random() * 20 - 10);
            splitEnemy.pathIndex = enemy.pathIndex;
            splitEnemy.distanceTraveled = enemy.distanceTraveled;
            this.enemies.push(splitEnemy);
          }
        }

        this.enemies.splice(i, 1);
      }
    }

    // Check round end
    if (this.isRoundActive && this.spawnQueue.length === 0 && this.enemies.length === 0) {
      this.isRoundActive = false;
      this.round++;
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    for (const enemy of this.enemies) {
      enemy.draw(ctx);
    }
  }
}