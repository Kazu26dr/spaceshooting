import React from 'react';

const Instructions: React.FC = () => {
  return (
    <div className="mt-4 text-sm text-gray-300 px-4 text-center">
      <p><strong>Controls:</strong> Arrow keys to move, SPACE to shoot, P to pause</p>
      <p className="mt-1"><strong>Power-ups:</strong> Yellow (2x Shot), Purple (3x Shot), Red (5x Shot), Green (Extra Life)</p>
    </div>
  );
};

export default Instructions;