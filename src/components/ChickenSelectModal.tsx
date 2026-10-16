import React, { useState } from 'react';
import { CostumeId, ChickenExpression, COSTUMES, PlayerProgress } from '../game/types.ts';
import { ChickenPreviewCanvas } from './ChickenPreviewCanvas.tsx';
import { sound } from '../game/audio.ts';
import { Lock, Check, ChevronLeft, Sparkles, Smile, Flame, AlertCircle, RefreshCw } from 'lucide-react';

interface ChickenSelectModalProps {
  progress: PlayerProgress;
  onSelectCostume: (costumeId: CostumeId) => void;
  onBack: () => void;
}

export const ChickenSelectModal: React.FC<ChickenSelectModalProps> = ({
  progress,
  onSelectCostume,
  onBack,
}) => {
  const [activePreviewCostume, setActivePreviewCostume] = useState<CostumeId>(progress.selectedCostume);
  const [testExpression, setTestExpression] = useState<ChickenExpression>('happy');

  const selectedCostumeData = COSTUMES.find(c => c.id === activePreviewCostume) || COSTUMES[0];
  const isUnlocked = progress.unlockedCostumes.includes(activePreviewCostume);
  const isEquipped = progress.selectedCostume === activePreviewCostume;

  const handleSelect = (id: CostumeId) => {
    sound.playClick();
    setActivePreviewCostume(id);
    if (progress.unlockedCostumes.includes(id)) {
      onSelectCostume(id);
    }
  };

  const expressions: { id: ChickenExpression; label: string; icon: any }[] = [
    { id: 'happy', label: 'Happy', icon: Smile },
    { id: 'determined', label: 'Determined', icon: Flame },
    { id: 'surprised', label: 'Surprised', icon: AlertCircle },
    { id: 'dizzy', label: 'Dizzy', icon: RefreshCw },
    { id: 'celebrating', label: 'Celebration', icon: Sparkles },
  ];

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
            <h2 className="text-lg font-bold text-slate-900">Choose Your Chicken</h2>
            <p className="text-xs text-slate-500">
              Unlocked: {progress.unlockedCostumes.length} / {COSTUMES.length} Costumes
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 tabular-nums">
            Best: {progress.bestScore} pts
          </div>
        </div>

        {/* Content Body: Split layout with Left Preview & Right Costume Cards */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 overflow-y-auto flex-1">
          {/* Left Column: Big Interactive Character Spotlight */}
          <div className="md:col-span-5 flex flex-col items-center justify-between p-5 bg-gradient-to-b from-slate-50 to-slate-100/60 rounded-xl border border-slate-200">
            <div className="text-center w-full">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {selectedCostumeData.badge}
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                {selectedCostumeData.name}
              </h3>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                {selectedCostumeData.description}
              </p>
            </div>

            {/* Mascot Preview Canvas */}
            <div className="my-3 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-radial from-violet-200/40 via-transparent to-transparent rounded-full blur-xl -z-10" />
              <ChickenPreviewCanvas
                costume={activePreviewCostume}
                expression={testExpression}
                width={190}
                height={190}
                scale={1.5}
              />
            </div>

            {/* Expression Switcher Controls */}
            <div className="w-full">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                  Test Expression
                </span>
                <span className="text-[11px] font-semibold text-indigo-600 capitalize">
                  {testExpression}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1 p-1 bg-white rounded-lg border border-slate-200 shadow-xs">
                {expressions.map(expr => {
                  const Icon = expr.icon;
                  const isActive = testExpression === expr.id;
                  return (
                    <button
                      key={expr.id}
                      onClick={() => {
                        sound.playClick();
                        setTestExpression(expr.id);
                      }}
                      title={expr.label}
                      className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-md text-[10px] font-medium transition-all ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-xs scale-102'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 mb-0.5" />
                      <span className="truncate max-w-[42px]">{expr.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Equip Action Button */}
              <div className="mt-4">
                {isEquipped ? (
                  <div className="w-full py-2.5 px-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg font-bold text-sm text-center flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Currently Equipped</span>
                  </div>
                ) : isUnlocked ? (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onSelectCostume(activePreviewCostume);
                    }}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-sm transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
                  >
                    <span>Equip Costume</span>
                  </button>
                ) : (
                  <div className="w-full py-2.5 px-4 bg-slate-100 border border-slate-200 text-slate-500 rounded-lg font-semibold text-sm text-center flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span>Locked — Reach {selectedCostumeData.unlockScore} pts</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Grid of Costumes */}
          <div className="md:col-span-7 flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Wardrobe Catalog
            </span>

            <div className="space-y-2.5">
              {COSTUMES.map((item) => {
                const itemUnlocked = progress.unlockedCostumes.includes(item.id);
                const itemSelected = progress.selectedCostume === item.id;
                const isItemPreviewed = activePreviewCostume === item.id;

                const progressPct = item.unlockScore > 0
                  ? Math.min(100, Math.round((progress.bestScore / item.unlockScore) * 100))
                  : 100;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`relative p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-4 ${
                      isItemPreviewed
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/30 shadow-sm'
                        : itemUnlocked
                        ? 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70'
                        : 'border-slate-200 bg-slate-50/50 opacity-80'
                    }`}
                  >
                    {/* Small Mascot Avatar */}
                    <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0 overflow-hidden relative">
                      <ChickenPreviewCanvas
                        costume={item.id}
                        expression={itemUnlocked ? 'happy' : 'surprised'}
                        width={60}
                        height={60}
                        scale={0.9}
                      />
                      {!itemUnlocked && (
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center">
                          <Lock className="w-4 h-4 text-white drop-shadow-xs" />
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          <h4 className="text-sm font-bold text-slate-900 truncate">
                            {item.name}
                          </h4>
                          {itemSelected && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                              Equipped
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-slate-500 shrink-0">
                          {item.unlockScore === 0 ? 'Starter' : `${item.unlockScore} pts`}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {item.tagline}
                      </p>

                      {/* Progress bar for locked items */}
                      {!itemUnlocked && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                            <span>Unlock progress</span>
                            <span className="font-semibold tabular-nums">
                              {progress.bestScore} / {item.unlockScore} pts ({progressPct}%)
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

                    {/* Radio/Check state */}
                    <div className="shrink-0">
                      {itemSelected ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : itemUnlocked ? (
                        <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center hover:border-slate-500">
                          {isItemPreviewed && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center">
                          <Lock className="w-3 h-3" />
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
