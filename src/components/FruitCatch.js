import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import FruitCatchScene from '../game/FruitCatchScene';
import './FruitCatch.css';

function FruitCatch() {
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
        scene: [FruitCatchScene],
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
    <div className="fruit-catch-container">
      <div className="fruit-catch-header">
        <h2>🍎 Fruit Catch Math Game</h2>
        <p>Move your bucket to catch the fruit with the correct answer!</p>
      </div>
      <div ref={gameRef} className="fruit-catch-canvas" />
      <div className="fruit-catch-footer">
        <button onClick={() => window.location.href = '/'} className="back-button">
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

export default FruitCatch;
