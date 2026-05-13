import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { MemoryRole } from '../memory.service';

@Injectable()
export class PostgresMemoryStore implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor(configService: ConfigService) {
    this.pool = new Pool({
      host: configService.get<string>('postgres.host'),
      port: configService.get<number>('postgres.port'),
      database: configService.get<string>('postgres.database'),
      user: configService.get<string>('postgres.user'),
      password: configService.get<string>('postgres.password'),
    });
  }

  async ensureSchema(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS conversation_messages (
        id BIGSERIAL PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_created
      ON conversation_messages (conversation_id, created_at DESC);
    `);
  }

  async appendMessage(conversationId: string, role: MemoryRole, content: string): Promise<void> {
    await this.pool.query(
      'INSERT INTO conversation_messages (conversation_id, role, content) VALUES ($1, $2, $3)',
      [conversationId, role, content],
    );
  }

  async getRecentMessages(conversationId: string, limit: number): Promise<Array<{ role: MemoryRole; content: string }>> {
    const result = await this.pool.query<{ role: MemoryRole; content: string }>(
      `
        SELECT role, content
        FROM conversation_messages
        WHERE conversation_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `,
      [conversationId, limit],
    );

    return result.rows.reverse();
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}

