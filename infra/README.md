# Infrastructure Notes

This project treats Ollama as an external dependency. The compose stack never starts a local Ollama service.

Core services:

- `homeassistant`: voice/audio orchestration and Google Home Mini TTS.
- `backend`: NestJS AI Operator brain, tool calling, memory, provider abstraction.
- `postgres`: persistent conversation history.
- `redis`: fast recent context cache.
- `open-webui`: direct UI connected to the remote Ollama server.

External companion services:

- `services/tts-omnivoice`: standalone native OmniVoice TTS API with its own `.env`.

The backend and Open WebUI both read `OLLAMA_BASE_URL`, for example:

```env
OLLAMA_BASE_URL=http://192.168.1.50:11434
```

OpenAI-compatible calls use:

```ts
baseURL: process.env.OLLAMA_BASE_URL + '/v1'
```

Host ports are intentionally configurable in `.env` with `*_HOST_PORT` variables so this stack can coexist with other services on a busy server.

The OmniVoice TTS service is intentionally not part of the main compose stack and does not run via Docker. Run it natively from `services/tts-omnivoice` and point the backend to it with `OMNIVOICE_BASE_URL`.
