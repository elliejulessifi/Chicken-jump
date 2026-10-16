import React from 'react';
import { PlayerProgress, COSTUMES, WORLDS } from '../game/types.ts';
import { ChickenPreviewCanvas } from './ChickenPreviewCanvas.tsx';
import { Play, Shirt, Globe, Volume2, VolumeX, Music, Trophy, Sparkles } from 'lucide-react';
import { sound } from '../game/audio.ts';

interface HomeScreenProps {
  progress: PlayerProgress;
  onPlay: () => void;
  onOpenChickenSelect: () => void;
  onOpenWorldSelect: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  progress,
  onPlay,
  onOpenChickenSelect,
  onOpenWorldSelect,
  onToggleSound,
  onToggleMusic,
}) => {
  const selectedCostumeData = COSTUMES.find(c => c.id === progress.selectedCostume) || COSTUMES[0];
  const selectedWorldData = WORLDS.find(w => w.id === progress.selectedWorld) || WORLDS[0];

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-sky-400 via-sky-200 to-emerald-300 overflow-x-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft floating clouds */}
        <div className="absolute top-10 left-12 w-48 h-16 bg-white/70 rounded-full blur-xs" />
        <div className="absolute top-24 right-20 w-64 h-20 bg-white/60 rounded-full blur-xs" />
        <div className="absolute bottom-20 left-1/4 w-80 h-24 bg-white/40 rounded-full blur-xs" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between gap-4">
        {/* High Score Pill */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/90 shadow-sm border border-white/60 backdrop-blur-xs">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-semibold text-slate-600">Personal Best:</span>
          <span className="text-sm font-black text-slate-900 tabular-nums">{progress.bestScore} pts</span>
        </div>

        {/* Audio Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              onToggleSound();
            }}
            title={progress.soundEnabled ? 'Mute SFX' : 'Enable SFX'}
            className="w-10 h-10 rounded-xl bg-white/90 hover:bg-white text-slate-700 hover:text-slate-950 border border-white/80 shadow-xs flex items-center justify-center transition-all active:scale-95"
          >
            {progress.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onToggleMusic();
            }}
            title={progress.musicEnabled ? 'Stop Music' : 'Play Music'}
            className="w-10 h-10 rounded-xl bg-white/90 hover:bg-white text-slate-700 hover:text-slate-950 border border-white/80 shadow-xs flex items-center justify-center transition-all active:scale-95"
          >
            <Music className={`w-4 h-4 ${progress.musicEnabled ? 'text-indigo-600' : 'text-slate-400'}`} />
          </button>
        </div>
      </header>

      {/* Main Center Stage */}
      <main className="relative z-10 w-full max-w-xl mx-auto my-auto flex flex-col items-center text-center py-6">
        {/* Title Logo */}
        <div className="mb-2">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-slate-900 tracking-tight drop-shadow-sm flex items-center justify-center gap-2">
            <span>CHICKEN</span>
            <span className="text-amber-500 underline decoration-amber-400 decoration-wavy decoration-2">
              JUMP
            </span>
          </h1>
          <p className="text-sm sm:text-base font-semibold text-slate-700 mt-1">
            High-Flying Endless Runner · Fast Arcade Pace · 4 Unlockable Realms
          </p>
        </div>

        {/* Hero Mascot Preview - Click to play */}
        <div
          onClick={() => {
            sound.playClick();
            onPlay();
          }}
          title="Click to Play!"
          className="relative my-3 flex items-center justify-center cursor-pointer group active:scale-95 transition-transform"
        >
          <div className="absolute inset-0 bg-white/50 group-hover:bg-amber-300/40 rounded-full blur-2xl transform scale-125 -z-10 transition-colors" />
          <ChickenPreviewCanvas
            costume={progress.selectedCostume}
            expression="happy"
            width={210}
            height={210}
            scale={1.65}
          />
        </div>

        {/* Quick Equipped Info Strip */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/90 text-slate-800 shadow-xs border border-white/70">
            Outfit: <span className="font-bold text-indigo-700">{selectedCostumeData.name}</span>
          </span>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/90 text-slate-800 shadow-xs border border-white/70">
            World: <span className="font-bold text-emerald-700">{selectedWorldData.name}</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-md flex flex-col gap-3">
          {/* Prominent Play Button */}
          <button
            onClick={() => {
              sound.playClick();
              onPlay();
            }}
            className="w-full py-4 px-6 bg-slate-950 hover:bg-slate-900 text-white rounded-2xl font-black text-lg tracking-wide shadow-xl hover:shadow-2xl transition-all duration-200 transform active:scale-98 flex items-center justify-center gap-3 border-2 border-slate-800 cursor-pointer animate-pulse hover:animate-none"
          >
            <Play className="w-6 h-6 fill-current text-amber-400" />
            <span>PLAY NOW</span>
            <span className="text-xs font-normal text-slate-400 border border-slate-700 px-2 py-0.5 rounded-md hidden sm:inline">
              [SPACE]
            </span>
          </button>

          {/* Feature 1 & 2 Menu Options */}
          <div className="grid grid-cols-2 gap-3">
            {/* Choose Your Chicken */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenChickenSelect();
              }}
              className="py-3 px-3.5 bg-white/95 hover:bg-white text-slate-800 rounded-xl font-bold text-sm shadow-md border border-white transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shirt className="w-4 h-4 text-indigo-600" />
              <div className="text-left">
                <span className="block text-xs uppercase tracking-wider text-slate-500 font-semibold">Wardrobe</span>
                <span className="block text-slate-900 text-xs sm:text-sm font-bold">Choose Chicken</span>
              </div>
            </button>

            {/* Choose Your World */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenWorldSelect();
              }}
              className="py-3 px-3.5 bg-white/95 hover:bg-white text-slate-800 rounded-xl font-bold text-sm shadow-md border border-white transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Globe className="w-4 h-4 text-emerald-600" />
              <div className="text-left">
                <span className="block text-xs uppercase tracking-wider text-slate-500 font-semibold">Realms</span>
                <span className="block text-slate-900 text-xs sm:text-sm font-bold">Choose World</span>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* Footer Info & Instructions */}
      <footer className="relative z-10 w-full max-w-xl mx-auto text-center text-xs text-slate-700/90 font-medium">
        <p>
          Tip: Tap or press <span className="font-bold text-slate-900">SPACE</span> / <span className="font-bold text-slate-900">UP</span> to jump. Double jump in mid-air to clear wide hurdles!
        </p>
      </footer>
    </div>
  );
};
