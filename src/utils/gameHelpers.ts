import { PowerUpType, Enemy, PowerUp, Boss, GAME_WIDTH } from '../types/types';

/**
 * Creates a new enemy based on current level
 * @param level Current game level
 * @returns A new enemy object
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createEnemy = (): Enemy => {
  const enemyType = Math.random() < 0.3 ? 'fast' : 'normal';
  
  return {
    x: Math.random() * (GAME_WIDTH - 8),
    y: -10,
    width: 8,
    height: 8,
    health: enemyType === 'fast' ? 1 : 1,
    speed: enemyType === 'fast' ? 1 : 0.5,
    type: enemyType
  };
};

/**
 * Calculate spawn chance based on level
 * @param level Current game level
 * @returns Spawn chance percentage
 */
export const calculateSpawnChance = (level: number): number => {
  const baseSpawnChance = 0.01; // Base spawn rate
  const levelMultiplier = 0.005; // Level multiplier
  const maxSpawnChance = 0.05; // Maximum spawn rate
  
  return Math.min(
    baseSpawnChance + (level * levelMultiplier),
    maxSpawnChance
  );
};

/**
 * Create a new power-up
 * @returns A new power-up object
 */
export const createPowerUp = (): PowerUp => {
  const powerUpRandom = Math.random();
  let powerType: PowerUpType;
  
  if (powerUpRandom < 0.4) {
    powerType = 'doubleShot';
  } else if (powerUpRandom < 0.7) {
    powerType = 'tripleShot';
  } else if (powerUpRandom < 0.8) {
    powerType = 'superShot';
  } else {
    powerType = 'health';
  }
  
  return {
    x: Math.random() * (GAME_WIDTH - 6),
    y: -10,
    width: 6,
    height: 6,
    type: powerType,
    speed: 0.3
  };
};

/**
 * Create a boss based on type
 * @param isFinal Whether this is the final boss
 * @returns A new boss object
 */
export const createBoss = (isFinal: boolean): Boss => {
  if (isFinal) {
    return {
      x: GAME_WIDTH / 2 - 20,
      y: 10,
      width: 40,
      height: 20,
      health: 50,
      maxHealth: 50,
      direction: 1,
      attackCooldown: 0,
      isFinal: true
    };
  } else {
    return {
      x: GAME_WIDTH / 2 - 15,
      y: 10,
      width: 30,
      height: 15,
      health: 30,
      maxHealth: 30,
      direction: 1,
      attackCooldown: 0,
      isFinal: false
    };
  }
};