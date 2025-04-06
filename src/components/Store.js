import React from 'react';
import './Store.css';
import skins from '../data/skins';

const Store = ({ tokens, ownedSkins, handlePurchase, currentSkin, setCurrentSkin }) => {
  const handleSelectSkin = (skin) => {
    setCurrentSkin(skin);
  };

  return (
    <div className="store-container">
      <div className="store-header">
        <h1>Store</h1>
        <div className="token-balance">
          <span className="token-icon">💰</span>
          <span>{tokens} Tokens</span>
        </div>
      </div>

      <div className="skins-grid">
        {skins.map((skin) => (
          <div key={skin.id} className={`skin-card ${ownedSkins.includes(skin.id) ? 'owned' : ''}`}>
            <div className="skin-image-container">
              <img src={skin.image} alt={skin.name} className="skin-image" />
              {ownedSkins.includes(skin.id) && <span className="owned-badge">Owned</span>}
            </div>
            <div className="skin-info">
              <h3>{skin.name}</h3>
              <div className="skin-price">{skin.price} Tokens</div>
            </div>
            <div className="skin-actions">
              {ownedSkins.includes(skin.id) ? (
                <button
                  className={`select-btn ${currentSkin?.id === skin.id ? 'selected' : ''}`}
                  onClick={() => handleSelectSkin(skin)}
                >
                  {currentSkin?.id === skin.id ? 'Selected' : 'Select'}
                </button>
              ) : (
                <button
                  className="buy-btn"
                  onClick={() => handlePurchase(skin)}
                  disabled={tokens < skin.price}
                >
                  Buy
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Store;