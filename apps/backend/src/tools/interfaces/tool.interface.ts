import { ChatCompletionTool } from 'openai/resources/chat/completions';

export enum ToolPermission {
  ReadSystem = 'read:system',
  ManageDocker = 'manage:docker',
  RunSafeShell = 'run:safe-shell',
  ManageMinecraft = 'manage:minecraft',
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface AiTool {
  name: string;
  description: string;
  permission: ToolPermission;
  parameters: ChatCompletionTool['function']['parameters'];
  execute(args: Record<string, unknown>): Promise<ToolResult>;
}

