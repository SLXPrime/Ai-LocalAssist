# OmniVoice TTS Service

Servico HTTP nativo para expor o OmniVoice como API de TTS.

Este servico tem `.env` proprio e roda fora do Docker, diretamente no host. Ele pode ficar no mesmo servidor do projeto principal ou em uma maquina separada com GPU.

## Setup Windows

```powershell
Copy-Item .env.example .env
.\scripts\setup.ps1
.\scripts\run.ps1
```

## Setup Linux

```sh
cp .env.example .env
sh scripts/setup.sh
sh scripts/run.sh
```

Por padrao, a API fica em `http://localhost:18001`.

Health check:

```sh
curl http://localhost:18001/health
```

Gerar audio:

```sh
curl -X POST http://localhost:18001/v1/audio/speech \
  -H "content-type: application/json" \
  -d '{"text":"O operador de IA esta online.","instruct":"female, natural, warm","speed":1.0}' \
  --output speech.wav
```

## Conectar ao backend principal

No `.env` do projeto principal, aponte:

```env
TTS_ENABLED=true
OMNIVOICE_BASE_URL=http://IP-DO-SERVIDOR-TTS:18001
```

Se estiver tudo no mesmo servidor, use o IP real da maquina. Como o backend principal roda em Docker e este TTS roda nativamente, evite `localhost` dentro do `.env` do backend; dentro do container, `localhost` apontaria para o proprio container.

Exemplo quando ambos estao no mesmo servidor:

```env
OMNIVOICE_BASE_URL=http://192.168.1.20:18001
```

## GPU

Por padrao:

```env
OMNIVOICE_DEVICE=cpu
```

Para GPU, ajuste para algo como:

```env
OMNIVOICE_DEVICE=cuda:0
```

Como este servico roda nativamente, a configuracao de CUDA/PyTorch fica sob controle do host.
