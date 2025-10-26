import VillageScene from './VillageScene';
import House from '../entities/House';
import { GAME_CONFIG } from '../config/gameConfig';

/**
 * Saving Village Scene - contains saving-related minigame houses
 */
export default class SavingVillageScene extends VillageScene {
  constructor() {
    super('SavingVillageScene');
  }

  createHouses() {
    // Get saving village house configurations
    this.housesConfig = GAME_CONFIG.HOUSES.SAVING_VILLAGE;
    
    // Get village color
    const villageColor = GAME_CONFIG.VILLAGES.find(v => v.id === 'saving').color;

    // Create each house
    this.housesConfig.forEach(houseConfig => {
      const house = new House(this, houseConfig, villageColor);
      this.houses.push(house);
    });
  }
}
