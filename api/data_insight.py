from __future__ import annotations

import base64
import hmac
import json
import logging
import os
import sys
import urllib.error
import uuid
from pathlib import Path
from typing import Any

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.concurrency import run_in_threadpool

REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
SERVICE_ROOT = REPOSITORY_ROOT / "data-insight-ai-test"
sys.path.insert(0, str(SERVICE_ROOT))

import app as data_insight_service  # noqa: E402
import remote_sensing  # noqa: E402

MAX_BODY_BYTES = 4 * 1024 * 1024
MAX_GEOTIFF_BYTES = 2_500_000
API_PATHS = {
    "/api/source/series",
    "/api/analyze",
    "/api/ml/preview",
    "/api/ml/train",
    "/api/ml/analyze-sources",
    "/api/ml/merge-sources",
    "/api/import/url",
    "/api/assist/explore-url",
    "/api/assist/recommend",
    "/api/assist/document",
    "/api/assist/remote-sensing/aoi/run",
    "/api/assist/remote-sensing/aoi/unet/export",
}

app = FastAPI()


def _authorized(request: Request) -> bool:
    expected = os.environ.get("DATA_INSIGHT_API_KEY") or os.environ.get("JWT_SECRET", "")
    supplied = request.headers.get("authorization", "")
    return (
        len(expected) >= 32
        and hmac.compare_digest(supplied.encode("utf-8"), f"Bearer {expected}".encode("utf-8"))
    )


def _run_sentinel_aoi(payload: dict[str, Any]) -> dict[str, Any]:
    request = remote_sensing._validate_scene_request(payload)
    job_id = uuid.uuid4().hex
    steps: list[dict[str, Any]] = []
    result, map_path = remote_sensing._run_sentinel_aoi(
        request,
        job_id,
        lambda **update: steps.append(update),
    )
    try:
        map_bytes = map_path.read_bytes()
        if len(map_bytes) > MAX_GEOTIFF_BYTES:
            raise data_insight_service.RequestError(
                "Il GeoTIFF supera il limite gratuito della Preview. Riduci l'area di studio e riprova."
            )
        result.pop("mapDownload", None)
        return {
            "jobId": job_id,
            "status": "complete",
            "progress": 100,
            "steps": steps,
            "result": result,
            "mapDataBase64": base64.b64encode(map_bytes).decode("ascii"),
        }
    finally:
        map_path.unlink(missing_ok=True)


def _dispatch(path: str, payload: dict[str, Any]) -> dict[str, Any]:
    if path == "/api/source/series":
        return data_insight_service.fetch_source(payload)
    if path == "/api/analyze":
        return data_insight_service.analyze(payload)
    if path == "/api/ml/preview":
        return data_insight_service.preview_ml_dataset(payload)
    if path == "/api/ml/train":
        return data_insight_service.train_tabular_model(payload)
    if path == "/api/ml/analyze-sources":
        return data_insight_service.analyze_ml_sources(payload)
    if path == "/api/ml/merge-sources":
        return data_insight_service.merge_ml_sources(payload)
    if path == "/api/import/url":
        return data_insight_service.import_url(payload)
    if path == "/api/assist/explore-url":
        return data_insight_service.explore_portal(payload)
    if path == "/api/assist/recommend":
        return data_insight_service.recommend_sources(payload)
    if path == "/api/assist/document":
        return data_insight_service.analyze_document(payload)
    if path == "/api/assist/remote-sensing/aoi/run":
        return _run_sentinel_aoi(payload)
    if path == "/api/assist/remote-sensing/aoi/unet/export":
        return remote_sensing.export_unet_geotiff(payload)
    raise data_insight_service.RequestError("Endpoint API non trovato.")


@app.api_route("/", methods=["GET", "POST"])
@app.api_route("/{path:path}", methods=["GET", "POST"])
async def handle_data_insight(request: Request) -> JSONResponse:
    path = request.query_params.get("path", "")
    if request.method == "GET" and path == "/api/health":
        return JSONResponse({"ok": True, "service": "Data Insight Python"})
    if request.method != "POST" or path not in API_PATHS:
        return JSONResponse({"error": "Endpoint API non trovato."}, status_code=404)
    if not _authorized(request):
        return JSONResponse({"error": "Autenticazione del servizio non valida."}, status_code=401)

    content_length = request.headers.get("content-length", "")
    try:
        if content_length and int(content_length) > MAX_BODY_BYTES:
            return JSONResponse({"error": "La richiesta supera il limite di 4 MB."}, status_code=413)
    except ValueError:
        return JSONResponse({"error": "Lunghezza richiesta non valida."}, status_code=400)

    body = await request.body()
    if not body or len(body) > MAX_BODY_BYTES:
        return JSONResponse({"error": "Richiesta vuota o oltre il limite di 4 MB."}, status_code=413)
    try:
        payload = json.loads(body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JSONResponse({"error": "Il corpo della richiesta deve essere JSON valido."}, status_code=400)
    if not isinstance(payload, dict):
        return JSONResponse({"error": "Il corpo JSON deve essere un oggetto."}, status_code=400)
    encoded_document = payload.get("contentBase64")
    if path == "/api/assist/document" and isinstance(encoded_document, str) and len(encoded_document) > 3_600_000:
        return JSONResponse(
            {"error": "Il documento supera il limite di 2,5 MB della Preview gratuita."},
            status_code=413,
        )
    if path in {"/api/ml/analyze-sources", "/api/ml/merge-sources"}:
        documents = payload.get("documents", [])
        if isinstance(documents, list):
            encoded_total = sum(
                len(document.get("contentBase64", ""))
                for document in documents
                if isinstance(document, dict) and isinstance(document.get("contentBase64"), str)
            )
            if encoded_total > 3_400_000:
                return JSONResponse(
                    {"error": "La dimensione complessiva dei documenti supera il limite di 2,5 MB."},
                    status_code=413,
                )

    try:
        result = await run_in_threadpool(_dispatch, path, payload)
        return JSONResponse(result, headers={"Cache-Control": "no-store"})
    except (data_insight_service.RequestError, ValueError) as exc:
        return JSONResponse({"error": str(exc)}, status_code=400)
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        return JSONResponse({"error": f"Errore della fonte dati: {exc}"}, status_code=502)
    except Exception:
        logging.exception("Errore interno Data Insight Vercel")
        return JSONResponse({"error": "Errore interno del servizio Data Insight."}, status_code=500)
