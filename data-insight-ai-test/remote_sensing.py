from __future__ import annotations

import base64
import csv
import hashlib
import io
import json
import math
import os
import random
import re
import tempfile
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
import zipfile
import zlib
from datetime import date
from pathlib import Path, PurePosixPath
from typing import Any, Callable


DATASET_URL = "https://zenodo.org/records/7711810/files/EuroSAT_RGB.zip?download=1"
DATASET_MD5 = "f46e308c4d50d4bf32fedad2d3d62f3b"
DATASET_LICENSE = "MIT"
MAX_DATASET_BYTES = 150 * 1024 * 1024
SAMPLES_PER_CLASS = 500
RANDOM_SEED = 2026
STAC_SEARCH_URL = "https://earth-search.aws.element84.com/v1/search"
SENTINEL_COG_HOST = "sentinel-cogs.s3.us-west-2.amazonaws.com"
WORLDCOVER_BASE_URL = "https://esa-worldcover.s3.eu-central-1.amazonaws.com/v200/2021/map"
MAX_AOI_PIXELS = 1_000_000
MAX_UNET_DATA_BYTES = 600 * 1024
MAX_UNET_GEOTIFF_BYTES = 2_500_000
SPATIAL_BLOCK_PIXELS = 50
AOI_DEFAULTS = {
    "bbox": [12.48, 41.65, 12.55, 41.70],
    "startDate": "2021-01-01",
    "endDate": "2021-12-31",
    "maxCloudCover": 20,
}
CLASSES = (
    "AnnualCrop",
    "Forest",
    "HerbaceousVegetation",
    "Highway",
    "Industrial",
    "Pasture",
    "PermanentCrop",
    "Residential",
    "River",
    "SeaLake",
)
WORLDCOVER_CLASSES = {
    10: ("Alberi", "#176b3a"),
    20: ("Arbusteti", "#d6c77a"),
    30: ("Praterie", "#b8dc8a"),
    40: ("Colture", "#e7d34a"),
    50: ("Edificato", "#d83232"),
    60: ("Suolo nudo", "#b9a092"),
    70: ("Neve e ghiaccio", "#dce9f4"),
    80: ("Acqua", "#3478c8"),
    90: ("Zone umide", "#4bb8a4"),
    95: ("Mangrovie", "#64a878"),
    100: ("Licheni e muschi", "#9dba7a"),
}
FEATURE_NAMES = ("B02", "B03", "B04", "B08", "B11", "NDVI", "NDWI", "NDBI")

_jobs: dict[str, dict[str, Any]] = {}
_jobs_lock = threading.Lock()
_scene_jobs: dict[str, dict[str, Any]] = {}


def _update_job(job_id: str, *, stage: str, progress: int, message: str) -> None:
    with _jobs_lock:
        job = _jobs[job_id]
        job.update({"stage": stage, "progress": progress})
        job["steps"].append({"stage": stage, "progress": progress, "message": message})


def _dataset_cache_path() -> Path:
    return Path(tempfile.gettempdir()) / "data-insight-ai" / "eurosat-rgb-7711810.zip"


