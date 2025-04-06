import React, { useEffect, useRef, useState } from 'react';
import birdImg from '../assets/images/birdup.png'; // Fallback
import birdImg2 from '../assets/images/bird copy.png'; // Fallback flap
import soundPoint from '../assets/sounds/point.mp3';
import soundDie from '../assets/sounds/die.mp3';
import StartScreen from './StartScreen';
import '../index.css';

export default function Game({ highScore, setHighScore, tokens, setTokens, currentSkin }) {
  const [gameState, setGameState] = useState('Start');
  const [currentScore, setCurrentScore] = useState(0);
  const gameStateRef = useRef('End');
  const animation_ids = useRef([]);
  const bird_dy_ref = useRef(0);
  const isDefaultBird = !currentSkin; // true if no purchased skin is selected
  const birdImage = currentSkin?.image || birdImg;
  const birdFlapImage = currentSkin?.flapImage || birdImg2;

  // Function to start game
  const startGame = () => {
    document.querySelectorAll('.pipe_sprite').forEach(pipe => pipe.remove());
    setCurrentScore(0);

    const bird = document.querySelector('.bird');
    const img = document.getElementById('bird-1');
    if (bird && img) {
      bird.style.top = '40vh';
      img.style.display = 'block';
    }

    gameStateRef.current = 'Play';
    setGameState('Play');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && gameStateRef.current === 'End') startGame();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (gameState !== 'Play') return;

    let move_speed = 4.5;
    let gravity = 0.35;
    bird_dy_ref.current = 0;
    let pipe_separation = 0;

    const bird = document.querySelector('.bird');
    const img = document.getElementById('bird-1');
    const background = document.querySelector('.background');
    const score_val = document.querySelector('.score_val');
    const scoreDisplay = document.querySelector('.score');

    bird.style.top = '40vh';
    img.style.display = 'block';
    score_val.innerHTML = '0';
    scoreDisplay.style.display = 'block';

    const sound_point = new Audio(soundPoint);
    const sound_die = new Audio(soundDie);

    const keyDownHandler = (e) => {
      if ((e.key === 'ArrowUp' || e.key === ' ') && gameStateRef.current === 'Play') {
        if (e.key === ' ') e.preventDefault();
        if (isDefaultBird) {
          img.src = birdFlapImage;
        }
        bird_dy_ref.current = -7.0;
        const currentTop = parseFloat(window.getComputedStyle(bird).getPropertyValue('top'));
        bird.style.top = (currentTop - 6) + 'px';
      }
    };

    const keyUpHandler = (e) => {
      if ((e.key === 'ArrowUp' || e.key === ' ') && gameStateRef.current === 'Play') {
        if (isDefaultBird) {
          img.src = birdImage;
        }
      }
    };

    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

    function movePipes() {
      if (gameStateRef.current !== 'Play') return;
      document.querySelectorAll('.pipe_sprite').forEach(pipe => {
        let pipe_props = pipe.getBoundingClientRect();
        let bird_props = bird.getBoundingClientRect();

        if (pipe_props.right <= 0) pipe.remove();
        else {
          if (
            bird_props.left < pipe_props.left + pipe_props.width - 5 &&
            bird_props.left + bird_props.width - 5 > pipe_props.left &&
            bird_props.top < pipe_props.top + pipe_props.height - 5 &&
            bird_props.top + bird_props.height - 5 > pipe_props.top
          ) return gameOver();

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

      bird_dy_ref.current += gravity;
      if (bird_dy_ref.current > 8) bird_dy_ref.current = 8;

      let currentTop = bird.getBoundingClientRect().top;
      let backgroundRect = background.getBoundingClientRect();

      if (currentTop <= 0 || currentTop + bird.clientHeight >= backgroundRect.bottom) return gameOver();

      bird.style.top = currentTop + bird_dy_ref.current + 'px';
      animation_ids.current.push(requestAnimationFrame(applyGravity));
    }

    function createPipes() {
      if (gameStateRef.current !== 'Play') return;

      if (pipe_separation > 80) {
        pipe_separation = 0;
        let pipe_posi = Math.floor(Math.random() * 43) + 8;
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
      gameStateRef.current = 'End';
      setGameState('End');
      img.style.display = 'none';
      sound_die.play();

      const score = parseInt(score_val.innerHTML);
      setCurrentScore(score);
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem("flappy-high-score", score);
      }

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
    };
  }, [gameState]);

  return (
    <div className='game-block'>
      <div className="background"></div>
      <img src={birdImage} alt="bird" className="bird" id="bird-1" />
      {gameState === 'Start' && <StartScreen startGame={startGame} />}
      <div className="score" style={{ display: gameState === 'Play' ? 'block' : 'none' }}>
        <span className="score_title">Score: </span>
        <span className="score_val">0</span>
      </div>
      {gameState === 'End' && (
        <div className="game-over-dialog">
          <div className="game-over-content">
            <h2>Game Over!</h2>
            <p>Your Score: <span>{currentScore}</span></p>
            <p>High Score: <span>{highScore}</span></p>
            <p>Press <strong>Enter</strong> to Play Again</p>
            <button className="start-button" onClick={startGame}>PLAY AGAIN</button>
          </div>
        </div>
      )}
    </div>
  );
}