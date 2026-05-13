# Tools App

Reserved for future standalone operational tools and adapters.

Initial tool implementations live inside `apps/backend/src/tools` so the registry, permissions, DTOs, and LLM tool schemas evolve together. When a tool becomes large or independently deployable, move it here behind the same tool contract.

TTS is not a tool. The OmniVoice service lives separately in `services/tts-omnivoice` and is consumed through the backend TTS provider.
