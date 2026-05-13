import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AssistantRequestDto } from './dto/assistant-request.dto';
import { AssistantResponseDto, ToolExecutionResultDto } from './dto/assistant-response.dto';
import { MemoryService } from '../memory/memory.service';
import { LlmService } from '../providers/llm.service';
import { ToolRegistryService } from '../tools/tool-registry.service';
import { TtsService } from '../tts/tts.service';

@Injectable()
export class AssistantService {
  private readonly logger = new Logger(AssistantService.name);

  constructor(
    private readonly llmService: LlmService,
    private readonly memoryService: MemoryService,
    private readonly toolRegistry: ToolRegistryService,
    private readonly ttsService: TtsService,
    private readonly events: EventEmitter2,
  ) {}

  async ask(request: AssistantRequestDto): Promise<AssistantResponseDto> {
    const conversationId = request.conversationId ?? randomUUID();
    const recentContext = await this.memoryService.getRecentContext(conversationId);
    const tools = this.toolRegistry.getOpenAiToolDefinitions();

    await this.memoryService.appendMessage(conversationId, 'user', request.query);
    this.events.emit('assistant.query.received', { conversationId, query: request.query });

    const firstTurn = await this.llmService.chat({
      messages: [
        {
          role: 'system',
          content:
            'You are an AI Operator for a smart home. Use tools only when needed. Prefer safe, explicit actions. Reply in Portuguese when the user writes Portuguese.',
        },
        ...recentContext,
        { role: 'user', content: request.query },
      ],
      tools,
    });

    const executedTools: ToolExecutionResultDto[] = [];
    const toolCalls = firstTurn.toolCalls ?? [];

    for (const call of toolCalls) {
      const result = await this.toolRegistry.execute(call.name, call.arguments);
      executedTools.push({ tool: call.name, success: result.success, result: result.data ?? result.error });
    }

    const answer =
      toolCalls.length > 0
        ? await this.llmService.summarizeToolResults(request.query, executedTools)
        : firstTurn.content;

    await this.memoryService.appendMessage(conversationId, 'assistant', answer);
    const audio = await this.ttsService.synthesizeAnswer({ conversationId, text: answer });
    this.logger.log(`Conversation ${conversationId} answered with ${executedTools.length} tool calls`);

    return {
      conversationId,
      answer,
      audioUrl: audio?.url,
      tools: executedTools,
    };
  }
}
