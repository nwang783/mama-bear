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
      'Loading...',
      {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#ffffff'
      }
    );
    loadingText.setOrigin(0.5);

    // Here you would load any assets (images, spritesheets, audio, etc.)
    // For now, we're using emoji and simple shapes, so no assets needed
    
    // Example for future:
    // this.load.image('tree', 'assets/tree.png');
    // this.load.spritesheet('player', 'assets/player.png', { frameWidth: 32, frameHeight: 32 });
  }

  create() {
    // Initialize game data or global state here if needed
    
    // Start the main world scene
    this.scene.start('WorldScene');
    
    // Launch UI scene as overlay
    this.scene.launch('UIScene');
  }
}
