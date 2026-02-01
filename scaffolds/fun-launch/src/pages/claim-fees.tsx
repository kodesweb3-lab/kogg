import { GetServerSideProps } from 'next';
import { useState, useEffect } from 'react';
import { useWallet } from '@jup-ag/wallet-adapter';
import { useRouter } from 'next/router';
import { checkFeeClaimer } from '@/lib/server/feeClaimerCheck';
import { ClaimPartnerFeesModal } from '@/components/ClaimPartnerFeesModal';
import Page from '@/components/ui/Page/Page';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ClaimFeesPageProps {
  isFeeClaimer: boolean;
  walletAddress?: string;
}

export default function ClaimFeesPage({ isFeeClaimer, walletAddress }: ClaimFeesPageProps) {
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // If wallet connects and no query param, redirect with wallet address
  useEffect(() => {
    if (connected && publicKey && !walletAddress && !isChecking) {
      const currentWallet = publicKey.toBase58();
      setIsChecking(true);
      // Redirect to same page with wallet in query params for server-side verification
      router.replace(`/claim-fees?wallet=${currentWallet}`, undefined, { shallow: false });
    }
  }, [connected, publicKey, walletAddress, router, isChecking]);

  // If wallet is connected client-side, verify it matches server-side check
  const currentWallet = publicKey?.toBase58();
  const canClaim = isFeeClaimer && currentWallet === walletAddress && connected;

  return (
    <Page>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="steel-panel rounded-lg p-8">
            <h1 className="text-3xl font-heading font-bold text-mystic-steam-copper mb-4">
              Claim Partner Fees
            </h1>

            {!isFeeClaimer ? (
              <div className="space-y-4">
                <p className="text-mystic-steam-parchment/70">
                  You are not authorized to claim partner fees. Only the configured feeClaimer wallet can access this page.
                </p>
                {walletAddress && (
                  <p className="text-sm text-mystic-steam-parchment/50 font-mono">
                    Wallet checked: {walletAddress}
                  </p>
                )}
                <Link href="/">
                  <Button className="bg-mystic-steam-copper hover:bg-mystic-steam-copper/90 text-mystic-steam-charcoal font-heading font-bold">
                    Return to Home
                  </Button>
                </Link>
              </div>
            ) : !connected ? (
              <div className="space-y-4">
                <p className="text-mystic-steam-parchment/70">
                  Please connect your wallet to claim partner fees.
                </p>
                {walletAddress && (
                  <p className="text-sm text-mystic-steam-parchment/50">
                    Authorized wallet: <span className="font-mono">{walletAddress}</span>
                  </p>
                )}
              </div>
            ) : currentWallet !== walletAddress ? (
              <div className="space-y-4">
                <p className="text-mystic-steam-parchment/70">
                  The connected wallet does not match the authorized feeClaimer wallet.
                </p>
                <p className="text-sm text-mystic-steam-parchment/50">
                  Connected: <span className="font-mono">{currentWallet}</span>
                </p>
                <p className="text-sm text-mystic-steam-parchment/50">
                  Authorized: <span className="font-mono">{walletAddress}</span>
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-mystic-steam-parchment/70">
                  You are authorized to claim partner trading fees. Select a token below to claim fees.
                </p>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-mystic-steam-copper hover:bg-mystic-steam-copper/90 text-mystic-steam-charcoal font-heading font-bold"
                >
                  Claim Partner Fees
                </Button>
                <ClaimPartnerFeesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
              </div>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
}

export const getServerSideProps: GetServerSideProps<ClaimFeesPageProps> = async (context) => {
  const { wallet } = context.query;

  // If no wallet in query params, return false
  if (!wallet || typeof wallet !== 'string') {
    return {
      props: {
        isFeeClaimer: false,
      },
    };
  }

  // Check if wallet is feeClaimer
  const { isFeeClaimer } = await checkFeeClaimer(wallet);

  return {
    props: {
      isFeeClaimer,
      walletAddress: wallet,
    },
  };
};
