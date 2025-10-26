import VillageScene from './VillageScene';
import House from '../entities/House';
import { GAME_CONFIG } from '../config/gameConfig';

/**
 * Spending Village Scene - contains spending-related minigame houses
 */
export default class SpendingVillageScene extends VillageScene {
  constructor() {
    super('SpendingVillageScene');
  }

  create() {
    // Call parent create method
    super.create();
    
    // Add Capital One sponsor sign
    this.createCapitalOneSign();
  }

  createHouses() {
    // Get spending village house configurations
    this.housesConfig = GAME_CONFIG.HOUSES.SPENDING_VILLAGE;
    
    // Get village color
    const villageColor = GAME_CONFIG.VILLAGES.find(v => v.id === 'spending').color;

    // Create each house
    this.housesConfig.forEach(houseConfig => {
      const house = new House(this, houseConfig, villageColor);
      this.houses.push(house);
    });
  }

  createCapitalOneSign() {
    // Position sign up and to the right (moved up by 8 tiles = 128px, right by 4 tiles = 64px)
    const signX = GAME_CONFIG.VILLAGE_SCENE.WIDTH / 2 + 164;
    const signY = GAME_CONFIG.VILLAGE_SCENE.HEIGHT - 228;
    
    // Create container for the sign
    const signContainer = this.add.container(signX, signY);
    signContainer.setDepth(20);
    
    // Create stone background for sign (using Kenney tiles)
    this.createStoneSignBackground(signContainer, 0, 0, 12, 4);
    
    // Add "Sponsored by" text
    const sponsorText = this.add.text(0, -20, 'Sponsored by', {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#666666',
      align: 'center'
    });
    sponsorText.setOrigin(0.5);
    signContainer.add(sponsorText);
    
    // Add Capital One logo text
    const logoText = this.add.text(0, 5, 'Capital One', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#004977',
      fontStyle: 'bold',
      align: 'center',
      stroke: '#ffffff',
      strokeThickness: 2
    });
    logoText.setOrigin(0.5);
    signContainer.add(logoText);
    
    // Add decorative retro hearts
    const heartLeft = this.add.text(-70, 0, '♥', {
      fontSize: '24px',
      color: '#ff1744'
    });
    heartLeft.setOrigin(0.5);
    signContainer.add(heartLeft);
    
    const heartRight = this.add.text(70, 0, '♥', {
      fontSize: '24px',
      color: '#ff1744'
    });
    heartRight.setOrigin(0.5);
    signContainer.add(heartRight);
    
    // Add subtle bounce animation
    this.tweens.add({
      targets: signContainer,
      y: signY - 5,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  createStoneSignBackground(container, centerX, centerY, tilesWide, tilesHigh) {
    // Create stone tile background for the sign (using Kenney tiles)
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
}
