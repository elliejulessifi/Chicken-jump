import React, { useState } from 'react';
import { WorldId, WORLDS, PlayerProgress } from '../game/types.ts';
import { sound } from '../game/audio.ts';
import { Lock, Check, ChevronLeft, Sparkles, Rocket, TreePine, Sun, Candy, Compass } from 'lucide-react';

interface WorldSelectModalProps {
  progress: PlayerProgress;
  onSelectWorld: (worldId: WorldId) => void;
  onBack: () => void;
}

export const WorldSelectModal: React.FC<WorldSelectModalProps> = ({
  progress,
  onSelectWorld,
  onBack,
}) => {
  const [previewWorldId, setPreviewWorldId] = useState<WorldId>(progress.selectedWorld);

  const previewWorld = WORLDS.find(w => w.id === previewWorldId) || WORLDS[0];
  const isUnlocked = progress.unlockedWorlds.includes(previewWorldId);
  const isSelected = progress.selectedWorld === previewWorldId;

  const handleSelect = (id: WorldId) => {
    sound.playClick();
    setPreviewWorldId(id);
    if (progress.unlockedWorlds.includes(id)) {
      onSelectWorld(id);
    }
  };

  const getWorldIcon = (id: WorldId) => {
    switch (id) {
      case 'farm':
        return Sun;
      case 'forest':
        return TreePine;
      case 'candy':
        return Candy;
      case 'space':
        return Rocket;
      default:
        return Compass;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:text-slate-950 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Menu</span>
          </button>

          <div className="text-center">
            <h2 className="text-lg font-bold text-slate-900">Choose Your World</h2>
            <p className="text-xs text-slate-500">
              Unlocked: {progress.unlockedWorlds.length} / {WORLDS.length} Realms
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 tabular-nums">
            Best: {progress.bestScore} pts
          </div>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 overflow-y-auto flex-1">
          {/* Left Column: Spotlight details of selected world */}
          <div className="md:col-span-5 flex flex-col justify-between p-5 bg-gradient-to-b from-slate-50 to-slate-100/60 rounded-xl border border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {previewWorld.subtitle}
                </span>
                {previewWorld.unlockScore === 0 ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    Starter
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                    {previewWorld.unlockScore} pts
                  </span>
                )}
              </div>

              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {previewWorld.name}
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {previewWorld.description}
              </p>

              {/* Thematic Obstacles showcase */}
              <div className="mt-4 pt-3 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                  World Obstacles
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {previewWorld.obstacleNames.map((name, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-medium bg-white text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 shadow-xs"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended Outfit Tag if Cosmic Space */}
              {previewWorld.recommendedCostume && (
                <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-indigo-950">Outfit Recommendation</p>
                    <p className="text-indigo-700 mt-0.5">
                      The <span className="font-semibold">Space Chicken</span> costume looks magnificent in this realm!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Select/Locked Action */}
            <div className="mt-6">
              {isSelected ? (
                <div className="w-full py-2.5 px-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg font-bold text-sm text-center flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Currently Selected Starting World</span>
                </div>
              ) : isUnlocked ? (
                <button
                  onClick={() => {
                    sound.playClick();
                    onSelectWorld(previewWorldId);
                  }}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-sm transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
                >
                  <span>Select World</span>
                </button>
              ) : (
                <div className="w-full py-2.5 px-4 bg-slate-100 border border-slate-200 text-slate-500 rounded-lg font-semibold text-sm text-center flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>Locked — Score {previewWorld.unlockScore} pts to unlock</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: World Cards Grid */}
          <div className="md:col-span-7 flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              All 4 Realms
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {WORLDS.map((w) => {
                const wUnlocked = progress.unlockedWorlds.includes(w.id);
                const wSelected = progress.selectedWorld === w.id;
                const isPreviewed = previewWorldId === w.id;
                const Icon = getWorldIcon(w.id);

                const progressPct = w.unlockScore > 0
                  ? Math.min(100, Math.round((progress.bestScore / w.unlockScore) * 100))
                  : 100;

                return (
                  <div
                    key={w.id}
                    onClick={() => handleSelect(w.id)}
                    className={`relative p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isPreviewed
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/30 shadow-md'
                        : wUnlocked
                        ? 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70 shadow-xs'
                        : 'border-slate-200 bg-slate-50/60 opacity-80'
                    }`}
                  >
                    {/* Header with Icon and Lock/Check */}
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-xs"
                        style={{
                          background: `linear-gradient(135deg, ${w.skyGradient[0]}, ${w.skyGradient[1]})`
                        }}
                      >
                        <Icon className="w-5 h-5 drop-shadow-xs" />
                      </div>

                      {wSelected ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : wUnlocked ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          Ready
                        </span>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-slate-900">
                        {w.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {w.subtitle}
                      </p>
                    </div>

                    {/* Unlock Status / Progress */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      {wUnlocked ? (
                        <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Unlocked & Playable</span>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                            <span>Requires {w.unlockScore} pts</span>
                            <span className="font-bold tabular-nums">
                              {progress.bestScore} / {w.unlockScore}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