def _download_dataset(report: Callable[..., None]) -> Path:
    archive_path = _dataset_cache_path()
    archive_path.parent.mkdir(parents=True, exist_ok=True)
    if archive_path.is_file():
        report(stage="dataset", progress=5, message="Controllo il checksum dell'archivio EuroSAT gia presente in cache.")
        if _md5_file(archive_path) == DATASET_MD5:
            return archive_path
        archive_path.unlink()

    partial_path = archive_path.with_suffix(".zip.part")
    request = urllib.request.Request(
        DATASET_URL,
        headers={"User-Agent": "DataInsightAI-Local-Benchmark/1.0", "Accept": "application/zip"},
    )
    digest = hashlib.md5()
    downloaded = 0
    if any(isinstance(value, bool) for value in bbox):
        raise ValueError("Le coordinate dell'area devono essere numeri validi.")
    try:
        with urllib.request.urlopen(request, timeout=90) as response, partial_path.open("wb") as target:
            final_url = response.geturl()
            final_host = urllib.parse.urlsplit(final_url).hostname or ""
            if final_host != "zenodo.org" and not final_host.endswith(".zenodo.org"):
                raise RuntimeError("Il download EuroSAT e stato reindirizzato a un host non previsto.")
            content_length = response.headers.get("Content-Length")
            if content_length and int(content_length) > MAX_DATASET_BYTES:
                raise RuntimeError("L'archivio EuroSAT supera il limite di sicurezza di 150 MB.")
            while True:
                chunk = response.read(1024 * 1024)
                if not chunk:
                    break
                downloaded += len(chunk)
                if downloaded > MAX_DATASET_BYTES:
                    raise RuntimeError("Il download EuroSAT ha superato il limite di sicurezza di 150 MB.")
                target.write(chunk)
                digest.update(chunk)
                if downloaded % (10 * 1024 * 1024) < len(chunk):
                    report(
                        stage="dataset",
                        progress=min(5 + downloaded * 20 // MAX_DATASET_BYTES, 25),
                        message=f"Scaricati {downloaded / (1024 * 1024):.0f} MB dell'archivio ufficiale.",
                    )
        if digest.hexdigest() != DATASET_MD5:
            raise RuntimeError("Il checksum MD5 dell'archivio EuroSAT non corrisponde al record Zenodo.")
        partial_path.replace(archive_path)
        return archive_path
    except Exception:
        if partial_path.exists():
            partial_path.unlink()
        raise


def _md5_file(path: Path) -> str:
    digest = hashlib.md5()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _collect_samples(archive: zipfile.ZipFile) -> tuple[dict[str, list[str]], list[str]]:
    import random as local_random

    entries = {name: [] for name in CLASSES}
    for info in archive.infolist():
        if info.is_dir() or Path(info.filename).suffix.lower() not in {".jpg", ".jpeg"}:
            continue
        parts = PurePosixPath(info.filename.replace("\\", "/")).parts
        class_name = next((part for part in parts[:-1] if part in entries), None)
        if class_name:
            entries[class_name].append(info.filename)
    rng = local_random.Random(RANDOM_SEED)
    selected = {
        class_name: sorted(rng.sample(sorted(names), min(SAMPLES_PER_CLASS, len(names))))
        for class_name, names in entries.items()
    }
    missing = [class_name for class_name, names in selected.items() if len(names) < 10]
    if missing:
        raise RuntimeError(
            "Archivio EuroSAT incompleto: meno di 10 immagini per le classi " + ", ".join(missing)
        )
    return selected, [name for class_name in CLASSES for name in selected[class_name]]


def _image_features(content: bytes) -> list[float]:
    import numpy as np
    from PIL import Image

    with Image.open(io.BytesIO(content)) as image:
        rgb = image.convert("RGB")
        resized = np.asarray(rgb.resize((8, 8), Image.Resampling.BILINEAR), dtype=np.float32) / 255.0
        pixels = np.asarray(rgb, dtype=np.uint8)
    features = resized.reshape(-1).tolist()
    for channel in range(3):
        histogram, _ = np.histogram(pixels[:, :, channel], bins=16, range=(0, 256), density=True)
        features.extend(histogram.astype(float).tolist())
    features.extend(pixels.astype(np.float32).mean(axis=(0, 1)).tolist())
    features.extend(pixels.astype(np.float32).std(axis=(0, 1)).tolist())
    return features


def _run_benchmark(report: Callable[..., None]) -> dict[str, Any]:
    try:
        import numpy as np
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.metrics import accuracy_score, balanced_accuracy_score, confusion_matrix, f1_score, precision_score, recall_score
        from sklearn.model_selection import train_test_split
        from sklearn.pipeline import make_pipeline
        from sklearn.preprocessing import StandardScaler
        from sklearn.svm import LinearSVC
    except ImportError as exc:
        raise RuntimeError("Dipendenze ML mancanti. Installa requirements.txt e riavvia Data Insight AI.") from exc

    report(stage="dataset", progress=3, message="Preparo il dataset pubblico EuroSAT RGB da Zenodo.")
    archive_path = _download_dataset(report)
    report(stage="dataset", progress=28, message="Checksum MD5 verificato; apro l'archivio senza estrarlo sul disco.")

    with zipfile.ZipFile(archive_path) as archive:
        selected, filenames = _collect_samples(archive)
        counts = {class_name: len(selected[class_name]) for class_name in CLASSES}
        report(
            stage="sampling",
            progress=32,
            message=f"Campionamento deterministico: {sum(counts.values())} immagini bilanciate, seed {RANDOM_SEED}.",
        )
        features: list[list[float]] = []
        labels: list[str] = []
        preview = ""
        for index, filename in enumerate(filenames, start=1):
            image_bytes = archive.read(filename)
            features.append(_image_features(image_bytes))
            parts = PurePosixPath(filename.replace("\\", "/")).parts
            label = next(class_name for class_name in CLASSES if class_name in parts[:-1])
            labels.append(label)
            if not preview:
                preview = "data:image/jpeg;base64," + base64.b64encode(image_bytes).decode("ascii")
            if index % 500 == 0 or index == len(filenames):
                report(
                    stage="features",
                    progress=32 + index * 28 // len(filenames),
                    message=f"Feature RGB estratte da {index}/{len(filenames)} immagini.",
                )

    x = np.asarray(features, dtype=np.float32)
    y = np.asarray(labels)
    indices = np.arange(len(y))
    train_indices, test_indices = train_test_split(
        indices,
        test_size=0.2,
        random_state=RANDOM_SEED,
        stratify=y,
    )
    x_train, x_test = x[train_indices], x[test_indices]
    y_train, y_test = y[train_indices], y[test_indices]
    report(
        stage="split",
        progress=63,
        message=f"Split stratificato 80/20: {len(train_indices)} train e {len(test_indices)} test.",
    )

    random_forest = RandomForestClassifier(
        n_estimators=100,
        min_samples_leaf=2,
        max_features="sqrt",
        n_jobs=-1,
        random_state=RANDOM_SEED,
    )
    report(stage="random-forest", progress=66, message="Addestro Random Forest: 100 alberi, seed fisso.")
    random_forest.fit(x_train, y_train)
    rf_predictions = random_forest.predict(x_test)
    report(stage="random-forest", progress=78, message="Random Forest addestrata; predizioni sul test indipendente.")

    svm = make_pipeline(
        StandardScaler(),
        LinearSVC(C=1.0, dual="auto", max_iter=5000, random_state=RANDOM_SEED),
    )
    report(stage="svm", progress=80, message="Addestro SVM lineare dopo standardizzazione delle feature.")
    svm.fit(x_train, y_train)
    svm_predictions = svm.predict(x_test)
    report(stage="evaluation", progress=90, message="Calcolo metriche macro, accuratezza bilanciata e matrici di confusione.")

    def evaluate(predictions: Any) -> dict[str, Any]:
        matrix = confusion_matrix(y_test, predictions, labels=list(CLASSES))
        return {
            "accuracy": float(accuracy_score(y_test, predictions)),
            "balancedAccuracy": float(balanced_accuracy_score(y_test, predictions)),
            "macroF1": float(f1_score(y_test, predictions, labels=list(CLASSES), average="macro", zero_division=0)),
            "confusionMatrix": matrix.tolist(),
            "perClass": [
                {
                    "className": class_name,
                    "precision": float(precision_score(
                        y_test, predictions, labels=[class_name], average="macro", zero_division=0
                    )),
                    "recall": float(recall_score(
                        y_test, predictions, labels=[class_name], average="macro", zero_division=0
                    )),
                    "f1": float(f1_score(y_test, predictions, labels=[class_name], average="macro", zero_division=0)),
                    "support": int(np.count_nonzero(y_test == class_name)),
                }
                for class_name in CLASSES
            ],
        }

    csv_buffer = io.StringIO()
    writer = csv.writer(csv_buffer)
    writer.writerow(["image", "actual_class", "random_forest_prediction", "svm_prediction"])
    for index, test_index in enumerate(test_indices):
        writer.writerow([filenames[int(test_index)], y_test[index], rf_predictions[index], svm_predictions[index]])

    result = {
        "dataset": {
            "name": "EuroSAT RGB",
            "record": "https://zenodo.org/records/7711810",
            "doi": "10.5281/zenodo.7711810",
            "license": DATASET_LICENSE,
            "archiveBytes": archive_path.stat().st_size,
            "checksumMd5": DATASET_MD5,
            "classes": list(CLASSES),
            "classCounts": counts,
            "sampleCount": len(labels),
            "featureCount": int(x.shape[1]),
            "seed": RANDOM_SEED,
            "split": "Stratificato casuale 80/20; il benchmark non dimostra generalizzazione spaziale.",
            "imageType": "Patch RGB Sentinel-2 etichettate a livello immagine; non classificazione pixel-per-pixel.",
        },
        "models": {
            "randomForest": {"name": "Random Forest", **evaluate(rf_predictions)},
            "svm": {"name": "SVM lineare", **evaluate(svm_predictions)},
        },
        "trainCount": int(len(train_indices)),
        "testCount": int(len(test_indices)),
        "preview": preview,
        "predictionsCsv": csv_buffer.getvalue(),
        "limitations": [
            "EuroSAT contiene chip RGB Sentinel-2 europei a etichetta singola; non sono scene grezze georeferenziate per l'area Pomezia.",
            "Il test casuale stratificato puo sovrastimare la generalizzazione a nuove aree; una validazione spaziale richiede coordinate o blocchi geografici indipendenti.",
            "I risultati sono un benchmark riproducibile su feature RGB semplici, non un prodotto operativo, una segmentazione raster o una previsione ambientale.",
        ],
    }
    report(stage="complete", progress=100, message="Benchmark completato; risultati, metriche e predizioni disponibili.")
    return result


def start_eurosat_job() -> dict[str, str]:
    with _jobs_lock:
        active = next((job for job in _jobs.values() if job["status"] == "running"), None)
        if active:
            raise RuntimeError("Un benchmark di telerilevamento e gia in esecuzione.")
        completed = sorted(
            (job for job in _jobs.values() if job["status"] != "running"),
            key=lambda job: job["createdAt"],
        )
        while len(_jobs) >= 5 and completed:
            _jobs.pop(completed.pop(0)["id"], None)
        if len(_jobs) >= 5:
            raise RuntimeError("Sono presenti troppi benchmark recenti. Riprova tra poco.")
        job_id = uuid.uuid4().hex
        _jobs[job_id] = {
            "id": job_id,
            "status": "running",
            "stage": "starting",
            "progress": 0,
            "steps": [],
            "result": None,
            "error": None,
            "createdAt": time.time(),
        }

    def run() -> None:
        try:
            result = _run_benchmark(lambda **update: _update_job(job_id, **update))
            with _jobs_lock:
                _jobs[job_id].update({"status": "complete", "progress": 100, "result": result})
        except Exception as exc:
            with _jobs_lock:
                _jobs[job_id].update({
                    "status": "failed",
                    "error": f"{type(exc).__name__}: {exc}",
                    "steps": _jobs[job_id]["steps"] + [{
                        "stage": "failed",
                        "progress": _jobs[job_id]["progress"],
                        "message": f"Test non completato: {type(exc).__name__}: {exc}",
                    }],
                })

    threading.Thread(target=run, name=f"eurosat-{job_id[:8]}", daemon=True).start()
    return {"jobId": job_id, "status": "running"}


def get_eurosat_job(job_id: str) -> dict[str, Any] | None:
    with _jobs_lock:
        job = _jobs.get(job_id)
        if not job:
            return None
        return {key: value for key, value in job.items() if key != "createdAt"}


def dataset_source() -> dict[str, str]:
    return {
        "url": DATASET_URL,
        "record": "https://zenodo.org/records/7711810",
        "doi": "10.5281/zenodo.7711810",
        "license": DATASET_LICENSE,
    }


def _validate_scene_request(payload: dict[str, Any]) -> dict[str, Any]:
    bbox = payload.get("bbox", AOI_DEFAULTS["bbox"])
    if not isinstance(bbox, list) or len(bbox) != 4:
        raise ValueError("L'area di studio deve essere un riquadro [ovest, sud, est, nord].")
    try:
        west, south, east, north = (float(value) for value in bbox)
    except (TypeError, ValueError) as exc:
        raise ValueError("Le coordinate dell'area devono essere numeri validi.") from exc
    if not all(math.isfinite(value) for value in (west, south, east, north)):
        raise ValueError("Le coordinate dell'area devono essere numeri finiti.")
    if not (-180 <= west < east <= 180 and -60 <= south < north <= 84):
        raise ValueError("Coordinate non valide o area che attraversa l'antimeridiano.")
    if east - west > 0.15 or north - south > 0.15:
        raise ValueError("Per questo workflow l'area non puo superare 0,15 gradi per lato.")
    if math.floor(west / 3) != math.floor((east - 1e-9) / 3) or math.floor(south / 3) != math.floor((north - 1e-9) / 3):
        raise ValueError("Scegli un'area contenuta in una singola tile ESA WorldCover di 3 gradi.")

    start_text = payload.get("startDate", AOI_DEFAULTS["startDate"])
    end_text = payload.get("endDate", AOI_DEFAULTS["endDate"])
    try:
        start = date.fromisoformat(start_text)
        end = date.fromisoformat(end_text)
    except (TypeError, ValueError) as exc:
        raise ValueError("Inserisci date valide nel formato AAAA-MM-GG.") from exc
    if start > end or (end - start).days > 730 or end > date.today():
        raise ValueError("L'intervallo deve essere valido, passato e non superiore a due anni.")

    cloud_cover = payload.get("maxCloudCover", AOI_DEFAULTS["maxCloudCover"])
    if isinstance(cloud_cover, bool):
        raise ValueError("La soglia di nuvolosita deve essere compresa tra 0 e 100.")
    try:
        cloud_cover = float(cloud_cover)
    except (TypeError, ValueError) as exc:
        raise ValueError("La soglia di nuvolosita deve essere compresa tra 0 e 100.") from exc
    if not math.isfinite(cloud_cover) or not 0 <= cloud_cover <= 100:
        raise ValueError("La soglia di nuvolosita deve essere compresa tra 0 e 100.")
    map_model = payload.get("mapModel", "randomForest")
    if not isinstance(map_model, str) or map_model not in {"randomForest", "svm"}:
        raise ValueError("Seleziona Random Forest o SVM come modello della mappa.")
    max_samples = payload.get("maxSamplesPerClass", 900)
    if isinstance(max_samples, bool):
        raise ValueError("I campioni per classe devono essere un numero intero tra 100 e 2000.")
    try:
        max_samples_number = float(max_samples)
    except (TypeError, ValueError) as exc:
        raise ValueError("I campioni per classe devono essere un numero intero tra 100 e 2000.") from exc
    if not math.isfinite(max_samples_number) or not max_samples_number.is_integer() or not 100 <= max_samples_number <= 2000:
        raise ValueError("I campioni per classe devono essere un numero intero tra 100 e 2000.")
    block_meters = payload.get("spatialBlockMeters", 500)
    if isinstance(block_meters, bool):
        raise ValueError("La dimensione dei blocchi spaziali deve essere 250, 500 o 1000 metri.")
    try:
        block_number = float(block_meters)
    except (TypeError, ValueError) as exc:
        raise ValueError("La dimensione dei blocchi spaziali deve essere 250, 500 o 1000 metri.") from exc
    if not math.isfinite(block_number) or not block_number.is_integer() or int(block_number) not in {250, 500, 1000}:
        raise ValueError("La dimensione dei blocchi spaziali deve essere 250, 500 o 1000 metri.")
    block_meters = int(block_number)
    selected_classes = payload.get("selectedClasses", list(WORLDCOVER_CLASSES))
    if (
        not isinstance(selected_classes, list)
        or not selected_classes
        or any(isinstance(code, bool) or not isinstance(code, int) or code not in WORLDCOVER_CLASSES for code in selected_classes)
        or len(set(selected_classes)) != len(selected_classes)
    ):
        raise ValueError("Seleziona almeno una classe WorldCover valida, senza duplicati.")
    include_unet_data = payload.get("includeUnetData", False)
    if not isinstance(include_unet_data, bool):
        raise ValueError("L'opzione dei dati U-Net deve essere booleana.")
    return {
        "bbox": [west, south, east, north],
        "startDate": start.isoformat(),
        "endDate": end.isoformat(),
        "maxCloudCover": cloud_cover,
        "mapModel": map_model,
        "maxSamplesPerClass": int(max_samples_number),
        "spatialBlockMeters": block_meters,
        "selectedClasses": selected_classes,
        "includeUnetData": include_unet_data,
    }


def _update_scene_job(job_id: str, *, stage: str, progress: int, message: str) -> None:
    with _jobs_lock:
        job = _scene_jobs[job_id]
        job.update({"stage": stage, "progress": progress})
        job["steps"].append({"stage": stage, "progress": progress, "message": message})


def _search_sentinel_scene(
    request: dict[str, Any],
    report: Callable[..., None],
) -> dict[str, Any]:
    search = {
        "collections": ["sentinel-2-l2a"],
        "bbox": request["bbox"],
        "datetime": f'{request["startDate"]}T00:00:00Z/{request["endDate"]}T23:59:59Z',
        "limit": 500,
        "query": {"eo:cloud_cover": {"lt": request["maxCloudCover"] + 0.001}},
        "sortby": [{"field": "properties.datetime", "direction": "desc"}],
    }
    body = json.dumps(search).encode("utf-8")
    req = urllib.request.Request(
        STAC_SEARCH_URL,
        data=body,
        headers={"User-Agent": "DataInsightAI-RemoteSensing/1.0", "Content-Type": "application/json"},
    )
    report(stage="scene-search", progress=5, message="Cerco scene Sentinel-2 L2A nel catalogo STAC pubblico.")
    try:
        with urllib.request.urlopen(req, timeout=45) as response:
            catalog_bytes = response.read(20 * 1024 * 1024 + 1)
            if len(catalog_bytes) > 20 * 1024 * 1024:
                raise RuntimeError("Il catalogo STAC ha superato il limite di risposta di 20 MB.")
            catalog = json.loads(catalog_bytes)
    except urllib.error.HTTPError as exc:
        raise RuntimeError(f"Il catalogo Sentinel-2 ha risposto con HTTP {exc.code}.") from exc
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"Ricerca STAC Sentinel-2 non riuscita: {exc}") from exc
    if not isinstance(catalog, dict) or not isinstance(catalog.get("features"), list):
        raise RuntimeError("Il catalogo STAC ha restituito una risposta non valida.")

    candidates = []
    for item in catalog["features"]:
        properties = item.get("properties", {})
        try:
            cloud_cover = float(properties["eo:cloud_cover"])
        except (KeyError, TypeError, ValueError):
            continue
        assets = item.get("assets", {})
        if not all(name in assets and isinstance(assets[name].get("href"), str) for name in ("blue", "green", "red", "nir", "swir16", "scl")):
            continue
        hosts = {
            urllib.parse.urlsplit(assets[name]["href"]).hostname
            for name in ("blue", "green", "red", "nir", "swir16", "scl")
        }
        if hosts != {SENTINEL_COG_HOST}:
            continue
        candidates.append((cloud_cover, properties.get("datetime", ""), item))
    if not candidates:
        raise RuntimeError("Nessuna scena Sentinel-2 L2A con bande COG valide nell'intervallo e soglia nuvole scelti.")

    cloud_cover, _, item = min(candidates, key=lambda candidate: (candidate[0], -_datetime_sort_key(candidate[1])))
    report(
        stage="scene-selected",
        progress=12,
        message=f"Scena selezionata: {item.get('id', 'Sentinel-2')} con copertura nuvolosa di tile {cloud_cover:.2f}%.",
    )
    return {"item": item, "cloudCover": cloud_cover}


