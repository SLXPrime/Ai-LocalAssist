export interface SynthesizeSpeechInput {
  text: string;
}

export interface SynthesizeSpeechOutput {
  audio: Buffer;
  contentType: string;
  extension: string;
}

export interface TtsProvider {
  synthesize(input: SynthesizeSpeechInput): Promise<SynthesizeSpeechOutput>;
}

