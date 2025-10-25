import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Game from './components/Game';
import FruitCatch from './components/FruitCatch';
import QuestionExtractor from './components/QuestionExtractor';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/game" element={<Game />} />
          <Route path="/fruit-catch" element={<FruitCatch />} />
          <Route path="/extract-questions" element={<QuestionExtractor />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
