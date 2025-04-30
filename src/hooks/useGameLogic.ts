import { useEffect } from 'react';
import { useGame, GameObject, Enemy } from '../context/GameContext';

export const useGameLogic = () => {
  const {
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
    bulletCooldown,
    setBulletCooldown,
    doubleShot,
    setDoubleShot,
    gameSpeed,
    keysPressed,
    gameLoopRef
  } = useGame();

  // ゲームの初期化
  const startGame = () => {
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
    setDoubleShot(false);
  };

  // ゲームの一時停止/再開
  const togglePause = () => {
    if (gameState === 'playing') {
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
    }
  };

  // 衝突判定
  const isColliding = (a: GameObject, b: GameObject): boolean => {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  };

  // 衝突処理
  const checkCollisions = () => {
    const bulletsToRemove: number[] = [];
    const enemiesToRemove: number[] = [];
    
    // 弾と敵の衝突判定
    bullets.forEach((bullet, bulletIndex) => {
      if (bullet.isEnemy) return;
      
      enemies.forEach((enemy, enemyIndex) => {
        if (isColliding(bullet, enemy)) {
          bulletsToRemove.push(bulletIndex);
          
          const updatedEnemies = [...enemies];
          updatedEnemies[enemyIndex].health -= 1;
          
          if (updatedEnemies[enemyIndex].health <= 0) {
            enemiesToRemove.push(enemyIndex);
            setScore(prev => prev + 10);
          } else {
            setEnemies(updatedEnemies);
          }
        }
      });
    });
    
    // 敵とプレイヤーの衝突判定
    enemies.forEach((enemy, enemyIndex) => {
      if (isColliding(player, enemy)) {
        enemiesToRemove.push(enemyIndex);
        if (lives <= 1) {
          setGameState('gameOver');
          setLives(0);
        } else {
          setLives(prev => prev - 1);
        }
      }
    });

    // オブジェクトの削除
    if (bulletsToRemove.length > 0) {
      setBullets(prev => prev.filter((_, index) => !bulletsToRemove.includes(index)));
    }
    if (enemiesToRemove.length > 0) {
      setEnemies(prev => prev.filter((_, index) => !enemiesToRemove.includes(index)));
    }
  };

  // 敵の生成
  const spawnEnemies = () => {
    const baseSpawnChance = 0.015; // 生成確率を調整
    const levelMultiplier = 0.005;
    const maxSpawnChance = 0.08;
    
    const currentSpawnChance = Math.min(
      baseSpawnChance + (level * levelMultiplier),
      maxSpawnChance
    );
    
    if (Math.random() < currentSpawnChance && enemies.length < 10) { // 最大数を制限
      const enemyType = Math.random() < 0.3 ? 'fast' : 'normal';
      const newEnemy: Enemy = {
        x: Math.random() * (100 - 8),
        y: -10,
        width: 8,
        height: 8,
        health: enemyType === 'fast' ? 1 : 2,
        speed: enemyType === 'fast' ? 1 : 0.5,
        type: enemyType
      };
      
      setEnemies(prev => [...prev, newEnemy]);
    }
  };

  // ゲームループ
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const gameLoop = () => {
      // プレイヤーの移動処理
      const newPlayer = { ...player };
      let moved = false;
      
      if (keysPressed.current.ArrowLeft && newPlayer.x > 0) {
        newPlayer.x -= newPlayer.speed;
        moved = true;
      }
      if (keysPressed.current.ArrowRight && newPlayer.x < 100 - newPlayer.width) {
        newPlayer.x += newPlayer.speed;
        moved = true;
      }
      if (keysPressed.current.ArrowUp && newPlayer.y > 0) {
        newPlayer.y -= newPlayer.speed * 0.75;
        moved = true;
      }
      if (keysPressed.current.ArrowDown && newPlayer.y < 100 - newPlayer.height) {
        newPlayer.y += newPlayer.speed * 0.75;
        moved = true;
      }
      
      // プレイヤーの位置を更新
      if (moved) {
        setPlayer(newPlayer);
      }
      
      // 弾の移動と削除
      setBullets(prev => 
        prev
          .map(bullet => ({
            ...bullet,
            y: bullet.isEnemy ? bullet.y + 2 : bullet.y - 2
          }))
          .filter(bullet =>
            bullet.isEnemy
              ? bullet.y < 100
              : bullet.y + bullet.height > 0
          )
      );
      
      // 敵の移動と削除
      setEnemies(prev =>
        prev
          .map(enemy => ({
            ...enemy,
            y: enemy.y + enemy.speed
          }))
          .filter(enemy => enemy.y < 100)
      );
      
      checkCollisions();
      spawnEnemies();
      
      const newLevel = Math.floor(score / 200) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
      }
    };
    
    const intervalId = window.setInterval(gameLoop, gameSpeed);
    gameLoopRef.current = intervalId;
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [gameState, gameSpeed]);

  // 弾の発射
  const shootBullet = () => {
    if (bulletCooldown || gameState !== 'playing') return;
    
    setBulletCooldown(true);
    
    const bulletCount = doubleShot ? 2 : 1;
    const currentPlayer = player; // 現在のプレイヤー位置を取得
    
    const newBullets = Array.from({ length: bulletCount }, (_, i) => {
      const offset = doubleShot ? (i === 0 ? -2 : 2) : 0;
      return {
        x: currentPlayer.x + currentPlayer.width / 2 - 1 + offset,
        y: currentPlayer.y - 4,
        width: 2,
        height: 4,
        isEnemy: false
      };
    });
    
    setBullets(prev => [...prev, ...newBullets]);
    
    // クールダウンを設定
    const timer = setTimeout(() => {
      setBulletCooldown(false);
    }, 300);

    return () => clearTimeout(timer);
  };

  return {
    startGame,
    togglePause,
    shootBullet
  };
}; 