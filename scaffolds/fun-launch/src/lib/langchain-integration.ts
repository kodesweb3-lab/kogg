/**
 * LangChain + PostgreSQL Memory Integration
 * Simplified for Railway deployment
 * 
 * NOTE: Full LangChain requires external LLM API (OpenAI, Anthropic, Ollama)
 * This demo version uses local reasoning without external dependencies
 */

import { AgentMemoryService } from './agent-memory';

// ==================== SIMPLE AGENT REASONING ====================

interface AgentContext {
  thoughts: string[];
  memories: string[];
  sessionId: string | null;
}

class SimpleAgentReasoning {
  private context: AgentContext = {
    thoughts: [],
    memories: [],
    sessionId: null
  };

  think(prompt: string): string {
    const response = `[${this.context.sessionId || 'Agent'}] 🤔 ${prompt}\n\n📚 Recent memories:\n${this.context.memories.slice(-3).join('\n')}`;
    this.context.thoughts.push(prompt);
    return response;
  }

  remember(fact: string): void {
    this.context.memories.push(fact);
    // Persisted via PostgresMemory.saveContext / AgentMemoryService when agent name is set
  }

  setSession(sessionId: string): void {
    this.context.sessionId = sessionId;
  }

  getContext(): AgentContext {
    return { ...this.context };
  }
}

// ==================== POSTGRES MEMORY ====================

export class PostgresMemory {
  private agentName: string;
  private reasoning: SimpleAgentReasoning;

  constructor(agentName: string) {
    this.agentName = agentName;
    this.reasoning = new SimpleAgentReasoning();
  }

  async startSession() {
    const session = await AgentMemoryService.startSession(this.agentName);
    this.reasoning.setSession(session.id);
    return session;
  }

  async saveContext(input: string, output: string) {
    await AgentMemoryService.storeMemory(this.agentName, {
      type: 'EPISODIC',
      content: `User: "${input}" → Agent: "${output}"`,
      importance: 0.6,
      source: 'conversation',
      tags: ['conversation']
    });
    this.reasoning.remember(`User said: ${input}`);
  }

  async loadContext() {
    const memories = await AgentMemoryService.getRecentMemories(this.agentName, 10);
    return {
      chat_history: memories.map(m => m.content),
      recent_activity: memories.slice(0, 5).map(m => m.content)
    };
  }
}

// ==================== KOGAION AGENT ====================

export interface KogaionAgentConfig {
  name: string;
  description?: string;
  systemPrompt?: string;
}

export class KogaionAgent {
  name: string;
  config: KogaionAgentConfig;
  memory: PostgresMemory;
  reasoning: SimpleAgentReasoning;

  constructor(config: KogaionAgentConfig) {
    this.name = config.name;
    this.config = config;
    this.memory = new PostgresMemory(config.name);
    this.reasoning = new SimpleAgentReasoning();
  }

  async initialize() {
    await AgentMemoryService.initializeAgent(this.name, this.config.description);
    await this.memory.startSession();
    return this;
  }

  async think(userInput: string): Promise<string> {
    const context = await this.memory.loadContext();
    return this.reasoning.think(`${userInput}\n\nContext: ${context.chat_history.join('\n')}`);
  }

  async respond(userInput: string): Promise<string> {
    const response = await this.think(userInput);
    await this.memory.saveContext(userInput, response);
    return response;
  }
}

// ==================== EXPORTS ====================

export const langChain = {
  createAgent: (config: KogaionAgentConfig): KogaionAgent => new KogaionAgent(config),
  createReasoning: (): SimpleAgentReasoning => new SimpleAgentReasoning(),
};

export type { SimpleAgentReasoning, AgentContext };
