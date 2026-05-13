import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SynthesizeSpeechInput, SynthesizeSpeechOutput, TtsProvider } from '../interfaces/tts-provider.interface';

@Injectable()
export class OmniVoiceProvider implements TtsProvider {
  private readonly baseUrl?: string;
  private readonly voice: string;
  private readonly instruct: string;
  private readonly speed: number;
  private readonly format: string;

  constructor(configService: ConfigService) {
    this.baseUrl = configService.get<string>('omnivoice.baseUrl');
    this.voice = configService.get<string>('omnivoice.voice', 'pt-br-default');
    this.instruct = configService.get<string>('omnivoice.instruct', 'female, natural, warm');
    this.speed = configService.get<number>('omnivoice.speed', 1.0);
    this.format = configService.get<string>('omnivoice.format', 'wav');
  }

  async synthesize(input: SynthesizeSpeechInput): Promise<SynthesizeSpeechOutput> {
    if (!this.baseUrl) {
      throw new ServiceUnavailableException('OMNIVOICE_BASE_URL is not configured');
    }

    const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}/v1/audio/speech`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        text: input.text,
        voice: this.voice,
        instruct: this.instruct,
        speed: this.speed,
        response_format: this.format,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new ServiceUnavailableException(`OmniVoice failed: ${response.status} ${details}`);
    }

    const audio = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') ?? `audio/${this.format}`;

    return {
      audio,
      contentType,
      extension: this.format,
    };
  }
}

