import VillageScene from './VillageScene';
import House from '../entities/House';
import { GAME_CONFIG } from '../config/gameConfig';

/**
 * Finance Village Scene - contains finance-related minigame houses
 */
export default class FinanceVillageScene extends VillageScene {
  constructor() {
    super('FinanceVillageScene');
  }

  createHouses() {
    // Get finance village house configurations
    this.housesConfig = GAME_CONFIG.HOUSES.FINANCE_VILLAGE;
    
    // Get village color
    const villageColor = GAME_CONFIG.VILLAGES.find(v => v.id === 'finance').color;

    // Create each house
    this.housesConfig.forEach(houseConfig => {
      const house = new House(this, houseConfig, villageColor);
      this.houses.push(house);
    });
  }
}
