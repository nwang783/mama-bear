import Phaser from 'phaser';
import Player from '../entities/Player';

/**
 * Fruit Collector Minigame Scene
 * Player moves around to collect fruits with answer numbers
 * Modular design - accepts questions and return scene as parameters
 */
export default class FruitCollectorScene extends Phaser.Scene {
  constructor() {
    super({ key: 'FruitCollectorScene' });
    
    // Game state
    this.score = 0;
    this.lives = 3;
    this.currentQuestionIndex = 0;
    this.timeRemaining = 60;
    this.isGameOver = false;
    this.isPaused = false;
    
    // Game objects
    this.player = null;
    this.fruits = [];
    this.currentQuestion = null;
    
    // Config from init
    this.questions = [];
    this.returnScene = 'WorldScene';
    this.villageConfig = null;
  }

  init(data) {
    // Receive data from calling scene
    this.questions = data.questions || [];
    this.returnScene = data.returnScene || 'WorldScene';
    this.villageConfig = data.villageConfig || null;
    this.timeLimit = data.timeLimit || 60;
    
    // Reset game state
    this.score = 0;
    this.lives = 3;
    this.currentQuestionIndex = 0;
    this.timeRemaining = this.timeLimit;
    this.isGameOver = false;
    this.isPaused = false;
    this.fruits = [];
  }

  create() {
    // Set world bounds
    this.physics.world.setBounds(0, 0, 800, 900);

    // Create background
    this.createBackground();

    // Create UI elements
    this.createUI();

    // Create player
    this.createPlayer();

    // Display first question
    this.displayQuestion();

    // Setup camera
    this.cameras.main.setBounds(0, 0, 800, 900);
    this.cameras.main.setZoom(1);

    // Setup pause key
    this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // Create pause menu (hidden initially)
    this.createPauseMenu();

    // Start timer after a brief delay to ensure everything is loaded
    this.time.delayedCall(500, () => {
      this.startTimer();
    });
  }

  createBackground() {
    // Create tiled grass background
    const tileSize = 16;
    const tilesX = Math.ceil(800 / tileSize);
    const tilesY = Math.ceil(900 / tileSize);

    for (let x = 0; x < tilesX; x++) {
      for (let y = 0; y < tilesY; y++) {
        const rand = Math.random();
        let tileKey;
        if (rand < 0.7) {
          tileKey = 'tile_0000';
        } else if (rand < 0.98) {
          tileKey = 'tile_0001';
        } else {
          tileKey = 'tile_0002';
        }
        
        const grassTile = this.add.image(x * tileSize, y * tileSize, tileKey);
        grassTile.setOrigin(0, 0);
        grassTile.setDepth(-100);
      }
    }

    // Add some decorative trees
    for (let i = 0; i < 8; i++) {
      const treeX = Phaser.Math.Between(50, 750);
      const treeY = Phaser.Math.Between(50, 700);
      const treeType = Math.random() < 0.5 ? 'tile_0004' : 'tile_0005';
      const tree = this.add.image(treeX, treeY, treeType);
      tree.setDepth(-10);
    }
  }

