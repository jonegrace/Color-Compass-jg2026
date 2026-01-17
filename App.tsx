import React, { useState, useEffect, useMemo } from 'react';
import { Copy, RefreshCw, Star, ArrowRight, CornerDownLeft, Palette, Sliders, Check, FileCode, List } from 'lucide-react';
import chroma from 'chroma-js';
import { Swatch } from './components/Swatch';
import { ColorSection } from './components/ColorSection';
import { ColorPicker } from './components/ColorPicker';
import { ContrastChecker } from './components/ContrastChecker';
import { generatePalette, blendColors, isValidHex, generateSvgStrip } from './utils/colorGenerator';
import { AppState } from './types';

const INITIAL_BASE = '#f3d0fc';

function App() {
  // State
  const [baseColor, setBaseColor] = useState<string>(INITIAL_BASE);
  // We removed inputValue, activeColor now drives the input directly
  const [activeColor, setActiveColor] = useState<string>(INITIAL_BASE);
  const [steps, setSteps] = useState<number>(9);
  const [library, setLibrary] = useState<string[]>([]);
  // Initialize with INITIAL_BASE so we have a starting point for transitions
  const [prevBaseColor, setPrevBaseColor] = useState<string | null>(INITIAL_BASE);
  
  const [toast, setToast] = useState<string | null>(null);

  // Derived State
  const palette = useMemo(() => generatePalette(baseColor, steps), [baseColor, steps]);
  const blendedColors = useMemo(() => {
    if (prevBaseColor && isValidHex(prevBaseColor) && isValidHex(baseColor)) {
      return blendColors(prevBaseColor, baseColor, 12); // Fixed number for the strip
    }
    return [];
  }, [baseColor, prevBaseColor]);

  // Handlers
  const handleUpdate = () => {
    if (isValidHex(activeColor)) {
      if (baseColor !== activeColor) {
        setPrevBaseColor(baseColor);
        setBaseColor(activeColor);
      } else {
        // Allow checkpointing even if values are synced
        if (prevBaseColor !== baseColor) {
           setPrevBaseColor(baseColor);
        }
      }
    }
  };

  const handleColorClick = (color: string) => {
    setActiveColor(color);
  };
  
  const handleColorPickerChange = (color: string) => {
    setActiveColor(color);
  };

  const handleAddToLibrary = () => {
    if (isValidHex(activeColor) && !library.includes(activeColor)) {
      setLibrary([...library, activeColor]);
    }
  };

  const handleClearLibrary = () => setLibrary([]);

  const handleRemoveFromLibrary = (colorToRemove: string) => {
    setLibrary(library.filter(c => c !== colorToRemove));
  };
  
  const handleCopySvg = (colors: string[]) => {
    if (colors.length === 0) return;
    const svg = generateSvgStrip(colors);
    navigator.clipboard.writeText(svg);
    setToast('Color chart copied as SVG');
    setTimeout(() => setToast(null), 2000);
  };

  const handleCopyList = (colors: string[]) => {
    if (colors.length === 0) return;
    const list = colors.join(', ');
    navigator.clipboard.writeText(list);
    setToast('Hex list copied to clipboard');
    setTimeout(() => setToast(null), 2000);
  };

  // Quick copy feedback
  const [baseCopied, setBaseCopied] = useState(false);
  const copyActive = () => {
      navigator.clipboard.writeText(activeColor);
      setBaseCopied(true);
      setTimeout(() => setBaseCopied(false), 1500);
  }

  // Check if we should show the blend strip (only if colors differ)
  const showBlendStrip = prevBaseColor && 
                         blendedColors.length > 0 && 
                         prevBaseColor.toLowerCase() !== baseColor.toLowerCase();

  // For pie charts, we include the base color to complete the "theory" visualization
  const getPieColors = (harmonyColors: string[]) => [baseColor, ...harmonyColors];

  const renderActions = (colors: string[], size = 12) => (
    <div className="flex items-center gap-2">
      <button onClick={() => handleCopyList(colors)} className="text-gray-400 hover:text-gray-700 transition-colors" title="Copy List"><List size={size} /></button>
      <button onClick={() => handleCopySvg(colors)} className="text-gray-400 hover:text-gray-700 transition-colors" title="Copy SVG"><FileCode size={size} /></button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-900 flex justify-center">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-50 flex items-center gap-2 animate-bounce">
          <Check size={14} className="text-green-400"/> {toast}
        </div>
      )}

      {/* Main Widget Container */}
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col">
        
        {/* --- Header / Global Controls --- */}
        <div className="bg-gray-900 text-white p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Palette className="text-purple-300" size={24} />
            <h1 className="text-xl font-bold tracking-tight">Color Compass</h1>
          </div>
          
          <div className="flex items-center gap-4 bg-gray-800 p-1.5 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2 px-3">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Steps</span>
              <input 
                type="number" 
                min="3" 
                max="20" 
                value={steps} 
                onChange={(e) => setSteps(Number(e.target.value))}
                className="w-12 bg-transparent text-center font-mono text-sm focus:outline-none focus:text-purple-300"
              />
            </div>
            <div className="h-6 w-px bg-gray-700"></div>
            <button 
              onClick={handleUpdate}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-2"
            >
              <RefreshCw size={14} />
              Update
            </button>
          </div>
        </div>

        {/* --- Core Context Area --- */}
        <div className="p-6 bg-gray-50 border-b border-gray-200 space-y-6">
          
          {/* Consolidated Color Control Bar */}
          <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-2">
            {/* Swatch */}
            <Swatch color={activeColor} className="w-full md:w-20 h-16 md:h-20 rounded-xl md:rounded-xl shadow-inner shrink-0" onClick={() => {}} />
            
            {/* Input Wrapper */}
            <div className="flex-1 flex flex-col justify-center px-4 py-2">
              <input 
                type="text" 
                value={activeColor}
                onChange={(e) => setActiveColor(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                className="text-2xl md:text-3xl font-mono font-bold text-gray-900 bg-transparent outline-none w-full uppercase placeholder-gray-300"
                placeholder="#HEX"
              />
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-12 bg-gray-100 mx-2"></div>

            {/* Actions */}
            <div className="flex items-center gap-2 p-2 justify-end">
              <button onClick={copyActive} className="p-3 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all" title="Copy Hex">
                  {baseCopied ? <Check size={20} className="text-green-600"/> : <Copy size={20} />}
              </button>
              
              <button onClick={handleAddToLibrary} className="p-3 text-gray-500 hover:text-yellow-500 hover:bg-gray-50 rounded-xl transition-all" title="Add to Library">
                  <Star size={20} className={library.includes(activeColor) ? "fill-yellow-400 text-yellow-400" : ""} />
              </button>

              <div className="w-px h-8 bg-gray-100 mx-1"></div>

              <button 
                onClick={handleUpdate} 
                className="flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all shadow-md active:scale-95"
                title="Set as Base Color"
              >
                <CornerDownLeft size={18} />
                <span className="font-semibold text-sm whitespace-nowrap">Set Base</span>
              </button>
            </div>
          </div>

          {/* Swatch Library */}
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
             <div className="flex justify-between items-center mb-2">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                 <Star size={12} /> Swatch Library
               </h3>
               
               <div className="flex items-center gap-3">
                   {library.length > 0 && renderActions(library, 14)}
                   {library.length > 0 && (
                     <>
                        <div className="h-3 w-px bg-gray-200"></div>
                        <button onClick={handleClearLibrary} className="text-[10px] font-medium text-red-500 hover:text-red-600">
                        Clear All
                        </button>
                     </>
                   )}
               </div>
             </div>
             
             <div className="flex gap-2 min-h-[48px] items-center overflow-x-auto pb-1">
                {library.length === 0 ? (
                  <span className="text-sm text-gray-300 italic select-none">Saved colors will appear here...</span>
                ) : (
                  library.map((c, i) => (
                    <div key={i} className="relative group shrink-0">
                      <Swatch color={c} className="w-10 h-10 rounded-lg" onClick={handleColorClick} />
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRemoveFromLibrary(c); }}
                        className="absolute -top-1 -right-1 bg-white shadow-md rounded-full p-0.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </div>
                  ))
                )}
             </div>
          </div>

          {/* Picker & Contrast - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
             <ColorPicker color={activeColor} onChange={handleColorPickerChange} className="h-full" />
             <ContrastChecker activeColor={activeColor} className="h-full" />
          </div>

          {/* Tints & Shades Strips (Moved from bottom) */}
          <div className="flex flex-col gap-6">
             <ColorSection 
               title="Tints" 
               colors={palette.tints} 
               onColorClick={handleColorClick} 
               layout="row" 
               action={renderActions(palette.tints)}
             />
             <ColorSection 
               title="Shades" 
               colors={palette.shades} 
               onColorClick={handleColorClick} 
               layout="row" 
               action={renderActions(palette.shades)}
             />
          </div>
          
          {/* Blend Strip */}
          {showBlendStrip && (
             <div>
                <div className="flex justify-between items-end mb-1">
                   <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Blend with previous</h3>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleCopyList(blendedColors)} className="text-gray-400 hover:text-gray-700 transition-colors" title="Copy List"><List size={10} /></button>
                        <button onClick={() => handleCopySvg(blendedColors)} className="text-gray-400 hover:text-gray-700 transition-colors" title="Copy SVG"><FileCode size={10} /></button>
                      </div>
                   </div>
                  <div className="flex text-[10px] text-gray-400 font-mono gap-1">
                     <span>{prevBaseColor}</span>
                     <ArrowRight size={10} className="mt-0.5"/>
                     <span>{baseColor}</span>
                  </div>
                </div>
                <div className="h-10 w-full rounded-lg overflow-hidden flex">
                   {blendedColors.map((c, i) => (
                      <div 
                        key={i} 
                        style={{ backgroundColor: c }} 
                        className="flex-1 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => handleColorClick(c)}
                        title={c}
                      ></div>
                   ))}
                </div>
             </div>
          )}

        </div>

        {/* --- Main Generation Grid --- */}
        <div className="flex-1 p-6 flex flex-col gap-6">
             
             {/* Random Grid */}
             <div>
                <ColorSection 
                  title="Random" 
                  colors={palette.random} 
                  onColorClick={handleColorClick} 
                  layout="grid" 
                  action={renderActions(palette.random, 14)}
                />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ColorSection title="Dark Mode" colors={palette.darkMode} onColorClick={handleColorClick} layout="row" action={renderActions(palette.darkMode, 14)}/>
                <ColorSection title="Light Mode" colors={palette.lightMode} onColorClick={handleColorClick} layout="row" action={renderActions(palette.lightMode, 14)}/>
             </div>

             {/* Compact Harmonies Row */}
             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-4 border-t border-gray-100">
                <ColorSection 
                  title="Complementary" 
                  colors={getPieColors(palette.complementary)} 
                  onColorClick={handleColorClick} 
                  layout="pie" 
                  pieSize={100}
                  action={renderActions(getPieColors(palette.complementary))}
                />
                
                <ColorSection 
                  title="Split Comp." 
                  colors={getPieColors(palette.splitComplementary)} 
                  onColorClick={handleColorClick} 
                  layout="pie" 
                  pieSize={100}
                  action={renderActions(getPieColors(palette.splitComplementary))}
                />
                
                <ColorSection 
                  title="Triadic" 
                  colors={getPieColors(palette.triadic)} 
                  onColorClick={handleColorClick} 
                  layout="pie" 
                  pieSize={100}
                  action={renderActions(getPieColors(palette.triadic))}
                />

                <ColorSection 
                  title="Analogous" 
                  colors={getPieColors(palette.analogous)} 
                  onColorClick={handleColorClick} 
                  layout="pie" 
                  pieSize={100}
                  action={renderActions(getPieColors(palette.analogous))}
                />

                <ColorSection 
                  title="Tetradic" 
                  colors={getPieColors(palette.tetradic)} 
                  onColorClick={handleColorClick} 
                  layout="pie" 
                  pieSize={100}
                  action={renderActions(getPieColors(palette.tetradic))}
                />
             </div>
             
             {/* Saturation Controls */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
               <ColorSection title="Saturate" colors={palette.saturate} onColorClick={handleColorClick} layout="grid" action={renderActions(palette.saturate, 14)}/>
               <ColorSection title="Desaturate" colors={palette.desaturate} onColorClick={handleColorClick} layout="grid" action={renderActions(palette.desaturate, 14)}/>
             </div>
        </div>
      </div>
    </div>
  );
}

export default App;