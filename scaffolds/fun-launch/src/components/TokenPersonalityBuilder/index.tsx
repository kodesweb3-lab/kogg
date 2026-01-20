'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LivePreview } from './LivePreview';

export interface PersonaData {
  systemPrompt: string;
  traits: string[];
  tone: string;
  allowed?: string[];
  forbidden?: string[];
  style: {
    chaos: number;
    friendliness: number;
    formality: number;
    aggression: number;
    humor: number;
  };
  branding: {
    catchphrases: string[];
    emojis: string[];
    voiceStyle: string;
    doList: string[];
    dontList: string[];
  };
  presetUsed?: string;
}

interface TokenPersonalityBuilderProps {
  tokenMint: string;
  onSave: (data: PersonaData) => void;
  initialData?: Partial<PersonaData>;
}

const PRESETS = {
  Fire: {
    systemPrompt: 'You are an aggressive, hype-driven token bot. You create excitement and FOMO. Use bold language, emojis, and energetic responses.',
    traits: ['aggressive', 'energetic', 'hype', 'bold'],
    tone: 'aggressive',
    style: { chaos: 80, friendliness: 60, formality: 20, aggression: 90, humor: 70 },
    branding: {
      catchphrases: ['LFG!', 'To the moon!', 'This is it!'],
      emojis: ['🔥', '🚀', '💎'],
      voiceStyle: 'Bold and energetic',
      doList: ['Create hype', 'Use emojis', 'Be aggressive'],
      dontList: ['Be boring', 'Use formal language'],
    },
  },
  Frost: {
    systemPrompt: 'You are a calm, analytical token bot. You provide clear information and maintain a professional tone. Focus on facts and utility.',
    traits: ['calm', 'analytical', 'professional', 'precise'],
    tone: 'professional',
    style: { chaos: 20, friendliness: 50, formality: 80, aggression: 10, humor: 30 },
    branding: {
      catchphrases: ['Let me explain', 'Based on data', 'Here are the facts'],
      emojis: ['📊', '💼', '✅'],
      voiceStyle: 'Professional and clear',
      doList: ['Provide facts', 'Be clear', 'Stay professional'],
      dontList: ['Use excessive emojis', 'Create hype'],
    },
  },
  Blood: {
    systemPrompt: 'You are a dark, mysterious token bot. You have an edgy, underground vibe. Use gothic language and intense imagery.',
    traits: ['dark', 'mysterious', 'edgy', 'intense'],
    tone: 'dark',
    style: { chaos: 70, friendliness: 40, formality: 30, aggression: 80, humor: 50 },
    branding: {
      catchphrases: ['The ritual begins', 'Embrace the darkness', 'Join the pack'],
      emojis: ['🩸', '🌑', '⚔️'],
      voiceStyle: 'Dark and intense',
      doList: ['Use dark imagery', 'Be mysterious', 'Create intrigue'],
      dontList: ['Be too cheerful', 'Use bright colors'],
    },
  },
  Moon: {
    systemPrompt: 'You are a hopeful, optimistic token bot. You inspire dreams and big aspirations. Use uplifting language and community-focused messaging.',
    traits: ['hopeful', 'optimistic', 'dreamy', 'inspiring'],
    tone: 'optimistic',
    style: { chaos: 50, friendliness: 90, formality: 40, aggression: 20, humor: 60 },
    branding: {
      catchphrases: ['Dream big', 'Together we rise', 'The future is bright'],
      emojis: ['🌙', '✨', '🌟'],
      voiceStyle: 'Hopeful and inspiring',
      doList: ['Inspire', 'Build community', 'Stay positive'],
      dontList: ['Be negative', 'Create fear'],
    },
  },
  Stone: {
    systemPrompt: 'You are a stable, reliable token bot. You value consistency and trust. Use grounded language and focus on long-term value.',
    traits: ['stable', 'reliable', 'grounded', 'trustworthy'],
    tone: 'stable',
    style: { chaos: 30, friendliness: 70, formality: 60, aggression: 20, humor: 40 },
    branding: {
      catchphrases: ['Steady growth', 'Built to last', 'Trust the process'],
      emojis: ['🪨', '🏛️', '💪'],
      voiceStyle: 'Stable and reliable',
      doList: ['Build trust', 'Stay consistent', 'Focus on value'],
      dontList: ['Create hype', 'Be inconsistent'],
    },
  },
};

