import Phaser from 'phaser';

/**
 * ChatBotNPC - A special cat NPC that the player can interact with to open ChatScene
 * Distinct from wandering CatNPC - this one stays in place and shows interaction prompt
 */
export default class ChatBotNPC extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);

    this.scene = scene;
    this.interactionRadius = 60;
    this.isPlayerNearby = false;
    this.promptText = null;

    // add to scene + physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // size and bounds
    this.body.setSize(32, 24);
    this.body.setImmovable(true);
    this.setDepth(96); // slightly above normal cats

    // visuals
    this.createChatBotSprite();
    this.createPrompt();

    // Floating animation
    this.scene.tweens.add({
      targets: this,
      y: y - 5,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  createChatBotSprite() {
    // Warm tabby palette
    const FUR = 0xd4a373;
    const FUR_SHADE = 0xb07d4f;
    const INNER_EAR = 0xf2cda0;
    const OUTLINE = 0x5c4033;
    const EYE_WHITE = 0xffffff;
    const EYE_PUPIL = 0x1b1b1b;
    const ACCENT = 0xffd700;

    // Shadow
    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x000000, 0.25);
    shadow.fillEllipse(0, 6, 28, 8);

    const g = this.scene.add.graphics();
    g.setDepth(0);

    // Body
    g.fillStyle(FUR, 1);
    g.fillRoundedRect(-12, -6, 24, 14, 6);
    g.lineStyle(2, OUTLINE, 1);
    g.strokeRoundedRect(-12, -6, 24, 14, 6);

    // Head
    g.fillStyle(FUR, 1);
    g.fillRoundedRect(-8, -16, 16, 14, 6);
    g.lineStyle(2, OUTLINE, 1);
    g.strokeRoundedRect(-8, -16, 16, 14, 6);

    // Ears (with inner color)
    g.fillStyle(FUR, 1);
    g.fillTriangle(-8, -16, -4, -16, -7, -22);
    g.fillTriangle(8, -16, 4, -16, 7, -22);
    g.fillStyle(INNER_EAR, 1);
    g.fillTriangle(-7.2, -16, -4.8, -16, -6.8, -20);
    g.fillTriangle(7.2, -16, 4.8, -16, 6.8, -20);

    // Tail
    g.fillStyle(FUR, 1);
    g.fillRoundedRect(10, -4, 10, 4, 2);
    g.lineStyle(2, OUTLINE, 1);
    g.strokeRoundedRect(10, -4, 10, 4, 2);

    // Stripes
    g.lineStyle(1, FUR_SHADE, 1);
    g.beginPath();
    g.moveTo(-6, -3); g.lineTo(-2, -3);
    g.moveTo(2, -2); g.lineTo(6, -2);
    g.strokePath();

    // Eyes
    g.fillStyle(EYE_WHITE, 1);
    g.fillRect(-5, -12, 3, 3);
    g.fillRect(2, -12, 3, 3);
    g.fillStyle(EYE_PUPIL, 1);
    g.fillRect(-4, -11, 1, 1);
    g.fillRect(3, -11, 1, 1);

    // Mouth
    g.lineStyle(1, OUTLINE, 1);
    g.beginPath();
    g.arc(0, -8, 3, 0, Math.PI, false);
    g.strokePath();

    // Chat bubble icon above head
    const bubbleIcon = this.scene.add.graphics();
    bubbleIcon.fillStyle(0x11121b, 0.9);
    bubbleIcon.fillRoundedRect(-6, -32, 12, 8, 2);
    bubbleIcon.fillTriangle(-2, -24, 2, -24, 0, -20);
    bubbleIcon.lineStyle(1, ACCENT, 1);
    bubbleIcon.strokeRoundedRect(-6, -32, 12, 8, 2);
    
    // "..." inside bubble
    bubbleIcon.fillStyle(ACCENT, 1);
    for (let i = -3; i <= 3; i += 3) {
      bubbleIcon.fillCircle(i, -28, 1);
    }

    this.add([shadow, g, bubbleIcon]);
    this.catGraphics = g;
    this.bubbleGraphics = bubbleIcon;

    // Animate bubble pulsing
    this.scene.tweens.add({
      targets: bubbleIcon,
      alpha: 0.6,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  createPrompt() {
    // Create "Press E to Chat" prompt (hidden initially)
    this.promptText = this.scene.add.text(0, -50, 'Press E to Chat', {
      fontFamily: "'Press Start 2P', monospace",
      fontSize: '10px',
      color: '#ffffff',
      stroke: '#1b1b1b',
      strokeThickness: 3,
      align: 'center',
      resolution: 2
    });
    this.promptText.setOrigin(0.5);
    this.promptText.setAlpha(0);
    this.promptText.setDepth(300);
    this.add(this.promptText);
  }

  checkPlayerProximity(playerX, playerY) {
    const distance = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY);
    const wasNearby = this.isPlayerNearby;
    this.isPlayerNearby = distance < this.interactionRadius;

    // Show/hide prompt
    if (this.isPlayerNearby && !wasNearby) {
      this.showPrompt();
    } else if (!this.isPlayerNearby && wasNearby) {
      this.hidePrompt();
    }

    return this.isPlayerNearby;
  }

  showPrompt() {
    if (!this.promptText) return;
    this.scene.tweens.add({
      targets: this.promptText,
      alpha: 1,
      duration: 200,
      ease: 'Power2'
    });
  }

  hidePrompt() {
    if (!this.promptText) return;
    this.scene.tweens.add({
      targets: this.promptText,
      alpha: 0,
      duration: 200,
      ease: 'Power2'
    });
  }

  openChat() {
    // Transition to ChatScene
    const returnScene = this.scene.scene.key;
    const villageConfig = this.scene.villageConfig;
    
    console.log('Opening ChatScene from', returnScene);
    this.scene.scene.start('ChatScene', { returnScene, villageConfig });
  }

  update() {
    // ChatBot is stationary, no update needed
  }

  destroy(fromScene) {
    if (this.promptText) {
      this.promptText.destroy();
    }
    super.destroy(fromScene);
  }
}
