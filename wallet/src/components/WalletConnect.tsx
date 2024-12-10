import { useMetaMask } from '../hooks/useMetaMask';

export const WalletConnect = () => {
  const { isConnected, account, balance, chainId, error, connectWallet, disconnectWallet } = useMetaMask();

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {!isConnected ? (
        <button
          onClick={connectWallet}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Connect MetaMask
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <p className="text-gray-600">Account:</p>
            <p className="font-mono break-all">{account}</p>
          </div>
          
          <div className="flex flex-col space-y-2">
            <p className="text-gray-600">Balance:</p>
            <p className="font-mono">{balance} ETH</p>
          </div>
          
          <div className="flex flex-col space-y-2">
            <p className="text-gray-600">Chain ID:</p>
            <p className="font-mono">{chainId}</p>
          </div>
          
          <button
            onClick={disconnectWallet}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};
