import React from 'react';
import { ThemeMode } from '../types';
import { Sparkles, RefreshCw } from 'lucide-react';

interface HeroBrandingProps {
  currentTheme: ThemeMode;
  onToggleTheme: () => void;
}

export const HeroBranding: React.FC<HeroBrandingProps> = ({
  currentTheme,
  onToggleTheme,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center select-none px-3 pt-6 sm:pt-14 md:pt-16 pb-1 z-10 transition-all duration-700">
      <div className="flex flex-col items-center">
        {/* Main Hindi Title with glowing drop shadow */}
        <h1 className="font-hindi text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight text-white drop-shadow-[0_8px_32px_rgba(0,0,0,0.85)] transition-all duration-500 hover:scale-[1.02]">
          {currentTheme === 'sukoon' ? 'सुकून' : 'पुराने दिन'}
        </h1>

        {/* Dynamic Era Subtitle Badge & Theme Switcher Button */}
        <div className="mt-2.5 sm:mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2.5 px-3 py-0.5 sm:py-1 rounded-full bg-black/35 backdrop-blur-md border border-white/10 text-[9px] sm:text-xs font-semibold tracking-[0.15em] sm:tracking-[0.3em] uppercase text-amber-200/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            <span>
              {currentTheme === 'sukoon' ? '2000s NOSTALGIA RADIO' : 'PURANE DIN CLASSICS'}
            </span>
            <span className="text-amber-400">•</span>
            <span>
              {currentTheme === 'sukoon' ? 'GOLDEN ERA' : 'PAHADI CHAI & MEMORIES'}
            </span>
          </div>

          {/* Quick Switch Theme Button */}
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 backdrop-blur-md border border-white/20 text-[10px] sm:text-[11px] font-medium text-white transition-all shadow-md cursor-pointer pointer-events-auto"
            title={`Switch to ${currentTheme === 'sukoon' ? 'पुराने दिन' : 'सुकून'}`}
          >
            <RefreshCw className="w-3 h-3 text-amber-300" />
            <span>Switch to {currentTheme === 'sukoon' ? 'पुराने दिन' : 'सुकून'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
