// src/components/Navbar.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ connectWallet, account }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Shorten the address (e.g., 0x1234...abcd)
  const shortenAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">🐤 Bird Game</div>
      <div className={`nav-links ${isOpen ? "open" : ""}`}>
        <Link to="/" onClick={() => setIsOpen(false)}>Game</Link>
        <Link to="/profile" onClick={() => setIsOpen(false)}>Profile</Link>
      </div>
      <div className="nav-right">
        {account ? (
          <div className="wallet-address">
            {shortenAddress(account)}
          </div>
        ) : (
          <button onClick={connectWallet} className="connect-btn">
            Connect Wallet
          </button>
        )}
        <div className="nav-toggle" onClick={toggleMenu}>
          &#9776;
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
