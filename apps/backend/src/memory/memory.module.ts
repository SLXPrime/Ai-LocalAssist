import { Module } from '@nestjs/common';
import { MemoryService } from './memory.service';
import { PostgresMemoryStore } from './stores/postgres-memory.store';
import { RedisContextStore } from './stores/redis-context.store';

@Module({
  providers: [MemoryService, PostgresMemoryStore, RedisContextStore],
  exports: [MemoryService],
})
export class MemoryModule {}

