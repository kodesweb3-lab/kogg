/**
 * Agent Memory Service
 * PostgreSQL-backed persistent memory for Kogaion agents
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface MemoryInput {
  type: 'EPISODIC' | 'SEMANTIC' | 'PROCEDURAL' | 'WORKING' | 'PREFERENCE' | 'RELATIONSHIP';
  content: string;
  importance?: number;
  source?: string;
  entities?: string[];
  tags?: string[];
}

export interface KnowledgeInput {
  entity: string;
  entityType: string;
  properties: Record<string, any>;
  confidence?: number;
  source?: string;
}

// ==================== AGENT OPERATIONS ====================

export async function createAgent(name: string, description?: string, dna?: Record<string, any>) {
  return await prisma.agent.create({
    data: {
      name,
      description,
      dna
    }
  });
}

export async function getAgent(name: string) {
  return await prisma.agent.findUnique({
    where: { name },
    include: {
      memories: {
        orderBy: { createdAt: 'desc' },
        take: 100
      },
      knowledge: true,
      sessions: {
        orderBy: { startedAt: 'desc' },
        take: 10
      }
    }
  });
}

// ==================== MEMORY OPERATIONS ====================

export async function storeMemory(agentName: string, memory: MemoryInput) {
  return await prisma.agentMemory.create({
    data: {
      agentId: (await getAgent(agentName)!).id,
      type: memory.type,
      content: memory.content,
      importance: memory.importance || 0.5,
      source: memory.source,
      entities: memory.entities || [],
      tags: memory.tags || []
    }
  });
}

export async function searchMemories(
  agentName: string,
  query: string,
  options?: {
    type?: string;
    minImportance?: number;
    limit?: number;
  }
) {
  // For semantic search, we would use embeddings
  // For now, use text search
  const agent = await getAgent(agentName);
  if (!agent) throw new Error('Agent not found');

  return await prisma.agentMemory.findMany({
    where: {
      agentId: agent.id,
      ...(options?.type && { type: options.type }),
      ...(options?.minImportance && { importance: { gte: options.minImportance } }),
      content: { contains: query, mode: 'insensitive' }
    },
    orderBy: { importance: 'desc' },
    take: options?.limit || 20
  });
}

export async function getRecentMemories(agentName: string, limit = 50) {
  const agent = await getAgent(agentName);
  if (!agent) throw new Error('Agent not found');

  return await prisma.agentMemory.findMany({
    where: { agentId: agent.id },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
}

export async function getImportantMemories(agentName: string, threshold = 0.7) {
  const agent = await getAgent(agentName);
  if (!agent) throw new Error('Agent not found');

  return await prisma.agentMemory.findMany({
    where: {
      agentId: agent.id,
      importance: { gte: threshold }
    },
    orderBy: { importance: 'desc' }
  });
}

// ==================== KNOWLEDGE OPERATIONS ====================

export async function storeKnowledge(agentName: string, knowledge: KnowledgeInput) {
  const agent = await getAgent(agentName);
  if (!agent) throw new Error('Agent not found');

  return await prisma.agentKnowledge.upsert({
    where: {
      agentId_entity: {
        agentId: agent.id,
        entity: knowledge.entity
      }
    },
    update: {
      properties: knowledge.properties,
      confidence: knowledge.confidence || 1.0,
      source: knowledge.source,
      updatedAt: new Date()
    },
    create: {
      agentId: agent.id,
      entity: knowledge.entity,
      entityType: knowledge.entityType,
      properties: knowledge.properties,
      confidence: knowledge.confidence || 1.0,
      source: knowledge.source
    }
  });
}

export async function getKnowledge(agentName: string, entity: string) {
  const agent = await getAgent(agentName);
  if (!agent) throw new Error('Agent not found');

  return await prisma.agentKnowledge.findUnique({
    where: {
      agentId_entity: {
        agentId: agent.id,
        entity
      }
    }
  });
}

export async function searchKnowledge(agentName: string, entityType?: string) {
  const agent = await getAgent(agentName);
  if (!agent) throw new Error('Agent not found');

  return await prisma.agentKnowledge.findMany({
    where: {
      agentId: agent.id,
      ...(entityType && { entityType })
    }
  });
}

// ==================== SESSION OPERATIONS ====================

export async function startSession(agentName: string) {
  const agent = await getAgent(agentName);
  if (!agent) throw new Error('Agent not found');

  return await prisma.agentSession.create({
    data: {
      agentId: agent.id,
      startedAt: new Date()
    }
  });
}

export async function endSession(sessionId: string, summary?: string, decisions?: any[], outcomes?: any[]) {
  return await prisma.agentSession.update({
    where: { id: sessionId },
    data: {
      endedAt: new Date(),
      summary,
      decisions: decisions || [],
      outcomes: outcomes || []
    }
  });
}

export async function getRecentSessions(agentName: string, limit = 10) {
  const agent = await getAgent(agentName);
  if (!agent) throw new Error('Agent not found');

  return await prisma.agentSession.findMany({
    where: { agentId: agent.id },
    orderBy: { startedAt: 'desc' },
    take: limit
  });
}

// ==================== AGENT SERVICE OPERATIONS ====================

export async function registerService(service: {
  providerAgent: string;
  name: string;
  description: string;
  endpoints: string[];
  pricing: { unit: string; price: number; currency: string };
  capabilities: string[];
}) {
  return await prisma.agentService.create({
    data: service
  });
}

export async function getServices(capability?: string) {
  return await prisma.agentService.findMany({
    where: {
      ...(capability && {
        capabilities: { has: capability }
      })
    },
    orderBy: { rating: 'desc' }
  });
}

// ==================== CONTEXT BUILDER ====================

export async function buildContext(agentName: string, query: string) {
  const agent = await getAgent(agentName);
  if (!agent) throw new Error('Agent not found');

  // Get relevant memories
  const memories = await searchMemories(agentName, query, { limit: 10 });
  
  // Get important memories
  const important = await getImportantMemories(agentName, 0.8);
  
  // Get knowledge
  const knowledge = await searchKnowledge(agentName);
  
  // Get recent sessions
  const sessions = await getRecentSessions(agentName, 5);

  return {
    agent: {
      name: agent.name,
      dna: agent.dna
    },
    relevantMemories: memories.map(m => ({
      type: m.type,
      content: m.content,
      importance: m.importance
    })),
    importantMemories: important.map(m => ({
      type: m.type,
      content: m.content,
      importance: m.importance
    })),
    knowledge: knowledge.map(k => ({
      entity: k.entity,
      type: k.entityType,
      properties: k.properties
    })),
    recentSessions: sessions.map(s => ({
      summary: s.summary,
      decisions: s.decisions,
      outcomes: s.outcomes
    }))
  };
}

// ==================== INITIALIZATION ====================

export async function initializeAgent(name: string, description?: string) {
  let agent = await getAgent(name);
  
  if (!agent) {
    agent = await createAgent(name, description, {
      creativity: 0.7,
      caution: 0.5,
      speed: 0.9,
      sociability: 0.7,
      curiosity: 0.8
    });
    
    // Store initial memory
    await storeMemory(name, {
      type: 'EPISODIC',
      content: `Agent ${name} was initialized.`,
      importance: 0.9,
      source: 'system',
      tags: ['initialization']
    });
  }
  
  return agent;
}
