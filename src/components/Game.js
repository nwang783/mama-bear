import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import LobbyScene from '../game/LobbyScene';
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
        backgroundColor: '#87ceeb',
        scene: [LobbyScene],
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 },
            debug: false
          }
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

  return (
    <div className="game-container">
      <div className="game-header">
        <h2>🐻 Mama Bear Learning Lobby</h2>
        <p>Choose a village to begin your adventure!</p>
      </div>
      <div ref={gameRef} className="game-canvas" />
      <div className="game-footer">
        <button onClick={() => window.location.href = '/'} className="back-button">
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

export default Game;
