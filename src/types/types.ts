// Types definitions
export type GameState = 'start' | 'playing' | 'paused' | 'gameOver';
export type PowerUpType = 'doubleShot' | 'tripleShot' | 'health';

export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Player extends GameObject {
  speed: number;
}

export interface Bullet extends GameObject {
  isEnemy?: boolean;
}

export interface Enemy extends GameObject {
  health: number;
  speed: number;
  type: 'normal' | 'fast';
}

export interface PowerUp extends GameObject {
  type: PowerUpType;
  speed: number;
}

export interface Boss extends GameObject {
  health: number;
  maxHealth: number;
  direction: number;
  attackCooldown: number;
}