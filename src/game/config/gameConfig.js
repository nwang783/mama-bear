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
  },

  // House configurations for village scenes
  HOUSES: {
    MATH_VILLAGE: [
      { id: 'fruitcollector', name: 'Fruit Collector', type: 'game', x: 400, y: 350, gameScene: 'FruitCollectorScene', emoji: '🍇', subject: 'math' },
      { id: 'fruitcatch', name: 'Fruit Catch', type: 'game', x: 250, y: 250, gameScene: 'FruitCatchScene', emoji: '🍎' },
      { id: 'numbersort', name: 'Number Sort', type: 'game', x: 550, y: 250, gameScene: null, emoji: '🔢' },
      { id: 'mathrace', name: 'Math Race', type: 'game', x: 400, y: 550, gameScene: null, emoji: '🏃' },
      { id: 'deco1', name: 'Village House', type: 'decoration', x: 250, y: 550 },
      { id: 'deco2', name: 'Village House', type: 'decoration', x: 550, y: 550 }
    ],
    READING_VILLAGE: [
      { id: 'fruitcollector', name: 'Fruit Collector', type: 'game', x: 400, y: 350, gameScene: 'FruitCollectorScene', emoji: '🍓', subject: 'reading' },
      { id: 'wordmatch', name: 'Word Match', type: 'game', x: 250, y: 250, gameScene: null, emoji: '📝' },
      { id: 'storybuilder', name: 'Story Builder', type: 'game', x: 550, y: 250, gameScene: null, emoji: '📖' },
      { id: 'letterhunt', name: 'Letter Hunt', type: 'game', x: 400, y: 550, gameScene: null, emoji: '🔤' },
      { id: 'deco1', name: 'Village House', type: 'decoration', x: 250, y: 550 },
      { id: 'deco2', name: 'Village House', type: 'decoration', x: 550, y: 550 }
    ],
    FINANCE_VILLAGE: [
      { id: 'fruitcollector', name: 'Fruit Collector', type: 'game', x: 400, y: 350, gameScene: 'FruitCollectorScene', emoji: '🍊', subject: 'finance' },
      { id: 'coincollector', name: 'Coin Collector', type: 'game', x: 250, y: 250, gameScene: null, emoji: '🪙' },
      { id: 'budgetgame', name: 'Budget Game', type: 'game', x: 550, y: 250, gameScene: null, emoji: '💵' },
      { id: 'shopkeeper', name: 'Shop Keeper', type: 'game', x: 400, y: 550, gameScene: null, emoji: '🏪' },
      { id: 'deco1', name: 'Village House', type: 'decoration', x: 250, y: 550 },
      { id: 'deco2', name: 'Village House', type: 'decoration', x: 550, y: 550 }
    ]
  },

  // Village scene settings
  VILLAGE_SCENE: {
    WIDTH: 800,
    HEIGHT: 900,
    PLAYER_START_X: 400,
    PLAYER_START_Y: 750,
    EXIT_PORTAL_X: 400,
    EXIT_PORTAL_Y: 820
  }
};

export default GAME_CONFIG;
