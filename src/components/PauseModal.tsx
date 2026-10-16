import React from 'react';
import { Play, RotateCcw, Home, Shirt, Globe } from 'lucide-react';
import { sound } from '../game/audio.ts';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  onOpenChickenSelect: () => void;
  onOpenWorldSelect: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onHome,
  onOpenChickenSelect,
  onOpenWorldSelect,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 text-center animate-in fade-in zoom-in-95 duration-150">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Game Paused</h2>
        <p className="text-xs text-slate-500 mt-1">Take a breath, chicken runner!</p>

        <div className="mt-6 flex flex-col gap-2.5">
          {/* Resume */}
          <button
            onClick={() => {
              sound.playClick();
              onResume();
            }}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume Run</span>
          </button>

          {/* Restart */}
          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold text-sm transition-all border border-slate-200 active:scale-98 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart World</span>
          </button>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={() => {
                sound.playClick();
                onOpenChickenSelect();
              }}
              className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs border border-slate-200 transition-all flex items-center justify-center gap-1.5"
            >
              <Shirt className="w-3.5 h-3.5" />
              <span>Costumes</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenWorldSelect();
              }}
              className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs border border-slate-200 transition-all flex items-center justify-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Worlds</span>
            </button>
          </div>

          {/* Home */}
          <button
            onClick={() => {
              sound.playClick();
              onHome();
            }}
            className="mt-1 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Back to Title Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
