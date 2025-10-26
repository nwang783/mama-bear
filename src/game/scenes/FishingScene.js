import Phaser from 'phaser';
import Player from '../entities/Player';

/**
 * Fishing Minigame Scene
 * Player navigates a cat sprite to catch fish with answer letters
 * Modular design - accepts questions and return scene as parameters
 */
export default class FishingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'FishingScene' });
    
    // Game state
    this.score = 0;
    this.lives = 3;
    this.currentQuestionIndex = 0;
    this.timeRemaining = 60;
    this.isGameOver = false;
    this.isPaused = false;
    
    // Game objects
    this.player = null;
    this.fish = [];
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
    this.fish = [];
  }

  create() {
    // Use full canvas height for world/camera to avoid bottom gap
    const canvasWidth = this.scale.width || 800;
    const canvasHeight = this.scale.height || 600;

    // Set world bounds
    this.physics.world.setBounds(0, 0, canvasWidth, canvasHeight);

    // Create underwater background
    this.createBackground();

    // Create UI elements
    this.createUI();

    // Create player (cat sprite)
    this.createPlayer();

    // Display first question
    this.displayQuestion();

    // Setup camera to match full canvas so background fills screen
    this.cameras.main.setBounds(0, 0, canvasWidth, canvasHeight);
    this.cameras.main.setZoom(1.0);

    // Setup pause key
    this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // Create pause menu (hidden initially)
    this.createPauseMenu();

    // Start timer after a brief delay
    this.time.delayedCall(500, () => {
      this.startTimer();
    });
  }

  createBackground() {
    const tileSize = 16;
    const width = this.scale.width || 800;
    const height = this.scale.height || 600;
    const tilesX = Math.ceil(width / tileSize);
    const tilesY = Math.ceil(height / tileSize);

    // Restore to previous dirt level (bottom 6 tiles: 5 dirt + 1 dirt_top)
    const dirtStartY = tilesY - 6;

    // Cache water bounds for other systems
    this.waterTopY = 140; // leave space for question panel/UI
    this.waterBottomY = dirtStartY * tileSize;

    // Fill with water background
    for (let x = 0; x < tilesX; x++) {
      for (let y = 0; y < dirtStartY; y++) {
        const waterTile = this.add.image(x * tileSize, y * tileSize, 'background_terrain');
        waterTile.setOrigin(0, 0);
        waterTile.setDepth(-100);
      }
    }

    // Top layer of dirt (terrain_dirt_top_a-d variants)
    for (let x = 0; x < tilesX; x++) {
      const variant = String.fromCharCode(97 + Phaser.Math.Between(0, 3)); // a, b, c, or d
      const dirtTop = this.add.image(x * tileSize, dirtStartY * tileSize, `terrain_dirt_top_${variant}`);
      dirtTop.setOrigin(0, 0);
      dirtTop.setDepth(-90);
    }

    // Bottom 9 layers of dirt (terrain_dirt_a-d variants)
    for (let x = 0; x < tilesX; x++) {
      for (let y = dirtStartY + 1; y < tilesY; y++) {
        const variant = String.fromCharCode(97 + Phaser.Math.Between(0, 3)); // a, b, c, or d
        const dirt = this.add.image(x * tileSize, y * tileSize, `terrain_dirt_${variant}`);
        dirt.setOrigin(0, 0);
        dirt.setDepth(-90);
      }
    }

    // Add decorative elements: bubbles, seaweed, rocks
    this.addUnderwaterDecor();
  }

  addUnderwaterDecor() {
    const width = this.scale.width || 800;
    // Add bubbles scattered throughout (avoid question panel and dirt)
    for (let i = 0; i < 16; i++) {
      const bubbleX = Phaser.Math.Between(20, width - 20);
      const bubbleY = Phaser.Math.Between(this.waterTopY + 10, this.waterBottomY - 20);
      const bubbleType = String.fromCharCode(97 + Phaser.Math.Between(0, 2)); // a, b, or c
      
      const bubble = this.add.image(bubbleX, bubbleY, `bubble_${bubbleType}`);
      bubble.setDepth(-50);
      bubble.setAlpha(0.7);
      
      // Animate bubbles floating upward
      this.tweens.add({
        targets: bubble,
        y: bubbleY - 100,
        alpha: 0,
        duration: Phaser.Math.Between(3000, 6000),
        ease: 'Sine.easeInOut',
        repeat: -1,
        onRepeat: () => {
          bubble.y = bubbleY;
          bubble.alpha = 0.7;
        }
      });
    }

    // Add seaweed sitting on top of the dirt
    for (let i = 0; i < 8; i++) {
      const seaweedX = Phaser.Math.Between(50, (this.scale.width || 800) - 50);
      const seaweedY = this.waterBottomY;
      const seaweedType = String.fromCharCode(97 + Phaser.Math.Between(0, 7)); // a-h variants
      
      const seaweed = this.add.image(seaweedX, seaweedY, `background_seaweed_${seaweedType}`);
      seaweed.setDepth(-80);
      seaweed.setOrigin(0.5, 1);
      
      // Gentle sway animation
      this.tweens.add({
        targets: seaweed,
        angle: Phaser.Math.Between(-8, 8),
        duration: Phaser.Math.Between(2000, 4000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Add rocks just above the dirt
    for (let i = 0; i < 6; i++) {
      const rockX = Phaser.Math.Between(50, (this.scale.width || 800) - 50);
      const rockY = this.waterBottomY - Phaser.Math.Between(6, 18);
      const rockType = Phaser.Math.Between(0, 1) === 0 ? 'a' : 'b';
      
      const rock = this.add.image(rockX, rockY, `background_rock_${rockType}`);
      rock.setDepth(-70);
    }
  }

  createUI() {
    // Question panel at top - using stone background
    this.questionPanelContainer = this.add.container(400, 50);
    this.questionPanelContainer.setDepth(1000);
    this.questionPanelContainer.setScrollFactor(0);
    
    // Create stone background for question panel
    this.createStoneBackground(this.questionPanelContainer, 0, 0, 48, 6);

    // Question text
    this.questionText = this.add.text(0, -30, '', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#000000',
      stroke: '#ffffff',
      strokeThickness: 2,
      align: 'center',
      wordWrap: { width: 700 }
    });
    this.questionText.setOrigin(0.5);
    this.questionPanelContainer.add(this.questionText);

    // Choice texts
    this.choiceTexts = [];
    for (let i = 0; i < 4; i++) {
      const x = -270 + i * 180;
      const y = 10;
      const choiceText = this.add.text(x, y, '', {
        fontSize: '13px',
        fontFamily: 'Arial',
        color: '#000000',
        stroke: '#ffffff',
        strokeThickness: 2,
        align: 'center'
      });
      choiceText.setOrigin(0.5);
      this.questionPanelContainer.add(choiceText);
      this.choiceTexts.push(choiceText);
    }

    // Score display
    this.scoreContainer = this.add.container(80, 115);
    this.scoreContainer.setDepth(1001);
    this.scoreContainer.setScrollFactor(0);
    this.createStoneBackground(this.scoreContainer, 0, 0, 7, 2);
    
    this.scoreText = this.add.text(0, 0, 'Score: 0', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#000000',
      stroke: '#ffffff',
      strokeThickness: 2,
      fontStyle: 'bold'
    });
    this.scoreText.setOrigin(0.5);
    this.scoreContainer.add(this.scoreText);

    // Lives display
    this.livesContainer = this.add.container(720, 115);
    this.livesContainer.setDepth(1001);
    this.livesContainer.setScrollFactor(0);
    this.createStoneBackground(this.livesContainer, 0, 0, 4, 2);
    
    this.livesText = this.add.text(0, 0, '❤️ 3', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#000000',
      stroke: '#ffffff',
      strokeThickness: 2,
      fontStyle: 'bold'
    });
    this.livesText.setOrigin(0.5);
    this.livesContainer.add(this.livesText);

    // Timer display
    this.timerContainer = this.add.container(400, 115);
    this.timerContainer.setDepth(1001);
    this.timerContainer.setScrollFactor(0);
    this.createStoneBackground(this.timerContainer, 0, 0, 6, 2);
    
    this.timerText = this.add.text(0, 0, `Time: ${this.timeRemaining}s`, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#000000',
      stroke: '#ffffff',
      strokeThickness: 2,
      fontStyle: 'bold'
    });
    this.timerText.setOrigin(0.5);
    this.timerContainer.add(this.timerText);

    // Instructions
    this.instructionsText = this.add.text(400, 155, 'Move with WASD/Arrows • Catch the fish with the right answer!', {
      fontSize: '11px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
      backgroundColor: '#00000088',
      padding: { x: 8, y: 3 }
    });
    this.instructionsText.setOrigin(0.5);
    this.instructionsText.setDepth(1000);
    this.instructionsText.setScrollFactor(0);

    // Pause hint
    this.pauseHintText = this.add.text(400, 175, 'Press ESC to Pause', {
      fontSize: '10px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
      backgroundColor: '#00000088',
      padding: { x: 6, y: 2 }
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
    // Use the Player class - cat sprite starts in middle
    this.player = new Player(this, 400, 300);
    this.player.setDepth(200);
  }

  createPauseMenu() {
    // Create pause menu container (hidden by default)
    this.pauseMenuContainer = this.add.container(400, 225);
    this.pauseMenuContainer.setDepth(5000);
    this.pauseMenuContainer.setScrollFactor(0);
    this.pauseMenuContainer.setVisible(false);

    // Stone background
    this.createStoneBackground(this.pauseMenuContainer, 0, 0, 20, 22);

    // Pause title
    const pauseTitle = this.add.text(0, -130, 'PAUSED', {
      fontSize: '40px',
      fontFamily: 'Arial',
      color: '#ffdd44',
      stroke: '#000000',
      strokeThickness: 5
    });
    pauseTitle.setOrigin(0.5);
    this.pauseMenuContainer.add(pauseTitle);

    // Current stats
    const statsText = this.add.text(0, -60, '', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 8,
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
    const restartButton = this.add.text(0, 85, 'Restart Game', {
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
    const backButton = this.add.text(0, 150, 'Back to Village', {
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
    // Create stone tile background for signs/menus (same as FruitCollectorScene)
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

    // Clear existing fish
    this.fish.forEach(f => {
      if (f.sprite) f.sprite.destroy();
      if (f.text) f.text.destroy();
    });
    this.fish = [];

    // Create fish for each choice
    this.spawnFish();
  }

  spawnFish() {
    // Fish color options
    const fishColors = ['blue', 'green', 'orange', 'brown'];
    const letters = ['A', 'B', 'C', 'D'];

    const minY = this.waterTopY + 30;
    const maxY = this.waterBottomY - 30;

    this.currentQuestion.choices.forEach((choice, index) => {
      // Randomly select a fish color
      const fishColor = Phaser.Math.RND.pick(fishColors);
      const fishKey = `fish_${fishColor}_outline`;
      
      // Start fish off-screen on the left, at varied heights
      const startX = -50;
      const y = Phaser.Math.Between(minY, maxY);
      
      // Create fish sprite
      const fishSprite = this.add.image(startX, y, fishKey);
      fishSprite.setScale(1.2); // Reduced from 2.0 to 1.2
      fishSprite.setDepth(150);

      // Add letter text on fish
      const letterText = this.add.text(startX, y, letters[index], {
        fontSize: '20px', // Reduced from 32px to 20px
        fontFamily: 'Arial',
        color: '#000000',
        stroke: '#ffffff',
        strokeThickness: 3, // Reduced from 4 to 3
        fontStyle: 'bold'
      });
      letterText.setOrigin(0.5);
      letterText.setDepth(151);

      // Enable physics on the fish sprite
      this.physics.add.existing(fishSprite, false); // Dynamic body
      fishSprite.body.setVelocityX(Phaser.Math.Between(40, 80)); // Swim left to right
      fishSprite.body.setCollideWorldBounds(false); // Allow swimming off screen

      // Gentle bobbing animation
      this.tweens.add({
        targets: fishSprite,
        y: y + 8,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Store fish data
      this.fish.push({
        sprite: fishSprite,
        text: letterText,
        choiceIndex: index,
        isCorrect: index === this.currentQuestion.correctIndex
      });
    });

    console.log(`Spawned ${this.fish.length} fish`);
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

    // Update player
    if (this.player) {
      this.player.update();
    }

    // Update fish positions (move text with sprite) and check for wrapping
    this.fish.forEach(f => {
      if (f.sprite && f.text) {
        f.text.x = f.sprite.x;
        f.text.y = f.sprite.y;

        // If fish swims off right side, wrap to left
        if (f.sprite.x > (this.scale.width || 800) + 50) {
          f.sprite.x = -50;
          f.sprite.y = Phaser.Math.Between(this.waterTopY + 30, this.waterBottomY - 30);
          f.text.x = f.sprite.x;
          f.text.y = f.sprite.y;
        }
      }
    });

    // Check for fish catching
    this.checkFishCatch();
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      // Show pause menu
      this.pauseMenuContainer.setVisible(true);
      this.pauseMenuContainer.setAlpha(1);
      
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

  checkFishCatch() {
    if (!this.player) return;

    const playerPos = this.player.getPosition();

    this.fish.forEach(f => {
      if (!f.sprite) return;

      const distance = Phaser.Math.Distance.Between(
        playerPos.x,
        playerPos.y,
        f.sprite.x,
        f.sprite.y
      );

      // Check if player collides with fish (automatic catch)
      if (distance < 50) {
        this.catchFish(f);
      }
    });
  }

  catchFish(fish) {
    if (fish.isCorrect) {
      // Correct answer!
      this.score += 10;
      this.scoreText.setText(`Score: ${this.score}`);
      
      // Flash green
      this.cameras.main.flash(200, 0, 255, 0);

      // Move to next question
      this.currentQuestionIndex++;
      this.displayQuestion();
    } else {
      // Wrong answer
      this.lives--;
      this.livesText.setText(`❤️ ${this.lives}`);
      
      // Flash red
      this.cameras.main.flash(200, 255, 0, 0);

      if (this.lives <= 0) {
        this.endGame(false);
      }
    }

    // Remove caught fish
    if (fish.sprite) fish.sprite.destroy();
    if (fish.text) fish.text.destroy();
    
    const index = this.fish.indexOf(fish);
    if (index > -1) {
      this.fish.splice(index, 1);
    }
  }

  endGame(completed) {
    this.isGameOver = true;

    // Stop timer
    if (this.timerEvent) {
      this.timerEvent.remove();
    }

    // Clear fish
    this.fish.forEach(f => {
      if (f.sprite) f.sprite.destroy();
      if (f.text) f.text.destroy();
    });
    this.fish = [];

    // Calculate performance
    const questionsAnswered = this.currentQuestionIndex;
    const totalQuestions = this.questions.length;
    const percentage = totalQuestions > 0 ? Math.round((questionsAnswered / totalQuestions) * 100) : 0;

    // Create game over panel with stone background
    const gameOverContainer = this.add.container(400, 225);
    gameOverContainer.setDepth(2000);
    this.createStoneBackground(gameOverContainer, 0, 0, 20, 22);

    // Title
    const titleText = completed ? 'Completed!' : 'Game Over!';
    const titleColor = completed ? '#44ff44' : '#ff4444';
    const title = this.add.text(0, -130, titleText, {
      fontSize: '40px',
      fontFamily: 'Arial',
      color: titleColor,
      stroke: '#000000',
      strokeThickness: 5
    });
    title.setOrigin(0.5);
    gameOverContainer.add(title);

    // Stats
    const stats = this.add.text(0, -60,
      `Final Score: ${this.score}\nQuestions Answered: ${questionsAnswered}/${totalQuestions}\nAccuracy: ${percentage}%`, 
      {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
        align: 'center',
        lineSpacing: 8
      }
    );
    stats.setOrigin(0.5);
    gameOverContainer.add(stats);

    // Return button
    const returnButton = this.add.text(0, 20, 'Return to Village', {
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
    const retryButton = this.add.text(0, 85, 'Play Again', {
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
