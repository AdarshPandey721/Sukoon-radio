import React from 'react';
import { X, Disc, Play, Music, Sparkles, Sun, Sunset } from 'lucide-react';
import { Playlist, ThemeMode } from '../types';

interface PlaylistsModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlists: Playlist[];
  currentPlaylistId: string;
  currentTheme: ThemeMode;
  onToggleTheme: () => void;
  onSelectPlaylist: (playlist: Playlist) => void;
}

export const PlaylistsModal: React.FC<PlaylistsModalProps> = ({
  isOpen,
  onClose,
  playlists,
  currentPlaylistId,
  currentTheme,
  onToggleTheme,
  onSelectPlaylist,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl p-4 sm:p-6 border border-white/15 bg-gradient-to-b from-zinc-900/95 via-black/95 to-zinc-950/98 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Disc className="w-5 h-5 text-amber-400 animate-spin-slow" />
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Curated Playlists</h3>
              <p className="text-xs text-white/60">
                Active Theme:{' '}
                <span className="font-semibold text-amber-300">
                  {currentTheme === 'sukoon' ? 'सुकून (2000s Nostalgia)' : 'पुराने दिन (Vintage Classics)'}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Theme Switcher Banner inside Modal */}
        <div className="mt-4 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-white/80">
            {currentTheme === 'sukoon' ? (
              <>
                <Sun className="w-4 h-4 text-emerald-400" />
                <span>Theme: <b>सुकून</b> (Meadow & 2000s Hits)</span>
              </>
            ) : (
              <>
                <Sunset className="w-4 h-4 text-amber-400" />
                <span>Theme: <b>पुराने दिन</b> (Pahadi Chai & Classics)</span>
              </>
            )}
          </div>
          <button
            onClick={onToggleTheme}
            className="px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-medium transition active:scale-95"
          >
            Switch Theme
          </button>
        </div>

        {/* Playlists List */}
        <div className="mt-4 flex flex-col gap-3 max-h-[55vh] overflow-y-auto pr-1">
          {playlists.map((playlist) => {
            const isSelected = playlist.id === currentPlaylistId;
            return (
              <div
                key={playlist.id}
                onClick={() => {
                  onSelectPlaylist(playlist);
                  onClose();
                }}
                className={`group relative flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105 ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                        : 'bg-white/10 border-white/10 text-white/70'
                    }`}
                  >
                    <Music className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-white group-hover:text-amber-200 transition truncate">
                      {playlist.name}
                    </h4>
                    <p className="text-xs text-amber-300/80 font-hindi truncate mt-0.5">
                      {playlist.hindiName}
                    </p>
                    <p className="text-[11px] text-white/50 truncate mt-0.5">
                      {playlist.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pl-3 shrink-0">
                  <span className="text-[11px] font-mono text-white/40">
                    {playlist.tracks.length} songs
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                        : 'bg-white/10 text-white/60 group-hover:bg-white/20 group-hover:text-white'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
