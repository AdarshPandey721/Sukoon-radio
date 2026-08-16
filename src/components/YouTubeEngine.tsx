import React, { useEffect, useRef } from 'react';
import { Track } from '../types';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubeEngineProps {
  currentTrack: Track;
  playlistId?: string;
  trackIndex?: number;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  onStateChange: (isPlaying: boolean, isBuffering: boolean) => void;
  onProgress: (currentTime: number, duration: number) => void;
  onTrackEnd: () => void;
  onError: (errorCode: number) => void;
  onVideoDataUpdate?: (data: { title: string; author: string; video_id: string }) => void;
  playerRef: React.MutableRefObject<any>;
  seekRequest: { time: number; timestamp: number } | null;
  isVisible: boolean;
  onCloseVisible: () => void;
}

export const YouTubeEngine: React.FC<YouTubeEngineProps> = ({
  currentTrack,
  isPlaying,
  volume,
  isMuted,
  onStateChange,
  onProgress,
  onTrackEnd,
  onError,
  onVideoDataUpdate,
  playerRef,
  seekRequest,
  isVisible,
  onCloseVisible,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isApiLoadedRef = useRef<boolean>(false);
  const isReadyRef = useRef<boolean>(false);
  const progressIntervalRef = useRef<any>(null);
  const activeVideoIdRef = useRef<string>('');
  const lastErrorTimeRef = useRef<number>(0);

  // Load YouTube IFrame API script once
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      isApiLoadedRef.current = true;
      initPlayer();
      return;
    }

    // Check if script tag already exists
    if (!document.getElementById('yt-iframe-api-script')) {
      const tag = document.createElement('script');
      tag.id = 'yt-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const previousOnReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (previousOnReady) previousOnReady();
      isApiLoadedRef.current = true;
      initPlayer();
    };
  }, []);

  const getOrigin = () => {
    try {
      return window.location.origin || 'http://localhost:3000';
    } catch {
      return 'http://localhost:3000';
    }
  };

  const initPlayer = () => {
    if (!containerRef.current || !window.YT || playerRef.current) return;

    try {
      activeVideoIdRef.current = currentTrack.videoId;

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: currentTrack.videoId,
        host: 'https://www.youtube.com',
        playerVars: {
          autoplay: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          fs: 1,
          playsinline: 1,
          enablejsapi: 1,
          origin: getOrigin(),
        },
        events: {
          onReady: (event: any) => {
            isReadyRef.current = true;
            try {
              event.target.setVolume(isMuted ? 0 : volume);
              if (isPlaying) {
                event.target.playVideo();
              }
            } catch (e) {
              console.warn('YouTube onReady setup error:', e);
            }
          },
          onStateChange: (event: any) => {
            const state = event.data;
            // -1 unstarted, 0 ENDED, 1 PLAYING, 2 PAUSED, 3 BUFFERING, 5 CUED
            if (state === 1) {
              onStateChange(true, false);
              try {
                if (typeof event.target.getVideoData === 'function') {
                  const data = event.target.getVideoData();
                  if (data && data.title && onVideoDataUpdate) {
                    onVideoDataUpdate(data);
                  }
                }
              } catch (e) {
                // ignore
              }
            } else if (state === 2) {
              onStateChange(false, false);
            } else if (state === 3) {
              onStateChange(true, true);
            } else if (state === 0) {
              onTrackEnd();
            }
          },
          onError: (event: any) => {
            const errCode = event.data;
            console.log(`YouTube player notice (code ${errCode}) on track ${activeVideoIdRef.current} - auto skipping`);
            onError(errCode);
          },
        },
      });
    } catch (err) {
      console.error('Error initializing YouTube player:', err);
    }
  };

  // Handle track or video changes
  useEffect(() => {
    if (!isReadyRef.current || !playerRef.current) return;

    if (currentTrack.videoId && activeVideoIdRef.current !== currentTrack.videoId) {
      activeVideoIdRef.current = currentTrack.videoId;
      try {
        if (typeof playerRef.current.loadVideoById === 'function') {
          playerRef.current.loadVideoById({
            videoId: currentTrack.videoId,
            startSeconds: 0,
          });
          if (isPlaying && typeof playerRef.current.playVideo === 'function') {
            playerRef.current.playVideo();
          }
        }
      } catch (e) {
        console.error('Error loading video by ID:', e);
      }
    }
  }, [currentTrack.videoId, isPlaying]);

  // Handle Play/Pause
  useEffect(() => {
    if (!isReadyRef.current || !playerRef.current) return;

    try {
      if (isPlaying) {
        if (typeof playerRef.current.playVideo === 'function') {
          playerRef.current.playVideo();
        }
      } else {
        if (typeof playerRef.current.pauseVideo === 'function') {
          playerRef.current.pauseVideo();
        }
      }
    } catch (e) {
      console.error('Playback trigger error:', e);
    }
  }, [isPlaying]);

  // Handle Volume & Mute
  useEffect(() => {
    if (!isReadyRef.current || !playerRef.current) return;

    try {
      if (isMuted) {
        playerRef.current.setVolume(0);
      } else {
        playerRef.current.setVolume(volume);
      }
    } catch (e) {
      console.error('Volume adjustment error:', e);
    }
  }, [volume, isMuted]);

  // Handle Seek requests
  useEffect(() => {
    if (!seekRequest || !isReadyRef.current || !playerRef.current) return;
    try {
      if (typeof playerRef.current.seekTo === 'function') {
        playerRef.current.seekTo(seekRequest.time, true);
      }
    } catch (e) {
      console.error('Seek error:', e);
    }
  }, [seekRequest]);

  // Ticking progress update
  useEffect(() => {
    progressIntervalRef.current = setInterval(() => {
      if (playerRef.current && isReadyRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const currentTime = playerRef.current.getCurrentTime() || 0;
          const duration = playerRef.current.getDuration() || currentTrack.duration || 0;
          onProgress(currentTime, duration);
        } catch (e) {
          // ignore
        }
      }
    }, 400);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentTrack.duration, onProgress]);

  return (
    <div
      className={`fixed z-40 transition-all duration-300 ${
        isVisible
          ? 'bottom-20 sm:bottom-24 right-3 sm:right-6 w-[calc(100vw-24px)] max-w-xs sm:max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black/95 p-2 block'
          : 'top-[-9999px] left-[-9999px] w-[320px] h-[180px] opacity-1 pointer-events-auto'
      }`}
    >
      {isVisible && (
        <div className="flex items-center justify-between px-2 py-1 mb-1.5 text-xs text-white/80">
          <span className="font-medium truncate max-w-[200px]">{currentTrack.title}</span>
          <button
            onClick={onCloseVisible}
            className="text-white/60 hover:text-white px-1.5 py-0.5 rounded bg-white/10 text-[10px] cursor-pointer hover:bg-white/20 transition"
          >
            Hide Video
          </button>
        </div>
      )}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-inner">
        <div ref={containerRef} className="w-full h-full" id="yt-player-frame" />
      </div>
    </div>
  );
};
