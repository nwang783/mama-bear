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
    // Create sky background
    const sky = this.add.rectangle(
      GAME_CONFIG.WORLD.WIDTH / 2,
      GAME_CONFIG.WORLD.HEIGHT / 2,
      GAME_CONFIG.WORLD.WIDTH,
      GAME_CONFIG.WORLD.HEIGHT,
      0x87ceeb
    );
    sky.setDepth(-100);

    // Add ground
    const ground = this.add.rectangle(
      GAME_CONFIG.WORLD.WIDTH / 2,
      GAME_CONFIG.WORLD.HEIGHT - 50,
      GAME_CONFIG.WORLD.WIDTH,
      100,
      0x228b22
    );
    ground.setDepth(-50);

    // Add some clouds
    for (let i = 0; i < 10; i++) {
      const cloudX = Phaser.Math.Between(100, GAME_CONFIG.WORLD.WIDTH - 100);
      const cloudY = Phaser.Math.Between(50, 300);
      this.createCloud(cloudX, cloudY);
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
    // Add trees
    for (let i = 0; i < GAME_CONFIG.DECORATIONS.TREES_COUNT; i++) {
      const x = Phaser.Math.Between(100, GAME_CONFIG.WORLD.WIDTH - 100);
      const y = Phaser.Math.Between(200, GAME_CONFIG.WORLD.HEIGHT - 200);
      
      // Make sure trees don't spawn on villages
      if (!this.isNearVillageSpawn(x, y)) {
        this.createTree(x, y);
      }
    }

    // Add flowers
    for (let i = 0; i < GAME_CONFIG.DECORATIONS.FLOWERS_COUNT; i++) {
      const x = Phaser.Math.Between(50, GAME_CONFIG.WORLD.WIDTH - 50);
      const y = Phaser.Math.Between(150, GAME_CONFIG.WORLD.HEIGHT - 150);
      this.createFlower(x, y);
    }
  }

  isNearVillageSpawn(x, y) {
    return GAME_CONFIG.VILLAGES.some(village => {
      const distance = Phaser.Math.Distance.Between(x, y, village.x, village.y);
      return distance < 250;
    });
  }

  createTree(x, y) {
    const tree = this.add.container(x, y);
    
    // Tree trunk
    const trunk = this.add.rectangle(0, 0, 15, 40, 0x8b4513);
    
    // Tree foliage (circle)
    const foliage = this.add.circle(0, -30, 30, 0x228b22);
    foliage.setStrokeStyle(2, 0x1a6b1a);
    
    tree.add([trunk, foliage]);
    tree.setDepth(10);

    // Gentle sway animation
    this.tweens.add({
      targets: foliage,
      angle: -3,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  createFlower(x, y) {
    const colors = [0xff69b4, 0xffd700, 0xff6347, 0x9370db, 0xffa500];
    const color = Phaser.Utils.Array.GetRandom(colors);
    
    const flower = this.add.circle(x, y, 5, color);
    flower.setStrokeStyle(1, 0x000000);
    flower.setDepth(5);
  }

  createPaths() {
    // Create simple paths between villages
    const villages = GAME_CONFIG.VILLAGES;
    
    // Path from reading to math
    this.createPath(villages[0].x, villages[0].y, villages[1].x, villages[1].y);
    
    // Path from math to finance
    this.createPath(villages[1].x, villages[1].y, villages[2].x, villages[2].y);
    
    // Path from finance to reading (complete the loop)
    this.createPath(villages[2].x, villages[2].y, villages[0].x, villages[0].y);
  }

  createPath(x1, y1, x2, y2) {
    const graphics = this.add.graphics();
    graphics.lineStyle(20, 0x8b7355, 0.6);
    
    // Create curved path using lineBetween with multiple segments for smoothness
    const path = new Phaser.Curves.Path(x1, y1);
    
    // Create a gentle curve
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const controlX = midX + (Math.random() - 0.5) * 100;
    const controlY = midY + (Math.random() - 0.5) * 100;
    
    path.quadraticBezierTo(controlX, controlY, x2, y2);
    path.draw(graphics);
    
    graphics.setDepth(-10);
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
