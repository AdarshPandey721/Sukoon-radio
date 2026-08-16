import React, { useState, useRef, useCallback, useEffect } from 'react';
import { THEMES, SUKOON_THEME_PLAYLISTS, PURANE_DIN_THEME_PLAYLISTS, deduplicateTracks } from './data/musicData';
import { Playlist, Track, ThemeMode } from './types';
import { Header } from './components/Header';
import { HeroBranding } from './components/HeroBranding';
import { Banners } from './components/Banners';
import { DesktopPlayer } from './components/DesktopPlayer';
import { MobilePlayer } from './components/MobilePlayer';
import { YouTubeEngine } from './components/YouTubeEngine';
import { PlaylistsModal } from './components/PlaylistsModal';
import { SongsModal } from './components/SongsModal';
import { InstallModal } from './components/InstallModal';

// Inline SVG grain texture as data URI for vintage film grain overlay
const GRAIN_SVG_DATA_URI = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E`;

// Fisher-Yates shuffle helper ensuring all unplayed songs are queued without immediate duplicates
const createShuffleQueue = (total: number, currentIdx: number): number[] => {
  if (total <= 1) return [0];
  const indices: number[] = [];
  for (let i = 0; i < total; i++) {
    if (i !== currentIdx) indices.push(i);
  }
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return [currentIdx, ...indices];
};

export default function App() {
  // Theme state ('sukoon' or 'purane-din')
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('radio_theme_mode');
      if (saved === 'purane-din' || saved === 'sukoon') return saved;
    } catch {
      // ignore
    }
    return 'sukoon';
  });

  const activePlaylists = currentTheme === 'sukoon' ? SUKOON_THEME_PLAYLISTS : PURANE_DIN_THEME_PLAYLISTS;

  // Playlists and Track state with automatic track deduplication
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist>(() => ({
    ...activePlaylists[0],
    tracks: deduplicateTracks(activePlaylists[0].tracks),
  }));
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isLoop, setIsLoop] = useState<boolean>(false);

  // Shuffle queue & pointer state
  const [shuffleQueue, setShuffleQueue] = useState<number[]>([]);
  const [shufflePointer, setShufflePointer] = useState<number>(0);

  // Modals & popups
  const [isPlaylistsOpen, setIsPlaylistsOpen] = useState<boolean>(false);
  const [isSongsOpen, setIsSongsOpen] = useState<boolean>(false);
  const [isInstallOpen, setIsInstallOpen] = useState<boolean>(false);
  const [isVideoOpen, setIsVideoOpen] = useState<boolean>(false);

  // Error toast notice
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Seeking communication
  const [seekRequest, setSeekRequest] = useState<{ time: number; timestamp: number } | null>(null);
  const ytPlayerRef = useRef<any>(null);

  const currentTrack = currentPlaylist.tracks[currentTrackIndex] || currentPlaylist.tracks[0];

  // Theme toggle function
  const handleToggleTheme = useCallback(() => {
    setCurrentTheme((prevTheme) => {
      const nextTheme: ThemeMode = prevTheme === 'sukoon' ? 'purane-din' : 'sukoon';
      try {
        localStorage.setItem('radio_theme_mode', nextTheme);
      } catch {
        // ignore
      }
      const nextPlaylists = nextTheme === 'sukoon' ? SUKOON_THEME_PLAYLISTS : PURANE_DIN_THEME_PLAYLISTS;
      const cleanTracks = deduplicateTracks(nextPlaylists[0].tracks);
      setCurrentPlaylist({
        ...nextPlaylists[0],
        tracks: cleanTracks,
      });
      setCurrentTrackIndex(0);
      setCurrentTime(0);
      if (isShuffle) {
        setShuffleQueue(createShuffleQueue(cleanTracks.length, 0));
        setShufflePointer(0);
      }
      return nextTheme;
    });
  }, [isShuffle]);

  // Handle Shuffle Toggle
  const handleToggleShuffle = useCallback(() => {
    setIsShuffle((prev) => {
      const nextVal = !prev;
      if (nextVal) {
        const queue = createShuffleQueue(currentPlaylist.tracks.length, currentTrackIndex);
        setShuffleQueue(queue);
        setShufflePointer(0);
      }
      return nextVal;
    });
  }, [currentPlaylist.tracks.length, currentTrackIndex]);

  // Handle Play/Pause toggle
  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // Handle Next Track with smart shuffle queue and automatic duplicate skipping
  const handleNext = useCallback(() => {
    const tracks = currentPlaylist.tracks;
    if (!tracks || tracks.length === 0) return;
    if (tracks.length === 1) {
      setSeekRequest({ time: 0, timestamp: Date.now() });
      setCurrentTime(0);
      setIsPlaying(true);
      return;
    }

    const currentT = tracks[currentTrackIndex];

    if (isShuffle) {
      let queue = shuffleQueue;
      let nextPointer = shufflePointer + 1;

      // If queue is exhausted or mismatched with current tracklist, generate a fresh cycle
      if (queue.length !== tracks.length || nextPointer >= queue.length) {
        const freshQueue = createShuffleQueue(tracks.length, currentTrackIndex);
        if (freshQueue.length > 1) {
          const nextIdx = freshQueue[1];
          freshQueue.splice(1, 1);
          freshQueue.unshift(nextIdx);
        }
        queue = freshQueue;
        nextPointer = 0;
      }

      // Check for same song / duplicates (matching videoId or normalized title)
      let candidateIndex = queue[nextPointer];
      let candidateTrack = tracks[candidateIndex];

      while (
        candidateTrack &&
        currentT &&
        (candidateTrack.videoId === currentT.videoId ||
          candidateTrack.title.toLowerCase().trim() === currentT.title.toLowerCase().trim()) &&
        nextPointer + 1 < queue.length
      ) {
        nextPointer++;
        candidateIndex = queue[nextPointer];
        candidateTrack = tracks[candidateIndex];
      }

      setShuffleQueue(queue);
      setShufflePointer(nextPointer);
      setCurrentTrackIndex(candidateIndex);
    } else {
      let nextIdx = (currentTrackIndex + 1) % tracks.length;
      let nextTrack = tracks[nextIdx];

      // Skip duplicate songs if identical exists next in the playlist
      while (
        nextTrack &&
        currentT &&
        (nextTrack.videoId === currentT.videoId ||
          nextTrack.title.toLowerCase().trim() === currentT.title.toLowerCase().trim()) &&
        tracks.length > 1
      ) {
        nextIdx = (nextIdx + 1) % tracks.length;
        nextTrack = tracks[nextIdx];
      }

      setCurrentTrackIndex(nextIdx);
    }

    setCurrentTime(0);
    setIsPlaying(true);
  }, [currentPlaylist.tracks, currentTrackIndex, isShuffle, shuffleQueue, shufflePointer]);

  // Handle Previous Track
  const handlePrev = useCallback(() => {
    const tracks = currentPlaylist.tracks;
    if (!tracks || tracks.length === 0) return;

    if (currentTime > 4) {
      // If played more than 4s, restart current track
      setSeekRequest({ time: 0, timestamp: Date.now() });
      setCurrentTime(0);
      setIsPlaying(true);
      return;
    }

    if (isShuffle && shufflePointer > 0 && shuffleQueue.length === tracks.length) {
      const prevPointer = shufflePointer - 1;
      setShufflePointer(prevPointer);
      setCurrentTrackIndex(shuffleQueue[prevPointer]);
    } else {
      let prevIdx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
      const currentT = tracks[currentTrackIndex];
      let prevTrack = tracks[prevIdx];

      // Skip duplicate songs
      while (
        prevTrack &&
        currentT &&
        (prevTrack.videoId === currentT.videoId ||
          prevTrack.title.toLowerCase().trim() === currentT.title.toLowerCase().trim()) &&
        tracks.length > 1
      ) {
        prevIdx = (prevIdx - 1 + tracks.length) % tracks.length;
        prevTrack = tracks[prevIdx];
      }

      setCurrentTrackIndex(prevIdx);
    }

    setCurrentTime(0);
    setIsPlaying(true);
  }, [currentTime, isShuffle, shufflePointer, shuffleQueue, currentPlaylist.tracks, currentTrackIndex]);

  // Handle Seek from Slider
  const handleSeek = useCallback((newTime: number) => {
    setCurrentTime(newTime);
    setSeekRequest({ time: newTime, timestamp: Date.now() });
  }, []);

  // Handle Track Completion
  const handleTrackEnd = useCallback(() => {
    if (isLoop) {
      setSeekRequest({ time: 0, timestamp: Date.now() });
      setCurrentTime(0);
      setIsPlaying(true);
    } else {
      handleNext();
    }
  }, [isLoop, handleNext]);

  // Handle YouTube Error (automatically skips to next track gracefully)
  const handlePlaybackError = useCallback(
    (errorCode: number) => {
      console.log(`Auto-advancing past restricted track (code ${errorCode})`);
      handleNext();
    },
    [handleNext]
  );

  // Handle Song selection from modal
  const handleSelectTrack = useCallback(
    (track: Track) => {
      const tracks = currentPlaylist.tracks;
      const index = tracks.findIndex((t) => t.id === track.id || t.videoId === track.videoId);
      if (index !== -1) {
        setCurrentTrackIndex(index);
        if (isShuffle) {
          const queue = createShuffleQueue(tracks.length, index);
          setShuffleQueue(queue);
          setShufflePointer(0);
        }
      } else {
        const updatedTracks = deduplicateTracks([...tracks, track]);
        const newIndex = updatedTracks.findIndex((t) => t.id === track.id || t.videoId === track.videoId);
        setCurrentPlaylist((prev) => ({
          ...prev,
          tracks: updatedTracks,
        }));
        const targetIndex = newIndex !== -1 ? newIndex : 0;
        setCurrentTrackIndex(targetIndex);
        if (isShuffle) {
          const queue = createShuffleQueue(updatedTracks.length, targetIndex);
          setShuffleQueue(queue);
          setShufflePointer(0);
        }
      }
      setCurrentTime(0);
      setIsPlaying(true);
      setIsSongsOpen(false);
    },
    [currentPlaylist.tracks, isShuffle]
  );

  // Handle Playlist selection
  const handleSelectPlaylist = useCallback((playlist: Playlist) => {
    const cleanTracks = deduplicateTracks(playlist.tracks);
    setCurrentPlaylist({
      ...playlist,
      tracks: cleanTracks,
    });
    setCurrentTrackIndex(0);
    setCurrentTime(0);
    setIsPlaying(true);
    if (isShuffle) {
      const queue = createShuffleQueue(cleanTracks.length, 0);
      setShuffleQueue(queue);
      setShufflePointer(0);
    }
  }, [isShuffle]);

  // Keyboard shortcut listener (Space = play/pause, Arrow keys for next/prev)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowRight' && e.shiftKey) {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft' && e.shiftKey) {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePlay, handleNext, handlePrev]);

  return (
    <main
      className="relative flex min-h-dvh flex-1 flex-col items-center justify-between overflow-hidden select-none"
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(1rem, env(safe-area-inset-left))',
        paddingRight: 'max(1rem, env(safe-area-inset-right))',
      }}
    >
      {/* 1. Fixed Background Div (-z-20) with Responsive Media Queries for exact artwork */}
      <div
        className={`fixed inset-0 -z-20 transition-all duration-1000 ${
          currentTheme === 'sukoon' ? 'hero-bg-sukoon' : 'hero-bg-purane-din'
        }`}
      >
        {/* Soft Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/85" />
      </div>

      {/* 2. Fixed Grain Overlay (-z-10) with SVG feTurbulence */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none mix-blend-overlay opacity-30"
        style={{
          backgroundImage: `url("${GRAIN_SVG_DATA_URI}")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* 3. Fixed Top Row Navigation & Status */}
      <Header
        currentTheme={currentTheme}
        onToggleTheme={handleToggleTheme}
        onOpenPlaylists={() => setIsPlaylistsOpen(true)}
        onOpenSongs={() => setIsSongsOpen(true)}
        onOpenVideo={() => setIsVideoOpen((prev) => !prev)}
        isVideoOpen={isVideoOpen}
      />

      {/* Error Toast Notification if a video has embedding issues */}
      {errorNotice && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-rose-950/90 border border-rose-500/50 text-rose-200 text-xs font-medium backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-top-2">
          {errorNotice}
        </div>
      )}

      {/* Centerpiece Content: Typography Branding & Floating Interactive Cards */}
      <div className="w-full flex-1 flex flex-col items-center justify-center max-w-xl mx-auto px-3 py-2 sm:py-6 gap-2 sm:gap-5 z-10">
        <HeroBranding
          currentTheme={currentTheme}
          onToggleTheme={handleToggleTheme}
        />
        <Banners onInstall={() => setIsInstallOpen(true)} />
      </div>

      {/* 4. Bottom Anchor Player Area & Subtle Footer */}
      <div className="w-full flex flex-col items-center gap-2 sm:gap-3 z-30 px-3 sm:px-4 pb-2">
        {/* Desktop Player Pill (hidden on mobile) */}
        <DesktopPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          isBuffering={isBuffering}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isMuted={isMuted}
          isShuffle={isShuffle}
          isLoop={isLoop}
          onTogglePlay={handleTogglePlay}
          onPrev={handlePrev}
          onNext={handleNext}
          onSeek={handleSeek}
          onVolumeChange={setVolume}
          onToggleMute={() => setIsMuted((m) => !m)}
          onToggleShuffle={handleToggleShuffle}
          onToggleLoop={() => setIsLoop((l) => !l)}
          onToggleVideo={() => setIsVideoOpen((v) => !v)}
          isVideoOpen={isVideoOpen}
        />

        {/* Mobile Mini Floating Bar Player (visible on small mobile screens) */}
        <MobilePlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          isShuffle={isShuffle}
          isLoop={isLoop}
          onTogglePlay={handleTogglePlay}
          onPrev={handlePrev}
          onNext={handleNext}
          onSeek={handleSeek}
          onToggleShuffle={handleToggleShuffle}
          onToggleLoop={() => setIsLoop((l) => !l)}
          onOpenSongs={() => setIsSongsOpen(true)}
          onOpenPlaylists={() => setIsPlaylistsOpen(true)}
          onToggleVideo={() => setIsVideoOpen((v) => !v)}
          isVideoOpen={isVideoOpen}
        />

        {/* Footer with Made with Heart by Adarsh Pandey */}
        <div className="text-[11px] sm:text-xs text-white/80 font-medium tracking-wide drop-shadow-md select-none flex items-center justify-center gap-1.5 pt-0.5">
          <span>Made with</span>
          <span className="text-rose-500 text-xs sm:text-sm animate-pulse inline-block select-none" role="img" aria-label="love">
            ❤️
          </span>
          <span>by</span>
          <a
            href="https://instagram.com/adarsh.pandey321"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-300 hover:text-amber-200 font-semibold underline underline-offset-4 decoration-amber-400/40 hover:decoration-amber-300 transition"
          >
            Adarsh Pandey
          </a>
        </div>
      </div>

      {/* Hidden/Floating YouTube Engine (Handles continuous playback & optional video modal) */}
      <YouTubeEngine
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        volume={volume}
        isMuted={isMuted}
        onStateChange={(playing, buffering) => {
          setIsPlaying(playing);
          setIsBuffering(buffering);
        }}
        onProgress={(curr, dur) => {
          setCurrentTime(curr);
          if (dur > 0) setDuration(dur);
        }}
        onTrackEnd={handleTrackEnd}
        onError={handlePlaybackError}
        playerRef={ytPlayerRef}
        seekRequest={seekRequest}
        isVisible={isVideoOpen}
        onCloseVisible={() => setIsVideoOpen(false)}
      />

      {/* Modals */}
      <PlaylistsModal
        isOpen={isPlaylistsOpen}
        onClose={() => setIsPlaylistsOpen(false)}
        playlists={activePlaylists}
        currentPlaylistId={currentPlaylist.id}
        currentTheme={currentTheme}
        onToggleTheme={handleToggleTheme}
        onSelectPlaylist={handleSelectPlaylist}
      />

      <SongsModal
        isOpen={isSongsOpen}
        onClose={() => setIsSongsOpen(false)}
        tracks={currentPlaylist.tracks}
        currentTrackId={currentTrack.id}
        isPlaying={isPlaying}
        onSelectTrack={handleSelectTrack}
        playlistName={currentPlaylist.name}
      />

      <InstallModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
      />
    </main>
  );
}
