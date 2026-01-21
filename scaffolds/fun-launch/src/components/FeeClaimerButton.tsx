'use client';

import { useState, useMemo } from 'react';
import { useWallet } from '@jup-ag/wallet-adapter';
import { useIsPlatformFeeClaimer } from '@/hooks/useIsFeeClaimer';
import dynamic from 'next/dynamic';

const ClaimPartnerFeesModal = dynamic(() => import('./ClaimPartnerFeesModal'), { ssr: false });

export function FeeClaimerButton() {
  const { publicKey } = useWallet();
  const [isClaimFeesOpen, setIsClaimFeesOpen] = useState(false);
  const address = useMemo(() => publicKey?.toBase58(), [publicKey]);
  
  // Use hook and immediately extract primitive values using useMemo to prevent object rendering
  const feeClaimerHookResult = useIsPlatformFeeClaimer();
  
  // Extract values with maximum type safety using useMemo - ensure primitives only
  // Never allow objects to be used in render - extract immediately
  const isFeeClaimer = useMemo<boolean>(() => {
    try {
      if (!feeClaimerHookResult) return false;
      if (typeof feeClaimerHookResult !== 'object') return false;
      if (feeClaimerHookResult === null) return false;
      if (Array.isArray(feeClaimerHookResult)) return false;
      const value = (feeClaimerHookResult as { isFeeClaimer?: unknown }).isFeeClaimer;
      return typeof value === 'boolean' ? value : false;
    } catch {
      return false;
    }
  }, [feeClaimerHookResult]);
  
  const isLoadingFeeClaimer = useMemo<boolean>(() => {
    try {
      if (!feeClaimerHookResult) return false;
      if (typeof feeClaimerHookResult !== 'object') return false;
      if (feeClaimerHookResult === null) return false;
      if (Array.isArray(feeClaimerHookResult)) return false;
      const value = (feeClaimerHookResult as { isLoading?: unknown }).isLoading;
      return typeof value === 'boolean' ? value : false;
    } catch {
      return false;
    }
  }, [feeClaimerHookResult]);

  // Safely handle feeClaimer check - ensure all values are valid primitives
  // Prevent rendering with undefined/null/object values that could cause React error #130
  const showClaimButton = useMemo<boolean>(() => {
    return Boolean(
      address &&
      typeof address === 'string' &&
      !isLoadingFeeClaimer &&
      isFeeClaimer === true
    );
  }, [address, isLoadingFeeClaimer, isFeeClaimer]);

  if (!showClaimButton) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsClaimFeesOpen(true)}
        className="p-2 text-mystic-steam-copper hover:text-mystic-steam-copper/80 transition-colors"
        title="Claim Partner Fees"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      <ClaimPartnerFeesModal isOpen={isClaimFeesOpen} onClose={() => setIsClaimFeesOpen(false)} />
    </>
  );
}
