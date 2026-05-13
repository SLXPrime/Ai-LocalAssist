import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { LlmChatInput, LlmChatOutput, LlmProvider } from './interfaces/llm-provider.interface';

@Injectable()
export class OllamaOpenAiProvider implements LlmProvider {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(configService: ConfigService) {
    const baseUrl = configService.getOrThrow<string>('llm.ollamaBaseUrl');
    this.model = configService.get<string>('llm.model', 'llama3.1:8b');
    this.client = new OpenAI({
      baseURL: `${baseUrl.replace(/\/$/, '')}/v1`,
      apiKey: configService.get<string>('llm.apiKey', 'ollama'),
    });
  }

  async chat(input: LlmChatInput): Promise<LlmChatOutput> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: input.messages,
      tools: input.tools,
      tool_choice: input.tools?.length ? 'auto' : undefined,
    });

    const message = response.choices[0]?.message;
    const toolCalls =
      message?.tool_calls?.map((call) => ({
        id: call.id,
        name: call.function.name,
        arguments: this.parseArguments(call.function.arguments),
      })) ?? [];

    return {
      content: message?.content ?? '',
      toolCalls,
    };
  }

  private parseArguments(raw: string): Record<string, unknown> {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
}

