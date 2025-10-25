import Phaser from 'phaser';
import Player from '../entities/Player';
import House from '../entities/House';
import { GAME_CONFIG } from '../config/gameConfig';

/**
 * Base village scene class - extended by specific village scenes
 */
export default class VillageScene extends Phaser.Scene {
  constructor(key) {
    super({ key });
    this.player = null;
    this.houses = [];
    this.nearbyHouse = null;
    this.villageConfig = null;
    this.housesConfig = [];
  }

  init(data) {
    // Receive village config from WorldScene
    this.villageConfig = data.villageConfig;
  }

  create() {
    // Set world bounds to village size
    this.physics.world.setBounds(
      0,
      0,
      GAME_CONFIG.VILLAGE_SCENE.WIDTH,
      GAME_CONFIG.VILLAGE_SCENE.HEIGHT
    );

    // Create background
    this.createBackground();

    // Create decorations
    this.createDecorations();

    // Create houses
    this.createHouses();

    // Create paths
    this.createPaths();

    // Create exit portal
    this.createExitPortal();

    // Create player
    this.createPlayer();

    // Setup camera
    this.setupCamera();

    // Listen for house entrance events
    this.events.on('houseEntered', this.handleHouseEntered, this);

    // Add village title text
    this.createTitleText();
  }

  createBackground() {
    // Create tiled grass background using Kenney tiles
    const tileSize = 16;
    const tilesX = Math.ceil(GAME_CONFIG.VILLAGE_SCENE.WIDTH / tileSize);
    const tilesY = Math.ceil(GAME_CONFIG.VILLAGE_SCENE.HEIGHT / tileSize);

    // Create grass pattern
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
  }

  createDecorations() {
    const tileSize = 16;
    
    // Add trees scattered around (avoiding house positions)
    for (let i = 0; i < 15; i++) {
      const treeX = Phaser.Math.Between(tileSize, GAME_CONFIG.VILLAGE_SCENE.WIDTH - tileSize);
      const treeY = Phaser.Math.Between(tileSize, GAME_CONFIG.VILLAGE_SCENE.HEIGHT - 100);
      
      // Don't place trees near houses or spawn point
      if (!this.isNearHouseSpawn(treeX, treeY) && !this.isNearPlayerSpawn(treeX, treeY)) {
        const treeType = Math.random() < 0.5 ? 'tile_0004' : 'tile_0005';
        const tree = this.add.image(treeX, treeY, treeType);
        tree.setDepth(5);
      }
    }
  }

  isNearHouseSpawn(x, y) {
    return this.housesConfig.some(house => {
      const distance = Phaser.Math.Distance.Between(x, y, house.x, house.y);
      return distance < 100;
    });
  }

  isNearPlayerSpawn(x, y) {
    const distance = Phaser.Math.Distance.Between(
      x, y,
      GAME_CONFIG.VILLAGE_SCENE.PLAYER_START_X,
      GAME_CONFIG.VILLAGE_SCENE.PLAYER_START_Y
    );
    return distance < 100;
  }

  createPaths() {
    const tileSize = 16;
    const centerX = GAME_CONFIG.VILLAGE_SCENE.WIDTH / 2;
    const centerY = GAME_CONFIG.VILLAGE_SCENE.HEIGHT / 2;

    // Create paths from center to each house
    this.housesConfig.forEach(house => {
      this.createPath(centerX, centerY + 200, house.x, house.y, tileSize);
    });

    // Create path to exit portal
    this.createPath(
      centerX,
      centerY + 200,
      GAME_CONFIG.VILLAGE_SCENE.EXIT_PORTAL_X,
      GAME_CONFIG.VILLAGE_SCENE.EXIT_PORTAL_Y,
      tileSize
    );
  }

  createPath(x1, y1, x2, y2, tileSize) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.floor(distance / tileSize);
    
    const stepX = dx / steps;
    const stepY = dy / steps;
    
