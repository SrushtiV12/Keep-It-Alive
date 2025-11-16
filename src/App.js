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
import DailyChallenges from './components/DailyChallenges';

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
  const [currentSkin, setCurrentSkin] = useState(() => {
    const savedSkin = localStorage.getItem("current-skin");
    return savedSkin ? JSON.parse(savedSkin) : 'default';
  });

  // Mock data for new profile features
  const [totalGamesPlayed, setTotalGamesPlayed] = useState(() => {
    const saved = localStorage.getItem("total-games-played");
    return saved ? parseInt(saved) : 0;
  });

  const [averageScore, setAverageScore] = useState(() => {
    const saved = localStorage.getItem("average-score");
    return saved ? parseFloat(saved) : 0;
  });

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
      
      // Update wallet balance from blockchain
      setTimeout(async () => {
        await updateWalletBalance();
      }, 1000);
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
  const incrementTokens = useCallback(async (amount = 1) => {
    console.log("incrementTokens function called with amount:", amount);
    
    // Update local state immediately for UI responsiveness
    setTokens(prevTokens => {
      const currentTokens = typeof prevTokens === 'number' && !isNaN(prevTokens) ? prevTokens : 0;
      const newTokens = currentTokens + amount;
      console.log(`Incrementing tokens: ${currentTokens} + ${amount} = ${newTokens}`);
      localStorage.setItem("flappy-tokens", newTokens.toString());
      return newTokens;
    });

    // If wallet is connected, transfer tokens from contract to wallet
    if (account && state.contract) {
      try {
        console.log("Transferring tokens from contract to wallet...");
        
        // Convert token amount to wei (18 decimals)
        const tokenAmountInWei = ethers.parseUnits(amount.toString(), 18);
        console.log(`Converting ${amount} tokens to wei: ${tokenAmountInWei.toString()}`);
        
        const tx = await state.contract.transferFromContract(account, tokenAmountInWei);
        await tx.wait();
        console.log("Tokens transferred successfully to wallet!");
        
        // Update local balance to match blockchain
        await updateWalletBalance();
      } catch (error) {
        console.error("Error transferring tokens to wallet:", error);
        // Don't revert local state - keep the UI responsive
      }
    }
  }, [account, state.contract]);

  // Function to update wallet balance from blockchain
  const updateWalletBalance = useCallback(async () => {
    if (account && state.contract) {
      try {
        const balance = await state.contract.balanceOf(account);
        // Convert balance from wei to tokens (18 decimals)
        const balanceInTokens = ethers.formatUnits(balance, 18);
        const balanceNumber = parseFloat(balanceInTokens);
        console.log("Wallet balance from blockchain (wei):", balance.toString());
        console.log("Wallet balance from blockchain (tokens):", balanceNumber);
        setTokens(balanceNumber);
        localStorage.setItem("flappy-tokens", balanceNumber.toString());
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
      }
    }
  }, [account, state.contract]);

  // Function to transfer tokens from contract to wallet
  const transferTokensToWallet = useCallback(async (amount) => {
    if (!account || !state.contract) {
      console.log("Wallet not connected or contract not available");
      return false;
    }

    try {
      console.log(`Transferring ${amount} tokens to wallet...`);
      
      // Convert token amount to wei (18 decimals)
      const tokenAmountInWei = ethers.parseUnits(amount.toString(), 18);
      console.log(`Converting ${amount} tokens to wei: ${tokenAmountInWei.toString()}`);
      
      const tx = await state.contract.transferFromContract(account, tokenAmountInWei);
      await tx.wait();
      console.log("Tokens transferred successfully!");
      
      // Update balance after transfer
      await updateWalletBalance();
      return true;
    } catch (error) {
      console.error("Error transferring tokens:", error);
      return false;
    }
  }, [account, state.contract, updateWalletBalance]);

  // Save ownedSkins to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("flappy-owned-skins", JSON.stringify(ownedSkins));
    console.log("Owned skins updated:", ownedSkins);
  }, [ownedSkins]);

  // Save total games played and average score to localStorage
  useEffect(() => {
    localStorage.setItem("total-games-played", totalGamesPlayed.toString());
    localStorage.setItem("average-score", averageScore.toString());
  }, [totalGamesPlayed, averageScore]);

  // Function to handle store navigation from profile
  const handleVisitStore = () => {
    window.location.href = '/store';
  };

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
                setTotalGamesPlayed={setTotalGamesPlayed}
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
                currentSkin={currentSkin}
                totalGamesPlayed={totalGamesPlayed}
                averageScore={averageScore}
                onVisitStore={handleVisitStore}
                transferTokensToWallet={transferTokensToWallet}
                updateWalletBalance={updateWalletBalance}
              />
            }
          />
          <Route
            path="/challenges"
            element={
              <DailyChallenges
                tokens={tokens}
                setTokens={setTokens}
                highScore={highScore}
                totalGamesPlayed={totalGamesPlayed}
              />
            }
          />

        </Routes>
      </div>
    </Router>
  );
}
