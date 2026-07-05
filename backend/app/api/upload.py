"""POST /upload — ingest CSV and return source_ref + source_profile."""
from __future__ import annotations

import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile

from app.packs.data.profiler import profile_csv

router = APIRouter()

_UPLOAD_DIR = Path("data/uploads")


@router.post("/upload")
async def upload(file: UploadFile) -> dict:
    _UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    filename = file.filename or "upload.csv"
    suffix = (Path(filename).suffix or ".csv").lower()
    if suffix != ".csv":
        raise HTTPException(status_code=400, detail="Only CSV uploads are supported in this MVP.")

    dest = _UPLOAD_DIR / f"{uuid.uuid4()}{suffix}"
    with dest.open("wb") as out:
        shutil.copyfileobj(file.file, out)
    try:
        profile = profile_csv(str(dest), filename)
    except Exception as exc:  # noqa: BLE001 - return upload-friendly parse errors
        raise HTTPException(status_code=400, detail=f"Could not profile CSV: {exc}") from exc

    return {
        "source_ref": str(dest),
        "filename": filename,
        "source_profile": profile.model_dump(),
    }
