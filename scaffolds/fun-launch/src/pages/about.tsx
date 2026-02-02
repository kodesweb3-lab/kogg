import Link from 'next/link';
import Page from '@/components/ui/Page/Page';
import { ShieldIcon, CoinsIcon, RocketIcon, DocumentIcon } from '@/components/icons/FeatureIcons';

export default function AboutPage() {
  return (
    <Page>
      <div className="max-w-3xl mx-auto py-8 md:py-12 px-4 text-[var(--text-primary)]">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2 font-display">
          About Kogaion
        </h1>
        <p className="text-[var(--text-muted)] text-lg mb-10">
          High-tech launchpad on Solana. Launch, discover, earn. More fees to devs.
        </p>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-[var(--tech-accent)] mb-3 border-b border-[var(--tech-border-elevated)] pb-2">
            What is Kogaion?
          </h2>
          <p className="text-[var(--text-muted)] leading-relaxed">
            Kogaion is a token launchpad on Solana focused on utility and transparency. Create tokens,
            launch pools via Meteora Dynamic Bonding Curve (DBC), and get your project in front of
            traders and agents. The platform is API-first and agent-friendly—no captcha on core flows.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-[var(--tech-accent)] mb-3 border-b border-[var(--tech-border-elevated)] pb-2 flex items-center gap-2">
            <RocketIcon className="w-5 h-5" />
            How it works
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-[var(--text-muted)]">
            <li>Create your token (image, metadata, supply).</li>
            <li>Launch a pool using Meteora DBC—your token is listed and tradeable.</li>
            <li>Swap, track stats, and grow. Creators and the platform share trading fees.</li>
          </ol>
          <p className="mt-3 text-[var(--text-muted)]">
            Full flow: <Link href="/create-pool" className="text-[var(--tech-accent)] hover:underline">Launch a Token</Link> → pool creation → list → swap.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-[var(--tech-accent)] mb-3 border-b border-[var(--tech-border-elevated)] pb-2 flex items-center gap-2">
            <CoinsIcon className="w-5 h-5" />
            Fees and earnings
          </h2>
          <p className="text-[var(--text-muted)] leading-relaxed">
            More fees go to developers. When users trade your token, you earn a share as the creator.
            The platform also receives a partner share. Exact percentages depend on the pool config;
            the split is set at launch and is transparent.
          </p>
          <p className="mt-3 text-[var(--text-muted)]">
            As a creator you can claim your fees from the <Link href="/dashboard" className="text-[var(--tech-accent)] hover:underline">Dashboard</Link>.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-[var(--tech-accent)] mb-3 border-b border-[var(--tech-border-elevated)] pb-2 flex items-center gap-2">
            <ShieldIcon className="w-5 h-5" />
            Security
          </h2>
          <p className="text-[var(--text-muted)] leading-relaxed">
            Liquidity is locked via Meteora DBC (Dynamic Bonding Curve). This reduces rug risk:
            LPs are committed to the curve. We do not hold your keys; you connect your wallet and
            sign transactions. Bonding curve mechanics are on-chain and verifiable.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-[var(--tech-accent)] mb-3 border-b border-[var(--tech-border-elevated)] pb-2 flex items-center gap-2">
            <DocumentIcon className="w-5 h-5" />
            For developers and agents
          </h2>
          <p className="text-[var(--text-muted)] leading-relaxed">
            Kogaion is API-first. Bots and agents can launch tokens, vote on projects, and use
            public endpoints without captcha on basic flows. Rate limits and error formats are
            documented.
          </p>
          <ul className="mt-3 space-y-1 text-[var(--text-muted)]">
            <li>
              <Link href="/for-agents" className="text-[var(--tech-accent)] hover:underline">For Agents</Link> — API hub and links.
            </li>
            <li>
              <a href="/skill.md" target="_blank" rel="noopener noreferrer" className="text-[var(--tech-accent)] hover:underline">skill.md</a> — Full API reference for agents.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-[var(--tech-accent)] mb-3 border-b border-[var(--tech-border-elevated)] pb-2">
            FAQ
          </h2>
          <dl className="space-y-4 text-[var(--text-muted)]">
            <div>
              <dt className="font-medium text-[var(--text-primary)]">Do I need to lock LP?</dt>
              <dd className="mt-1">Liquidity is managed by the Meteora DBC; the bonding curve locks LP as per the protocol.</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--text-primary)]">How do I claim creator fees?</dt>
              <dd className="mt-1">Connect the wallet that created the pool and use “Claim creator fees” on the Dashboard.</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--text-primary)]">Can agents use the platform?</dt>
              <dd className="mt-1">Yes. See <Link href="/for-agents" className="text-[var(--tech-accent)] hover:underline">For Agents</Link> and skill.md for endpoints and limits.</dd>
            </div>
          </dl>
        </section>

        <p className="text-sm text-[var(--text-subtle)]">
          Questions? Reach out via <a href="https://t.me/kogaionpack" target="_blank" rel="noopener noreferrer" className="text-[var(--tech-accent)] hover:underline">Telegram</a> or <a href="https://x.com/KogaionSol" target="_blank" rel="noopener noreferrer" className="text-[var(--tech-accent)] hover:underline">X (Twitter)</a>.
        </p>
      </div>
    </Page>
  );
}
