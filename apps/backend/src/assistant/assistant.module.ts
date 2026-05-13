import { Module } from '@nestjs/common';
import { MemoryModule } from '../memory/memory.module';
import { ProvidersModule } from '../providers/providers.module';
import { ToolsModule } from '../tools/tools.module';
import { TtsModule } from '../tts/tts.module';
import { AssistantController } from './assistant.controller';
import { AssistantService } from './assistant.service';

@Module({
  imports: [MemoryModule, ProvidersModule, ToolsModule, TtsModule],
  controllers: [AssistantController],
  providers: [AssistantService],
})
export class AssistantModule {}
