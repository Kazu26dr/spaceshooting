// utils/collision.ts
import { GameObject } from '../types/types';

// 2つのゲームオブジェクト間の衝突を検出する
export const isColliding = (a: GameObject, b: GameObject): boolean => {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
};