import React from 'react';
import birdImg from '../assets/images/birdup.png';

export default function StartScreen({ startGame, account, connectWallet, isConnecting }) {
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
        
        {/* Wallet Connection Section */}
        <div className="wallet-section">
          {account ? (
            <div className="wallet-info">
              <div className="wallet-status connected">
                <span className="status-icon">✅</span>
                <span>Wallet Connected</span>
              </div>
              <div className="wallet-address">
                {account.slice(0, 6)}...{account.slice(-4)}
              </div>
            </div>
          ) : (
            <div className="wallet-prompt">
              <div className="wallet-icon">🔗</div>
              <p className="wallet-text">Connect your MetaMask wallet for the full Web3 experience!</p>
              <button 
                className="connect-wallet-btn"
                onClick={connectWallet}
                disabled={isConnecting}
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </div>
          )}
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