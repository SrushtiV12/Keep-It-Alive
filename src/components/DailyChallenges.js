import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DailyChallenges = ({ tokens, setTokens, highScore, totalGamesPlayed }) => {
  const location = useLocation();
  
  // Get today's date string for daily reset
  const getTodayDate = () => {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  };

  // Initialize challenges
  const initializeChallenges = () => {
    const today = getTodayDate();
    const savedDate = localStorage.getItem('challenges-date');
    
    // Reset challenges if it's a new day
    if (savedDate !== today) {
      const challenges = [
        { id: 1, title: 'Score 10 Points', description: 'Reach a score of 10 in a single game', target: 10, current: 0, reward: 20, completed: false, type: 'score' },
        { id: 2, title: 'Play 3 Games', description: 'Complete 3 games', target: 3, current: 0, reward: 15, completed: false, type: 'games' },
        { id: 3, title: 'Score 20 Points', description: 'Reach a score of 20 in a single game', target: 20, current: 0, reward: 30, completed: false, type: 'score' },
      ];
      
      localStorage.setItem('challenges-date', today);
      localStorage.setItem('challenges-data', JSON.stringify(challenges));
      localStorage.setItem('challenges-games-played', '0');
      return challenges;
    }
    
    // Load existing challenges
    const saved = localStorage.getItem('challenges-data');
    return saved ? JSON.parse(saved) : [];
  };

  const [challenges, setChallenges] = useState(initializeChallenges);
  const [gamesPlayedToday, setGamesPlayedToday] = useState(() => {
    const saved = localStorage.getItem('challenges-games-played');
    return saved ? parseInt(saved) : 0;
  });

  const getTodayBestScore = () => {
    const today = new Date();
    const todayKey = `challenges-today-best-score-${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    return parseInt(localStorage.getItem(todayKey) || '0');
  };

  useEffect(() => {
    const today = getTodayDate();
    const savedDate = localStorage.getItem('challenges-date');
    
    if (savedDate !== today) {
      const newChallenges = initializeChallenges();
      setChallenges(newChallenges);
      setGamesPlayedToday(0);
      return;
    }

    // Listen for score updates from game
    const handleScoreUpdate = (event) => {
      const newScore = event.detail.score;
      const todayBest = getTodayBestScore();
      if (newScore > todayBest) {
        // Update challenges when new score is achieved
        setChallenges(prevChallenges => {
          const updated = prevChallenges.map(challenge => {
            if (challenge.completed || challenge.type !== 'score') return challenge;
            
            const newCurrent = Math.min(newScore, challenge.target);
            const completed = newScore >= challenge.target;
            
            if (completed && !challenge.completed) {
              setTokens(prev => {
                const newTokens = prev + challenge.reward;
                localStorage.setItem("flappy-tokens", newTokens.toString());
                return newTokens;
              });
              showCompletionNotification(challenge);
            }
            
            return { ...challenge, current: newCurrent, completed };
          });
          localStorage.setItem('challenges-data', JSON.stringify(updated));
          return updated;
        });
      }
    };

    window.addEventListener('gameScoreUpdate', handleScoreUpdate);
    return () => window.removeEventListener('gameScoreUpdate', handleScoreUpdate);
  }, [setTokens]);

  // Update challenges when component mounts or stats change
  useEffect(() => {
    const today = getTodayDate();
    const savedDate = localStorage.getItem('challenges-date');
    
    if (savedDate !== today) {
      return; // Already handled above
    }

    const todayBestScore = getTodayBestScore();

    setChallenges(prevChallenges => {
      const updated = prevChallenges.map(challenge => {
        if (challenge.completed) return challenge;
        
        let newCurrent = challenge.current;
        let completed = false;
        
        if (challenge.type === 'score') {
          // Use today's best score
          newCurrent = Math.min(todayBestScore, challenge.target);
          if (todayBestScore >= challenge.target) {
            completed = true;
          }
        } else if (challenge.type === 'games') {
          const currentGames = parseInt(localStorage.getItem('challenges-games-played') || '0');
          newCurrent = currentGames;
          if (currentGames >= challenge.target) {
            completed = true;
          }
        }
        
        return { ...challenge, current: newCurrent, completed };
      });
      
      localStorage.setItem('challenges-data', JSON.stringify(updated));
      return updated;
    });
  }, [highScore]);

  // Get today's games played
  const getTodayGamesPlayed = () => {
    const today = new Date();
    const todayKey = `challenges-games-today-${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    return parseInt(localStorage.getItem(todayKey) || '0');
  };

  // Update games played challenge
  useEffect(() => {
    const today = getTodayDate();
    const savedDate = localStorage.getItem('challenges-date');
    
    if (savedDate !== today) {
      return;
    }

    // Listen for game started events
    const handleGameStarted = (event) => {
      const gamesToday = event.detail.gamesToday;
      setGamesPlayedToday(gamesToday);
      
      // Update challenges
      setChallenges(prev => {
        const updated = prev.map(challenge => {
          if (challenge.type === 'games' && !challenge.completed) {
            const newCurrent = Math.min(gamesToday, challenge.target);
            const completed = gamesToday >= challenge.target;
            
            if (completed && !challenge.completed) {
              setTokens(prevTokens => {
                const newTokens = prevTokens + challenge.reward;
                localStorage.setItem("flappy-tokens", newTokens.toString());
                return newTokens;
              });
              showCompletionNotification(challenge);
            }
            
            return { ...challenge, current: newCurrent, completed };
          }
          return challenge;
        });
        localStorage.setItem('challenges-data', JSON.stringify(updated));
        return updated;
      });
    };

    window.addEventListener('gameStarted', handleGameStarted);
    
    // Initialize with current games played today
    const currentGames = getTodayGamesPlayed();
    if (currentGames > 0) {
      setGamesPlayedToday(currentGames);
      setChallenges(prev => {
        const updated = prev.map(challenge => {
          if (challenge.type === 'games' && !challenge.completed) {
            const newCurrent = Math.min(currentGames, challenge.target);
            const completed = currentGames >= challenge.target;
            return { ...challenge, current: newCurrent, completed };
          }
          return challenge;
        });
        localStorage.setItem('challenges-data', JSON.stringify(updated));
        return updated;
      });
    }
    
    return () => window.removeEventListener('gameStarted', handleGameStarted);
  }, [setTokens]);

  const showCompletionNotification = (challenge) => {
    const notification = document.createElement('div');
    notification.className = 'challenge-completion-notification';
    notification.innerHTML = `
      <div class="challenge-notification-content">
        <div class="challenge-notification-icon">🎉</div>
        <div class="challenge-notification-text">
          <div class="challenge-notification-title">Challenge Completed!</div>
          <div class="challenge-notification-desc">${challenge.title}</div>
          <div class="challenge-notification-reward">+${challenge.reward} Tokens</div>
        </div>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  };

  const getProgressPercentage = (challenge) => {
    return Math.min((challenge.current / challenge.target) * 100, 100);
  };

  const completedCount = challenges.filter(c => c.completed).length;
  const totalRewards = challenges.filter(c => c.completed).reduce((sum, c) => sum + c.reward, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-blue-200 pt-20 pb-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <span className="text-5xl">🎯</span>
            Daily Challenges
          </h1>
          <p className="text-gray-600">Complete challenges to earn bonus tokens!</p>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-indigo-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-indigo-600">{completedCount}/{challenges.length}</div>
              <div className="text-sm text-gray-600 mt-1">Completed</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-600">+{totalRewards}</div>
              <div className="text-sm text-gray-600 mt-1">Tokens Earned</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-yellow-600">💰</div>
              <div className="text-sm text-gray-600 mt-1">Your Balance: {tokens || 0}</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className={`bg-white rounded-xl shadow-lg p-6 transition-all duration-300 ${
                challenge.completed
                  ? 'border-2 border-green-500 bg-green-50'
                  : 'border-2 border-gray-200 hover:shadow-xl'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">
                      {challenge.completed ? '✅' : '🎯'}
                    </span>
                    <div>
                      <h3 className={`text-xl font-bold ${challenge.completed ? 'text-green-700' : 'text-gray-800'}`}>
                        {challenge.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">{challenge.description}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${challenge.completed ? 'text-green-600' : 'text-indigo-600'}`}>
                    +{challenge.reward} 🪙
                  </div>
                  {challenge.completed && (
                    <div className="text-xs text-green-600 mt-1 font-semibold">COMPLETED</div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span className="font-semibold">
                    {challenge.current} / {challenge.target}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      challenge.completed
                        ? 'bg-green-500'
                        : 'bg-indigo-500'
                    }`}
                    style={{ width: `${getProgressPercentage(challenge)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 rounded-xl p-6 text-center">
          <p className="text-gray-600">
            <span className="font-semibold">💡 Tip:</span> Challenges reset daily at midnight. Complete them all for maximum rewards!
          </p>
        </div>
      </div>

      <style>{`
        .challenge-completion-notification {
          position: fixed;
          top: 100px;
          right: 20px;
          z-index: 10000;
          opacity: 0;
          transform: translateX(100%);
          transition: all 0.3s ease;
        }
        
        .challenge-completion-notification.show {
          opacity: 1;
          transform: translateX(0);
        }
        
        .challenge-notification-content {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          gap: 15px;
          min-width: 300px;
        }
        
        .challenge-notification-icon {
          font-size: 40px;
        }
        
        .challenge-notification-text {
          flex: 1;
        }
        
        .challenge-notification-title {
          font-weight: bold;
          font-size: 18px;
          margin-bottom: 5px;
        }
        
        .challenge-notification-desc {
          font-size: 14px;
          opacity: 0.9;
          margin-bottom: 5px;
        }
        
        .challenge-notification-reward {
          font-weight: bold;
          font-size: 16px;
          color: #fbbf24;
        }
      `}</style>
    </div>
  );
};

export default DailyChallenges;

