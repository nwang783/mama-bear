import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  const handlePrimaryCta = () => {
    navigate('/game');
  };

  const handleExtractClick = () => {
    navigate('/extract-questions');
  };

  // Simple scroll-reveal animations
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

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
        <div className="hero-section" data-reveal>
          <h1 className="title">Mama Bear</h1>
          <h2 className="title-sub">Learning Quest</h2>
          <p className="subtitle">
            Budget. Save. Spend wisely. Money mastery through retro play.
          </p>
          <div className="action-buttons">
            <button className="pixel-button primary" onClick={handlePrimaryCta}>
              Start Learning for Free →
            </button>
            <button className="pixel-button secondary" onClick={handleExtractClick}>
              Upload a PDF →
            </button>
          </div>
        </div>
      </div>

      {/* Content below hero */}
      <div className="marketing-section">
        <div className="marketing-inner content-sections">
          {/* The Problem */}
          <section className="content-section panel reveal" data-reveal>
            <h2 className="section-title">Kids Are Growing Up Financially Unprepared</h2>
            <ul className="stats-list">
              <li>
                18% of 15-year-olds in the U.S. don't understand basics like budgeting or comparison shopping; high school seniors answer only 48% on financial literacy exams.
              </li>
              <li>
                73% of teens want more money education, yet only 23% of children frequently talk about money with their parents.
              </li>
            </ul>
            <div className="source-links">
              <a href="https://moneyzine.com/personal-finance/financial-literacy-statistics/" target="_blank" rel="noreferrer">US Financial Literacy Statistics 2025</a>
              <span> • </span>
              <a href="https://signalskills.com/financial-literacy-statistics/" target="_blank" rel="noreferrer">Financial Literacy Statistics for 2025</a>
            </div>
          </section>

          {/* The Gap */}
          <section className="content-section panel reveal" data-reveal>
            <h2 className="section-title">The Gap Hits Hardest Where It Matters Most</h2>
            <p className="section-body">
              Low-income, Black, and Hispanic households—and teens in particular—face greater risks from low financial literacy. 40% of students from low-income schools lack core money skills, and only 4% of children from low-income families will break the cycle of poverty. In 2023 alone, low financial literacy cost Americans an estimated $388B.
            </p>
            <div className="source-links">
              <a href="https://worthadvisors.com/financial-literacy-barriers/" target="_blank" rel="noreferrer">Financial Literacy Barriers</a>
              <span> • </span>
              <a href="https://www.cnbc.com/amp/2021/05/02/op-ed-why-financial-literacy-needs-to-be-a-national-priority.html" target="_blank" rel="noreferrer">CNBC Op-ed</a>
              <span> • </span>
              <a href="https://unitedwaynca.org/blog/financial-literacy-for-youth/" target="_blank" rel="noreferrer">Why Financial Literacy for Teens Matters</a>
              <span> • </span>
              <a href="https://moneyzine.com/personal-finance/financial-literacy-statistics/" target="_blank" rel="noreferrer">US Financial Literacy Statistics 2025</a>
            </div>
            <p className="section-body emphasize">We can change this. Games make money skills accessible, fun, and repeatable for every child.</p>
          </section>

          {/* How the app works - based on codebase */}
          <section className="content-section" data-reveal>
            <h2 className="section-title">How Mama Bear Works</h2>
            <div className="steps-grid">
              <div className="step-card panel">
                <div className="step-number">1</div>
                <h3 className="step-title">Choose Finance Village</h3>
                <p className="step-text">Enter the 💰 Finance Village and pick a question set—community sets are fetched from our library, with difficulty badges and stats.</p>
              </div>
              <div className="step-card panel">
                <div className="step-number">2</div>
                <h3 className="step-title">Play Mini‑Games</h3>
                <p className="step-text">Kids learn money concepts while playing retro games like Fruit Collector and Fishing—answer to progress and earn rewards.</p>
              </div>
              <div className="step-card panel">
                <div className="step-number">3</div>
                <h3 className="step-title">Bring Your Own Content</h3>
                <p className="step-text">Upload a PDF and our AI extracts questions into a playable set in seconds—perfect for lessons on budgeting, saving, and spending.</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

export default LandingPage;
