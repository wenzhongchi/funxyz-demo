import React from 'react';

interface SpinProps {
  size?: number;
  color?: string;
  thickness?: number;
}

const Spin: React.FC<SpinProps> = ({ 
  size = 40, 
  color = '#2563eb',
  thickness = 4
}) => {
  return (
    <div className="relative inline-flex justify-center items-center" style={{ width: size, height: size }}>
      <svg
        className="animate-spin"
        viewBox="0 0 50 50"
        style={{ width: '100%', height: '100%' }}
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          style={{
            fill: 'none',
            stroke: color,
            strokeWidth: thickness,
            strokeLinecap: 'round',
            strokeDasharray: '90,150',
            transformOrigin: 'center',
          }}
        />
      </svg>
    </div>
  );
};

export default Spin;
