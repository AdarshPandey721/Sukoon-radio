import React, { useState } from 'react';
import { X, Search, Play, Music, Sparkles, Disc } from 'lucide-react';
import { Track } from '../types';

interface SongsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tracks: Track[];
  currentTrackId: string;
  isPlaying: boolean;
  onSelectTrack: (track: Track) => void;
  playlistName: string;
}

const formatDuration = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export const SongsModal: React.FC<SongsModalProps> = ({
  isOpen,
  onClose,
  tracks,
  currentTrackId,
  isPlaying,
  onSelectTrack,
  playlistName,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredTracks = tracks.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      (t.film && t.film.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl p-4 sm:p-6 border border-white/15 bg-gradient-to-b from-zinc-900/95 via-black/95 to-zinc-950/98 shadow-2xl text-white flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Tracklist</span>
              <span className="text-xs font-normal text-amber-300/80 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">
                {playlistName}
              </span>
            </h3>
            <p className="text-xs text-white/60 mt-0.5">
              {tracks.length} songs available
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mt-4 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search by song, singer, or film..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 focus:border-amber-400/60 focus:bg-white/10 text-sm text-white placeholder-white/40 outline-none transition"
          />
        </div>

        {/* Songs List */}
        <div className="mt-4 flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
          {filteredTracks.length === 0 ? (
            <div className="py-12 text-center text-white/50 text-sm">
              No matching tracks found for "{searchQuery}"
            </div>
          ) : (
            filteredTracks.map((track, idx) => {
              const isCurrent = track.id === currentTrackId;
              return (
                <div
                  key={track.id}
                  onClick={() => {
                    onSelectTrack(track);
                    onClose();
                  }}
                  className={`group flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-amber-500/15 border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                      : 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-zinc-800 shrink-0 flex items-center justify-center">
                      <img
                        src={`https://img.youtube.com/vi/${track.videoId}/mqdefault.jpg`}
                        alt={track.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80';
                        }}
                      />
                      {isCurrent ? (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-0.5">
                          <span className="w-1 bg-amber-400 rounded-full animate-[bounce_0.8s_infinite] h-3.5" />
                          <span className="w-1 bg-amber-400 rounded-full animate-[bounce_1.1s_infinite] h-5" />
                          <span className="w-1 bg-amber-400 rounded-full animate-[bounce_0.9s_infinite] h-3" />
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className={`text-sm font-semibold truncate ${isCurrent ? 'text-amber-300' : 'text-white'}`}>
                        {track.title}
                      </h4>
                      <p className="text-xs text-white/60 truncate mt-0.5">
                        {track.artist}
                        {track.film && ` • ${track.film}`}
                        {track.year && ` (${track.year})`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-xs font-mono text-white/50 pl-2">
                    {track.category && (
                      <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-white/60">
                        {track.category}
                      </span>
                    )}
                    <span>{formatDuration(track.duration)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
