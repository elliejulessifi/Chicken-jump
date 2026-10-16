import { CostumeId, WorldId, PlayerProgress, COSTUMES, WORLDS } from './types.ts';

const STORAGE_KEY = 'chicken_jump_game_progression_v1';

const DEFAULT_PROGRESS: PlayerProgress = {
  bestScore: 0,
  unlockedCostumes: ['original'],
  selectedCostume: 'original',
  unlockedWorlds: ['farm'],
  selectedWorld: 'farm',
  soundEnabled: true,
  musicEnabled: false,
};

export function loadProgress(): PlayerProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;

    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_PROGRESS;

    const validCostumeIds = new Set<CostumeId>(COSTUMES.map(c => c.id));
    const validWorldIds = new Set<WorldId>(WORLDS.map(w => w.id));

    // Ensure bestScore is a positive number
    const bestScore = typeof parsed.bestScore === 'number' && !isNaN(parsed.bestScore)
      ? Math.max(0, Math.floor(parsed.bestScore))
      : 0;

    // Filter unlocked costumes
    let unlockedCostumes: CostumeId[] = Array.isArray(parsed.unlockedCostumes)
      ? parsed.unlockedCostumes.filter((id: any): id is CostumeId => validCostumeIds.has(id))
      : ['original'];
    if (!unlockedCostumes.includes('original')) {
      unlockedCostumes.unshift('original');
    }

    // Auto-unlock any costume the player's best score already qualifies for
    for (const c of COSTUMES) {
      if (bestScore >= c.unlockScore && !unlockedCostumes.includes(c.id)) {
        unlockedCostumes.push(c.id);
      }
    }

    // Selected costume
    const selectedCostume: CostumeId = validCostumeIds.has(parsed.selectedCostume) && unlockedCostumes.includes(parsed.selectedCostume)
      ? parsed.selectedCostume
      : 'original';

    // Filter unlocked worlds
    let unlockedWorlds: WorldId[] = Array.isArray(parsed.unlockedWorlds)
      ? parsed.unlockedWorlds.filter((id: any): id is WorldId => validWorldIds.has(id))
      : ['farm'];
    if (!unlockedWorlds.includes('farm')) {
      unlockedWorlds.unshift('farm');
    }

    // Auto-unlock any world the player's best score already qualifies for
    for (const w of WORLDS) {
      if (bestScore >= w.unlockScore && !unlockedWorlds.includes(w.id)) {
        unlockedWorlds.push(w.id);
      }
    }

    // Selected world
    const selectedWorld: WorldId = validWorldIds.has(parsed.selectedWorld) && unlockedWorlds.includes(parsed.selectedWorld)
      ? parsed.selectedWorld
      : 'farm';

    return {
      bestScore,
      unlockedCostumes,
      selectedCostume,
      unlockedWorlds,
      selectedWorld,
      soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
      musicEnabled: typeof parsed.musicEnabled === 'boolean' ? parsed.musicEnabled : true,
    };
  } catch (err) {
    console.warn('Failed to parse localStorage player progress:', err);
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: PlayerProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.warn('Failed to save player progress to localStorage:', err);
  }
}

export function unlockNewItems(score: number, current: PlayerProgress): {
  newCostumes: CostumeId[];
  newWorlds: WorldId[];
  updatedProgress: PlayerProgress;
} {
  const newCostumes: CostumeId[] = [];
  const newWorlds: WorldId[] = [];

  const updatedUnlockedCostumes = [...current.unlockedCostumes];
  const updatedUnlockedWorlds = [...current.unlockedWorlds];

  for (const c of COSTUMES) {
    if (score >= c.unlockScore && !updatedUnlockedCostumes.includes(c.id)) {
      updatedUnlockedCostumes.push(c.id);
      newCostumes.push(c.id);
    }
  }

  for (const w of WORLDS) {
    if (score >= w.unlockScore && !updatedUnlockedWorlds.includes(w.id)) {
      updatedUnlockedWorlds.push(w.id);
      newWorlds.push(w.id);
    }
  }

  const updatedProgress: PlayerProgress = {
    ...current,
    bestScore: Math.max(current.bestScore, score),
    unlockedCostumes: updatedUnlockedCostumes,
    unlockedWorlds: updatedUnlockedWorlds,
  };

  if (newCostumes.length > 0 || newWorlds.length > 0 || score > current.bestScore) {
    saveProgress(updatedProgress);
  }

  return { newCostumes, newWorlds, updatedProgress };
}
