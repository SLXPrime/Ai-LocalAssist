import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AssistantModule } from './assistant/assistant.module';
import { AutomationModule } from './automation/automation.module';
import { configuration } from './config/configuration';
import { validationSchema } from './config/validation.schema';
import { MemoryModule } from './memory/memory.module';
import { ProvidersModule } from './providers/providers.module';
import { ToolsModule } from './tools/tools.module';
import { HealthController } from './health.controller';
import { TtsModule } from './tts/tts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    EventEmitterModule.forRoot(),
    MemoryModule,
    ProvidersModule,
    ToolsModule,
    TtsModule,
    AutomationModule,
    AssistantModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
