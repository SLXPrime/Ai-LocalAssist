import { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions';

export interface LlmChatInput {
  messages: ChatCompletionMessageParam[];
  tools?: ChatCompletionTool[];
}

export interface LlmToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface LlmChatOutput {
  content: string;
  toolCalls?: LlmToolCall[];
}

export interface LlmProvider {
  chat(input: LlmChatInput): Promise<LlmChatOutput>;
}

