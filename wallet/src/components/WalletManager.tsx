'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  QrCodeIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowsRightLeftIcon,
  EllipsisVerticalIcon,
  XMarkIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { useWalletStore } from '../stores/walletStore';
import { getWalletColor, getWalletSymbol, getWalletIconPath } from '../utils/walletHelpers';
import type { Wallet, ImportWalletParams } from '../types/wallet';
import { ethers } from 'ethers';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis 
} from 'recharts';
import CreateWalletModal from './CreateWalletModal';
import ImportWalletModal from './ImportWalletModal';
import TransactionModal from './TransactionModal';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'assets'>('overview');
  const [isCreateWalletModalOpen, setIsCreateWalletModalOpen] = useState(false);
  const [isImportWalletModalOpen, setIsImportWalletModalOpen] = useState(false);
  const [isPrivateKeyModalOpen, setIsPrivateKeyModalOpen] = useState(false);
  const [newWalletPrivateKey, setNewWalletPrivateKey] = useState('');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'send' | 'receive'>('send');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState<Wallet | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [chartData, setChartData] = useState(generateChartData());
  const [transactions, setTransactions] = useState([]);

  const {
    wallets,
    createNewWallet,
    importWallet,
    loadWallets,
    isLoading,
    error,
    clearError,
  } = useWalletStore();

  useEffect(() => {
    if (session?.user?.id) {
      loadWallets();
    }
  }, [session, loadWallets]);

  const handleWalletCreated = async (privateKey: string) => {
    setIsCreateWalletModalOpen(false);
    toast.success('Wallet created successfully! Make sure to save your private key.');
  };

  const handleImportWallet = async (params: ImportWalletParams) => {
    try {
      await importWallet(params);
      setIsImportWalletModalOpen(false);
      toast.success('Wallet imported successfully');
    } catch (error) {
      toast.error('Failed to import wallet');
    }
  };

  const handleDeleteWallet = (wallet: Wallet) => {
    setWalletToDelete(wallet);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (walletToDelete?.id) {
      await createNewWallet(walletToDelete.id);
      setIsDeleteModalOpen(false);
      setWalletToDelete(null);
      toast.success('Wallet deleted successfully');
    }
  };

  const openTransactionModal = (type: 'send' | 'receive') => {
    setTransactionType(type);
    setIsTransactionModalOpen(true);
  };

  const filteredWallets = wallets?.filter(wallet =>
    wallet?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wallet?.type?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center ">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={clearError}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#13141B] text-white ml-64" suppressContentEditableWarning={true} contentEditable={false}>
      {/* Main Content */}
      <div className="flex-1 p-6">
        {selectedWallet && (
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
                ${(parseFloat(selectedWallet.balance) * 1334.53).toFixed(2)} USD
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-6 mb-8">
              <button
                onClick={() => openTransactionModal('send')}
                className="flex flex-col items-center p-4 bg-[#2A2A3C] rounded-lg hover:bg-[#3A3A4C]"
              >
                <ArrowUpIcon className="h-6 w-6 mb-2" />
                <span>Send</span>
              </button>
              <button
                onClick={() => openTransactionModal('receive')}
                className="flex flex-col items-center p-4 bg-[#2A2A3C] rounded-lg hover:bg-[#3A3A4C]"
              >
                <ArrowDownIcon className="h-6 w-6 mb-2" />
                <span>Receive</span>
              </button>
              <button
                onClick={() => setIsTransactionModalOpen(true)}
                className="flex flex-col items-center p-4 bg-[#2A2A3C] rounded-lg hover:bg-[#3A3A4C]"
              >
                <ArrowsRightLeftIcon className="h-6 w-6 mb-2" />
                <span>Swap</span>
              </button>
            </div>

            {/* Chart */}
            <div className="bg-[#1A1B23] rounded-lg p-6 mb-8">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F7931A" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#F7931A" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      stroke="#666"
                      tick={{ fill: '#666' }}
                    />
                    <YAxis 
                      stroke="#666"
                      tick={{ fill: '#666' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#F7931A"
                      fillOpacity={1}
                      fill="url(#colorValue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                {['1d', '1w', '1m', '3m', '1y'].map((period) => (
                  <button
                    key={period}
                    className="px-4 py-2 rounded-md bg-[#2A2A3C] hover:bg-[#3A3A4C]"
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-[#1A1B23] rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Transaction History</h3>
                <div className="flex gap-4">
                  <select className="bg-[#2A2A3C] rounded-md px-4 py-2">
                    <option>All Transactions</option>
                    <option>Sent</option>
                    <option>Received</option>
                    <option>Swapped</option>
                  </select>
                  <input
                    type="date"
                    className="bg-[#2A2A3C] rounded-md px-4 py-2"
                    placeholder="From"
                  />
                  <input
                    type="date"
                    className="bg-[#2A2A3C] rounded-md px-4 py-2"
                    placeholder="To"
                  />
                </div>
              </div>
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex justify-between items-center p-4 bg-[#2A2A3C] rounded-lg mb-2"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'receive' ? 'bg-green-500/20' : 
                      transaction.type === 'send' ? 'bg-red-500/20' : 'bg-blue-500/20'
                    }`}>
                      <span className={`text-2xl ${
                        transaction.type === 'receive' ? 'text-green-500' : 
                        transaction.type === 'send' ? 'text-red-500' : 'text-blue-500'
                      }`}>
                        {transaction.type === 'receive' ? '↓' : 
                         transaction.type === 'send' ? '↑' : '↔'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      </p>
                      <p className="text-sm text-gray-400">
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      transaction.type === 'receive' ? 'text-green-500' : 
                      transaction.type === 'send' ? 'text-red-500' : 'text-blue-500'
                    }`}>
                      {transaction.type === 'send' ? '-' : '+'}{transaction.amount} {transaction.currency}
                    </p>
                    <p className="text-sm text-gray-400">
                      {transaction.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Create/Import Wallet Buttons - Fixed Position */}
      <div className="fixed bottom-6 right-6 space-y-4 z-10">
        <button
          onClick={() => setIsCreateWalletModalOpen(true)}
          className="w-48 bg-[#F7931A] text-white rounded-md py-3 flex items-center justify-center hover:bg-[#E88A19] transition-colors shadow-lg"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Wallet
        </button>
        <button
          onClick={() => setIsImportWalletModalOpen(true)}
          className="w-48 bg-[#2A2A3C] text-white rounded-md py-3 flex items-center justify-center hover:bg-[#3A3A4C] transition-colors shadow-lg"
        >
          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
          Import Wallet
        </button>
      </div>

      {/* Modals */}
      <CreateWalletModal
        isOpen={isCreateWalletModalOpen}
        onClose={() => setIsCreateWalletModalOpen(false)}
        onWalletCreated={handleWalletCreated}
      />
      <ImportWalletModal
        isOpen={isImportWalletModalOpen}
        onClose={() => setIsImportWalletModalOpen(false)}
        onSubmit={handleImportWallet}
      />
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        type={transactionType}
        wallet={selectedWallet}
      />
      {/* Private Key Modal */}
      {isPrivateKeyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2A2A3C] p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold text-white mb-4">Save Your Private Key</h2>
            <div className="bg-[#1E1E2F] p-4 rounded-md mb-4">
              <p className="text-yellow-400 text-sm mb-2">⚠️ WARNING: Save this private key securely!</p>
              <p className="text-gray-300 text-sm mb-4">
                This is the only time you'll see this private key. If you lose it, you'll lose access to your wallet.
              </p>
              <div className="bg-[#151521] p-3 rounded border border-gray-700">
                <code className="text-green-400 break-all">{newWalletPrivateKey}</code>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(newWalletPrivateKey);
                  toast.success('Private key copied to clipboard');
                }}
                className="px-4 py-2 text-sm font-medium bg-[#1E1E2F] text-white rounded-md hover:bg-[#151521]"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => {
                  setIsPrivateKeyModalOpen(false);
                  setNewWalletPrivateKey('');
                }}
                className="px-4 py-2 text-sm font-medium bg-[#F7931A] text-white rounded-md hover:bg-[#E27F00]"
              >
                I've Saved It
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2A2A3C] p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold text-white mb-4">Delete Wallet</h2>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this wallet? This action cannot be undone.
              Please type the wallet name <span className="font-semibold">{walletToDelete?.name}</span> to confirm.
            </p>
            <input
              type="text"
              placeholder="Type wallet name to confirm"
              className="w-full bg-[#1E1E2F] border border-gray-700 rounded-md px-4 py-2 mb-4 text-white"
              onChange={(e) => {
                const deleteButton = document.getElementById('confirm-delete-btn');
                if (deleteButton) {
                  deleteButton.disabled = e.target.value !== walletToDelete?.name;
                }
              }}
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setWalletToDelete(null);
                }}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-btn"
                onClick={confirmDelete}
                disabled={true}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Wallet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
