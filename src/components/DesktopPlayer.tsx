import React, { useRef, useState, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, Radio } from 'lucide-react';
import { Track } from '../types';

interface DesktopPlayerProps {
  currentTrack: Track;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  isLoop: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onToggleLoop: () => void;
  onToggleVideo: () => void;
  isVideoOpen: boolean;
}

const formatTime = (secs: number): string => {
  if (isNaN(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export const DesktopPlayer: React.FC<DesktopPlayerProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isShuffle,
  isLoop,
  onTogglePlay,
  onPrev,
  onNext,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onToggleLoop,
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
    if (!seekRailRef.current) return;
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

  // YouTube thumbnail URL
  const coverUrl = currentTrack.videoId
    ? `https://img.youtube.com/vi/${currentTrack.videoId}/mqdefault.jpg`
    : (currentTrack.cover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80');

  return (
    <div className="hidden sm:flex items-center gap-3.5 w-full max-w-xl rounded-full py-2 px-3.5 pr-5 border border-white/15 bg-gradient-to-b from-white/[0.12] to-white/[0.04] backdrop-blur-3xl backdrop-saturate-[1.8] shadow-[0_16px_40px_-10px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.2)] text-white select-none transition-all duration-300">
      {/* 48px Spinning Vinyl with Cover Art */}
      <div className="relative w-12 h-12 shrink-0 group cursor-pointer" onClick={onToggleVideo}>
        <div
          className="w-full h-full rounded-full overflow-hidden shadow-lg ring-1 ring-black/50 animate-spin-slow bg-neutral-950 flex items-center justify-center"
          style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
        >
          {/* Vinyl grooves overlay */}
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

        {/* Center Spindle Hole */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-black/90 ring-1 ring-white/50 shadow-inner z-20 pointer-events-none" />

        {/* Video Popout Hover indicator */}
        <div
          className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200 z-30"
          title={isVideoOpen ? 'Hide Video' : 'Show Video'}
        >
          <Radio className="w-4 h-4 text-amber-300 animate-pulse" />
        </div>
      </div>

      {/* Middle Track Info & Seek Bar */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        {/* Title & Time */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex items-baseline gap-2">
            <h3 className="text-[13.5px] font-semibold text-white truncate leading-tight tracking-tight drop-shadow-sm">
              {currentTrack.title}
            </h3>
            {currentTrack.film && (
              <span className="text-[10px] font-medium text-amber-300/90 px-1.5 py-0.2 rounded bg-amber-400/10 border border-amber-400/20 truncate hidden md:inline">
                {currentTrack.film}
              </span>
            )}
          </div>

          {/* Elapsed / Duration Timestamp */}
          <div className="text-[10px] tabular-nums font-mono text-white/60 tracking-wider shrink-0 text-right">
            <span>{formatTime(displayTime)}</span>
            <span className="mx-0.5 text-white/30">/</span>
            <span>{formatTime(effectiveDuration)}</span>
          </div>
        </div>

        {/* Artist Line & Subtle Film */}
        <p className="text-[11.5px] text-white/65 truncate leading-none -mt-0.5">
          {currentTrack.artist}
        </p>

        {/* 16px interactive seek bar */}
        <div
          ref={seekRailRef}
          onPointerDown={handlePointerDown}
          className="group relative h-4 flex items-center cursor-pointer touch-none select-none -my-1"
        >
          {/* Track Rail */}
          <div className="w-full h-[3px] rounded-full bg-white/15 overflow-hidden transition-all group-hover:h-[4px]">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 rounded-full relative shadow-[0_0_10px_rgba(251,191,36,0.6)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Scrub Knob visible on hover & dragging */}
          <div
            className={`absolute w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] -translate-x-1/2 transition-opacity duration-150 ${
              isScrubbing ? 'opacity-100 scale-125' : 'opacity-0 group-hover:opacity-100'
            }`}
            style={{ left: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Right Transport & Audio Controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Shuffle */}
        <button
          onClick={onToggleShuffle}
          className={`p-1.5 rounded-full transition active:scale-95 ${
            isShuffle ? 'text-amber-400 bg-amber-400/10' : 'text-white/50 hover:text-white hover:bg-white/10'
          }`}
          title="Shuffle"
        >
          <Shuffle className="w-3.5 h-3.5" />
        </button>

        {/* Previous */}
        <button
          onClick={onPrev}
          className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition active:scale-90"
          title="Previous Track"
        >
          <SkipBack className="w-3.5 h-3.5 fill-current" />
        </button>

        {/* Center 40px Play/Pause Circle */}
        <button
          onClick={onTogglePlay}
          className="w-10 h-10 rounded-full bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black flex items-center justify-center ring-1 ring-white/30 shadow-[0_4px_16px_rgba(245,158,11,0.5)] transition-all duration-200 active:scale-95 hover:scale-105"
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
          className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition active:scale-90"
          title="Next Track"
        >
          <SkipForward className="w-3.5 h-3.5 fill-current" />
        </button>

        {/* Repeat Loop */}
        <button
          onClick={onToggleLoop}
          className={`p-1.5 rounded-full transition active:scale-95 ${
            isLoop ? 'text-amber-400 bg-amber-400/10' : 'text-white/50 hover:text-white hover:bg-white/10'
          }`}
          title="Repeat Track"
        >
          <Repeat className="w-3.5 h-3.5" />
        </button>

        {/* Volume Slider Group */}
        <div className="hidden lg:flex items-center gap-1 pl-1 border-l border-white/10 group">
          <button
            onClick={onToggleMute}
            className="p-1 text-white/60 hover:text-white transition"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="w-14 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-400 transition"
            title="Volume"
          />
        </div>
      </div>
    </div>
  );
};
