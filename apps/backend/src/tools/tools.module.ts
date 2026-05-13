import { Module } from '@nestjs/common';
import { DockerTools } from './tools/docker.tools';
import { MinecraftTools } from './tools/minecraft.tools';
import { SafeShellTools } from './tools/safe-shell.tools';
import { SystemTools } from './tools/system.tools';
import { ToolRegistryService } from './tool-registry.service';

@Module({
  providers: [ToolRegistryService, DockerTools, SafeShellTools, SystemTools, MinecraftTools],
  exports: [ToolRegistryService],
})
export class ToolsModule {}

