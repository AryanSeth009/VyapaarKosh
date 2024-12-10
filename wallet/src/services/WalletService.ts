import { ethers } from 'ethers';
import Wallet from '../models/Wallet';
import { Types } from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { WalletDetails } from '@/utils/wallet';

export interface WalletAccount {
  _id?: string;
  address: string;
  privateKey: string;
  balance: string;
  mnemonic?: string;
  name?: string;
  userId?: string;
}

export class WalletService {
  private provider: ethers.JsonRpcProvider;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL);
  }

  // Get network details
  async getNetwork() {
    const network = await this.provider.getNetwork();
    return {
      name: network.name,
      chainId: network.chainId.toString()
    };
  }

  // Get gas price
  async getGasPrice(): Promise<string> {
    const gasPrice = await this.provider.getFeeData();
    return ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei');
  }

  // Get transaction history
  async getTransactionHistory(address: string): Promise<any[]> {
    try {
      const history = await this.provider.getHistory(address);
      return history.map(tx => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: ethers.formatEther(tx.value),
        timestamp: new Date(tx.blockNumber ? tx.blockNumber * 1000 : Date.now()),
        status: tx.confirmations > 0 ? 'confirmed' : 'pending'
      }));
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
      return [];
    }
  }

  // Get token balances (ERC20)
  async getTokenBalance(walletAddress: string, tokenAddress: string): Promise<string> {
    const erc20Abi = [
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)',
      'function symbol() view returns (string)'
    ];

    const contract = new ethers.Contract(tokenAddress, erc20Abi, this.provider);
    const [balance, decimals] = await Promise.all([
      contract.balanceOf(walletAddress),
      contract.decimals()
    ]);

    return ethers.formatUnits(balance, decimals);
  }

  // Get multiple token balances
  async getTokenBalances(walletAddress: string, tokenAddresses: string[]): Promise<Record<string, string>> {
    const balances: Record<string, string> = {};
    await Promise.all(
      tokenAddresses.map(async (tokenAddress) => {
        balances[tokenAddress] = await this.getTokenBalance(walletAddress, tokenAddress);
      })
    );
    return balances;
  }

  // Send ERC20 tokens
  async sendToken(
    privateKey: string,
    tokenAddress: string,
    recipientAddress: string,
    amount: string
  ): Promise<string> {
    const wallet = new ethers.Wallet(privateKey, this.provider);
    const erc20Abi = [
      'function transfer(address to, uint amount) returns (bool)',
      'function decimals() view returns (uint8)'
    ];
    
    const contract = new ethers.Contract(tokenAddress, erc20Abi, wallet);
    const decimals = await contract.decimals();
    const tx = await contract.transfer(
      recipientAddress,
      ethers.parseUnits(amount, decimals)
    );
    
    await tx.wait();
    return tx.hash;
  }

  // Get ENS name for address
  async getEnsName(address: string): Promise<string | null> {
    try {
      return await this.provider.lookupAddress(address);
    } catch {
      return null;
    }
  }

  // Resolve ENS name to address
  async resolveEnsName(ensName: string): Promise<string | null> {
    try {
      return await this.provider.resolveName(ensName);
    } catch {
      return null;
    }
  }

  // Validate address
  isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  // Format address for display
  formatAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  private serializeWallet(wallet: any): WalletAccount {
    return {
      _id: wallet._id?.toString(),
      address: wallet.walletAddress,
      privateKey: wallet.encryptedPrivateKey,
      mnemonic: wallet.encryptedMnemonic,
      name: wallet.name,
      balance: '0',
      userId: wallet.userId?.toString()
    };
  }

  async createWallet(userId: string, name?: string): Promise<WalletAccount> {
    if (!userId) {
      throw new Error('User ID is required to create a wallet');
    }

    try {
      // Connect to database first
      await connectToDatabase();

      // Create a new random wallet
      const randomWallet = ethers.Wallet.createRandom();
      if (!randomWallet || !randomWallet.address) {
        throw new Error('Failed to generate wallet');
      }

      // Connect wallet to provider
      const wallet = randomWallet.connect(this.provider);
      
      // Get initial balance (default to 0 if fails)
      let balance = '0';
      try {
        const balanceResult = await this.provider.getBalance(wallet.address);
        balance = ethers.formatEther(balanceResult);
      } catch (error) {
        console.error('Failed to fetch initial balance:', error);
      }

      // Check if wallet already exists
      const existingWallet = await Wallet.findOne({ walletAddress: wallet.address });
      if (existingWallet) {
        throw new Error('Wallet already exists');
      }

      // Create wallet in database
      const newWallet = await Wallet.create({
        userId: new Types.ObjectId(userId),
        walletAddress: wallet.address,
        encryptedPrivateKey: wallet.privateKey, // TODO: Add encryption in production
        encryptedMnemonic: wallet.mnemonic?.phrase,
        name: name || 'My Wallet',
      });

      if (!newWallet) {
        throw new Error('Failed to save wallet to database');
      }

      return this.serializeWallet(newWallet);
    } catch (error) {
      console.error('Failed to create wallet:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to create wallet: ${error.message}`);
      } else {
        throw new Error('Failed to create wallet. Please try again.');
      }
    }
  }

  async loadWallets(userId: string): Promise<WalletAccount[]> {
    try {
      await connectToDatabase();
      
      // Use lean() to get plain JavaScript objects
      const wallets = await Wallet.find({ 
        userId: new Types.ObjectId(userId) 
      }).lean().exec();

      // Map wallets to WalletAccount objects and fetch balances
      const walletsWithBalances = await Promise.all(
        wallets.map(async (wallet) => {
          const serializedWallet = this.serializeWallet(wallet);
          
          try {
            const balanceResult = await this.provider.getBalance(wallet.walletAddress);
            serializedWallet.balance = ethers.formatEther(balanceResult);
          } catch (error) {
            console.error(`Failed to fetch balance for wallet ${wallet.walletAddress}:`, error);
            serializedWallet.balance = '0';
          }
          
          return serializedWallet;
        })
      );

      return walletsWithBalances;
    } catch (error) {
      console.error('Failed to load wallets:', error);
      throw error;
    }
  }

  async importWalletFromPrivateKey(userId: string, privateKey: string, name?: string): Promise<WalletAccount> {
    try {
      await connectToDatabase();
      try {
        const wallet = new ethers.Wallet(privateKey, this.provider);
        let balance = '0';
        try {
          const balanceResult = await this.provider.getBalance(wallet.address);
          balance = ethers.formatEther(balanceResult);
        } catch (error) {
          console.error('Failed to fetch balance:', error);
        }

        const newWallet = await Wallet.create({
          userId: new Types.ObjectId(userId),
          walletAddress: wallet.address,
          encryptedPrivateKey: wallet.privateKey,
          name: name || 'Imported Wallet',
        });

        return this.serializeWallet(newWallet);
      } catch (error) {
        console.error('Failed to import wallet from private key:', error);
        throw new Error('Invalid private key');
      }
    } catch (error) {
      console.error('Failed to import wallet from private key:', error);
      throw new Error('Failed to import wallet from private key. Please try again.');
    }
  }

  async importWalletFromMnemonic(userId: string, mnemonic: string, name?: string): Promise<WalletAccount> {
    try {
      await connectToDatabase();
      try {
        const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic);
        const wallet = hdNode.connect(this.provider);
        let balance = '0';
        try {
          const balanceResult = await this.provider.getBalance(wallet.address);
          balance = ethers.formatEther(balanceResult);
        } catch (error) {
          console.error('Failed to fetch balance:', error);
        }

        const newWallet = await Wallet.create({
          userId: new Types.ObjectId(userId),
          walletAddress: wallet.address,
          encryptedPrivateKey: wallet.privateKey,
          encryptedMnemonic: wallet.mnemonic?.phrase,
          name: name || 'Imported Wallet',
        });

        return this.serializeWallet(newWallet);
      } catch (error) {
        console.error('Failed to import wallet from mnemonic:', error);
        throw new Error('Invalid mnemonic phrase');
      }
    } catch (error) {
      console.error('Failed to import wallet from mnemonic:', error);
      throw new Error('Failed to import wallet from mnemonic. Please try again.');
    }
  }

  async sendTransaction(privateKey: string, to: string, amount: string): Promise<ethers.TransactionResponse> {
    try {
      if (!ethers.isAddress(to)) {
        throw new Error('Invalid recipient address');
      }

      const wallet = new ethers.Wallet(privateKey, this.provider);
      const parsedAmount = ethers.parseEther(amount);

      // Get the current gas price
      const gasPrice = await this.provider.getFeeData();
      
      // Prepare the transaction
      const tx = {
        to,
        value: parsedAmount,
        gasLimit: 21000, // Standard ETH transfer
        maxFeePerGas: gasPrice.maxFeePerGas,
        maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
      };

      // Send the transaction
      const transaction = await wallet.sendTransaction(tx);
      return transaction;
    } catch (error) {
      console.error('Transaction failed:', error);
      if (error instanceof Error) {
        throw new Error(`Transaction failed: ${error.message}`);
      } else {
        throw new Error('Transaction failed. Please try again.');
      }
    }
  }

  async sendTransactionFromWallet(from: string, to: string, amount: string): Promise<ethers.TransactionResponse> {
    try {
      await connectToDatabase();
      const wallet = await Wallet.findOne({ walletAddress: from });
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const signer = new ethers.Wallet(wallet.encryptedPrivateKey, this.provider);
      return await signer.sendTransaction({
        to,
        value: ethers.parseEther(amount)
      });
    } catch (error) {
      console.error('Failed to send transaction:', error);
      throw new Error('Failed to send transaction. Please try again.');
    }
  }

  async estimateGas(from: string, to: string, amount: string): Promise<string> {
    try {
      await connectToDatabase();
      const wallet = await Wallet.findOne({ walletAddress: from });
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const gasEstimate = await this.provider.estimateGas({
        from,
        to,
        value: ethers.parseEther(amount)
      });

      return gasEstimate.toString();
    } catch (error) {
      console.error('Failed to estimate gas:', error);
      throw new Error('Failed to estimate gas. Please try again.');
    }
  }
}
