import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  const handlePlayClick = () => {
    navigate('/game');
  };

  const handleExtractClick = () => {
    navigate('/extract-questions');
  };

  return (
    <div
      className="landing-page"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/assets/hero-background.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="hero-section">
        <h1 className="title">Mama Bear</h1>
        <h2 className="title-sub">Learning Quest</h2>
        <p className="subtitle">
          Turn lessons into a retro game adventure for kids
        </p>
        <div className="action-buttons">
          <button className="pixel-button primary" onClick={handlePlayClick}>
            Start Game
          </button>
          <button className="pixel-button secondary" onClick={handleExtractClick}>
            Extract Questions from PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
