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
    // Set world bounds (much larger canvas for better gameplay)
    this.physics.world.setBounds(0, 0, 1200, 800);

    // Create background
    this.createBackground();

    // Create UI elements
    this.createUI();

    // Create player
    this.createPlayer();

    // Display first question
    this.displayQuestion();

    // Setup camera
    this.cameras.main.setBounds(0, 0, 1200, 800);
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
    const tilesX = Math.ceil(1200 / tileSize);
    const tilesY = Math.ceil(800 / tileSize);

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
    for (let i = 0; i < 12; i++) {
      const treeX = Phaser.Math.Between(50, 1150);
      const treeY = Phaser.Math.Between(50, 650);
      const treeType = Math.random() < 0.5 ? 'tile_0004' : 'tile_0005';
      const tree = this.add.image(treeX, treeY, treeType);
      tree.setDepth(-10);
    }
  }

  createUI() {
    // Question panel at top - using stone background
    const panelHeight = 160;
    const panelWidth = 1180;
    
    // Create container for question panel
    this.questionPanelContainer = this.add.container(600, 80);
    this.questionPanelContainer.setDepth(1000);
    this.questionPanelContainer.setScrollFactor(0);
    
    // Create stone background for question panel (73 tiles wide x 10 tiles tall)
    this.createStoneBackground(this.questionPanelContainer, 0, 0, 73, 10);

    // Question text
    this.questionText = this.add.text(0, -50, '', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#000000',
      stroke: '#ffffff',
      strokeThickness: 2,
      align: 'center',
      wordWrap: { width: 1000 }
    });
    this.questionText.setOrigin(0.5);
    this.questionPanelContainer.add(this.questionText);

    // Choice texts
    this.choiceTexts = [];
    for (let i = 0; i < 4; i++) {
      const x = -300 + (i % 2) * 600; // Relative to container center
      const y = 0 + Math.floor(i / 2) * 35; // Relative to container center
      const choiceText = this.add.text(x, y, '', {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#000000',
        stroke: '#ffffff',
        strokeThickness: 2,
        align: 'left'
      });
      choiceText.setOrigin(0.5);
      this.questionPanelContainer.add(choiceText);
      this.choiceTexts.push(choiceText);
    }

    // Score display (with stone background)
    this.scoreContainer = this.add.container(80, 190);
    this.scoreContainer.setDepth(1000);
    this.scoreContainer.setScrollFactor(0);
    this.createStoneBackground(this.scoreContainer, 0, 0, 10, 3);
    
    this.scoreText = this.add.text(0, 0, 'Score: 0', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#000000',
      stroke: '#ffffff',
      strokeThickness: 2
    });
    this.scoreText.setOrigin(0.5);
    this.scoreContainer.add(this.scoreText);

    // Lives display (with stone background)
    this.livesContainer = this.add.container(1120, 190);
    this.livesContainer.setDepth(1000);
    this.livesContainer.setScrollFactor(0);
    this.createStoneBackground(this.livesContainer, 0, 0, 7, 3);
    
    this.livesText = this.add.text(0, 0, '❤️ 3', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#000000',
      stroke: '#ffffff',
      strokeThickness: 2
    });
    this.livesText.setOrigin(0.5);
    this.livesContainer.add(this.livesText);

    // Timer display (with stone background)
    this.timerContainer = this.add.container(600, 190);
    this.timerContainer.setDepth(1000);
    this.timerContainer.setScrollFactor(0);
    this.createStoneBackground(this.timerContainer, 0, 0, 11, 3);
    
    this.timerText = this.add.text(0, 0, `Time: ${this.timeRemaining}s`, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#000000',
      stroke: '#ffffff',
      strokeThickness: 2
    });
    this.timerText.setOrigin(0.5);
    this.timerContainer.add(this.timerText);

    // Instructions (with stone background)
    this.instructionsContainer = this.add.container(600, 230);
    this.instructionsContainer.setDepth(1000);
    this.instructionsContainer.setScrollFactor(0);
    this.createStoneBackground(this.instructionsContainer, 0, 0, 40, 3);
    
    this.instructionsText = this.add.text(0, 0, 'Move with WASD/Arrows • Press SPACE to collect fruit', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#000000',
      stroke: '#ffffff',
      strokeThickness: 1
    });
    this.instructionsText.setOrigin(0.5);
    this.instructionsContainer.add(this.instructionsText);

    // Pause hint
    this.pauseHintText = this.add.text(600, 265, 'Press ESC to Pause', {
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
    // Start player in the middle area, clearly visible on screen
    this.player = new Player(this, 600, 550);
    this.player.setDepth(200);
    
    // Ensure player stays within bounds (already handled by Player class)
    // The Player class sets setCollideWorldBounds(true) in its constructor
  }

  createPauseMenu() {
    // Create pause menu container (hidden by default)
    this.pauseMenuContainer = this.add.container(600, 400);
    this.pauseMenuContainer.setDepth(5000); // Very high depth to be above everything
    this.pauseMenuContainer.setScrollFactor(0);
    this.pauseMenuContainer.setVisible(false);
    
    console.log('Pause menu created');

    // Create stone tile background (using Kenney tiles)
    this.createStoneBackground(this.pauseMenuContainer, 0, 0, 11, 8);

    // Pause title
    const pauseTitle = this.add.text(0, -130, 'PAUSED', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffdd44',
      stroke: '#000000',
      strokeThickness: 6
    });
    pauseTitle.setOrigin(0.5);
    this.pauseMenuContainer.add(pauseTitle);

    // Current stats
    const statsText = this.add.text(0, -60, '', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 6,
      stroke: '#000000',
      strokeThickness: 3
    });
    statsText.setOrigin(0.5);
    this.pauseMenuContainer.add(statsText);
    this.pauseStatsText = statsText;

    // Resume button
    const resumeButton = this.add.text(0, 20, 'Resume (ESC)', {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      backgroundColor: '#44aa44',
      padding: { x: 20, y: 10 }
    });
    resumeButton.setOrigin(0.5);
    resumeButton.setInteractive({ useHandCursor: true });
    resumeButton.on('pointerdown', () => this.togglePause());
    resumeButton.on('pointerover', () => {
      resumeButton.setStyle({ backgroundColor: '#55cc55' });
    });
    resumeButton.on('pointerout', () => {
      resumeButton.setStyle({ backgroundColor: '#44aa44' });
    });
    this.pauseMenuContainer.add(resumeButton);

    // Restart button
    const restartButton = this.add.text(0, 80, 'Restart Game', {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      backgroundColor: '#4488cc',
      padding: { x: 20, y: 10 }
    });
    restartButton.setOrigin(0.5);
    restartButton.setInteractive({ useHandCursor: true });
    restartButton.on('pointerdown', () => this.restartGame());
    restartButton.on('pointerover', () => {
      restartButton.setStyle({ backgroundColor: '#5599dd' });
    });
    restartButton.on('pointerout', () => {
      restartButton.setStyle({ backgroundColor: '#4488cc' });
    });
    this.pauseMenuContainer.add(restartButton);

    // Back to Village button
    const backButton = this.add.text(0, 140, 'Back to Village', {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      backgroundColor: '#cc8844',
      padding: { x: 20, y: 10 }
    });
    backButton.setOrigin(0.5);
    backButton.setInteractive({ useHandCursor: true });
    backButton.on('pointerdown', () => this.returnToVillage());
    backButton.on('pointerover', () => {
      backButton.setStyle({ backgroundColor: '#dd9955' });
    });
    backButton.on('pointerout', () => {
      backButton.setStyle({ backgroundColor: '#cc8844' });
    });
    this.pauseMenuContainer.add(backButton);
  }

  createStoneBackground(container, centerX, centerY, tilesWide, tilesHigh) {
    // Create stone tile background for signs/menus
    const tileSize = 16;
    const totalWidth = tilesWide * tileSize;
    const totalHeight = tilesHigh * tileSize;
    const startX = centerX - (totalWidth / 2);
    const startY = centerY - (totalHeight / 2);

    // Top row pattern: 96, 97, 97, ..., 98
    for (let col = 0; col < tilesWide; col++) {
      let tileNum;
      if (col === 0) {
        tileNum = 96; // Top-left corner
      } else if (col === tilesWide - 1) {
        tileNum = 98; // Top-right corner
      } else {
        tileNum = 97; // Top edge
      }
      const tile = this.add.image(
        startX + col * tileSize,
        startY,
        `tile_${tileNum.toString().padStart(4, '0')}`
      );
      tile.setOrigin(0, 0);
      container.add(tile);
    }

    // Middle rows pattern: 108, 109, 109, ..., 110
    for (let row = 1; row < tilesHigh - 1; row++) {
      for (let col = 0; col < tilesWide; col++) {
        let tileNum;
        if (col === 0) {
          tileNum = 108; // Left edge
        } else if (col === tilesWide - 1) {
          tileNum = 110; // Right edge
        } else {
          tileNum = 109; // Center fill
        }
        const tile = this.add.image(
          startX + col * tileSize,
          startY + row * tileSize,
          `tile_${tileNum.toString().padStart(4, '0')}`
        );
        tile.setOrigin(0, 0);
        container.add(tile);
      }
    }

    // Bottom row pattern: 120, 121, 121, ..., 122
    for (let col = 0; col < tilesWide; col++) {
      let tileNum;
      if (col === 0) {
        tileNum = 120; // Bottom-left corner
      } else if (col === tilesWide - 1) {
        tileNum = 122; // Bottom-right corner
      } else {
        tileNum = 121; // Bottom edge
      }
      const tile = this.add.image(
        startX + col * tileSize,
        startY + (tilesHigh - 1) * tileSize,
        `tile_${tileNum.toString().padStart(4, '0')}`
      );
      tile.setOrigin(0, 0);
      container.add(tile);
    }
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

    // Update choice texts (using letters A, B, C, D)
    const letters = ['A', 'B', 'C', 'D'];
    this.currentQuestion.choices.forEach((choice, index) => {
      this.choiceTexts[index].setText(`${letters[index]}. ${choice}`);
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
    const letters = ['A', 'B', 'C', 'D'];
    const spacing = 240;
    const startX = 240; // Start position
    const y = 450; // Position fruits in middle area

    this.currentQuestion.choices.forEach((choice, index) => {
      const x = startX + index * spacing;
      
      // Create fruit sprite (circle)
      const fruitColor = fruitColors[index % fruitColors.length];
      const fruitSprite = this.add.circle(x, y, 35, fruitColor);
      fruitSprite.setStrokeStyle(3, 0x000000);
      fruitSprite.setDepth(150); // Higher depth to ensure visibility

      // Add letter text on fruit (A, B, C, D)
      const letterText = this.add.text(x, y, letters[index], {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#000000',
        fontStyle: 'bold'
      });
      letterText.setOrigin(0.5);
      letterText.setDepth(151); // Higher depth than fruit

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
        text: letterText,
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

    console.log('Toggle pause:', this.isPaused);

    if (this.isPaused) {
      // Show pause menu
      this.pauseMenuContainer.setVisible(true);
      this.pauseMenuContainer.setAlpha(1); // Ensure it's fully visible
      
      // Update stats in pause menu
      const questionsAnswered = this.currentQuestionIndex;
      const totalQuestions = this.questions.length;
      this.pauseStatsText.setText(
        `Score: ${this.score}\n` +
        `Lives: ${this.lives}\n` +
        `Time: ${this.timeRemaining}s\n` +
        `Questions: ${questionsAnswered}/${totalQuestions}`
      );
      
      console.log('Pause menu should be visible now');
      
      // Pause physics
      this.physics.pause();
    } else {
      // Hide pause menu
      this.pauseMenuContainer.setVisible(false);
      
      console.log('Pause menu hidden');
      
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

    // Create game over panel with stone background
    const gameOverContainer = this.add.container(600, 400);
    gameOverContainer.setDepth(2000);
    this.createStoneBackground(gameOverContainer, 0, 0, 13, 10);

    // Title
    const titleText = completed ? 'Completed!' : 'Game Over!';
    const titleColor = completed ? '#44ff44' : '#ff4444';
    const title = this.add.text(0, -120, titleText, {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: titleColor,
      stroke: '#000000',
      strokeThickness: 6
    });
    title.setOrigin(0.5);
    gameOverContainer.add(title);

    // Stats
    const stats = this.add.text(0, -30, 
      `Final Score: ${this.score}\nQuestions Answered: ${questionsAnswered}/${totalQuestions}\nAccuracy: ${percentage}%`, 
      {
        fontSize: '22px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center',
        lineSpacing: 8
      }
    );
    stats.setOrigin(0.5);
    gameOverContainer.add(stats);

    // Return button
    const returnButton = this.add.text(0, 70, 'Return to Village', {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      backgroundColor: '#cc8844',
      padding: { x: 20, y: 10 }
    });
    returnButton.setOrigin(0.5);
    returnButton.setInteractive({ useHandCursor: true });
    
    returnButton.on('pointerdown', () => {
      this.returnToVillage();
    });

    returnButton.on('pointerover', () => {
      returnButton.setStyle({ backgroundColor: '#dd9955' });
    });

    returnButton.on('pointerout', () => {
      returnButton.setStyle({ backgroundColor: '#cc8844' });
    });
    
    gameOverContainer.add(returnButton);

    // Retry button
    const retryButton = this.add.text(0, 130, 'Play Again', {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      backgroundColor: '#4488cc',
      padding: { x: 20, y: 10 }
    });
    retryButton.setOrigin(0.5);
    retryButton.setInteractive({ useHandCursor: true });
    
    retryButton.on('pointerdown', () => {
      this.restartGame();
    });

    retryButton.on('pointerover', () => {
      retryButton.setStyle({ backgroundColor: '#5599dd' });
    });

    retryButton.on('pointerout', () => {
      retryButton.setStyle({ backgroundColor: '#4488cc' });
    });
    
    gameOverContainer.add(retryButton);
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
