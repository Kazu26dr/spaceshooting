// hooks/useTouchControls.tsx
import { useEffect, useState, RefObject } from 'react';
import { GameState } from '../types/types';

type ShootCallback = () => void;

export const useTouchControls = (
  gameAreaRef: RefObject<HTMLDivElement>,
  gameState: GameState,
  bulletCooldown: boolean,
  shoot: ShootCallback
) => {
  const [touchMove, setTouchMove] = useState<{ x: number; y: number } | null>(null);
  
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = gameAreaRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = ((touch.clientX - rect.left) / rect.width) * 100;
      const y = ((touch.clientY - rect.top) / rect.height) * 100;
      
      setTouchMove({ x, y });
      
      // Shoot when touching bottom part of screen
      if (y > 80 && !bulletCooldown && gameState === 'playing') {
        shoot();
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
  }, [bulletCooldown, gameState, gameAreaRef, shoot]);

  return { touchMove, setTouchMove };
};