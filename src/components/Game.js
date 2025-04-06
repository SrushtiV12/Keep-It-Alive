import React, { useEffect, useRef, useState } from 'react';
import birdImg from '../assets/images/birdup.png';
import birdImg2 from '../assets/images/bird copy.png';
import soundPoint from '../assets/sounds/point.mp3';
import soundDie from '../assets/sounds/die.mp3';
import StartScreen from './StartScreen';
import '../index.css';

export default function Game({ highScore, setHighScore, tokens, setTokens }) {
  const [gameState, setGameState] = useState('Start');
  const [currentScore, setCurrentScore] = useState(0);
  const gameStateRef = useRef('End');
  const animation_ids = useRef([]);
  const bird_dy_ref = useRef(0); // Reference to track bird velocity across renders
  
  // Function to start game
  const startGame = () => {
    console.log("Starting game...");
    
    // Clear any existing pipes
    document.querySelectorAll('.pipe_sprite').forEach(pipe => pipe.remove());
    
    // Reset score
    setCurrentScore(0);

    // Reset bird position and make visible
    const bird = document.querySelector('.bird');
    const img = document.getElementById('bird-1');
    if (bird && img) {
      bird.style.top = '40vh';
      img.style.display = 'block'; // Make sure bird is visible
    }
    
    // Update game state
    gameStateRef.current = 'Play';
    setGameState('Play');
    
    // Log for debugging
    console.log("Game state updated to:", gameStateRef.current);
  };

  // Handle Enter key press to restart game
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && gameStateRef.current === 'End') {
        startGame();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Use effect for game logic that runs when gameState changes
  useEffect(() => {
    console.log("Effect running with gameState:", gameState);
    
    // Only set up game when in Play state
    if (gameState !== 'Play') return;
    
    // Balanced game parameters
    let move_speed = 8; // Slightly slower for better playability
    let gravity = 0.35;   // Balanced gravity
    
    bird_dy_ref.current = 0; // Reset bird velocity
    let pipe_separation = 0;
    
    // Get DOM elements
    const bird = document.querySelector('.bird');
    const img = document.getElementById('bird-1');
    const background = document.querySelector('.background');
    const score_val = document.querySelector('.score_val');
    const scoreDisplay = document.querySelector('.score');
    
    console.log("Bird element:", bird);
    console.log("Bird image:", img);
    
    // Safety check
    if (!bird || !img || !background || !score_val || !scoreDisplay) {
      console.error("Required DOM elements not found");
      return;
    }
    
    // Set up initial state
    bird.style.top = '40vh';
    img.style.display = 'block';
    score_val.innerHTML = '0';
    scoreDisplay.style.display = 'block';
    
    // Create audio objects
    const sound_point = new Audio(soundPoint);
    const sound_die = new Audio(soundDie);

    // Event handlers for keyboard controls
    const keyDownHandler = (e) => {
      if ((e.key === 'ArrowUp' || e.key === ' ') && gameStateRef.current === 'Play') {
        // Prevent default behavior for space to avoid page scrolling
        if (e.key === ' ') e.preventDefault();
        
        img.src = birdImg2;
        
        // Balanced jump force - not too high, not too low
        bird_dy_ref.current = -7.0;
        
        // Small immediate jump for better responsiveness
        const currentTop = parseFloat(window.getComputedStyle(bird).getPropertyValue('top'));
        bird.style.top = (currentTop - 6) + 'px';
      }
    };

    const keyUpHandler = (e) => {
      if ((e.key === 'ArrowUp' || e.key === ' ') && gameStateRef.current === 'Play') {
        img.src = birdImg;
      }
    };

    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

    // Game loop functions
    function movePipes() {
      if (gameStateRef.current !== 'Play') return;

      document.querySelectorAll('.pipe_sprite').forEach(pipe => {
        let pipe_props = pipe.getBoundingClientRect();
        let bird_props = bird.getBoundingClientRect();

        if (pipe_props.right <= 0) {
          pipe.remove();
        } else {
          // Collision detection with 5px forgiveness for better player experience
          if (
            bird_props.left < pipe_props.left + pipe_props.width - 5 &&
            bird_props.left + bird_props.width - 5 > pipe_props.left &&
            bird_props.top < pipe_props.top + pipe_props.height - 5 &&
            bird_props.top + bird_props.height - 5 > pipe_props.top
          ) {
            gameOver();
            return;
          }
          // Increase score when passing a pipe
          if (pipe_props.right < bird_props.left && pipe.getAttribute('increase_score') === '1') {
            const currentScoreVal = parseInt(score_val.innerHTML);
            score_val.innerHTML = currentScoreVal + 1;
            setCurrentScore(currentScoreVal + 1);
            sound_point.play();
            pipe.setAttribute('increase_score', '0');
            setTokens(prev => prev + 1);
          }
          pipe.style.left = pipe_props.left - move_speed + 'px';
        }
      });

      animation_ids.current.push(requestAnimationFrame(movePipes));
    }

    function applyGravity() {
      if (gameStateRef.current !== 'Play') return;

      // Update velocity
      bird_dy_ref.current += gravity;
            
      // Cap falling speed to prevent excessive acceleration
      if (bird_dy_ref.current > 8) bird_dy_ref.current = 8;

      let currentTop = bird.getBoundingClientRect().top;
      let backgroundRect = background.getBoundingClientRect();

      if (currentTop <= 0 || currentTop + bird.clientHeight >= backgroundRect.bottom) {
        gameOver();
        return;
      }

      // Apply velocity using the reference
      bird.style.top = currentTop + bird_dy_ref.current + 'px';
      animation_ids.current.push(requestAnimationFrame(applyGravity));
    }

    function createPipes() {
      if (gameStateRef.current !== 'Play') return;

      // Balanced pipe creation rate
      if (pipe_separation > 50) {
        pipe_separation = 0;
        let pipe_posi = Math.floor(Math.random() * 43) + 8;
        
        // Slightly wider gap for better playability
        const pipe_gap = 42;

        let pipe_top = document.createElement('div');
        pipe_top.className = 'pipe_sprite';
        pipe_top.style.top = (pipe_posi - 70) + 'vh';
        pipe_top.style.left = '100vw';
        document.body.appendChild(pipe_top);

        let pipe_bottom = document.createElement('div');
        pipe_bottom.className = 'pipe_sprite';
        pipe_bottom.style.top = (pipe_posi + pipe_gap) + 'vh';
        pipe_bottom.style.left = '100vw';
        pipe_bottom.setAttribute('increase_score', '1');
        document.body.appendChild(pipe_bottom);
      }
      pipe_separation++;
      animation_ids.current.push(requestAnimationFrame(createPipes));
    }

    function gameOver() {
      console.log("Game Over triggered");
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

      // Cancel all running animations
      animation_ids.current.forEach(id => cancelAnimationFrame(id));
      animation_ids.current = [];
    }

    // Add a small delay before starting game loops
    const startGameTimeout = setTimeout(() => {
      animation_ids.current.push(requestAnimationFrame(movePipes));
      animation_ids.current.push(requestAnimationFrame(applyGravity));
      animation_ids.current.push(requestAnimationFrame(createPipes));
      console.log("Game loops started after delay");
    }, 500); // 500ms delay to ensure everything is ready

    // Cleanup function
    return () => {
      console.log("Cleaning up effect");
      clearTimeout(startGameTimeout);
      document.removeEventListener('keydown', keyDownHandler);
      document.removeEventListener('keyup', keyUpHandler);
      animation_ids.current.forEach(id => cancelAnimationFrame(id));
      animation_ids.current = [];
    };
  }, [gameState, highScore, setHighScore, setTokens]); // Dependencies include gameState

  return (
    <div className='game-block'>
      <div className="background"></div>
      <img src={birdImg} alt="bird-img" className="bird" id="bird-1" />
      
      {gameState === 'Start' && (
        <StartScreen startGame={startGame} />
      )}
      
      <div className="score" style={{ display: gameState === 'Play' ? 'block' : 'none' }}>
        <span className="score_title">Score: </span>
        <span className="score_val">0</span>
      </div>
      
      {gameState === 'End' && (
        <div className="game-over-dialog">
          <div className="game-over-content">
            <h2 className="game-over-title">Game Over!</h2>
            <p className="game-over-text">Your Score: <span className="game-over-score">{currentScore}</span></p>
            <p className="game-over-text">High Score: <span className="game-over-highscore">{highScore}</span></p>
            <p className="game-over-instruction">Press <strong>Enter</strong> to Play Again</p>
            <button 
              className="start-button" 
              onClick={startGame}
              style={{ marginTop: '1.5rem' }}
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}