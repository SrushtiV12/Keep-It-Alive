// src/components/Store.js
import React, { useEffect, useMemo } from 'react';
import './Store.css';
import skins from '../data/skins';

const Store = ({
  tokens = 0,
  ownedSkins = [],
  handlePurchase,
  currentSkin,
  setCurrentSkin,
  highScore = 0,
  setOwnedSkins,
}) => {
  console.log('Store component - tokens:', tokens, 'type:', typeof tokens);

  const ensureDefaultSkinSelected = () => {
    if (!currentSkin && Array.isArray(ownedSkins) && ownedSkins.includes('default')) {
      const defaultSkin = skins.find((skin) => skin.id === 'default');
      if (defaultSkin && setCurrentSkin) {
        setCurrentSkin(defaultSkin);
      }
    }
  };

  useEffect(() => {
    ensureDefaultSkinSelected();
  }, [currentSkin, ownedSkins, setCurrentSkin]);

  const todayKeyString = () => {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  };

  const dailyChallengeStatus = useMemo(() => {
    const status = {
      completed: 0,
      total: 0,
      achieved: false,
    };

    try {
      const saved = localStorage.getItem('challenges-data');
      const savedDate = localStorage.getItem('challenges-date');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          status.total = parsed.length;
          status.completed = parsed.filter((challenge) => challenge.completed).length;
          if (savedDate === todayKeyString() && status.total > 0 && status.completed === status.total) {
            status.achieved = true;
            localStorage.setItem('flappy-earned-challenge_champion', 'true');
          }
        }
      }
      if (!status.achieved) {
        status.achieved = localStorage.getItem('flappy-earned-challenge_champion') === 'true';
      }
    } catch (error) {
      console.error('Failed to read daily challenge progress:', error);
    }

    return status;
  }, [ownedSkins]); // depends on ownedSkins because we may add earned skins

  useEffect(() => {
    const earnedDailySkin = localStorage.getItem('flappy-earned-challenge_champion') === 'true';
    if (earnedDailySkin && !ownedSkins.includes('challenge_champion') && typeof setOwnedSkins === 'function') {
      setOwnedSkins((prevOwned = []) => {
        if (prevOwned.includes('challenge_champion')) return prevOwned;
        const updated = [...prevOwned, 'challenge_champion'];
        return updated;
      });
    }
  }, [ownedSkins, setOwnedSkins]);

  const handleSelectSkin = (skin) => {
    if (setCurrentSkin) setCurrentSkin(skin);
  };

  const handleClaimSkin = (skin) => {
    if (!setOwnedSkins || ownedSkins.includes(skin.id)) return;

    setOwnedSkins((prevOwned = []) => {
      if (prevOwned.includes(skin.id)) return prevOwned;
      return [...prevOwned, skin.id];
    });

    if (skin.unlockType === 'dailyChallenges') {
      localStorage.setItem('flappy-earned-challenge_champion', 'true');
    }

    if (setCurrentSkin) setCurrentSkin(skin);
    // optional user feedback
    // alert(`Unlocked ${skin.name}!`);
  };

  const getRequirementStatus = (skin) => {
    if (!skin.unlockType) {
      return { unlocked: true, message: null, statusText: null };
    }

    if (skin.unlockType === 'highScore') {
      const requiredScore = skin.unlockValue || 0;
      const unlocked = (highScore || 0) >= requiredScore;
      const progressText = `Best score: ${Math.min(highScore || 0, requiredScore)}/${requiredScore}`;
      return {
        unlocked,
        message: skin.unlockDescription || `Reach a high score of ${requiredScore}.`,
        statusText: unlocked ? 'Requirement complete!' : progressText,
      };
    }

    if (skin.unlockType === 'dailyChallenges') {
      const unlocked = dailyChallengeStatus.achieved;
      const message = skin.unlockDescription || 'Complete all daily challenges in a single day.';
      const statusText = unlocked
        ? 'Requirement complete!'
        : dailyChallengeStatus.total > 0
        ? `${dailyChallengeStatus.completed}/${dailyChallengeStatus.total} challenges completed today`
        : 'Complete each daily challenge to unlock.';

      return {
        unlocked,
        message,
        statusText,
      };
    }

    return {
      unlocked: false,
      message: 'This item requires a special achievement.',
      statusText: '',
    };
  };

  return (
    <div className="store-container">
      <div className="store-header">
        <h1>Store</h1>
        <div className="token-balance">
          <span className="token-icon">💰</span>
          <span>{tokens || 0} Tokens</span>
        </div>
      </div>

      <div className="skins-grid">
        {skins.map((skin) => {
          const owned = Array.isArray(ownedSkins) && ownedSkins.includes(skin.id);
          const requirement = getRequirementStatus(skin);
          const isEarnedOnly = Boolean(skin.unlockType);
          const canClaim = isEarnedOnly && requirement.unlocked && !owned;

          const imageStyle = skin.filter ? { filter: skin.filter } : undefined;

          return (
            <div key={skin.id} className={`skin-card ${owned ? 'owned' : ''}`}>
              <div className="skin-image-container">
                <img src={skin.image} alt={skin.name} className="skin-image" style={imageStyle} />
                {owned && <span className="owned-badge">Owned</span>}
                {isEarnedOnly && (
                  <span className={`unlock-badge ${requirement.unlocked ? 'unlocked' : 'locked'}`}>
                    {requirement.unlocked ? 'Unlocked' : 'Earned Only'}
                  </span>
                )}
              </div>

              <div className="skin-info">
                <h3>{skin.name}</h3>
                <div className="skin-price">{skin.price === 0 ? 'Free' : `${skin.price} Tokens`}</div>
                {requirement.message && (
                  <div className={`skin-requirement ${requirement.unlocked ? 'met' : ''}`}>
                    <div>{requirement.message}</div>
                    {requirement.statusText && <div>{requirement.statusText}</div>}
                  </div>
                )}
              </div>

              <div className="skin-actions">
                {owned ? (
                  <button
                    className={`select-btn ${currentSkin?.id === skin.id ? 'selected' : ''}`}
                    onClick={() => handleSelectSkin(skin)}
                  >
                    {currentSkin?.id === skin.id ? 'Selected' : 'Select'}
                  </button>
                ) : isEarnedOnly ? (
                  canClaim ? (
                    <button className="claim-btn" onClick={() => handleClaimSkin(skin)}>
                      Claim Unlock
                    </button>
                  ) : (
                    <button className="locked-btn" disabled>
                      Locked
                    </button>
                  )
                ) : (
                  <button
                    className="buy-btn"
                    onClick={() => handlePurchase(skin)}
                    disabled={(tokens || 0) < (skin.price || 0)}
                  >
                    {(tokens || 0) < (skin.price || 0) ? `Need ${skin.price - (tokens || 0)} more` : `Buy for ${skin.price}`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Store;
