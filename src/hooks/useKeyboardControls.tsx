// hooks/useKeyboardControls.tsx
import { useEffect, useRef } from 'react';
import { GameState } from '../types/types';

type ShootCallback = () => void;
type TogglePauseCallback = () => void;

export const useKeyboardControls = (
  gameState: GameState,
  bulletCooldown: boolean,
  shoot: ShootCallback,
  togglePause: TogglePauseCallback
) => {
  const keysPressed = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;
      
      // Space key to shoot
      if (e.key === ' ' && !bulletCooldown && gameState === 'playing') {
        shoot();
      }
      
      // P key to pause
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
  }, [bulletCooldown, gameState, shoot, togglePause]);

  return keysPressed;
};