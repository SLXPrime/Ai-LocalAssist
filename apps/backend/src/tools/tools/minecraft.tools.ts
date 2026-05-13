import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Rcon } from 'rcon-client';
import { AiTool, ToolPermission, ToolResult } from '../interfaces/tool.interface';

@Injectable()
export class MinecraftTools {
  private readonly host: string;
  private readonly port: number;
  private readonly password?: string;

  constructor(configService: ConfigService) {
    this.host = configService.get<string>('minecraft.host', 'minecraft');
    this.port = configService.get<number>('minecraft.port', 25575);
    this.password = configService.get<string>('minecraft.password');
  }

  getTools(): AiTool[] {
    return [
      {
        name: 'send_minecraft_command',
        description: 'Send a whitelisted operational command to a Minecraft server through RCON.',
        permission: ToolPermission.ManageMinecraft,
        parameters: {
          type: 'object',
          required: ['command'],
          properties: {
            command: {
              type: 'string',
              enum: ['list', 'save-all', 'say AI Operator online', 'stop'],
            },
          },
          additionalProperties: false,
        },
        execute: (args) => this.sendCommand(String(args.command ?? '')),
      },
    ];
  }

  private async sendCommand(command: string): Promise<ToolResult> {
    const allowed = new Set(['list', 'save-all', 'say AI Operator online', 'stop']);
    if (!allowed.has(command)) {
      return { success: false, error: `Minecraft command ${command} is not whitelisted` };
    }

    if (!this.password) {
      return { success: false, error: 'MINECRAFT_RCON_PASSWORD is not configured' };
    }

    let client: Rcon | undefined;
    try {
      client = await Rcon.connect({ host: this.host, port: this.port, password: this.password });
      const response = await client.send(command);
      return { success: true, data: { command, response } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Minecraft command failed' };
    } finally {
      client?.end();
    }
  }
}

