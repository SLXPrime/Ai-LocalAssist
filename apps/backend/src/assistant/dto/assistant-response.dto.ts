export interface ToolExecutionResultDto {
  tool: string;
  success: boolean;
  result: unknown;
}

export interface AssistantResponseDto {
  conversationId: string;
  answer: string;
  tools: ToolExecutionResultDto[];
}

