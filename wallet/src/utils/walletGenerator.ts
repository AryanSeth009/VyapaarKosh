import { ethers } from 'ethers';
import { ECPairFactory } from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import * as bip39 from 'bip39';

const ECPair = ECPairFactory(ecc);

interface WalletDetails {
  address: string;
  privateKey: string;
}

export async function generateWallet(type: string): Promise<WalletDetails> {
  switch (type.toLowerCase()) {
    case 'bitcoin':
      return generateBitcoinWallet();
    case 'ethereum':
      return generateEthereumWallet();
    case 'binance':
      return generateBinanceWallet();
    default:
      throw new Error(`Unsupported wallet type: ${type}`);
  }
}

export async function importWalletFromPrivateKey(type: string, privateKey: string): Promise<WalletDetails> {
  switch (type.toLowerCase()) {
    case 'bitcoin':
      return importBitcoinWallet(privateKey);
    case 'ethereum':
      return importEthereumWallet(privateKey);
    case 'binance':
      return importBinanceWallet(privateKey);
    default:
      throw new Error(`Unsupported wallet type: ${type}`);
  }
}

function generateBitcoinWallet(): WalletDetails {
  // Generate a new mnemonic
  const mnemonic = bip39.generateMnemonic();
  
  // Derive seed from mnemonic
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  
  // Create a new Bitcoin network keychain
  const network = bitcoin.networks.testnet; // Use testnet for development
  const root = bitcoin.bip32.fromSeed(seed, network);
  
  // Derive the first child key
  const child = root.derivePath("m/44'/0'/0'/0/0");
  
  if (!child.privateKey) {
    throw new Error('Failed to generate Bitcoin wallet');
  }

  // Create a key pair from the private key
  const keyPair = ECPair.fromPrivateKey(child.privateKey, { network });
  
  // Generate the public address
  const { address } = bitcoin.payments.p2pkh({ 
    pubkey: child.publicKey, 
    network 
  });

  if (!address) {
    throw new Error('Failed to generate Bitcoin address');
  }

  return {
    address: address,
    privateKey: child.privateKey.toString('hex')
  };
}

function importBitcoinWallet(privateKey: string): WalletDetails {
  try {
    const network = bitcoin.networks.testnet;
    const keyPair = ECPair.fromPrivateKey(
      Buffer.from(privateKey, 'hex'), 
      { network }
    );

    const { address } = bitcoin.payments.p2pkh({ 
      pubkey: keyPair.publicKey, 
      network 
    });

    if (!address) {
      throw new Error('Failed to generate Bitcoin address');
    }

    return {
      address: address,
      privateKey: privateKey
    };
  } catch (error) {
    console.error('Error importing Bitcoin wallet:', error);
    throw new Error('Failed to import Bitcoin wallet');
  }
}

function generateEthereumWallet(): WalletDetails {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey
  };
}

function importEthereumWallet(privateKey: string): WalletDetails {
  try {
    const wallet = new ethers.Wallet(privateKey);
    return {
      address: wallet.address,
      privateKey
    };
  } catch (error) {
    throw new Error('Invalid Ethereum private key');
  }
}

function generateBinanceWallet(): WalletDetails {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey
  };
}

function importBinanceWallet(privateKey: string): WalletDetails {
  try {
    const wallet = new ethers.Wallet(privateKey);
    return {
      address: wallet.address,
      privateKey
    };
  } catch (error) {
    throw new Error('Invalid Binance Coin private key');
  }
}
