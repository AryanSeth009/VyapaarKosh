'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useWalletStore } from '@/stores/walletStore';
import { getWalletColor, getWalletSymbol, getWalletIconPath } from '@/utils/walletHelpers';
import type { Wallet, Transaction } from '@/types/wallet';
import WalletChart from './WalletChart';
import WalletActions from './WalletActions';
import TransactionHistory from './TransactionHistory';
import CreateWalletModal from '../CreateWalletModal';
import ImportWalletModal from '../ImportWalletModal';
import WalletTransactions from './WalletTransactions';

const generateChartData = () => {
  const data = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.floor(Math.random() * 10000) + 30000
    });
  }
  return data;
};

export default function WalletManager() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [isCreateWalletModalOpen, setIsCreateWalletModalOpen] = useState(false);
  const [isImportWalletModalOpen, setIsImportWalletModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'send' | 'receive'>('send');
  const [searchQuery, setSearchQuery] = useState('');
  const [chartData, setChartData] = useState(generateChartData());

  const {
    wallets,
    addWallet,
    removeWallet,
    importWallet,
    loadWallets,
    isLoading,
    error,
    clearError,
    transactions
  } = useWalletStore();

  useEffect(() => {
    if (session?.user?.id) {
      loadWallets();
    }
  }, [session, loadWallets]);

  const handleWalletCreated = async (wallet: Wallet) => {
    await addWallet(wallet);
    setIsCreateWalletModalOpen(false);
    toast.success('Wallet created successfully');
  };

  const openTransactionModal = (type: 'send' | 'receive') => {
    setTransactionType(type);
    setIsTransactionModalOpen(true);
  };

  const filteredWallets = wallets?.filter(wallet =>
    wallet?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wallet?.type?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="flex h-screen bg-[#13141B] text-white">
      {/* Sidebar */}
      <div className="w-72 bg-[#1A1B23] p-4 flex flex-col">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for assets"
            className="w-full bg-[#2A2A3C] rounded-md px-4 py-2 text-sm text-gray-300 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <MagnifyingGlassIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        {/* Wallet List */}
        <div className="mt-4 flex-1 overflow-auto">
          {filteredWallets.map((wallet, index) => (
            <button
              key={wallet.id}
              onClick={() => setSelectedWallet(wallet)}
              className={`w-full text-left p-3 rounded-md mb-2 flex items-center ${
                selectedWallet?.id === wallet.id
                  ? 'bg-[#2A2A3C]'
                  : 'hover:bg-[#2A2A3C]'
              }`}
            >
              <Image
                src={getWalletIconPath(wallet.type)}
                alt={wallet.type}
                width={32}
                height={32}
                className="rounded-full mr-3"
              />
              <div>
                <p className="font-medium">{wallet.name}</p>
                <p className="text-sm text-gray-400">
                  {wallet.balance} {getWalletSymbol(wallet.type)}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Add Wallet Button */}
        <button
          onClick={() => setIsCreateWalletModalOpen(true)}
          className="mt-4 w-full bg-[#F7931A] text-white rounded-md py-2 flex items-center justify-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Wallet
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {selectedWallet ? (
          <>
            {/* Wallet Header */}
            <div className="mb-8 text-center">
              <div className="flex justify-center mb-4">
                <Image
                  src={getWalletIconPath(selectedWallet.type)}
                  alt={selectedWallet.type}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              </div>
              <h2 className="text-3xl font-bold mb-2">
                {selectedWallet.balance} {getWalletSymbol(selectedWallet.type)}
              </h2>
              <p className="text-xl text-gray-400">
                ${parseFloat(selectedWallet.balance) * 1334.53} USD
              </p>
            </div>

            {/* Action Buttons */}
            <WalletActions
              onSend={() => openTransactionModal('send')}
              onReceive={() => openTransactionModal('receive')}
              onSwap={() => setIsTransactionModalOpen(true)}
            />

            {/* Chart */}
            <WalletChart
              data={chartData}
              onPeriodChange={(period) => {
                // TODO: Implement period change logic
                console.log('Period changed:', period);
              }}
            />

            {/* Transaction History */}
            <TransactionHistory
              transactions={transactions}
              onFilterChange={(filter) => {
                // TODO: Implement filter logic
                console.log('Filter changed:', filter);
              }}
              onDateRangeChange={(from, to) => {
                // TODO: Implement date range filter
                console.log('Date range:', from, to);
              }}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a wallet to view details
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateWalletModal
        isOpen={isCreateWalletModalOpen}
        onClose={() => setIsCreateWalletModalOpen(false)}
        onSubmit={handleWalletCreated}
      />
      <ImportWalletModal
        isOpen={isImportWalletModalOpen}
        onClose={() => setIsImportWalletModalOpen(false)}
        onSubmit={importWallet}
      />
      <WalletTransactions
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        type={transactionType}
        walletAddress={selectedWallet?.address || ''}
      />
    </div>
  );
}