def _datetime_sort_key(value: str) -> float:
    try:
        return time.mktime(time.strptime(value[:19], "%Y-%m-%dT%H:%M:%S"))
    except (ValueError, TypeError):
        return 0.0


def _worldcover_url(bbox: list[float]) -> str:
    west, south, east, north = bbox
    longitude = math.floor(west / 3) * 3
    latitude = math.floor(south / 3) * 3
    tile = f"{'N' if latitude >= 0 else 'S'}{abs(latitude):02d}{'E' if longitude >= 0 else 'W'}{abs(longitude):03d}"
    return f"{WORLDCOVER_BASE_URL}/ESA_WorldCover_10m_2021_v200_{tile}_Map.tif"


def _read_scene_arrays(item: dict[str, Any], request: dict[str, Any], report: Callable[..., None]):
    try:
        import numpy as np
        import rasterio
        from rasterio.env import Env
        from rasterio.enums import Resampling
        from rasterio.vrt import WarpedVRT
        from rasterio.warp import transform_bounds
        from rasterio.windows import Window, from_bounds
    except ImportError as exc:
        raise RuntimeError("Rasterio non disponibile. Installa requirements.txt e riavvia Data Insight AI.") from exc

    assets = item["assets"]
    bbox = request["bbox"]
    with Env(
        GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR",
        CPL_VSIL_CURL_ALLOWED_EXTENSIONS=".tif",
        GDAL_HTTP_MULTIRANGE="YES",
        GDAL_HTTP_TIMEOUT="45",
        GDAL_HTTP_CONNECTTIMEOUT="15",
    ):
        with rasterio.open(assets["red"]["href"]) as reference:
            projected_bounds = transform_bounds("EPSG:4326", reference.crs, *bbox)
            margin = 1.0
            if (
                projected_bounds[0] < reference.bounds.left - margin
                or projected_bounds[1] < reference.bounds.bottom - margin
                or projected_bounds[2] > reference.bounds.right + margin
                or projected_bounds[3] > reference.bounds.top + margin
            ):
                raise RuntimeError("La scena selezionata non copre interamente l'area di studio.")
            window = from_bounds(*projected_bounds, transform=reference.transform)
            window = window.round_offsets().round_lengths().intersection(Window(0, 0, reference.width, reference.height))
            width, height = int(window.width), int(window.height)
            if width < 20 or height < 20 or width * height > MAX_AOI_PIXELS:
                raise RuntimeError("L'area produce una griglia non valida o supera il limite di un milione di pixel.")
            target_transform = reference.window_transform(window)
            target_crs = reference.crs

        arrays: dict[str, Any] = {}
        band_names = ("blue", "green", "red", "nir", "swir16", "scl")
        for offset, band in enumerate(band_names, start=1):
            report(
                stage="download",
                progress=12 + offset * 8,
                message=f"Leggo dalla scena COG l'area richiesta: banda {band.upper()}.",
            )
            with rasterio.open(assets[band]["href"]) as source:
                resampling = Resampling.nearest if band == "scl" else Resampling.bilinear
                with WarpedVRT(
                    source,
                    crs=target_crs,
                    transform=target_transform,
                    width=width,
                    height=height,
                    resampling=resampling,
                    src_nodata=0,
                    nodata=0,
                ) as vrt:
                    arrays[band] = vrt.read(1)

        worldcover_url = _worldcover_url(bbox)
        report(stage="reference", progress=63, message="Allineo ESA WorldCover 2021 alla griglia Sentinel-2 a 10 metri.")
        try:
            with rasterio.open(worldcover_url) as source:
                with WarpedVRT(
                    source,
                    crs=target_crs,
                    transform=target_transform,
                    width=width,
                    height=height,
                    resampling=Resampling.nearest,
                ) as vrt:
                    reference_labels = vrt.read(1)
        except rasterio.errors.RasterioIOError as exc:
            raise RuntimeError(f"Tile ESA WorldCover non disponibile per l'area scelta: {exc}") from exc

    scaled = {name: arrays[name].astype(np.float32) / 10000.0 for name in ("blue", "green", "red", "nir", "swir16")}
    blue, green, red, nir, swir = (scaled[name] for name in ("blue", "green", "red", "nir", "swir16"))
    ndvi = (nir - red) / np.maximum(nir + red, 1e-6)
    ndwi = (green - nir) / np.maximum(green + nir, 1e-6)
    ndbi = (swir - nir) / np.maximum(swir + nir, 1e-6)
    features = np.stack((blue, green, red, nir, swir, ndvi, ndwi, ndbi), axis=-1).astype(np.float32)
    scl = arrays["scl"]
    clear = np.isin(scl, [4, 5, 6]) & np.all(np.isfinite(features), axis=-1)
    labels_valid = np.isin(reference_labels, list(WORLDCOVER_CLASSES))
    training_valid = clear & labels_valid
    if np.count_nonzero(clear) < 1000 or np.count_nonzero(training_valid) < 500:
        raise RuntimeError("Dopo maschera nuvole e controllo delle etichette restano troppo pochi pixel validi.")
    return features, reference_labels, clear, training_valid, target_transform, target_crs, worldcover_url


