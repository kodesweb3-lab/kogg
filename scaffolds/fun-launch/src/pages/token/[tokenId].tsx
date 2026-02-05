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
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { TokenShareButtons } from '@/components/TokenShareButtons';

const SwapPanel = dynamic(() => import('@/components/SwapPanel'), { ssr: false });

const SwapWidget = () => {
  const tokenId = useTokenAddress();
  const { data: tokenSymbol } = useTokenInfo((data) => data?.symbol);

  if (!tokenId) {
    return null;
  }

  return <SwapPanel mint={tokenId} tokenSymbol={tokenSymbol || 'TOKEN'} />;
};

export const TokenPageWithContext = () => {
  const tokenId = useTokenAddress();
  const { data: poolId, isLoading: isLoadingToken } = useTokenInfo((data) => data?.id);
  const { subscribeTxns, unsubscribeTxns, subscribePools, unsubscribePools } = useDataStream();

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

  // Show loading state while router is hydrating or token is loading
  if (!tokenId || isLoadingToken) {
    return (
      <Page>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin" />
            <p className="text-[var(--text-muted)] font-body">Loading token...</p>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <TokenPageMsgHandler />

      <div className="min-h-screen">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 rounded-lg border border-neutral-700 p-3 gap-4">
          <TokenHeader className="max-sm:order-1" />
          <TokenShareButtons />
        </div>

        <div className="w-full h-full flex flex-col md:flex-row gap-4">
          <div className="flex flex-col gap-4 mb-8 max-sm:w-full lg:min-w-[400px] max-sm:order-3">
            <TokenDetails />
            <div>
              <SwapWidget />
            </div>
          </div>

          <div className={'border-neutral-850 w-full max-sm:order-2 flex flex-col'}>
            <TokenStats key={`token-stats-${poolId}`} />

            <div className="flex flex-col h-[300px] lg:h-[500px] w-full mb-4">
              <TokenChartProvider>
                <TokenChart />
              </TokenChartProvider>
            </div>

            <TokenBottomPanel className="flex flex-col overflow-hidden h-[400px] lg:h-[500px]" />

            {/* <div className="flex flex-1 flex-col overflow-hidden mt-4 h-[300px] lg:h-[500px] max-sm:order-4">
              <TxnsTab />
            </div> */}
          </div>
        </div>
      </div>
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
