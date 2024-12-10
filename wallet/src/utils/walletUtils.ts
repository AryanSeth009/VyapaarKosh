import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';

export interface WalletDetails {
  address: string;
  privateKey: string;
  mnemonic?: string;
}

export const generateWallet = async (): Promise<WalletDetails> => {
  try {
    const wallet = ethers.Wallet.createRandom();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic?.phrase
    };
  } catch (error) {
    console.error('Error generating wallet:', error);
    throw new Error('Failed to generate wallet');
  }
};

export const importWalletFromPrivateKey = (privateKey: string): WalletDetails => {
  try {
    const wallet = new ethers.Wallet(privateKey);
    return {
      address: wallet.address,
      privateKey: wallet.privateKey
    };
  } catch (error) {
    console.error('Error importing wallet:', error);
    throw new Error('Invalid private key');
  }
};

export const getWalletBalance = async (address: string): Promise<string> => {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error getting balance:', error);
    throw new Error('Failed to get wallet balance');
  }
};

export const validateAddress = (address: string): boolean => {
  return ethers.isAddress(address);
};

export const estimateGas = async (
  from: string,
  to: string,
  amount: string
): Promise<string> => {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    const gasPrice = await provider.getFeeData();
    const gasEstimate = await provider.estimateGas({
      from,
      to,
      value: ethers.parseEther(amount)
    });
    
    const totalGas = gasEstimate * gasPrice.gasPrice!;
    return ethers.formatEther(totalGas);
  } catch (error) {
    console.error('Error estimating gas:', error);
    throw new Error('Failed to estimate gas');
  }
};
