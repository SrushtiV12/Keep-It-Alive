import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ connectWallet, account, state, isConnecting, connectionError, tokens }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showError, setShowError] = useState(false);
  const location = useLocation();

  // Handle scrolling effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Show error message when connectionError changes
  useEffect(() => {
    if (connectionError) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [connectionError]);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Shorten the address (e.g., 0x1234...abcd)
  const shortenAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const closeMenu = () => {
      if (isOpen) setIsOpen(false);
    };
    
    document.body.addEventListener('click', closeMenu);
    return () => document.body.removeEventListener('click', closeMenu);
  }, [isOpen]);

  const handleConnectWallet = () => {
    if (!isConnecting) {
      connectWallet();
    }
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <span className="logo-emoji">🐤</span> FlappyChain
          </Link>
          
          <div className={`nav-links ${isOpen ? "open" : ""}`}>
            <Link 
              to="/" 
              className={location.pathname === "/" ? "active" : ""}
              onClick={() => setIsOpen(false)}
            >
              Game
            </Link>
            <Link 
              to="/profile" 
              className={location.pathname === "/profile" ? "active" : ""}
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>
            <Link 
              to="/store" 
              className={location.pathname === "/store" ? "active" : ""}
              onClick={() => setIsOpen(false)}
            >
              Store
            </Link>
          </div>
          
          <div className="nav-right">
            {account ? (
              <div className="wallet-connected">
                <div className="wallet-indicator connected"></div>
                <div className="wallet-address" title={account}>
                  {shortenAddress(account)}
                </div>
                <div className="token-balance">
                  <span className="token-icon">🪙</span>
                  {tokens || 0} Tokens
                </div>
                <div className="connection-status">Connected</div>
              </div>
            ) : (
              <button 
                onClick={handleConnectWallet} 
                className={`connect-btn ${isConnecting ? 'connecting' : ''}`}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <span className="loading-spinner"></span>
                    Connecting...
                  </>
                ) : (
                  <>
                    <span className="wallet-icon">🔗</span>
                    Connect Wallet
                  </>
                )}
              </button>
            )}
            
            <div 
              className="nav-toggle" 
              onClick={(e) => {
                e.stopPropagation();
                toggleMenu();
              }}
            >
              {isOpen ? "✕" : "☰"}
            </div>
          </div>
        </div>
      </nav>

      {/* Error notification */}
      {showError && connectionError && (
        <div className="error-notification">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{connectionError}</span>
            <button 
              className="error-close" 
              onClick={() => setShowError(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;