import Phaser from 'phaser';

/**
 * Cute cat NPC that wanders slowly and shows retro speech bubbles.
 */
export default class CatNPC extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);

    this.scene = scene;
    this.speed = 45; // slow wander
    this.direction = new Phaser.Math.Vector2(0, 0);
    this.moveTimer = null;
    this.speechTimer = null;
    this.bubble = null;

    // add to scene + physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // size and bounds
    this.body.setCollideWorldBounds(true);
    this.body.setSize(24, 18);
    this.setDepth(95); // below player (100), above trees (5)

    // visuals
    this.createCatSprite();

    // start behaviors
    this.scheduleNextMove();
    this.scheduleNextSpeech();
  }

  createCatSprite() {
    // Draw a tiny pixel-y cat using Graphics so we don't depend on external assets
    const g = this.scene.add.graphics();
    g.setDepth(0);

    // Body
    g.fillStyle(0xf4a460, 1); // sandybrown
    g.fillRoundedRect(-10, -6, 20, 12, 3);

    // Head
    g.fillRoundedRect(-6, -14, 12, 12, 3);

    // Ears
    g.fillStyle(0xf4a460, 1);
    g.fillTriangle(-6, -14, -2, -14, -5, -20);
    g.fillTriangle(6, -14, 2, -14, 5, -20);

    // Eyes
    g.fillStyle(0x111111, 1);
    g.fillRect(-3, -10, 2, 2);
    g.fillRect(1, -10, 2, 2);

    // Tail
    g.fillStyle(0xf4a460, 1);
    g.fillRect(9, -4, 8, 3);

    this.add(g);
    this.catGraphics = g;
  }

  scheduleNextMove() {
    // Pick a new random move or idle every 1.5–3.5s
    const delay = Phaser.Math.Between(1500, 3500);
    this.moveTimer = this.scene.time.addEvent({
      delay,
      callback: () => {
        // 30% idle, 70% move
        if (Math.random() < 0.3) {
          this.direction.set(0, 0);
        } else {
          const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
          this.direction.set(Math.cos(angle), Math.sin(angle));
        }
        this.scheduleNextMove();
      },
      callbackScope: this
    });
  }

  scheduleNextSpeech() {
    const delay = Phaser.Math.Between(4000, 9000);
    this.speechTimer = this.scene.time.addEvent({
      delay,
      callback: () => {
        if (Math.random() < 0.65) {
          const msg = Phaser.Utils.Array.GetRandom([
            'meow',
            'purr...',
            'nya~',
            'zzz',
            'hello!',
            'so cozy',
            'let\'s play',
            'mama bear!'
          ]);
          this.showSpeechBubble(msg);
        }
        this.scheduleNextSpeech();
      },
      callbackScope: this
    });
  }

  showSpeechBubble(text) {
    // Destroy existing bubble
    if (this.bubble) {
      this.bubble.destroy(true);
      this.bubble = null;
    }

    const container = this.scene.add.container(0, -30);
    container.setDepth(300);

    // Text first to measure width
    const bubbleText = this.scene.add.text(0, 0, text, {
      fontFamily: '\'Press Start 2P\', monospace',
      fontSize: '10px',
      color: '#ffffff',
      stroke: '#1b1b1b',
      strokeThickness: 3,
      align: 'center',
      resolution: 2
    });
    bubbleText.setOrigin(0.5);

    const paddingX = 8;
    const paddingY = 6;
    const w = Math.max(40, bubbleText.width + paddingX * 2);
    const h = Math.max(18, bubbleText.height + paddingY * 2);

    // Pixel-y bubble using Graphics (black bg + yellow border)
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000000, 0.85);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 3);
    bg.lineStyle(3, 0xf9f871, 1); // retro yellow border
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 3);

    // Tail
    const tail = this.scene.add.graphics();
    tail.fillStyle(0x000000, 0.85);
    tail.fillTriangle(-6, h / 2 - 1, 6, h / 2 - 1, 0, h / 2 + 8);
    tail.lineStyle(3, 0xf9f871, 1);
    tail.strokeTriangle(-6, h / 2 - 1, 6, h / 2 - 1, 0, h / 2 + 8);

    container.add([bg, tail, bubbleText]);

    // Attach to cat
    this.add(container);
    this.bubble = container;

    // Auto fade out
    this.scene.tweens.add({
      targets: container,
      alpha: 0,
      delay: 1700,
      duration: 400,
      onComplete: () => container.destroy()
    });
  }

  keepInWorld() {
    const body = this.body;
    if (!body) return;

    // Nudge back if at edges
    const margin = 10;
    if (body.x < margin) this.direction.x = Math.abs(this.direction.x);
    if (body.y < margin) this.direction.y = Math.abs(this.direction.y);

    const maxX = this.scene.physics.world.bounds.width - body.width - margin;
    const maxY = this.scene.physics.world.bounds.height - body.height - margin;

    if (body.x > maxX) this.direction.x = -Math.abs(this.direction.x);
    if (body.y > maxY) this.direction.y = -Math.abs(this.direction.y);
  }

  update() {
    if (!this.body) return;

    // apply velocity
    const vx = this.direction.x * this.speed;
    const vy = this.direction.y * this.speed;
    this.body.setVelocity(vx, vy);

    // subtle bob while moving
    if (vx !== 0 || vy !== 0) {
      const t = this.scene.time.now;
      const bob = Math.sin(t / 200) * 0.5;
      this.setScale(1 + bob * 0.02);
    } else {
      this.setScale(1);
    }

    this.keepInWorld();
  }

  destroy(fromScene) {
    if (this.moveTimer) this.moveTimer.remove();
    if (this.speechTimer) this.speechTimer.remove();
    if (this.bubble) this.bubble.destroy(true);
    super.destroy(fromScene);
  }
}