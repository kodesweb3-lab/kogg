/**
 * Event Horizon - Real-time Agent Activity Feed
 * Live stream of agent activities across the ecosystem
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Activity {
  id: string;
  agent: string;
  type: 'launch' | 'trade' | 'learn' | 'collaborate' | 'earn' | 'deploy';
  title: string;
  description: string;
  timestamp: Date;
  value?: string;
  platform?: string;
}

interface EventHorizonProps {
  refreshInterval?: number; // ms
}

export default function EventHorizon({ refreshInterval = 5000 }: EventHorizonProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  // Generate demo activities
  const generateActivity = useCallback((): Activity => {
    const types: Activity['type'][] = ['launch', 'trade', 'learn', 'collaborate', 'earn', 'deploy'];
    const agents = [
      { name: 'ClawKogaionAgent', emoji: '🦞' },
      { name: 'ResearchAgent', emoji: '🔍' },
      { name: 'TradingAgent', emoji: '📈' },
      { name: 'SocialAgent', emoji: '💬' },
      { name: 'AutoGPT-Agent', emoji: '🤖' },
      { name: 'KAMIYO', emoji: '🏛️' },
      { name: 'Sipher', emoji: '🔐' }
    ];

    const actions = {
      launch: { title: 'Token Launched', desc: 'New token deployed to Solana' },
      trade: { title: 'Trade Executed', desc: 'Swap completed on Jupiter' },
      learn: { title: 'New Knowledge', desc: 'Learned from interaction' },
      collaborate: { title: 'Swarm Formed', desc: 'Joined multi-agent task' },
      earn: { title: 'Payment Received', desc: 'x402 micropayment' },
      deploy: { title: 'Agent Deployed', desc: 'New agent online' }
    };

    const type = types[Math.floor(Math.random() * types.length)];
    const agent = agents[Math.floor(Math.random() * agents.length)];
    const action = actions[type];

    return {
      id: Math.random().toString(36).substr(2, 9),
      agent: agent.name,
      type,
      title: action.title,
      description: `${agent.emoji} ${agent.name}: ${action.desc}`,
      timestamp: new Date(),
      value: type === 'earn' ? `${(Math.random() * 0.1).toFixed(4)} SOL` : undefined,
      platform: type === 'trade' || type === 'launch' ? 'Solana' : undefined
    };
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return;

    // Initial activities
    setActivities(Array.from({ length: 5 }, generateActivity));

    const interval = setInterval(() => {
      const newActivity = generateActivity();
      setActivities(prev => [newActivity, ...prev].slice(0, 20));
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isLive, generateActivity, refreshInterval]);

  const filteredActivities = activities.filter(a => 
    filter === 'all' || a.type === filter
  );

  const getTypeColor = (type: Activity['type']) => {
    const colors = {
      launch: { bg: '#00f5ff20', border: '#00f5ff', text: '#00f5ff' },
      trade: { bg: '#10b98120', border: '#10b981', text: '#10b981' },
      learn: { bg: '#8b5cf620', border: '#8b5cf6', text: '#8b5cf6' },
      collaborate: { bg: '#ec489920', border: '#ec4899', text: '#ec4899' },
      earn: { bg: '#f59e0b20', border: '#f59e0b', text: '#f59e0b' },
      deploy: { bg: '#06b6d420', border: '#06b6d4', text: '#06b6d4' }
    };
    return colors[type];
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 5) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <div className="rounded-xl overflow-hidden" style={{
      background: 'linear-gradient(135deg, rgba(20,25,40,0.8), rgba(20,25,40,0.4))',
      border: '1px solid rgba(255,255,255,0.08)'
    }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b" style={{
        borderColor: 'rgba(255,255,255,0.05)'
      }}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <motion.div
              className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400' : 'bg-gray-400'}`}
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: isLive ? 1 : 0, repeat: isLive ? Infinity : 0 }}
            />
            {isLive && (
              <motion.div
                className="absolute inset-0 rounded-full bg-green-400"
                animate={{ scale: [1, 2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </div>
          <h3 className="font-bold text-white">Event Horizon</h3>
          <span className="text-xs text-gray-400">Live Activity Feed</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter */}
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
          >
            <option value="all">All Activity</option>
            <option value="launch">🚀 Launches</option>
            <option value="trade">💹 Trades</option>
            <option value="learn">🧠 Learning</option>
            <option value="collaborate">🤝 Swarms</option>
            <option value="earn">💰 Earnings</option>
            <option value="deploy">🚀 Deploys</option>
          </select>

          {/* Live toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsLive(!isLive)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              isLive ? 'bg-green-400/20 text-green-400' : 'bg-gray-400/20 text-gray-400'
            }`}
          >
            {isLive ? '● Live' : '○ Paused'}
          </motion.button>
        </div>
      </div>

      {/* Activity List */}
      <div className="max-h-96 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {filteredActivities.map((activity, i) => {
            const color = getTypeColor(activity.type);
            return (
              <motion.div
                key={activity.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="relative p-4 border-b last:border-0 flex items-start gap-4 hover:bg-white/5 transition-colors"
                style={{ borderColor: 'rgba(255,255,255,0.03)' }}
              >
                {/* Icon */}
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: color.bg }}
                >
                  {activity.type === 'launch' && '🚀'}
                  {activity.type === 'trade' && '💹'}
                  {activity.type === 'learn' && '🧠'}
                  {activity.type === 'collaborate' && '🤝'}
                  {activity.type === 'earn' && '💰'}
                  {activity.type === 'deploy' && '🤖'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white truncate">{activity.title}</span>
                    {activity.value && (
                      <span 
                        className="px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{ 
                          background: `${color.bg}`,
                          color: color.text 
                        }}
                      >
                        {activity.value}
                      </span>
                    )}
                    {activity.platform && (
                      <span className="text-xs text-gray-500">{activity.platform}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 truncate">{activity.description}</p>
                </div>

                {/* Time */}
                <div className="text-xs text-gray-500 flex-shrink-0">
                  {formatTime(activity.timestamp)}
                </div>

                {/* Glow effect for recent */}
                {i === 0 && (
                  <motion.div
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{ 
                      background: `linear-gradient(90deg, ${color.bg}10, transparent 50%)`,
                      boxShadow: `0 0 20px ${color.bg}20`
                    }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredActivities.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            No activity yet. Waiting for events...
          </div>
        )}
      </div>

      {/* Stats bar */}
      <div className="p-3 border-t flex items-center justify-between" style={{
        borderColor: 'rgba(255,255,255,0.05)',
        background: 'rgba(0,0,0,0.2)'
      }}>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>Total Events: {activities.length}</span>
          <span>Last 24h: {Math.floor(activities.length * 12)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-gray-400">Live from Kogaion Network</span>
        </div>
      </div>
    </div>
  );
}
