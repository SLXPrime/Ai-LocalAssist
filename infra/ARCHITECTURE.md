# Architecture

## Principles

- Ollama is remote only. This repository never starts an Ollama container.
- The NestJS backend is the AI brain. Home Assistant only handles voice/audio and home orchestration.
- Tools are provider-agnostic. The LLM provider emits tool calls; the registry owns execution.
- Memory is split by latency profile: Redis for recent context, PostgreSQL for durable history.
- Every operational capability must have an explicit permission and whitelist.

## Request Flow

```text
Google Home Mini
  -> Home Assistant conversation/webhook
  -> POST /assistant
  -> AssistantService
  -> LlmService
  -> OllamaOpenAiProvider
  -> remote OLLAMA_BASE_URL/v1
  -> ToolRegistryService, when tool calls are requested
  -> MemoryService persists conversation
  -> Home Assistant TTS speaks answer
```

## Backend Modules

- `AssistantModule`: HTTP boundary and orchestration.
- `ProvidersModule`: LLM abstraction. Current implementation is `OllamaOpenAiProvider`.
- `ToolsModule`: tool registry, schemas, permissions and implementations.
- `MemoryModule`: Redis context cache and PostgreSQL persistent storage.
- `AutomationModule`: event bus hooks for future workflows.

## Security Model

The first version intentionally favors explicit allowlists:

- Docker restarts only work for names in `ALLOWED_DOCKER_CONTAINERS`.
- Shell execution only accepts IDs from `SAFE_SHELL_COMMANDS_JSON`.
- Minecraft RCON only accepts predefined commands.
- The assistant endpoint can require `x-api-key` via `BACKEND_API_KEY`.

Future hardening should add per-user permissions, audit tables, approval flows for destructive tools, and network segmentation for Docker socket access.

