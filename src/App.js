// src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import abi from "./abis/tokenABI.json";
import { ethers } from "ethers";
import Navbar from "./components/Navbar";
import Game from "./components/Game";
import Profile from './components/Profile';
import './index.css';
import Store from './components/Store';

export default function App() {
  const [state, setState] = useState({
    provider: null,
    signer: null,
    contract: null
  });

  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [highScore, setHighScore] = useState(localStorage.getItem("flappy-high-score") || 0);
  const [tokens, setTokens] = useState(() => {
    const savedTokens = localStorage.getItem("flappy-tokens");
    let initialTokens = 100; // Default value
    
    if (savedTokens) {
      const parsed = parseInt(savedTokens);
      if (!isNaN(parsed)) {
        initialTokens = parsed;
      } else {
        console.warn("Invalid tokens in localStorage, resetting to 100");
        localStorage.removeItem("flappy-tokens");
      }
    }
    
    console.log("Initializing tokens:", initialTokens, "Type:", typeof initialTokens);
    return initialTokens;
  });
  const [ownedSkins, setOwnedSkins] = useState(() => {
    const savedOwnedSkins = localStorage.getItem("flappy-owned-skins");
    return savedOwnedSkins ? JSON.parse(savedOwnedSkins) : ['default'];
  });
  const [currentSkin, setCurrentSkin] = useState(null);

  const contractAddress = "0xdc35d0343782399A9240590C6E6901d96dFC8134";
  const contractABI = abi.abi;

  // Check if MetaMask is installed
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        setConnectionError("MetaMask is not installed. Please install MetaMask to play!");
        return false;
      }

      // Check if user is already connected
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0) {
        await connectWalletWithAccount(accounts[0]);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking wallet connection:", error);
      setConnectionError("Failed to check wallet connection");
      return false;
    }
  };

  // Connect wallet with a specific account
  const connectWalletWithAccount = async (accountAddress) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      setAccount(accountAddress);
      setState({ provider, signer, contract });
      setConnectionError(null);
      
      // Store connection status
      localStorage.setItem("wallet-connected", "true");
      localStorage.setItem("wallet-address", accountAddress);
      
      console.log("Wallet connected successfully:", accountAddress);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setConnectionError("Failed to connect wallet");
    }
  };

  const connectWallet = async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    setConnectionError(null);

    try {
      const { ethereum } = window;
      if (!ethereum) {
        setConnectionError("MetaMask is not installed. Please install MetaMask to play!");
        setIsConnecting(false);
        return;
      }

      // Request account access
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length === 0) {
        setConnectionError("No accounts found. Please connect your MetaMask wallet.");
        setIsConnecting(false);
        return;
      }

      await connectWalletWithAccount(accounts[0]);
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      if (error.code === 4001) {
        setConnectionError("Connection rejected by user");
      } else {
        setConnectionError("Failed to connect wallet. Please try again.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle account changes
  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      setAccount(null);
      setState({ provider: null, signer: null, contract: null });
      localStorage.removeItem("wallet-connected");
      localStorage.removeItem("wallet-address");
      setConnectionError("Wallet disconnected");
    } else {
      // User switched accounts
      connectWalletWithAccount(accounts[0]);
    }
  };

  // Handle chain changes
  const handleChainChanged = () => {
    window.location.reload();
  };

  // Set up MetaMask event listeners
  useEffect(() => {
    const { ethereum } = window;
    if (ethereum) {
      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);

      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // Auto-connect on page load if previously connected
  useEffect(() => {
    const wasConnected = localStorage.getItem("wallet-connected");
    if (wasConnected === "true") {
      checkIfWalletIsConnected();
    }
  }, []);

  // Clear corrupted token data on first load
  useEffect(() => {
    const savedTokens = localStorage.getItem("flappy-tokens");
    if (savedTokens && (isNaN(parseInt(savedTokens)) || savedTokens === "NaN")) {
      console.log("Clearing corrupted token data");
      localStorage.removeItem("flappy-tokens");
      setTokens(100);
    }
  }, []);

  const handlePurchase = async (skin) => {
    const price = skin.price || 0;
    if (tokens < price) {
      alert("Not enough tokens!");
      return;
    }
  
    setTokens(prev => {
      const newTokens = prev - price;
      console.log(`Purchase: ${skin.name} for ${price} tokens. Previous: ${prev}, New: ${newTokens}`);
      return newTokens;
    });
    setOwnedSkins((prevSkins) => [...prevSkins, skin.id]);
    setCurrentSkin(skin);
    localStorage.setItem("current-skin", JSON.stringify(skin));
    alert(`Successfully purchased ${skin.name} for ${price} tokens!`);
  };

  useEffect(() => {
    const savedSkin = localStorage.getItem("current-skin");
    if (savedSkin) {
      setCurrentSkin(JSON.parse(savedSkin));
    }
  }, []);
  
  useEffect(() => {
    if (currentSkin) {
      localStorage.setItem("current-skin", JSON.stringify(currentSkin));
    }
  }, [currentSkin]);

  // Save tokens to localStorage whenever they change
  useEffect(() => {
    if (typeof tokens === 'number' && !isNaN(tokens)) {
      localStorage.setItem("flappy-tokens", tokens.toString());
      console.log("Tokens updated in App.js:", tokens, "Type:", typeof tokens);
    } else {
      console.error("Invalid tokens detected:", tokens);
      setTokens(100); // Reset to default
    }
  }, [tokens]);

  // Create a robust token increment function
  const incrementTokens = useCallback((amount = 1) => {
    console.log("incrementTokens function called with amount:", amount);
    setTokens(prevTokens => {
      // Ensure prevTokens is a valid number
      const currentTokens = typeof prevTokens === 'number' && !isNaN(prevTokens) ? prevTokens : 0;
      console.log("Previous tokens:", currentTokens, "Type:", typeof currentTokens);
      const newTokens = currentTokens + amount;
      console.log(`Incrementing tokens: ${currentTokens} + ${amount} = ${newTokens}`);
      localStorage.setItem("flappy-tokens", newTokens.toString());
      return newTokens;
    });
  }, []);

  // Save ownedSkins to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("flappy-owned-skins", JSON.stringify(ownedSkins));
    console.log("Owned skins updated:", ownedSkins);
  }, [ownedSkins]);

  return (
    <Router>
      <div className="bg-gradient-to-br from-indigo-100 to-blue-200 min-h-screen text-gray-900">
        <Navbar 
          connectWallet={connectWallet} 
          account={account} 
          state={state}
          isConnecting={isConnecting}
          connectionError={connectionError}
          tokens={tokens}
        />
        <Routes>
          <Route
            path="/"
            element={
              <Game
                highScore={highScore}
                setHighScore={setHighScore}
                tokens={tokens}
                setTokens={setTokens}
                incrementTokens={incrementTokens}
                currentSkin={currentSkin}
                account={account}
                connectWallet={connectWallet}
                isConnecting={isConnecting}
              />
            }
          />
          <Route
            path="/store"
            element={
              <Store
                account={account}
                contract={state.contract}
                tokens={tokens}
                setTokens={setTokens}
                ownedSkins={ownedSkins}
                setOwnedSkins={setOwnedSkins}
                currentSkin={currentSkin}
                setCurrentSkin={setCurrentSkin}
                handlePurchase={handlePurchase}
              />
            }
          />
          <Route
            path="/profile"
            element={
              <Profile
                account={account}
                highScore={highScore}
                tokens={tokens}
                ownedSkins={ownedSkins}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}
