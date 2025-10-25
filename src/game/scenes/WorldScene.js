import Phaser from 'phaser';
import Player from '../entities/Player';
import Village from '../entities/Village';
import CatNPC from '../entities/CatNPC';
import { GAME_CONFIG } from '../config/gameConfig';

/**
 * Main open-world gameplay scene
 */
export default class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldScene' });
    this.player = null;
    this.villages = [];
    this.nearbyVillage = null;
    this.cats = [];
    this.waterGroup = null;
    this.pathPoints = [];
  }

  create() {
    // Set world bounds (larger than visible area)
    this.physics.world.setBounds(
      0,
      0,
      GAME_CONFIG.WORLD.WIDTH,
      GAME_CONFIG.WORLD.HEIGHT
    );

    // Create background
    this.createBackground();

    // Create environment decorations
    this.createDecorations();

    // Create villages
    this.createVillages();

    // Create paths between villages (record path positions)
    this.createPaths();

    // Extend spawn path for better guidance and record points
    this.extendSpawnPath();

    // Create player
    this.createPlayer();

    // Setup camera to follow player
    this.setupCamera();

    // Add water and plants after paths to avoid intersections
    this.createWaterFeatures();
    this.scatterPlants();

    // Create some wandering cats
    this.spawnCats(6);

    // Listen for village entrance events
    this.events.on('villageEntered', this.handleVillageEntered, this);
  }

  createBackground() {
    // Create varied tiled grass background using Kenney tiles
    const tileSize = 16; // Kenney tiles are 16x16
    const tilesX = Math.ceil(GAME_CONFIG.WORLD.WIDTH / tileSize);
    const tilesY = Math.ceil(GAME_CONFIG.WORLD.HEIGHT / tileSize);

    // Create grass pattern with weighted random variation
    // 70% tile_0000, 28% tile_0001, 2% tile_0002 for more subtle variation
    for (let x = 0; x < tilesX; x++) {
      for (let y = 0; y < tilesY; y++) {
        const rand = Math.random();
        let tileKey;
        if (rand < 0.7) {
          tileKey = 'tile_0000'; // 70% - main grass
        } else if (rand < 0.98) {
          tileKey = 'tile_0001'; // 28% - variation
        } else {
          tileKey = 'tile_0002'; // 2% - rare variation
        }
        
        const grassTile = this.add.image(x * tileSize, y * tileSize, tileKey);
        grassTile.setOrigin(0, 0);
        grassTile.setDepth(-100);
      }
    }

    // Add tree tiles (0004 and 0005) scattered around
    for (let i = 0; i < 60; i++) {
      const treeX = Phaser.Math.Between(tileSize, GAME_CONFIG.WORLD.WIDTH - tileSize);
      const treeY = Phaser.Math.Between(tileSize, GAME_CONFIG.WORLD.HEIGHT - tileSize);
      
      // Don't place trees near villages
      if (!this.isNearVillageSpawn(treeX, treeY)) {
        const treeType = Math.random() < 0.5 ? 'tile_0004' : 'tile_0005';
        const tree = this.add.image(treeX, treeY, treeType);
        tree.setDepth(5); // Lower depth
      }
    }
  }

  createCloud(x, y) {
    const cloud = this.add.container(x, y);
    
    // Create cloud circles
    const c1 = this.add.circle(0, 0, 30, 0xffffff, 0.7);
    const c2 = this.add.circle(-20, 5, 25, 0xffffff, 0.7);
    const c3 = this.add.circle(20, 5, 25, 0xffffff, 0.7);
    const c4 = this.add.circle(0, -15, 20, 0xffffff, 0.7);
    
    cloud.add([c1, c2, c3, c4]);
    cloud.setDepth(-80);

    // Gentle floating animation
    this.tweens.add({
      targets: cloud,
      x: x + 50,
      y: y + 10,
      duration: Phaser.Math.Between(8000, 12000),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  createDecorations() {
    // Decorations now handled by tile-based system (trees are tile_0004 and tile_0005)
    // No additional decorations needed here
  }

  createWaterFeatures() {
    const tileSize = 16;

    if (!this.waterGroup) {
      this.waterGroup = this.physics.add.staticGroup();
    }

    // Create a few small lakes (blobby clusters)
    const lakes = 4;
    for (let i = 0; i < lakes; i++) {
      let cx, cy, attempts = 0;
      do {
        cx = Phaser.Math.Between(tileSize * 8, GAME_CONFIG.WORLD.WIDTH - tileSize * 8);
        cy = Phaser.Math.Between(tileSize * 8, GAME_CONFIG.WORLD.HEIGHT - tileSize * 8);
        attempts++;
      } while (this.isNearVillageSpawn(cx, cy) && attempts < 25);

      const r = Phaser.Math.Between(3, 6); // radius in tiles
      for (let dx = -r; dx <= r; dx++) {
        for (let dy = -r; dy <= r; dy++) {
          const dist2 = dx * dx + dy * dy;
          const threshold = r * r + Phaser.Math.Between(-2, 2); // fuzzy edge
          if (dist2 <= threshold) {
            const wx = cx + dx * tileSize;
            const wy = cy + dy * tileSize;
            if (this.isNearAnyPath(wx, wy, tileSize * 2)) continue;
            const water = this.waterGroup.create(wx, wy, 'water_tiles', 0);
            water.setDepth(-50);
            water.refreshBody();
          }
        }
      }
    }

    // Create a couple of meandering streams (3 tiles wide)
    const streams = 3;
    for (let s = 0; s < streams; s++) {
      let x, y, attempts = 0;
      do {
        x = Phaser.Math.Between(tileSize * 6, GAME_CONFIG.WORLD.WIDTH - tileSize * 6);
        y = Phaser.Math.Between(tileSize * 6, GAME_CONFIG.WORLD.HEIGHT - tileSize * 6);
        attempts++;
      } while (this.isNearVillageSpawn(x, y) && attempts < 25);

      // Initial direction
      let angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const segs = Phaser.Math.Between(10, 20);
      for (let k = 0; k < segs; k++) {
        // Place width-3 strip perpendicular to movement
        const dir = new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle)).normalize();
        const step = dir.clone().scale(tileSize);
        // perpendicular vector
        const perp = new Phaser.Math.Vector2(-dir.y, dir.x).scale(tileSize);

        for (let w = -1; w <= 1; w++) {
          const wx = x + perp.x * w;
          const wy = y + perp.y * w;
          if (this.isNearAnyPath(wx, wy, tileSize * 2)) continue;
          const water = this.waterGroup.create(wx, wy, 'water_tiles', 0);
          water.setDepth(-50);
          water.refreshBody();
        }

        // Step forward
        x += step.x;
        y += step.y;

        // Random gentle turn
        angle += Phaser.Math.FloatBetween(-0.5, 0.5) * 0.3;

        // Clamp inside world bounds
        x = Phaser.Math.Clamp(x, tileSize * 4, GAME_CONFIG.WORLD.WIDTH - tileSize * 4);
        y = Phaser.Math.Clamp(y, tileSize * 4, GAME_CONFIG.WORLD.HEIGHT - tileSize * 4);
      }
    }

    // After placement, clear any accidental overlaps with paths
    this.pruneWaterOnPaths(tileSize * 0.9);

    // Add collision: player cannot walk over water
    if (this.player && this.waterGroup) {
      this.physics.add.collider(this.player, this.waterGroup);
    }
  }

  scatterPlants() {
    const tileSize = 16;
    const count = 12;
    for (let i = 0; i < count; i++) {
      const px = Phaser.Math.Between(tileSize, GAME_CONFIG.WORLD.WIDTH - tileSize);
      const py = Phaser.Math.Between(tileSize, GAME_CONFIG.WORLD.HEIGHT - tileSize);

      // keep away from villages, paths, and water
      if (this.isNearVillageSpawn(px, py)) continue;
      if (this.isNearAnyPath(px, py, 18)) continue;
      if (this.isPointOverWater(px, py)) continue;

      // choose a frame from the first 64 tiles as a safe range
      const frame = Phaser.Math.Between(0, 63);
      const plant = this.add.image(px, py, 'biome_things', frame);
      plant.setDepth(2);
    }
  }

  extendSpawnPath() {
    const tileSize = 16;
    const sx = GAME_CONFIG.PLAYER.START_X;
    const sy = GAME_CONFIG.PLAYER.START_Y;

    // Create a longer path leading down from spawn, then right
    const downTiles = 12;
    for (let i = 0; i < downTiles; i++) {
      const y = sy + i * tileSize;
      const t = this.add.image(sx, y, 'tile_0025');
      t.setDepth(-10);
      this.pathPoints.push({ x: sx, y });
    }

    // Horizontal should meet exactly at the last vertical tile (continuous corner)
    const cornerY = sy + (downTiles - 1) * tileSize;
    const rightTiles = 16;
    for (let i = 0; i <= rightTiles; i++) {
      const x = sx + i * tileSize;
      const t = this.add.image(x, cornerY, 'tile_0025');
      t.setDepth(-10);
      this.pathPoints.push({ x, y: cornerY });
    }
  }

  isNearVillageSpawn(x, y) {
    return GAME_CONFIG.VILLAGES.some(village => {
      const distance = Phaser.Math.Distance.Between(x, y, village.x, village.y);
      return distance < 250;
    });
  }

  createPaths() {
    // Create simple paths between villages using tile_0025
    const villages = GAME_CONFIG.VILLAGES;
    const tileSize = 16;
    
    // Path from reading to math
    this.createPath(villages[0].x, villages[0].y, villages[1].x, villages[1].y, tileSize);
    
    // Path from math to finance
    this.createPath(villages[1].x, villages[1].y, villages[2].x, villages[2].y, tileSize);
    
    // Path from finance to reading (complete the loop)
    this.createPath(villages[2].x, villages[2].y, villages[0].x, villages[0].y, tileSize);
  }

  createPath(x1, y1, x2, y2, tileSize) {
    // Calculate direction and distance
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.floor(distance / tileSize);
    
    // Normalize direction
    const stepX = dx / steps;
    const stepY = dy / steps;
    
    // Place path tiles along the line
    for (let i = 0; i <= steps; i++) {
      const x = x1 + (stepX * i);
      const y = y1 + (stepY * i);
      
      // Add path tile
      const pathTile = this.add.image(x, y, 'tile_0025');
      pathTile.setDepth(-10);
      // record for water avoidance
      this.pathPoints.push({ x, y });
      
      // Add some width variation - place tiles slightly offset
      if (i % 2 === 0) {
        const offset = tileSize * 0.8;
        // Add perpendicular tiles for path width using normalized direction
        const len = Math.hypot(dx, dy) || 1;
        const nx = dx / len;
        const ny = dy / len;
        const perpX = -ny * offset;
        const perpY = nx * offset;
        
        const pathTile2 = this.add.image(x + perpX, y + perpY, 'tile_0025');
        pathTile2.setDepth(-10);
        const pathTile3 = this.add.image(x - perpX, y - perpY, 'tile_0025');
        pathTile3.setDepth(-10);
        this.pathPoints.push({ x: x + perpX, y: y + perpY });
        this.pathPoints.push({ x: x - perpX, y: y - perpY });
      }
    }
  }

  createVillages() {
    GAME_CONFIG.VILLAGES.forEach(villageConfig => {
      const village = new Village(this, villageConfig);
      this.villages.push(village);
    });
  }

  createPlayer() {
    this.player = new Player(
      this,
      GAME_CONFIG.PLAYER.START_X,
      GAME_CONFIG.PLAYER.START_Y
    );
  }

  setupCamera() {
    // Camera follows player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    
    // Set camera bounds to world bounds
    this.cameras.main.setBounds(
      0,
      0,
      GAME_CONFIG.WORLD.WIDTH,
      GAME_CONFIG.WORLD.HEIGHT
    );

    // Optional: Add zoom
    this.cameras.main.setZoom(1.5);
  }

  update() {
    // Update cats
    this.cats.forEach(cat => cat.update());

    // Update player
    if (this.player) {
      this.player.update();
    }

    // Check proximity to villages
    this.checkVillageProximity();

    // Check for interaction
    if (this.player && this.nearbyVillage && this.player.isInteractKeyPressed()) {
      this.nearbyVillage.enterVillage();
    }
  }

  checkVillageProximity() {
    if (!this.player) return;

    const playerPos = this.player.getPosition();
    let foundNearby = false;

    this.villages.forEach(village => {
      const isNear = village.checkPlayerProximity(playerPos.x, playerPos.y);
      if (isNear) {
        this.nearbyVillage = village;
        foundNearby = true;
        
        // Notify UI scene
        this.events.emit('showInteractionPrompt', village.getConfig());
      }
    });

    if (!foundNearby && this.nearbyVillage) {
      this.nearbyVillage = null;
      this.events.emit('hideInteractionPrompt');
    }
  }

  handleVillageEntered(villageConfig) {
    console.log(`Player entered ${villageConfig.name}!`);
    
    // Determine which village scene to load based on village ID
    const sceneMap = {
      'math': 'MathVillageScene',
      'reading': 'ReadingVillageScene',
      'finance': 'FinanceVillageScene'
    };

    const sceneKey = sceneMap[villageConfig.id];
    
    if (sceneKey) {
      // Fade out and transition to village scene
      this.cameras.main.fade(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(sceneKey, { villageConfig });
      });
    } else {
      console.error(`Unknown village ID: ${villageConfig.id}`);
    }
  }

  spawnCats(count = 4) {
    for (let i = 0; i < count; i++) {
      // pick a random spot not too close to villages
      let x, y;
      let attempts = 0;
      do {
        x = Phaser.Math.Between(100, GAME_CONFIG.WORLD.WIDTH - 100);
        y = Phaser.Math.Between(100, GAME_CONFIG.WORLD.HEIGHT - 100);
        attempts++;
      } while (this.isNearVillageSpawn(x, y) && attempts < 20);

      const cat = new CatNPC(this, x, y);
      this.cats.push(cat);
    }
  }
  isNearAnyPath(x, y, minDist = 12) {
    for (let i = 0; i < this.pathPoints.length; i++) {
      const p = this.pathPoints[i];
      if (Phaser.Math.Distance.Between(x, y, p.x, p.y) < minDist) return true;
    }
    return false;
  }

  pruneWaterOnPaths(clearance = 12) {
    if (!this.waterGroup) return;
    const toRemove = [];
    this.waterGroup.children.iterate(child => {
      if (!child || !child.body) return;
      const cx = child.x;
      const cy = child.y;
      if (this.isNearAnyPath(cx, cy, clearance)) {
        toRemove.push(child);
      }
    });
    toRemove.forEach(c => c.destroy());
  }

  isPointOverWater(x, y) {
    if (!this.waterGroup) return false;
    let hit = false;
    this.waterGroup.children.iterate(child => {
      if (hit || !child) return;
      const b = child.body;
      if (!b) return;
      if (x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height) {
        hit = true;
      }
    });
    return hit;
  }
}
