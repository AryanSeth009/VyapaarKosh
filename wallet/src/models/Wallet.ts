import mongoose, { Model } from 'mongoose';

export interface IWallet extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    walletAddress: string;
    encryptedPrivateKey: string;
    encryptedMnemonic?: string;
    name?: string;
    createdAt: Date;
    updatedAt: Date;
}

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
    },
    walletAddress: {
        type: String,
        required: [true, 'Wallet address is required'],
        unique: true,
    },
    encryptedPrivateKey: {
        type: String,
        required: [true, 'Encrypted private key is required'],
    },
    encryptedMnemonic: {
        type: String,
    },
    name: {
        type: String,
        default: 'My Wallet',
    }
}, {
    timestamps: true,
});

let Wallet: Model<IWallet>;

try {
    // Try to get the existing model
    Wallet = mongoose.model<IWallet>('Wallet');
} catch {
    // If the model doesn't exist, create it
    Wallet = mongoose.model<IWallet>('Wallet', walletSchema);
}

export default Wallet;
