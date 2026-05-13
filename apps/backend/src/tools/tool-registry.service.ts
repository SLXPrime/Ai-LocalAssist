import { Injectable, Logger } from '@nestjs/common';
import { ChatCompletionTool } from 'openai/resources/chat/completions';
import { AiTool, ToolResult } from './interfaces/tool.interface';
import { DockerTools } from './tools/docker.tools';
import { MinecraftTools } from './tools/minecraft.tools';
import { SafeShellTools } from './tools/safe-shell.tools';
import { SystemTools } from './tools/system.tools';

@Injectable()
export class ToolRegistryService {
  private readonly logger = new Logger(ToolRegistryService.name);
  private readonly tools = new Map<string, AiTool>();

  constructor(
    dockerTools: DockerTools,
    shellTools: SafeShellTools,
    systemTools: SystemTools,
    minecraftTools: MinecraftTools,
  ) {
    [...dockerTools.getTools(), ...shellTools.getTools(), ...systemTools.getTools(), ...minecraftTools.getTools()].forEach(
      (tool) => this.register(tool),
    );
  }

  getOpenAiToolDefinitions(): ChatCompletionTool[] {
    return [...this.tools.values()].map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  }

  async execute(name: string, args: Record<string, unknown>): Promise<ToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      return { success: false, error: `Unknown tool: ${name}` };
    }

    this.logger.log(`Executing tool ${name} with permission ${tool.permission}`);
    return tool.execute(args);
  }

  private register(tool: AiTool): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Duplicate tool registered: ${tool.name}`);
    }
    this.tools.set(tool.name, tool);
  }
}

