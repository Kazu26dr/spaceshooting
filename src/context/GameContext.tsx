import React, { createContext, useContext, useState, useRef, Dispatch, SetStateAction } from 'react';

export type GameState = 'start' | 'playing' | 'paused' | 'gameOver';

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
  type: 'doubleShot' | 'health';
  speed: number;
}

export interface Boss extends GameObject {
  health: number;
  maxHealth: number;
  direction: number;
  attackCooldown: number;
}

interface GameContextType {
  gameState: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
  score: number;
  setScore: Dispatch<SetStateAction<number>>;
  lives: number;
  setLives: Dispatch<SetStateAction<number>>;
  level: number;
  setLevel: Dispatch<SetStateAction<number>>;
  player: Player;
  setPlayer: Dispatch<SetStateAction<Player>>;
  bullets: Bullet[];
  setBullets: Dispatch<SetStateAction<Bullet[]>>;
  enemies: Enemy[];
  setEnemies: Dispatch<SetStateAction<Enemy[]>>;
  powerUps: PowerUp[];
  setPowerUps: Dispatch<SetStateAction<PowerUp[]>>;
  boss: Boss | null;
  setBoss: Dispatch<SetStateAction<Boss | null>>;
  bulletCooldown: boolean;
  setBulletCooldown: Dispatch<SetStateAction<boolean>>;
  doubleShot: boolean;
  setDoubleShot: Dispatch<SetStateAction<boolean>>;
  gameSpeed: number;
  keysPressed: React.MutableRefObject<Record<string, boolean>>;
  gameLoopRef: React.MutableRefObject<number | null>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>('start');
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [level, setLevel] = useState<number>(1);
  const [player, setPlayer] = useState<Player>({
    x: 50,
    y: 85,
    width: 10,
    height: 5,
    speed: 2
  });
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [boss, setBoss] = useState<Boss | null>(null);
  const [bulletCooldown, setBulletCooldown] = useState<boolean>(false);
  const [doubleShot, setDoubleShot] = useState<boolean>(false);
  const gameSpeed = 20;
  const keysPressed = useRef<Record<string, boolean>>({});
  const gameLoopRef = useRef<number | null>(null);

  return (
    <GameContext.Provider
      value={{
        gameState,
        setGameState,
        score,
        setScore,
        lives,
        setLives,
        level,
        setLevel,
        player,
        setPlayer,
        bullets,
        setBullets,
        enemies,
        setEnemies,
        powerUps,
        setPowerUps,
        boss,
        setBoss,
        bulletCooldown,
        setBulletCooldown,
        doubleShot,
        setDoubleShot,
        gameSpeed,
        keysPressed,
        gameLoopRef
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}; 