import React, { useRef, useEffect, useState, useCallback } from 'react';
import chroma from 'chroma-js';
import { Pipette } from 'lucide-react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, className }) => {
  // Internal HSV state to preserve Hue during low saturation/value interactions
  const [internalHsv, setInternalHsv] = useState<[number, number, number]>([0, 1, 1]);
  const hueRef = useRef<HTMLDivElement>(null);
  const svRef = useRef<HTMLDivElement>(null);
  const [isDraggingSV, setIsDraggingSV] = useState(false);
  const [isDraggingHue, setIsDraggingHue] = useState(false);

  // Sync internal state with external prop safely
  useEffect(() => {
    if (chroma.valid(color)) {
      const [h, s, v] = chroma(color).hsv();
      const currentHex = chroma.hsv(...internalHsv).hex();
      
      if (color.toLowerCase() !== currentHex.toLowerCase()) {
         const newH = isNaN(h) ? internalHsv[0] : h;
         setInternalHsv([newH, s, v]);
      }
    }
  }, [color]);

  const updateColor = useCallback((h: number, s: number, v: number) => {
    setInternalHsv([h, s, v]);
    const newColor = chroma.hsv(h, s, v).hex();
    onChange(newColor);
  }, [onChange]);

  // SV Box Handler
  const handleSVMove = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!svRef.current) return;
    const rect = svRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    updateColor(internalHsv[0], x, 1 - y);
  }, [internalHsv, updateColor]);

  // Hue Slider Handler
  const handleHueMove = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    updateColor(x * 360, internalHsv[1], internalHsv[2]);
  }, [internalHsv, updateColor]);

  // Global Drag Events
  useEffect(() => {
    const handleUp = () => { setIsDraggingSV(false); setIsDraggingHue(false); };
    const handleMove = (e: MouseEvent) => {
      if (isDraggingSV) handleSVMove(e);
      if (isDraggingHue) handleHueMove(e);
    };
    if (isDraggingSV || isDraggingHue) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDraggingSV, isDraggingHue, handleSVMove, handleHueMove]);

  const handleRgbChange = (channel: 0 | 1 | 2, valStr: string) => {
    const val = parseInt(valStr);
    if (isNaN(val)) return;
    const rgb = chroma(color).rgb();
    rgb[channel] = Math.max(0, Math.min(255, val));
    onChange(chroma.rgb(...rgb).hex());
  };
  
  const handleHslChange = (channel: 'h' | 's' | 'l', valStr: string) => {
     const val = parseFloat(valStr);
     if (isNaN(val)) return;
     const currentHsl = chroma(color).hsl();
     let h = isNaN(currentHsl[0]) ? internalHsv[0] : currentHsl[0];
     let s = currentHsl[1];
     let l = currentHsl[2];

     if (channel === 'h') h = val;
     if (channel === 's') s = val / 100;
     if (channel === 'l') l = val / 100;

     onChange(chroma.hsl(h, s, l).hex());
  };

  const handleEyeDropper = async () => {
    if (!('EyeDropper' in window)) return;
    try {
      // @ts-ignore
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      if (result && result.sRGBHex) onChange(result.sRGBHex);
    } catch (e) {}
  };

  const [h, s, v] = internalHsv;
  const rgb = chroma.valid(color) ? chroma(color).rgb() : [0,0,0];
  const hsl = chroma.valid(color) ? chroma(color).hsl() : [0,0,0];
  const displayH = isNaN(hsl[0]) ? internalHsv[0] : hsl[0];

  const InputBox = ({ label, value, max, onChange }: { label: string, value: number, max: number, onChange: (val: string) => void }) => (
    <div className="flex flex-col gap-1 flex-1 min-w-0">
      <label className="text-[10px] text-gray-400 font-bold text-center uppercase tracking-wider">{label}</label>
      <input 
        type="number" 
        min={0} max={max} 
        value={Math.round(value)} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-1 py-1.5 text-center bg-white border border-gray-200 rounded-md text-sm font-mono focus:ring-2 focus:ring-purple-500 outline-none transition-shadow hover:border-gray-300"
      />
    </div>
  );

  return (
    <div className={`flex flex-col gap-5 bg-white p-5 rounded-xl border border-gray-200 shadow-sm ${className}`}>
      
      {/* 1. SV Box */}
      <div 
        className="relative w-full h-48 md:h-56 rounded-xl overflow-hidden cursor-crosshair shadow-inner ring-1 ring-black/5"
        ref={svRef}
        onMouseDown={(e) => { setIsDraggingSV(true); handleSVMove(e); }}
        style={{
          backgroundColor: `hsl(${h}, 100%, 50%)`,
          backgroundImage: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)`
        }}
      >
        <div 
          className="absolute w-5 h-5 border-2 border-white rounded-full shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: `${s * 100}%`, top: `${(1 - v) * 100}%`, backgroundColor: color }}
        />
      </div>

      {/* 2. Hue Slider & Controls */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center px-1">
             <span className="text-xs font-bold text-gray-400 uppercase">Hue</span>
             <span className="text-xs font-bold text-gray-500">{Math.round(h)}°</span>
        </div>
        
        <div className="flex items-center gap-3">
            <div 
              ref={hueRef}
              className="relative flex-1 h-4 rounded-full cursor-pointer shadow-inner ring-1 ring-black/5"
              style={{ background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)' }}
              onMouseDown={(e) => { setIsDraggingHue(true); handleHueMove(e); }}
            >
               <div 
                 className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full shadow-md cursor-grab active:cursor-grabbing transform -translate-x-1/2"
                 style={{ left: `${(h / 360) * 100}%` }}
               />
            </div>

            <button 
               onClick={handleEyeDropper}
               disabled={!('EyeDropper' in window)}
               className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
               title="Pick color from screen"
            >
               <Pipette size={18} />
            </button>
        </div>
      </div>

      {/* 3. Inputs */}
      <div className="grid grid-cols-2 gap-6 pt-1">
         {/* RGB */}
         <div className="flex gap-2">
            <InputBox label="R" value={rgb[0]} max={255} onChange={(v) => handleRgbChange(0, v)} />
            <InputBox label="G" value={rgb[1]} max={255} onChange={(v) => handleRgbChange(1, v)} />
            <InputBox label="B" value={rgb[2]} max={255} onChange={(v) => handleRgbChange(2, v)} />
         </div>

         {/* HSL */}
         <div className="flex gap-2">
            <InputBox label="H" value={displayH} max={360} onChange={(v) => handleHslChange('h', v)} />
            <InputBox label="S" value={hsl[1] * 100} max={100} onChange={(v) => handleHslChange('s', v)} />
            <InputBox label="L" value={hsl[2] * 100} max={100} onChange={(v) => handleHslChange('l', v)} />
         </div>
      </div>
    </div>
  );
};