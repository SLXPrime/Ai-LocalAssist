# AI Home Operator

Infraestrutura modular para um assistente residencial integrado com Google Home Mini, Home Assistant, NestJS, Open WebUI, Redis, PostgreSQL e um servidor Ollama remoto.

O Ollama nao sobe neste projeto. O backend e o Open WebUI consomem um servidor ja existente por `OLLAMA_BASE_URL`.

## Arquitetura

Fluxo alvo:

```text
Google Home Mini
-> Home Assistant
-> Backend NestJS
-> Ollama remoto
-> Tool calling
-> Resposta
-> TTS no Google Home
```

Componentes:

- `homeassistant`: entrada/saida de voz, webhooks, REST command e TTS para Google Home Mini.
- `apps/backend`: cerebro da IA, em NestJS/TypeScript.
- `apps/backend/src/providers`: providers LLM desacoplados, hoje com OpenAI SDK apontando para Ollama remoto.
- `apps/backend/src/tools`: tool registry, permissao por tool e implementacoes iniciais.
- `apps/backend/src/memory`: Redis para contexto recente e PostgreSQL para historico persistente.
- `open-webui`: UI conectada ao mesmo Ollama remoto.
- `services/tts-omnivoice`: servico HTTP nativo para OmniVoice TTS, com `.env` proprio e fora do Docker.

## Estrutura

```text
/infra
/apps/backend
/apps/tools
/apps/automation
/services/tts-omnivoice
/homeassistant
/docker
/docker-compose.yml
/.env.example
```

## Primeiro uso

1. Crie o `.env`:

```sh
cp .env.example .env
```

2. Edite obrigatoriamente:

```env
OLLAMA_BASE_URL=http://IP-DO-OLLAMA:11434
POSTGRES_PASSWORD=uma-senha-forte
BACKEND_API_KEY=uma-chave-forte
WEBUI_SECRET_KEY=uma-chave-forte
```

3. Configure o segredo do Home Assistant:

```sh
cp homeassistant/secrets.yaml.example homeassistant/secrets.yaml
```

Use o mesmo valor de `BACKEND_API_KEY` em `backend_api_key`.

4. Suba a stack:

```sh
docker compose up -d --build
```

Servicos:

- Backend: `http://localhost:13000`
- Home Assistant: `http://localhost:18123`
- Open WebUI: `http://localhost:18080`

As portas externas ficam no `.env`:

```env
BACKEND_HOST_PORT=13000
HOME_ASSISTANT_HOST_PORT=18123
OPEN_WEBUI_HOST_PORT=18080
POSTGRES_HOST_PORT=15432
REDIS_HOST_PORT=16379
```

As portas internas dos containers continuam padrao (`3000`, `8123`, `8080`, `5432`, `6379`) para os servicos conversarem entre si na rede Docker.

## TTS com OmniVoice

O backend pode gerar audio com OmniVoice e devolver `audioUrl` na resposta do `/assistant`. O Home Assistant entao toca essa URL na Google Home Mini com `media_player.play_media`.

O OmniVoice roda nativamente como servico separado em `services/tts-omnivoice`, com `.env` proprio. Ele nao roda via Docker.

No `.env` do projeto principal, configure apenas o cliente TTS do backend:

```env
TTS_ENABLED=true
TTS_PROVIDER=omnivoice
TTS_PUBLIC_BASE_URL=http://IP-DO-SERVIDOR:13000
OMNIVOICE_BASE_URL=http://IP-DO-SERVIDOR-TTS:18001
OMNIVOICE_INSTRUCT=female, natural, warm, low pitch
OMNIVOICE_SPEED=1.0
```

Para rodar o servico OmniVoice nativo:

```sh
cd services/tts-omnivoice
cp .env.example .env
sh scripts/setup.sh
sh scripts/run.sh
```

No Windows:

```powershell
cd services\tts-omnivoice
Copy-Item .env.example .env
.\scripts\setup.ps1
.\scripts\run.ps1
```

O servico usa `OMNIVOICE_DEVICE=cpu` por padrao para ser portavel, mas TTS neural pesado tende a ficar lento em CPU. Em producao, se o servidor estiver cheio ou se voce tiver uma maquina com GPU, rode `services/tts-omnivoice` nativamente nessa maquina e aponte:

```env
OMNIVOICE_BASE_URL=http://IP-DO-SERVIDOR-TTS:18001
```

Importante para Google Home/Cast: `TTS_PUBLIC_BASE_URL` precisa ser uma URL acessivel pela Google Home Mini na rede. Evite nomes internos Docker como `http://backend:3000`; use IP/host real do servidor.

Importante para o backend: como ele roda em Docker e o TTS roda nativamente, `OMNIVOICE_BASE_URL=http://localhost:18001` nao funciona de dentro do container. Use o IP real do host ou um DNS acessivel pelo container.

## Endpoint principal

```http
POST /assistant
x-api-key: sua-chave
content-type: application/json
```

Body:

```json
{
  "query": "reinicia o minecraft"
}
```

Resposta:

```json
{
  "conversationId": "uuid",
  "answer": "Resultado explicado em linguagem natural",
  "audioUrl": "http://IP-DO-SERVIDOR:13000/audio/arquivo.wav",
  "tools": []
}
```

## Ollama remoto

O provider atual usa o SDK da OpenAI com endpoint compativel:

```ts
baseURL: `${OLLAMA_BASE_URL}/v1`
```

Isso permite trocar o provider no futuro sem acoplar tools, memoria ou controller ao Ollama.

O Open WebUI tambem usa `OLLAMA_BASE_URL`, variavel documentada oficialmente para apontar para o backend Ollama.

## Tools iniciais

As tools sao desacopladas do provider LLM e registradas no `ToolRegistryService`.

Incluidas:

- `list_docker_containers`
- `restart_docker_container`
- `run_safe_shell_command`
- `get_system_status`
- `send_minecraft_command`

Seguranca:

- Nao existe shell arbitrario.
- Comandos shell precisam estar em `SAFE_SHELL_COMMANDS_JSON`.
- Containers reiniciaveis precisam estar em `ALLOWED_DOCKER_CONTAINERS`.
- Comandos Minecraft usam whitelist.
- Cada tool declara permissao por `ToolPermission`.

## Home Assistant

Arquivos iniciais:

- `homeassistant/configuration.yaml`
- `homeassistant/automations.yaml`
- `homeassistant/scripts.yaml`

Webhook exemplo:

```http
POST http://localhost:18123/api/webhook/ai_operator_query
content-type: application/json

{
  "query": "reinicia o minecraft",
  "speaker": "media_player.google_home_mini"
}
```

O Google Home Mini fica como camada de audio. O backend continua sendo o cerebro.

## Desenvolvimento

Instalar dependencias locais do backend:

```sh
sh scripts/setup.sh
```

Rodar dependencias por Docker e backend em watch:

```sh
sh scripts/dev.sh
```

Producao local:

```sh
sh scripts/prod.sh
```

## Proximos passos recomendados

- Adicionar autenticacao por usuario/dispositivo no Home Assistant.
- Persistir auditoria de tool calls em PostgreSQL.
- Criar approval flow para tools destrutivas.
- Separar workers long-running em `apps/automation`.
- Adicionar testes unitarios para tools e provider.
