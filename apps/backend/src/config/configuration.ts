const parseList = (value = ''): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export const configuration = () => ({
  app: {
    port: Number(process.env.PORT ?? process.env.BACKEND_PORT ?? 3000),
    apiKey: process.env.BACKEND_API_KEY,
    nodeEnv: process.env.NODE_ENV ?? 'development',
    publicUrl: process.env.BACKEND_PUBLIC_URL,
  },
  llm: {
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL,
    model: process.env.OLLAMA_MODEL ?? 'llama3.1:8b',
    apiKey: process.env.OLLAMA_API_KEY ?? 'ollama',
  },
  postgres: {
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    database: process.env.POSTGRES_DB ?? 'ai_operator',
    user: process.env.POSTGRES_USER ?? 'ai_operator',
    password: process.env.POSTGRES_PASSWORD ?? 'change-me',
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: Number(process.env.REDIS_PORT ?? 6379),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  tools: {
    timeoutMs: Number(process.env.TOOL_DEFAULT_TIMEOUT_MS ?? 15000),
    allowedDockerContainers: parseList(process.env.ALLOWED_DOCKER_CONTAINERS),
    safeShellCommandsJson: process.env.SAFE_SHELL_COMMANDS_JSON ?? '{}',
  },
  minecraft: {
    host: process.env.MINECRAFT_RCON_HOST ?? 'minecraft',
    port: Number(process.env.MINECRAFT_RCON_PORT ?? 25575),
    password: process.env.MINECRAFT_RCON_PASSWORD,
  },
  tts: {
    enabled: process.env.TTS_ENABLED === 'true',
    provider: process.env.TTS_PROVIDER ?? 'omnivoice',
    audioStoragePath: process.env.TTS_AUDIO_STORAGE_PATH ?? '/app/data/audio',
    publicBaseUrl: process.env.TTS_PUBLIC_BASE_URL ?? process.env.BACKEND_PUBLIC_URL,
  },
  omnivoice: {
    baseUrl: process.env.OMNIVOICE_BASE_URL,
    voice: process.env.OMNIVOICE_VOICE ?? 'pt-br-default',
    instruct: process.env.OMNIVOICE_INSTRUCT ?? 'female, natural, warm',
    speed: Number(process.env.OMNIVOICE_SPEED ?? 1.0),
    format: process.env.OMNIVOICE_FORMAT ?? 'wav',
  },
});
