import React from 'react';
import { Plus } from 'lucide-react';
import { Swatch } from './Swatch';
import { PieChart } from './PieChart';

interface ColorSectionProps {
  title: string;
  colors: string[];
  onColorClick: (color: string) => void;
  layout?: 'row' | 'grid' | 'column' | 'pie';
  className?: string;
  action?: React.ReactNode;
  pieSize?: number;
}

export const ColorSection: React.FC<ColorSectionProps> = ({ 
  title, 
  colors, 
  onColorClick, 
  layout = 'row',
  className = '',
  action,
  pieSize = 120
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between min-h-[20px]">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 pl-1 leading-tight">{title}</h3>
        {action && <div className="text-gray-400 hover:text-gray-700 cursor-pointer">{action}</div>}
      </div>
      
      {layout === 'pie' ? (
        <div className="flex justify-center py-2">
          <PieChart colors={colors} onColorClick={onColorClick} size={pieSize} />
        </div>
      ) : (
        <div className={`
          gap-2 
          ${layout === 'row' ? 'flex flex-row overflow-x-auto pb-2 scrollbar-thin' : ''}
          ${layout === 'column' ? 'flex flex-col' : ''}
          ${layout === 'grid' ? 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6' : ''}
        `}>
          {colors.map((color, idx) => (
            <Swatch 
              key={`${title}-${idx}`} 
              color={color} 
              onClick={onColorClick}
              className={layout === 'column' ? 'h-10 w-full' : 'h-10 min-w-[3rem] w-full'}
              showHex={false}
            />
          ))}
          {colors.length === 0 && (
            <div className="text-xs text-gray-400 italic p-2 bg-gray-50 rounded-md border border-dashed border-gray-200">
              No colors generated
            </div>
          )}
        </div>
      )}
    </div>
  );
};