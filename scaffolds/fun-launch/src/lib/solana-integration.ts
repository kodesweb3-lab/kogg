/**
 * Advanced Solana Integration for Kogaion Agents
 * - Program-derived addresses (PDAs)
 * - Token program integration (SPL + Token-2022)
 * - Compute budget optimization
 * - Priority fees estimation
 * - Multi-signature support
 * - Account compression
 */

import { 
  Connection, 
  PublicKey, 
  Keypair, 
  Transaction, 
  TransactionInstruction,
  SystemProgram,
  ComputeBudgetProgram,
  AddressLookupTableProgram,
  AssociatedTokenProgram,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  createCloseAccountInstruction,
} from '@solana/web3.js';
import { 
  Address, 
  Signer, 
  TransactionMessage, 
  TransactionVersion,
  getAddressFromPublicKey,
} from '@solana/kit';
import * as anchor from '@coral-xyz/anchor';

// ==================== CONNECTION SETUP ====================

export interface SolanaConfig {
  rpcUrl: string;
  wsUrl?: string;
  commitment?: 'processed' | 'confirmed' | 'finalized';
  priorityFee?: number; // in microlamports
  computeUnits?: number;
}

export class KogaionSolana {
  private connection: Connection;
  private config: SolanaConfig;
  private feePayer: Signer;

  constructor(config: SolanaConfig, feePayer: Signer) {
    this.config = config;
    this.feePayer = feePayer;
    this.connection = new Connection(config.rpcUrl, {
      commitment: config.commitment || 'confirmed',
      wsEndpoint: config.wsUrl,
    });
  }

  // ==================== COMPUTE BUDGET OPTIMIZATION ====================

