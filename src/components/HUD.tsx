import React from 'react';
import { WorldId, WORLDS } from '../game/types.ts';
import { Volume2, VolumeX, Music, Pause, Play, Home, Sparkles, Globe, ArrowUp } from 'lucide-react';
import { sound } from '../game/audio.ts';

interface HUDProps {
  score: number;
  bestScore: number;
  worldId: WorldId;
  isPaused: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  transitionMessage: string | null;
  nearMissNotification: string | null;
  onTogglePause: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onJumpPress: () => void;
  onHomePress?: () => void;
  onOpenChickenSelect?: () => void;
  onOpenWorldSelect?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  bestScore,
  worldId,
  isPaused,
  soundEnabled,
  musicEnabled,
  transitionMessage,
  nearMissNotification,
  onTogglePause,
  onToggleSound,
  onToggleMusic,
  onJumpPress,
  onHomePress,
  onOpenChickenSelect,
  onOpenWorldSelect,
}) => {
  const currentWorld = WORLDS.find(w => w.id === worldId) || WORLDS[0];

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-3 sm:p-5">
      {/* Top Bar HUD */}
      <div className="flex items-start justify-between w-full">
        {/* Score and World Tag */}
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight tabular-nums drop-shadow-sm">
              {score}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-600 tabular-nums">
              / Best: {bestScore}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onOpenWorldSelect?.();
              }}
              title="Change World"
              className="pointer-events-auto text-xs font-bold px-2.5 py-1 rounded-md bg-white/95 hover:bg-white text-slate-800 shadow-xs border border-slate-200/80 backdrop-blur-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: currentWorld.themeColor }}
              />
              <span>{currentWorld.name}</span>
              <Globe className="w-3 h-3 text-slate-500" />
            </button>

            {/* Near-miss close call flash badge */}
            {nearMissNotification && (
              <span className="text-xs font-black px-2.5 py-1 rounded-md bg-amber-400 text-amber-950 shadow-md animate-bounce">
                {nearMissNotification}
              </span>
            )}
          </div>
        </div>

        {/* Top-Right Control Buttons (Interactive) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Wardrobe / Costume Modal Button */}
          {onOpenChickenSelect && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenChickenSelect();
              }}
              title="Outfits & Costumes"
              className="w-10 h-10 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-indigo-600 border border-slate-200/80 shadow-xs flex items-center justify-center transition-all active:scale-95 backdrop-blur-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-500" />
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleSound();
            }}
            title={soundEnabled ? 'Mute SFX' : 'Enable SFX'}
            className="w-10 h-10 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-slate-950 border border-slate-200/80 shadow-xs flex items-center justify-center transition-all active:scale-95 backdrop-blur-xs cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Music Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleMusic();
            }}
            title={musicEnabled ? 'Stop Music' : 'Play Music'}
            className="w-10 h-10 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-slate-950 border border-slate-200/80 shadow-xs flex items-center justify-center transition-all active:scale-95 backdrop-blur-xs cursor-pointer"
          >
            <Music className={`w-4 h-4 ${musicEnabled ? 'text-indigo-600' : 'text-slate-400'}`} />
          </button>

          {/* Pause Button */}
          <button
            onClick={() => {
              sound.playClick();
              onTogglePause();
            }}
            title={isPaused ? 'Resume Game' : 'Pause Game'}
            className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-md flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          >
            {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
          </button>

          {/* Home Button */}
          {onHomePress && (
            <button
              onClick={() => {
                sound.playClick();
                onHomePress();
              }}
              title="Home Menu"
              className="w-10 h-10 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-slate-950 border border-slate-200/80 shadow-xs flex items-center justify-center transition-all active:scale-95 backdrop-blur-xs cursor-pointer"
            >
              <Home className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Center Milestone Banner */}
      {transitionMessage && (
        <div className="self-center my-auto pointer-events-none">
          <div className="px-6 py-4 bg-slate-950/90 text-white rounded-2xl border-2 border-amber-400 shadow-2xl backdrop-blur-md text-center transform animate-in fade-in zoom-in-95 duration-200">
            <p className="text-xs uppercase tracking-widest font-black text-amber-300">
              Milestone Reached!
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5 tracking-tight">
              {transitionMessage}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Environment & obstacles upgraded smoothly!
            </p>
          </div>
        </div>
      )}

      {/* Bottom Area: Controls & Tips */}
      {/* Bottom Area: Controls & Tips */}
      <div className="flex items-center justify-between w-full">
        {/* Desktop Controls Hint */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-slate-200/80 shadow-xs">
          <span>Jump:</span>
          <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-800 font-mono text-[11px]">SPACE</kbd>
          <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-800 font-mono text-[11px]">UP</kbd>
          <span className="mx-1">·</span>
          <span>Tap anywhere to jump high · Double-tap in air for super double jump!</span>
        </div>

        {/* Mobile On-Screen Jump Button (Single clean button) */}
        <div className="sm:hidden pointer-events-auto ml-auto">
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onJumpPress();
            }}
            className="w-20 h-20 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-2xl border-3 border-white/80 flex flex-col items-center justify-center active:scale-95 transition-transform cursor-pointer"
          >
            <ArrowUp className="w-7 h-7 stroke-[3]" />
            <span>JUMP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
