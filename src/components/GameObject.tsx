import React from 'react';

export interface GameObjectProps {
  x: number;
  y: number;
  width: number;
  height: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const GameObject: React.FC<GameObjectProps> = ({
  x,
  y,
  width,
  height,
  className = '',
  style = {},
  children
}) => {
  return (
    <div
      className={`absolute ${className}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        height: `${height}%`,
        ...style
      }}
    >
      {children}
    </div>
  );
}; 