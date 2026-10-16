import React, { useState, useEffect } from 'react';
import {
  GameScreen,
  CostumeId,
  WorldId,
  PlayerProgress,
  WORLDS,
} from './game/types.ts';
import { loadProgress, saveProgress } from './game/storage.ts';
import { sound } from './game/audio.ts';
import { HomeScreen } from './components/HomeScreen.tsx';
import { ChickenSelectModal } from './components/ChickenSelectModal.tsx';
import { WorldSelectModal } from './components/WorldSelectModal.tsx';
import { GameCanvas } from './game/GameCanvas.tsx';
import { HUD } from './components/HUD.tsx';
import { PauseModal } from './components/PauseModal.tsx';
import { GameOverModal } from './components/GameOverModal.tsx';

export default function App() {
  const [progress, setProgress] = useState<PlayerProgress>(() => loadProgress());
  const [screen, setScreen] = useState<GameScreen>('PLAYING');
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Modals
  const [isChickenSelectOpen, setIsChickenSelectOpen] = useState<boolean>(false);
  const [isWorldSelectOpen, setIsWorldSelectOpen] = useState<boolean>(false);
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState<boolean>(false);

  // In-Game Live State
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [displayBestScore, setDisplayBestScore] = useState<number>(progress.bestScore);
  const [activeInGameWorld, setActiveInGameWorld] = useState<WorldId>(progress.selectedWorld);
  const [transitionMessage, setTransitionMessage] = useState<string | null>(null);
  const [nearMissNotification, setNearMissNotification] = useState<string | null>(null);

  // Game Over Details
  const [gameOverData, setGameOverData] = useState<{
    finalScore: number;
    bestScore: number;
    isNewBest: boolean;
    newUnlockedCostumes: CostumeId[];
    newUnlockedWorlds: WorldId[];
  }>({
    finalScore: 0,
    bestScore: progress.bestScore,
    isNewBest: false,
    newUnlockedCostumes: [],
    newUnlockedWorlds: [],
  });

  // Keep Audio system in sync with preferences
  useEffect(() => {
    sound.setSoundEnabled(progress.soundEnabled);
    sound.setMusicEnabled(progress.musicEnabled);
  }, [progress.soundEnabled, progress.musicEnabled]);

  const updateProgressAndSave = (updated: PlayerProgress) => {
    setProgress(updated);
    saveProgress(updated);
  };

  const handleSelectCostume = (costumeId: CostumeId) => {
    const updated: PlayerProgress = {
      ...progress,
      selectedCostume: costumeId,
    };
    updateProgressAndSave(updated);
  };

  const handleSelectWorld = (worldId: WorldId) => {
    const updated: PlayerProgress = {
      ...progress,
      selectedWorld: worldId,
    };
    updateProgressAndSave(updated);
    setActiveInGameWorld(worldId);
  };

  const handleToggleSound = () => {
    const next = !progress.soundEnabled;
    const updated: PlayerProgress = {
      ...progress,
      soundEnabled: next,
    };
    sound.setSoundEnabled(next);
    updateProgressAndSave(updated);
  };

  const handleToggleMusic = () => {
    const next = !progress.musicEnabled;
    const updated: PlayerProgress = {
      ...progress,
      musicEnabled: next,
    };
    sound.setMusicEnabled(next);
    updateProgressAndSave(updated);
  };

  const handleStartGame = () => {
    setCurrentScore(0);
    setActiveInGameWorld(progress.selectedWorld);
    setIsPaused(false);
    setIsGameOverModalOpen(false);
    setScreen('PLAYING');
  };

  const handleTogglePause = () => {
    setIsPaused(prev => !prev);
  };

  const handleGameOver = (result: {
    finalScore: number;
    bestScore: number;
    isNewBest: boolean;
    newUnlockedCostumes: CostumeId[];
    newUnlockedWorlds: WorldId[];
  }) => {
    setGameOverData(result);
    setDisplayBestScore(result.bestScore);
    setIsGameOverModalOpen(true);
  };

  // Run instance counter for clean game restarts without flicker
  const [runId, setRunId] = useState<number>(1);

  // Keyboard shortcut for Escape / Pause and Space / Enter replay
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && screen === 'PLAYING' && !isGameOverModalOpen) {
        setIsPaused(prev => !prev);
      } else if ((e.code === 'Space' || e.code === 'Enter') && isGameOverModalOpen) {
        e.preventDefault();
        handleRestart();
      } else if ((e.code === 'Space' || e.code === 'Enter') && screen === 'HOME' && !isChickenSelectOpen && !isWorldSelectOpen) {
        e.preventDefault();
        handleStartGame();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [screen, isGameOverModalOpen, isChickenSelectOpen, isWorldSelectOpen]);

  const handleRestart = () => {
    setIsGameOverModalOpen(false);
    setIsPaused(false);
    setCurrentScore(0);
    setActiveInGameWorld(progress.selectedWorld);
    setRunId(prev => prev + 1);
  };

  const handleBackToHome = () => {
    setIsPaused(false);
    setIsGameOverModalOpen(false);
    setScreen('HOME');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 1. Home Screen */}
      {screen === 'HOME' && (
        <HomeScreen
          progress={progress}
          onPlay={handleStartGame}
          onOpenChickenSelect={() => setIsChickenSelectOpen(true)}
          onOpenWorldSelect={() => setIsWorldSelectOpen(true)}
          onToggleSound={handleToggleSound}
          onToggleMusic={handleToggleMusic}
        />
      )}

      {/* 2. Active Game Screen */}
      {screen === 'PLAYING' && (
        <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
          <GameCanvas
            key={`${runId}-${progress.selectedCostume}-${progress.selectedWorld}`}
            progress={progress}
            onUpdateProgress={updateProgressAndSave}
            onGameOver={handleGameOver}
            isPaused={isPaused}
            onScoreUpdate={(score, best) => {
              setCurrentScore(score);
              setDisplayBestScore(best);
            }}
            onWorldChange={(wId) => setActiveInGameWorld(wId)}
            setTransitionMessage={setTransitionMessage}
            setNearMissNotification={setNearMissNotification}
          />

          {/* Interactive HUD Overlay */}
          <HUD
            score={currentScore}
            bestScore={displayBestScore}
            worldId={activeInGameWorld}
            isPaused={isPaused}
            soundEnabled={progress.soundEnabled}
            musicEnabled={progress.musicEnabled}
            transitionMessage={transitionMessage}
            nearMissNotification={nearMissNotification}
            onTogglePause={handleTogglePause}
            onToggleSound={handleToggleSound}
            onToggleMusic={handleToggleMusic}
            onJumpPress={() => {
              // Trigger jump via synthetic space key
              window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', bubbles: true }));
            }}
            onHomePress={() => setScreen('HOME')}
            onOpenChickenSelect={() => setIsChickenSelectOpen(true)}
            onOpenWorldSelect={() => setIsWorldSelectOpen(true)}
          />

          {/* In-Game Pause Modal */}
          {isPaused && !isGameOverModalOpen && (
            <PauseModal
              onResume={() => setIsPaused(false)}
              onRestart={handleRestart}
              onHome={handleBackToHome}
              onOpenChickenSelect={() => setIsChickenSelectOpen(true)}
              onOpenWorldSelect={() => setIsWorldSelectOpen(true)}
            />
          )}

          {/* Game Over Modal */}
          {isGameOverModalOpen && (
            <GameOverModal
              score={gameOverData.finalScore}
              bestScore={gameOverData.bestScore}
              isNewBest={gameOverData.isNewBest}
              costume={progress.selectedCostume}
              worldId={activeInGameWorld}
              progress={progress}
              newUnlockedCostumes={gameOverData.newUnlockedCostumes}
              newUnlockedWorlds={gameOverData.newUnlockedWorlds}
              onRestart={handleRestart}
              onHome={handleBackToHome}
              onOpenChickenSelect={() => setIsChickenSelectOpen(true)}
              onOpenWorldSelect={() => setIsWorldSelectOpen(true)}
            />
          )}
        </div>
      )}

      {/* 3. Character Customization Modal */}
      {isChickenSelectOpen && (
        <ChickenSelectModal
          progress={progress}
          onSelectCostume={handleSelectCostume}
          onBack={() => setIsChickenSelectOpen(false)}
        />
      )}

      {/* 4. World Selection Modal */}
      {isWorldSelectOpen && (
        <WorldSelectModal
          progress={progress}
          onSelectWorld={handleSelectWorld}
          onBack={() => setIsWorldSelectOpen(false)}
        />
      )}
    </div>
  );
}
