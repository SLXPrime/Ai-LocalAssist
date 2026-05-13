import { Module } from '@nestjs/common';
import { AudioController } from './audio.controller';
import { OmniVoiceProvider } from './providers/omnivoice.provider';
import { TTS_PROVIDER, TtsService } from './tts.service';

@Module({
  controllers: [AudioController],
  providers: [
    TtsService,
    OmniVoiceProvider,
    {
      provide: TTS_PROVIDER,
      useExisting: OmniVoiceProvider,
    },
  ],
  exports: [TtsService],
})
export class TtsModule {}

