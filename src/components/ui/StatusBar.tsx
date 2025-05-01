import React from 'react';
import { Heart } from 'lucide-react';

interface StatusBarProps {
  score: number;
  level: number;
  lives: number;
}

const StatusBar: React.FC<StatusBarProps> = ({ score, level, lives }) => {
  return (
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
  );
};

export default StatusBar;