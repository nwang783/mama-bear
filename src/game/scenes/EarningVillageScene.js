import VillageScene from './VillageScene';
import House from '../entities/House';
import { GAME_CONFIG } from '../config/gameConfig';

/**
 * Earning Village Scene - contains earning-related minigame houses
 */
export default class EarningVillageScene extends VillageScene {
  constructor() {
    super('EarningVillageScene');
  }

  createHouses() {
    // Get earning village house configurations
    this.housesConfig = GAME_CONFIG.HOUSES.EARNING_VILLAGE;
    
    // Get village color
    const villageColor = GAME_CONFIG.VILLAGES.find(v => v.id === 'earning').color;

    // Create each house
    this.housesConfig.forEach(houseConfig => {
      const house = new House(this, houseConfig, villageColor);
      this.houses.push(house);
    });
  }
}
