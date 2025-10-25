// Centralized game configuration
export const GAME_CONFIG = {
  // World settings
  WORLD: {
    WIDTH: 2400,
    HEIGHT: 1800,
    BACKGROUND_COLOR: '#87ceeb'
  },

  // Canvas/viewport settings (YouTube-like 16:9 aspect ratio)
  CANVAS: {
    WIDTH: 800,
    HEIGHT: 450
  },

  // Player settings
  PLAYER: {
    SPEED: 200,
    SIZE: 40,
    COLOR: 0xff9966,
    START_X: 1200,
    START_Y: 900
  },

  // Village configurations
  VILLAGES: [
    {
      id: 'reading',
      name: 'Reading Village',
      x: 600,
      y: 500,
      color: 0x4ecdc4,
      emoji: '📚',
      description: 'Learn reading and literacy'
    },
    {
      id: 'math',
      name: 'Math Village',
      x: 1800,
      y: 600,
      color: 0xffe66d,
      emoji: '🔢',
      description: 'Practice math and numbers'
    },
    {
      id: 'finance',
      name: 'Finance Village',
      x: 1200,
      y: 1400,
      color: 0xff6b6b,
      emoji: '💰',
      description: 'Understand money and finance'
    }
  ],

  // Interaction settings
  INTERACTION: {
    VILLAGE_RADIUS: 150,
    PROMPT_KEY: 'E'
  },

  // Visual settings
  VILLAGE: {
    BUILDING_WIDTH: 140,
    BUILDING_HEIGHT: 120,
    ROOF_HEIGHT: 60
  },

  // Decoration settings
  DECORATIONS: {
    TREES_COUNT: 30,
    FLOWERS_COUNT: 50
  }
};

export default GAME_CONFIG;
