# Claim Fees (Creator + Partner) and Partner ID (feeClaimer)

This document explains how fee claiming works on Kogaion (Meteora DBC) and how to change the Partner ID (feeClaimer).

---

## 1. How claim works (Meteora DBC)

### Terminology

- **Partner** = the launchpad (platform). Identified by **`feeClaimer`** in the **DBC config** (on-chain account referenced by `POOL_CONFIG_KEY`).
- **Creator** = the token creator (developer). Identified by **`creator`** in the **pool state** (`poolState.account.creator`).

### Fee configuration (on-chain)

- The DBC config (key `POOL_CONFIG_KEY`) stores: `feeClaimer`, `creatorTradingFeePercentage`, `poolFees`, etc.
- **`creatorTradingFeePercentage`**: If 0 (current default), 100% of trading fees go to `feeClaimer`. If &gt; 0, a percentage goes to the creator.
- Fees accumulate on-chain and are reported by `getPoolFeeMetrics`: `partnerBaseFee`, `partnerQuoteFee`, `creatorBaseFee`, `creatorQuoteFee`.

### Two claim flows

| Actor   | SDK method                              | Condition                          | Implementation |
|--------|------------------------------------------|------------------------------------|-----------------|
| Partner | `client.partner.claimPartnerTradingFee` | Wallet = `poolConfig.feeClaimer`   | `POST /api/claim-partner-fee`, page `/claim-fees` |
| Creator | `client.creator.claimCreatorTradingFee` | Wallet = `poolState.account.creator` | `POST /api/claim-creator-fee`, Dashboard "Claim creator fees" |

- **Partner claim**: Only the wallet set as `feeClaimer` in the pool’s DBC config can claim partner fees. Page `/claim-fees` is not linked in public nav; only users who know the URL and connect the feeClaimer wallet can use it.
- **Creator claim**: Only the pool creator (on-chain `poolState.account.creator`) can claim creator fees. Available in the Dashboard via "Claim creator fees" and per-token "Claim fees" in the Token Portfolio table.

---

## 2. Implementation overview

### Partner (platform) claim

- **API**: `POST /api/claim-partner-fee` — body: `{ baseMint, feeClaimer [, receiver ] }`. Builds and returns a serialized claim transaction (base64). The caller signs and sends it (e.g. via `POST /api/send-transaction`).
- **Page**: `/claim-fees` — server-side checks that the connected wallet is the feeClaimer for `POOL_CONFIG_KEY`; only then the user sees the claim UI (e.g. `ClaimPartnerFeesModal`).
- **Config**: `POOL_CONFIG_KEY` (env) or `DEFAULT_POOL_CONFIG_KEY` in `src/lib/config.ts` identifies the DBC config account. The config’s `feeClaimer` is read on-chain when building the claim.

### Creator (developer) claim

- **API**: `POST /api/claim-creator-fee` — body: `{ baseMint, creator }`. Verifies `poolState.account.creator === creator`, then builds and returns the creator claim transaction (base64).
- **API (optional)**: `GET /api/pool-fee-metrics?baseMint=...` — returns `creatorBaseFee`, `creatorQuoteFee`, `partnerBaseFee`, `partnerQuoteFee` (as strings) for UI display.
- **Dashboard**: "Claim creator fees" button opens `ClaimCreatorFeesModal`. The modal lists only tokens created by the connected wallet (via `GET /api/tokens?creatorWallet=...`), shows fee metrics for the selected token, and runs the claim flow (claim-creator-fee → sign → send-transaction). Per-token "Claim fees" in the Token Portfolio table opens the same modal with that token preselected.

---

## 3. Changing Partner ID (feeClaimer) — step-by-step

**What “Partner ID” means:** The **feeClaimer** address in the DBC config. It is set **when the config is created on-chain**, not via .env.

**How it’s used today:**

- `POOL_CONFIG_KEY` in env (or `DEFAULT_POOL_CONFIG_KEY` in code) is the **config account public key**, not the feeClaimer address. The app loads the config from chain and uses its `feeClaimer` for partner claims.
- New pools created by the app use this `POOL_CONFIG_KEY`; their config (and thus feeClaimer) is fixed at pool creation.

**Steps to change to a new feeClaimer (new “Partner ID”):**

1. **Create a new DBC config on-chain** with the new feeClaimer:
   - **Option A**: Use [launch.meteora.ag](https://launch.meteora.ag) if Meteora provides a UI to create a config (including setting feeClaimer).
   - **Option B**: Use the Meteora DBC TypeScript SDK: call the `create_config` instruction with the new config account, `quoteMint`, **`feeClaimer`** (new partner wallet), `leftoverReceiver`, `payer`, and desired fee parameters (e.g. `creatorTradingFeePercentage`).
   - Result: you get a **new config public key** (new Config Key).

2. **Update the application:**
   - In `.env`: set `POOL_CONFIG_KEY=<new_config_key>`.
   - Optionally in `src/lib/config.ts`: update `DEFAULT_POOL_CONFIG_KEY` for local/default use.

3. **Important:**
   - **Existing pools** keep their original config (and original feeClaimer). Only **new pools** created after the change will use the new config and new feeClaimer.
   - Partner claims for old pools still use the **old** feeClaimer wallet; partner claims for new pools use the **new** feeClaimer wallet.

**Summary:** “Partner ID” = feeClaimer in the DBC config. To change it, create a **new** config on-chain with the new feeClaimer, then set `POOL_CONFIG_KEY` to that new config key in the app environment.
