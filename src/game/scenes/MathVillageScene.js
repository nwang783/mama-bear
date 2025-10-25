import VillageScene from './VillageScene';
import House from '../entities/House';
import { GAME_CONFIG } from '../config/gameConfig';

/**
 * Math Village Scene - contains math-related minigame houses
 */
export default class MathVillageScene extends VillageScene {
  constructor() {
    super('MathVillageScene');
  }

  createHouses() {
    // Get math village house configurations
    this.housesConfig = GAME_CONFIG.HOUSES.MATH_VILLAGE;
    
    // Get village color
    const villageColor = GAME_CONFIG.VILLAGES.find(v => v.id === 'math').color;

    // Create each house
    this.housesConfig.forEach(houseConfig => {
      const house = new House(this, houseConfig, villageColor);
      this.houses.push(house);
    });
  }
}
