import React from 'react';

export const NetworkBadge = ({network}: {network: string}) => {
  switch (network) {
    case 'ropsten':
      return (
        <div className="rounded bg-pink-500 px-2 py-1 text-xs text-white">
          Ropsten Test Network
        </div>
      );
    case 'rinkeby':
      return (
        <div className="rounded bg-amber-500 px-2 py-1 text-xs text-white">
          Rinkeby Test Network
        </div>
      );
    case 'private':
      return (
        <div className="rounded bg-teal-500 px-2 py-1 text-xs text-white">
          Local Network
        </div>
      );
    default:
      return (
        <div className="rounded bg-green-500 px-2 py-1 text-xs text-white">
          Ethereum Main Network
        </div>
      );
  }
};

export default NetworkBadge;
