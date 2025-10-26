import Phaser from 'phaser';
import { getQuestionSetsBySubject } from '../../firebase/questionSetsService';
import { getQuestionsForSet } from '../../firebase/questionsService';
import { getLocalQuestionsBySubject } from '../config/questionProviders';

/**
 * Question Set Selection Scene
 * Shows available question sets for a subject
 * User selects one to play
 */
export default class QuestionSetSelectionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'QuestionSetSelectionScene' });
    
    this.questionSets = [];
    this.selectedSet = null;
    this.subject = 'earning';
    this.returnScene = 'EarningVillageScene';
    this.villageConfig = null;
    this.setButtons = [];
  }

  init(data) {
    this.subject = data.subject || 'earning';
    this.returnScene = data.returnScene || 'WorldScene';
    this.villageConfig = data.villageConfig || null;
    this.targetGameScene = data.targetGameScene || 'FruitCollectorScene';
  }

  async create() {
    // Create semi-transparent background overlay
    const bg = this.add.rectangle(400, 450, 800, 900, 0x000000, 0.8);
    bg.setDepth(0);

    // Show loading state while fetching sets
    this.showLoadingOverlay();

    try {
      // Fetch question sets from Firebase
      this.questionSets = await getQuestionSetsBySubject(this.subject, 3);
      
      this.hideLoadingOverlay();
      
      if (this.questionSets.length === 0) {
        // No sets found, show error and go back
        this.showNoSetsMessage();
      } else {
        // Create the selection UI
        this.createSelectionUI();
      }
    } catch (error) {
      console.error('Error loading question sets:', error);
      this.hideLoadingOverlay();
      this.showErrorMessage();
    }
  }

  showLoadingOverlay() {
    this.loadingContainer = this.add.container(400, 450);
    this.loadingContainer.setDepth(1000);

    const loadingText = this.add.text(0, 0, 'Loading Question Sets...', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    loadingText.setOrigin(0.5);
    this.loadingContainer.add(loadingText);

    const dots = this.add.text(0, 40, '...', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    dots.setOrigin(0.5);
    this.loadingContainer.add(dots);

    this.tweens.add({
      targets: dots,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }

  hideLoadingOverlay() {
    if (this.loadingContainer) {
      this.loadingContainer.destroy();
      this.loadingContainer = null;
    }
  }

  createSelectionUI() {
    // Main container centered in view (moved down 10 tiles = 160px from 210)
    const mainContainer = this.add.container(400, 370);
    mainContainer.setDepth(100);

    // Create stone background for modal (32 tiles wide x 34 tiles tall)
    this.createStoneBackground(mainContainer, 0, 0, 32, 34);

    // Title
    const emoji = this.getSubjectEmoji(this.subject);
    const title = this.add.text(0, -250, `${emoji} Choose Question Set`, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffdd44',
      stroke: '#000000',
      strokeThickness: 6,
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    mainContainer.add(title);

    // Create set cards
    const startY = -160;
    const cardSpacing = 120;

    this.questionSets.forEach((set, index) => {
      const cardY = startY + (index * cardSpacing);
      this.createSetCard(mainContainer, set, 0, cardY);
    });

    // Back button at bottom (moved closer to cards)
    this.createBackButton(mainContainer, 0, 180);
  }

  createSetCard(container, set, x, y) {
    const cardContainer = this.add.container(x, y);
    
    // Card background (smaller stone panel)
    this.createStoneBackground(cardContainer, 0, 0, 28, 6);

    // Set name
    const nameText = this.add.text(-200, -30, set.name, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      fontStyle: 'bold',
      wordWrap: { width: 250 }
    });
    nameText.setOrigin(0, 0.5);
    cardContainer.add(nameText);

    // Description
    const descText = this.add.text(-200, 0, set.description, {
      fontSize: '13px',
      fontFamily: 'Arial',
      color: '#dddddd',
      wordWrap: { width: 250 }
    });
    descText.setOrigin(0, 0.5);
    cardContainer.add(descText);

    // Stats line (upvotes + question count)
    const statsText = this.add.text(-200, 28, `👍 ${set.upvotes}  •  ${set.questionCount} Questions`, {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    });
    statsText.setOrigin(0, 0.5);
    cardContainer.add(statsText);

    // Difficulty badge
    const difficultyColor = this.getDifficultyColor(set.difficulty);
    const diffBadge = this.add.text(150, -30, set.difficulty.toUpperCase(), {
      fontSize: '11px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: difficultyColor,
      padding: { x: 8, y: 4 }
    });
    diffBadge.setOrigin(0.5);
    cardContainer.add(diffBadge);

    // Play button
    const playButton = this.add.text(150, 20, 'PLAY ▶', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      backgroundColor: '#44aa44',
      padding: { x: 16, y: 8 }
    });
    playButton.setOrigin(0.5);
    playButton.setInteractive({ useHandCursor: true });
    
    playButton.on('pointerover', () => {
      playButton.setStyle({ backgroundColor: '#55cc55' });
    });
    
    playButton.on('pointerout', () => {
      playButton.setStyle({ backgroundColor: '#44aa44' });
    });
    
    playButton.on('pointerdown', () => {
      this.onSetSelected(set);
    });
    
    cardContainer.add(playButton);
    
    container.add(cardContainer);
  }

  createBackButton(container, x, y) {
    const backButton = this.add.text(x, y, '← Back to Village', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      backgroundColor: '#cc8844',
      padding: { x: 20, y: 10 }
    });
    backButton.setOrigin(0.5);
    backButton.setInteractive({ useHandCursor: true });
    
    backButton.on('pointerover', () => {
      backButton.setStyle({ backgroundColor: '#dd9955' });
    });
    
    backButton.on('pointerout', () => {
      backButton.setStyle({ backgroundColor: '#cc8844' });
    });
    
    backButton.on('pointerdown', () => {
      this.returnToVillage();
    });
    
    container.add(backButton);
  }

  async onSetSelected(set) {
    console.log(`Selected question set: ${set.name}`);
    
    // Show loading overlay
    this.showLoadingOverlay();
    
    try {
      // Fetch questions for this set
      const questions = await getQuestionsForSet(set.id);
      
      this.hideLoadingOverlay();
      
      if (questions.length === 0) {
        console.warn('No questions found in set, using fallback');
        // Fallback to local questions
        const fallbackQuestions = getLocalQuestionsBySubject(this.subject, 10);
        this.launchGame(fallbackQuestions);
      } else {
        this.launchGame(questions);
      }
    } catch (error) {
      console.error('Error loading questions for set:', error);
      this.hideLoadingOverlay();
      
      // Fallback to local questions
      const fallbackQuestions = getLocalQuestionsBySubject(this.subject, 10);
      this.launchGame(fallbackQuestions);
    }
  }

  launchGame(questions) {
    const sceneData = {
      returnScene: this.returnScene,
      villageConfig: this.villageConfig,
      questions: questions,
      timeLimit: 60
    };
    
    // Use the target game scene passed from VillageScene
    this.scene.start(this.targetGameScene, sceneData);
  }

  returnToVillage() {
    this.scene.start(this.returnScene, { villageConfig: this.villageConfig });
  }

  showNoSetsMessage() {
    const container = this.add.container(400, 450);
    container.setDepth(100);

    this.createStoneBackground(container, 0, 0, 20, 10);

    const msgText = this.add.text(0, -40, 'No Question Sets Available', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ff6666',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center'
    });
    msgText.setOrigin(0.5);
    container.add(msgText);

    const subText = this.add.text(0, 10, 'Using default questions instead', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'center'
    });
    subText.setOrigin(0.5);
    container.add(subText);

    // Auto-launch with fallback questions after 2 seconds
    this.time.delayedCall(2000, () => {
      const fallbackQuestions = getLocalQuestionsBySubject(this.subject, 10);
      this.launchGame(fallbackQuestions);
    });
  }

  showErrorMessage() {
    const container = this.add.container(400, 450);
    container.setDepth(100);

    this.createStoneBackground(container, 0, 0, 20, 12);

    const errorText = this.add.text(0, -50, 'Error Loading Sets', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ff6666',
      stroke: '#000000',
      strokeThickness: 4
    });
    errorText.setOrigin(0.5);
    container.add(errorText);

    const msgText = this.add.text(0, 0, 'Using default questions', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    msgText.setOrigin(0.5);
    container.add(msgText);

    const backButton = this.add.text(0, 60, 'Back to Village', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#cc8844',
      padding: { x: 20, y: 10 }
    });
    backButton.setOrigin(0.5);
    backButton.setInteractive({ useHandCursor: true });
    backButton.on('pointerdown', () => this.returnToVillage());
    container.add(backButton);
  }

  createStoneBackground(container, centerX, centerY, tilesWide, tilesHigh) {
    const tileSize = 16;
    const totalWidth = tilesWide * tileSize;
    const totalHeight = tilesHigh * tileSize;
    const startX = centerX - (totalWidth / 2);
    const startY = centerY - (totalHeight / 2);

    // Top row
    for (let col = 0; col < tilesWide; col++) {
      let tileNum;
      if (col === 0) {
        tileNum = 96;
      } else if (col === tilesWide - 1) {
        tileNum = 98;
      } else {
        tileNum = 97;
      }
      const tile = this.add.image(
        startX + col * tileSize,
        startY,
        `tile_${tileNum.toString().padStart(4, '0')}`
      );
      tile.setOrigin(0, 0);
      container.add(tile);
    }

    // Middle rows
    for (let row = 1; row < tilesHigh - 1; row++) {
      for (let col = 0; col < tilesWide; col++) {
        let tileNum;
        if (col === 0) {
          tileNum = 108;
        } else if (col === tilesWide - 1) {
          tileNum = 110;
        } else {
          tileNum = 109;
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

    // Bottom row
    for (let col = 0; col < tilesWide; col++) {
      let tileNum;
      if (col === 0) {
        tileNum = 120;
      } else if (col === tilesWide - 1) {
        tileNum = 122;
      } else {
        tileNum = 121;
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

  getSubjectEmoji(subject) {
    const emojis = {
      math: '🔢',
      reading: '📚',
      finance: '💰'
    };
    return emojis[subject] || '🎮';
  }

  getDifficultyColor(difficulty) {
    const colors = {
      easy: '#44aa44',
      medium: '#ff9900',
      hard: '#cc4444'
    };
    return colors[difficulty] || '#888888';
  }
}
