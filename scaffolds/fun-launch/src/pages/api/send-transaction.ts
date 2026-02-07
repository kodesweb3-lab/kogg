import { NextApiRequest, NextApiResponse } from 'next';
import { Connection, Keypair, PublicKey, sendAndConfirmRawTransaction, Transaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { logger } from '@/lib/logger';

const RPC_URL = process.env.RPC_URL as string;
const TREASURY_PUBKEY = new PublicKey('5hDrp6eTjMKrUFx96wqeQHhXNa7zvp3ba1Z9nTY3tBjA');

if (!RPC_URL) {
  throw new Error('Missing required environment variables');
}

type SendTransactionRequest = {
  signedTransaction: string; // base64 encoded signed transaction
  additionalSigners?: Keypair[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { signedTransaction } = req.body as SendTransactionRequest;

    if (!signedTransaction) {
      return res.status(400).json({ error: 'Missing signed transaction' });
    }

    const connection = new Connection(RPC_URL, 'confirmed');
    const transaction = Transaction.from(Buffer.from(signedTransaction, 'base64'));

    // If pool creation tx is missing treasury signature, add it (TREASURY_SECRET_KEY must be set)
    const treasurySecret = process.env.TREASURY_SECRET_KEY;
    if (treasurySecret?.trim()) {
      const message = transaction.compileMessage();
      const signerKeys = message.accountKeys.slice(0, message.header.numRequiredSignatures);
      const needsTreasurySig = signerKeys.some((key) => key.equals(TREASURY_PUBKEY));
      if (needsTreasurySig) {
        try {
          const treasuryKeypair = Keypair.fromSecretKey(bs58.decode(treasurySecret.trim()));
          transaction.partialSign(treasuryKeypair);
        } catch (e) {
          logger.error('Treasury partialSign failed', e instanceof Error ? e : new Error(String(e)), {
            endpoint: '/api/send-transaction',
          });
          return res.status(500).json({
            error: 'Invalid TREASURY_SECRET_KEY or treasury sign failed. Check server configuration.',
          });
        }
      }
    }

    // Send transaction
    const txSignature = await sendAndConfirmRawTransaction(connection, transaction.serialize(), {
      commitment: 'confirmed',
    });

    res.status(200).json({
      success: true,
      signature: txSignature,
    });
  } catch (error) {
    logger.error('Transaction error', error instanceof Error ? error : new Error(String(error)), {
      endpoint: '/api/send-transaction',
    });
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}
