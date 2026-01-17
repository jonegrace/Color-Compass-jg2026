import React, { useState, useEffect } from 'react';
import chroma from 'chroma-js';
import { ArrowRightLeft, Check, X, ChevronDown } from 'lucide-react';

const Filters = () => (
  <svg style={{ display: 'none' }}>
    <defs>
      <filter id="protanopia">
        <feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0
                                           0.558, 0.442, 0, 0, 0
                                           0, 0.242, 0.758, 0, 0
                                           0, 0, 0, 1, 0" in="SourceGraphic" />
      </filter>
      <filter id="deuteranopia">
        <feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0
                                           0.7, 0.3, 0, 0, 0
                                           0, 0.3, 0.7, 0, 0
                                           0, 0, 0, 1, 0" in="SourceGraphic" />
      </filter>
      <filter id="tritanopia">
        <feColorMatrix type="matrix" values="0.95, 0.05, 0, 0, 0
                                           0, 0.433, 0.567, 0, 0
                                           0, 0.475, 0.525, 0, 0
                                           0, 0, 0, 1, 0" in="SourceGraphic" />
      </filter>
      <filter id="achromatopsia">
        <feColorMatrix type="matrix" values="0.299, 0.587, 0.114, 0, 0
                                           0.299, 0.587, 0.114, 0, 0
                                           0.299, 0.587, 0.114, 0, 0
                                           0, 0, 0, 1, 0" in="SourceGraphic" />
      </filter>
    </defs>
  </svg>
);

interface ContrastCheckerProps {
  activeColor: string;
  className?: string;
}

type SimulationMode = 'None' | 'Protanopia' | 'Deuteranopia' | 'Tritanopia' | 'Achromatopsia';

