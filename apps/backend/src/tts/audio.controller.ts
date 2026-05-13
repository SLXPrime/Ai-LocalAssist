import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';

@Controller('audio')
export class AudioController {
  private readonly storagePath: string;

  constructor(configService: ConfigService) {
    this.storagePath = configService.get<string>('tts.audioStoragePath', '/app/data/audio');
  }

  @Get(':filename')
  getAudio(@Param('filename') filename: string, @Res() response: any): void {
    if (!/^[a-zA-Z0-9._-]+\.(wav|mp3)$/.test(filename)) {
      throw new NotFoundException();
    }

    const filePath = join(this.storagePath, filename);
    if (!existsSync(filePath)) {
      throw new NotFoundException();
    }

    response.setHeader('content-type', filename.endsWith('.mp3') ? 'audio/mpeg' : 'audio/wav');
    createReadStream(filePath).pipe(response);
  }
}

