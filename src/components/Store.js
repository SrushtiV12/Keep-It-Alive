import React from 'react';

const SKINS = [
  { id: "default", name: "Default Bird", price: 0 },
  { id: "golden", name: "Golden Bird", price: 50 },
  { id: "robot", name: "Robot Bird", price: 100 },
  { id: "ninja", name: "Ninja Bird", price: 150 },
  { id: "rainbow", name: "Rainbow Bird", price: 200 },
];

export default function Store({ tokens, ownedSkins, currentSkin, buySkin, selectSkin }) {
  return (
    <div className="p-6 text-white">
      <h2 className="text-3xl text-purple-400 mb-4">Store</h2>
      <p className="mb-4">You have <strong className="text-yellow-300">{tokens}</strong> tokens.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SKINS.map(skin => (
          <div key={skin.id} className="border border-purple-500 p-4 rounded bg-gray-800">
            <h3 className="text-xl font-bold text-purple-300 mb-2">{skin.name}</h3>
            <p>Price: {skin.price} Tokens</p>
            {ownedSkins.includes(skin.id) ? (
              <button
                onClick={() => selectSkin(skin.id)}
                disabled={currentSkin === skin.id}
                className="mt-2 px-4 py-2 rounded bg-purple-600 text-white"
              >
                {currentSkin === skin.id ? "Selected" : "Select"}
              </button>
            ) : (
              <button
                onClick={() => buySkin(skin.id, skin.price)}
                disabled={tokens < skin.price}
                className="mt-2 px-4 py-2 rounded bg-yellow-500 text-black"
              >
                Buy
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
