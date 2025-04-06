import React from 'react';
import birdImg from '../assets/images/birdup.png';

export default function StartScreen({ startGame }) {
  const handleStartClick = () => {
    console.log("Start button clicked");
    startGame();
  };

  return (
    <div className="start-screen">
      <div className="start-content">
        <h1 className="game-title">Flappy Bird</h1>
        <div className="bird-container">
          <img src={birdImg} alt="Bird" className="start-bird" />
        </div>
        <div className="instructions">
          <p>Press <span className="key-highlight">Enter</span> to Start</p>
          <div className="control-instruction">
            <span className="arrow-key">↑</span> or <span className="space-key">Space</span> to Fly
          </div>
        </div>
        <button className="start-button" onClick={handleStartClick}>
          START GAME
        </button>
      </div>
    </div>
  );
}