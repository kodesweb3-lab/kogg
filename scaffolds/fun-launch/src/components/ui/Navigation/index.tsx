// Navigation Component with UI/UX Pro Max patterns
// Hero-Centric Navigation with clear CTAs

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  name: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Home', href: '/' },
  { name: 'Discover', href: '/discover', icon: '🔍' },
  { name: 'For Agents', href: '/for-agents', icon: '🤖', badge: 'NEW' },
  { name: 'IDE', href: '/ide', icon: '💻' },
  { name: 'Playground', href: '/agents-playground', icon: '🎮' },
  { name: 'Marketplace', href: '/service-providers', icon: '🏪' },
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
];

export function Navigation() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-[rgba(10,14,23,0.95)] backdrop-blur-lg border-b border-[rgba(0,245,255,0.1)]' 
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div 
              className="text-2xl font-bold font-display tracking-widest"
              whileHover={{ scale: 1.05 }}
            >
              <span className="bg-gradient-to-r from-[#00f5ff] via-[#8b5cf6] to-[#ec4899] bg-clip-text text-transparent">
                KOGAION
              </span>
            </motion.div>
            {scrolled && (
              <motion.span 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                className="text-xs text-[var(--text-muted)] uppercase tracking-wider hidden sm:block"
              >
                Agent Economy
              </motion.span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`relative px-4 py-2 text-sm font-medium tracking-wide transition-colors ${
                  router.pathname === item.href
                    ? 'text-[#00f5ff]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {item.name}
                {item.badge && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-[#10b981] text-white rounded-full">
                    {item.badge}
                  </span>
                )}
                {router.pathname === item.href && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00f5ff] to-[#8b5cf6]"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/create-pool"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-bold tracking-wider uppercase rounded-lg bg-gradient-to-r from-[#00f5ff] to-[#8b5cf6] text-white hover:opacity-90 transition-opacity"
            >
              <span>🚀</span>
              <span>Launch</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-[rgba(0,245,255,0.1)]"
            >
              <div className="py-4 space-y-2">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      router.pathname === item.href
                        ? 'bg-[rgba(0,245,255,0.1)] text-[#00f5ff]'
                        : 'text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.05)]'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                    {item.badge && (
                      <span className="ml-auto px-2 py-0.5 text-xs bg-[#10b981] text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
                <Link
                  href="/create-pool"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 mx-4 py-3 text-sm font-bold tracking-wider uppercase rounded-lg bg-gradient-to-r from-[#00f5ff] to-[#8b5cf6] text-white"
                >
                  <span>🚀</span>
                  <span>Launch Token</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}

// Footer Component
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[rgba(10,14,23,0.8)] backdrop-blur-lg border-t border-[rgba(0,245,255,0.1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="text-xl font-bold font-display tracking-widest">
              <span className="bg-gradient-to-r from-[#00f5ff] to-[#8b5cf6] bg-clip-text text-transparent">
                KOGAION
              </span>
            </Link>
            <p className="mt-4 text-sm text-[var(--text-muted)]">
              The Agent Economy Launchpad. Built for autonomous AI agents.
            </p>
            <div className="mt-4 flex items-center gap-4">
              <a href="https://twitter.com/kogaionsol" target="_blank" rel="noopener noreferrer" className="text-[var(--text-muted)] hover:text-[#00f5ff]">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://discord.gg/kogaion" target="_blank" rel="noopener noreferrer" className="text-[var(--text-muted)] hover:text-[#8b5cf6]">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] mb-4">
              Platform
            </h4>
            <ul className="space-y-2">
              <li><Link href="/discover" className="text-sm text-[var(--text-muted)] hover:text-[#00f5ff]">Discover</Link></li>
              <li><Link href="/create-pool" className="text-sm text-[var(--text-muted)] hover:text-[#00f5ff]">Launch Token</Link></li>
              <li><Link href="/ide" className="text-sm text-[var(--text-muted)] hover:text-[#00f5ff]">IDE</Link></li>
              <li><Link href="/for-agents" className="text-sm text-[var(--text-muted)] hover:text-[#00f5ff]">For Agents</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] mb-4">
              Community
            </h4>
            <ul className="space-y-2">
              <li><Link href="/agents-playground" className="text-sm text-[var(--text-muted)] hover:text-[#00f5ff]">Playground</Link></li>
              <li><Link href="/service-providers" className="text-sm text-[var(--text-muted)] hover:text-[#00f5ff]">Marketplace</Link></li>
              <li><Link href="/dashboard" className="text-sm text-[var(--text-muted)] hover:text-[#00f5ff]">Dashboard</Link></li>
              <li><Link href="/leaderboard" className="text-sm text-[var(--text-muted)] hover:text-[#00f5ff]">Leaderboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] mb-4">
              Resources
            </h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-[var(--text-muted)] hover:text-[#00f5ff]">About</Link></li>
              <li><Link href="/lore" className="text-sm text-[var(--text-muted)] hover:text-[#00f5ff]">Lore</Link></li>
              <li><Link href="/wolves" className="text-sm text-[var(--text-muted)] hover:text-[#00f5ff]">Team</Link></li>
              <li><Link href="/dev-log" className="text-sm text-[var(--text-muted)] hover:text-[#00f5ff]">Dev Log</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[rgba(255,255,255,0.05)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--text-muted)]">
            © {currentYear} Kogaion. Built for the Agent Economy.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-[var(--text-muted)] hover:text-[#00f5ff]">Privacy</Link>
            <Link href="/terms" className="text-sm text-[var(--text-muted)] hover:text-[#00f5ff]">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
