// App.js
import React, { useEffect, useState, useRef } from 'react';
import Navbar from './components/Navbar';
import Profile from './components/Profile';
import Store from './components/Store';
import birdImg from './assets/images/birdup.png';
import birdImg2 from './assets/images/bird copy.png';
import soundPoint from './assets/sounds/point.mp3';
import soundDie from './assets/sounds/die.mp3';
import './index.css';

export default function App() {
  const [gameState, setGameState] = useState('Start');
  const [currentScore, setCurrentScore] = useState(0);
  const [highScore, setHighScore] = useState(localStorage.getItem("flappy-high-score") || 0);
  const [tokens, setTokens] = useState(100);
  const [ownedSkins, setOwnedSkins] = useState(['default']);
  const [currentSkin, setCurrentSkin] = useState('default');
  const [page, setPage] = useState('game');
  const [account, setAccount] = useState(null);

  const gameStateRef = useRef('Start');
  const animation_ids = useRef([]);

  useEffect(() => {
    if (page !== 'game') return;

    let move_speed = 3, gravity = 0.5;
    const bird = document.querySelector('.bird');
    const img = document.getElementById('bird-1');
    const sound_point = new Audio(soundPoint);
    const sound_die = new Audio(soundDie);

    const score_val = document.querySelector('.score_val');
    const message = document.querySelector('.message');
    const scoreDisplay = document.querySelector('.score');

    let bird_dy = 0;
    let pipe_separation = 0;

    img.style.display = 'none';
    message.classList.add('messageStyle');

    const keyDownHandler = (e) => {
      if ((e.key === 'ArrowUp' || e.key === ' ') && gameStateRef.current === 'Play') {
        img.src = birdImg2;
        bird_dy = -7.6;
      }

      if (e.key === 'Enter' && gameStateRef.current !== 'Play') {
        startGame();
      }
    };

    const keyUpHandler = (e) => {
      if ((e.key === 'ArrowUp' || e.key === ' ') && gameStateRef.current === 'Play') {
        img.src = birdImg;
      }
    };

    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

    function startGame() {
      document.querySelectorAll('.pipe_sprite').forEach(pipe => pipe.remove());
      bird.style.top = '40vh';
      img.style.display = 'block';

      gameStateRef.current = 'Play';
      setGameState('Play');
      bird_dy = 0;
      score_val.innerHTML = '0';
      message.innerHTML = '';
      message.classList.remove('messageStyle');
      scoreDisplay.style.display = 'block';

      play();
    }

    function play() {
      const background = document.querySelector('.background').getBoundingClientRect();
      let bird_props = document.querySelector('.bird').getBoundingClientRect();
      const pipe_gap = 35;

      function movePipes() {
        if (gameStateRef.current !== 'Play') return;

        document.querySelectorAll('.pipe_sprite').forEach(pipe => {
          let pipe_props = pipe.getBoundingClientRect();
          bird_props = bird.getBoundingClientRect();

          if (pipe_props.right <= 0) {
            pipe.remove();
          } else {
            if (
              bird_props.left < pipe_props.left + pipe_props.width &&
              bird_props.left + bird_props.width > pipe_props.left &&
              bird_props.top < pipe_props.top + pipe_props.height &&
              bird_props.top + bird_props.height > pipe_props.top
            ) {
              gameOver();
              return;
            }

            if (
              pipe_props.right < bird_props.left &&
              pipe.increase_score === '1'
            ) {
              score_val.innerHTML = +score_val.innerHTML + 1;
              sound_point.play();
              pipe.increase_score = '0';
              setTokens(prev => prev + 1);
            }

            pipe.style.left = pipe_props.left - move_speed + 'px';
          }
        });

        animation_ids.current.push(requestAnimationFrame(movePipes));
      }

      function applyGravity() {
        if (gameStateRef.current !== 'Play') return;

        bird_dy += gravity;
        let currentTop = bird.getBoundingClientRect().top;

        if (currentTop <= 0 || currentTop + bird.clientHeight >= background.bottom) {
          gameOver();
          return;
        }

        bird.style.top = currentTop + bird_dy + 'px';
        animation_ids.current.push(requestAnimationFrame(applyGravity));
      }

      function createPipes() {
        if (gameStateRef.current !== 'Play') return;

        if (pipe_separation > 115) {
          pipe_separation = 0;
          let pipe_posi = Math.floor(Math.random() * 43) + 8;

          let pipe_top = document.createElement('div');
          pipe_top.className = 'pipe_sprite';
          pipe_top.style.top = (pipe_posi - 70) + 'vh';
          pipe_top.style.left = '100vw';
          document.body.appendChild(pipe_top);

          let pipe_bottom = document.createElement('div');
          pipe_bottom.className = 'pipe_sprite';
          pipe_bottom.style.top = (pipe_posi + pipe_gap) + 'vh';
          pipe_bottom.style.left = '100vw';
          pipe_bottom.increase_score = '1';
          document.body.appendChild(pipe_bottom);
        }

        pipe_separation++;
        animation_ids.current.push(requestAnimationFrame(createPipes));
      }

      animation_ids.current.push(requestAnimationFrame(movePipes));
      animation_ids.current.push(requestAnimationFrame(applyGravity));
      animation_ids.current.push(requestAnimationFrame(createPipes));
    }

    function gameOver() {
      gameStateRef.current = 'End';
      setGameState('End');

      const img = document.getElementById('bird-1');
      img.style.display = 'none';
      sound_die.play();

      let score = parseInt(document.querySelector('.score_val').innerHTML);
      setCurrentScore(score);

      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem("flappy-high-score", score);
      }

      document.querySelector('.score').style.display = 'none';

      animation_ids.current.forEach(id => cancelAnimationFrame(id));
      animation_ids.current = [];
    }

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
      document.removeEventListener('keyup', keyUpHandler);
      animation_ids.current.forEach(id => cancelAnimationFrame(id));
    };
  }, [highScore, page]);

  const buySkin = (skin, price) => {
    if (tokens >= price && !ownedSkins.includes(skin)) {
      setTokens(tokens - price);
      setOwnedSkins([...ownedSkins, skin]);
      return true;
    }
    return false;
  };

  const selectSkin = (skin) => {
    if (ownedSkins.includes(skin)) {
      setCurrentSkin(skin);
      return true;
    }
    return false;
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } catch (error) {
        console.error("Wallet connection failed", error);
      }
    } else {
      alert("MetaMask is not installed!");
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-100 to-blue-200 min-h-screen text-gray-900">
      <Navbar onNavigate={setPage} onConnect={connectWallet} account={account} />
      {page === 'game' && (
        <>
          <div className="background"></div>
          <img src={birdImg} alt="bird-img" className="bird" id="bird-1" />
          <div className="message messageStyle">
            Press <strong>Enter</strong> to Start <br />
            <span className="text-red-600">↑</span> ArrowUp or Space to Fly
          </div>
          <div className="score">
            <span className="score_title">Score: </span>
            <span className="score_val">0</span>
          </div>
          {gameState === 'End' && (
            <div className="dialog-box bg-white shadow-md rounded-lg p-4 text-center">
              <h2 className="text-2xl font-bold">Game Over!</h2>
              <p>Your Score: <strong>{currentScore}</strong></p>
              <p>High Score: <strong>{highScore}</strong></p>
              <p>Press <strong>Enter</strong> to Play Again</p>
            </div>
          )}
        </>
      )}
      {page === 'profile' && (
        <Profile highScore={highScore} tokens={tokens} ownedSkins={ownedSkins} currentSkin={currentSkin} />
      )}
      {page === 'store' && (
        <Store tokens={tokens} ownedSkins={ownedSkins} currentSkin={currentSkin} buySkin={buySkin} selectSkin={selectSkin} />
      )}
    </div>
  );
}
