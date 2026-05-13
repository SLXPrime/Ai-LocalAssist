import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { MemoryRole } from '../memory.service';

type StoredMessage = { role: MemoryRole; content: string };

@Injectable()
export class RedisContextStore implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly maxMessages = 12;
  private readonly ttlSeconds = 60 * 60 * 24;

  constructor(configService: ConfigService) {
    this.redis = new Redis({
      host: configService.get<string>('redis.host'),
      port: configService.get<number>('redis.port'),
      password: configService.get<string>('redis.password'),
      lazyConnect: false,
    });
  }

  async appendMessage(conversationId: string, role: MemoryRole, content: string): Promise<void> {
    const key = this.key(conversationId);
    await this.redis
      .multi()
      .rpush(key, JSON.stringify({ role, content }))
      .ltrim(key, -this.maxMessages, -1)
      .expire(key, this.ttlSeconds)
      .exec();
  }

  async replaceRecentMessages(conversationId: string, messages: StoredMessage[]): Promise<void> {
    const key = this.key(conversationId);
    const multi = this.redis.multi().del(key);
    for (const message of messages.slice(-this.maxMessages)) {
      multi.rpush(key, JSON.stringify(message));
    }
    await multi.expire(key, this.ttlSeconds).exec();
  }

  async getRecentMessages(conversationId: string): Promise<StoredMessage[]> {
    const values = await this.redis.lrange(this.key(conversationId), 0, -1);
    return values.map((value) => JSON.parse(value) as StoredMessage);
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }

  private key(conversationId: string): string {
    return `conversation:${conversationId}:recent`;
  }
}

