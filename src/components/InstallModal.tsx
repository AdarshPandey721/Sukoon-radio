import React from 'react';
import { X, Share2, ArrowDownToLine } from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl p-6 border border-white/15 bg-gradient-to-b from-zinc-900/95 via-black/95 to-zinc-950/98 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-black font-bold font-serif shadow-lg">
              स
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Install Sukoon Radio</h3>
              <p className="text-xs text-amber-300/80">Full-screen 2000s nostalgic audio experience</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-5 space-y-4 text-xs text-white/80">
          {/* iOS Safari */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-amber-400 shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">iOS Safari</p>
              <p className="text-white/60 mt-0.5">
                Tap the <span className="text-amber-300 font-medium">Share</span> button in Safari, then select <span className="text-amber-300 font-medium">'Add to Home Screen'</span>.
              </p>
            </div>
          </div>

          {/* Android Chrome */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-emerald-400 shrink-0">
              <ArrowDownToLine className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">Android Chrome</p>
              <p className="text-white/60 mt-0.5">
                Tap the three dots menu <span className="text-amber-300 font-medium">(⋮)</span> and choose <span className="text-amber-300 font-medium">'Install App'</span> or 'Add to Home screen'.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs transition active:scale-98"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
