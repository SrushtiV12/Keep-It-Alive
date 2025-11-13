// Profile.js
import React, { useState } from "react";
import skins from "../data/skins";

export default function Profile({ 
  account, 
  highScore, 
  tokens, 
  ownedSkins, 
  currentSkin = 'default',
  totalGamesPlayed = 0,
  averageScore = 0,
  onVisitStore,
  transferTokensToWallet,
  updateWalletBalance
}) {
  const [isConnected] = useState(!!account);

  // Mock data for new features - replace with actual data from props
  const achievements = [
    { id: 1, name: "First Flight", description: "Play your first game", unlocked: true, icon: "🦅" },
    { id: 2, name: "High Flyer", description: "Score 50+ points", unlocked: highScore >= 50, icon: "⭐" },
    { id: 3, name: "Token Collector", description: "Earn 100+ tokens", unlocked: tokens >= 100, icon: "💰" },
    { id: 4, name: "Skin Master", description: "Own 3+ skins", unlocked: ownedSkins.length >= 3, icon: "🎨" },
    { id: 5, name: "Legendary Player", description: "Score 100+ points", unlocked: highScore >= 100, icon: "👑" },
    { id: 6, name: "Daily Player", description: "Play 7 days in a row", unlocked: false, icon: "📅" },
  ];

  const transactionHistory = [
    { id: 1, type: "earned", amount: 15, description: "High score bonus", timestamp: "2 hours ago" },
    { id: 2, type: "spent", amount: -30, description: "Purchased Brown Browny skin", timestamp: "1 day ago" },
    { id: 3, type: "earned", amount: 10, description: "Game completion", timestamp: "2 days ago" },
    { id: 4, type: "earned", amount: 25, description: "Achievement bonus", timestamp: "3 days ago" },
  ];

  const getCurrentSkinData = () => {
    return skins.find(skin => skin.id === currentSkin) || skins[0];
  };

  const currentSkinData = getCurrentSkinData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Wallet Info */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              🎮 FlappyChain Profile
            </h1>
            <p className="text-gray-600 mt-2">Your gaming journey and achievements</p>
          </div>
          
          {/* Wallet Status */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4 lg:mt-0">
            <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full">
              <span className="text-sm font-medium">💰 {tokens} Tokens</span>
            </div>
            
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full">
              <span className="text-sm font-medium">
                {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Not connected"}
              </span>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">🏆 High Score</p>
                <p className="text-3xl font-bold text-indigo-600">{highScore}</p>
              </div>
              <div className="text-4xl">🏆</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">🎮 Games Played</p>
                <p className="text-3xl font-bold text-green-600">{totalGamesPlayed}</p>
              </div>
              <div className="text-4xl">🎮</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">📊 Average Score</p>
                <p className="text-3xl font-bold text-orange-600">{averageScore.toFixed(1)}</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">🎨 Skins Owned</p>
                <p className="text-3xl font-bold text-purple-600">{ownedSkins.length}</p>
              </div>
              <div className="text-4xl">🎨</div>
            </div>
          </div>
        </div>

        {/* Current Skin and Store Button */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🎯 Current Skin</h2>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <img 
                  src={currentSkinData.image} 
                  alt={currentSkinData.name}
                  className="w-12 h-12 object-contain"
                  style={currentSkinData.filter ? { filter: currentSkinData.filter } : undefined}
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{currentSkinData.name}</h3>
                <p className="text-gray-600">Currently equipped</p>
                <p className="text-sm text-gray-500">Price: {currentSkinData.price} tokens</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-lg text-white">
            <h2 className="text-2xl font-bold mb-4">🛍️ Store</h2>
            <p className="text-indigo-100 mb-6">Discover new skins and unlockables!</p>
            <button 
              onClick={onVisitStore}
              className="w-full bg-white text-indigo-600 font-bold py-3 px-6 rounded-xl hover:bg-indigo-50 transition-colors duration-300 shadow-lg mb-4"
            >
              Visit Store
            </button>
            
            {isConnected && (
              <div className="border-t border-indigo-400 pt-4 mt-4">
                <h3 className="text-lg font-bold mb-2">💰 Token Management</h3>
                <p className="text-indigo-100 text-sm mb-4">Transfer earned tokens to your wallet</p>
                <button 
                  onClick={() => transferTokensToWallet && transferTokensToWallet(tokens)}
                  className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-300"
                >
                  Transfer {tokens} Tokens to Wallet
                </button>
                <button 
                  onClick={() => updateWalletBalance && updateWalletBalance()}
                  className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300 mt-2"
                >
                  Refresh Balance
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Achievements Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🏅 Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id}
                className={`p-4 rounded-xl text-center transition-all duration-300 ${
                  achievement.unlocked 
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <h3 className="font-bold text-sm mb-1">{achievement.name}</h3>
                <p className="text-xs opacity-80">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📈 Recent Transactions</h2>
          <div className="space-y-4">
            {transactionHistory.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'earned' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {transaction.type === 'earned' ? '➕' : '➖'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{transaction.description}</p>
                    <p className="text-sm text-gray-500">{transaction.timestamp}</p>
                  </div>
                </div>
                <div className={`font-bold ${
                  transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'earned' ? '+' : ''}{transaction.amount} tokens
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

