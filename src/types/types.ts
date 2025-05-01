// Game states
export type GameState = 'start' | 'playing' | 'paused' | 'gameOver' | 'victory';

// Base game object interface
export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Player interface
export interface Player extends GameObject {
  speed: number;
}

// Bullet interface
export interface Bullet extends GameObject {
  isEnemy?: boolean;
}

// Enemy interface
export interface Enemy extends GameObject {
  health: number;
  speed: number;
  type: 'normal' | 'fast';
}

// Power-up types
export type PowerUpType = 'doubleShot' | 'tripleShot' | 'superShot' | 'health';

// Power-up interface
export interface PowerUp extends GameObject {
  type: PowerUpType;
  speed: number;
}

// Boss interface
export interface Boss extends GameObject {
  health: number;
  maxHealth: number;
  direction: number;
  attackCooldown: number;
  isFinal: boolean;
}

// Game dimensions
export const GAME_WIDTH = 100;
export const GAME_HEIGHT = 100;