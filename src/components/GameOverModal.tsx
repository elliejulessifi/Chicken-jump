import React from 'react';
import { CostumeId, WorldId, PlayerProgress, COSTUMES, WORLDS } from '../game/types.ts';
import { ChickenPreviewCanvas } from './ChickenPreviewCanvas.tsx';
import { RotateCcw, Home, Shirt, Globe, Trophy, Sparkles } from 'lucide-react';
import { sound } from '../game/audio.ts';

interface GameOverModalProps {
  score: number;
  bestScore: number;
  isNewBest: boolean;
  costume: CostumeId;
  worldId: WorldId;
  progress: PlayerProgress;
  newUnlockedCostumes: CostumeId[];
  newUnlockedWorlds: WorldId[];
  onRestart: () => void;
  onHome: () => void;
  onOpenChickenSelect: () => void;
  onOpenWorldSelect: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  bestScore,
  isNewBest,
  costume,
  worldId,
  progress,
  newUnlockedCostumes,
  newUnlockedWorlds,
  onRestart,
  onHome,
  onOpenChickenSelect,
  onOpenWorldSelect,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Banner with dizzy chicken mascot */}
        <div className="bg-gradient-to-b from-slate-100 to-slate-200/60 p-6 flex flex-col items-center justify-center relative border-b border-slate-200">
          <div className="relative">
            <ChickenPreviewCanvas
              costume={costume}
              expression="dizzy"
              width={140}
              height={140}
              scale={1.3}
            />
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            {isNewBest ? 'New High Score!' : 'Ouch! Game Over'}
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            {isNewBest
              ? 'Incredible run! You set a personal best record!'
              : 'Our brave chicken got dizzy! Ready for another leap?'}
          </p>
        </div>

        {/* Score & Rewards Box */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                Final Score
              </span>
              <p className="text-2xl font-black text-slate-900 tabular-nums mt-0.5">
                {score}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center justify-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Best Record</span>
              </span>
              <p className="text-2xl font-black text-slate-900 tabular-nums mt-0.5">
                {bestScore}
              </p>
            </div>
          </div>

          {/* New Unlocks Celebration Notice */}
          {(newUnlockedCostumes.length > 0 || newUnlockedWorlds.length > 0) && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 flex items-start gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold">New Discoveries Unlocked!</p>
                {newUnlockedCostumes.map(cid => {
                  const c = COSTUMES.find(item => item.id === cid);
                  return (
                    <p key={cid} className="text-amber-800 mt-0.5">
                      • Unlocked Costume: <span className="font-semibold">{c?.name}</span>
                    </p>
                  );
                })}
                {newUnlockedWorlds.map(wid => {
                  const w = WORLDS.find(item => item.id === wid);
                  return (
                    <p key={wid} className="text-amber-800 mt-0.5">
                      • Unlocked Realm: <span className="font-semibold">{w?.name}</span>
                    </p>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-5 flex flex-col gap-2.5">
            <button
              onClick={() => {
                sound.playClick();
                onRestart();
              }}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenChickenSelect();
                }}
                className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs border border-slate-200 transition-all flex items-center justify-center gap-1.5"
              >
                <Shirt className="w-3.5 h-3.5" />
                <span>Change Costume</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onOpenWorldSelect();
                }}
                className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs border border-slate-200 transition-all flex items-center justify-center gap-1.5"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Change World</span>
              </button>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onHome();
              }}
              className="mt-1 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Main Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