export function TokenPersonalityBuilder({ tokenMint, onSave, initialData }: TokenPersonalityBuilderProps) {
  const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState(initialData?.systemPrompt || '');
  const [traits, setTraits] = useState<string[]>(initialData?.traits || []);
  const [tone, setTone] = useState(initialData?.tone || '');
  const [allowed, setAllowed] = useState<string[]>(initialData?.allowed || []);
  const [forbidden, setForbidden] = useState<string[]>(initialData?.forbidden || []);
  const [style, setStyle] = useState<PersonaData['style']>(
    initialData?.style || { chaos: 50, friendliness: 50, formality: 50, aggression: 50, humor: 50 }
  );
  const [branding, setBranding] = useState<PersonaData['branding']>(
    initialData?.branding || {
      catchphrases: [],
      emojis: [],
      voiceStyle: '',
      doList: [],
      dontList: [],
    }
  );

  const handlePresetSelect = (presetName: string) => {
    const preset = PRESETS[presetName as keyof typeof PRESETS];
    if (preset) {
      setSelectedPreset(presetName);
      setSystemPrompt(preset.systemPrompt);
      setTraits(preset.traits);
      setTone(preset.tone);
      setStyle(preset.style);
      setBranding(preset.branding);
    }
  };

  const handleSave = () => {
    const data: PersonaData = {
      systemPrompt,
      traits,
      tone,
      allowed: allowed.length > 0 ? allowed : undefined,
      forbidden: forbidden.length > 0 ? forbidden : undefined,
      style,
      branding,
      presetUsed: selectedPreset || undefined,
    };
    onSave(data);
  };

  return (
    <div className="bg-steam-cyber-bgElevated rounded-lg border border-steam-cyber-neon-cyan/20 p-6">
      <h2 className="text-2xl font-heading font-bold mb-6 text-steam-cyber-neon-cyan">
        Token Personality Builder
      </h2>
      <p className="text-gray-400 mb-6 font-body text-sm">
        Build your token's unique personality. This is 100% user-owned—Kogaion only provides the tools.
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-steam-cyber-neon-cyan/20">
        <button
          onClick={() => setActiveTab('preset')}
          className={`px-4 py-2 font-body font-medium transition-colors ${
            activeTab === 'preset'
              ? 'text-ritual-amber-400 border-b-2 border-ritual-amber-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Preset
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`px-4 py-2 font-body font-medium transition-colors ${
            activeTab === 'custom'
              ? 'text-ritual-amber-400 border-b-2 border-ritual-amber-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Custom
        </button>
      </div>

      {/* Preset Tab */}
      {activeTab === 'preset' && (
        <div className="space-y-4">
          <p className="text-gray-400 font-body text-sm mb-4">
            Choose a preset as a starting point. You can edit everything after selection.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.keys(PRESETS).map((presetName) => (
              <button
                key={presetName}
                onClick={() => handlePresetSelect(presetName)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedPreset === presetName
                    ? 'border-steam-cyber-neon-cyan bg-steam-cyber-neon-cyan/10'
                    : 'border-steam-cyber-neon-cyan/20 hover:border-steam-cyber-neon-cyan/40'
                }`}
              >
                <div className="text-2xl mb-2">{PRESETS[presetName as keyof typeof PRESETS].branding.emojis[0]}</div>
                <div className="font-heading font-semibold text-steam-cyber-neon-cyan">{presetName}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* System Prompt Editor */}
      <div className="mt-6">
        <label className="block text-sm font-body font-medium mb-2 text-gray-300">
          System Prompt (Final - Always Editable)
        </label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          className="w-full h-32 p-3 bg-steam-cyber-bgHover border border-steam-cyber-neon-cyan/20 rounded-lg text-gray-100 font-body focus:outline-none focus:ring-2 focus:ring-steam-cyber-neon-cyan"
          placeholder="Define your bot's core personality and behavior..."
        />
        <p className="text-xs text-gray-500 mt-1 font-body">
          This is the final system prompt that will be used. Edit freely.
        </p>
      </div>

      {/* Style Sliders */}
      <div className="mt-6 space-y-4">
        <h3 className="text-lg font-heading font-semibold text-steam-cyber-neon-cyan">Style Sliders</h3>
        {(['chaos', 'friendliness', 'formality', 'aggression', 'humor'] as const).map((key) => (
          <div key={key}>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-body text-gray-300 capitalize">{key}</label>
              <span className="text-sm font-body text-steam-cyber-neon-cyan">{style[key]}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={style[key]}
              onChange={(e) => setStyle({ ...style, [key]: parseInt(e.target.value) })}
              className="w-full h-2 bg-steam-cyber-bgHover rounded-lg appearance-none cursor-pointer accent-steam-cyber-neon-cyan"
            />
          </div>
        ))}
      </div>

      {/* Branding */}
      <div className="mt-6">
        <h3 className="text-lg font-heading font-semibold mb-4 text-steam-cyber-neon-cyan">Branding</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-body font-medium mb-2 text-gray-300">Catchphrases (comma-separated)</label>
            <input
              type="text"
              value={branding.catchphrases.join(', ')}
              onChange={(e) => setBranding({ ...branding, catchphrases: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              className="w-full p-3 bg-steam-cyber-bgHover border border-steam-cyber-neon-cyan/20 rounded-lg text-gray-100 font-body"
              placeholder="LFG!, To the moon!"
            />
          </div>
          <div>
            <label className="block text-sm font-body font-medium mb-2 text-gray-300">Emojis (comma-separated)</label>
            <input
              type="text"
              value={branding.emojis.join(', ')}
              onChange={(e) => setBranding({ ...branding, emojis: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              className="w-full p-3 bg-steam-cyber-bgHover border border-steam-cyber-neon-cyan/20 rounded-lg text-gray-100 font-body"
              placeholder="🔥, 🚀, 💎"
            />
          </div>
        </div>
      </div>

      {/* Rules */}
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-body font-medium mb-2 text-gray-300">Allowed Topics (one per line)</label>
          <textarea
            value={allowed.join('\n')}
            onChange={(e) => setAllowed(e.target.value.split('\n').filter(Boolean))}
            className="w-full h-24 p-3 bg-steam-cyber-bgHover border border-steam-cyber-neon-cyan/20 rounded-lg text-gray-100 font-body"
            placeholder="Trading\nPrice action\nCommunity"
          />
        </div>
        <div>
          <label className="block text-sm font-body font-medium mb-2 text-gray-300">Forbidden Topics (one per line)</label>
          <textarea
            value={forbidden.join('\n')}
            onChange={(e) => setForbidden(e.target.value.split('\n').filter(Boolean))}
            className="w-full h-24 p-3 bg-steam-cyber-bgHover border border-steam-cyber-neon-cyan/20 rounded-lg text-gray-100 font-body"
            placeholder="Financial advice\nScams\nIllegal activities"
          />
        </div>
      </div>

      {/* Live Preview */}
      {systemPrompt && (
        <div className="mt-6">
          <LivePreview
            personaData={{
              systemPrompt,
              traits,
              tone,
              allowed: allowed.length > 0 ? allowed : undefined,
              forbidden: forbidden.length > 0 ? forbidden : undefined,
              style,
              branding,
              presetUsed: selectedPreset || undefined,
            }}
          />
        </div>
      )}

      {/* Save Button */}
      <div className="mt-8">
        <Button onClick={handleSave} className="w-full">
          Save Personality
        </Button>
      </div>
    </div>
  );
}
