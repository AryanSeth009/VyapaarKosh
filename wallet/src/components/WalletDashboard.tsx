import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { ArrowUpIcon, ArrowDownIcon, ArrowsRightLeftIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useWalletStore } from '@/stores/walletStore';
import WalletTransactions from './wallet/WalletTransactions';
import PriceChart from './Dashboard/PriceChart';
import { toast } from 'react-hot-toast';
import { getWalletBalance } from '@/utils/walletUtils';
import CreateWalletModal from './CreateWalletModal';
import ImportWalletModal from './ImportWalletModal';

export default function WalletDashboard() {
  const { data: session } = useSession();
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'send' | 'receive'>('send');
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [isCreateWalletModalOpen, setIsCreateWalletModalOpen] = useState(false);
  const [isImportWalletModalOpen, setIsImportWalletModalOpen] = useState(false);
  const { accounts, selectedAccount, loadWallets } = useWalletStore();

  const currentWallet = accounts[selectedAccount || 0];

  const cryptoAssets = [
    { id: 'BTC', name: 'BITCOIN', symbol: 'BTC', balance: '1.39856434', icon: '/icons/btc.svg' },
    { id: 'SHARD', name: 'SHARD', symbol: 'SHARD', balance: '122.23456', icon: '/icons/shard.svg' },
    { id: 'ETH', name: 'ETHEREUM', symbol: 'ETH', balance: '21.529768', icon: '/icons/eth.svg' },
    { id: 'MRX', name: 'METRIX', symbol: 'MRX', balance: '6.286677', icon: '/icons/mrx.svg' },
    { id: 'BNB', name: 'BINANCE COIN', symbol: 'BNB', balance: '17.756446', icon: '/icons/bnb.svg' },
  ];

  useEffect(() => {
    if (session?.user?.id) {
      loadWallets();
    }
  }, [session, loadWallets]);

  const handleTransaction = (type: 'send' | 'receive') => {
    if (!currentWallet) {
      toast.error('Please create or import a wallet first');
      return;
    }
    setTransactionType(type);
    setIsTransactionModalOpen(true);
  };

  return (
    <div className="flex p-4  h-screen bg-[#1A1B23]">
      {/* Left Sidebar - Asset List */}
      <div className="w-72 bg-[#1A1B23] border-r border-gray-800">
        <div className="p-4">
          <div className="relative mb-6">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for assets"
              className="w-full bg-[#2A2A3C] text-gray-300 pl-10 pr-4 py-2 rounded-lg focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            {cryptoAssets.map((asset) => (
              <button
                key={asset.id}
                onClick={() => setSelectedCrypto(asset.id)}
                className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                  selectedCrypto === asset.id ? 'bg-[#2A2A3C]' : 'hover:bg-[#2A2A3C]'
                }`}
              >
                <div className="w-8 h-8 mr-3">
                  <Image src={asset.icon} alt={asset.name} width={32} height={32} className="rounded-full" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{asset.symbol}</span>
                  </div>
                  <div className="text-sm text-gray-400">{asset.balance}</div>
                </div>
              </button>
            ))}
          </div>
          <button className="w-full mt-4 p-3 border border-dashed border-gray-600 rounded-lg text-gray-400 hover:bg-[#2A2A3C] transition-colors">
            + Add asset
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header with Balance */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <Image
              src="/icons/btc.svg"
              alt="Bitcoin"
              width={64}
              height={64}
              className="rounded-full"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {cryptoAssets.find(a => a.id === selectedCrypto)?.balance || '0.00'} BTC
          </h1>
          <p className="text-gray-400 mb-6">≈ $1,334.53 USD</p>
          
          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => handleTransaction('send')}
              className="flex flex-col items-center justify-center w-16 h-16 bg-[#2A2A3C] hover:bg-[#3A3A4C] rounded-full transition-colors"
            >
              <ArrowUpIcon className="h-6 w-6 text-white mb-1" />
              <span className="text-xs text-white">Send</span>
            </button>
            <button
              onClick={() => handleTransaction('receive')}
              className="flex flex-col items-center justify-center w-16 h-16 bg-[#2A2A3C] hover:bg-[#3A3A4C] rounded-full transition-colors"
            >
              <ArrowDownIcon className="h-6 w-6 text-white mb-1" />
              <span className="text-xs text-white">Receive</span>
            </button>
            <button
              onClick={() => toast.info('Swap feature coming soon!')}
              className="flex flex-col items-center justify-center w-16 h-16 bg-[#2A2A3C] hover:bg-[#3A3A4C] rounded-full transition-colors"
            >
              <ArrowsRightLeftIcon className="h-6 w-6 text-white mb-1" />
              <span className="text-xs text-white">Swap</span>
            </button>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-[#1E1F28] rounded-xl p-6 mb-6">
          <PriceChart />
          <div className="flex justify-center space-x-4 mt-6">
            {['1 day', '1w', '1m', '3m', '1y'].map((period) => (
              <button
                key={period}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  period === '1 day' 
                    ? 'bg-[#2A2A3C] text-white' 
                    : 'text-gray-400 hover:bg-[#2A2A3C] hover:text-white'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-[#1E1F28] rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-white">Transaction History</h2>
            <div className="flex items-center space-x-4">
              <select className="bg-[#2A2A3C] text-white px-4 py-2 rounded-lg focus:outline-none">
                <option>All Transactions</option>
                <option>Sent</option>
                <option>Received</option>
              </select>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="From"
                  className="bg-[#2A2A3C] text-white px-4 py-2 rounded-lg focus:outline-none w-32"
                />
                <input
                  type="text"
                  placeholder="To"
                  className="bg-[#2A2A3C] text-white px-4 py-2 rounded-lg focus:outline-none w-32"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <CreateWalletModal
          isOpen={isCreateWalletModalOpen}
          onClose={() => setIsCreateWalletModalOpen(false)}
          onWalletCreated={() => {
            toast.success('Wallet created successfully!');
            setIsCreateWalletModalOpen(false);
          }}
        />

        <ImportWalletModal
          isOpen={isImportWalletModalOpen}
          onClose={() => setIsImportWalletModalOpen(false)}
        />

        <WalletTransactions
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
          type={transactionType}
          walletAddress={currentWallet?.address || ''}
        />
      </div>
    </div>
  );
}
