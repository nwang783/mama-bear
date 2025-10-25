import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';

/**
 * House entity for village scenes - can be interactive game houses or decorative
 */
export default class House extends Phaser.GameObjects.Container {
  constructor(scene, config, villageColor) {
    super(scene, config.x, config.y);

    this.houseConfig = config;
    this.villageColor = villageColor;
    this.scene = scene;

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // Static body

    // Create house visuals
    this.createBuilding();
    this.createInteractionZone();

    // Depth for layering
    this.setDepth(150);

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

    // Add emoji sign above building for game houses
    if (this.houseConfig.type === 'game' && this.houseConfig.emoji) {
      const emoji = this.scene.add.text(
        0,
        -(buildingHeight/2) * tileSize - 18,
        this.houseConfig.emoji,
        { 
          fontSize: '24px',
          resolution: 2
        }
      );
      emoji.setOrigin(0.5);
      emoji.setDepth(200);
      building.add(emoji);
      this.emoji = emoji;
    }

    // Add house name plate below building
    const namePlate = this.scene.add.text(
      0,
      (buildingHeight/2) * tileSize + 12,
      this.houseConfig.name,
      {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 },
        resolution: 2
      }
    );
    namePlate.setOrigin(0.5);
    namePlate.setDepth(200);
    building.add(namePlate);

    // Add colored glow for game houses
    if (this.houseConfig.type === 'game') {
      const glow = this.scene.add.circle(0, 0, 50, this.villageColor, 0.2);
      building.add(glow);
      glow.setDepth(-1); // Behind the house
      this.glow = glow;
    }

    // Add the building container to this house container
    this.add(building);
    building.setDepth(100);

    // Store references
    this.buildingContainer = building;
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
    // Only show interaction for game houses
    if (this.houseConfig.type !== 'game') return;

    // Check if scene is still active
    if (!this.scene || !this.scene.tweens) return;

    // Add glow effect to building
    this.scene.tweens.add({
      targets: this.buildingContainer,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 200,
      ease: 'Power2'
    });

    // Bounce emoji if it exists
    if (this.emoji) {
      this.scene.tweens.add({
        targets: this.emoji,
        y: this.emoji.y - 10,
        duration: 300,
        yoyo: true,
        ease: 'Sine.easeInOut'
      });
    }

    // Pulse glow
    if (this.glow) {
      this.scene.tweens.add({
        targets: this.glow,
        alpha: 0.4,
        scale: 1.2,
        duration: 300,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  onPlayerExit() {
    // Check if scene is still active
    if (!this.scene || !this.scene.tweens) return;

    // Remove glow effect
    this.scene.tweens.add({
      targets: this.buildingContainer,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: 'Power2'
    });

    // Stop glow pulse
    if (this.glow) {
      this.scene.tweens.killTweensOf(this.glow);
      this.scene.tweens.add({
        targets: this.glow,
        alpha: 0.2,
        scale: 1,
        duration: 200,
        ease: 'Power2'
      });
    }
  }

  enterHouse() {
    // This will be called when player presses E while nearby
    console.log(`Entering ${this.houseConfig.name}...`);
    
    // Only allow entering game houses
    if (this.houseConfig.type !== 'game') return;

    // Check if scene is still active
    if (!this.scene || !this.scene.tweens) return;

    // Add entrance animation
    this.scene.tweens.add({
      targets: this,
      scale: 1.2,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      onComplete: () => {
        // Trigger house entrance (can emit event here)
        this.scene.events.emit('houseEntered', this.houseConfig);
      }
    });
  }

  getConfig() {
    return this.houseConfig;
  }

  isGameHouse() {
    return this.houseConfig.type === 'game';
  }
}
