import { useEffect, useRef } from 'react';
import { Player, Bullet, Enemy, PowerUp, Boss, GameState, GAME_WIDTH, GAME_HEIGHT } from '../types/types';
import { isColliding } from '../utils/collision';
import { calculateSpawnChance, createEnemy, createPowerUp, createBoss } from '../utils/gameHelpers';

interface UseGameLoopProps {
  gameState: GameState;
  gameSpeed: number;
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  bullets: Bullet[];
  setBullets: React.Dispatch<React.SetStateAction<Bullet[]>>;
  enemies: Enemy[];
  setEnemies: React.Dispatch<React.SetStateAction<Enemy[]>>;
  powerUps: PowerUp[];
  setPowerUps: React.Dispatch<React.SetStateAction<PowerUp[]>>;
  boss: Boss | null;
  setBoss: React.Dispatch<React.SetStateAction<Boss | null>>;
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  lives: number;
  setLives: React.Dispatch<React.SetStateAction<number>>;
  level: number;
  setLevel: React.Dispatch<React.SetStateAction<number>>;
  keysPressed: React.MutableRefObject<Record<string, boolean>>;
  touchMove: { x: number; y: number } | null;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  doubleShot: boolean;
  tripleShot: boolean;
  superShot: boolean;
  setIsFinalBoss: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useGameLoop = ({
  gameState,
  gameSpeed,
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
  score,
  setScore,
  lives,
  setLives,
  level,
  setLevel,
  keysPressed,
  touchMove,
  setGameState,
  doubleShot,
  tripleShot,
  superShot,
  setIsFinalBoss
}: UseGameLoopProps) => {
  const gameLoopRef = useRef<number | null>(null);
  
  // Handle collision detection
  const checkCollisions = () => {
    // Create new arrays to track what needs to be removed
    const bulletsToRemove: number[] = [];
    const enemiesToRemove: number[] = [];
    const powerUpsToRemove: number[] = [];
    
    // Bullets hitting enemies
    bullets.forEach((bullet, bulletIndex) => {
      // Skip enemy bullets
      if (bullet.isEnemy) return;
      
      // Check for enemies
      enemies.forEach((enemy, enemyIndex) => {
        if (isColliding(bullet, enemy)) {
          // Mark bullet for removal
          if (!bulletsToRemove.includes(bulletIndex)) {
            bulletsToRemove.push(bulletIndex);
          }
          
          // Damage enemy
          const updatedEnemies = [...enemies];
          updatedEnemies[enemyIndex].health -= 1;
          
          if (updatedEnemies[enemyIndex].health <= 0) {
            // Mark enemy for removal and add score
            if (!enemiesToRemove.includes(enemyIndex)) {
              enemiesToRemove.push(enemyIndex);
            }
            // Add score based on enemy type
            setScore(prev => prev + (updatedEnemies[enemyIndex].type === 'fast' ? 20 : 10));
          }
          
          // Update enemy health
          setEnemies(updatedEnemies);
        }
      });
      
      // Check for boss
      setBoss(prev => {
        if (!prev) return null;
        
        // Boss collision with bullet check
        bullets.forEach((bullet, bulletIndex) => {
          if (!bullet.isEnemy && isColliding(bullet, prev)) {
            // Remove bullet
            setBullets(prevBullets => prevBullets.filter((_, index) => index !== bulletIndex));
            // Decrease boss health
            prev.health -= 1;
          }
        });
        
        if (prev.health <= 0) {
          // Boss defeated
          if (prev.isFinal) {
            // Final boss defeated - game victory
            setGameState('victory');
            return null;
          } else {
            // Regular boss defeated
            setScore(prev => prev + 100);
            if (level < 10) {
              setLevel(prev => prev + 1);
            }
            return null;
          }
        }
        
        return prev;
      });
    });

    // Check for enemy bullets hitting player
    bullets.forEach((bullet, bulletIndex) => {
      if (bullet.isEnemy && isColliding(bullet, player)) {
        // Mark bullet for removal
        if (!bulletsToRemove.includes(bulletIndex)) {
          bulletsToRemove.push(bulletIndex);
        }
        
        // Reduce player lives
        setLives(prev => {
          if (prev <= 1) {
            setGameState('gameOver');
            return 0;
          }
          return prev - 1;
        });
      }
    });
    
    // Check for enemies hitting player
    enemies.forEach((enemy, enemyIndex) => {
      if (isColliding(player, enemy)) {
        // Mark enemy for removal
        if (!enemiesToRemove.includes(enemyIndex)) {
          enemiesToRemove.push(enemyIndex);
        }
        
        // Reduce player lives
        setLives(prev => {
          if (prev <= 1) {
            setGameState('gameOver');
            return 0;
          }
          return prev - 1;
        });
      }
    });
    
    // Player collecting power-ups
    powerUps.forEach((powerUp, powerUpIndex) => {
      if (isColliding(player, powerUp)) {
        // Mark power-up for removal
        if (!powerUpsToRemove.includes(powerUpIndex)) {
          powerUpsToRemove.push(powerUpIndex);
        }
      }
    });
    
    // Apply all removals
    if (bulletsToRemove.length > 0) {
      setBullets(prev => prev.filter((_, index) => !bulletsToRemove.includes(index)));
    }
    
    if (enemiesToRemove.length > 0) {
      setEnemies(prev => prev.filter((_, index) => !enemiesToRemove.includes(index)));
    }
    
    if (powerUpsToRemove.length > 0) {
      setPowerUps(prev => prev.filter((_, index) => !powerUpsToRemove.includes(index)));
    }
  };
  
  // Spawn enemies and power-ups
  const spawnEnemies = () => {
    // Don't spawn enemies if boss exists
    if (boss) return;

    // Calculate spawn chance based on level
    const currentSpawnChance = calculateSpawnChance(level);
    
    // Spawn enemy
    if (Math.random() < currentSpawnChance) {
      setEnemies(prev => [...prev, createEnemy()]);
    }
    
    // Spawn power-up (rare)
    if (Math.random() < 0.001) {
      setPowerUps(prev => [...prev, createPowerUp()]);
    }
    
    // Spawn level 10 final boss
    if (level === 10 && score >= 900 && !boss) {
      setIsFinalBoss(true);
      setBoss(createBoss(true));
    }
    // Spawn regular boss every 500 points
    else if (level < 10 && score > 0 && score % 500 === 0 && !boss) {
      setBoss(createBoss(false));
    }
  };
  
  // Main game loop effect
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const gameLoop = () => {
      // Move player based on keys pressed
      setPlayer(prev => {
        let newX = prev.x;
        let newY = prev.y;
        
        if (keysPressed.current.ArrowLeft && newX > 0) {
          newX -= prev.speed;
        }
        if (keysPressed.current.ArrowRight && newX < GAME_WIDTH - prev.width) {
          newX += prev.speed;
        }
        if (keysPressed.current.ArrowUp && newY > 0) {
          newY -= prev.speed * 0.75;
        }
        if (keysPressed.current.ArrowDown && newY < GAME_HEIGHT - prev.height) {
          newY += prev.speed * 0.75;
        }
        
        return { ...prev, x: newX, y: newY };
      });
      
      // Update player position based on touch input
      if (touchMove) {
        setPlayer(prev => {
          let newX = prev.x;
          let newY = prev.y;
  
          // Move player based on touch position
          if (touchMove.x < prev.x) {
            newX = Math.max(0, prev.x - prev.speed);
          } else if (touchMove.x > prev.x + prev.width) {
            newX = Math.min(GAME_WIDTH - prev.width, prev.x + prev.speed);
          }
  
          if (touchMove.y < prev.y) {
            newY = Math.max(0, prev.y - prev.speed * 0.75);
          } else if (touchMove.y > prev.y + prev.height) {
            newY = Math.min(GAME_HEIGHT - prev.height, prev.y + prev.speed * 0.75);
          }
  
          return { ...prev, x: newX, y: newY };
        });
      }
      
      // Move bullets
      setBullets(prev => 
        prev
          .map(bullet => ({
            ...bullet,
            y: bullet.isEnemy ? bullet.y + 2 : bullet.y - 2 // Enemy bullets go down, player bullets go up
          }))
          .filter(bullet => (
            bullet.isEnemy ? 
              bullet.y < GAME_HEIGHT : // Keep enemy bullets on screen
              bullet.y + bullet.height > 0 // Remove player bullets that exit the top
          ))
      );
      
      // Move enemies
      setEnemies(prev => 
        prev
          .map(enemy => ({
            ...enemy,
            y: enemy.y + enemy.speed // Enemies move downward
          }))
          .filter(enemy => enemy.y < GAME_HEIGHT) // Remove enemies that exit the screen
      );
      
      // Move power-ups
      setPowerUps(prev => 
        prev
          .map(powerUp => ({
            ...powerUp,
            y: powerUp.y + powerUp.speed
          }))
          .filter(powerUp => powerUp.y < GAME_HEIGHT)
      );
      
      // Update boss movement and attacks
      if (boss) {
        setBoss(prev => {
          if (!prev) return null;
          
          // Boss movement (side to side)
          const newX = prev.x + (prev.direction * 0.5);
          if (newX <= 0 || newX + prev.width >= GAME_WIDTH) {
            return {
              ...prev,
              x: Math.max(0, Math.min(newX, GAME_WIDTH - prev.width)),
              direction: -prev.direction,
              attackCooldown: prev.attackCooldown + 1
            };
          }
          
          // Boss attacks 
          let attackCooldown = prev.attackCooldown + 1;
          if (attackCooldown >= 50) { // Attack every 50 frames
            // Different attack patterns based on boss type
            if (prev.isFinal) {
              // Final boss fires 5 shots
              setBullets(bullets => [
                ...bullets,
                // 5 bullets (left to right)
                { x: prev.x + 2, y: prev.y + prev.height, width: 3, height: 5, isEnemy: true },
                { x: prev.x + prev.width*0.25, y: prev.y + prev.height, width: 3, height: 5, isEnemy: true },
                { x: prev.x + prev.width/2 - 1.5, y: prev.y + prev.height, width: 3, height: 5, isEnemy: true },
                { x: prev.x + prev.width*0.75 - 3, y: prev.y + prev.height, width: 3, height: 5, isEnemy: true },
                { x: prev.x + prev.width - 5, y: prev.y + prev.height, width: 3, height: 5, isEnemy: true }
              ]);
            } else {
              // Regular boss fires 3 shots
              setBullets(bullets => [
                ...bullets,
                { x: prev.x + 5, y: prev.y + prev.height, width: 3, height: 5, isEnemy: true },
                { x: prev.x + prev.width/2 - 1.5, y: prev.y + prev.height, width: 3, height: 5, isEnemy: true },
                { x: prev.x + prev.width - 8, y: prev.y + prev.height, width: 3, height: 5, isEnemy: true }
              ]);
            }
            attackCooldown = 0;
          }
          
          // Remove existing enemies when boss is present
          if (enemies.length > 0) {
            setEnemies([]);
          }
          
          return {
            ...prev,
            x: newX,
            attackCooldown
          };
        });
      }
      
      // Handle collisions
      checkCollisions();
      
      // Spawn enemies and power-ups
      spawnEnemies();
      
      // Level up based on score (max level 10)
      if (level < 10) {
        const newLevel = Math.min(Math.floor(score / 200) + 1, 10);
        if (newLevel > level) {
          setLevel(newLevel);
        }
      }
    };
    
    // Set up the interval
    gameLoopRef.current = window.setInterval(gameLoop, gameSpeed);
    
    // Cleanup interval on unmount
    return () => {
      if (gameLoopRef.current !== null) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [
    gameState, 
    gameSpeed, 
    player, 
    bullets, 
    enemies, 
    powerUps, 
    boss, 
    score, 
    lives, 
    level, 
    keysPressed, 
    touchMove, 
    setPlayer, 
    setBullets, 
    setEnemies, 
    setPowerUps, 
    setBoss, 
    setScore, 
    setLives, 
    setLevel, 
    setGameState, 
    doubleShot, 
    tripleShot, 
    superShot, 
    setIsFinalBoss,
    checkCollisions,
  ]);

  return { checkCollisions, spawnEnemies };
};