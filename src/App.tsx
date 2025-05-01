import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, Heart } from 'lucide-react';
import { Player, Bullet, Enemy, PowerUp, Boss, GameObject, GameState, PowerUpType } from './types/types';

export default function SpaceShooter() {
  // Game states
  const [gameState, setGameState] = useState<GameState>('start');
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [level, setLevel] = useState<number>(1);
  
  // Game elements
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
  
  // Game settings
  const [gameSpeed] = useState<number>(20); // ms per frame
  const [bulletCooldown, setBulletCooldown] = useState<boolean>(false);
  const [doubleShot, setDoubleShot] = useState<boolean>(false);
  const [tripleShot, setTripleShot] = useState<boolean>(false);
  const [superShot, setSuperShot] = useState<boolean>(false);
  const [isFinalBoss, setIsFinalBoss] = useState<boolean>(false);
  
  // Touch controls
  const [touchMove, setTouchMove] = useState<{ x: number; y: number } | null>(null);
  
  // Refs
  const gameLoopRef = useRef<number | null>(null);
  const keysPressed = useRef<Record<string, boolean>>({});
  const gameAreaRef = useRef<HTMLDivElement>(null);
  
  // Game area dimensions
  const gameWidth = 100;
  const gameHeight = 100;
  
  // Start game
  const startGame = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setGameState('playing');
    setScore(0);
    setLives(3);
    setLevel(1);
    setPlayer({ 
      x: 50, 
      y: 85, 
      width: 10, 
      height: 5,
      speed: 2
    });
    setBullets([]);
    setEnemies([]);
    setPowerUps([]);
    setBoss(null);
    setDoubleShot(false);
    setTripleShot(false);
    setSuperShot(false);
    setIsFinalBoss(false);
  };
  
  // Pause/resume game
  const togglePause = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (gameState === 'playing') {
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
    }
  };
  
  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;
      
      // Shoot on space key
      if (e.key === ' ' && !bulletCooldown && gameState === 'playing') {
        shootBullet();
      }
      
      // Pause on 'p' key
      if (e.key === 'p') {
        togglePause();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [bulletCooldown, gameState]);
  
  // Handle touch controls
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = gameAreaRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = ((touch.clientX - rect.left) / rect.width) * 100;
      const y = ((touch.clientY - rect.top) / rect.height) * 100;
      
      setTouchMove({ x, y });
      
      // 画面下部のタッチで射撃
      if (y > 80 && !bulletCooldown && gameState === 'playing') {
        shootBullet();
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = gameAreaRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = ((touch.clientX - rect.left) / rect.width) * 100;
      const y = ((touch.clientY - rect.top) / rect.height) * 100;
      
      setTouchMove({ x, y });
    };
    
    const handleTouchEnd = () => {
      setTouchMove(null);
    };
    
    const gameArea = gameAreaRef.current;
    if (gameArea) {
      gameArea.addEventListener('touchstart', handleTouchStart as EventListener, { passive: false });
      gameArea.addEventListener('touchmove', handleTouchMove as EventListener, { passive: false });
      gameArea.addEventListener('touchend', handleTouchEnd as EventListener, { passive: false });
    }
    
    return () => {
      if (gameArea) {
        gameArea.removeEventListener('touchstart', handleTouchStart as EventListener);
        gameArea.removeEventListener('touchmove', handleTouchMove as EventListener);
        gameArea.removeEventListener('touchend', handleTouchEnd as EventListener);
      }
    };
  }, [bulletCooldown, gameState]);
  
  // Update player position based on touch
  useEffect(() => {
    if (gameState !== 'playing' || !touchMove) return;

    setPlayer(prev => {
      let newX = prev.x;
      let newY = prev.y;

      // タッチ位置に応じてプレイヤーを移動
      if (touchMove.x < prev.x) {
        newX = Math.max(0, prev.x - prev.speed);
      } else if (touchMove.x > prev.x + prev.width) {
        newX = Math.min(gameWidth - prev.width, prev.x + prev.speed);
      }

      if (touchMove.y < prev.y) {
        newY = Math.max(0, prev.y - prev.speed * 0.75);
      } else if (touchMove.y > prev.y + prev.height) {
        newY = Math.min(gameHeight - prev.height, prev.y + prev.speed * 0.75);
      }

      return { ...prev, x: newX, y: newY };
    });
  }, [touchMove, gameState]);
  
  // Shooting mechanics
  const shootBullet = () => {
    setBulletCooldown(true);
    
    if (superShot) {
      setBullets(prev => [ 
        ...prev, 
        { x: player.x - 4, y: player.y - 6, width: 2, height: 4 },
        { x: player.x, y: player.y - 6, width: 2, height: 4 },
        { x: player.x + player.width / 2 - 1, y: player.y - 6, width: 2, height: 4 },
        { x: player.x + player.width - 2, y: player.y - 6, width: 2, height: 4 },
        { x: player.x + player.width + 2, y: player.y - 6, width: 2, height: 4 }
      ]);
    } else if (tripleShot) {
      setBullets(prev => [
        ...prev, 
        { x: player.x - 2, y: player.y - 4, width: 2, height: 4 },
        { x: player.x + player.width / 2 - 2, y: player.y - 4, width: 2, height: 4 },
        { x: player.x + player.width - 2, y: player.y - 4, width: 2, height: 4 }
      ]);
    } else if (doubleShot) {
      setBullets(prev => [
        ...prev, 
        { x: player.x - 2, y: player.y - 4, width: 2, height: 4 },
        { x: player.x + player.width - 2, y: player.y - 4, width: 2, height: 4 }
      ]);
    } else {
      setBullets(prev => [
        ...prev, 
        { x: player.x + player.width / 2 - 1, y: player.y - 4, width: 2, height: 4 }
      ]);
    }
    
    // Reset cooldown after 300ms
    setTimeout(() => {
      setBulletCooldown(false);
    }, 300);
  };
  
  // Check collision between two game objects
  const isColliding = (a: GameObject, b: GameObject): boolean => {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  };
  
  // Spawn enemies
  const spawnEnemies = () => {
    // ボスが存在する場合は通常の敵を生成しない
    if (boss) return;

    // レベルに応じた敵の出現頻度を計算
    const baseSpawnChance = 0.01; // 基本の出現確率
    const levelMultiplier = 0.005; // レベルごとの増加率
    const maxSpawnChance = 0.05; // 最大出現確率
    
    // 現在のレベルに応じた出現確率を計算
    const currentSpawnChance = Math.min(
      baseSpawnChance + (level * levelMultiplier),
      maxSpawnChance
    );
    
    // 敵の出現判定
    if (Math.random() < currentSpawnChance) {
      const enemyType = Math.random() < 0.3 ? 'fast' : 'normal';
      const newEnemy: Enemy = {
        x: Math.random() * (gameWidth - 8),
        y: -10,
        width: 8,
        height: 8,
        health: enemyType === 'fast' ? 1 : 1,
        speed: enemyType === 'fast' ? 1 : 0.5,
        type: enemyType
      };
      
      setEnemies(prev => [...prev, newEnemy]);
    }
    
    // Spawn power-up (rare)
    if (Math.random() < 0.001) {
      // Add tripleShot to possible power-ups
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
      
      setPowerUps(prev => [
        ...prev,
        {
          x: Math.random() * (gameWidth - 6),
          y: -10,
          width: 6,
          height: 6,
          type: powerType,
          speed: 0.3
        }
      ]);
    }
    
    // レベル10の後にボスを出現させる
    if (level === 10 && score >= 900 && !boss && !isFinalBoss) {
      setIsFinalBoss(true);
      setBoss({
        x: gameWidth / 2 - 20,
        y: 10,
        width: 40,
        height: 20,
        health: 50,
        maxHealth: 50,
        direction: 1,
        attackCooldown: 0,
        isFinal: true
      });
    }
    // 通常のボスを500スコアごとに出現させる
    else if (level < 10 && score > 0 && score % 500 === 0 && !boss && !isFinalBoss) {
      setBoss({
        x: gameWidth / 2 - 15,
        y: 10,
        width: 30,
        height: 15,
        health: 30,
        maxHealth: 30,
        direction: 1,
        attackCooldown: 0,
        isFinal: false
      });
    }
  };
  
  // Collision detection
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
            // 敵のタイプに応じてスコアを変更
            setScore(prev => prev + (updatedEnemies[enemyIndex].type === 'fast' ? 20 : 10));
          }
          
          // 敵の体力を更新
          setEnemies(updatedEnemies);
        }
      });
      
      // Check for boss
      setBoss(prev => {
        if (!prev) return null;
        
        // ボスと弾の当たり判定
        bullets.forEach((bullet, bulletIndex) => {
          if (!bullet.isEnemy && isColliding(bullet, prev)) {
            // 弾を削除
            setBullets(prevBullets => prevBullets.filter((_, index) => index !== bulletIndex));
            // ボスの体力を減少
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
        
        // Apply power-up effect
        if (powerUp.type === 'doubleShot') {
          // Cancel tripleShot if active
          setTripleShot(false);
          setDoubleShot(true);
          setSuperShot(false);
          
          // Double shot lasts for 10 seconds
          setTimeout(() => {
            setDoubleShot(false);
          }, 10000);
        } else if (powerUp.type === 'tripleShot') {
          // Cancel doubleShot if active
          setDoubleShot(false);
          setTripleShot(true);
          setSuperShot(false);
          
          // Triple shot lasts for 10 seconds
          setTimeout(() => {
            setTripleShot(false);
          }, 10000);
        } else if (powerUp.type === 'superShot') {
          // Cancel doubleShot if active
          setDoubleShot(false);
          setTripleShot(false);
          setSuperShot(true);

          // Triple shot lasts for 10 seconds
          setTimeout(() => {
            setSuperShot(false);
          }, 10000);
        } else if (powerUp.type === 'health' && lives < 5) {
          setLives(prev => prev + 1);
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
  
  // Main game loop
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
        if (keysPressed.current.ArrowRight && newX < gameWidth - prev.width) {
          newX += prev.speed;
        }
        if (keysPressed.current.ArrowUp && newY > 0) {
          newY -= prev.speed * 0.75;
        }
        if (keysPressed.current.ArrowDown && newY < gameHeight - prev.height) {
          newY += prev.speed * 0.75;
        }
        
        return { ...prev, x: newX, y: newY };
      });
      
      // Move bullets
      setBullets(prev => 
        prev
          .map(bullet => ({
            ...bullet,
            y: bullet.isEnemy ? bullet.y + 2 : bullet.y - 2 // Enemy bullets go down, player bullets go up
          }))
          .filter(bullet => (
            bullet.isEnemy ? 
              bullet.y < gameHeight : // Keep enemy bullets on screen
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
          .filter(enemy => enemy.y < gameHeight) // Remove enemies that exit the screen
      );
      
      // Move power-ups
      setPowerUps(prev => 
        prev
          .map(powerUp => ({
            ...powerUp,
            y: powerUp.y + powerUp.speed
          }))
          .filter(powerUp => powerUp.y < gameHeight)
      );
      
      // Update boss movement and attacks
      if (boss) {
        setBoss(prev => {
          if (!prev) return null;
          
          // Boss movement (side to side)
          const newX = prev.x + (prev.direction * 0.5);
          if (newX <= 0 || newX + prev.width >= gameWidth) {
            return {
              ...prev,
              x: Math.max(0, Math.min(newX, gameWidth - prev.width)),
              direction: -prev.direction,
              attackCooldown: prev.attackCooldown + 1
            };
          }
          
          // Boss attacks 
          let attackCooldown = prev.attackCooldown + 1;
          if (attackCooldown >= 50) { // Attack every 50 frames
            // ボスの種類によって攻撃パターンを変える
            if (prev.isFinal) {
              // 最終ボスは5発の弾を発射
              setBullets(bullets => [
                ...bullets,
                // 5発の弾（左から右へ）
                { x: prev.x + 2, y: prev.y + prev.height, width: 3, height: 5, isEnemy: true },
                { x: prev.x + prev.width*0.25, y: prev.y + prev.height, width: 3, height: 5, isEnemy: true },
                { x: prev.x + prev.width/2 - 1.5, y: prev.y + prev.height, width: 3, height: 5, isEnemy: true },
                { x: prev.x + prev.width*0.75 - 3, y: prev.y + prev.height, width: 3, height: 5, isEnemy: true },
                { x: prev.x + prev.width - 5, y: prev.y + prev.height, width: 3, height: 5, isEnemy: true }
              ]);
            } else {
              // 通常ボスは3発の弾を発射
              setBullets(bullets => [
                ...bullets,
                { x: prev.x + 5, y: prev.y + prev.height, width: 3, height: 5, isEnemy: true },
                { x: prev.x + prev.width/2 - 1.5, y: prev.y + prev.height, width: 3, height: 5, isEnemy: true },
                { x: prev.x + prev.width - 8, y: prev.y + prev.height, width: 3, height: 5, isEnemy: true }
              ]);
            }
            attackCooldown = 0;
          }
          
          // ボスが存在する場合は既存の敵を削除
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
      
      // Spawn enemies
      spawnEnemies();
      
      // Level up based on score (最大レベル10まで)
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
  }, [gameState, boss, level, score, lives, bullets, enemies, powerUps]);
  
  // Render the game
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto h-screen bg-gray-900 text-white">
      {/* Game title */}
      <h1 className="text-3xl font-bold mb-2">Space Shooter</h1>
      
      {/* Game area */}
      <div 
        ref={gameAreaRef}
        className="relative bg-black w-full aspect-square border-2 border-blue-500 overflow-hidden"
      >
        {/* Game UI elements */}
        <div className="absolute top-0 left-0 w-full flex justify-between p-2 z-10">
          <div className="flex items-center">
            <span className="mr-4">Score: {score}</span>
            <span className="mr-4">Level: {level}</span>
          </div>
          <div className="flex items-center">
            {Array.from({ length: lives }).map((_, i) => (
              <Heart 
                key={i} 
                size={16} 
                className="text-red-500 fill-red-500 mr-1" 
              />
            ))}
          </div>
        </div>
        
        {/* Game elements */}
        {gameState === 'playing' || gameState === 'paused' ? (
          <>
            {/* Player ship */}
            <img 
              src="/src/assets/space.png"
              alt="Player ship"
              className="absolute" 
              style={{
                left: `${player.x}%`,
                top: `${player.y}%`,
                width: `${player.width}%`,
                height: `${player.height}%`
              }}
            />
            
            {/* Bullets */}
            {bullets.map((bullet, index) => (
              <div 
                key={`bullet-${index}`}
                className={`absolute ${bullet.isEnemy ? 'bg-red-500' : 'bg-yellow-300'}`}
                style={{
                  left: `${bullet.x}%`,
                  top: `${bullet.y}%`,
                  width: `${bullet.width}%`,
                  height: `${bullet.height}%`
                }}
              />
            ))}
            
            {/* Enemies */}
            {enemies.map((enemy, index) => (
              <img 
                key={`enemy-${index}`}
                src={`/src/assets/${enemy.type === 'fast' ? 'ememy2.png' : 'ememy1.png'}`}
                alt={`Enemy ${enemy.type}`}
                className="absolute"
                style={{
                  left: `${enemy.x}%`,
                  top: `${enemy.y}%`,
                  width: `${enemy.width}%`,
                  height: `${enemy.height}%`
                }}
              />
            ))}
            
            {/* Power-ups */}
            {powerUps.map((powerUp, index) => (
              <div 
                key={`powerup-${index}`}
                className={`absolute ${
                  powerUp.type === 'doubleShot' 
                    ? 'bg-yellow-400' 
                    : powerUp.type === 'tripleShot' 
                      ? 'bg-purple-400' 
                      : powerUp.type === 'superShot' 
                        ? 'bg-rose-400'
                        : 'bg-green-400'
                } rounded-full flex items-center justify-center`}
                style={{
                  left: `${powerUp.x}%`,
                  top: `${powerUp.y}%`,
                  width: `${powerUp.width}%`,
                  height: `${powerUp.height}%`
                }}
              >
                <div className="text-xs font-bold">
                  {powerUp.type === 'doubleShot' ? '2x' : powerUp.type === 'tripleShot' ? '3x' : powerUp.type === 'superShot' ? '5x' : '+'}
                </div>
              </div>
            ))}
            
            {/* Boss */}
            {boss && (
              <div 
                className="absolute"
                style={{
                  left: `${boss.x}%`,
                  top: `${boss.y}%`,
                  width: `${boss.width}%`,
                  height: `${boss.height}%`,
                  position: 'absolute'
                }}
              >
                <img 
                  src={`/src/assets/${boss.isFinal ? 'finalBoss.png' : 'boss.png'}`}
                  alt={boss.isFinal ? 'Final Boss' : 'Boss'}
                  className="w-full h-full"
                />
                {/* Boss health bar */}
                <div 
                  className="bg-gray-700 absolute"
                  style={{
                    left: 0,
                    top: '-15%',
                    width: '100%',
                    height: '10%',
                  }}
                >
                  <div 
                    className={`${boss.isFinal ? 'bg-purple-500' : 'bg-red-500'} h-full`}
                    style={{
                      width: `${(boss.health / boss.maxHealth) * 100}%`
                    }}
                  />
                </div>
              </div>
            )}
          </>
        ) : null}
        
        {/* Start screen */}
        {gameState === 'start' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70">
            <h2 className="text-2xl mb-6">Space Shooter</h2>
            <p className="mb-4 text-center px-4">
              Use arrow keys to move<br />
              Press SPACE to shoot<br />
              Press P to pause
            </p>
            <button 
              onClick={startGame}
              onTouchStart={startGame}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              <Play size={16} className="mr-2" /> Start Game
            </button>
          </div>
        )}
        
        {/* Pause screen */}
        {gameState === 'paused' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70">
            <h2 className="text-2xl mb-6">Game Paused</h2>
            <button 
              onClick={togglePause}
              onTouchStart={togglePause}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              <Play size={16} className="mr-2" /> Resume
            </button>
          </div>
        )}
        
        {/* Game over screen */}
        {gameState === 'gameOver' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70">
            <h2 className="text-2xl mb-2">Game Over</h2>
            <p className="mb-6">Your score: {score}</p>
            <button 
              onClick={startGame}
              onTouchStart={startGame}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-2"
            >
              <RefreshCw size={16} className="mr-2" /> Play Again
            </button>
          </div>
        )}
        {/* Victory screen */}
        {gameState === 'victory' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70">
            <h2 className="text-2xl mb-2">Victory!!!!!</h2>
            <p className="mb-6">You're Winner!!!!!</p>
            <button 
              onClick={startGame}
              onTouchStart={startGame}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-2"
            >
              <RefreshCw size={16} className="mr-2" /> Play Again
            </button>
          </div>
        )}
      </div>
      
      {/* Game controls */}
      <div className="mt-4 flex gap-2">
        {gameState === 'playing' && (
          <button 
            onClick={togglePause}
            className="flex items-center bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded"
          >
            <Pause size={16} className="mr-1" /> Pause
          </button>
        )}
        {(gameState === 'paused' || gameState === 'gameOver') && (
          <button 
            onClick={startGame}
            className="flex items-center bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
          >
            <RefreshCw size={16} className="mr-1" /> New Game
          </button>
        )}
      </div>
      
      {/* Instructions */}
      <div className="mt-4 text-sm text-gray-300 px-4 text-center">
        <p><strong>Controls:</strong> Arrow keys to move, SPACE to shoot, P to pause</p>
        <p className="mt-1"><strong>Power-ups:</strong> Yellow (2x Shot), Purple (3x Shot), Red (5x Shot), Green (Extra Life)</p>
      </div>
    </div>
  );
}