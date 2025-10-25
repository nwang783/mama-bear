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
    <div className="landing-page">
      <div className="hero-section">
        <h1 className="title">🐻 Mama Bear Learning</h1>
        <p className="subtitle">
          Turn your educational content into fun, interactive games for your children
        </p>
        <p className="description">
          A free platform where moms can create engaging learning experiences.
          Explore different villages and master math, finances, and reading!
        </p>
        <div className="action-buttons">
          <button className="play-button" onClick={handlePlayClick}>
            Start Learning Adventure
          </button>
          <button className="extract-button" onClick={handleExtractClick}>
            🤖 Extract Questions from PDF
          </button>
        </div>
      </div>
      <div className="features">
        <div className="feature">
          <span className="feature-icon">📚</span>
          <h3>Reading Village</h3>
          <p>Build literacy skills through interactive stories</p>
        </div>
        <div className="feature">
          <span className="feature-icon">🔢</span>
          <h3>Math Village</h3>
          <p>Make numbers fun with engaging challenges</p>
        </div>
        <div className="feature">
          <span className="feature-icon">💰</span>
          <h3>Finance Village</h3>
          <p>Learn money skills early in life</p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