def _build_unet_training_data(
    features: Any,
    reference: Any,
    clear: Any,
    selected_classes: list[int],
    *,
    transform: Any,
    crs: Any,
    bbox: list[float],
    scene_id: str,
) -> dict[str, Any]:
    import numpy as np
    from affine import Affine

    height, width = reference.shape
    grid_height = min(128, height)
    grid_width = min(128, width)
    rows = np.minimum(((np.arange(grid_height) + 0.5) * height / grid_height).astype(np.int32), height - 1)
    columns = np.minimum(((np.arange(grid_width) + 0.5) * width / grid_width).astype(np.int32), width - 1)
    sampled_features = features[rows[:, None], columns[None, :], :]
    sampled_labels = reference[rows[:, None], columns[None, :]]
    sampled_clear = clear[rows[:, None], columns[None, :]]
    valid_labels = sampled_clear & np.isin(sampled_labels, selected_classes)
    labels = np.where(valid_labels, sampled_labels, 0).astype(np.uint8)
    clean_features = np.nan_to_num(sampled_features, nan=0.0, posinf=0.0, neginf=0.0).astype("<f4")
    packed = clean_features.tobytes(order="C") + labels.tobytes(order="C")
    compressed = zlib.compress(packed, level=6)
    if len(compressed) > MAX_UNET_DATA_BYTES:
        raise RuntimeError("Il campione U-Net supera il limite di trasferimento. Riduci l'area di studio.")
    grid_transform = transform @ Affine.scale(width / grid_width, height / grid_height)
    return {
        "width": int(grid_width),
        "height": int(grid_height),
        "channels": list(FEATURE_NAMES),
        "classCodes": [int(code) for code in selected_classes],
        "encoding": "zlib-f32le-interleaved-features-then-u8-worldcover",
        "dataBase64": base64.b64encode(compressed).decode("ascii"),
        "bbox": bbox,
        "transform": [float(value) for value in tuple(grid_transform)[:6]],
        "crs": crs.to_string(),
        "sceneId": scene_id,
    }


