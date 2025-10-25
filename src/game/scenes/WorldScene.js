import Phaser from 'phaser';
import Player from '../entities/Player';
import Village from '../entities/Village';
import { GAME_CONFIG } from '../config/gameConfig';

/**
 * Main open-world gameplay scene
 */
export default class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldScene' });
    this.player = null;
    this.villages = [];
    this.nearbyVillage = null;
  }

  create() {
    // Set world bounds (larger than visible area)
    this.physics.world.setBounds(
      0,
      0,
      GAME_CONFIG.WORLD.WIDTH,
      GAME_CONFIG.WORLD.HEIGHT
    );

    // Create background
    this.createBackground();

    // Create environment decorations
    this.createDecorations();

    // Create villages
    this.createVillages();

    // Create paths between villages
    this.createPaths();

    // Create player
    this.createPlayer();

    // Setup camera to follow player
    this.setupCamera();

    // Listen for village entrance events
    this.events.on('villageEntered', this.handleVillageEntered, this);
  }

  createBackground() {
    // Create varied tiled grass background using Kenney tiles
    const tileSize = 16; // Kenney tiles are 16x16
    const tilesX = Math.ceil(GAME_CONFIG.WORLD.WIDTH / tileSize);
    const tilesY = Math.ceil(GAME_CONFIG.WORLD.HEIGHT / tileSize);

    // Create grass pattern with weighted random variation
    // 70% tile_0000, 28% tile_0001, 2% tile_0002 for more subtle variation
    for (let x = 0; x < tilesX; x++) {
      for (let y = 0; y < tilesY; y++) {
        const rand = Math.random();
        let tileKey;
        if (rand < 0.7) {
          tileKey = 'tile_0000'; // 70% - main grass
        } else if (rand < 0.98) {
          tileKey = 'tile_0001'; // 28% - variation
        } else {
          tileKey = 'tile_0002'; // 2% - rare variation
        }
        
        const grassTile = this.add.image(x * tileSize, y * tileSize, tileKey);
        grassTile.setOrigin(0, 0);
        grassTile.setDepth(-100);
      }
    }

    // Add tree tiles (0004 and 0005) scattered around
    for (let i = 0; i < 60; i++) {
      const treeX = Phaser.Math.Between(tileSize, GAME_CONFIG.WORLD.WIDTH - tileSize);
      const treeY = Phaser.Math.Between(tileSize, GAME_CONFIG.WORLD.HEIGHT - tileSize);
      
      // Don't place trees near villages
      if (!this.isNearVillageSpawn(treeX, treeY)) {
        const treeType = Math.random() < 0.5 ? 'tile_0004' : 'tile_0005';
        const tree = this.add.image(treeX, treeY, treeType);
        tree.setDepth(5); // Lower depth
      }
    }
  }

  createCloud(x, y) {
    const cloud = this.add.container(x, y);
    
    // Create cloud circles
    const c1 = this.add.circle(0, 0, 30, 0xffffff, 0.7);
    const c2 = this.add.circle(-20, 5, 25, 0xffffff, 0.7);
    const c3 = this.add.circle(20, 5, 25, 0xffffff, 0.7);
    const c4 = this.add.circle(0, -15, 20, 0xffffff, 0.7);
    
    cloud.add([c1, c2, c3, c4]);
    cloud.setDepth(-80);

    // Gentle floating animation
    this.tweens.add({
      targets: cloud,
      x: x + 50,
      y: y + 10,
      duration: Phaser.Math.Between(8000, 12000),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  createDecorations() {
    // Decorations now handled by tile-based system (trees are tile_0004 and tile_0005)
    // No additional decorations needed
  }

  isNearVillageSpawn(x, y) {
    return GAME_CONFIG.VILLAGES.some(village => {
      const distance = Phaser.Math.Distance.Between(x, y, village.x, village.y);
      return distance < 250;
    });
  }

  createPaths() {
    // Create simple paths between villages using tile_0025
    const villages = GAME_CONFIG.VILLAGES;
    const tileSize = 16;
    
    // Path from reading to math
    this.createPath(villages[0].x, villages[0].y, villages[1].x, villages[1].y, tileSize);
    
    // Path from math to finance
    this.createPath(villages[1].x, villages[1].y, villages[2].x, villages[2].y, tileSize);
    
    // Path from finance to reading (complete the loop)
    this.createPath(villages[2].x, villages[2].y, villages[0].x, villages[0].y, tileSize);
  }

  createPath(x1, y1, x2, y2, tileSize) {
    // Calculate direction and distance
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.floor(distance / tileSize);
    
    // Normalize direction
    const stepX = dx / steps;
    const stepY = dy / steps;
    
    // Place path tiles along the line
    for (let i = 0; i <= steps; i++) {
      const x = x1 + (stepX * i);
      const y = y1 + (stepY * i);
      
      // Add path tile
      const pathTile = this.add.image(x, y, 'tile_0025');
      pathTile.setDepth(-10);
      
      // Add some width variation - place tiles slightly offset
      if (i % 2 === 0) {
        const offset = tileSize * 0.8;
        // Add perpendicular tiles for path width
        const perpX = -stepY / steps * offset;
        const perpY = stepX / steps * offset;
        
        const pathTile2 = this.add.image(x + perpX, y + perpY, 'tile_0025');
        pathTile2.setDepth(-10);
        const pathTile3 = this.add.image(x - perpX, y - perpY, 'tile_0025');
        pathTile3.setDepth(-10);
      }
    }
  }

  createVillages() {
    GAME_CONFIG.VILLAGES.forEach(villageConfig => {
      const village = new Village(this, villageConfig);
      this.villages.push(village);
    });
  }

  createPlayer() {
    this.player = new Player(
      this,
      GAME_CONFIG.PLAYER.START_X,
      GAME_CONFIG.PLAYER.START_Y
    );
  }

  setupCamera() {
    // Camera follows player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    
    // Set camera bounds to world bounds
    this.cameras.main.setBounds(
      0,
      0,
      GAME_CONFIG.WORLD.WIDTH,
      GAME_CONFIG.WORLD.HEIGHT
    );

    // Optional: Add zoom
    this.cameras.main.setZoom(1);
  }

  update() {
    // Update player
    if (this.player) {
      this.player.update();
    }

    // Check proximity to villages
    this.checkVillageProximity();

    // Check for interaction
    if (this.player && this.nearbyVillage && this.player.isInteractKeyPressed()) {
      this.nearbyVillage.enterVillage();
    }
  }

  checkVillageProximity() {
    if (!this.player) return;

    const playerPos = this.player.getPosition();
    let foundNearby = false;

    this.villages.forEach(village => {
      const isNear = village.checkPlayerProximity(playerPos.x, playerPos.y);
      if (isNear) {
        this.nearbyVillage = village;
        foundNearby = true;
        
        // Notify UI scene
        this.events.emit('showInteractionPrompt', village.getConfig());
      }
    });

    if (!foundNearby && this.nearbyVillage) {
      this.nearbyVillage = null;
      this.events.emit('hideInteractionPrompt');
    }
  }

  handleVillageEntered(villageConfig) {
    console.log(`Player entered ${villageConfig.name}!`);
    // Here you would transition to the village's game scene
    // For now, just show an alert
    alert(`Welcome to ${villageConfig.name}!\n\n${villageConfig.description}\n\nGame activities coming soon!`);
  }
}
