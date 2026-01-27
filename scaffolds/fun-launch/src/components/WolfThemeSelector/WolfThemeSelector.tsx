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
      <span className="text-xs text-mystic-steam-parchment/60 font-body mr-2">Pack:</span>
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
                  ? 'border-wolf-accent bg-wolf-bg-tint shadow-lg shadow-wolf-glow' 
                  : 'border-obsidian-border bg-obsidian-surface hover:border-wolf-border'
                }
              `}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title={wolf.label}
            >
              <Icon 
                className={`w-4 h-4 ${isSelected ? 'text-wolf-accent' : 'text-mystic-steam-parchment/40'}`}
              />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
