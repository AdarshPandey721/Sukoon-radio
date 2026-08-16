import React, { useEffect, useState } from 'react';
import { Disc3, ListMusic, Radio, Instagram, Sparkles, Sun, Sunset } from 'lucide-react';
import { ThemeMode } from '../types';

interface HeaderProps {
  currentTheme: ThemeMode;
  onToggleTheme: () => void;
  onOpenPlaylists: () => void;
  onOpenSongs: () => void;
  onOpenVideo: () => void;
  isVideoOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTheme,
  onToggleTheme,
  onOpenPlaylists,
  onOpenSongs,
  onOpenVideo,
  isVideoOpen,
}) => {
  const [timeStr, setTimeStr] = useState({ hourMinute: '05:30', ampm: 'PM' });
  const [listenerCount, setListenerCount] = useState(678);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      const parts = formatter.formatToParts(now);
      const hour = parts.find((p) => p.type === 'hour')?.value || '12';
      const minute = parts.find((p) => p.type === 'minute')?.value || '00';
      const dayPeriod = parts.find((p) => p.type === 'dayPeriod')?.value || 'PM';

      setTimeStr({
        hourMinute: `${hour}:${minute}`,
        ampm: dayPeriod.toUpperCase(),
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Subtle realistic listener fluctuations
  useEffect(() => {
    const listenerInterval = setInterval(() => {
      setListenerCount((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(620, Math.min(740, prev + delta));
      });
    }, 12000);
    return () => clearInterval(listenerInterval);
  }, []);

  const [hourPart, minutePart] = timeStr.hourMinute.split(':');

  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between p-2.5 sm:p-5 pointer-events-none select-none text-white max-w-7xl mx-auto">
      {/* Top Left: IST Live Clock & Theme Switcher Pill */}
      <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
        <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-lg transition hover:bg-black/60">
          <span className="text-[11px] sm:text-xs tracking-wider sm:tracking-widest font-mono font-medium text-amber-300/90">
            {hourPart}
            <span className="colon-blink text-amber-400 font-bold">:</span>
            {minutePart} {timeStr.ampm}
          </span>
          <span className="text-[9px] sm:text-[10px] text-white/50 tracking-wider font-mono">IST</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-md border text-[11px] sm:text-xs font-medium transition-all active:scale-95 shadow-lg ${
            currentTheme === 'sukoon'
              ? 'bg-emerald-950/60 hover:bg-emerald-900/80 border-emerald-500/40 text-emerald-200'
              : 'bg-amber-950/60 hover:bg-amber-900/80 border-amber-500/40 text-amber-200'
          }`}
          title="Switch Theme & Playlist"
        >
          {currentTheme === 'sukoon' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="font-hindi text-[11px] sm:text-xs">सुकून</span>
            </>
          ) : (
            <>
              <Sunset className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="font-hindi text-[11px] sm:text-xs">पुराने दिन</span>
            </>
          )}
        </button>
      </div>

      {/* Top Center: Live Online Listener Count */}
      <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-lg pointer-events-auto">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-medium tracking-wide text-white/90">
          <span className="tabular-nums font-semibold text-emerald-300">{listenerCount}</span> listening
        </span>
      </div>

      {/* Top Right: Instagram Icon + Navigation Pills */}
      <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
        {/* Instagram Account Icon Link (Strictly no text displayed) */}
        <a
          href="https://instagram.com/adarsh.pandey321"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-yellow-500/20 via-pink-500/25 to-purple-500/20 hover:from-pink-500/40 hover:to-orange-500/40 backdrop-blur-md border border-pink-500/30 hover:border-pink-400/70 text-pink-300 hover:text-white transition-all duration-200 active:scale-90 shadow-md shadow-pink-950/20 group"
          title="Adarsh Pandey on Instagram"
          aria-label="Instagram Profile"
        >
          <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-400 group-hover:scale-110 group-hover:text-pink-200 transition-transform" />
        </a>

        {/* Playlists Button */}
        <button
          onClick={onOpenPlaylists}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-black/40 hover:bg-white/20 backdrop-blur-md border border-white/10 text-[11px] sm:text-xs font-medium transition active:scale-95 text-white/90"
        >
          <Disc3 className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">Playlists</span>
        </button>

        {/* Songs Button */}
        <button
          onClick={onOpenSongs}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-black/40 hover:bg-white/20 backdrop-blur-md border border-white/10 text-[11px] sm:text-xs font-medium transition active:scale-95 text-white/90"
        >
          <ListMusic className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">Songs</span>
        </button>

        {/* Video Mode Toggle Button */}
        <button
          onClick={onOpenVideo}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-md border text-[11px] sm:text-xs font-medium transition active:scale-95 ${
            isVideoOpen
              ? 'bg-amber-500/30 border-amber-400 text-amber-200'
              : 'bg-black/40 hover:bg-white/20 border-white/10 text-white/90'
          }`}
          title="Watch live player video"
        >
          <Radio className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">Video</span>
        </button>
      </div>
    </header>
  );
};
