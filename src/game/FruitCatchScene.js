import Phaser from 'phaser';

class FruitCatchScene extends Phaser.Scene {
  constructor() {
    super({ key: 'FruitCatchScene' });
    this.score = 0;
    this.lives = 3;
    this.currentQuestion = null;
    this.fruits = [];
    this.bucket = null;
    this.fruitSpeed = 100; // Starting speed (faster)
    this.maxFruitSpeed = 200; // Maximum speed cap
    this.questionsAnswered = 0;
  }

  preload() {
    // Create simple shapes as placeholders for tree, fruits, and bucket
    this.createAssets();
  }

  create() {
    // Background
    this.cameras.main.setBackgroundColor('#87ceeb');

    // Draw tree
    this.drawTree();

    // Create bucket (player)
    this.bucket = this.add.rectangle(400, 530, 70, 60, 0x8B4513);
    this.bucket.setStrokeStyle(3, 0x000000);
    
    // Make bucket interactive
    this.input.on('pointermove', (pointer) => {
      this.bucket.x = Phaser.Math.Clamp(pointer.x, 50, 750);
    });

    // Score display
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });

    // Lives display
    this.livesText = this.add.text(700, 20, '❤️ ' + this.lives, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });

    // Question container at bottom
    this.questionBg = this.add.rectangle(400, 560, 760, 60, 0x000000, 0.7);
    this.questionText = this.add.text(400, 560, '', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'center'
    });
    this.questionText.setOrigin(0.5);

    // Generate first question
    this.generateQuestion();

    // Spawn fruits periodically
    this.time.addEvent({
      delay: 2000,
      callback: this.spawnFruit,
      callbackScope: this,
      loop: true
    });

    // Physics
    this.physics.world.setBounds(0, 0, 800, 600);
  }

  createAssets() {
    // This method creates simple graphic assets
    // In a real game, you would load actual images
  }

  drawTree() {
    // Tree trunk
    const trunk = this.add.rectangle(400, 100, 60, 120, 0x8B4513);
    trunk.setStrokeStyle(2, 0x000000);

    // Tree foliage (3 circles)
    const foliage1 = this.add.circle(370, 50, 50, 0x228B22);
    foliage1.setStrokeStyle(2, 0x000000);
    const foliage2 = this.add.circle(400, 30, 60, 0x2E8B57);
    foliage2.setStrokeStyle(2, 0x000000);
    const foliage3 = this.add.circle(430, 50, 50, 0x228B22);
    foliage3.setStrokeStyle(2, 0x000000);
  }

  generateQuestion() {
    // Simple math questions for demonstration
    const operations = ['+', '-', '×'];
    const operation = Phaser.Math.RND.pick(operations);
    
    let num1, num2, correctAnswer;
    
    if (operation === '+') {
      num1 = Phaser.Math.Between(1, 20);
      num2 = Phaser.Math.Between(1, 20);
      correctAnswer = num1 + num2;
    } else if (operation === '-') {
      num1 = Phaser.Math.Between(10, 30);
      num2 = Phaser.Math.Between(1, num1);
      correctAnswer = num1 - num2;
    } else { // multiplication
      num1 = Phaser.Math.Between(1, 10);
      num2 = Phaser.Math.Between(1, 10);
      correctAnswer = num1 * num2;
    }

    this.currentQuestion = {
      text: `${num1} ${operation} ${num2} = ?`,
      correctAnswer: correctAnswer
    };

    this.questionText.setText(this.currentQuestion.text);

    // Generate wrong answers
    this.possibleAnswers = [correctAnswer];
    while (this.possibleAnswers.length < 4) {
      const wrongAnswer = correctAnswer + Phaser.Math.Between(-5, 5);
      if (wrongAnswer !== correctAnswer && wrongAnswer > 0 && !this.possibleAnswers.includes(wrongAnswer)) {
        this.possibleAnswers.push(wrongAnswer);
      }
    }

    // Shuffle answers
    Phaser.Utils.Array.Shuffle(this.possibleAnswers);
  }

  spawnFruit() {
    if (!this.currentQuestion) return;

    // Pick a random answer
    const answer = Phaser.Math.RND.pick(this.possibleAnswers);
    
    // Random x position across wider range of screen
    const x = Phaser.Math.Between(100, 700);
    
    // Choose fruit color - all fruits look the same now!
    const isCorrect = answer === this.currentQuestion.correctAnswer;
    const fruitColors = [0xFF6347, 0xFFD700, 0xFF69B4, 0x9370DB, 0xFF8C00];
    const fruitColor = Phaser.Math.RND.pick(fruitColors);

    // Create fruit (circle)
    const fruit = this.add.circle(x, 80, 25, fruitColor);
    fruit.setStrokeStyle(2, 0x000000);

    // Add answer text on fruit
    const answerText = this.add.text(x, 80, answer.toString(), {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#000000',
      fontStyle: 'bold'
    });
    answerText.setOrigin(0.5);

    // Enable physics with increasing speed based on questions answered
    this.physics.add.existing(fruit);
    const speedVariation = Phaser.Math.Between(-10, 10);
    fruit.body.setVelocity(0, this.fruitSpeed + speedVariation);

    // Store answer and text reference
    fruit.answer = answer;
    fruit.answerText = answerText;
    fruit.isCorrect = isCorrect;

    this.fruits.push(fruit);
  }

  update() {
    // Check collisions and update fruit positions
    for (let i = this.fruits.length - 1; i >= 0; i--) {
      const fruit = this.fruits[i];
      
      // Update text position
      if (fruit.answerText) {
        fruit.answerText.setPosition(fruit.x, fruit.y);
      }

      // Check if fruit hits bucket
      if (this.checkCollision(fruit, this.bucket)) {
        this.catchFruit(fruit);
        this.fruits.splice(i, 1);
        continue;
      }

      // Remove if off screen
      if (fruit.y > 600) {
        if (fruit.isCorrect) {
          // Missed the correct answer
          this.loseLife();
        }
        fruit.destroy();
        if (fruit.answerText) {
          fruit.answerText.destroy();
        }
        this.fruits.splice(i, 1);
      }
    }
  }

  checkCollision(fruit, bucket) {
    const bounds1 = fruit.getBounds();
    const bounds2 = new Phaser.Geom.Rectangle(
      bucket.x - bucket.width / 2,
      bucket.y - bucket.height / 2,
      bucket.width,
      bucket.height
    );

    return Phaser.Geom.Intersects.RectangleToRectangle(bounds1, bounds2);
  }

  catchFruit(fruit) {
    const isCorrect = fruit.answer === this.currentQuestion.correctAnswer;

    if (isCorrect) {
      // Correct answer caught!
      this.score += 10;
      this.scoreText.setText('Score: ' + this.score);
      
      // Flash green
      this.cameras.main.flash(200, 0, 255, 0);

      // Increase difficulty - speed up fruits every 2 questions
      this.questionsAnswered += 1;
      if (this.questionsAnswered % 2 === 0 && this.fruitSpeed < this.maxFruitSpeed) {
        this.fruitSpeed += 8; // Increase speed by 8 pixels per second
      }

      // Remove all fruits with the correct answer from tracking
      // so we don't lose life if we miss the other correct answers
      for (let i = this.fruits.length - 1; i >= 0; i--) {
        if (this.fruits[i].answer === this.currentQuestion.correctAnswer) {
          this.fruits[i].isCorrect = false; // Mark as no longer correct
        }
      }

      // Generate new question
      this.generateQuestion();
    } else {
      // Wrong answer caught
      this.loseLife();
      
      // Flash red
      this.cameras.main.flash(200, 255, 0, 0);
    }

    // Destroy fruit
    fruit.destroy();
    if (fruit.answerText) {
      fruit.answerText.destroy();
    }
  }

  loseLife() {
    this.lives -= 1;
    this.livesText.setText('❤️ ' + this.lives);

    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  gameOver() {
    // Stop spawning
    this.time.removeAllEvents();

    // Clear all fruits
    this.fruits.forEach(fruit => {
      fruit.destroy();
      if (fruit.answerText) {
        fruit.answerText.destroy();
      }
    });
    this.fruits = [];

    // Game over text
    const gameOverText = this.add.text(400, 250, 'Game Over!', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#ff0000',
      stroke: '#000000',
      strokeThickness: 6
    });
    gameOverText.setOrigin(0.5);

    const finalScoreText = this.add.text(400, 330, 'Final Score: ' + this.score, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    finalScoreText.setOrigin(0.5);

    // Restart button
    const restartButton = this.add.text(400, 400, 'Click to Restart', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 3,
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    restartButton.setOrigin(0.5);
    restartButton.setInteractive({ useHandCursor: true });
    restartButton.on('pointerdown', () => {
      // Reset game state before restarting
      this.score = 0;
      this.lives = 3;
      this.fruitSpeed = 100;
      this.questionsAnswered = 0;
      this.currentQuestion = null;
      this.fruits = [];
      this.scene.restart();
    });
  }
}

export default FruitCatchScene;
