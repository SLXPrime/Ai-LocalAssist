import { Injectable } from '@nestjs/common';
import * as os from 'os';
import { AiTool, ToolPermission, ToolResult } from '../interfaces/tool.interface';

@Injectable()
export class SystemTools {
  getTools(): AiTool[] {
    return [
      {
        name: 'get_system_status',
        description: 'Return basic host/runtime status available to the backend process.',
        permission: ToolPermission.ReadSystem,
        parameters: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
        execute: async () => this.status(),
      },
    ];
  }

  private status(): ToolResult {
    return {
      success: true,
      data: {
        hostname: os.hostname(),
        platform: os.platform(),
        uptimeSeconds: os.uptime(),
        loadAverage: os.loadavg(),
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
        },
        cpus: os.cpus().length,
      },
    };
  }
}

