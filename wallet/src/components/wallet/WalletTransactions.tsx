import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-hot-toast';
import { ethers } from 'ethers';
import { useWalletStore } from '@/stores/walletStore';

interface WalletTransactionsProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'send' | 'receive';
  walletAddress: string;
}

export default function WalletTransactions({ isOpen, onClose, type, walletAddress }: WalletTransactionsProps) {
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { sendTransaction } = useWalletStore();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !recipientAddress) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsProcessing(true);
      // Validate address
      if (!ethers.isAddress(recipientAddress)) {
        throw new Error('Invalid recipient address');
      }

      // Send transaction
      await sendTransaction({
        to: recipientAddress,
        amount: ethers.parseEther(amount),
        from: walletAddress
      });

      toast.success('Transaction sent successfully');
      onClose();
      setAmount('');
      setRecipientAddress('');
    } catch (error) {
      console.error('Transaction failed:', error);
      toast.error(error instanceof Error ? error.message : 'Transaction failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center p-4 ${isOpen ? '' : 'hidden'}`}>
      <div className="bg-[#1A1B23] rounded-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-white">
          {type === 'send' ? 'Send Crypto' : 'Receive Crypto'}
        </h2>

        {type === 'send' ? (
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="w-full px-4 py-2 bg-[#2A2A3C] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0x..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 bg-[#2A2A3C] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0.0"
                step="0.000001"
                min="0"
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Send'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <div className="bg-white p-4 rounded-lg inline-block mb-4">
              <QRCodeSVG value={walletAddress} size={200} />
            </div>
            <p className="text-gray-300 mb-2">Your Wallet Address</p>
            <p className="text-sm text-gray-400 break-all bg-[#2A2A3C] p-3 rounded-lg">
              {walletAddress}
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(walletAddress);
                toast.success('Address copied to clipboard');
              }}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500"
            >
              Copy Address
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
