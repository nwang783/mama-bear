import Phaser from 'phaser';

class LobbyScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LobbyScene' });
    this.villages = [
      { name: 'Reading Village', x: 200, y: 300, color: 0x4ecdc4, emoji: '📚' },
      { name: 'Math Village', x: 400, y: 300, color: 0xffe66d, emoji: '🔢' },
      { name: 'Finance Village', x: 600, y: 300, color: 0xff6b6b, emoji: '💰' }
    ];
  }

  create() {
    // Add background
    this.cameras.main.setBackgroundColor('#87ceeb');

    // Add title
    const title = this.add.text(400, 50, 'Learning Lobby', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    title.setOrigin(0.5);

    // Add instructions
    const instructions = this.add.text(400, 120, 'Click on a village to start learning!', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    instructions.setOrigin(0.5);

    // Create villages
    this.createVillages();

    // Add decorative ground
    this.add.rectangle(400, 550, 800, 100, 0x228b22);
  }

  createVillages() {
    this.villages.forEach((village) => {
      // Create village container
      const container = this.add.container(village.x, village.y);

      // Create village building (simple rectangle with roof)
      const building = this.add.rectangle(0, 0, 120, 100, village.color);
      const roof = this.add.triangle(0, -50, 0, 0, -70, 50, 70, 50, village.color);
      roof.setStrokeStyle(2, 0x000000);

      // Add emoji
      const emoji = this.add.text(0, -10, village.emoji, {
        fontSize: '48px'
      });
      emoji.setOrigin(0.5);

      // Add village name
      const nameText = this.add.text(0, 80, village.name, {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      });
      nameText.setOrigin(0.5);

      // Add all elements to container
      container.add([roof, building, emoji, nameText]);

      // Make interactive
      building.setInteractive({ useHandCursor: true });
      building.on('pointerover', () => {
        building.setScale(1.1);
        roof.setScale(1.1);
      });
      building.on('pointerout', () => {
        building.setScale(1);
        roof.setScale(1);
      });
      building.on('pointerdown', () => {
        this.selectVillage(village);
      });

      // Add bounce animation
      this.tweens.add({
        targets: container,
        y: village.y - 10,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Math.random() * 1000
      });
    });
  }

  selectVillage(village) {
    console.log(`Selected: ${village.name}`);
    // For now, just show an alert
    // In the future, this will navigate to the actual game scene
    alert(`Welcome to ${village.name}! Game coming soon...`);
  }
}

export default LobbyScene;
