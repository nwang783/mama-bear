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
    const { BUILDING_WIDTH, BUILDING_HEIGHT, ROOF_HEIGHT } = GAME_CONFIG.VILLAGE;

    // Create building base
    const building = this.scene.add.rectangle(
      0, 
      0, 
      BUILDING_WIDTH, 
      BUILDING_HEIGHT, 
      this.villageConfig.color
    );
    building.setStrokeStyle(4, 0x000000);

    // Create roof (triangle)
    const roof = this.scene.add.triangle(
      0,
      -BUILDING_HEIGHT / 2 - ROOF_HEIGHT / 2,
      0,
      0,
      -BUILDING_WIDTH / 2 - 10,
      ROOF_HEIGHT,
      BUILDING_WIDTH / 2 + 10,
      ROOF_HEIGHT,
      this.villageConfig.color
    );
    roof.setStrokeStyle(4, 0x000000);

    // Add door
    const door = this.scene.add.rectangle(
      0,
      BUILDING_HEIGHT / 4,
      30,
      50,
      0x8b4513
    );
    door.setStrokeStyle(2, 0x000000);

    // Add windows
    const windowLeft = this.scene.add.rectangle(-30, -10, 25, 25, 0xffffff);
    windowLeft.setStrokeStyle(2, 0x000000);
    const windowRight = this.scene.add.rectangle(30, -10, 25, 25, 0xffffff);
    windowRight.setStrokeStyle(2, 0x000000);

    // Add emoji sign
    const emoji = this.scene.add.text(0, -BUILDING_HEIGHT / 2 - ROOF_HEIGHT - 20, this.villageConfig.emoji, {
      fontSize: '48px'
    });
    emoji.setOrigin(0.5);

    // Add village name plate
    const namePlate = this.scene.add.text(
      0,
      BUILDING_HEIGHT / 2 + 30,
      this.villageConfig.name,
      {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 15, y: 8 }
      }
    );
    namePlate.setOrigin(0.5);

    // Add path/ground in front of building
    const path = this.scene.add.rectangle(
      0,
      BUILDING_HEIGHT / 2 + 15,
      BUILDING_WIDTH + 40,
      20,
      0x8b7355
    );
    path.setStrokeStyle(2, 0x654321);
    path.setDepth(-1);

    // Add all to container
    this.add([path, building, roof, door, windowLeft, windowRight, emoji, namePlate]);

    // Store references
    this.building = building;
    this.roof = roof;
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
      targets: [this.building, this.roof],
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
      targets: [this.building, this.roof],
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
