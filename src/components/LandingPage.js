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
    <div className="page-wrap">
      {/* Fixed background layer */}
      <div
        className="bg-layer"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/assets/hero-background.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <div className="landing-page">
        {/* Hero - full screen */}
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

      {/* Sales Content below hero */}
      <div className="marketing-section">
        <div className="marketing-inner content-sections">
          {/* Problem/Solution */}
          <section className="content-section panel">
            <h2 className="section-title">Learning Shouldn't Feel Like Work</h2>
            <p className="section-body">
              Your kids love games. You love seeing them learn. Why choose?
              <br />
              EduQuest lets you transform any lesson—from times tables to money math—into an exciting 2D adventure your kids will actually want to play.
            </p>
          </section>

          {/* How It Works */}
          <section className="content-section">
            <h2 className="section-title">How It Works</h2>
            <div className="steps-grid">
              <div className="step-card panel">
                <div className="step-number">1</div>
                <h3 className="step-title">Upload Your Content</h3>
                <p className="step-text">Add questions, answers, and topics you want your kids to learn.</p>
              </div>
              <div className="step-card panel">
                <div className="step-number">2</div>
                <h3 className="step-title">We Build the Game</h3>
                <p className="step-text">Your content instantly becomes mini-games in a fun village world.</p>
              </div>
              <div className="step-card panel">
                <div className="step-number">3</div>
                <h3 className="step-title">Watch Them Learn</h3>
                <p className="step-text">Kids explore villages, play games, and master concepts without realizing they're studying.</p>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="content-section panel">
            <h2 className="section-title">Features</h2>
            <ul className="feature-list">
              <li>✨ 100% Free - No subscriptions, no hidden costs</li>
              <li>🎮 Custom Content - Teach exactly what YOUR kids need to learn</li>
              <li>🌍 Adventure Format - Explore villages, meet characters, earn rewards</li>
              <li>📚 Any Subject - Math, reading, finance, or create your own</li>
              <li>⏱️ Quick Setup - Create a full game in under 10 minutes</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
