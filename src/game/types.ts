export type CostumeId = 'original' | 'superhero' | 'royal' | 'cool' | 'space';

export type WorldId = 'farm' | 'forest' | 'candy' | 'space';

export type ChickenExpression = 'happy' | 'determined' | 'surprised' | 'dizzy' | 'celebrating';

export type GameScreen = 'HOME' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'CHICKEN_SELECT' | 'WORLD_SELECT';

export interface CostumeData {
  id: CostumeId;
  name: string;
  tagline: string;
  description: string;
  unlockScore: number;
  previewColor: string;
  badge: string;
}

export interface WorldData {
  id: WorldId;
  name: string;
  subtitle: string;
  description: string;
  unlockScore: number;
  themeColor: string;
  skyGradient: [string, string];
  groundColor: string;
  groundGrassColor: string;
  recommendedCostume?: CostumeId;
  obstacleNames: string[];
}

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  worldId: WorldId;
  type: string;
  scored: boolean;
  nearMissChecked: boolean;
  flying?: boolean;
  rotation?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'confetti' | 'sparkle' | 'leaf' | 'firefly' | 'sugar' | 'star' | 'dust';
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
}

export interface PlayerProgress {
  bestScore: number;
  unlockedCostumes: CostumeId[];
  selectedCostume: CostumeId;
  unlockedWorlds: WorldId[];
  selectedWorld: WorldId;
  soundEnabled: boolean;
  musicEnabled: boolean;
}

export const COSTUMES: CostumeData[] = [
  {
    id: 'original',
    name: 'Original Chicken',
    tagline: 'Classic & Groovy',
    description: 'Fluffy white feathers with the signature purple beats headphones. The timeless hero.',
    unlockScore: 0,
    previewColor: '#8b5cf6',
    badge: 'Original'
  },
  {
    id: 'superhero',
    name: 'Superhero Chicken',
    tagline: 'Defender of the Coop',
    description: 'Flowing superhero cape and heroic mask for leaping over danger at the speed of sound.',
    unlockScore: 200,
    previewColor: '#ef4444',
    badge: 'Cape & Mask'
  },
  {
    id: 'royal',
    name: 'Royal Chicken',
    tagline: 'His Feathered Majesty',
    description: 'Gleaming golden jeweled crown and royal ermine mantle. Running with regal majesty.',
    unlockScore: 800,
    previewColor: '#eab308',
    badge: 'Golden Crown'
  },
  {
    id: 'cool',
    name: 'Cool Chicken',
    tagline: 'Too Chill to Spill',
    description: 'Designer dark shades and golden chain bling. Keeps cool even during near-misses.',
    unlockScore: 1200,
    previewColor: '#06b6d4',
    badge: 'Dark Shades'
  },
  {
    id: 'space',
    name: 'Space Chicken',
    tagline: 'Cosmic Explorer',
    description: 'Futuristic astronaut bubble helmet and high-tech thruster suit. Ready for low-gravity leaps.',
    unlockScore: 2000,
    previewColor: '#3b82f6',
    badge: 'Astro Helmet'
  }
];

export const WORLDS: WorldData[] = [
  {
    id: 'farm',
    name: 'Happy Farm',
    subtitle: 'Sunny Pastures',
    description: 'Bright blue skies, rolling green hills, fluffy clouds, wooden fences, and rustic hay bales.',
    unlockScore: 0,
    themeColor: '#22c55e',
    skyGradient: ['#38bdf8', '#bae6fd'],
    groundColor: '#4ade80',
    groundGrassColor: '#16a34a',
    obstacleNames: ['Giant Speckled Egg', 'Farm Milk Bottles', 'Frosted Strawberry Cake', 'Golden Hay Bale', 'Rustic Wooden Crate']
  },
  {
    id: 'forest',
    name: 'Magic Forest',
    subtitle: 'Enchanted Twilight',
    description: 'Enchanted trees, pulsing fireflies, ancient mossy logs, and glowing bioluminescent mushrooms.',
    unlockScore: 500,
    themeColor: '#10b981',
    skyGradient: ['#0f172a', '#064e3b'],
    groundColor: '#047857',
    groundGrassColor: '#065f46',
    obstacleNames: ['Ancient Hollow Log', 'Glowing Mushroom', 'Bramble Thorns', 'Enchanted Crystal']
  },
  {
    id: 'candy',
    name: 'Candy Kingdom',
    subtitle: 'Sugar Rush Valley',
    description: 'Pastel hills, swirl lollipop trees, striped candy canes, giant gumdrops, and sweet sprinkles.',
    unlockScore: 1500,
    themeColor: '#ec4899',
    skyGradient: ['#f472b6', '#fce7f3'],
    groundColor: '#f43f5e',
    groundGrassColor: '#fb7185',
    obstacleNames: ['Striped Candy Cane', 'Giant Bouncing Gumdrop', 'Frosted Cake Crate', 'Sweet Licorice']
  },
  {
    id: 'space',
    name: 'Cosmic Space',
    subtitle: 'Galactic Horizon',
    description: 'Starry nebulas, floating asteroids, laser energy barriers, and glowing celestial satellites.',
    unlockScore: 3000,
    themeColor: '#818cf8',
    skyGradient: ['#020617', '#1e1b4b'],
    groundColor: '#312e81',
    groundGrassColor: '#4338ca',
    recommendedCostume: 'space',
    obstacleNames: ['Cratered Asteroid', 'Laser Energy Barrier', 'Space Satellite', 'Cosmic Mineral']
  }
];
