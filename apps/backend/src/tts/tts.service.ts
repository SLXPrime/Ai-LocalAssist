import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { TtsProvider } from './interfaces/tts-provider.interface';

export const TTS_PROVIDER = Symbol('TTS_PROVIDER');

export interface SynthesizedAnswer {
  url: string;
  contentType: string;
}

@Injectable()
export class TtsService {
  private readonly logger = new Logger(TtsService.name);
  private readonly enabled: boolean;
  private readonly storagePath: string;
  private readonly publicBaseUrl?: string;

  constructor(
    @Inject(TTS_PROVIDER) private readonly provider: TtsProvider,
    configService: ConfigService,
  ) {
    this.enabled = configService.get<boolean>('tts.enabled', false);
    this.storagePath = configService.get<string>('tts.audioStoragePath', '/app/data/audio');
    this.publicBaseUrl = configService.get<string>('tts.publicBaseUrl');
  }

  async synthesizeAnswer(input: { conversationId: string; text: string }): Promise<SynthesizedAnswer | undefined> {
    if (!this.enabled || !this.publicBaseUrl || input.text.trim().length === 0) {
      return undefined;
    }

    try {
      await mkdir(this.storagePath, { recursive: true });
      const speech = await this.provider.synthesize({ text: input.text });
      const digest = createHash('sha256').update(input.text).digest('hex').slice(0, 16);
      const filename = `${input.conversationId}-${digest}-${randomUUID()}.${speech.extension}`;
      await writeFile(join(this.storagePath, filename), speech.audio);

      return {
        url: `${this.publicBaseUrl.replace(/\/$/, '')}/audio/${filename}`,
        contentType: speech.contentType,
      };
    } catch (error) {
      this.logger.warn(`TTS synthesis failed: ${error instanceof Error ? error.message : 'unknown error'}`);
      return undefined;
    }
  }
}

