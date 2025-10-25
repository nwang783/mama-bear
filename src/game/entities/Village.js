import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';

/**
 * Village entity with buildings and interaction zones
 */
export default class Village extends Phaser.GameObjects.Container {
  constructor(scene, config) {
    super(scene, config.x, config.y);

    this.villageConfig = config;
    this.scene = scene;

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // Static body

    // Create village visuals
    this.createBuilding();
    this.createInteractionZone();

    // Depth for layering
    this.setDepth(50);

    // Interaction state
    this.isPlayerNearby = false;
  }

  createBuilding() {
    const tileSize = 16;
    
    // House pattern as 4x3 grid (from upper left):
    // Row 1: 52, 53, 54, 55
    // Row 2: 64, 65, 66, 67
    // Row 3: 76, 77, 78, 79
    const housePattern = [
      [52, 53, 54, 55],
      [64, 65, 66, 67],
      [76, 77, 78, 79]
    ];

    const buildingWidth = 4;
    const buildingHeight = 3;
    const building = this.scene.add.container(0, 0);

    // Build house from pattern
    for (let row = 0; row < buildingHeight; row++) {
      for (let col = 0; col < buildingWidth; col++) {
        const tileNum = housePattern[row][col].toString().padStart(4, '0');
        const tile = this.scene.add.image(
          (col - buildingWidth/2) * tileSize + tileSize/2,
          (row - buildingHeight/2) * tileSize + tileSize/2,
          `tile_${tileNum}`
        );
        building.add(tile);
      }
    }

    // Add emoji sign above building
    const emoji = this.scene.add.text(
      0,
      -(buildingHeight/2) * tileSize - 20,
      this.villageConfig.emoji,
      { fontSize: '32px' }
    );
    emoji.setOrigin(0.5);
    building.add(emoji);

    // Add village name plate below building
    const namePlate = this.scene.add.text(
      0,
      (buildingHeight/2) * tileSize + 15,
      this.villageConfig.name,
      {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    );
    namePlate.setOrigin(0.5);
    building.add(namePlate);

    // Add path tiles in front of building
    for (let i = -1; i <= 1; i++) {
      const pathTile = this.scene.add.image(
        i * tileSize,
        (buildingHeight/2) * tileSize + tileSize,
        'tile_0016' // Stone path tile
      );
      building.add(pathTile);
    }

    // Add the building container to this village container
    this.add(building);

    // Store references
    this.buildingContainer = building;
    this.emoji = emoji;
  }

  createInteractionZone() {
    // Create invisible interaction zone
    const zone = this.scene.add.circle(
      0,
      0,
      GAME_CONFIG.INTERACTION.VILLAGE_RADIUS,
      0x00ff00,
      0 // Fully transparent
    );
    
    // For debugging, you can set alpha to 0.2 to see the zones
    // zone.setAlpha(0.2);
    
    this.add(zone);
    this.interactionZone = zone;

    // Set physics body to match interaction zone
    this.body.setCircle(GAME_CONFIG.INTERACTION.VILLAGE_RADIUS);
  }

  checkPlayerProximity(playerX, playerY) {
    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      playerX,
      playerY
    );

    const wasNearby = this.isPlayerNearby;
    this.isPlayerNearby = distance <= GAME_CONFIG.INTERACTION.VILLAGE_RADIUS;

    // Visual feedback when player enters/exits zone
    if (this.isPlayerNearby && !wasNearby) {
      this.onPlayerEnter();
    } else if (!this.isPlayerNearby && wasNearby) {
      this.onPlayerExit();
    }

    return this.isPlayerNearby;
  }

  onPlayerEnter() {
    // Add glow effect to building
    this.scene.tweens.add({
      targets: this.buildingContainer,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 200,
      ease: 'Power2'
    });

    // Bounce emoji
    this.scene.tweens.add({
      targets: this.emoji,
      y: this.emoji.y - 10,
      duration: 300,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
  }

  onPlayerExit() {
    // Remove glow effect
    this.scene.tweens.add({
      targets: this.buildingContainer,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: 'Power2'
    });
  }

  enterVillage() {
    // This will be called when player presses E while nearby
    console.log(`Entering ${this.villageConfig.name}...`);
    
    // Add entrance animation
    this.scene.tweens.add({
      targets: this,
      scale: 1.2,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      onComplete: () => {
        // Trigger village entrance (can emit event here)
        this.scene.events.emit('villageEntered', this.villageConfig);
      }
    });
  }

  getConfig() {
    return this.villageConfig;
  }
}