def export_unet_geotiff(payload: dict[str, Any]) -> dict[str, str]:
    import numpy as np
    import rasterio
    from affine import Affine
    from rasterio.crs import CRS
    from rasterio.enums import ColorInterp
    from rasterio.io import MemoryFile

    width = payload.get("width")
    height = payload.get("height")
    if (
        isinstance(width, bool)
        or not isinstance(width, int)
        or isinstance(height, bool)
        or not isinstance(height, int)
        or not 1 <= width <= 128
        or not 1 <= height <= 128
    ):
        raise ValueError("La griglia U-Net deve avere dimensioni comprese tra 1 e 128 pixel.")
    class_codes = payload.get("classCodes")
    if (
        not isinstance(class_codes, list)
        or not 2 <= len(class_codes) <= len(WORLDCOVER_CLASSES)
        or any(isinstance(code, bool) or not isinstance(code, int) or code not in WORLDCOVER_CLASSES for code in class_codes)
        or len(set(class_codes)) != len(class_codes)
    ):
        raise ValueError("Le classi U-Net non sono valide.")
    encoded_labels = payload.get("predictedClassCodesBase64")
    if not isinstance(encoded_labels, str) or len(encoded_labels) > 22_000:
        raise ValueError("La maschera U-Net non è valida o supera il limite consentito.")
    try:
        label_bytes = base64.b64decode(encoded_labels, validate=True)
    except (ValueError, base64.binascii.Error) as exc:
        raise ValueError("La maschera U-Net non è codificata in Base64 valido.") from exc
    if len(label_bytes) != width * height:
        raise ValueError("La dimensione della maschera U-Net non corrisponde alla griglia.")
    map_array = np.frombuffer(label_bytes, dtype=np.uint8).reshape((height, width))
    if not np.isin(map_array, [0, *class_codes]).all():
        raise ValueError("La maschera U-Net contiene codici di classe non selezionati.")

    raw_transform = payload.get("transform")
    if (
        not isinstance(raw_transform, list)
        or len(raw_transform) != 6
        or any(isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) for value in raw_transform)
    ):
        raise ValueError("La trasformazione geospaziale non è valida.")
    transform = Affine(*raw_transform)
    if abs(transform.a * transform.e - transform.b * transform.d) < 1e-12:
        raise ValueError("La trasformazione geospaziale non definisce pixel validi.")

    bbox = payload.get("bbox")
    if (
        not isinstance(bbox, list)
        or len(bbox) != 4
        or any(isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) for value in bbox)
        or not (-180 <= bbox[0] < bbox[2] <= 180 and -60 <= bbox[1] < bbox[3] <= 84)
    ):
        raise ValueError("L'area di studio non è valida.")
    crs_text = payload.get("crs")
    if not isinstance(crs_text, str) or len(crs_text) > 64:
        raise ValueError("Il sistema di coordinate non è valido.")
    try:
        crs = CRS.from_string(crs_text)
    except rasterio.errors.CRSError as exc:
        raise ValueError("Il sistema di coordinate non è valido.") from exc
    if not crs.is_projected:
        raise ValueError("La mappa U-Net richiede un sistema di coordinate proiettato.")
    scene_id = payload.get("sceneId")
    if not isinstance(scene_id, str) or len(scene_id) > 200:
        raise ValueError("L'identificativo della scena non è valido.")

    rgb = np.zeros((3, height, width), dtype=np.uint8)
    for class_code, (_, color) in WORLDCOVER_CLASSES.items():
        class_pixels = map_array == class_code
        rgb_color = tuple(int(color[index:index + 2], 16) for index in (1, 3, 5))
        for band, channel in enumerate(rgb_color):
            rgb[band, class_pixels] = channel

    profile = {
        "driver": "GTiff",
        "height": height,
        "width": width,
        "count": 4,
        "dtype": "uint8",
        "crs": crs,
        "transform": transform,
        "compress": "deflate",
        "tiled": True,
        "photometric": "RGB",
    }
    with MemoryFile() as memory_file:
        with memory_file.open(**profile) as destination:
            destination.write(rgb, indexes=(1, 2, 3))
            destination.write(np.where(map_array == 0, 0, 255).astype(np.uint8), 4)
            destination.colorinterp = (
                ColorInterp.red,
                ColorInterp.green,
                ColorInterp.blue,
                ColorInterp.alpha,
            )
            for band, description in enumerate(("Red", "Green", "Blue", "Alpha"), start=1):
                destination.set_band_description(band, description)
            destination.update_tags(
                AREA_OF_INTEREST_WGS84=",".join(str(value) for value in bbox),
                SENTINEL2_SCENE=scene_id,
                REFERENCE_DATASET="ESA WorldCover 2021 v200 proxy labels",
                REFERENCE_LICENSE="CC BY 4.0",
                MODEL="Browser U-Net",
                VALIDATION="Spatial patch holdout; agreement with WorldCover proxy, not independent ground truth",
                GRID_CELL_WIDTH_MAP_UNITS=f"{math.hypot(transform.a, transform.d):.6g}",
                GRID_CELL_HEIGHT_MAP_UNITS=f"{math.hypot(transform.b, transform.e):.6g}",
                CLASS_LEGEND=json.dumps(
                    [
                        {"code": code, "name": name, "color": color}
                        for code, (name, color) in WORLDCOVER_CLASSES.items()
                    ],
                    ensure_ascii=False,
                    separators=(",", ":"),
                ),
            )
        geotiff = memory_file.read()
    if len(geotiff) > MAX_UNET_GEOTIFF_BYTES:
        raise RuntimeError("Il GeoTIFF U-Net supera il limite gratuito della Preview.")
    return {"geoTiffBase64": base64.b64encode(geotiff).decode("ascii")}


