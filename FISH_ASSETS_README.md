# Fish Pack Assets Setup

The Fishing minigame requires the Kenney Fish Pack 2 assets to be installed.

## Download Instructions

1. Download the **Kenney Fish Pack 2** from:
   https://kenney.nl/assets/fish-pack

2. Extract the ZIP file

3. Copy the contents from the extracted folder:
   - Source: `kenney_fish-pack_2/PNG/Default/`
   - Destination: `public/kenney_fish-pack_2/PNG/Default/`

## Required Assets

The following assets are used by the Fishing minigame:

### Background
- `background_terrain.png` - Water background tile

### Terrain
- `terrain_dirt_a.png` to `terrain_dirt_d.png` - Bottom dirt layers
- `terrain_dirt_top_a.png` to `terrain_dirt_top_d.png` - Top dirt layer

### Fish (with outlines)
- `fish_blue_outline.png`
- `fish_green_outline.png`
- `fish_orange_outline.png`
- `fish_brown_outline.png`

### Decorations
- `bubble_a.png` to `bubble_c.png` - Bubble effects
- `background_seaweed_a.png` to `background_seaweed_h.png` - Seaweed decorations
- `background_rock_a.png` to `background_rock_b.png` - Rock decorations

## Alternative: Manual Download Script

If you have `wget` or `curl` installed, you can download directly:

```bash
# Create the directory
mkdir -p public/kenney_fish-pack_2/PNG/Default

# Download the ZIP (example using wget)
cd public/kenney_fish-pack_2
wget https://kenney.nl/content/3-assets/75-fish-pack/fishpack_2.zip
unzip fishpack_2.zip
```

## Verification

After copying the assets, verify that the following path exists:
```
public/kenney_fish-pack_2/PNG/Default/fish_blue_outline.png
```

The game will load these assets in `src/game/scenes/BootScene.js` during the preload phase.
