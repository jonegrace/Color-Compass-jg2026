import React from 'react';
import { Copy, Plus, Check } from 'lucide-react';
import chroma from 'chroma-js';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SwatchProps {
  color: string;
  onClick?: (color: string) => void;
  className?: string;
  showHex?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'auto';
  label?: string;
}

export const Swatch: React.FC<SwatchProps> = ({ 
  color, 
  onClick, 
  className, 
  showHex = false, 
  size = 'auto',
  label 
}) => {
  const [copied, setCopied] = React.useState(false);
  const isValid = chroma.valid(color);
  const displayColor = isValid ? color : '#cccccc';
  
  // Calculate contrast for text color
  const textColor = isValid 
    ? (chroma(displayColor).luminance() > 0.5 ? 'text-gray-900' : 'text-white') 
    : 'text-gray-500';

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleClick = () => {
    if (onClick) onClick(color);
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    auto: 'h-full w-full min-h-[40px]'
  };

  return (
    <div 
      className={twMerge(
        "group relative rounded-md border border-black/5 transition-all duration-200 hover:scale-[1.02] hover:shadow-sm cursor-pointer overflow-hidden",
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: displayColor }}
      onClick={handleClick}
      title={color}
    >
      {/* Hover Overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/10 transition-opacity flex items-center justify-center gap-2">
        <button 
          onClick={handleCopy}
          className={clsx("p-1.5 rounded-full bg-white/90 shadow-sm hover:bg-white transition-colors", copied ? "text-green-600" : "text-gray-700")}
          title="Copy Hex"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      
      {showHex && (
        <div className={clsx("absolute bottom-0 left-0 right-0 p-1 text-[10px] text-center font-mono truncate bg-white/30 backdrop-blur-[2px]", textColor)}>
          {color}
        </div>
      )}

      {label && (
         <div className={clsx("absolute top-0 left-0 right-0 p-1 text-[10px] text-center font-medium truncate opacity-70", textColor)}>
         {label}
       </div>
      )}
    </div>
  );
};
