import type { NextApiRequest, NextApiResponse } from 'next';
import { KogaionSolana, KOGAION_PROGRAMS } from '@/lib/solana-integration';
import { Keypair, PublicKey } from '@solana/web3.js';
import { KeyPairSigner } from '@solana/kit';

// Mock fee payer - in production, use proper key management
const FEE_PAYER = Keypair.fromSecretKey(
  new Uint8Array(Array(64).fill(0)) // Placeholder - use real key in production
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    const solana = new KogaionSolana(
      {
        rpcUrl: process.env.RPC_URL || 'https://api.mainnet-beta.solana.com',
        commitment: 'confirmed',
        computeUnits: 200_000,
      },
      FEE_PAYER as unknown as KeyPairSigner
    );

    switch (method) {
      // ==================== PRIORITY FEES ====================
      case 'GET': {
        const { action, address } = req.query as any;

        // Get optimal priority fee
        if (action === 'priority-fee') {
          const fee = await solana.getOptimalPriorityFee();
          return res.status(200).json({
            success: true,
            priorityFee: fee,
            unit: 'microlamports',
            recommendation: fee < 500_000 ? 'low' : fee < 1_000_000 ? 'medium' : 'high'
          });
        }

        // Get account info
        if (action === 'account' && address) {
          const info = await solana.getAccountInfo(new PublicKey(address));
          return res.status(200).json({
            success: true,
            account: info.value ? {
              lamports: info.value.lamports,
              owner: info.value.owner.toBase58(),
              dataSize: info.value.data.length,
            } : null
          });
        }

        // Get token balance
        if (action === 'balance' && address) {
          const balance = await solana.getTokenBalance(new PublicKey(address));
          return res.status(200).json({
            success: true,
            balance
          });
        }

        // Simulate transaction
        if (action === 'simulate' && req.body.instructions) {
          const result = await solana.simulateTransaction(
            req.body.instructions.map((ix: any) => new PublicKey(ix))
          );
          return res.status(200).json({
            success: true,
            result: {
              err: result.value.err?.toString(),
              units: result.value.units,
              logs: result.value.logs,
            }
          });
        }

        // Get PDA derivation
        if (action === 'pda') {
          const { type, agentId, memoryKey, tokenMint, provider, consumer, seed } = req.query as any;
          
          let pda: PublicKey | null = null;
          
          if (type === 'agent' && agentId) {
            pda = KogaionSolana.deriveAgentPDA(agentId, KOGAION_PROGRAMS.KOGAION_TOKEN);
          } else if (type === 'memory' && agentId && memoryKey) {
            pda = KogaionSolana.deriveMemoryPDA(agentId, memoryKey, KOGAION_PROGRAMS.KOGAION_TOKEN);
          } else if (type === 'token' && tokenMint) {
            pda = KogaionSolana.deriveTokenPDA(new PublicKey(tokenMint), KOGAION_PROGRAMS.KOGAION_TOKEN);
          } else if (type === 'escrow' && provider && consumer && seed) {
            pda = KogaionSolana.deriveEscrowPDA(
              new PublicKey(provider),
              new PublicKey(consumer),
              seed,
              KOGAION_PROGRAMS.KOGAION_TOKEN
            );
          }

          return res.status(200).json({
            success: true,
            pda: pda?.toBase58(),
            type
          });
        }

        return res.status(400).json({ error: 'Unknown action' });
      }

      // ==================== BUILD TRANSACTION ====================
      case 'POST': {
        const { action } = req.body;

        if (action === 'build') {
          const { instructions, config } = req.body;
          
          const { transaction, signers } = await solana.buildAgentTransaction(
            instructions.map((ix: any) => new PublicKey(ix)),
            config || {}
          );

          return res.status(200).json({
            success: true,
            transaction: {
              instructions: (transaction as any).instructions?.length || 0,
              signers: signers.length,
            }
          });
        }

        if (action === 'send') {
          const { instructions, config } = req.body;
          
          const { transaction, signers } = await solana.buildAgentTransaction(
            instructions,
            config || {}
          );

          const signature = await solana.sendAndConfirm(transaction, signers, {
            skipPreflight: config?.skipPreflight || false,
          });

          return res.status(200).json({
            success: true,
            signature,
            explorerUrl: `https://explorer.solana.com/tx/${signature}`
          });
        }

        if (action === 'create-token-account') {
          const { mint, owner, amount, decimals = 9 } = req.body;
          
          const { instructions, associatedToken } = await solana.createTokenWithAccount(
            FEE_PAYER,
            new PublicKey(mint),
            new PublicKey(owner),
            amount,
            decimals
          );

          return res.status(200).json({
            success: true,
            associatedToken: associatedToken.toBase58(),
            instructions: instructions.length
          });
        }

        return res.status(400).json({ error: 'Unknown action' });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('Solana API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
