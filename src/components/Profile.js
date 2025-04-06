// Profile.js
import React from "react";
import "./Profile.css";

export default function Profile({ account, highScore, tokens, ownedSkins }) {
  return (
    <div className="profile-container">
      {/* <div className="profile-header">
        <h1>👤 Your Profile</h1>
        <p>Check your stats and wallet info</p>
      </div> */}

      <div className="profile-cards">
        <div className="profile-card">
          <div className="card-title">🏆 High Score</div>
          <div className="card-value">{highScore}</div>
        </div>

        <div className="profile-card">
          <div className="card-title">🎨 Skins Owned</div>
          <div className="card-value">{ownedSkins.length}</div>
        </div>

        <div className="profile-card">
          <div className="card-title">💰 Tokens</div>
          <div className="card-value">{tokens}</div>
        </div>

        <div className="profile-card">
          <div className="card-title">🔗 Wallet Address</div>
          <div className="card-value">
            {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Not connected"}
          </div>
        </div>
      </div>
    </div>
  );
}

