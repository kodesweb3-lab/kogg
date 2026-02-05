'use client';

import { useWolfTheme } from '@/contexts/WolfThemeProvider';
import { FireIcon, FrostIcon, BloodIcon, MoonIcon, StoneIcon } from '@/components/icons/MiscIcons';
import { motion } from 'framer-motion';

const WOLF_OPTIONS = [
  { id: 'fire' as const, Icon: FireIcon, label: 'Fire' },
  { id: 'frost' as const, Icon: FrostIcon, label: 'Frost' },
  { id: 'blood' as const, Icon: BloodIcon, label: 'Blood' },
  { id: 'moon' as const, Icon: MoonIcon, label: 'Moon' },
  { id: 'stone' as const, Icon: StoneIcon, label: 'Stone' },
];

export function WolfThemeSelector({ className }: { className?: string }) {
  const { selectedWolf, setSelectedWolf } = useWolfTheme();

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <span className="text-xs text-[var(--text-muted)] font-body mr-2">Pack:</span>
      <div className="flex gap-1">
        {WOLF_OPTIONS.map((wolf) => {
          const Icon = wolf.Icon;
          const isSelected = selectedWolf === wolf.id;
          return (
            <motion.button
              key={wolf.id}
              onClick={() => setSelectedWolf(isSelected ? null : wolf.id)}
              className={`
                w-8 h-8 rounded-lg border transition-all
                flex items-center justify-center
                ${isSelected 
                  ? 'border-[var(--accent)] bg-[var(--bg-elevated)] shadow-lg shadow-[var(--accent)]/20' 
                  : 'border-[var(--border-default)] bg-[var(--bg-layer)] hover:border-[var(--text-muted)]/50'
                }
              `}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title={wolf.label}
            >
              <Icon 
                className={`w-4 h-4 ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}
              />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
