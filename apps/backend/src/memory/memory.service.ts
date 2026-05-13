import { Injectable, OnModuleInit } from '@nestjs/common';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { PostgresMemoryStore } from './stores/postgres-memory.store';
import { RedisContextStore } from './stores/redis-context.store';

export type MemoryRole = 'user' | 'assistant';

@Injectable()
export class MemoryService implements OnModuleInit {
  constructor(
    private readonly postgres: PostgresMemoryStore,
    private readonly redis: RedisContextStore,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.postgres.ensureSchema();
  }

  async appendMessage(conversationId: string, role: MemoryRole, content: string): Promise<void> {
    await Promise.all([
      this.postgres.appendMessage(conversationId, role, content),
      this.redis.appendMessage(conversationId, role, content),
    ]);
  }

  async getRecentContext(conversationId: string): Promise<ChatCompletionMessageParam[]> {
    const cached = await this.redis.getRecentMessages(conversationId);
    if (cached.length > 0) {
      return cached;
    }

    const persisted = await this.postgres.getRecentMessages(conversationId, 12);
    await this.redis.replaceRecentMessages(conversationId, persisted);
    return persisted;
  }
}