export const ContrastChecker: React.FC<ContrastCheckerProps> = ({ activeColor, className = '' }) => {
  const [fg, setFg] = useState(activeColor);
  const [bg, setBg] = useState('#ffffff');
  const [fgInput, setFgInput] = useState(activeColor);
  const [bgInput, setBgInput] = useState('#ffffff');
  
  // Simulation State
  const [mode, setMode] = useState<SimulationMode>('None');
  const [isOpen, setIsOpen] = useState(false);
  const options: SimulationMode[] = ['None', 'Protanopia', 'Deuteranopia', 'Tritanopia', 'Achromatopsia'];

  useEffect(() => {
    if (chroma.valid(activeColor)) {
      setFg(activeColor);
      setFgInput(activeColor);
    }
  }, [activeColor]);

  const handleFgChange = (val: string) => {
    setFgInput(val);
    if (chroma.valid(val)) setFg(val);
  };

  const handleBgChange = (val: string) => {
    setBgInput(val);
    if (chroma.valid(val)) setBg(val);
  };

  const swapColors = () => {
    setFg(bg);
    setBg(fg);
    setFgInput(bg);
    setBgInput(fg);
  };

  const validFg = chroma.valid(fg) ? chroma(fg) : chroma('#000');
  const validBg = chroma.valid(bg) ? chroma(bg) : chroma('#fff');
  const contrast = chroma.contrast(validFg, validBg);
  const ratio = Math.floor(contrast * 100) / 100;

  let headerColor = 'bg-red-600';
  if (contrast >= 7) headerColor = 'bg-green-600';
  else if (contrast >= 4.5) headerColor = 'bg-emerald-500';
  else if (contrast >= 3) headerColor = 'bg-yellow-500';

  const PassIcon = () => <div className="flex items-center gap-1 font-medium text-xs"><div className="bg-green-100 text-green-600 p-0.5 rounded-full"><Check size={10} /></div> Pass</div>;
  const FailIcon = () => <div className="flex items-center gap-1 font-medium text-xs"><div className="bg-red-100 text-red-500 p-0.5 rounded-full"><X size={10} /></div> Fail</div>;

  const getResult = (score: number, threshold: number) => score >= threshold ? <PassIcon /> : <FailIcon />;
  
  const cardStyle: React.CSSProperties = {
      backgroundColor: validBg.hex(),
      color: validFg.hex(),
      filter: mode !== 'None' ? `url(#${mode.toLowerCase()})` : undefined
  };
  
  const inputStyle = {
      backgroundColor: '#ffffff',
      color: '#111827'
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <Filters />
      
      {/* Card Container */}
      <div 
        className="flex flex-col rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-colors duration-300"
        style={cardStyle}
      >
        <div className={`${headerColor} h-2 transition-colors duration-300`}></div>
        
        <div className="p-5 flex flex-col gap-5 h-full">
          {/* Header Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <span className="text-sm font-bold uppercase tracking-wider opacity-60">Contrast</span>
               <span className={`text-xl font-mono font-bold px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-sm border border-black/5`}>
                  {ratio.toFixed(2)}:1
               </span>
            </div>
            <button 
              onClick={swapColors}
              className="flex items-center gap-1.5 text-xs font-medium opacity-60 hover:opacity-100 transition-opacity px-2 py-1 rounded-md hover:bg-black/5"
            >
              <ArrowRightLeft size={14} />
              Swap
            </button>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
              <div className="space-y-1.5">
                 <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">Foreground</label>
                 <div className="flex gap-2">
                   <input 
                     type="text" 
                     value={fgInput} 
                     onChange={(e) => handleFgChange(e.target.value)}
                     className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-purple-500 outline-none uppercase"
                     style={inputStyle}
                   />
                   <div className="w-10 h-10 rounded-lg shadow-sm border border-gray-100 shrink-0" style={{backgroundColor: validFg.hex()}}></div>
                 </div>
              </div>

              <div className="space-y-1.5">
                 <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">Background</label>
                 <div className="flex gap-2">
                   <input 
                     type="text" 
                     value={bgInput} 
                     onChange={(e) => handleBgChange(e.target.value)}
                     className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-purple-500 outline-none uppercase"
                     style={inputStyle}
                   />
                   <div className="w-10 h-10 rounded-lg shadow-sm border border-gray-100 shrink-0" style={{backgroundColor: validBg.hex()}}></div>
                 </div>
              </div>
          </div>

          {/* Results Table */}
          <div className="mt-auto">
             <div className="grid grid-cols-3 gap-2 pb-2 border-b border-black/10 mb-2 opacity-60">
               <span className="text-[10px] font-bold uppercase">Category</span>
               <span className="text-[10px] font-bold uppercase text-center">AA</span>
               <span className="text-[10px] font-bold uppercase text-center">AAA</span>
             </div>
             
             <div className="space-y-3 text-sm">
               <div className="grid grid-cols-3 gap-2 items-center">
                 <div className="font-medium truncate">
                    Normal text
                 </div>
                 <div className="flex justify-center">{getResult(contrast, 4.5)}</div>
                 <div className="flex justify-center">{getResult(contrast, 7.0)}</div>
               </div>
               
               <div className="grid grid-cols-3 gap-2 items-center">
                  <div className="text-lg font-bold truncate">
                    Large text
                 </div>
                 <div className="flex justify-center">{getResult(contrast, 3.0)}</div>
                 <div className="flex justify-center">{getResult(contrast, 4.5)}</div>
               </div>

               <div className="grid grid-cols-3 gap-2 items-center">
                 <div className="text-xs font-medium flex items-center gap-2 truncate">
                    <div className="w-3 h-3 rounded-sm border-2" style={{ borderColor: validFg.hex() }}></div>
                    UI Elements
                 </div>
                 <div className="flex justify-center">{getResult(contrast, 3.0)}</div>
                 <div className="flex justify-center opacity-30 text-[10px]">-</div>
               </div>
             </div>
          </div>
        </div>
      </div>
      
      {/* Simulation Selector */}
      <div className="flex flex-col gap-1 px-1">
         <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500">Color Simulation</label>
         <div className="relative z-20">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-between w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <span className="truncate">{mode}</span>
              <ChevronDown size={16} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}/>
            </button>
            
            {isOpen && (
              <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                  <div className="absolute right-0 left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-20 max-h-48 overflow-y-auto">
                  <div className="py-1">
                      {options.map((opt) => (
                      <button
                          key={opt}
                          onClick={() => { setMode(opt); setIsOpen(false); }}
                          className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-50 text-gray-800 transition-colors"
                      >
                          <span className="w-6 flex items-center justify-start">
                          {mode === opt && <Check size={14} />}
                          </span>
                          {opt}
                      </button>
                      ))}
                  </div>
                  </div>
              </>
            )}
         </div>
      </div>
    </div>
  );
};