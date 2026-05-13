import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiTool, ToolPermission, ToolResult } from '../interfaces/tool.interface';
import { execFileSafe } from '../utils/exec-file';

@Injectable()
export class DockerTools {
  private readonly allowedContainers: Set<string>;
  private readonly timeoutMs: number;

  constructor(configService: ConfigService) {
    this.allowedContainers = new Set(configService.get<string[]>('tools.allowedDockerContainers', []));
    this.timeoutMs = configService.get<number>('tools.timeoutMs', 15000);
  }

  getTools(): AiTool[] {
    return [
      {
        name: 'list_docker_containers',
        description: 'List Docker containers visible to the backend runtime.',
        permission: ToolPermission.ManageDocker,
        parameters: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
        execute: () => this.listContainers(),
      },
      {
        name: 'restart_docker_container',
        description: 'Restart one whitelisted Docker container by exact name.',
        permission: ToolPermission.ManageDocker,
        parameters: {
          type: 'object',
          required: ['containerName'],
          properties: {
            containerName: {
              type: 'string',
              description: 'Exact container name from the ALLOWED_DOCKER_CONTAINERS whitelist.',
            },
          },
          additionalProperties: false,
        },
        execute: (args) => this.restartContainer(String(args.containerName ?? '')),
      },
    ];
  }

  private async listContainers(): Promise<ToolResult> {
    try {
      const result = await execFileSafe(
        'docker',
        ['ps', '--format', '{{.Names}}\t{{.Image}}\t{{.Status}}'],
        this.timeoutMs,
      );
      return {
        success: true,
        data: result.stdout
          .split('\n')
          .filter(Boolean)
          .map((line) => {
            const [name, image, status] = line.split('\t');
            return { name, image, status, allowed: this.allowedContainers.has(name) };
          }),
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Docker list failed' };
    }
  }

  private async restartContainer(containerName: string): Promise<ToolResult> {
    if (!this.allowedContainers.has(containerName)) {
      return { success: false, error: `Container ${containerName} is not whitelisted` };
    }

    try {
      const result = await execFileSafe('docker', ['restart', containerName], this.timeoutMs);
      return { success: true, data: { containerName, output: result.stdout } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Docker restart failed' };
    }
  }
}

