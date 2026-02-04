/**
 * Kogaion Agent Dashboard Component
 * Real-time agent monitoring and management
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@jup-ag/wallet-adapter';

interface Agent {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'learning' | 'working';
  tasksCompleted: number;
  earnings: number;
  memoryUsed: number;
  lastActive: string;
  capabilities: string[];
}

interface AgentDashboardProps {
  agents?: Agent[];
}

export default function AgentDashboard({ agents = [] }: AgentDashboardProps) {
  const { publicKey } = useWallet();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalAgents: agents.length || 3,
    activeTasks: 12,
    totalEarnings: 0.045,
    memoryUsage: 67
  });

  // Default agents for demo
  const defaultAgents: Agent[] = [
    {
      id: '1',
      name: 'ClawKogaionAgent',
      status: 'working',
      tasksCompleted: 47,
      earnings: 0.025,
      memoryUsed: 156,
      lastActive: 'Just now',
      capabilities: ['langchain', 'memory', 'social', 'trading']
    },
    {
      id: '2',
      name: 'ResearchAgent',
      status: 'active',
      tasksCompleted: 23,
      earnings: 0.012,
      memoryUsed: 89,
      lastActive: '2 min ago',
      capabilities: ['research', 'analysis', 'web-search']
    },
    {
      id: '3',
      name: 'TradingAgent',
      status: 'idle',
      tasksCompleted: 156,
      earnings: 0.158,
      memoryUsed: 234,
      lastActive: '15 min ago',
      capabilities: ['trading', 'defi', 'analytics']
    }
  ];

  const displayAgents = agents.length > 0 ? agents : defaultAgents;

  return (
    <div className="min-h-screen p-6">
      {/* Header Stats */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {[
          { label: 'Active Agents', value: stats.totalAgents, icon: '🤖', color: '#00f5ff' },
          { label: 'Tasks Today', value: stats.activeTasks, icon: '✅', color: '#10b981' },
          { label: 'Total Earnings', value: `${stats.totalEarnings} SOL`, icon: '💰', color: '#f59e0b' },
          { label: 'Memory Used', value: `${stats.memoryUsage}%`, icon: '🧠', color: '#8b5cf6' }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="relative overflow-hidden rounded-xl p-4"
            style={{
              background: `linear-gradient(135deg, ${stat.color}15, ${stat.color}05)`,
              border: `1px solid ${stat.color}30`
            }}
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-gray-400">{stat.label}</div>
            <motion.div 
              className="absolute inset-0 opacity-20"
              style={{ background: stat.color }}
              animate={{ opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Agent Grid */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Your Agents</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{
              background: 'linear-gradient(135deg, #00f5ff, #8b5cf6)',
              border: 'none'
            }}
          >
            + Deploy Agent
          </motion.button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {displayAgents.map((agent, i) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => setSelectedAgent(agent.id)}
                className={`relative overflow-hidden rounded-xl p-5 cursor-pointer transition-all ${
                  selectedAgent === agent.id ? 'ring-2 ring-cyan-400' : ''
                }`}
                style={{
                  background: 'linear-gradient(135deg, rgba(20,25,40,0.9), rgba(20,25,40,0.5))',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                {/* Status indicator */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <motion.span
                    className={`w-2 h-2 rounded-full ${
                      agent.status === 'active' || agent.status === 'working' 
                        ? 'bg-green-400' 
                        : 'bg-gray-400'
                    }`}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>

                {/* Agent icon & name */}
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                    style={{
                      background: `linear-gradient(135deg, ${getAgentColor(agent.name)}, ${getAgentColor(agent.name)}80)`
                    }}
                  >
                    {getAgentEmoji(agent.name)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{agent.name}</h3>
                    <span className="text-xs text-gray-400 capitalize">{agent.status}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="text-center p-2 rounded-lg bg-white/5">
                    <div className="text-lg font-bold text-cyan-400">{agent.tasksCompleted}</div>
                    <div className="text-xs text-gray-400">Tasks</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/5">
                    <div className="text-lg font-bold text-green-400">{agent.earnings} SOL</div>
                    <div className="text-xs text-gray-400">Earned</div>
                  </div>
                </div>

                {/* Capabilities */}
                <div className="flex flex-wrap gap-1">
                  {agent.capabilities.slice(0, 4).map(cap => (
                    <span 
                      key={cap}
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{
                        background: `${getAgentColor(agent.name)}20`,
                        color: getAgentColor(agent.name)
                      }}
                    >
                      {cap}
                    </span>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Memory</span>
                    <span>{agent.memoryUsed} MB</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                    <motion.div 
                      className="h-full rounded-full"
                      style={{ background: getAgentColor(agent.name) }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(agent.memoryUsed / 3, 100)}%` }}
                      transition={{ duration: 1, delay: i * 0.2 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {[
          { icon: '🚀', label: 'Launch Token', color: '#00f5ff' },
          { icon: '🤝', label: 'Create Swarm', color: '#8b5cf6' },
          { icon: '💬', label: 'Agent Chat', color: '#ec4899' },
          { icon: '📊', label: 'Analytics', color: '#10b981' }
        ].map((action, i) => (
          <motion.button
            key={action.label}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="p-4 rounded-xl text-center"
            style={{
              background: `linear-gradient(135deg, ${action.color}15, ${action.color}05)`,
              border: `1px solid ${action.color}30`
            }}
          >
            <div className="text-2xl mb-1">{action.icon}</div>
            <div className="text-sm font-medium text-white">{action.label}</div>
          </motion.button>
        ))}
      </motion.div>

      {/* Selected Agent Detail Modal */}
      <AnimatePresence>
        {selectedAgent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedAgent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl p-6 relative"
              style={{
                background: 'linear-gradient(135deg, rgba(20,25,40,0.95), rgba(20,25,40,0.9))',
                border: '1px solid rgba(0,245,255,0.2)'
              }}
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedAgent(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                ✕
              </button>

              {(() => {
                const agent = displayAgents.find(a => a.id === selectedAgent);
                if (!agent) return null;
                
                return (
                  <>
                    <div className="flex items-center gap-4 mb-6">
                      <div 
                        className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
                        style={{
                          background: `linear-gradient(135deg, ${getAgentColor(agent.name)}, ${getAgentColor(agent.name)}80)`
                        }}
                      >
                        {getAgentEmoji(agent.name)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{agent.name}</h2>
                        <span className="text-gray-400 capitalize">{agent.status}</span>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between p-3 rounded-lg bg-white/5">
                        <span className="text-gray-400">Tasks Completed</span>
                        <span className="font-bold text-white">{agent.tasksCompleted}</span>
                      </div>
                      <div className="flex justify-between p-3 rounded-lg bg-white/5">
                        <span className="text-gray-400">Total Earnings</span>
                        <span className="font-bold text-green-400">{agent.earnings} SOL</span>
                      </div>
                      <div className="flex justify-between p-3 rounded-lg bg-white/5">
                        <span className="text-gray-400">Memory Used</span>
                        <span className="font-bold text-white">{agent.memoryUsed} MB</span>
                      </div>
                      <div className="flex justify-between p-3 rounded-lg bg-white/5">
                        <span className="text-gray-400">Last Active</span>
                        <span className="font-bold text-white">{agent.lastActive}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 py-3 rounded-lg font-semibold"
                        style={{
                          background: 'linear-gradient(135deg, #00f5ff, #8b5cf6)',
                          border: 'none'
                        }}
                      >
                        Chat
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 py-3 rounded-lg font-semibold border"
                        style={{
                          borderColor: 'rgba(0,245,255,0.3)',
                          background: 'transparent'
                        }}
                      >
                        Configure
                      </motion.button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getAgentColor(name: string): string {
  const colors: Record<string, string> = {
    'ClawKogaionAgent': '#00f5ff',
    'ResearchAgent': '#8b5cf6',
    'TradingAgent': '#10b981',
    'SocialAgent': '#ec4899'
  };
  return colors[name] || '#00f5ff';
}

function getAgentEmoji(name: string): string {
  const emojis: Record<string, string> = {
    'ClawKogaionAgent': '🦞',
    'ResearchAgent': '🔍',
    'TradingAgent': '📈',
    'SocialAgent': '💬'
  };
  return emojis[name] || '🤖';
}
