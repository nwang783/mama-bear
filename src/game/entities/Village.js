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
    
    // Build a cute house using Kenney tiles
    // Different building styles per village
    const buildingStyles = {
      'reading': { base: 'tile_0066', roof: 'tile_0053', door: 'tile_0080' },  // Blue house
      'math': { base: 'tile_0068', roof: 'tile_0055', door: 'tile_0082' },     // Yellow house
      'finance': { base: 'tile_0070', roof: 'tile_0057', door: 'tile_0084' }   // Red house
    };

    const style = buildingStyles[this.villageConfig.id] || buildingStyles['reading'];

    // Create building structure (3x4 tiles)
    const buildingWidth = 3;
    const buildingHeight = 4;
    const building = this.scene.add.container(0, 0);

    // Build walls
    for (let x = 0; x < buildingWidth; x++) {
      for (let y = 1; y < buildingHeight; y++) {
        const wall = this.scene.add.image(
          (x - buildingWidth/2) * tileSize + tileSize/2,
          (y - buildingHeight/2) * tileSize + tileSize/2,
          style.base
        );
        building.add(wall);
      }
    }

    // Add roof tiles
    for (let x = 0; x < buildingWidth; x++) {
      const roofTile = this.scene.add.image(
        (x - buildingWidth/2) * tileSize + tileSize/2,
        (0 - buildingHeight/2) * tileSize + tileSize/2,
        style.roof
      );
      building.add(roofTile);
    }

    // Add door (bottom center)
    const door = this.scene.add.image(
      0,
      (buildingHeight - 1 - buildingHeight/2) * tileSize + tileSize/2,
      style.door
    );
    building.add(door);

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
