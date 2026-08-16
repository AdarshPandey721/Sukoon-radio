import React, { useState } from 'react';
import { Download, X } from 'lucide-react';

interface BannersProps {
  onInstall: () => void;
}

export const Banners: React.FC<BannersProps> = ({ onInstall }) => {
  const [showInstall, setShowInstall] = useState(false);

  if (!showInstall) return null;

  return (
    <div className="w-full max-w-md mx-auto px-4 flex flex-col gap-2.5 z-10 transition-all">
      {showInstall && (
        <div className="relative flex items-center justify-between gap-3 p-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-600 to-amber-900 border border-amber-400/40 flex items-center justify-center text-amber-100 font-serif font-bold text-sm shrink-0 shadow-inner">
              स
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-semibold text-white truncate">
                Install Sukoon Radio
              </h4>
              <p className="text-[11px] text-white/70 truncate">
                Listen offline & in full-screen
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onInstall}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-xs transition active:scale-95 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              onClick={() => setShowInstall(false)}
              className="p-1 text-white/50 hover:text-white transition"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
