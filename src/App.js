// src/App.js
import React, { useState, useEffect } from 'react';
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
  const [highScore, setHighScore] = useState(localStorage.getItem("flappy-high-score") || 0);
  const [tokens, setTokens] = useState(100);
  const [ownedSkins, setOwnedSkins] = useState([]);  // Array to hold the skins the user owns
  const [currentSkin, setCurrentSkin] = useState(null);  // The skin that the user currently has selected

  const connectWallet = async () => {
    const contractAddress = "0xdc35d0343782399A9240590C6E6901d96dFC8134";
    const contractABI = abi.abi;

    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Metamask is not installed");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length === 0) {
        console.log("No account found");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      setState({ provider, signer, contract, address });
    } catch (error) {
      console.error("Error connecting to Metamask:", error);
    }
  };

  const handlePurchase = async (skin, price) => {
    if (tokens < price) {
      alert("Not enough tokens!");
      return;
    }
  
    // Subtract tokens after purchasing
    setTokens(prev => prev - price);
  
    // Add the skin to owned skins
    setOwnedSkins((prevSkins) => [...prevSkins, skin]);
  
    // ✅ Immediately set the purchased skin as current
    setCurrentSkin(skin);
  
    // Persist in localStorage
    localStorage.setItem("current-skin", JSON.stringify(skin));
  
    alert(`Successfully purchased ${skin.name || skin.id || 'skin'}`);
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

  return (
    <Router>
      <div className="bg-gradient-to-br from-indigo-100 to-blue-200 min-h-screen text-gray-900">
        {/* Navbar visible on all pages */}
        <Navbar connectWallet={connectWallet} account={account} state={state} />
        <Routes>
        <Route
  path="/"
  element={
    <Game
      highScore={highScore}
      setHighScore={setHighScore}
      tokens={tokens}
      setTokens={setTokens}
      currentSkin={currentSkin} // ✅ Pass current skin
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
