import React from "react";
import "./Profile.css";

const Profile = ({ account, highScore, skins, tokenBalance }) => {
  // Shorten wallet address like 0x1234...abcd
  const shortenAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="profile-container">
      <h2 className="profile-title">👤 Your Profile</h2>

      <div className="profile-card">
        <div className="profile-item">
          <h3>🏆 High Score</h3>
          <p>{highScore ?? 0}</p>
        </div>

        <div className="profile-item">
          <h3>🎨 Skins Owned</h3>
          <p>{skins?.length ?? 0}</p>
        </div>

        <div className="profile-item">
          <h3>🪙 Token Balance</h3>
          <p>{tokenBalance ?? 0} FLP</p>
        </div>

        <div className="profile-item">
          <h3>🔗 Wallet</h3>
          <p>{account ? shortenAddress(account) : "Not connected"}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;