  createUI() {
    // Question panel at top
    const panelHeight = 150;
    this.questionPanel = this.add.rectangle(400, panelHeight / 2, 780, panelHeight, 0x000000, 0.85);
    this.questionPanel.setDepth(1000);
    this.questionPanel.setScrollFactor(0);

    // Question text
    this.questionText = this.add.text(400, 40, '', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 700 }
    });
    this.questionText.setOrigin(0.5);
    this.questionText.setDepth(1001);
    this.questionText.setScrollFactor(0);

    // Choice texts
    this.choiceTexts = [];
    for (let i = 0; i < 4; i++) {
      const x = 200 + (i % 2) * 400;
      const y = 90 + Math.floor(i / 2) * 40;
      const choiceText = this.add.text(x, y, '', {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#ffff00',
        align: 'left'
      });
      choiceText.setOrigin(0.5);
      choiceText.setDepth(1001);
      choiceText.setScrollFactor(0);
      this.choiceTexts.push(choiceText);
    }

    // Score display
    this.scoreText = this.add.text(20, 160, 'Score: 0', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.scoreText.setDepth(1000);
    this.scoreText.setScrollFactor(0);

    // Lives display
    this.livesText = this.add.text(720, 160, '❤️ 3', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.livesText.setOrigin(1, 0);
    this.livesText.setDepth(1000);
    this.livesText.setScrollFactor(0);

    // Timer display
    this.timerText = this.add.text(400, 160, `Time: ${this.timeRemaining}s`, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.timerText.setOrigin(0.5, 0);
    this.timerText.setDepth(1000);
    this.timerText.setScrollFactor(0);

    // Instructions
    this.instructionsText = this.add.text(400, 195, 'Move with WASD/Arrows • Press SPACE to collect fruit', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 3 }
    });
    this.instructionsText.setOrigin(0.5, 0);
    this.instructionsText.setDepth(1000);
    this.instructionsText.setScrollFactor(0);

    // Pause hint
    this.pauseHintText = this.add.text(400, 220, 'Press ESC to Pause', {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
      backgroundColor: '#00000088',
      padding: { x: 8, y: 3 }
    });
    this.pauseHintText.setOrigin(0.5, 0);
    this.pauseHintText.setDepth(1000);
    this.pauseHintText.setScrollFactor(0);

    // Fade out pause hint after 3 seconds
    this.time.delayedCall(3000, () => {
      this.tweens.add({
        targets: this.pauseHintText,
        alpha: 0,
        duration: 1000
      });
    });
  }

  createPlayer() {
    // Use the Player class like village scenes do
    this.player = new Player(this, 400, 650);
    this.player.setDepth(200);
    
    // Ensure player stays within bounds (already handled by Player class)
    // The Player class sets setCollideWorldBounds(true) in its constructor
  }

  createPauseMenu() {
    // Create pause menu container (hidden by default)
    this.pauseMenuContainer = this.add.container(400, 450);
    this.pauseMenuContainer.setDepth(3000);
    this.pauseMenuContainer.setScrollFactor(0);
    this.pauseMenuContainer.setVisible(false);

    // Semi-transparent background
    const pauseBg = this.add.rectangle(0, 0, 600, 500, 0x000000, 0.95);
    this.pauseMenuContainer.add(pauseBg);

    // Pause title
    const pauseTitle = this.add.text(0, -180, 'PAUSED', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 4
    });
    pauseTitle.setOrigin(0.5);
    this.pauseMenuContainer.add(pauseTitle);

    // Current stats
    const statsText = this.add.text(0, -100, '', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 8
    });
    statsText.setOrigin(0.5);
    this.pauseMenuContainer.add(statsText);
    this.pauseStatsText = statsText;

    // Resume button
    const resumeButton = this.add.text(0, 0, 'Resume (ESC)', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#00ff00',
      backgroundColor: '#003300',
      padding: { x: 20, y: 10 }
    });
    resumeButton.setOrigin(0.5);
    resumeButton.setInteractive({ useHandCursor: true });
    resumeButton.on('pointerdown', () => this.togglePause());
    resumeButton.on('pointerover', () => {
      resumeButton.setStyle({ backgroundColor: '#005500' });
    });
    resumeButton.on('pointerout', () => {
      resumeButton.setStyle({ backgroundColor: '#003300' });
    });
    this.pauseMenuContainer.add(resumeButton);

    // Restart button
    const restartButton = this.add.text(0, 70, 'Restart Game', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#00ffff',
      backgroundColor: '#003333',
      padding: { x: 20, y: 10 }
    });
    restartButton.setOrigin(0.5);
    restartButton.setInteractive({ useHandCursor: true });
    restartButton.on('pointerdown', () => this.restartGame());
    restartButton.on('pointerover', () => {
      restartButton.setStyle({ backgroundColor: '#005555' });
    });
    restartButton.on('pointerout', () => {
      restartButton.setStyle({ backgroundColor: '#003333' });
    });
    this.pauseMenuContainer.add(restartButton);

    // Back to Village button
    const backButton = this.add.text(0, 140, 'Back to Village', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffff00',
      backgroundColor: '#333300',
      padding: { x: 20, y: 10 }
    });
    backButton.setOrigin(0.5);
    backButton.setInteractive({ useHandCursor: true });
    backButton.on('pointerdown', () => this.returnToVillage());
    backButton.on('pointerover', () => {
      backButton.setStyle({ backgroundColor: '#555500' });
    });
    backButton.on('pointerout', () => {
      backButton.setStyle({ backgroundColor: '#333300' });
    });
    this.pauseMenuContainer.add(backButton);
  }

  displayQuestion() {
    if (this.currentQuestionIndex >= this.questions.length) {
      // No more questions, end game
      this.endGame(true);
      return;
    }

    this.currentQuestion = this.questions[this.currentQuestionIndex];
    
    // Update question text
    this.questionText.setText(this.currentQuestion.question);

    // Update choice texts
    this.currentQuestion.choices.forEach((choice, index) => {
      this.choiceTexts[index].setText(`${index + 1}. ${choice}`);
    });

    // Clear existing fruits
    this.fruits.forEach(fruit => {
      if (fruit.sprite) fruit.sprite.destroy();
      if (fruit.text) fruit.text.destroy();
      if (fruit.glow) fruit.glow.destroy();
    });
    this.fruits = [];

    // Create fruits for each choice
    this.spawnFruits();
  }

  spawnFruits() {
    const fruitColors = [0xFF6B6B, 0xFFD93D, 0x6BCF7F, 0x4D96FF];
    const spacing = 160;
    const startX = 180; // Start further left
    const y = 380; // Position fruits higher up so they're fully visible

    this.currentQuestion.choices.forEach((choice, index) => {
      const x = startX + index * spacing;
      
      // Create fruit sprite (circle)
      const fruitColor = fruitColors[index % fruitColors.length];
      const fruitSprite = this.add.circle(x, y, 35, fruitColor);
      fruitSprite.setStrokeStyle(3, 0x000000);
      fruitSprite.setDepth(150); // Higher depth to ensure visibility

      // Add number text on fruit
      const numberText = this.add.text(x, y, (index + 1).toString(), {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#000000',
        fontStyle: 'bold'
      });
      numberText.setOrigin(0.5);
      numberText.setDepth(151); // Higher depth than fruit

      // Enable physics
      this.physics.add.existing(fruitSprite, true); // Static body

      // Add glow effect
      const glow = this.add.circle(x, y, 40, fruitColor, 0.3);
      glow.setDepth(149); // Just below fruit
      
      this.tweens.add({
        targets: glow,
        alpha: 0.1,
        scale: 1.2,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Store fruit data
      this.fruits.push({
        sprite: fruitSprite,
        text: numberText,
        glow: glow,
        choiceIndex: index,
        isCorrect: index === this.currentQuestion.correctIndex
      });
    });

    console.log(`Spawned ${this.fruits.length} fruits at y=${y}`);
  }

  startTimer() {
    // Countdown timer
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (this.isGameOver || this.isPaused) return;
        
        this.timeRemaining--;
        this.timerText.setText(`Time: ${this.timeRemaining}s`);
        
        if (this.timeRemaining <= 0) {
          this.endGame(false);
        }
      },
      callbackScope: this,
      loop: true
    });
  }

  update() {
    // Check for pause toggle
    if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
      this.togglePause();
    }

    if (this.isGameOver || this.isPaused) return;

    // Update player - the Player class handles its own movement
    if (this.player) {
      this.player.update();
    }

    // Check for fruit collection
    this.checkFruitCollection();
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      // Show pause menu
      this.pauseMenuContainer.setVisible(true);
      
      // Update stats in pause menu
      const questionsAnswered = this.currentQuestionIndex;
      const totalQuestions = this.questions.length;
      this.pauseStatsText.setText(
        `Score: ${this.score}\n` +
        `Lives: ${this.lives}\n` +
        `Time: ${this.timeRemaining}s\n` +
        `Questions: ${questionsAnswered}/${totalQuestions}`
      );
      
      // Pause physics
      this.physics.pause();
    } else {
      // Hide pause menu
      this.pauseMenuContainer.setVisible(false);
      
      // Resume physics
      this.physics.resume();
    }
  }

  restartGame() {
    // Unpause if paused
    if (this.isPaused) {
      this.isPaused = false;
      this.physics.resume();
    }
    
    // Restart the scene
    this.scene.restart();
  }

  checkFruitCollection() {
    if (!this.player) return;

    const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const playerPos = this.player.getPosition();

    this.fruits.forEach(fruit => {
      const distance = Phaser.Math.Distance.Between(
        playerPos.x,
        playerPos.y,
        fruit.sprite.x,
        fruit.sprite.y
      );

      // Check if player is near fruit and presses space
      if (distance < 60 && Phaser.Input.Keyboard.JustDown(spaceKey)) {
        this.collectFruit(fruit);
      }
    });
  }

  collectFruit(fruit) {
    if (fruit.isCorrect) {
      // Correct answer!
      this.score += 10;
      this.scoreText.setText(`Score: ${this.score}`);
      
      // Flash green
      this.cameras.main.flash(200, 0, 255, 0);
      
      // Play success sound (if available)
      // this.sound.play('success');

      // Move to next question
      this.currentQuestionIndex++;
      this.displayQuestion();
    } else {
      // Wrong answer
      this.lives--;
      this.livesText.setText(`❤️ ${this.lives}`);
      
      // Flash red
      this.cameras.main.flash(200, 255, 0, 0);
      
      // Play error sound (if available)
      // this.sound.play('error');

      if (this.lives <= 0) {
        this.endGame(false);
      }
    }

    // Remove collected fruit
    if (fruit.sprite) fruit.sprite.destroy();
    if (fruit.text) fruit.text.destroy();
    if (fruit.glow) fruit.glow.destroy();
    
    const index = this.fruits.indexOf(fruit);
    if (index > -1) {
      this.fruits.splice(index, 1);
    }
  }

  endGame(completed) {
    this.isGameOver = true;

    // Stop timer
    if (this.timerEvent) {
      this.timerEvent.remove();
    }

    // Clear fruits
    this.fruits.forEach(fruit => {
      if (fruit.sprite) fruit.sprite.destroy();
      if (fruit.text) fruit.text.destroy();
      if (fruit.glow) fruit.glow.destroy();
    });
    this.fruits = [];

    // Calculate performance
    const questionsAnswered = this.currentQuestionIndex;
    const totalQuestions = this.questions.length;
    const percentage = totalQuestions > 0 ? Math.round((questionsAnswered / totalQuestions) * 100) : 0;

    // Create game over panel
    const panelBg = this.add.rectangle(400, 450, 600, 400, 0x000000, 0.9);
    panelBg.setDepth(2000);

    // Title
    const titleText = completed ? 'Completed!' : 'Game Over!';
    const titleColor = completed ? '#00ff00' : '#ff0000';
    const title = this.add.text(400, 300, titleText, {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: titleColor,
      stroke: '#000000',
      strokeThickness: 4
    });
    title.setOrigin(0.5);
    title.setDepth(2001);

    // Stats
    const stats = this.add.text(400, 380, 
      `Final Score: ${this.score}\nQuestions Answered: ${questionsAnswered}/${totalQuestions}\nAccuracy: ${percentage}%`, 
      {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 10
      }
    );
    stats.setOrigin(0.5);
    stats.setDepth(2001);

    // Return button
    const returnButton = this.add.text(400, 520, 'Return to Village', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    returnButton.setOrigin(0.5);
    returnButton.setDepth(2001);
    returnButton.setInteractive({ useHandCursor: true });
    
    returnButton.on('pointerdown', () => {
      this.returnToVillage();
    });

    returnButton.on('pointerover', () => {
      returnButton.setStyle({ color: '#ffffff', backgroundColor: '#333333' });
    });

    returnButton.on('pointerout', () => {
      returnButton.setStyle({ color: '#ffff00', backgroundColor: '#000000' });
    });

    // Retry button
    const retryButton = this.add.text(400, 580, 'Play Again', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#00ffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    retryButton.setOrigin(0.5);
    retryButton.setDepth(2001);
    retryButton.setInteractive({ useHandCursor: true });
    
    retryButton.on('pointerdown', () => {
      this.restartGame();
    });

    retryButton.on('pointerover', () => {
      retryButton.setStyle({ color: '#ffffff', backgroundColor: '#333333' });
    });

    retryButton.on('pointerout', () => {
      retryButton.setStyle({ color: '#00ffff', backgroundColor: '#000000' });
    });
  }

  returnToVillage() {
    console.log(`Returning to ${this.returnScene}...`);
    
    // Fade out and return to the village scene
    this.cameras.main.fade(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(this.returnScene, { villageConfig: this.villageConfig });
    });
  }
}
