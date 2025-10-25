import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import BootScene from '../game/scenes/BootScene';
import WorldScene from '../game/scenes/WorldScene';
import UIScene from '../game/scenes/UIScene';
import MathVillageScene from '../game/scenes/MathVillageScene';
import ReadingVillageScene from '../game/scenes/ReadingVillageScene';
import FinanceVillageScene from '../game/scenes/FinanceVillageScene';
import QuestionSetSelectionScene from '../game/scenes/QuestionSetSelectionScene';
import FruitCollectorScene from '../game/scenes/FruitCollectorScene';
import { GAME_CONFIG } from '../game/config/gameConfig';
import './Game.css';

function Game() {
  const gameRef = useRef(null);
  const phaserGameRef = useRef(null);

  useEffect(() => {
    if (gameRef.current && !phaserGameRef.current) {
      const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: gameRef.current,
        backgroundColor: GAME_CONFIG.WORLD.BACKGROUND_COLOR,
        scene: [
          BootScene,
          WorldScene,
          UIScene,
          MathVillageScene,
          ReadingVillageScene,
          FinanceVillageScene,
          QuestionSetSelectionScene,
          FruitCollectorScene
        ],
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 },
            debug: false // Set to true to see physics bodies
          }
        },
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH
        }
      };

      phaserGameRef.current = new Phaser.Game(config);
    }

    // Cleanup function
    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, []);

  const handleFullscreen = () => {
    const gameElement = gameRef.current;
    if (!gameElement) return;

    if (!document.fullscreenElement) {
      gameElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div
      className="game-container"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/assets/hero-background.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="game-header">
        <h2 className="retro-title">Mama Bear Arcade</h2>
        <p className="retro-sub">Choose a village to begin your quest</p>
      </div>
      <div className="game-stage">
        <div className="frame">
          <div ref={gameRef} className="canvas-holder" />
        </div>
      </div>
      <div className="game-footer">
        <button onClick={handleFullscreen} className="pixel-button primary">
          ⛶ Fullscreen
        </button>
        <button onClick={() => (window.location.href = '/')} className="pixel-button secondary">
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

export default Game;
