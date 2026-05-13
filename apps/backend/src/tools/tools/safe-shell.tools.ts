import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiTool, ToolPermission, ToolResult } from '../interfaces/tool.interface';
import { execFileSafe } from '../utils/exec-file';

interface SafeCommand {
  cmd: string;
  args: string[];
}

@Injectable()
export class SafeShellTools {
  private readonly logger = new Logger(SafeShellTools.name);
  private readonly commands: Record<string, SafeCommand>;
  private readonly timeoutMs: number;

  constructor(configService: ConfigService) {
    this.timeoutMs = configService.get<number>('tools.timeoutMs', 15000);
    this.commands = this.parseCommands(configService.get<string>('tools.safeShellCommandsJson', '{}'));
  }

  getTools(): AiTool[] {
    return [
      {
        name: 'run_safe_shell_command',
        description: 'Run a predefined safe shell command by command id. Arbitrary shell input is never accepted.',
        permission: ToolPermission.RunSafeShell,
        parameters: {
          type: 'object',
          required: ['commandId'],
          properties: {
            commandId: {
              type: 'string',
              enum: Object.keys(this.commands),
              description: 'Command identifier from SAFE_SHELL_COMMANDS_JSON.',
            },
          },
          additionalProperties: false,
        },
        execute: (args) => this.run(String(args.commandId ?? '')),
      },
    ];
  }

  private async run(commandId: string): Promise<ToolResult> {
    const command = this.commands[commandId];
    if (!command) {
      return { success: false, error: `Command ${commandId} is not whitelisted` };
    }

    try {
      const result = await execFileSafe(command.cmd, command.args, this.timeoutMs);
      return { success: true, data: { commandId, stdout: result.stdout, stderr: result.stderr } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Safe command failed' };
    }
  }

  private parseCommands(raw: string): Record<string, SafeCommand> {
    try {
      const parsed = JSON.parse(raw) as Record<string, SafeCommand>;
      return Object.fromEntries(
        Object.entries(parsed).filter(([, value]) => typeof value.cmd === 'string' && Array.isArray(value.args)),
      );
    } catch (error) {
      this.logger.warn(`Invalid SAFE_SHELL_COMMANDS_JSON: ${error instanceof Error ? error.message : 'unknown error'}`);
      return {};
    }
  }
}

