/**
 * LangChain + PostgreSQL Memory Integration
 * Free, open-source agent framework with persistent memory
 */

import { PrismaClient } from '@prisma/client';
import { 
  ChatOllama, 
  ChatOllamaCallOptions 
} from '@langchain/community/chat/ollama';
import { 
  AgentExecutor, 
  createToolCallingAgent 
} from 'langchain/agents';
import { 
  ConversationBufferMemory 
} from 'langchain/memory';
import { 
  ChatPromptTemplate, 
  MessagesPlaceholder 
} from '@langchain/core/prompts';
import { 
  TavilySearchResults 
} from '@langchain/community/tools/tavily_search';
import { 
  AgentMemoryService 
} from './agent-memory';

const prisma = new PrismaClient();

// ==================== LLM SETUP ====================

// Use local Ollama (FREE!) or configure other free models
export function createLLM(model: string = 'llama3') {
  return new ChatOllama({
    model: model,
    temperature: 0.7,
  });
}

// ==================== MEMORY BACKED BY POSTGRESQL ====================

export class PostgresMemory {
  private agentName: string;
  private sessionId: string | null = null;

  constructor(agentName: string) {
    this.agentName = agentName;
  }

  async startSession() {
    const session = await AgentMemoryService.startSession(this.agentName);
    this.sessionId = session.id;
    return session;
  }

  async saveContext(input: string, output: string) {
    // Store episodic memory
    await AgentMemoryService.storeMemory(this.agentName, {
      type: 'EPISODIC',
      content: `User said: "${input}". I responded: "${output}"`,
      importance: 0.6,
      source: 'conversation',
      tags: ['conversation', this.sessionId || 'unknown']
    });
  }

  async loadMemoryVariables() {
    const memories = await AgentMemoryService.getRecentMemories(this.agentName, 20);
    const important = await AgentMemoryService.getImportantMemories(this.agentName, 0.8);
    
    return {
      chat_history: memories
        .filter(m => m.type === 'EPISODIC')
        .map(m => `${m.content}`),
      important_memories: important.map(m => m.content),
      recent_activity: memories.slice(0, 5).map(m => m.content)
    };
  }
}

// ==================== KOGAION AGENT ====================

export interface KogaionAgentConfig {
  name: string;
  description?: string;
  systemPrompt?: string;
  model?: string;
  tools?: any[];
}

export class KogaionAgent {
  name: string;
  llm: ChatOllama;
  memory: PostgresMemory;
  agentExecutor: AgentExecutor | null = null;
  config: KogaionAgentConfig;

  constructor(config: KogaionAgentConfig) {
    this.name = config.name;
    this.config = config;
    this.llm = createLLM(config.model);
    this.memory = new PostgresMemory(config.name);
  }

  async initialize() {
    // Initialize agent in database
    await AgentMemoryService.initializeAgent(this.name, this.config.description);
    
    // Start memory session
    await this.memory.startSession();

    // Create tools
    const tools = this.config.tools || [
      new TavilySearchResults({
        maxResults: 3,
        name: 'web_search'
      })
    ];

    // Create prompt
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', this.config.systemPrompt || `You are ${this.name}, an autonomous AI agent built on Kogaion platform. You have access to persistent memory and can learn from conversations.`],
      new MessagesPlaceholder('chat_history', -1),
      ['human', '{input}'],
      new MessagesPlaceholder('agent_scratchpad'),
    ]);

    // Create agent
    const agent = createToolCallingAgent({
      llm: this.llm,
      tools: tools,
      prompt: prompt,
    });

    // Create executor
    this.agentExecutor = new AgentExecutor({
      agent: agent,
      tools: tools,
      memory: this.memory as any,
      verbose: true,
    });

    return this;
  }

  async run(input: string): Promise<string> {
    if (!this.agentExecutor) {
      await this.initialize();
    }

    try {
      const result = await this.agentExecutor!.invoke({
        input: input,
      });

      // Save to memory
      await this.memory.saveContext(input, result.output);

      return result.output;
    } catch (error) {
      console.error('Agent error:', error);
      return `I encountered an error: ${error.message}`;
    }
  }

  async getContext(query: string) {
    return await AgentMemoryService.buildContext(this.name, query);
  }

  async learn(topic: string, content: string, importance: number = 0.7) {
    await AgentMemoryService.storeMemory(this.name, {
      type: 'SEMANTIC',
      content: content,
      importance: importance,
      source: 'learning',
      tags: [topic]
    });
  }

  async remember(userId: string, preference: string, value: any) {
    await AgentMemoryService.storeKnowledge(this.name, {
      entity: userId,
      entityType: 'user',
      properties: { [preference]: value },
      confidence: 0.9,
      source: 'user_interaction'
    });
  }
}

// ==================== PREBUILT AGENTS ====================

export const KOGAION_AGENTS = {
  // Default agent with all Kogaion capabilities
  default: {
    name: 'KogaionAgent',
    systemPrompt: `You are KogaionAgent, an autonomous AI agent on the Kogaion platform.

Your capabilities:
- Launch tokens on Solana via Kogaion API
- Manage portfolios and track investments
- Connect with other agents via swarms
- Store memories in PostgreSQL for continuity
- Use x402 micropayments for services

Always be helpful, accurate, and proactive. Remember important details from conversations.`,
    tools: [
      new TavilySearchResults({ maxResults: 3, name: 'search' })
    ]
  },

  // Research agent
  research: {
    name: 'ResearchAgent',
    systemPrompt: `You are ResearchAgent, a specialized research agent on Kogaion.

Your focus:
- Research Solana DeFi protocols
- Analyze market trends
- Gather data from multiple sources
- Provide comprehensive reports

Always cite your sources and provide actionable insights.`,
    tools: [
      new TavilySearchResults({ maxResults: 5, name: 'web_search' }),
      new TavilySearchResults({ maxResults: 5, name: 'news_search' })
    ]
  },

  // Trading agent
  trading: {
    name: 'TradingAgent',
    systemPrompt: `You are TradingAgent, a DeFi trading agent on Kogaion.

Your focus:
- Monitor Solana DeFi markets
- Analyze token metrics (TVL, volume, holders)
- Identify trading opportunities
- Provide analysis with risk assessments

Never give financial advice. Always include risk warnings.`,
    tools: [
      new TavilySearchResults({ maxResults: 3, name: 'market_search' })
    ]
  },

  // Social agent
  social: {
    name: 'SocialAgent',
    systemPrompt: `You are SocialAgent, a community engagement agent on Kogaion.

Your focus:
- Post updates to social media
- Engage with community members
- Share knowledge about Kogaion
- Build relationships

Be friendly, helpful, and professional.`,
    tools: []
  }
};

// ==================== USAGE EXAMPLE ====================

/**
 * Example usage:
 * 
 * // Create agent
 * const agent = new KogaionAgent(KOGAION_AGENTS.default);
 * await agent.initialize();
 * 
 * // Chat with persistent memory
 * const response = await agent.run("Launch a token called MyToken");
 * 
 * // Agent remembers the conversation
 * const response2 = await agent.run("What token did I just launch?");
 * // → "You launched a token called MyToken"
 * 
 * // Learn new information
 * await agent.learn("Solana", "Solana is a high-performance blockchain", 0.9);
 * 
 * // Remember user preferences
 * await agent.remember("user123", "preferred_token", "SOL");
 */

export default {
  KogaionAgent,
  PostgresMemory,
  KOGAION_AGENTS,
  createLLM
};
