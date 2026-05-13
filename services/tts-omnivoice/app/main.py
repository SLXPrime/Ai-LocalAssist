import os
import tempfile
from functools import lru_cache
from typing import Literal, Optional

import soundfile as sf
import torch
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from omnivoice import OmniVoice
from pydantic import BaseModel, Field


def max_text_length() -> int:
    return int(os.getenv("OMNIVOICE_MAX_TEXT_LENGTH", "4000"))


class SpeechRequest(BaseModel):
    text: str = Field(min_length=1)
    voice: Optional[str] = None
    instruct: Optional[str] = None
    speed: float = Field(default=1.0, gt=0.25, lt=4.0)
    response_format: Literal["wav"] = "wav"


app = FastAPI(title="OmniVoice TTS API")


@lru_cache(maxsize=1)
def get_model() -> OmniVoice:
    model_name = os.getenv("OMNIVOICE_MODEL", "k2-fsa/OmniVoice")
    device = os.getenv("OMNIVOICE_DEVICE", "cpu")
    dtype = torch.float16 if device.startswith("cuda") else torch.float32
    return OmniVoice.from_pretrained(model_name, device_map=device, dtype=dtype)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/v1/audio/speech")
def synthesize(request: SpeechRequest) -> FileResponse:
    if len(request.text) > max_text_length():
        raise HTTPException(status_code=413, detail="Text is too long")

    try:
        kwargs = {
            "text": request.text,
            "speed": request.speed,
        }
        if request.instruct:
            kwargs["instruct"] = request.instruct

        audio = get_model().generate(**kwargs)
        sample_rate = int(os.getenv("OMNIVOICE_DEFAULT_SAMPLE_RATE", "24000"))
        output = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
        output.close()
        sf.write(output.name, audio[0], sample_rate)
        return FileResponse(output.name, media_type="audio/wav", filename="speech.wav")
    except Exception as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

