import React, { useRef, useState, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Radio, ListMusic } from 'lucide-react';
import { Track } from '../types';

interface MobilePlayerProps {
  currentTrack: Track;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isShuffle?: boolean;
  isLoop?: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek?: (time: number) => void;
  onToggleShuffle?: () => void;
  onToggleLoop?: () => void;
  onOpenSongs?: () => void;
  onOpenPlaylists?: () => void;
  onToggleVideo?: () => void;
  isVideoOpen?: boolean;
}

const formatTime = (secs: number): string => {
  if (isNaN(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export const MobilePlayer: React.FC<MobilePlayerProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  isShuffle = false,
  isLoop = false,
  onTogglePlay,
  onPrev,
  onNext,
  onSeek,
  onToggleShuffle,
  onToggleLoop,
  onOpenSongs,
  onToggleVideo,
  isVideoOpen,
}) => {
  const seekRailRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState<number | null>(null);

  const effectiveDuration = duration > 0 ? duration : currentTrack.duration || 180;
  const displayTime = scrubTime !== null ? scrubTime : currentTime;
  const progressPercent = Math.min(100, Math.max(0, (displayTime / effectiveDuration) * 100));

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!seekRailRef.current || !onSeek) return;
    setIsScrubbing(true);
    const rect = seekRailRef.current.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const target = ratio * effectiveDuration;
    setScrubTime(target);

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (!seekRailRef.current) return;
      const moveRect = seekRailRef.current.getBoundingClientRect();
      const moveRatio = Math.min(1, Math.max(0, (moveEvent.clientX - moveRect.left) / moveRect.width));
      setScrubTime(moveRatio * effectiveDuration);
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      if (!seekRailRef.current) return;
      const upRect = seekRailRef.current.getBoundingClientRect();
      const upRatio = Math.min(1, Math.max(0, (upEvent.clientX - upRect.left) / upRect.width));
      const finalTime = upRatio * effectiveDuration;
      onSeek(finalTime);
      setIsScrubbing(false);
      setScrubTime(null);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }, [effectiveDuration, onSeek]);

  const coverUrl = currentTrack.videoId
    ? `https://img.youtube.com/vi/${currentTrack.videoId}/mqdefault.jpg`
    : (currentTrack.cover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80');

  return (
    <div className="sm:hidden w-full max-w-sm mx-auto rounded-2xl overflow-hidden border border-white/20 bg-gradient-to-b from-black/80 via-zinc-950/85 to-black/90 backdrop-blur-2xl backdrop-saturate-[1.8] shadow-[0_12px_36px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.2)] text-white select-none transition-all">
      {/* Top 2.5px Interactive Scrubline with glow */}
      <div
        ref={seekRailRef}
        onPointerDown={handlePointerDown}
        className="relative w-full h-3 flex items-center cursor-pointer touch-none select-none px-2 -mb-1 z-10"
      >
        <div className="w-full h-[2.5px] rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {/* Scrub thumb */}
        <div
          className={`absolute w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)] -translate-x-1/2 transition-opacity ${
            isScrubbing ? 'opacity-100 scale-125' : 'opacity-0'
          }`}
          style={{ left: `${progressPercent}%` }}
        />
      </div>

      {/* Main Single Row: Vinyl + Info + Transport */}
      <div className="flex items-center justify-between gap-2.5 px-3 py-2">
        {/* Left: 40px Spinning Vinyl Cover Art */}
        <div
          className="relative w-10 h-10 shrink-0 cursor-pointer group active:scale-95 transition-transform"
          onClick={onToggleVideo}
          title="Toggle Video Mode"
        >
          <div
            className="w-full h-full rounded-full overflow-hidden shadow-md ring-1 ring-black/60 animate-spin-slow bg-neutral-900 flex items-center justify-center"
            style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
          >
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.15)_1px,_transparent_1px),radial-gradient(circle_at_center,_rgba(0,0,0,0.8)_20%,_rgba(20,20,20,0.95)_100%)] opacity-80 z-10" />
            <img
              src={coverUrl}
              alt={currentTrack.title}
              className="w-full h-full object-cover scale-110"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80';
              }}
            />
          </div>
          {/* Spindle hole */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-black ring-1 ring-white/60 shadow-inner z-20 pointer-events-none" />
        </div>

        {/* Middle Track Info */}
        <div className="flex-1 min-w-0 pr-1 cursor-pointer" onClick={onOpenSongs}>
          <div className="flex items-center gap-1.5">
            <h3 className="text-[13px] font-semibold text-white truncate leading-tight drop-shadow-sm">
              {currentTrack.title}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-[10.5px] text-white/65 truncate mt-0.5">
            <span className="truncate">{currentTrack.artist}</span>
            <span className="text-white/30">•</span>
            <span className="font-mono tabular-nums text-white/50 shrink-0">
              {formatTime(displayTime)} / {formatTime(effectiveDuration)}
            </span>
          </div>
        </div>

        {/* Right Transport Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Prev */}
          <button
            onClick={onPrev}
            className="w-8 h-8 flex items-center justify-center text-white/80 active:scale-80 transition active:text-white"
            title="Previous"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          {/* Center Play/Pause Button */}
          <button
            onClick={onTogglePlay}
            className="w-9 h-9 rounded-full bg-gradient-to-b from-amber-400 to-amber-500 text-black flex items-center justify-center ring-1 ring-white/30 shadow-[0_4px_14px_rgba(245,158,11,0.5)] transition-all active:scale-90"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={onNext}
            className="w-8 h-8 flex items-center justify-center text-white/80 active:scale-80 transition active:text-white"
            title="Next"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>

          {/* Quick Songs List Button */}
          {onOpenSongs && (
            <button
              onClick={onOpenSongs}
              className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-amber-300 active:scale-80 transition"
              title="Tracklist"
            >
              <ListMusic className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