    for (let i = 0; i <= steps; i++) {
      const x = x1 + (stepX * i);
      const y = y1 + (stepY * i);
      
      const pathTile = this.add.image(x, y, 'tile_0025');
      pathTile.setDepth(-10);
      
      // Add width variation
      if (i % 2 === 0) {
        const offset = tileSize * 0.8;
        const perpX = -stepY / steps * offset;
        const perpY = stepX / steps * offset;
        
        const pathTile2 = this.add.image(x + perpX, y + perpY, 'tile_0025');
        pathTile2.setDepth(-10);
        const pathTile3 = this.add.image(x - perpX, y - perpY, 'tile_0025');
        pathTile3.setDepth(-10);
      }
    }
  }

  createHouses() {
    // To be overridden by child classes
    console.warn('createHouses() should be overridden by child class');
  }

  createExitPortal() {
    const portalX = GAME_CONFIG.VILLAGE_SCENE.EXIT_PORTAL_X;
    const portalY = GAME_CONFIG.VILLAGE_SCENE.EXIT_PORTAL_Y;

    // Create portal visual effect
    const portalOuter = this.add.circle(portalX, portalY, 40, 0x9370db, 0.5);
    const portalInner = this.add.circle(portalX, portalY, 25, 0xba55d3, 0.7);
    
    portalOuter.setDepth(10);
    portalInner.setDepth(11);

    // Add portal text
    const portalText = this.add.text(portalX, portalY - 60, '← Back to Lobby', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    portalText.setOrigin(0.5);
    portalText.setDepth(12);

    // Animate portal
    this.tweens.add({
      targets: [portalOuter, portalInner],
      scale: 1.1,
      alpha: 0.3,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Store portal position for collision detection
    this.exitPortal = { x: portalX, y: portalY, radius: 40 };
  }

  createPlayer() {
    this.player = new Player(
      this,
      GAME_CONFIG.VILLAGE_SCENE.PLAYER_START_X,
      GAME_CONFIG.VILLAGE_SCENE.PLAYER_START_Y
    );
  }

  setupCamera() {
    // Camera follows player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    
    // Set camera bounds
    this.cameras.main.setBounds(
      0,
      0,
      GAME_CONFIG.VILLAGE_SCENE.WIDTH,
      GAME_CONFIG.VILLAGE_SCENE.HEIGHT
    );

    this.cameras.main.setZoom(1.5);
  }

  createTitleText() {
    if (!this.villageConfig) return;

    // Create title banner at top of screen
    const title = this.add.text(
      GAME_CONFIG.VILLAGE_SCENE.WIDTH / 2,
      30,
      `${this.villageConfig.emoji} ${this.villageConfig.name}`,
      {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      }
    );
    title.setOrigin(0.5);
    title.setScrollFactor(0);
    title.setDepth(1000);

    // Fade out after 3 seconds
    this.time.delayedCall(3000, () => {
      this.tweens.add({
        targets: title,
        alpha: 0,
        duration: 1000
      });
    });
  }

  update() {
    // Update player
    if (this.player) {
      this.player.update();
    }

    // Check proximity to houses
    this.checkHouseProximity();

    // Check for house interaction
    if (this.player && this.nearbyHouse && this.player.isInteractKeyPressed()) {
      this.nearbyHouse.enterHouse();
    }

    // Check for exit portal collision
    this.checkExitPortalCollision();
  }

  checkHouseProximity() {
    if (!this.player) return;

    const playerPos = this.player.getPosition();
    let foundNearby = false;

    this.houses.forEach(house => {
      const isNear = house.checkPlayerProximity(playerPos.x, playerPos.y);
      if (isNear && house.isGameHouse()) {
        this.nearbyHouse = house;
        foundNearby = true;
        
        // Notify UI scene
        const uiScene = this.scene.get('UIScene');
        if (uiScene) {
          uiScene.events.emit('showInteractionPrompt', house.getConfig());
        }
      }
    });

    if (!foundNearby && this.nearbyHouse) {
      this.nearbyHouse = null;
      const uiScene = this.scene.get('UIScene');
      if (uiScene) {
        uiScene.events.emit('hideInteractionPrompt');
      }
    }
  }

  checkExitPortalCollision() {
    if (!this.player || !this.exitPortal) return;

    const playerPos = this.player.getPosition();
    const distance = Phaser.Math.Distance.Between(
      playerPos.x,
      playerPos.y,
      this.exitPortal.x,
      this.exitPortal.y
    );

    if (distance < this.exitPortal.radius && this.player.isInteractKeyPressed()) {
      this.returnToLobby();
    }
  }

  returnToLobby() {
    console.log('Returning to lobby...');
    
    // Transition back to WorldScene
    this.cameras.main.fade(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('WorldScene');
    });
  }

  handleHouseEntered(houseConfig) {
    console.log(`Player entered ${houseConfig.name}!`);
    
    // Check if this house has a game scene
    if (houseConfig.gameScene) {
      // If this is FruitCollectorScene, show question set selection
      if (houseConfig.gameScene === 'FruitCollectorScene') {
        const subject = houseConfig.subject || this.villageConfig?.id || 'math';
        
        // Launch the question set selection scene
        const sceneData = {
          subject: subject,
          returnScene: this.scene.key,
          villageConfig: this.villageConfig
        };
        
        this.scene.start('QuestionSetSelectionScene', sceneData);
      } else {
        // For other game scenes, start normally
        const sceneData = {
          returnScene: this.scene.key,
          villageConfig: this.villageConfig
        };
        
        this.scene.start(houseConfig.gameScene, sceneData);
      }
    } else {
      // Game not yet implemented
      alert(`${houseConfig.name} is coming soon!\\n\\nThis minigame is currently under development.`);
    }
  }
}
