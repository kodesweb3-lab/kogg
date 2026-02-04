import type { NextApiRequest, NextApiResponse } from 'next';
import { 
  initializeAgent, 
  storeMemory, 
  searchMemories,
  getImportantMemories,
  storeKnowledge,
  getKnowledge,
  buildContext,
  registerService,
  getServices
} from '@/lib/agent-memory';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      // ==================== AGENT ====================
      case 'POST': {
        // POST /api/agents - Create or get agent
        const { action, name, description } = req.body;
        
        if (action === 'init') {
          const agent = await initializeAgent(name, description);
          return res.status(200).json({ success: true, agent });
        }
        
        if (action === 'context') {
          const context = await buildContext(name, req.body.query || '');
          return res.status(200).json({ success: true, context });
        }
        
        return res.status(400).json({ error: 'Unknown action' });
      }

      // ==================== MEMORY ====================
      case 'PUT': {
        // PUT /api/agents/memory - Store memory
        const { agentName, memory } = req.body;
        const result = await storeMemory(agentName, memory);
        return res.status(200).json({ success: true, memory: result });
      }

      case 'GET': {
        // GET /api/agents/memory - Search memories
        const { agentName, query, type, minImportance, limit } = req.query as any;
        
        if (query) {
          const memories = await searchMemories(agentName, query, {
            type,
            minImportance: minImportance ? parseFloat(minImportance) : undefined,
            limit: limit ? parseInt(limit) : undefined
          });
          return res.status(200).json({ success: true, memories });
        }
        
        // Get important memories
        if (minImportance) {
          const memories = await getImportantMemories(agentName, parseFloat(minImportance));
          return res.status(200).json({ success: true, memories });
        }
        
        return res.status(400).json({ error: 'Query required' });
      }

      // ==================== KNOWLEDGE ====================
      case 'PATCH': {
        // PATCH /api/agents/knowledge - Store knowledge
        const { agentName, knowledge } = req.body;
        const result = await storeKnowledge(agentName, knowledge);
        return res.status(200).json({ success: true, knowledge: result });
      }

      // ==================== SERVICES ====================
      case 'POST': {
        // POST /api/agents/services - Register service
        if (req.body.action === 'register') {
          const service = await registerService(req.body.service);
          return res.status(200).json({ success: true, service });
        }
        
        // GET /api/agents/services - List services
        const services = await getServices(req.body.capability);
        return res.status(200).json({ success: true, services });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('Agent Memory API Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
}
