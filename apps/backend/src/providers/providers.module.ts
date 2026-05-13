import { Module } from '@nestjs/common';
import { LLM_PROVIDER, LlmService } from './llm.service';
import { OllamaOpenAiProvider } from './ollama-openai.provider';

@Module({
  providers: [
    LlmService,
    OllamaOpenAiProvider,
    {
      provide: LLM_PROVIDER,
      useExisting: OllamaOpenAiProvider,
    },
  ],
  exports: [LlmService],
})
export class ProvidersModule {}

