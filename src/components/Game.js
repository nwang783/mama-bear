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
    <div className="game-container">
      <div className="game-header">
        <h2>🐻 Mama Bear Learning Lobby</h2>
        <p>Choose a village to begin your adventure!</p>
      </div>
      <div ref={gameRef} className="game-canvas" />
      <div className="game-footer">
        <button onClick={handleFullscreen} className="fullscreen-button">
          ⛶ Fullscreen
        </button>
        <button onClick={() => window.location.href = '/'} className="back-button">
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

export default Game;
