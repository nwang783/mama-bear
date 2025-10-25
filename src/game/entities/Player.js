import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';

/**
 * Player character class with movement controls
 */
export default class Player extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Player appearance (bear emoji on a circle)
    this.createSprite();

    // Physics body setup
    this.body.setCollideWorldBounds(true);
    this.body.setSize(GAME_CONFIG.PLAYER.SIZE, GAME_CONFIG.PLAYER.SIZE);
    this.body.setDrag(500, 500); // Smooth deceleration

    // Movement properties
    this.speed = GAME_CONFIG.PLAYER.SPEED;
    this.cursors = null;
    this.keys = null;

    // Setup controls
    this.setupControls();

    // Depth for layering
    this.setDepth(100);
  }

  createSprite() {
    // Create player body (circle)
    const body = this.scene.add.circle(0, 0, GAME_CONFIG.PLAYER.SIZE / 2, GAME_CONFIG.PLAYER.COLOR);
    body.setStrokeStyle(3, 0x000000);

    // Add bear emoji
    const bearEmoji = this.scene.add.text(0, 0, '🐻', {
      fontSize: '36px'
    });
    bearEmoji.setOrigin(0.5);

    // Add to container
    this.add([body, bearEmoji]);

    // Store references
    this.bodyCircle = body;
    this.emoji = bearEmoji;
  }

  setupControls() {
    // Arrow keys
    this.cursors = this.scene.input.keyboard.createCursorKeys();

    // WASD keys
    this.keys = {
      W: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      E: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
    };
  }

  update() {
    if (!this.body) return;

    // Reset velocity
    let velocityX = 0;
    let velocityY = 0;

    // Check input and set velocity
    if (this.cursors.left.isDown || this.keys.A.isDown) {
      velocityX = -this.speed;
    } else if (this.cursors.right.isDown || this.keys.D.isDown) {
      velocityX = this.speed;
    }

    if (this.cursors.up.isDown || this.keys.W.isDown) {
      velocityY = -this.speed;
    } else if (this.cursors.down.isDown || this.keys.S.isDown) {
      velocityY = this.speed;
    }

    // Normalize diagonal movement
    if (velocityX !== 0 && velocityY !== 0) {
      const diagonal = Math.sqrt(2);
      velocityX /= diagonal;
      velocityY /= diagonal;
    }

    // Apply velocity
    this.body.setVelocity(velocityX, velocityY);

    // Visual feedback - slightly tilt when moving
    if (velocityX !== 0 || velocityY !== 0) {
      this.bodyCircle.setScale(1.05);
      
      // Slight rotation based on direction
      if (velocityX < 0) {
        this.emoji.setAngle(-5);
      } else if (velocityX > 0) {
        this.emoji.setAngle(5);
      } else {
        this.emoji.setAngle(0);
      }
    } else {
      this.bodyCircle.setScale(1);
      this.emoji.setAngle(0);
    }
  }

  isInteractKeyPressed() {
    return Phaser.Input.Keyboard.JustDown(this.keys.E);
  }

  getPosition() {
    return { x: this.x, y: this.y };
  }
}
