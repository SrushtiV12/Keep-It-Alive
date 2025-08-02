import React, { useEffect, useRef, useState, useCallback } from 'react';
import birdImg from '../assets/images/birdup.png'; // Fallback
import birdImg2 from '../assets/images/bird copy.png'; // Fallback flap
import soundPoint from '../assets/sounds/point.mp3';
import soundDie from '../assets/sounds/die.mp3';
import StartScreen from './StartScreen';
import '../index.css';

export default function Game({ highScore, setHighScore, tokens, setTokens, incrementTokens, currentSkin, account, connectWallet, isConnecting }) {
  const [gameState, setGameState] = useState('Start');
  const [currentScore, setCurrentScore] = useState(0);
  const gameStateRef = useRef('Start');
  const animation_ids = useRef([]);
  const bird_dy_ref = useRef(0);
  const pipe_separation_ref = useRef(0);
  const moveSpeedRef = useRef(3);
  const isDefaultBird = !currentSkin; // true if no purchased skin is selected
  const birdImage = currentSkin?.image || birdImg;
  const birdFlapImage = currentSkin?.flapImage || birdImg2;
  const [backgroundClass, setBackgroundClass] = useState('bg-default');
  
  // Store these in refs to prevent useEffect re-runs
  const birdImageRef = useRef(birdImage);
  const birdFlapImageRef = useRef(birdFlapImage);
  const isDefaultBirdRef = useRef(isDefaultBird);
  
  // Update refs when props change
  useEffect(() => {
    birdImageRef.current = birdImage;
    birdFlapImageRef.current = birdFlapImage;
    isDefaultBirdRef.current = isDefaultBird;
  }, [birdImage, birdFlapImage, isDefaultBird]);

  // Function to start game
  const startGame = useCallback(() => {
    document.querySelectorAll('.pipe_sprite').forEach(pipe => pipe.remove());
    setCurrentScore(0);
    pipe_separation_ref.current = 0;
    moveSpeedRef.current = 3;

    const bird = document.querySelector('.bird');
    const img = document.getElementById('bird-1');
    if (bird && img) {
      bird.style.top = '40vh';
      img.style.display = 'block';
    }
    
    // Update game state
    gameStateRef.current = 'Play';
    setGameState('Play');
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && gameStateRef.current === 'End') startGame();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [startGame]);

  // Main game logic effect - only depends on gameState
  useEffect(() => {
    if (gameState !== 'Play') return;
    
    let gravity = 0.3;
    bird_dy_ref.current = 0;

    const bird = document.querySelector('.bird');
    const img = document.getElementById('bird-1');
    const background = document.querySelector('.background');
    const score_val = document.querySelector('.score_val');
    const scoreDisplay = document.querySelector('.score');
    const pipesContainer = document.querySelector('.pipes-container');

    if (!bird || !img || !background || !score_val || !scoreDisplay || !pipesContainer) {
      console.error("Required DOM elements not found");
      return;
    }

    // Reset state
    bird.style.top = '40vh';
    img.style.display = 'block';
    score_val.innerHTML = '0';
    scoreDisplay.style.display = 'block';

    const sound_point = new Audio(soundPoint);
    const sound_die = new Audio(soundDie);

    const keyDownHandler = (e) => {
      if ((e.key === 'ArrowUp' || e.key === ' ') && gameStateRef.current === 'Play') {
        if (e.key === ' ') e.preventDefault();
        // Always use flap image when flapping
        img.src = birdFlapImageRef.current;
        bird_dy_ref.current = -7.0;
        const currentTop = parseFloat(window.getComputedStyle(bird).getPropertyValue('top'));
        bird.style.top = (currentTop - 6) + 'px';
      }
    };

    const keyUpHandler = (e) => {
      if ((e.key === 'ArrowUp' || e.key === ' ') && gameStateRef.current === 'Play') {
        // Always use normal image when not flapping
        img.src = birdImageRef.current;
      }
    };

    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

    function movePipes() {
      if (gameStateRef.current !== 'Play') return;

      const currentScoreVal = parseInt(score_val.innerHTML);
      moveSpeedRef.current = 4 + currentScoreVal * 0.05;

      pipesContainer.querySelectorAll('.pipe_sprite').forEach(pipe => {
        let pipe_props = pipe.getBoundingClientRect();
        let bird_props = bird.getBoundingClientRect();

        if (pipe_props.right <= 0) {
          pipe.remove();
        } else {
          if (
            bird_props.left < pipe_props.left + pipe_props.width - 5 &&
            bird_props.left + bird_props.width - 5 > pipe_props.left &&
            bird_props.top < pipe_props.top + pipe_props.height - 5 &&
            bird_props.top + bird_props.height - 5 > pipe_props.top
          ) {
            gameOver();
            return;
          }
          if (pipe_props.right < bird_props.left && pipe.getAttribute('increase_score') === '1') {
            const newScore = currentScoreVal + 1;
            score_val.innerHTML = newScore;
            setCurrentScore(newScore);
            sound_point.play();
            pipe.setAttribute('increase_score', '0');
            
            // Add visual feedback for token earning
            const tokenNotification = document.createElement('div');
            tokenNotification.className = 'token-notification';
            tokenNotification.textContent = '+1 Token!';
            tokenNotification.style.cssText = `
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              background: #f59e0b;
              color: white;
              padding: 8px 16px;
              border-radius: 20px;
              font-weight: bold;
              font-size: 18px;
              z-index: 1000;
              animation: tokenFloat 2s ease-out forwards;
            `;
            document.body.appendChild(tokenNotification);
            
            // Remove notification after animation
            setTimeout(() => {
              if (tokenNotification.parentNode) {
                tokenNotification.parentNode.removeChild(tokenNotification);
              }
            }, 2000);
            
            console.log("About to increment tokens. Current tokens:", tokens);
            incrementTokens(1);
            console.log("Increment tokens called");
          }

          pipe.style.left = pipe_props.left - moveSpeedRef.current + 'px';
        }
      });
      animation_ids.current.push(requestAnimationFrame(movePipes));
    }

    function applyGravity() {
      if (gameStateRef.current !== 'Play') return;

      bird_dy_ref.current += gravity;
      if (bird_dy_ref.current > 8) bird_dy_ref.current = 8;

      let currentTop = bird.getBoundingClientRect().top;
      let backgroundRect = background.getBoundingClientRect();
      if (currentTop <= 0 || currentTop + bird.clientHeight >= backgroundRect.bottom) {
        gameOver();
        return;
      }
      bird.style.top = currentTop + bird_dy_ref.current + 'px';
      animation_ids.current.push(requestAnimationFrame(applyGravity));
    }

    function createPipes() {
      if (gameStateRef.current !== 'Play') return;

      if (pipe_separation_ref.current > 100) {
        pipe_separation_ref.current = 0;
        let pipe_posi = Math.floor(Math.random() * 43) + 8;
        const pipe_gap = 42;

        let pipe_top = document.createElement('div');
        pipe_top.className = 'pipe_sprite';
        pipe_top.style.top = (pipe_posi - 70) + 'vh';
        pipe_top.style.left = '100vw';
        pipesContainer.appendChild(pipe_top);

        let pipe_bottom = document.createElement('div');
        pipe_bottom.className = 'pipe_sprite';
        pipe_bottom.style.top = (pipe_posi + pipe_gap) + 'vh';
        pipe_bottom.style.left = '100vw';
        pipe_bottom.setAttribute('increase_score', '1');
        pipesContainer.appendChild(pipe_bottom);
      }

      pipe_separation_ref.current++;
      animation_ids.current.push(requestAnimationFrame(createPipes));
    }

    function gameOver() {
      gameStateRef.current = 'End';
      setGameState('End');
      if (img) img.style.display = 'none';
      sound_die.play();
      let score = parseInt(score_val.innerHTML);
      setCurrentScore(score);
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem("flappy-high-score", score);
      }
      if (scoreDisplay) scoreDisplay.style.display = 'none';

      scoreDisplay.style.display = 'none';
      animation_ids.current.forEach(id => cancelAnimationFrame(id));
      animation_ids.current = [];
    }

    const timeout = setTimeout(() => {
      animation_ids.current.push(requestAnimationFrame(movePipes));
      animation_ids.current.push(requestAnimationFrame(applyGravity));
      animation_ids.current.push(requestAnimationFrame(createPipes));
    }, 500);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('keydown', keyDownHandler);
      document.removeEventListener('keyup', keyUpHandler);
      animation_ids.current.forEach(id => cancelAnimationFrame(id));
      animation_ids.current = [];
      if (pipesContainer) {
        pipesContainer.innerHTML = '';
      }
    };
  }, [gameState, setHighScore, setTokens, highScore]); // Added highScore back as it's needed

  useEffect(() => {
    if (currentScore >= 30){
      setBackgroundClass('bg-default')
    }
    else if (currentScore >= 20) {
      setBackgroundClass('bg-alt');
    } else if(currentScore >= 10) {
      setBackgroundClass('bg-1')
    } else {
      setBackgroundClass('bg-default');
    }
  }, [currentScore]);

  // Debug token changes
  useEffect(() => {
    console.log("Game component - tokens changed:", tokens);
  }, [tokens]);
  
  return (
    <div className='game-block'>
      <div className={`background ${backgroundClass}`}></div>
      <div className="pipes-container"></div>
      <img src={birdImage} alt="bird-img" className="bird" id="bird-1" />

      {gameState === 'Start' && (
        <StartScreen 
          startGame={startGame} 
          account={account}
          connectWallet={connectWallet}
          isConnecting={isConnecting}
        />
      )}

             <div className="score" style={{ display: gameState === 'Play' ? 'block' : 'none' }}>
         <span className="score_title">Score: </span>
         <span className="score_val">0</span>
       </div>
               <div className="token-display" style={{ display: gameState === 'Play' ? 'block' : 'none' }}>
          <span className="token_title">Tokens: </span>
          <span className="token_val">{tokens}</span>
          <button 
            onClick={() => {
              console.log("Manual token increment clicked. Current tokens:", tokens);
              incrementTokens(1);
            }}
            style={{
              marginLeft: '10px',
              padding: '2px 8px',
              fontSize: '12px',
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            +1 Test
          </button>
        </div>
      {gameState === 'End' && (
        <div className="game-over-dialog">
          <div className="game-over-content">
            <h2 className="game-over-title">Game Over!</h2>
            <p className="game-over-text">
              Your Score: <span className="game-over-score">{currentScore}</span>
            </p>
            <p className="game-over-text">
              High Score: <span className="game-over-highscore">{highScore}</span>
            </p>
            <p className="game-over-instruction">Press <strong>Enter</strong> to Play Again</p>
            <button className="start-button" onClick={startGame}>PLAY AGAIN</button>
          </div>
        </div>
      )}
    </div>
  );
}
