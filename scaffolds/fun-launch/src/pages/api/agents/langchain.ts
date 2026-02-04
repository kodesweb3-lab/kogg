import type { NextApiRequest, NextApiResponse } from 'next';
import { KogaionAgent, PostgresMemory } from '@/lib/langchain-integration';
import { AgentMemoryService } from '@/lib/agent-memory';

const agents: Map<string, KogaionAgent> = new Map();

// Available agent types
const KOGAION_AGENTS: Record<string, { name: string; description: string; systemPrompt: string }> = {
  trader: {
    name: 'TraderAgent',
    description: 'DeFi trading specialist',
    systemPrompt: 'You are a DeFi trading agent. Help with swaps, yields, and market analysis.'
  },
  developer: {
    name: 'DeveloperAgent',
    description: 'Coding assistant',
    systemPrompt: 'You are a coding assistant. Help with Solidity, Rust, and JavaScript.'
  },
  artist: {
    name: 'ArtistAgent',
    description: 'Creative collaborator',
    systemPrompt: 'You are a creative artist. Help with visual art, poetry, and design.'
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      // ==================== CREATE/INIT AGENT ====================
      case 'POST': {
        const { action, agentName, agentType, systemPrompt, model } = req.body;

        // Initialize agent
        if (action === 'init') {
          const config = agentType && KOGAION_AGENTS[agentType as keyof typeof KOGAION_AGENTS]
            ? KOGAION_AGENTS[agentType as keyof typeof KOGAION_AGENTS]
            : { name: agentName, description: systemPrompt || 'Custom agent', systemPrompt: systemPrompt || '' };

          const agent = new KogaionAgent({
            name: agentName,
            description: config.description,
            systemPrompt: config.systemPrompt
          });

          await agent.initialize();
          agents.set(agentName, agent);

          return res.status(200).json({
            success: true,
            message: `Agent ${agentName} initialized`,
            agent: { name: agentName, type: agentType || 'custom' }
          });
        }

        // Chat with agent
        if (action === 'chat') {
          let agent = agents.get(agentName);
          
          if (!agent) {
            // Create on-demand
            agent = new KogaionAgent({ name: agentName });
            await agent.initialize();
            agents.set(agentName, agent);
          }

          const response = await agent.respond(req.body.message);
          return res.status(200).json({ success: true, response });
        }

        // Learn information
        if (action === 'learn') {
          await AgentMemoryService.storeMemory(agentName, {
            type: 'SEMANTIC',
            content: req.body.content,
            importance: req.body.importance || 0.7,
            source: req.body.source || 'api',
            tags: req.body.tags || []
          });

          return res.status(200).json({ success: true, message: 'Learned successfully' });
        }

        // Remember preference
        if (action === 'remember') {
          await AgentMemoryService.storeKnowledge(agentName, {
            entity: req.body.userId,
            entityType: 'user',
            properties: { [req.body.preference]: req.body.value },
            confidence: 0.9,
            source: 'user_interaction'
          });

          return res.status(200).json({ success: true, message: 'Remembered' });
        }

        // Get context
        if (action === 'context') {
          const context = await AgentMemoryService.buildContext(agentName, req.body.query || '');
          return res.status(200).json({ success: true, context });
        }

        return res.status(400).json({ error: 'Unknown action' });
      }

      // ==================== GET AGENT INFO ====================
      case 'GET': {
        const { agentName, action } = req.query as any;

        if (action === 'info') {
          const agent = agents.get(agentName);
          if (!agent) {
            return res.status(404).json({ error: 'Agent not found or not initialized' });
          }

          const context = await AgentMemoryService.buildContext(agentName, '');
          return res.status(200).json({
            success: true,
            agent: {
              name: agentName,
              hasActiveSession: true,
              ...context
            }
          });
        }

        // List available agent types
        if (action === 'types') {
          return res.status(200).json({
            success: true,
            types: Object.keys(KOGAION_AGENTS).map(key => ({
              name: key,
              description: KOGAION_AGENTS[key as keyof typeof KOGAION_AGENTS].description || ''
            }))
          });
        }

        return res.status(400).json({ error: 'Unknown action' });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('LangChain API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
