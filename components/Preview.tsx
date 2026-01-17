import React, { useState } from 'react';
import { ChevronDown, Check, BarChart2, MoreHorizontal } from 'lucide-react';
import chroma from 'chroma-js';

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

interface PreviewProps {
  color: string;
}

type SimulationMode = 'None' | 'Protanopia' | 'Deuteranopia' | 'Tritanopia' | 'Achromatopsia';

export const Preview: React.FC<PreviewProps> = ({ color }) => {
  const [mode, setMode] = useState<SimulationMode>('None');
  const [isOpen, setIsOpen] = useState(false);

  // Derive theme colors for the Mock UI
  const validColor = chroma.valid(color) ? color : '#85329a';
  const c = chroma(validColor);
  
  // Create a rich dark theme based on the input hue
  const bg = c.set('hsl.l', 0.15).set('hsl.s', 0.3).hex();
  const accent = c.set('hsl.l', 0.5).saturate(1).hex(); 
  const titleColor = c.set('hsl.l', 0.6).saturate(0.5).hex();
  const textColor = c.set('hsl.l', 0.7).saturate(0.2).hex();
  const trackColor = c.set('hsl.l', 0.4).desaturate(0.2).hex();

  const options: SimulationMode[] = ['None', 'Protanopia', 'Deuteranopia', 'Tritanopia', 'Achromatopsia'];

  const getFilterStyle = () => {
    if (mode === 'None') return {};
    return { filter: `url(#${mode.toLowerCase()})` };
  };

  return (
    <div className="flex flex-col gap-4">
      <Filters />
      
      {/* Header & Controls */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Preview Context</h2>
        
        {/* Dropdown modeled after image */}
        <div className="relative z-20">
            <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500">Color Simulation</label>
                <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-56 px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                <span className="truncate text-base">{mode}</span>
                <ChevronDown size={18} className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}/>
                </button>
            </div>

            {isOpen && (
            <>
                <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-56 bg-[#e5e5e5] border border-gray-300 rounded-lg shadow-xl overflow-hidden z-20">
                <div className="py-1">
                    {options.map((opt) => (
                    <button
                        key={opt}
                        onClick={() => { setMode(opt); setIsOpen(false); }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-left hover:bg-black/5 text-gray-800 transition-colors"
                    >
                        <span className="w-6 flex items-center justify-start">
                        {mode === opt && <Check size={16} className="text-black"/>}
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

      {/* Mock UI Container */}
      <div className="transition-all duration-500 ease-in-out" style={getFilterStyle()}>
         <div 
            className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-white/10"
            style={{ backgroundColor: bg }}
         >
            {/* Playlist UI Mockup */}
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end">
               
               {/* Cover Art */}
               <div 
                 className="w-32 h-32 md:w-40 md:h-40 rounded-xl shadow-2xl shrink-0 flex items-center justify-center relative overflow-hidden group"
                 style={{ backgroundColor: accent }}
               >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-black/10"></div>
                  <div className="text-black/20 group-hover:scale-110 transition-transform duration-500">
                     <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.5 9.5H22L16 14L18.5 21.5L12 17L5.5 21.5L8 14L2 9.5H9.5L12 2Z"/></svg>
                  </div>
               </div>
               
               {/* List Content */}
               <div className="flex-1 w-full min-w-0 flex flex-col gap-4">
                  <div className="text-center md:text-left">
                    <h3 className="text-3xl font-bold mb-1 truncate tracking-tight" style={{ color: titleColor }}>Jam Session</h3>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-80" style={{ color: trackColor }}>Playlist by Figma</p>
                  </div>

                  <div className="w-full h-px bg-white/10"></div>
                  
                  <div className="space-y-1">
                     {[
                       { id: '01', title: 'Lo-fi hip hop', time: '4:11' },
                       { id: '02', title: 'Acoustic ambient', time: '5:10' },
                       { id: '03', title: 'Button smash', time: '3:59' }
                     ].map((track) => (
                       <div key={track.id} className="flex items-center gap-4 py-2 px-3 rounded-lg hover:bg-white/5 transition-colors cursor-default group">
                          <span className="text-sm font-mono font-medium opacity-60 w-6" style={{ color: trackColor }}>{track.id}</span>
                          <span className="text-base font-semibold flex-1 truncate" style={{ color: textColor }}>{track.title}</span>
                          
                          <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                             <MoreHorizontal size={16} style={{ color: textColor }}/>
                          </div>
                          
                          <div className="flex items-center gap-2">
                             <BarChart2 size={16} className="opacity-40" style={{ color: trackColor }}/>
                             <span className="text-sm font-mono font-medium opacity-60" style={{ color: trackColor }}>{track.time}</span>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};