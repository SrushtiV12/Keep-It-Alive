import React from 'react';

function Navbar(props) {
  const handleNavigate = (page) => {
    props.onNavigate(page);
  };

  const handleConnect = () => {
    props.onConnectWallet();
  };

  return React.createElement(
    'nav',
    { className: 'bg-gray-800 text-white p-4 flex justify-between items-center' },
    React.createElement(
      'div',
      { className: 'space-x-4' },
      React.createElement(
        'button',
        {
          className: 'bg-blue-600 px-4 py-2 rounded hover:bg-blue-700',
          onClick: () => handleNavigate('game')
        },
        'Game'
      ),
      React.createElement(
        'button',
        {
          className: 'bg-green-600 px-4 py-2 rounded hover:bg-green-700',
          onClick: () => handleNavigate('store')
        },
        'Store'
      ),
      React.createElement(
        'button',
        {
          className: 'bg-purple-600 px-4 py-2 rounded hover:bg-purple-700',
          onClick: () => handleNavigate('profile')
        },
        'Profile'
      )
    ),
    React.createElement(
      'div',
      {},
      React.createElement(
        'button',
        {
          className: 'bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-600',
          onClick: handleConnect
        },
        props.walletAddress
          ? `${props.walletAddress.substring(0, 6)}...${props.walletAddress.slice(-4)}`
          : 'Connect Wallet'
      )
    )
  );
}

export default Navbar;
