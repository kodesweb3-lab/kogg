import { TokenPageMsgHandler } from '@/components/Token/TokenPageMsgHandler';
import { TokenChart } from '@/components/TokenChart/TokenChart';
import { TokenDetails } from '@/components/TokenHeader/TokenDetail';
import { TokenHeader } from '@/components/TokenHeader/TokenHeader';
import { TokenStats } from '@/components/TokenHeader/TokenStats';
import { TokenBottomPanel } from '@/components/TokenTable';
import Page from '@/components/ui/Page/Page';
import { DataStreamProvider, useDataStream } from '@/contexts/DataStreamProvider';
import { TokenChartProvider } from '@/contexts/TokenChartProvider';
import { useTokenAddress, useTokenInfo } from '@/hooks/queries';
import { BotActivationModal } from '@/components/BotActivationModal';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useWallet } from '@jup-ag/wallet-adapter';

const Terminal = dynamic(() => import('@/components/Terminal'), { ssr: false });

const SwapWidget = () => {
  const tokenId = useTokenAddress();

  if (!tokenId) {
    return null;
  }

  return <Terminal mint={tokenId} />;
};

export const TokenPageWithContext = () => {
  const tokenId = useTokenAddress();
  const { data: poolId } = useTokenInfo((data) => data?.id);
  const { subscribeTxns, unsubscribeTxns, subscribePools, unsubscribePools } = useDataStream();
  const { publicKey } = useWallet();
  const [isBotModalOpen, setIsBotModalOpen] = useState(false);

  // Subscribe to token txns
  useEffect(() => {
    if (!tokenId) {
      return;
    }
    subscribeTxns([tokenId]);
    return () => {
      unsubscribeTxns([tokenId]);
    };
  }, [tokenId, subscribeTxns, unsubscribeTxns]);

  useEffect(() => {
    if (!poolId) {
      return;
    }

    subscribePools([poolId]);
    return () => {
      unsubscribePools([poolId]);
    };
    // dont track tokenId to prevent data mismatch
  }, [poolId, subscribePools, unsubscribePools]);

  return (
    <Page>
      <TokenPageMsgHandler />

      <div className="max-h-screen">
        <div className="flex mb-4 rounded-lg border border-neutral-700 p-3">
          <TokenHeader className="max-sm:order-1" />
        </div>

        <div className="w-full h-full flex flex-col md:flex-row gap-4">
          <div className="flex flex-col gap-4 mb-8 max-sm:w-full lg:min-w-[400px] max-sm:order-3">
            <TokenDetails />
            <div>
              <SwapWidget />
            </div>
            {publicKey && tokenId && (
              <div className="mt-4">
                <Button
                  onClick={() => setIsBotModalOpen(true)}
                  className="w-full"
                  variant="outline"
                >
                  🐺 Activate Token Bot
                </Button>
              </div>
            )}
          </div>

          <div className={'border-neutral-850 w-full max-sm:order-2'}>
            <TokenStats key={`token-stats-${poolId}`} />

            <div className="flex flex-col h-[300px] lg:h-[500px] w-full">
              <TokenChartProvider>
                <TokenChart />
              </TokenChartProvider>
            </div>

            {/* Height 0 makes the element not contribute to height sizing */}
            {/* Min height 100% makes the element fill height */}

            <TokenBottomPanel className="flex h-0 min-h-full flex-col overflow-hidden" />

            {/* <div className="flex flex-1 flex-col overflow-hidden mt-4 h-[300px] lg:h-[500px] max-sm:order-4">
              <TxnsTab />
            </div> */}
          </div>
        </div>
      </div>

      {/* Bot Activation Modal */}
      {tokenId && (
        <BotActivationModal
          tokenMint={tokenId}
          isOpen={isBotModalOpen}
          onClose={() => setIsBotModalOpen(false)}
          onSuccess={() => {
            // Refresh or show success message
          }}
        />
      )}
    </Page>
  );
};

export default function TokenPage() {
  return (
    <DataStreamProvider>
      <TokenPageWithContext />
    </DataStreamProvider>
  );
}
