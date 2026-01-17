import React from 'react';
import { clsx } from 'clsx';

interface PieChartProps {
  colors: string[];
  onColorClick: (color: string) => void;
  size?: number;
  className?: string;
}

export const PieChart: React.FC<PieChartProps> = ({ 
  colors, 
  onColorClick, 
  size = 120,
  className 
}) => {
  if (!colors.length) return null;

  const radius = 50;
  const center = 50;

  // Single color case: draw a circle
  if (colors.length === 1) {
    return (
      <svg 
        viewBox="0 0 100 100" 
        width={size} 
        height={size} 
        className={clsx("transform transition-transform hover:scale-105 cursor-pointer drop-shadow-sm", className)}
        onClick={() => onColorClick(colors[0])}
      >
        <circle cx="50" cy="50" r="50" fill={colors[0]} />
      </svg>
    );
  }

  const slices = colors.map((color, i) => {
    const startAngle = (i * 360) / colors.length;
    const endAngle = ((i + 1) * 360) / colors.length;

    // Convert to radians, subtract 90deg to start at 12 o'clock
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    // Large arc flag: 1 if angle >= 180
    const largeArcFlag = (endAngle - startAngle) > 180 ? 1 : 0;

    const pathData = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    return (
      <path
        key={i}
        d={pathData}
        fill={color}
        stroke="white"
        strokeWidth="1.5"
        className="hover:opacity-90 transition-opacity cursor-pointer"
        onClick={(e) => {
            e.stopPropagation();
            onColorClick(color);
        }}
        title={color}
      />
    );
  });

  return (
    <svg 
      viewBox="0 0 100 100" 
      width={size} 
      height={size} 
      className={clsx("drop-shadow-sm hover:scale-[1.02] transition-transform duration-300", className)}
    >
      {slices}
    </svg>
  );
};
