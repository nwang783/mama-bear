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
    // Create player sprite from spritesheet
    this.sprite = this.scene.add.sprite(0, 0, 'player', 0);
    this.sprite.setScale(1); // 48x48 pixels at 1x scale

    // Add to container
    this.add(this.sprite);

    // Set initial animation
    this.sprite.play('idle-down');

    // Track animation state
    this.currentDirection = 'down';
    this.isMoving = false;
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

    // Update animations based on movement
    this.updateAnimation(velocityX, velocityY);
  }

  updateAnimation(velocityX, velocityY) {
    const isMoving = velocityX !== 0 || velocityY !== 0;

    if (isMoving) {
      // Determine direction and play appropriate animation
      if (Math.abs(velocityY) > Math.abs(velocityX)) {
        // Vertical movement is dominant
        if (velocityY < 0) {
          this.sprite.play('walk-up', true);
          this.currentDirection = 'up';
        } else {
          this.sprite.play('walk-down', true);
          this.currentDirection = 'down';
        }
        this.sprite.setFlipX(false);
      } else {
        // Horizontal movement is dominant
        this.sprite.play('walk-side', true);
        this.currentDirection = 'side';
        
        // Flip sprite based on direction
        if (velocityX < 0) {
          this.sprite.setFlipX(true); // Moving left
        } else {
          this.sprite.setFlipX(false); // Moving right
        }
      }
      this.isMoving = true;
    } else if (this.isMoving) {
      // Just stopped moving
      this.isMoving = false;
      
      // Play idle animation based on last direction
      if (this.currentDirection === 'up') {
        this.sprite.play('idle-up');
      } else if (this.currentDirection === 'side') {
        this.sprite.play('idle-side');
      } else {
        this.sprite.play('idle-down');
      }
    }
  }

  isInteractKeyPressed() {
    return Phaser.Input.Keyboard.JustDown(this.keys.E);
  }

  getPosition() {
    return { x: this.x, y: this.y };
  }
}
