import VillageScene from './VillageScene';
import House from '../entities/House';
import { GAME_CONFIG } from '../config/gameConfig';

/**
 * Reading Village Scene - contains reading-related minigame houses
 */
export default class ReadingVillageScene extends VillageScene {
  constructor() {
    super('ReadingVillageScene');
  }

  createHouses() {
    // Get reading village house configurations
    this.housesConfig = GAME_CONFIG.HOUSES.READING_VILLAGE;
    
    // Get village color
    const villageColor = GAME_CONFIG.VILLAGES.find(v => v.id === 'reading').color;

    // Create each house
    this.housesConfig.forEach(houseConfig => {
      const house = new House(this, houseConfig, villageColor);
      this.houses.push(house);
    });
  }
}
