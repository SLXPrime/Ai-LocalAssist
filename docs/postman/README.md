# Postman

Importe o arquivo:

```text
docs/postman/ai-localassist.postman_collection.json
```

Depois ajuste as variaveis da collection:

```text
server_ip = 192.168.0.110
backend_port = 13000
homeassistant_port = 18123
tts_port = 18001
backend_api_key = sua BACKEND_API_KEY
speaker_entity_id = media_player da sua Google Home Mini
```

Para requests de TTS que retornam audio, use **Send and Download** no Postman e salve como `speech.wav`.

