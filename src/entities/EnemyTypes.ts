import { Enemy } from './Enemy';

let nextEnemyId = 0;

export function createEnemy(type: string, waveMultiplier: number): Enemy {
  nextEnemyId++;

  // Base stats that get scaled
  const hpScale = waveMultiplier;

  switch(type) {
    case 'Fast':
      return new Enemy(
        10 * hpScale, 10 * hpScale,
        150,
        2,
        12,
        '#ffeb3b', // yellow
        type,
        nextEnemyId
      );
    case 'Armored':
      return new Enemy(
        30 * hpScale, 30 * hpScale,
        50,
        3,
        20,
        '#607d8b', // grey blue
        type,
        nextEnemyId
      );
    case 'Splitting': // Logic for splitting handled in wave manager or enemy death event later
      return new Enemy(
        20 * hpScale, 20 * hpScale,
        80,
        3,
        18,
        '#9c27b0', // purple
        type,
        nextEnemyId
      );
    case 'Regenerating': // Regen logic can be added in update
      return new Enemy(
        25 * hpScale, 25 * hpScale,
        90,
        3,
        16,
        '#e91e63', // pink
        type,
        nextEnemyId
      );
    case 'Boss':
      return new Enemy(
        200 * hpScale, 200 * hpScale,
        40,
        50,
        30,
        '#000000', // black
        type,
        nextEnemyId
      );
    case 'Basic':
    default:
      return new Enemy(
        15 * hpScale, 15 * hpScale,
        100, // speed
        1,   // reward
        15,  // radius
        '#f44336', // red
        'Basic',
        nextEnemyId
      );
  }
}