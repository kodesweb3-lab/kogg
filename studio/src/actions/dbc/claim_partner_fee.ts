import { Connection, PublicKey } from '@solana/web3.js';
import { safeParseKeypairFromFile, getDbcConfig, parseCliArguments } from '../../helpers';
import { Wallet } from '@coral-xyz/anchor';
import { DEFAULT_COMMITMENT_LEVEL } from '../../utils/constants';
import { claimPartnerTradingFee } from '../../lib/dbc';

async function main() {
  const config = await getDbcConfig();

  console.log(`> Using keypair file path ${config.keypairFilePath}`);
  const keypair = await safeParseKeypairFromFile(config.keypairFilePath);

  console.log('\n> Initializing configuration...');
  console.log(`- Using RPC URL ${config.rpcUrl}`);
  console.log(`- Dry run = ${config.dryRun}`);
  console.log(`- Using wallet ${keypair.publicKey} to claim partner trading fees`);

  const connection = new Connection(config.rpcUrl, DEFAULT_COMMITMENT_LEVEL);
  const wallet = new Wallet(keypair);

  const { baseMint, receiver } = parseCliArguments();
  if (!baseMint) {
    throw new Error('Please provide --baseMint flag to do this action');
  }

  console.log(`- Using base token mint ${baseMint.toString()}`);

  const receiverPubkey = receiver ? new PublicKey(receiver) : undefined;
  if (receiverPubkey) {
    console.log(`- Receiver wallet: ${receiverPubkey.toString()}`);
  }

  if (config) {
    await claimPartnerTradingFee(
      config,
      connection,
      wallet,
      new PublicKey(baseMint),
      receiverPubkey
    );
  } else {
    throw new Error('Must provide DBC configuration');
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
