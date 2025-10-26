import Phaser from 'phaser';

/**
 * Boot scene for preloading assets and initialization
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Create loading text
    const loadingText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      'Loading Assets...',
      {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#ffffff'
      }
    );
    loadingText.setOrigin(0.5);

    // Load character spritesheet
    this.load.spritesheet('player', 
      'Sprout Lands - Sprites - Basic pack/Characters/Basic Charakter Spritesheet.png',
      { frameWidth: 48, frameHeight: 48 }
    );

    // Load environment objects
    this.load.image('grass_biome', 
      'Sprout Lands - Sprites - Basic pack/Objects/Basic_Grass_Biom_things.png'
    );
    
    this.load.image('plants', 
      'Sprout Lands - Sprites - Basic pack/Objects/Basic_Plants.png'
    );

    // Load tilesets
    this.load.image('grass_tileset', 
      'Sprout Lands - Sprites - Basic pack/Tilesets/Grass.png'
    );

    this.load.image('hills', 
      'Sprout Lands - Sprites - Basic pack/Tilesets/Hills.png'
    );

    // Load water and biome things as spritesheets (16x16 tiles)
    this.load.spritesheet('water_tiles',
      'Sprout Lands - Sprites - Basic pack/Tilesets/Water.png',
      { frameWidth: 16, frameHeight: 16 }
    );

    this.load.spritesheet('biome_things',
      'Sprout Lands - Sprites - Basic pack/Objects/Basic_Grass_Biom_things.png',
      { frameWidth: 16, frameHeight: 16 }
    );

    // Load furniture for buildings
    this.load.image('furniture', 
      'Sprout Lands - Sprites - Basic pack/Objects/Basic_Furniture.png'
    );

    // Load Kenney Tiny Town tiles for buildings and structures
    for (let i = 0; i <= 131; i++) {
      const tileNum = i.toString().padStart(4, '0');
      this.load.image(`tile_${tileNum}`, 
        `kenney_tiny-town/Tiles/tile_${tileNum}.png`
      );
    }

    // Load Kenney Food tiles for minigames
    for (let i = 0; i <= 111; i++) {
      const tileNum = i.toString().padStart(4, '0');
      this.load.image(`tile_food_${tileNum}`, 
        `kenney_pixel-platformer-food-expansion/Tiles/tile_${tileNum}.png`
      );
    }

    // Load Kenney Fish Pack assets for fishing minigame
    // Background terrain
    this.load.image('background_terrain', 
      'kenney_fish-pack_2/PNG/Default/background_terrain.png'
    );
    
    // Dirt terrain tiles (a-d variants)
    ['a', 'b', 'c', 'd'].forEach(variant => {
      this.load.image(`terrain_dirt_${variant}`, 
        `kenney_fish-pack_2/PNG/Default/terrain_dirt_${variant}.png`
      );
      this.load.image(`terrain_dirt_top_${variant}`, 
        `kenney_fish-pack_2/PNG/Default/terrain_dirt_top_${variant}.png`
      );
    });
    
    // Fish sprites (outline versions)
    const fishColors = ['blue', 'green', 'orange', 'brown'];
    fishColors.forEach(color => {
      this.load.image(`fish_${color}_outline`, 
        `kenney_fish-pack_2/PNG/Default/fish_${color}_outline.png`
      );
    });
    
    // Bubbles (a-c variants)
    ['a', 'b', 'c'].forEach(variant => {
      this.load.image(`bubble_${variant}`, 
        `kenney_fish-pack_2/PNG/Default/bubble_${variant}.png`
      );
    });
    
    // Seaweed (a-h variants)
    ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].forEach(variant => {
      this.load.image(`background_seaweed_${variant}`, 
        `kenney_fish-pack_2/PNG/Default/background_seaweed_${variant}.png`
      );
    });
    
    // Rocks (a-b variants)
    ['a', 'b'].forEach(variant => {
      this.load.image(`background_rock_${variant}`, 
        `kenney_fish-pack_2/PNG/Default/background_rock_${variant}.png`
      );
    });

    // Load background music
    this.load.audio('backgroundMusic', 'assets/audio/morning-background.mp3');
    this.load.audio('gameMusic', 'assets/audio/Space-Jazz-game-soundtrack.mp3');
  }

  create() {
    // Create player animations
    this.createPlayerAnimations();
    
    // Start global background music (persists across all scenes)
    const music = this.sound.add('backgroundMusic', {
      loop: true,
      volume: 0.5
    });
    music.play();
    
    // Store reference in game registry so other scenes can access if needed
    this.game.registry.set('backgroundMusic', music);
    
    // Start the main world scene
    this.scene.start('WorldScene');
    
    // Launch UI scene as overlay
    this.scene.launch('UIScene');
  }

  createPlayerAnimations() {
    // Idle animation (frame 0)
    this.anims.create({
      key: 'idle-down',
      frames: [{ key: 'player', frame: 0 }],
      frameRate: 1
    });

    this.anims.create({
      key: 'idle-up',
      frames: [{ key: 'player', frame: 6 }],
      frameRate: 1
    });

    this.anims.create({
      key: 'idle-side',
      frames: [{ key: 'player', frame: 3 }],
      frameRate: 1
    });

    // Walk down
    this.anims.create({
      key: 'walk-down',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
      frameRate: 8,
      repeat: -1
    });

    // Walk side
    this.anims.create({
      key: 'walk-side',
      frames: this.anims.generateFrameNumbers('player', { start: 3, end: 5 }),
      frameRate: 8,
      repeat: -1
    });

    // Walk up
    this.anims.create({
      key: 'walk-up',
      frames: this.anims.generateFrameNumbers('player', { start: 6, end: 8 }),
      frameRate: 8,
      repeat: -1
    });
  }
}