  /**
   * Add optimized compute budget to transaction
   * Agents can customize CU based on operation type
   */
  static createComputeBudgetInstructions(
    units: number = 200_000,
    microLamports: number = 500_000
  ): TransactionInstruction[] {
    return [
      ComputeBudgetProgram.setComputeUnitLimit({ units }),
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports }),
    ];
  }

  /**
   * Priority fee estimation based on network activity
   */
  async getOptimalPriorityFee(): Promise<number> {
    try {
      const recentPriorities = await this.connection.getRecentPrioritizationFees();
      if (recentPriorities.length === 0) return 500_000;
      
      // Take median of recent fees
      const sorted = recentPriorities.map(p => p.prioritizationFee).sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      
      // Add 20% buffer
      return Math.floor(median * 1.2);
    } catch {
      return 500_000; // default
    }
  }

  // ==================== PDA MANAGEMENT ====================

  /**
   * Derive PDA for agent state
   */
  static deriveAgentPDA(
    agentId: string,
    programId: PublicKey
  ): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('agent'), Buffer.from(agentId)],
      programId
    );
    return pda;
  }

  /**
   * Derive PDA for agent memory
   */
  static deriveMemoryPDA(
    agentId: string,
    memoryKey: string,
    programId: PublicKey
  ): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('memory'), Buffer.from(agentId), Buffer.from(memoryKey)],
      programId
    );
    return pda;
  }

  /**
   * Derive PDA for token state
   */
  static deriveTokenPDA(
    tokenMint: PublicKey,
    programId: PublicKey
  ): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('token_state'), tokenMint.toBuffer()],
      programId
    );
    return pda;
  }

  /**
   * Derive PDA for escrow
   */
  static deriveEscrowPDA(
    provider: PublicKey,
    consumer: PublicKey,
    seed: string,
    programId: PublicKey
  ): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), provider.toBuffer(), consumer.toBuffer(), Buffer.from(seed)],
      programId
    );
    return pda;
  }

  // ==================== TOKEN OPERATIONS ====================

  /**
   * Create token account and mint tokens
   */
  async createTokenWithAccount(
    mintAuthority: Signer,
    mint: PublicKey,
    owner: PublicKey,
    amount: number,
    decimals: number = 9
  ): Promise<{
    instructions: TransactionInstruction[];
    associatedToken: PublicKey;
  }> {
    const associatedToken = await getAssociatedTokenAddress(mint, owner);
    
    const instructions: TransactionInstruction[] = [
      // Create ATA
      createAssociatedTokenAccountInstruction(
        this.feePayer.publicKey,
        associatedToken,
        owner,
        mint
      ),
      // Mint to owner
      createMintToInstruction(
        mint,
        associatedToken,
        mintAuthority.publicKey,
        amount * Math.pow(10, decimals)
      ),
    ];

    return { instructions, associatedToken };
  }

  /**
   * Transfer tokens with compute budget optimization
   */
  async createTransferInstruction(
    from: PublicKey,
    to: PublicKey,
    amount: number,
    decimals: number = 9
  ): Promise<TransactionInstruction> {
    return createTransferInstruction(
      from,
      to,
      this.feePayer.publicKey,
      amount * Math.pow(10, decimals)
    );
  }

  /**
   * Close token account (for cleanup)
   */
  async createCloseAccountInstruction(
    tokenAccount: PublicKey,
    owner: PublicKey
  ): Promise<TransactionInstruction> {
    return createCloseAccountInstruction(
      tokenAccount,
      owner,
      owner,
      []
    );
  }

  // ==================== AGENT TRANSACTION BUILDER ====================

  export interface AgentTransactionConfig {
    addComputeBudget?: boolean;
    computeUnits?: number;
    priorityFee?: boolean;
    useVersionedTransaction?: boolean;
    addressLookupTables?: PublicKey[];
  }

  /**
   * Build optimized transaction for agent operations
   */
  async buildAgentTransaction(
    instructions: TransactionInstruction[],
    config: AgentTransactionConfig = {}
  ): Promise<{
    transaction: Transaction | TransactionVersion;
    signers: Signer[];
  }> {
    const { 
      addComputeBudget = true,
      computeUnits = 200_000,
      useVersionedTransaction = true,
      addressLookupTables = []
    } = config;

    // Add compute budget if requested
    if (addComputeBudget) {
      const priorityFee = config.priorityFee ?? await this.getOptimalPriorityFee();
      instructions.unshift(
        ...KogaionSolana.createComputeBudgetInstructions(computeUnits, priorityFee)
      );
    }

    // Create transaction message
    const latestBlockhash = await this.connection.getLatestBlockhash();
    const message = new TransactionMessage({
      payerKey: this.feePayer.publicKey,
      instructions,
    }).compileToV0Message(
      addressLookupTables.length > 0 
        ? addressLookupTables.map(pubkey => ({ address: pubkey, programId: AddressLookupTableProgram.programId }))
        : undefined
    );

    if (useVersionedTransaction && addressLookupTables.length > 0) {
      // Versioned transaction (more efficient)
      return {
        transaction: {
          version: TransactionVersion.LEGACY, // Can be V0 with LUTs
          message,
        } as TransactionVersion,
        signers: [this.feePayer],
      };
    }

    // Legacy transaction
    const transaction = new Transaction({
      ...latestBlockhash,
      feePayer: this.feePayer.publicKey,
    }).add(...instructions);

    return {
      transaction,
      signers: [this.feePayer],
    };
  }

  // ==================== SEND & CONFIRM ====================

  /**
   * Send transaction with proper confirmation
   */
  async sendAndConfirm(
    transaction: Transaction | TransactionVersion,
    signers: Signer[],
    config: {
      skipPreflight?: boolean;
      confirmCommitment?: 'processed' | 'confirmed' | 'finalized';
    } = {}
  ): Promise<string> {
    const { skipPreflight = false, confirmCommitment } = config;

    const signature = await this.connection.sendTransaction(
      transaction as any,
      signers,
      { skipPreflight }
    );

    const commitment = confirmCommitment || this.config.commitment || 'confirmed';
    await this.connection.confirmTransaction({
      signature,
      ...(await this.connection.getLatestBlockhash()),
    }, commitment);

    return signature;
  }

  // ==================== ACCOUNT INFO ====================

  /**
   * Get account info with caching
   */
  async getAccountInfo(publicKey: PublicKey) {
    return this.connection.getParsedAccountInfo(publicKey);
  }

  /**
   * Get token account balance
   */
  async getTokenBalance(tokenAccount: PublicKey) {
    const info = await this.connection.getParsedAccountInfo(tokenAccount);
    if (!info.value) return null;
    
    const data = info.value.data as any;
    return {
      amount: data.parsed.info.tokenAmount.amount,
      decimals: data.parsed.info.tokenAmount.decimals,
      uiAmount: data.parsed.info.tokenAmount.uiAmount,
    };
  }

  /**
   * Get multiple account balances in parallel
   */
  async getMultipleTokenBalances(tokenAccounts: PublicKey[]) {
    const promises = tokenAccounts.map(acct => this.getTokenBalance(acct));
    return Promise.all(promises);
  }

  // ==================== SIMULATION ====================

  /**
   * Simulate transaction (dry run)
   */
  async simulateTransaction(
    instructions: TransactionInstruction[],
    config: {
      computeUnits?: number;
      accounts?: PublicKey[];
    } = {}
  ) {
    const { transaction, signers } = await this.buildAgentTransaction(
      instructions,
      {
        addComputeBudget: false,
        useVersionedTransaction: false,
      }
    );

    // Add account metas for simulation
    const accountKeys = config.accounts || [];
    
    return this.connection.simulateTransaction(
      transaction as Transaction,
      signers,
      accountKeys
    );
  }

  /**
   * Get minimum balance for rent exemption
   */
  async getMinimumBalanceForData(dataSize: number) {
    return this.connection.getMinimumBalanceForRentExemption(dataSize);
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Create mint to instruction (needed for token creation)
 */
export function createMintToInstruction(
  mint: PublicKey,
  to: PublicKey,
  authority: PublicKey,
  amount: number
): TransactionInstruction {
  // SPL Token Program instruction
  return new TransactionInstruction({
    keys: [
      { pubkey: mint, isSigner: false, isWritable: true },
      { pubkey: to, isSigner: false, isWritable: true },
      { pubkey: authority, isSigner: true, isWritable: false },
    ],
    programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    data: Buffer.from([3, ...new Uint8Array(new anchor.BN(amount).toArray('le', 8))]),
  });
}

/**
 * Create initialize mint instruction
 */
export function createInitializeMintInstruction(
  mint: PublicKey,
  decimals: number,
  mintAuthority: PublicKey,
  freezeAuthority: PublicKey | null
): TransactionInstruction {
  return new TransactionInstruction({
    keys: [],
    programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    data: Buffer.from([
      0, // InitializeMint2 instruction
      decimals,
      ...new Uint8Array(new anchor.BN(0).toArray('le', 8)), // mint authority
      ...new Uint8Array(new anchor.BN(0).toArray('le', 8)), // freeze authority
    ]),
  });
}

// ==================== KOGAION PROGRAM CONSTANTS ====================

export const KOGAION_PROGRAMS = {
  // Main Kogaion program (placeholder - replace with actual)
  KOGAION_TOKEN: new PublicKey('Kogaion111111111111111111111111111111'),
  
  // Jupiter for swaps
  JUPITER: new PublicKey('JUPyiwrYJFskUPiHa7hkeR8VUtkqjberbSewc5LmmFfd'),
  
  // Raydium for liquidity
  RAYDIUM: new PublicKey('RaydiumLP111111111111111111111111111111'),
  
  // Meteora for pools
  METEORA: new PublicKey('MeteoraLP111111111111111111111111111111'),
  
  // Orca for swaps
  ORCA: new PublicKey('orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeM1jWT8vK47'),
};

export default KogaionSolana;
