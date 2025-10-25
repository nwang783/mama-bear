import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';

/**
 * UI overlay scene for HUD and prompts
 */
export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
    this.interactionPrompt = null;
    this.instructions = null;
  }

  create() {
    // Create semi-transparent background for instructions
    const instructionBg = this.add.rectangle(
      this.cameras.main.centerX,
      40,
      500,
      80,
      0x000000,
      0.6
    );
    instructionBg.setScrollFactor(0);
    instructionBg.setDepth(1000);

    // Create instruction text
    this.instructions = this.add.text(
      this.cameras.main.centerX,
      40,
      'Use WASD or Arrow Keys to move\nExplore and find villages!',
      {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ffffff',
        align: 'center'
      }
    );
    this.instructions.setOrigin(0.5);
    this.instructions.setScrollFactor(0);
    this.instructions.setDepth(1001);

    // Create interaction prompt (hidden initially)
    this.createInteractionPrompt();

    // Listen for events from WorldScene
    const worldScene = this.scene.get('WorldScene');
    if (worldScene) {
      worldScene.events.on('showInteractionPrompt', this.showInteractionPrompt, this);
      worldScene.events.on('hideInteractionPrompt', this.hideInteractionPrompt, this);
    }

    // Fade out instructions after a few seconds
    this.time.delayedCall(5000, () => {
      this.tweens.add({
        targets: [instructionBg, this.instructions],
        alpha: 0,
        duration: 1000,
        ease: 'Power2'
      });
    });
  }

  createInteractionPrompt() {
    // Container for the prompt
    const promptContainer = this.add.container(
      this.cameras.main.centerX,
      this.cameras.main.height - 100
    );
    promptContainer.setScrollFactor(0);
    promptContainer.setDepth(1000);
    promptContainer.setAlpha(0);

    // Background
    const bg = this.add.rectangle(0, 0, 400, 100, 0x000000, 0.8);
    bg.setStrokeStyle(3, 0xffd700);

    // Prompt text
    const promptText = this.add.text(
      0,
      -15,
      'Press E to Enter',
      {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffd700',
        fontStyle: 'bold',
        align: 'center'
      }
    );
    promptText.setOrigin(0.5);

    // Village name text
    const villageText = this.add.text(
      0,
      15,
      '',
      {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ffffff',
        align: 'center'
      }
    );
    villageText.setOrigin(0.5);

    // Key visual (E key)
    const keyBg = this.add.rectangle(-150, 0, 50, 50, 0x333333);
    keyBg.setStrokeStyle(2, 0xffd700);
    const keyText = this.add.text(-150, 0, 'E', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffd700',
      fontStyle: 'bold'
    });
    keyText.setOrigin(0.5);

    promptContainer.add([bg, keyBg, keyText, promptText, villageText]);

    // Store references
    this.interactionPrompt = {
      container: promptContainer,
      villageText: villageText,
      promptText: promptText
    };

    // Add pulsing animation
    this.tweens.add({
      targets: [keyBg, keyText],
      scale: 1.1,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  showInteractionPrompt(villageConfig) {
    if (!this.interactionPrompt) return;

    // Update text
    this.interactionPrompt.villageText.setText(villageConfig.name);

    // Fade in
    this.tweens.add({
      targets: this.interactionPrompt.container,
      alpha: 1,
      duration: 300,
      ease: 'Power2'
    });
  }

  hideInteractionPrompt() {
    if (!this.interactionPrompt) return;

    // Fade out
    this.tweens.add({
      targets: this.interactionPrompt.container,
      alpha: 0,
      duration: 300,
      ease: 'Power2'
    });
  }

  // Optional: Add minimap or compass in the future
  createMinimap() {
    // Placeholder for future minimap implementation
  }
}
