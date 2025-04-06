import React from 'react';

const SKINS = [
  { id: "default", name: "Default Bird" },
  { id: "golden", name: "Golden Bird" },
  { id: "robot", name: "Robot Bird" },
  { id: "ninja", name: "Ninja Bird" },
  { id: "rainbow", name: "Rainbow Bird" },
];

export default function Profile({ highScore, tokens, ownedSkins, currentSkin }) {
  const ownedSkinNames = SKINS.filter(s => ownedSkins.includes(s.id)).map(s => s.name);
  const currentSkinName = SKINS.find(s => s.id === currentSkin)?.name || "Default Bird";

  return (
    <div className="p-6 text-white">
      <h2 className="text-3xl text-purple-400 mb-4">Profile</h2>
      <p><strong>High Score:</strong> {highScore}</p>
      <p><strong>Tokens:</strong> {tokens}</p>
      <p><strong>Skins Owned:</strong> {ownedSkins.length}</p>
      <p><strong>Current Skin:</strong> {currentSkinName}</p>
    </div>
  );
}