def _spatial_sample_split(
    labels: Any,
    rows: Any,
    columns: Any,
    width: int,
    *,
    max_per_class: int = 900,
    block_pixels: int = SPATIAL_BLOCK_PIXELS,
) -> tuple[Any, Any, Any, Any, Any]:
    import numpy as np

    rng = np.random.default_rng(RANDOM_SEED)
    sampled_indices = []
    for class_code in sorted(int(code) for code in np.unique(labels)):
        candidates = np.flatnonzero(labels == class_code)
        if len(candidates) < 20:
            continue
        selected = rng.choice(candidates, size=min(max_per_class, len(candidates)), replace=False)
        sampled_indices.extend(selected.tolist())
    if not sampled_indices:
        raise RuntimeError("Le etichette WorldCover non contengono campioni sufficienti per l'addestramento.")

    sampled_indices = np.asarray(sampled_indices, dtype=np.int64)
    sample_labels = labels[sampled_indices]
    block_columns = math.ceil(width / block_pixels)
    block_ids = (
        (rows[sampled_indices] // block_pixels) * block_columns
        + columns[sampled_indices] // block_pixels
    )
    blocks = np.unique(block_ids)
    if len(blocks) < 5:
        raise RuntimeError("Area insufficiente per una validazione spaziale a blocchi indipendenti.")

    test_block_count = max(1, int(math.ceil(len(blocks) * 0.2)))
    best_test = None
    best_score = -1
    all_classes = set(int(code) for code in np.unique(sample_labels))
    for attempt in range(500):
        attempt_rng = np.random.default_rng(RANDOM_SEED + attempt)
        test_blocks = attempt_rng.choice(blocks, size=test_block_count, replace=False)
        test_mask = np.isin(block_ids, test_blocks)
        train_classes = set(int(code) for code in np.unique(sample_labels[~test_mask]))
        if train_classes != all_classes:
            continue
        test_classes = set(int(code) for code in np.unique(sample_labels[test_mask]))
        score = len(test_classes) * 1_000_000 + int(test_mask.sum())
        if score > best_score:
            best_test = test_mask
            best_score = score
        if test_classes == all_classes:
            break
    if best_test is None or int(best_test.sum()) < 50 or len(np.unique(sample_labels[best_test])) < 2:
        raise RuntimeError(
            "I campioni WorldCover non consentono una validazione spaziale per blocchi: amplia o sposta l'area di studio."
        )
    return (
        sample_labels[~best_test],
        sample_labels[best_test],
        sampled_indices[~best_test],
        sampled_indices[best_test],
        sampled_indices,
    )


def _model_metrics(y_true: Any, prediction: Any, class_codes: list[int]) -> dict[str, Any]:
    import numpy as np
    from sklearn.metrics import (
        accuracy_score,
        balanced_accuracy_score,
        cohen_kappa_score,
        confusion_matrix,
        f1_score,
        precision_score,
        recall_score,
    )

    evaluated_classes = sorted(int(code) for code in np.unique(y_true))
    return {
        "accuracy": float(accuracy_score(y_true, prediction)),
        "balancedAccuracy": float(balanced_accuracy_score(y_true, prediction)),
        "macroF1": float(f1_score(y_true, prediction, labels=evaluated_classes, average="macro", zero_division=0)),
        "kappa": float(cohen_kappa_score(y_true, prediction)),
        "confusionClassCodes": class_codes,
        "confusionMatrix": confusion_matrix(y_true, prediction, labels=class_codes).tolist(),
        "perClass": [
            {
                "code": class_code,
                "className": WORLDCOVER_CLASSES[class_code][0],
                "precision": float(precision_score(y_true, prediction, labels=[class_code], average="macro", zero_division=0)),
                "recall": float(recall_score(y_true, prediction, labels=[class_code], average="macro", zero_division=0)),
                "f1": float(f1_score(y_true, prediction, labels=[class_code], average="macro", zero_division=0)),
                "support": int(np.count_nonzero(y_true == class_code)),
            }
            for class_code in class_codes
            if np.count_nonzero(y_true == class_code)
        ],
    }


def _normalized_feature_importance(feature_names: tuple[str, ...], scores: Any) -> list[dict[str, Any]]:
    import numpy as np

    values = np.asarray(scores, dtype=np.float64).reshape(-1)
    if len(values) != len(feature_names):
        raise ValueError("Il numero di punteggi non corrisponde alle feature.")
    values = np.where(np.isfinite(values), np.maximum(values, 0), 0)
    total = float(values.sum())
    normalized = values / total if total > 0 else np.zeros_like(values)
    return sorted(
        (
            {"name": name, "importance": float(value)}
            for name, value in zip(feature_names, normalized)
        ),
        key=lambda item: item["importance"],
        reverse=True,
    )


def _write_classification_geotiff(
    map_path: Path,
    map_array: Any,
    *,
    bbox: list[float],
    scene_metadata: dict[str, Any],
    model_name: str,
    transform: Any,
    crs: Any,
) -> None:
    import numpy as np
    import rasterio
    from rasterio.enums import ColorInterp

    rgb = np.zeros((3, *map_array.shape), dtype=np.uint8)
    for class_code, (_, color) in WORLDCOVER_CLASSES.items():
        class_pixels = map_array == class_code
        rgb_color = tuple(int(color[index:index + 2], 16) for index in (1, 3, 5))
        for band, channel in enumerate(rgb_color):
            rgb[band, class_pixels] = channel

    profile = {
        "driver": "GTiff",
        "height": map_array.shape[0],
        "width": map_array.shape[1],
        "count": 4,
        "dtype": "uint8",
        "crs": crs,
        "transform": transform,
        "compress": "deflate",
        "tiled": True,
        "photometric": "RGB",
    }
    with rasterio.open(map_path, "w", **profile) as destination:
        destination.write(rgb, indexes=(1, 2, 3))
        destination.write(np.where(map_array == 0, 0, 255).astype(np.uint8), 4)
        destination.colorinterp = (
            ColorInterp.red,
            ColorInterp.green,
            ColorInterp.blue,
            ColorInterp.alpha,
        )
        for band, description in enumerate(("Red", "Green", "Blue", "Alpha"), start=1):
            destination.set_band_description(band, description)
        destination.update_tags(
            AREA_OF_INTEREST_WGS84=",".join(str(value) for value in bbox),
            SENTINEL2_SCENE=scene_metadata["id"],
            ACQUISITION_DATE=scene_metadata["datetime"],
            REFERENCE_DATASET="ESA WorldCover 2021 v200",
            REFERENCE_LICENSE="CC BY 4.0",
            MODEL=model_name,
            PIXEL_SIZE_METERS="10",
            CLOUD_MASK="Sentinel-2 SCL classes 4, 5, and 6",
            FEATURES=", ".join(FEATURE_NAMES),
            VALIDATION="500 m spatial blocks; agreement with WorldCover, not independent ground truth",
            MAP_DISPLAY="Four standard RGBA bands for color display; class colors are defined in CLASS_LEGEND.",
            CLASS_LEGEND=json.dumps(
                [
                    {"code": code, "name": name, "color": color}
                    for code, (name, color) in WORLDCOVER_CLASSES.items()
                ],
                ensure_ascii=False,
                separators=(",", ":"),
            ),
        )


def _render_classification_preview(prediction: Any, bbox: list[float], scene: dict[str, Any]) -> bytes:
    import numpy as np
    from PIL import Image, ImageDraw, ImageFont

    height, width = prediction.shape
    rgb = np.zeros((height, width, 3), dtype=np.uint8)
    for class_code, (_, color) in WORLDCOVER_CLASSES.items():
        value = tuple(int(color[index:index + 2], 16) for index in (1, 3, 5))
        rgb[prediction == class_code] = value
    map_image = Image.fromarray(rgb, mode="RGB")
    map_image.thumbnail((760, 600), Image.Resampling.NEAREST)
    panel_width, margin, title_height = 290, 24, 76
    canvas = Image.new("RGB", (map_image.width + panel_width + margin * 3, map_image.height + title_height + margin * 2), "#f4f7fb")
    draw = ImageDraw.Draw(canvas)
    draw.text((margin, margin), "Classificazione Sentinel-2", fill="#15243a")
    draw.text((margin, margin + 24), f"{scene['id']} · {scene['datetime'][:10]}", fill="#526177")
    draw.text((margin, margin + 44), f"AOI {bbox[0]:.3f}, {bbox[1]:.3f} – {bbox[2]:.3f}, {bbox[3]:.3f}", fill="#526177")
    map_x, map_y = margin, title_height + margin
    canvas.paste(map_image, (map_x, map_y))
    legend_x = map_x + map_image.width + margin
    draw.text((legend_x, map_y), "Classi WorldCover", fill="#15243a")
    legend_y = map_y + 30
    for class_code, (name, color) in WORLDCOVER_CLASSES.items():
        if not np.any(prediction == class_code):
            continue
        draw.rectangle((legend_x, legend_y + 3, legend_x + 16, legend_y + 19), fill=color)
        draw.text((legend_x + 25, legend_y + 3), name, fill="#23334a")
        legend_y += 27
    draw.rectangle((legend_x, legend_y + 3, legend_x + 16, legend_y + 19), fill="#171717")
    draw.text((legend_x + 25, legend_y + 3), "Nuvole / no-data", fill="#23334a")
    output = io.BytesIO()
    canvas.save(output, format="PNG", optimize=True)
    return output.getvalue()


def _run_sentinel_aoi(
    request: dict[str, Any],
    job_id: str,
    report: Callable[..., None],
) -> tuple[dict[str, Any], Path]:
    try:
        import numpy as np
        import rasterio
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.pipeline import make_pipeline
        from sklearn.preprocessing import StandardScaler
        from sklearn.svm import LinearSVC
    except ImportError as exc:
        raise RuntimeError("Dipendenze geospaziali o ML mancanti. Installa requirements.txt e riavvia Data Insight AI.") from exc

    selected = _search_sentinel_scene(request, report)
    item = selected["item"]
    features, reference, clear, training_valid, transform, crs, worldcover_url = _read_scene_arrays(
        item,
        request,
        report,
    )
    selected_training = training_valid & np.isin(reference, request["selectedClasses"])
    if np.count_nonzero(selected_training) < 500:
        raise RuntimeError("Le classi selezionate contengono meno di 500 pixel validi; amplia l'area o includi altre classi.")
    class_codes = sorted(int(code) for code in np.unique(reference[selected_training]))
    feature_rows, feature_columns = np.where(selected_training)
    flat_labels = reference[selected_training]
    y_train, y_test, train_positions, test_positions, map_positions = _spatial_sample_split(
        flat_labels,
        feature_rows,
        feature_columns,
        features.shape[1],
        max_per_class=request["maxSamplesPerClass"],
        block_pixels=request["spatialBlockMeters"] // 10,
    )
    train_features = features[feature_rows[train_positions], feature_columns[train_positions]]
    test_features = features[feature_rows[test_positions], feature_columns[test_positions]]
    report(
        stage="training",
        progress=69,
        message=(
            f"Validazione spaziale su blocchi da {request['spatialBlockMeters']} m; "
            f"{len(train_positions)} campioni di training e {len(test_positions)} di test."
        ),
    )

    forest = RandomForestClassifier(
        n_estimators=150,
        min_samples_leaf=2,
        max_features="sqrt",
        class_weight="balanced_subsample",
        n_jobs=-1,
        random_state=RANDOM_SEED,
    )
    forest.fit(train_features, y_train)
    rf_test = forest.predict(test_features)
    report(stage="random-forest", progress=77, message="Random Forest addestrata; valuto i blocchi geografici esclusi dal training.")

    svm = make_pipeline(
        StandardScaler(),
        LinearSVC(C=1.0, dual="auto", class_weight="balanced", max_iter=5000, random_state=RANDOM_SEED),
    )
    svm.fit(train_features, y_train)
    svm_test = svm.predict(test_features)
    report(stage="svm", progress=83, message="SVM lineare addestrata sulle feature spettrali e sugli indici.")

    rf_metrics = _model_metrics(y_test, rf_test, class_codes)
    svm_metrics = _model_metrics(y_test, svm_test, class_codes)
    rf_feature_importance = _normalized_feature_importance(FEATURE_NAMES, forest.feature_importances_)
    svm_classifier = svm.named_steps["linearsvc"]
    svm_feature_importance = _normalized_feature_importance(
        FEATURE_NAMES,
        np.mean(np.abs(svm_classifier.coef_), axis=0),
    )
    report(stage="mapping", progress=88, message=f"Rifitto {request['mapModel']} sui campioni di riferimento e classifico i pixel senza nuvole.")
    map_features = features[feature_rows[map_positions], feature_columns[map_positions]]
    map_labels = flat_labels[map_positions]
    if request["mapModel"] == "randomForest":
        final_model = RandomForestClassifier(
            n_estimators=150,
            min_samples_leaf=2,
            max_features="sqrt",
            class_weight="balanced_subsample",
            n_jobs=-1,
            random_state=RANDOM_SEED,
        )
    else:
        final_model = make_pipeline(
            StandardScaler(),
            LinearSVC(C=1.0, dual="auto", class_weight="balanced", max_iter=5000, random_state=RANDOM_SEED),
        )
    final_model.fit(map_features, map_labels)

    map_array = np.zeros(clear.shape, dtype=np.uint8)
    clear_rows, clear_columns = np.where(clear)
    for start in range(0, len(clear_rows), 50_000):
        end = min(start + 50_000, len(clear_rows))
        chunk = features[clear_rows[start:end], clear_columns[start:end]]
        map_array[clear_rows[start:end], clear_columns[start:end]] = final_model.predict(chunk).astype(np.uint8)

    output_dir = Path(tempfile.gettempdir()) / "data-insight-ai" / "scene-results"
    output_dir.mkdir(parents=True, exist_ok=True)
    map_path = output_dir / f"{job_id}.tif"
    scene_metadata = {
        "id": item.get("id", "Sentinel-2 L2A"),
        "datetime": item.get("properties", {}).get("datetime", ""),
        "tileCloudCoverPercent": float(selected["cloudCover"]),
        "satellite": item.get("properties", {}).get("platform", "Sentinel-2"),
    }
    _write_classification_geotiff(
        map_path,
        map_array,
        bbox=request["bbox"],
        scene_metadata=scene_metadata,
        model_name="Random Forest" if request["mapModel"] == "randomForest" else "SVM lineare",
        transform=transform,
        crs=crs,
    )

    pixel_area_ha = abs(transform.a * transform.e - transform.b * transform.d) / 10_000
    class_areas = [
        {
            "code": class_code,
            "name": class_name,
            "color": color,
            "areaHa": float(np.count_nonzero(map_array == class_code) * pixel_area_ha),
        }
        for class_code, (class_name, color) in WORLDCOVER_CLASSES.items()
        if np.any(map_array == class_code)
    ]
    preview = _render_classification_preview(map_array, request["bbox"], scene_metadata)
    unet_training_data = None
    if request["includeUnetData"]:
        report(stage="unet-data", progress=96, message="Preparo nel risultato un campione raster compresso con etichette proxy WorldCover per il training U-Net nel browser.")
        unet_training_data = _build_unet_training_data(
            features,
            reference,
            clear,
            request["selectedClasses"],
            transform=transform,
            crs=crs,
            bbox=request["bbox"],
            scene_id=scene_metadata["id"],
        )
    report(stage="complete", progress=100, message="Mappa GeoTIFF e valutazione spaziale completate.")
    return {
        "areaOfInterest": {"bboxWgs84": request["bbox"], "crs": "EPSG:4326"},
        "scene": scene_metadata,
        "reference": {
            "name": "ESA WorldCover 2021 v200",
            "url": worldcover_url,
            "license": "CC BY 4.0",
            "meaning": "Etichette di riferimento 2021; non sono rilievi a terra indipendenti.",
        },
        "classLegend": [
            {"code": code, "name": name, "color": color}
            for code, (name, color) in WORLDCOVER_CLASSES.items()
        ],
        "processing": {
            "pixelSizeMeters": 10,
            "bands": ["B02", "B03", "B04", "B08", "B11"],
            "indices": ["NDVI", "NDWI", "NDBI"],
            "cloudMask": "Sentinel-2 SCL: mantiene classi 4, 5 e 6; le altre sono escluse.",
            "spatialValidationBlockMeters": request["spatialBlockMeters"],
            "clearPixelCount": int(np.count_nonzero(clear)),
            "referencePixelCount": int(np.count_nonzero(training_valid)),
            "trainingSampleCount": int(len(train_positions)),
            "testSampleCount": int(len(test_positions)),
            "modelComparison": "Random Forest e LinearSVC standardizzata valutate sugli stessi blocchi spaziali esclusi dal training.",
            "mapModel": (
                "Random Forest rifittata su campioni WorldCover bilanciati dell'AOI."
                if request["mapModel"] == "randomForest"
                else "SVM lineare rifittata su campioni WorldCover bilanciati dell'AOI."
            ),
            "mapTrainingSampleCount": int(len(map_positions)),
            "maxSamplesPerClass": request["maxSamplesPerClass"],
            "selectedClasses": request["selectedClasses"],
        },
        "models": {
            "randomForest": {
                "name": "Random Forest",
                "featureImportance": rf_feature_importance,
                **rf_metrics,
            },
            "svm": {
                "name": "SVM lineare",
                "featureImportance": svm_feature_importance,
                **svm_metrics,
            },
        },
        "classAreas": class_areas,
        "mapImage": "data:image/png;base64," + base64.b64encode(preview).decode("ascii"),
        "unetTrainingData": unet_training_data,
        "mapDownload": f"/api/assist/remote-sensing/map?id={job_id}",
        "limitations": [
            "La mappa e una classificazione esplorativa a 10 m; le etichette di training e riferimento sono ESA WorldCover 2021, non osservazioni di campo.",
            "Il test spaziale misura l'accordo con WorldCover su blocchi geografici esclusi dal training, non l'accuratezza rispetto a verita-terreno indipendenti.",
            "La differenza temporale tra WorldCover 2021 e la scena Sentinel-2 selezionata puo introdurre cambiamenti reali non rappresentati dalle etichette.",
            "Verifica la mappa in GIS e con dati indipendenti prima di usarla per decisioni operative o conclusioni scientifiche.",
        ],
    }, map_path


def start_sentinel_aoi_job(payload: dict[str, Any]) -> dict[str, str]:
    request = _validate_scene_request(payload)
    with _jobs_lock:
        if any(job["status"] == "running" for job in _scene_jobs.values()):
            raise RuntimeError("Un'elaborazione Sentinel-2 per area di studio e gia in corso.")
        job_id = uuid.uuid4().hex
        _scene_jobs[job_id] = {
            "id": job_id,
            "status": "running",
            "stage": "starting",
            "progress": 0,
            "steps": [],
            "result": None,
            "error": None,
            "createdAt": time.time(),
            "mapPath": None,
        }
        completed = sorted(
            (job for job in _scene_jobs.values() if job["status"] != "running"),
            key=lambda job: job["createdAt"],
        )
        while len(_scene_jobs) > 3 and completed:
            expired = completed.pop(0)
            map_path = expired.get("mapPath")
            if map_path and Path(map_path).is_file():
                Path(map_path).unlink()
            _scene_jobs.pop(expired["id"], None)

    def run() -> None:
        try:
            result, map_path = _run_sentinel_aoi(
                request,
                job_id,
                lambda **update: _update_scene_job(job_id, **update),
            )
            with _jobs_lock:
                _scene_jobs[job_id].update({
                    "status": "complete",
                    "progress": 100,
                    "result": result,
                    "mapPath": str(map_path),
                })
        except Exception as exc:
            with _jobs_lock:
                job = _scene_jobs[job_id]
                job.update({
                    "status": "failed",
                    "error": f"{type(exc).__name__}: {exc}",
                    "steps": job["steps"] + [{
                        "stage": "failed",
                        "progress": job["progress"],
                        "message": f"Elaborazione non completata: {type(exc).__name__}: {exc}",
                    }],
                })

    threading.Thread(target=run, name=f"sentinel-aoi-{job_id[:8]}", daemon=True).start()
    return {"jobId": job_id, "status": "running"}


def get_sentinel_aoi_job(job_id: str) -> dict[str, Any] | None:
    with _jobs_lock:
        job = _scene_jobs.get(job_id)
        if not job:
            return None
        return {key: value for key, value in job.items() if key not in {"createdAt", "mapPath"}}


def get_sentinel_map_path(job_id: str) -> Path | None:
    if not re.fullmatch(r"[a-f0-9]{32}", job_id):
        return None
    with _jobs_lock:
        job = _scene_jobs.get(job_id)
        if not job or job["status"] != "complete" or not job.get("mapPath"):
            return None
        path = Path(job["mapPath"])
        return path if path.is_file() else None
