import { Inject, Injectable } from '@nestjs/common';
import { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions';
import { ToolExecutionResultDto } from '../assistant/dto/assistant-response.dto';
import { LlmChatOutput, LlmProvider } from './interfaces/llm-provider.interface';

export const LLM_PROVIDER = Symbol('LLM_PROVIDER');

@Injectable()
export class LlmService {
  constructor(@Inject(LLM_PROVIDER) private readonly provider: LlmProvider) {}

  chat(input: { messages: ChatCompletionMessageParam[]; tools?: ChatCompletionTool[] }): Promise<LlmChatOutput> {
    return this.provider.chat(input);
  }

  async summarizeToolResults(query: string, results: ToolExecutionResultDto[]): Promise<string> {
    const response = await this.provider.chat({
      messages: [
        {
          role: 'system',
          content:
            'You are an AI Operator. Explain the outcome of tool executions clearly and briefly in Portuguese.',
        },
        {
          role: 'user',
          content: JSON.stringify({ query, results }),
        },
      ],
    });

    return response.content;
  }
}

