#!/usr/bin/env python3
"""Local data and analysis service for the standalone Data Insight dashboard."""

from __future__ import annotations

import base64
import csv
import hmac
import io
import json
import ipaddress
import math
import os
import re
import socket
import sys
import threading
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
import zipfile
import remote_sensing
from html.parser import HTMLParser
from datetime import date, datetime, timedelta
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent
HOST = os.environ.get("DATA_INSIGHT_HOST", "127.0.0.1")
PORT = int(os.environ.get("DATA_INSIGHT_PORT", "8765"))
MAX_BODY = 10 * 1024 * 1024
MAX_DOCUMENT_BYTES = 7 * 1024 * 1024
MAX_DOCUMENT_TEXT = 100_000
MAX_ML_DATASET_BYTES = 2_500_000
MAX_ML_ROWS = 10_000
MAX_ML_COLUMNS = 50
MAX_ML_SOURCES = 5
API_KEY = os.environ.get("DATA_INSIGHT_API_KEY", "")
MAX_ROWS = 100_000
TIMEOUT = 30
MAX_PORTAL_PAGES = 5
MAX_PORTAL_CANDIDATES = 25
MAX_PORTAL_PAGE_BYTES = 1 * 1024 * 1024
PORTAL_PAGE_TIMEOUT = 7

PROVIDERS = {
    "nasa": {
        "name": "NASA POWER",
        "indicators": {"T2M": ("Temperatura media giornaliera", "°C")},
        "base": "https://power.larc.nasa.gov/api/temporal/daily/point",
    },
    "ecb": {
        "name": "BCE",
        "indicators": {"USD_EUR": ("Cambio di riferimento USD per EUR", "USD/EUR")},
        "base": "https://data-api.ecb.europa.eu/service/data/EXR/D.USD.EUR.SP00.A",
    },
    "worldbank": {
        "name": "Banca Mondiale",
        "indicators": {
            "NY.GDP.MKTP.CD": ("PIL (USD correnti)", "USD"),
            "SP.POP.TOTL": ("Popolazione totale", "persone"),
            "MS.MIL.XPND.GD.ZS": ("Spesa militare (% PIL; WDI/SIPRI)", "% PIL"),
        },
        "base": "https://api.worldbank.org/v2/country",
    },
    "eurostat": {
        "name": "Eurostat",
        "indicators": {"POP": ("Popolazione residente in Italia", "persone")},
        "base": "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/demo_pjan",
    },
}


class RequestError(ValueError):
    pass


def parse_iso_date(value: Any, label: str) -> date:
    if not isinstance(value, str):
        raise RequestError(f"{label} deve essere una data ISO (AAAA-MM-GG).")
    try:
        return date.fromisoformat(value)
    except ValueError as exc:
        raise RequestError(f"{label} non e una data valida.") from exc


def parse_number(value: Any) -> float | None:
    if isinstance(value, bool) or value is None:
        return None
    try:
        result = float(value)
    except (TypeError, ValueError):
        if not isinstance(value, str):
            return None
        text = value.strip().replace("\u00a0", "").replace(" ", "")
        if not text:
            return None
        if "," in text and "." in text:
            text = text.replace(".", "").replace(",", ".") if text.rfind(",") > text.rfind(".") else text.replace(",", "")
        else:
            text = text.replace(",", ".")
        try:
            result = float(text)
        except ValueError:
            return None
    return result if math.isfinite(result) else None


def parse_csv(text: str) -> tuple[list[str], list[dict[str, str]]]:
    first_line = text.lstrip("\ufeff").splitlines()[0] if text.strip() else ""
    delimiter = ";" if first_line.count(";") > first_line.count(",") else ","
    reader = csv.reader(io.StringIO(text.lstrip("\ufeff")), delimiter=delimiter, quotechar='"')
    matrix = list(reader)
    matrix = [row for row in matrix if any(field.strip() for field in row)]
    if len(matrix) < 2:
        raise RequestError("Il CSV deve contenere intestazioni e almeno una riga di dati.")
    headers = [field.strip() or f"Colonna {index + 1}" for index, field in enumerate(matrix[0])]
    if len(set(headers)) != len(headers):
        raise RequestError("Le intestazioni CSV devono essere univoche.")
    if len(matrix) > MAX_ROWS + 1:
        raise RequestError(f"Il file supera il limite di {MAX_ROWS} righe.")
    rows = [
        {header: values[index].strip() if index < len(values) else "" for index, header in enumerate(headers)}
        for values in matrix[1:]
    ]
    return headers, rows


def _read_ml_dataset(payload: dict[str, Any]) -> tuple[str, list[str], list[dict[str, Any]]]:
    name = payload.get("name")
    encoded = payload.get("contentBase64")
    if not isinstance(name, str) or not name.strip() or len(name) > 180:
        raise RequestError("Nome file mancante o troppo lungo.")
    safe_name = name.replace("\\", "/").rsplit("/", 1)[-1]
    extension = Path(safe_name).suffix.lower()
    if extension not in {".csv", ".json", ".xlsx"}:
        raise RequestError("Usa un file CSV, JSON o XLSX.")
    if not isinstance(encoded, str) or not encoded:
        raise RequestError("Il file caricato non contiene dati.")
    try:
        content = base64.b64decode(encoded, validate=True)
    except (ValueError, base64.binascii.Error) as exc:
        raise RequestError("Il file non e codificato correttamente.") from exc
    if not content or len(content) > MAX_ML_DATASET_BYTES:
        raise RequestError("Il file deve essere piu piccolo di 2,5 MB.")

    try:
        if extension == ".csv":
            headers, rows = parse_csv(content.decode("utf-8-sig"))
        elif extension == ".json":
            parsed = json.loads(content.decode("utf-8-sig"))
            if not isinstance(parsed, list) or not parsed or any(
                not isinstance(row, dict) for row in parsed
            ):
                raise RequestError("Il JSON deve essere un array non vuoto di oggetti.")
            headers = list(dict.fromkeys(key for row in parsed for key in row))
            rows = [{header: row.get(header) for header in headers} for row in parsed]
        else:
            from openpyxl import load_workbook

            workbook = load_workbook(io.BytesIO(content), read_only=True, data_only=True)
            try:
                sheet = workbook.active
                if sheet.max_row is not None and sheet.max_row > MAX_ML_ROWS + 1:
                    raise RequestError(f"Il foglio supera il limite di {MAX_ML_ROWS} righe.")
                if sheet.max_column is not None and sheet.max_column > MAX_ML_COLUMNS:
                    raise RequestError(f"Il foglio supera il limite di {MAX_ML_COLUMNS} colonne.")
                matrix = list(sheet.iter_rows(values_only=True))
            finally:
                workbook.close()
            matrix = [list(row) for row in matrix if any(value is not None for value in row)]
            if len(matrix) < 2:
                raise RequestError("Il foglio XLSX deve contenere intestazioni e almeno una riga.")
            headers = [
                str(value).strip() if value is not None and str(value).strip() else f"Colonna {index + 1}"
                for index, value in enumerate(matrix[0])
            ]
            rows = [
                {header: values[index] if index < len(values) else None for index, header in enumerate(headers)}
                for values in matrix[1:]
            ]
    except RequestError:
        raise
    except Exception as exc:
        raise RequestError(f"Impossibile leggere il file {extension.upper()}: {type(exc).__name__}.") from exc

    if not headers or len(headers) > MAX_ML_COLUMNS:
        raise RequestError(f"Il dataset deve contenere da 1 a {MAX_ML_COLUMNS} colonne.")
    if len(set(headers)) != len(headers):
        raise RequestError("Le intestazioni del dataset devono essere univoche.")
    if not rows or len(rows) > MAX_ML_ROWS:
        raise RequestError(f"Il dataset deve contenere da 1 a {MAX_ML_ROWS} righe.")
    return safe_name, headers, rows


def preview_ml_dataset(payload: dict[str, Any]) -> dict[str, Any]:
    name, headers, rows = _read_ml_dataset(payload)
    columns = []
    for header in headers:
        values = [row.get(header) for row in rows]
        present = [value for value in values if value is not None and str(value).strip()]
        numeric_count = sum(parse_number(value) is not None for value in present)
        columns.append({
            "name": header,
            "kind": "numeric" if present and numeric_count / len(present) >= 0.8 else "category",
            "nonEmpty": len(present),
        })
    return {"name": name, "rows": len(rows), "columns": columns}


def train_tabular_model(payload: dict[str, Any]) -> dict[str, Any]:
    name, headers, rows = _read_ml_dataset(payload)
    task = payload.get("task")
    target = payload.get("target")
    features = payload.get("features")
    if task not in {"classification", "regression"}:
        raise RequestError("Seleziona classificazione o regressione.")
    if not isinstance(target, str) or target not in headers:
        raise RequestError("Seleziona una colonna obiettivo valida.")
    if not isinstance(features, list) or not features or len(features) > MAX_ML_COLUMNS:
        raise RequestError("Seleziona almeno una colonna predittiva.")
    if any(not isinstance(feature, str) or feature not in headers or feature == target for feature in features):
        raise RequestError("Le colonne predittive non sono valide o includono l'obiettivo.")
    if len(set(features)) != len(features):
        raise RequestError("Le colonne predittive non possono essere duplicate.")
    if len(rows) < 20:
        raise RequestError("Servono almeno 20 righe per creare un test di validazione.")

    usable_rows = [row for row in rows if row.get(target) is not None and str(row.get(target)).strip()]
    if len(usable_rows) < 20:
        raise RequestError("Dopo aver escluso gli obiettivi mancanti restano meno di 20 righe.")

    import numpy as np
    import warnings
    from sklearn.compose import ColumnTransformer
    from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
    from sklearn.exceptions import ConvergenceWarning
    from sklearn.impute import SimpleImputer
    from sklearn.linear_model import Ridge
    from sklearn.neural_network import MLPClassifier, MLPRegressor
    from sklearn.metrics import (
        accuracy_score,
        balanced_accuracy_score,
        confusion_matrix,
        f1_score,
        mean_absolute_error,
        mean_squared_error,
        r2_score,
    )
    from sklearn.model_selection import train_test_split
    from sklearn.pipeline import Pipeline
    from sklearn.preprocessing import OneHotEncoder, StandardScaler
    from sklearn.svm import LinearSVC

    numeric_features: list[str] = []
    categorical_features: list[str] = []
    for feature in features:
        values = [row.get(feature) for row in usable_rows]
        present = [value for value in values if value is not None and str(value).strip()]
        if not present:
            raise RequestError(f"La variabile predittiva {feature} non contiene valori.")
        numeric_count = sum(parse_number(value) is not None for value in present)
        if present and numeric_count / len(present) >= 0.8:
            numeric_features.append(feature)
        else:
            categorical_features.append(feature)

    matrix: list[list[Any]] = []
    for row in usable_rows:
        values: list[Any] = [parse_number(row.get(feature)) for feature in numeric_features]
        values.extend(
            str(row.get(feature)).strip() if row.get(feature) is not None and str(row.get(feature)).strip() else None
            for feature in categorical_features
        )
        matrix.append(values)
    matrix_feature_order = [*numeric_features, *categorical_features]
    if not numeric_features and not categorical_features:
        raise RequestError("Le colonne selezionate non contengono valori utilizzabili.")

    transformers = []
    if numeric_features:
        transformers.append((
            "numeric",
            Pipeline([
                ("imputer", SimpleImputer(strategy="median")),
                ("scaler", StandardScaler()),
            ]),
            list(range(len(numeric_features))),
        ))
    if categorical_features:
        transformers.append((
            "category",
            Pipeline([
                ("imputer", SimpleImputer(strategy="most_frequent")),
                ("encoder", OneHotEncoder(handle_unknown="ignore", max_categories=20)),
            ]),
            list(range(len(numeric_features), len(features))),
        ))
    preprocessor = ColumnTransformer(transformers, remainder="drop")
    x = np.asarray(matrix, dtype=object)

    if task == "classification":
        y = np.asarray([str(row[target]).strip() for row in usable_rows], dtype=str)
        classes, class_counts = np.unique(y, return_counts=True)
        if len(classes) < 2 or len(classes) > 15:
            raise RequestError("La classificazione richiede da 2 a 15 classi distinte.")
        if int(class_counts.min()) < 2:
            raise RequestError("Ogni classe deve avere almeno 2 esempi per separare addestramento e test.")
        test_size = max(0.2, len(classes) / len(y))
        x_train, x_test, y_train, y_test = train_test_split(
            x, y, test_size=test_size, random_state=42, stratify=y,
        )
        candidates = [
            ("Random Forest", RandomForestClassifier(
                n_estimators=100, max_depth=12, min_samples_leaf=2,
                class_weight="balanced", random_state=42, n_jobs=1,
            )),
            ("SVM lineare", LinearSVC(class_weight="balanced", max_iter=5000, random_state=42)),
            ("Rete neurale MLP", MLPClassifier(
                hidden_layer_sizes=(8, 4), max_iter=30, alpha=0.001,
                random_state=42,
            )),
        ]
    else:
        target_values = [parse_number(row[target]) for row in usable_rows]
        if any(value is None for value in target_values):
            raise RequestError("La regressione richiede una colonna obiettivo numerica senza valori non validi.")
        y = np.asarray(target_values, dtype=float)
        x_train, x_test, y_train, y_test = train_test_split(
            x, y, test_size=0.2, random_state=42,
        )
        candidates = [
            ("Random Forest", RandomForestRegressor(
                n_estimators=100, max_depth=12, min_samples_leaf=2, random_state=42, n_jobs=1,
            )),
            ("Ridge", Ridge(alpha=1.0)),
            ("Rete neurale MLP", MLPRegressor(
                hidden_layer_sizes=(8, 4), max_iter=30, alpha=0.001,
                random_state=42,
            )),
        ]

    model_results = []
    fitted_models = []
    mlp_convergence_warning = False
    for model_name, estimator in candidates:
        pipeline = Pipeline([
            ("preprocessor", preprocessor),
            ("model", estimator),
        ])
        with warnings.catch_warnings(record=True) as caught_warnings:
            warnings.simplefilter("always", ConvergenceWarning)
            pipeline.fit(x_train, y_train)
        if any(issubclass(item.category, ConvergenceWarning) for item in caught_warnings):
            mlp_convergence_warning = True
        predicted = pipeline.predict(x_test)
        if task == "classification":
            model_results.append({
                "name": model_name,
                "accuracy": float(accuracy_score(y_test, predicted)),
                "balancedAccuracy": float(balanced_accuracy_score(y_test, predicted)),
                "macroF1": float(f1_score(y_test, predicted, average="macro", zero_division=0)),
                "confusionMatrix": confusion_matrix(y_test, predicted, labels=classes).tolist(),
            })
        else:
            model_results.append({
                "name": model_name,
                "r2": float(r2_score(y_test, predicted)),
                "mae": float(mean_absolute_error(y_test, predicted)),
                "rmse": float(mean_squared_error(y_test, predicted) ** 0.5),
            })
        fitted_models.append((model_name, pipeline))

    if task == "classification":
        best_index = max(
            range(len(model_results)),
            key=lambda index: (model_results[index]["macroF1"], model_results[index]["balancedAccuracy"]),
        )
        class_labels = [str(value) for value in classes.tolist()]
    else:
        best_index = min(range(len(model_results)), key=lambda index: model_results[index]["mae"])
        class_labels = []

    best_name, best_pipeline = fitted_models[best_index]
    feature_importance = []
    forest_pipeline = next(
        pipeline for model_name, pipeline in fitted_models if model_name == "Random Forest"
    )
    model = forest_pipeline.named_steps["model"]
    if hasattr(model, "feature_importances_"):
        encoded_names = forest_pipeline.named_steps["preprocessor"].get_feature_names_out()
        aggregated: dict[str, float] = {}
        for encoded_name, importance in zip(encoded_names, model.feature_importances_):
            transformed_name = encoded_name.split("__", 1)[-1]
            encoded_index = re.match(r"x(\d+)(?:_|$)", transformed_name)
            raw_feature = (
                matrix_feature_order[int(encoded_index.group(1))]
                if encoded_index and int(encoded_index.group(1)) < len(matrix_feature_order)
                else transformed_name
            )
            aggregated[raw_feature] = aggregated.get(raw_feature, 0.0) + float(importance)
        feature_importance = [
            {"name": feature, "importance": importance}
            for feature, importance in sorted(aggregated.items(), key=lambda item: item[1], reverse=True)[:8]
        ]

    return {
        "fileName": name,
        "task": task,
        "target": target,
        "featureCount": len(features),
        "rowCount": len(rows),
        "usableRows": len(usable_rows),
        "trainRows": len(x_train),
        "testRows": len(x_test),
        "models": model_results,
        "bestModel": best_name,
        "classLabels": class_labels,
        "featureImportance": feature_importance,
        "warnings": [
            "Metriche calcolate su un singolo split casuale 80/20; non sono una validazione indipendente.",
            "La rete MLP e un modello neurale tabellare leggero, addestrato entro limiti CPU; non equivale a CNN o a un modello di deep learning per immagini.",
            "Le associazioni predittive non dimostrano causalita; controlla leakage, sbilanciamento e qualita delle etichette.",
        ] + (["La rete MLP non ha raggiunto la convergenza entro il limite CPU; interpreta le sue metriche con cautela."] if mlp_convergence_warning else []),
    }


def normalize_source_date(value: Any) -> str:
    text = str(value or "").strip()
    if re.fullmatch(r"\d{8}", text):
        return f"{text[:4]}-{text[4:6]}-{text[6:]}"
    if re.fullmatch(r"\d{4}", text):
        return f"{text}-01-01"
    if re.fullmatch(r"\d{4}-\d{2}", text):
        return f"{text}-01"
    return text[:10]


def _validate_public_url(url: str) -> urllib.parse.SplitResult:
    parsed = urllib.parse.urlsplit(url)
    if parsed.scheme not in {"https", "http"} or not parsed.hostname:
        raise RequestError("Sono accettati solo URL HTTP o HTTPS.")
    if parsed.username or parsed.password:
        raise RequestError("Gli URL con credenziali incorporate non sono consentiti.")
    try:
        port = parsed.port or (443 if parsed.scheme == "https" else 80)
    except ValueError as exc:
        raise RequestError("Porta URL non valida.") from exc
    expected_port = 443 if parsed.scheme == "https" else 80
    if port != expected_port:
        raise RequestError("Sono consentite solo connessioni web standard (porte 80/443).")
    try:
        addresses = socket.getaddrinfo(parsed.hostname, port, type=socket.SOCK_STREAM)
    except socket.gaierror as exc:
        raise RequestError("Il dominio dell'URL non e raggiungibile.") from exc
    if not addresses:
        raise RequestError("Il dominio dell'URL non ha indirizzi pubblici.")
    for address in addresses:
        ip = ipaddress.ip_address(address[4][0])
        if not ip.is_global:
            raise RequestError("Per sicurezza, l'URL deve puntare a un host pubblico.")
    return parsed


class PublicRedirectHandler(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, response, code, message, headers, new_url):
        _validate_public_url(new_url)
        return super().redirect_request(request, response, code, message, headers, new_url)


def open_public_url(url: str, accept: str = "*/*", timeout: int = TIMEOUT):
    _validate_public_url(url)
    opener = urllib.request.build_opener(PublicRedirectHandler)
    request = urllib.request.Request(url, headers={"User-Agent": "DataInsightLocal/1.0", "Accept": accept})
    try:
        return opener.open(request, timeout=timeout)
    except urllib.error.HTTPError as exc:
        raise RequestError(f"La fonte ha risposto con HTTP {exc.code}.") from exc
    except (urllib.error.URLError, TimeoutError) as exc:
        raise RequestError(f"Connessione alla fonte non riuscita: {exc.reason if isinstance(exc, urllib.error.URLError) else 'timeout'}.") from exc


def read_limited(response, limit: int = MAX_BODY) -> bytes:
    length = response.headers.get("Content-Length")
    if length and int(length) > limit:
        raise RequestError("La risposta supera il limite di dimensione consentito.")
    chunks = []
    total = 0
    while True:
        chunk = response.read(min(65536, limit + 1 - total))
        if not chunk:
            break
        chunks.append(chunk)
        total += len(chunk)
        if total > limit:
            raise RequestError("La risposta supera il limite di dimensione consentito.")
    return b"".join(chunks)


def fetch_source(payload: dict[str, Any]) -> dict[str, Any]:
    provider = payload.get("provider")
    if provider not in PROVIDERS:
        raise RequestError("Fonte dati non riconosciuta.")
    spec = PROVIDERS[provider]
    indicator = payload.get("indicator")
    if indicator not in spec["indicators"]:
        raise RequestError("Indicatore non consentito per la fonte selezionata.")
    start = parse_iso_date(payload.get("start"), "Data iniziale")
    end = parse_iso_date(payload.get("end"), "Data finale")
    if start > end:
        raise RequestError("La data iniziale deve precedere quella finale.")
    params: dict[str, str]
    if provider == "nasa":
        latitude = parse_number(payload.get("latitude"))
        longitude = parse_number(payload.get("longitude"))
        if latitude is None or not -90 <= latitude <= 90 or longitude is None or not -180 <= longitude <= 180:
            raise RequestError("Coordinate NASA non valide.")
        params = {
            "parameters": "T2M",
            "community": "RE",
            "longitude": str(longitude),
            "latitude": str(latitude),
            "start": start.strftime("%Y%m%d"),
            "end": end.strftime("%Y%m%d"),
            "format": "JSON",
        }
        url = f"{spec['base']}?{urllib.parse.urlencode(params)}"
        with open_public_url(url, "application/json") as response:
            data = json.loads(read_limited(response))
        values = data.get("properties", {}).get("parameter", {}).get("T2M", {})
        rows = [{"date": normalize_source_date(day), "value": number} for day, raw in values.items()
                if (number := parse_number(raw)) is not None and number != -999]
        label = f"{spec['name']} T2M ({latitude}, {longitude})"
    elif provider == "ecb":
        params = {"startPeriod": start.isoformat(), "endPeriod": end.isoformat(), "format": "csvdata"}
        url = f"{spec['base']}?{urllib.parse.urlencode(params)}"
        with open_public_url(url, "text/csv") as response:
            text = read_limited(response).decode("utf-8-sig")
        headers, records = parse_csv(text)
        if "TIME_PERIOD" not in headers or "OBS_VALUE" not in headers:
            raise RequestError("Formato CSV BCE non riconosciuto.")
        rows = [{"date": normalize_source_date(record["TIME_PERIOD"]), "value": number}
                for record in records if (number := parse_number(record["OBS_VALUE"])) is not None]
        label = f"{spec['name']} {spec['indicators'][indicator][0]}"
    elif provider == "worldbank":
        country = str(payload.get("country", "ITA")).strip().upper()
        if not re.fullmatch(r"[A-Z]{3}", country):
            raise RequestError("Inserisci un codice paese ISO-3 valido (es. ITA o USA).")
        params = {"date": f"{start.year}:{end.year}", "format": "json", "per_page": "1000"}
        url = f"{spec['base']}/{country}/indicator/{urllib.parse.quote(indicator)}?{urllib.parse.urlencode(params)}"
        with open_public_url(url, "application/json") as response:
            data = json.loads(read_limited(response))
        if not isinstance(data, list) or len(data) < 2 or not isinstance(data[1], list):
            raise RequestError("Risposta API Banca Mondiale non riconosciuta o senza dati.")
        rows = [{"date": normalize_source_date(item.get("date")), "value": number}
                for item in data[1] if (number := parse_number(item.get("value"))) is not None]
        rows.sort(key=lambda row: row["date"])
        label = f"{spec['name']} {spec['indicators'][indicator][0]} · {country}"
    else:
        params = {
            "geo": "IT",
            "sex": "T",
            "age": "TOTAL",
            "unit": "NR",
            "sinceTimePeriod": str(start.year),
            "format": "JSON",
        }
        url = f"{spec['base']}?{urllib.parse.urlencode(params)}"
        with open_public_url(url, "application/json") as response:
            data = json.loads(read_limited(response))
        times = data.get("dimension", {}).get("time", {}).get("category", {}).get("index")
        values = data.get("value")
        if not isinstance(times, dict) or not isinstance(values, dict):
            raise RequestError("Formato JSON-stat Eurostat non riconosciuto.")
        rows = [{"date": normalize_source_date(period), "value": number}
                for period, index in sorted(times.items(), key=lambda item: item[1])
                if (number := parse_number(values.get(str(index), values.get(index)))) is not None]
        label = f"{spec['name']} {spec['indicators'][indicator][0]} · IT"
    rows = [row for row in rows if row["date"] and start.isoformat() <= row["date"] <= end.isoformat()]
    if not rows:
        raise RequestError("La fonte non ha dati validi per l'intervallo selezionato.")
    unit = spec["indicators"][indicator][1]
    return {"name": label, "unit": unit, "source": spec["name"], "rows": rows, "url": url}


def _fit(rows: list[dict[str, Any]]) -> tuple[float, float] | None:
    if len(rows) < 2:
        return None
    values = [float(row["value"]) for row in rows]
    mean_x = (len(values) - 1) / 2
    mean_y = sum(values) / len(values)
    denominator = sum((index - mean_x) ** 2 for index in range(len(values)))
    slope = sum((index - mean_x) * (value - mean_y) for index, value in enumerate(values)) / denominator if denominator else 0
    return slope, mean_y - slope * mean_x


def _future_date(rows: list[dict[str, Any]], step: int) -> str:
    last_text = str(rows[-1]["date"])
    if re.fullmatch(r"\d{4}", last_text):
        return str(int(last_text) + step)
    last = date.fromisoformat(last_text)
    sample_dates = [date.fromisoformat(row["date"]) for row in rows]
    if sample_dates and all(item.weekday() < 5 for item in sample_dates):
        cursor = last
        remaining = step
        while remaining:
            cursor += timedelta(days=1)
            if cursor.weekday() < 5:
                remaining -= 1
        return cursor.isoformat()
    intervals = [(date.fromisoformat(rows[i]["date"]) - date.fromisoformat(rows[i - 1]["date"])).days
                 for i in range(1, len(rows))]
    intervals = sorted(days for days in intervals if days > 0)
    median = intervals[len(intervals) // 2] if intervals else 1
    if median >= 300:
        try:
            return last.replace(year=last.year + step).isoformat()
        except ValueError:
            return last.replace(year=last.year + step, day=28).isoformat()
    if 27 <= median <= 32:
        month = last.month - 1 + step
        year = last.year + month // 12
        month = month % 12 + 1
        return last.replace(year=year, month=month, day=1).isoformat()
    return (last + timedelta(days=median * step)).isoformat()


def _correlation(first: list[dict[str, Any]], second: list[dict[str, Any]]) -> tuple[float, int] | None:
    second_by_date = {row["date"]: float(row["value"]) for row in second}
    pairs = [(float(row["value"]), second_by_date[row["date"]]) for row in first if row["date"] in second_by_date]
    if len(pairs) < 3:
        return None
    mean_a = sum(pair[0] for pair in pairs) / len(pairs)
    mean_b = sum(pair[1] for pair in pairs) / len(pairs)
    covariance = sum((a - mean_a) * (b - mean_b) for a, b in pairs)
    denom_a = math.sqrt(sum((a - mean_a) ** 2 for a, _ in pairs))
    denom_b = math.sqrt(sum((b - mean_b) ** 2 for _, b in pairs))
    return (covariance / denom_a / denom_b, len(pairs)) if denom_a and denom_b else None


def _solve(matrix: list[list[float]], vector: list[float]) -> list[float] | None:
    size = len(vector)
    augmented = [row[:] + [vector[index]] for index, row in enumerate(matrix)]
    scale = max((abs(value) for row in matrix for value in row), default=0.0)
    if not scale:
        return None
    for column in range(size):
        pivot = max(range(column, size), key=lambda row: abs(augmented[row][column]))
        if abs(augmented[pivot][column]) <= scale * 1e-12:
            return None
        augmented[column], augmented[pivot] = augmented[pivot], augmented[column]
        divisor = augmented[column][column]
        augmented[column] = [value / divisor for value in augmented[column]]
        for row in range(size):
            if row == column:
                continue
            factor = augmented[row][column]
            augmented[row] = [
                value - factor * pivot_value
                for value, pivot_value in zip(augmented[row], augmented[column])
            ]
    return [augmented[index][-1] for index in range(size)]


def _factor_model(series: list[tuple[str, list[dict[str, Any]], str]], target_index: int):
    if len(series) < 2:
        return None
    if not 0 <= target_index < len(series):
        raise RequestError("Variabile obiettivo non valida.")
    target_name, target_rows, target_unit = series[target_index]
    feature_series = [item for index, item in enumerate(series) if index != target_index]
    values_by_date = [
        {row["date"]: float(row["value"]) for row in item[1]}
        for item in feature_series
    ]
    target_by_date = {row["date"]: float(row["value"]) for row in target_rows}
    dates = sorted(set(target_by_date).intersection(*(set(values) for values in values_by_date)))
    predictor_count = len(feature_series)
    if len(dates) <= predictor_count + 1:
        return {
            "target": target_name,
            "count": len(dates),
            "coefficients": [],
            "r2": None,
            "warning": "Servono piu date comuni dei fattori selezionati per stimare un modello multivariato.",
        }
    feature_means = [
        sum(values[day] for day in dates) / len(dates)
        for values in values_by_date
    ]
    feature_scales = [
        math.sqrt(sum((values[day] - mean) ** 2 for day in dates) / len(dates))
        for values, mean in zip(values_by_date, feature_means)
    ]
    if any(scale == 0 for scale in feature_scales):
        return {
            "target": target_name,
            "count": len(dates),
            "coefficients": [],
            "r2": None,
            "warning": "Un fattore e costante sulle date comuni; modello multivariato non identificabile.",
        }
    design = [
        [1.0] + [
            (values[day] - feature_means[index]) / feature_scales[index]
            for index, values in enumerate(values_by_date)
        ]
        for day in dates
    ]
    target_values = [target_by_date[day] for day in dates]
    target_mean = sum(target_values) / len(target_values)
    matrix = [
        [sum(row[left] * row[right] for row in design) for right in range(predictor_count + 1)]
        for left in range(predictor_count + 1)
    ]
    vector = [
        sum(design[row][column] * target_values[row] for row in range(len(dates)))
        for column in range(predictor_count + 1)
    ]
    coefficients = _solve(matrix, vector)
    if coefficients is None:
        return {
            "target": target_name,
            "count": len(dates),
            "coefficients": [],
            "r2": None,
            "warning": "Fattori fortemente collineari: non e possibile isolare in modo stabile le associazioni.",
        }
    predictions = [
        sum(weight * value for weight, value in zip(coefficients, row))
        for row in design
    ]
    residual_sum = sum((actual - predicted) ** 2 for actual, predicted in zip(target_values, predictions))
    total_sum = sum((actual - target_mean) ** 2 for actual in target_values)
    r2 = 1 - residual_sum / total_sum if total_sum else None
    effects = []
    for index, item in enumerate(feature_series):
        effects.append({
            "name": item[0],
            "unit": item[2],
            "coefficientPerStd": coefficients[index + 1],
            "stdDev": feature_scales[index],
            "direction": "associazione positiva" if coefficients[index + 1] > 0 else "associazione negativa" if coefficients[index + 1] < 0 else "associazione nulla",
        })
    return {
        "target": target_name,
        "targetUnit": target_unit,
        "count": len(dates),
        "coefficients": effects,
        "r2": r2,
        "warning": "Coefficienti associativi condizionati agli altri fattori selezionati; non dimostrano causalita e possono essere instabili con pochi dati o variabili collineari.",
    }


def analyze(payload: dict[str, Any]) -> dict[str, Any]:
    series = payload.get("series")
    if not isinstance(series, list) or not series or len(series) > 30:
        raise RequestError("Invia da 1 a 30 serie per l'analisi.")
    forecast_steps = payload.get("forecastSteps", 5)
    backtest_steps = payload.get("backtestSteps", 3)
    if not isinstance(forecast_steps, int) or not 0 <= forecast_steps <= 20:
        raise RequestError("Passi futuri non validi (intervallo 0–20).")
    if not isinstance(backtest_steps, int) or not 0 <= backtest_steps <= 10:
        raise RequestError("Punti di verifica non validi (intervallo 0–10).")
    target_index = payload.get("targetIndex", 0)
    if not isinstance(target_index, int) or isinstance(target_index, bool) or not 0 <= target_index < len(series):
        raise RequestError("Variabile obiettivo non valida.")
    reports = []
    normalized_series = []
    normalized_target_index = None
    for original_index, item in enumerate(series):
        if not isinstance(item, dict) or not isinstance(item.get("rows"), list) or len(item["rows"]) > MAX_ROWS:
            raise RequestError("Struttura della serie non valida o troppo grande.")
        rows = []
        for record in item["rows"]:
            if not isinstance(record, dict):
                continue
            timestamp = str(record.get("date", ""))
            value = parse_number(record.get("value"))
            try:
                date.fromisoformat(timestamp)
            except ValueError:
                continue
            if value is not None:
                rows.append({"date": timestamp, "value": value})
        rows.sort(key=lambda row: row["date"])
        if not rows:
            continue
        fit = _fit(rows)
        forecast = []
        if fit:
            slope, intercept = fit
            forecast = [
                {"date": _future_date(rows, step), "value": intercept + slope * (len(rows) - 1 + step)}
                for step in range(1, forecast_steps + 1)
            ]
        holdout = min(backtest_steps, max(0, len(rows) - 2))
        validation = []
        if holdout:
            historical_fit = _fit(rows[:-holdout])
            if historical_fit:
                slope, intercept = historical_fit
                validation = [
                    {"date": row["date"], "actual": row["value"], "predicted": intercept + slope * (len(rows) - holdout + index)}
                    for index, row in enumerate(rows[-holdout:])
                ]
        errors = [abs(row["actual"] - row["predicted"]) for row in validation]
        mae = sum(errors) / len(errors) if errors else None
        percentages = [abs((row["actual"] - row["predicted"]) / row["actual"]) * 100
                       for row in validation if row["actual"] != 0]
        mape = sum(percentages) / len(percentages) if percentages else None
        first, last = rows[0], rows[-1]
        change = ((last["value"] - first["value"]) / abs(first["value"]) * 100) if first["value"] else None
        direction = "crescente" if fit and fit[0] > 0 else "decrescente" if fit and fit[0] < 0 else "quasi stabile" if fit else "non stimabile"
        report = {
            "name": str(item.get("name", "Serie")),
            "unit": str(item.get("unit", "unita")),
            "source": str(item.get("source", "File/URL")),
            "count": len(rows),
            "firstDate": first["date"],
            "lastDate": last["date"],
            "slope": fit[0] if fit else None,
            "direction": direction,
            "changePercent": change,
            "forecast": forecast,
            "validation": validation,
            "mae": mae,
            "mape": mape,
            "correlations": [],
            "warnings": [],
        }
        if len(rows) < 5:
            report["warnings"].append("Pochi punti per una proiezione affidabile.")
        if len(rows) < 2:
            report["warnings"].append("Impossibile stimare un trend con meno di due dati.")
        if mape is not None and mape > 20:
            report["warnings"].append("Errore percentuale di verifica elevato; interpretare la proiezione con cautela.")
        if forecast:
            report["warnings"].append("Estrapolazione lineare sensibile a shock, stagionalita e cambi di regime.")
        reports.append(report)
        if original_index == target_index:
            normalized_target_index = len(normalized_series)
        normalized_series.append((report["name"], rows, report["unit"]))
    if not reports:
        raise RequestError("Nessuna osservazione valida da analizzare.")
    if normalized_target_index is None:
        raise RequestError("La variabile obiettivo non contiene osservazioni valide.")
    correlations = []
    for left in range(len(normalized_series)):
        for right in range(left + 1, len(normalized_series)):
            result = _correlation(normalized_series[left][1], normalized_series[right][1])
            if result:
                correlations.append({
                    "first": normalized_series[left][0],
                    "second": normalized_series[right][0],
                    "r": result[0],
                    "count": result[1],
                    "interpretation": "Associazione osservata sulle date comuni; non implica causalita.",
                })
    factor_model = _factor_model(normalized_series, normalized_target_index) if len(normalized_series) > 1 else None
    return {
        "question": str(payload.get("question", ""))[:1000],
        "reports": reports,
        "correlations": correlations,
        "factorModel": factor_model,
        "disclaimer": "Valutazione statistica locale in Python, non un agente LLM. Le correlazioni non dimostrano causalita; le proiezioni lineari non sono previsioni certificate.",
    }


def import_url(payload: dict[str, Any]) -> dict[str, str]:
    url = payload.get("url")
    if not isinstance(url, str) or len(url) > 4096:
        raise RequestError("Inserisci un URL valido (massimo 4096 caratteri).")
    parsed = _validate_public_url(url)
    if parsed.path.lower().endswith((".exe", ".zip", ".gz", ".tar", ".pdf")):
        raise RequestError("Carica un dataset CSV o JSON, non un archivio o un documento.")
    with open_public_url(url, "text/csv, application/json, text/plain") as response:
        content = read_limited(response).decode("utf-8-sig")
        name = Path(urllib.parse.unquote(parsed.path)).name or parsed.hostname or "dataset"
    if not content.strip():
        raise RequestError("Il dataset remoto e vuoto.")
    return {"name": name, "content": content}


def merge_ml_sources(payload: dict[str, Any]) -> dict[str, Any]:
    documents = payload.get("documents", [])
    urls = payload.get("urls", [])
    if not isinstance(documents, list) or not isinstance(urls, list):
        raise RequestError("File e URL devono essere elenchi.")
    if len(documents) > MAX_ML_SOURCES or len(urls) > MAX_ML_SOURCES:
        raise RequestError(f"Puoi combinare al massimo {MAX_ML_SOURCES} file e {MAX_ML_SOURCES} URL.")
    if not documents and not urls:
        raise RequestError("Aggiungi almeno una tabella CSV, JSON o XLSX.")

    datasets = []
    total_bytes = 0
    for document in documents:
        if not isinstance(document, dict) or not isinstance(document.get("contentBase64"), str):
            raise RequestError("File tabellare non valido.")
        try:
            content = base64.b64decode(document["contentBase64"], validate=True)
        except (ValueError, base64.binascii.Error) as exc:
            raise RequestError("Un file tabellare non e codificato correttamente.") from exc
        total_bytes += len(content)
        if total_bytes > MAX_ML_DATASET_BYTES:
            raise RequestError("La dimensione complessiva delle tabelle supera 2,5 MB.")
        datasets.append(_read_ml_dataset(document))

    for url in urls:
        if not isinstance(url, str) or len(url) > 2048:
            raise RequestError("URL dataset non valido o troppo lungo.")
        parsed = _validate_public_url(url)
        extension = Path(urllib.parse.unquote(parsed.path)).suffix.lower()
        if extension not in {".csv", ".json"}:
            raise RequestError("Per il training, gli URL devono puntare direttamente a file CSV o JSON.")
        remaining = MAX_ML_DATASET_BYTES - total_bytes
        if remaining <= 0:
            raise RequestError("La dimensione complessiva delle tabelle supera 2,5 MB.")
        with open_public_url(url, "text/csv, application/json, text/plain") as response:
            content_type = response.headers.get_content_type()
            accepted_types = {"text/csv", "text/plain"} if extension == ".csv" else {"application/json", "text/json", "text/plain"}
            if content_type not in accepted_types:
                raise RequestError("Il tipo di contenuto dell'URL non corrisponde a un dataset CSV/JSON.")
            content = read_limited(response, remaining)
        if not content.strip():
            raise RequestError("Un URL dataset non contiene dati.")
        total_bytes += len(content)
        name = Path(urllib.parse.unquote(parsed.path)).name or f"dataset{extension}"
        datasets.append(_read_ml_dataset({
            "name": name,
            "contentBase64": base64.b64encode(content).decode("ascii"),
        }))

    headers = datasets[0][1]
    merged_rows = []
    for _, source_headers, source_rows in datasets:
        if len(source_headers) != len(headers) or set(source_headers) != set(headers):
            raise RequestError("Le tabelle hanno colonne diverse: per combinarle devono avere le stesse intestazioni.")
        merged_rows.extend({header: row.get(header) for header in headers} for row in source_rows)
        if len(merged_rows) > MAX_ML_ROWS:
            raise RequestError(f"La tabella combinata supera il limite di {MAX_ML_ROWS} righe.")

    content = json.dumps(merged_rows, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    if len(content) > MAX_ML_DATASET_BYTES:
        raise RequestError("La tabella combinata supera il limite di 2,5 MB.")
    return {
        "name": f"merged-{len(datasets)}-sources.json",
        "contentBase64": base64.b64encode(content).decode("ascii"),
        "sourceCount": len(datasets),
        "rows": len(merged_rows),
        "columns": headers,
    }


def recommend_sources(payload: dict[str, Any]) -> dict[str, Any]:
    query = payload.get("query")
    if not isinstance(query, str) or not query.strip() or len(query) > 1000:
        raise RequestError("Descrivi la domanda di analisi (massimo 1000 caratteri).")
    query = query.strip()
    normalized = unicodedata.normalize("NFKD", query).encode("ascii", "ignore").decode("ascii").lower()
    normalized = re.sub(r"[^a-z0-9.,]+", " ", normalized)
    has = lambda *terms: any(term in normalized for term in terms)
    remote_sensing = has(
        "remote sens", "telerilev", "satellit", "imagery", "image", "earth observation",
        "osservazione della terra", "computer vision", "vision comput", "random forest",
        "support vector", "deep learning", "machine learning", "geospatial", "geospazial",
        "gis", "civil engineering", "civil engineer", "environment", "ambient",
        "ndvi", "sentinel", "landsat", "raster",
    ) or bool(re.search(r"\b(?:ml|rf|svm|u-net)\b", normalized))
    references: list[dict[str, str]] = []
    specialized = None
    if remote_sensing:
        references = [
            {
                "label": "Copernicus Data Space · Browser Sentinel",
                "url": "https://browser.dataspace.copernicus.eu/",
                "reason": "Esplora e visualizza immagini Sentinel; scegli area, date, bande e nuvolosita. Il download puo richiedere un account.",
            },
            {
                "label": "Copernicus Data Space · API e catalogo",
                "url": "https://documentation.dataspace.copernicus.eu/APIs.html",
                "reason": "Documentazione ufficiale per cercare e accedere ai dati Sentinel tramite API e catalogo STAC.",
            },
            {
                "label": "USGS EarthExplorer · Landsat",
                "url": "https://earthexplorer.usgs.gov/",
                "reason": "Ricerca di scene Landsat per area e periodo; verifica prodotto, risoluzione e condizioni di accesso.",
            },
            {
                "label": "NASA Earthdata Search",
                "url": "https://search.earthdata.nasa.gov/",
                "reason": "Catalogo NASA per prodotti di osservazione della Terra, inclusi dati ambientali e satellitari.",
            },
            {
                "label": "Copernicus Land Monitoring Service",
                "url": "https://land.copernicus.eu/",
                "reason": "Prodotti ufficiali europei su copertura del suolo, cambiamento, vegetazione e territorio.",
            },
        ]
        specialized = {
            "title": "Percorso operativo: telerilevamento ambientale",
            "workflow": [
                "Definisci fenomeno, area di studio, periodo e scala: per esempio copertura del suolo, stress della vegetazione, alluvioni o espansione urbana.",
                "Seleziona Sentinel-2 o Landsat in base a risoluzione, bande, periodo e disponibilita; filtra nuvole e controlla CRS e qualita delle scene.",
                "Prepara etichette verificate a terra e feature spettrali o indici come NDVI, NDWI e NDBI; documenta sensore e preprocessing.",
                "Confronta il modello con baseline semplici e valida su aree o date non usate per l'addestramento, evitando leakage spaziale.",
            ],
            "methods": [
                {
                    "name": "Random Forest (RF)",
                    "use": "Baseline supervisionata per classificazione della copertura del suolo o del pixel usando bande e indici.",
                    "needs": "Feature spettrali e campioni etichettati rappresentativi; gestisci squilibrio fra classi.",
                    "validation": "Matrice di confusione, F1 per classe e split spaziale indipendente.",
                },
                {
                    "name": "Support Vector Machine (SVM)",
                    "use": "Classificazione supervisionata di feature spettrali, spesso utile come confronto con campioni etichettati limitati.",
                    "needs": "Feature normalizzate, scelta e tuning del kernel e campioni di training rappresentativi.",
                    "validation": "Ricerca degli iperparametri solo sul training e test su aree o date separate.",
                },
                {
                    "name": "U-Net / segmentazione semantica",
                    "use": "Riconoscimento di classi pixel-per-pixel e oggetti ambientali in raster o immagini.",
                    "needs": "Tile raster coerenti e maschere annotate; richiede una pipeline deep learning e risorse di calcolo.",
                    "validation": "IoU e F1 per classe su tile di aree non viste.",
                },
            ],
            "limitations": [
                "Il benchmark EuroSAT allena RF e SVM lineare su chip RGB e non e una mappa territoriale; per l'AOI e disponibile il workflow Sentinel-2 separato qui sotto.",
                "Il workflow AOI crea una classificazione a 10 m usando come etichette ESA WorldCover 2021; non sostituisce rilievi a terra o una verifica indipendente.",
                "Le metriche dell'AOI misurano l'accordo con WorldCover su blocchi spaziali esclusi dal training; non sono accuratezza di campo e la differenza temporale puo alterare le classi.",
            ],
            "projectReply": (
                "Good evening, and thank you for sharing your research interests. This demo now includes an executable Sentinel-2 L2A area workflow: it selects a public scene, applies the SCL cloud mask, derives spectral indices, compares Random Forest and SVM using spatially held-out blocks, and exports a 10 m GeoTIFF. "
                "Its current reference labels are ESA WorldCover 2021, so the resulting accuracy measures agreement with that map rather than independent field truth; the output must be verified before scientific or operational use. "
                "A separate EuroSAT RGB benchmark is available for a reproducible chip-level comparison. Which environmental target and study area should be evaluated?"
            ),
        }
    elif has("clima", "climat", "temperatur", "meteo", "siccita", "drought", "temperature"):
        references = [
            {
                "label": "NASA POWER · documentazione API",
                "url": "https://power.larc.nasa.gov/docs/services/api/temporal/daily/",
                "reason": "Serie meteorologiche e climatiche grigliate, con accesso per coordinate; la demo collega la temperatura giornaliera.",
            }
        ]
    if not references:
        references = [
            {"label": "Eurostat · catalogo dati", "url": "https://ec.europa.eu/eurostat/data/database", "reason": "Catalogo ufficiale UE; verifica definizioni e copertura."},
            {"label": "data.europa.eu", "url": "https://data.europa.eu/", "reason": "Portale per cercare dataset delle istituzioni UE."},
        ]
    return {
        "query": query,
        "connectors": [],
        "references": references,
        "specialized": specialized,
        "execution": {
            "title": "Passaggio eseguibile in questa demo",
            "dataset": "EuroSAT RGB · 10 classi di chip Sentinel-2 etichettati",
            "action": "remote-sensing-benchmark",
            "scope": "Confronto riproducibile Random Forest vs SVM lineare con test separato, metriche per classe e CSV delle predizioni.",
            "boundary": "Non produce una mappa territoriale: non usa l'area o le date indicate nella richiesta.",
            "geospatialAction": "sentinel-aoi-map",
            "geospatialScope": "Workflow Sentinel-2 multispettrale con classificazione RF/SVM, validazione spaziale e GeoTIFF per l'AOI impostata nel pannello.",
        } if specialized else None,
        "note": "L'assistente usa regole metodologiche esplicite e collega due workflow realmente eseguibili: benchmark EuroSAT e classificazione Sentinel-2 su AOI. L'area e il periodo vanno impostati nel pannello prima dell'elaborazione.",
    }


def analyze_document(payload: dict[str, Any]) -> dict[str, Any]:
    name = payload.get("name")
    encoded = payload.get("contentBase64")
    query = payload.get("query", "")
    if not isinstance(name, str) or not name.strip() or len(name) > 180:
        raise RequestError("Nome documento mancante o troppo lungo.")
    safe_name = name.replace("\\", "/").rsplit("/", 1)[-1]
    if not safe_name or safe_name in {".", ".."}:
        raise RequestError("Nome documento non valido.")
    if not isinstance(encoded, str) or not encoded:
        raise RequestError("Il documento caricato non contiene dati.")
    if not isinstance(query, str) or len(query) > 1000:
        raise RequestError("La domanda deve contenere al massimo 1000 caratteri.")
    extension = Path(safe_name).suffix.lower()
    supported = {".pdf", ".docx", ".xlsx", ".csv", ".json", ".txt", ".md"}
    if extension not in supported:
        raise RequestError("Formato documento non supportato. Usa PDF, DOCX, XLSX, CSV, JSON, TXT o MD.")
    try:
        content = base64.b64decode(encoded, validate=True)
    except (ValueError, base64.binascii.Error) as exc:
        raise RequestError("Il documento non e codificato correttamente.") from exc
    if not content or len(content) > MAX_DOCUMENT_BYTES:
        raise RequestError("Ogni documento deve essere piu piccolo di 7 MB.")

    text = ""
    metadata: dict[str, Any] = {}
    try:
        if extension in {".docx", ".xlsx"}:
            with zipfile.ZipFile(io.BytesIO(content)) as archive:
                entries = archive.infolist()
                if len(entries) > 1000 or sum(entry.file_size for entry in entries) > 40 * 1024 * 1024:
                    raise RequestError("Il documento compresso supera i limiti di elaborazione.")
        if extension in {".txt", ".md", ".csv"}:
            text = content.decode("utf-8-sig")
        elif extension == ".json":
            parsed = json.loads(content.decode("utf-8-sig"))
            text = json.dumps(parsed, ensure_ascii=False, indent=2)
        elif extension == ".pdf":
            from pypdf import PdfReader

            reader = PdfReader(io.BytesIO(content), strict=True)
            if reader.is_encrypted:
                raise RequestError("Il PDF e protetto da password e non puo essere analizzato.")
            if len(reader.pages) > 60:
                raise RequestError("Il PDF supera il limite di 60 pagine.")
            text = "\n\n".join(page.extract_text() or "" for page in reader.pages)
            metadata["pageCount"] = len(reader.pages)
        elif extension == ".docx":
            from docx import Document

            document = Document(io.BytesIO(content))
            paragraphs = [paragraph.text for paragraph in document.paragraphs if paragraph.text.strip()]
            tables = [
                "\n".join(" | ".join(cell.text for cell in row.cells) for row in table.rows)
                for table in document.tables
            ]
            text = "\n".join(paragraphs + tables)
        elif extension == ".xlsx":
            from openpyxl import load_workbook

            workbook = load_workbook(io.BytesIO(content), read_only=True, data_only=True)
            rows = []
            cell_count = 0
            sheet_count = len(workbook.worksheets)
            try:
                for sheet in workbook.worksheets:
                    if (sheet.max_row or 0) > 100_000 or (sheet.max_column or 0) > 500:
                        raise RequestError("Il foglio supera il limite di 100.000 righe o 500 colonne.")
                    rows.append(f"[Foglio: {sheet.title}]")
                    for row in sheet.iter_rows(values_only=True):
                        values = [str(value) for value in row if value is not None]
                        if values:
                            rows.append(" | ".join(values))
                            cell_count += len(values)
                            if cell_count > 100_000:
                                raise RequestError("Il foglio supera il limite di 100.000 celle valorizzate.")
            finally:
                workbook.close()
            text = "\n".join(rows)
            metadata["sheetCount"] = sheet_count
    except RequestError:
        raise
    except Exception as exc:
        raise RequestError(f"Impossibile leggere il documento {extension.upper()}: {type(exc).__name__}.") from exc

    text = text.strip()
    if not text:
        raise RequestError("Non e stato possibile estrarre testo. Il file potrebbe essere una scansione o un'immagine.")
    truncated = len(text) > MAX_DOCUMENT_TEXT
    text = text[:MAX_DOCUMENT_TEXT]
    request_text = " ".join(part for part in (query.strip(), text[:3000]) if part)
    result = recommend_sources({"query": request_text[:1000] or text[:1000]})
    result = {
        "document": {
            "name": safe_name,
            "format": extension[1:].upper(),
            "bytes": len(content),
            "charactersExtracted": len(text),
            "truncated": truncated,
            **metadata,
        },
        "extractedTextPreview": text[:1800],
        "analysis": result,
        "processing": "Analisi deterministica in memoria; il documento non viene salvato dall'applicazione.",
    }
    if payload.get("includeText") is True:
        result["extractedText"] = text
    return result


class _PortalPageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title = ""
        self.description = ""
        self.body_text = ""
        self.links: list[dict[str, str]] = []
        self._in_title = False
        self._active_link: dict[str, str] | None = None
        self._skip_body_text = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {key.lower(): value or "" for key, value in attrs}
        if tag.lower() in {"script", "style"}:
            self._skip_body_text = True
        if tag.lower() == "title":
            self._in_title = True
        if tag.lower() == "meta":
            key = (values.get("name") or values.get("property", "")).lower()
            if key in {"description", "og:description"} and values.get("content") and not self.description:
                self.description = values["content"].strip()
        if tag.lower() in {"a", "link"} and values.get("href"):
            link = {"href": values["href"].strip(), "text": values.get("aria-label", "").strip()}
            if tag.lower() == "link":
                link["text"] = " ".join(filter(None, (values.get("rel", ""), values.get("type", ""))))
            self.links.append(link)
            if tag.lower() == "a":
                self._active_link = link

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self.title = f"{self.title} {data.strip()}".strip()
        if self._active_link is not None:
            self._active_link["text"] = f"{self._active_link['text']} {data.strip()}".strip()
        if not self._skip_body_text and len(self.body_text) < 10_000:
            self.body_text = f"{self.body_text} {data.strip()}".strip()[:10_000]

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "title":
            self._in_title = False
        elif tag.lower() in {"script", "style"}:
            self._skip_body_text = False
        elif tag.lower() == "a":
            self._active_link = None


def _analyze_public_webpage(url: str, query: str) -> tuple[dict[str, Any], str]:
    parsed = _validate_public_url(url)
    with open_public_url(
        url,
        "text/html, text/plain, text/csv, application/json",
        PORTAL_PAGE_TIMEOUT,
    ) as response:
        content_type = response.headers.get_content_type()
        if content_type not in {"text/html", "text/plain", "text/csv", "application/json"}:
            raise RequestError("L'URL deve puntare a una pagina HTML o a testo/CSV/JSON pubblico.")
        raw = read_limited(response, MAX_PORTAL_PAGE_BYTES)
        charset = response.headers.get_content_charset() or "utf-8"
    text = raw.decode(charset, errors="replace")
    title = ""
    if content_type == "text/html":
        parser = _PortalPageParser()
        parser.feed(text)
        title = parser.title[:180]
        text = "\n".join(part for part in (parser.description, parser.body_text) if part)
    if not text.strip():
        raise RequestError("La pagina non contiene testo estraibile.")
    truncated = len(text) > MAX_DOCUMENT_TEXT
    extracted = text[:MAX_DOCUMENT_TEXT]
    query_text = " ".join(part for part in (query.strip(), extracted[:3000]) if part)
    analysis = recommend_sources({"query": query_text[:1000] or extracted[:1000]})
    label = title or Path(urllib.parse.unquote(parsed.path)).name or parsed.hostname or url
    return {
        "document": {
            "name": label[:180],
            "format": {
                "text/html": "HTML",
                "text/plain": "TEXT",
                "text/csv": "CSV",
                "application/json": "JSON",
            }[content_type],
            "bytes": len(raw),
            "charactersExtracted": len(extracted),
            "truncated": truncated,
        },
        "extractedTextPreview": extracted[:1800],
        "analysis": analysis,
        "processing": "Pagina pubblica letta in memoria tramite HTTPS/HTTP validato; il contenuto non viene salvato.",
    }, extracted


def _summarize_source_corpus(texts: list[str]) -> dict[str, Any]:
    from collections import Counter

    stop_words = {
        "the", "and", "for", "with", "from", "that", "this", "are", "was", "were", "have", "has",
        "per", "con", "della", "delle", "degli", "dalla", "dalle", "come", "sono", "dati", "delle",
        "nella", "nelle", "dello", "dell", "una", "uno", "che", "non", "gli", "alla", "alle", "del",
        "http", "https", "www", "com",
    }
    document_frequency: Counter[str] = Counter()
    total_frequency: Counter[str] = Counter()
    sentence_candidates: list[tuple[int, int, str]] = []
    for source_index, text in enumerate(texts):
        tokens = [
            token.casefold()
            for token in re.findall(r"[^\W\d_]{3,}", text, flags=re.UNICODE)
            if token.casefold() not in stop_words
        ]
        total_frequency.update(tokens)
        document_frequency.update(set(tokens))
        token_set = set(tokens)
        for sentence in re.split(r"(?<=[.!?])\s+", text):
            cleaned = " ".join(sentence.split())
            if len(cleaned) < 40:
                continue
            sentence_tokens = set(re.findall(r"[^\W\d_]{3,}", cleaned.casefold(), flags=re.UNICODE))
            score = len(sentence_tokens.intersection(token_set))
            if score:
                sentence_candidates.append((score, source_index, cleaned[:320]))

    keywords = sorted(
        document_frequency,
        key=lambda token: (-document_frequency[token], -total_frequency[token], token),
    )[:12]
    summary = []
    seen_sentences: set[str] = set()
    for _, _, sentence in sorted(sentence_candidates, key=lambda item: (-item[0], item[1])):
        normalized = sentence.casefold()
        if normalized in seen_sentences:
            continue
        seen_sentences.add(normalized)
        summary.append(sentence)
        if len(summary) == 3:
            break
    return {
        "sourceCount": len(texts),
        "characters": sum(len(text) for text in texts),
        "keywords": [
            {"term": token, "sourceCount": document_frequency[token], "occurrences": total_frequency[token]}
            for token in keywords
        ],
        "summary": summary,
        "method": "Sintesi estrattiva e frequenze di parole calcolate in locale; nessun LLM e nessuna causalita implicata.",
    }


def analyze_ml_sources(payload: dict[str, Any]) -> dict[str, Any]:
    documents = payload.get("documents", [])
    urls = payload.get("urls", [])
    query = payload.get("query", "")
    if not isinstance(documents, list) or not isinstance(urls, list):
        raise RequestError("Documenti e URL devono essere elenchi.")
    if len(documents) > MAX_ML_SOURCES or len(urls) > MAX_ML_SOURCES:
        raise RequestError(f"Puoi elaborare al massimo {MAX_ML_SOURCES} documenti e {MAX_ML_SOURCES} URL per richiesta.")
    if not documents and not urls:
        raise RequestError("Aggiungi almeno un documento o un URL.")
    if not isinstance(query, str) or len(query) > 1000:
        raise RequestError("La domanda deve contenere al massimo 1000 caratteri.")

    items = []
    corpus_texts = []
    encoded_total = 0
    for document in documents:
        if not isinstance(document, dict):
            raise RequestError("Documento non valido.")
        encoded = document.get("contentBase64")
        if not isinstance(encoded, str):
            raise RequestError("Contenuto documento non valido.")
        encoded_total += len(encoded)
        if encoded_total > 3_400_000:
            raise RequestError("La dimensione complessiva dei documenti supera il limite di 2,5 MB.")
        name = document.get("name", "")
        try:
            analysis = analyze_document({**document, "query": query, "includeText": True})
            extracted = analysis.pop("extractedText", analysis["extractedTextPreview"])
            corpus_texts.append(extracted)
            items.append({"kind": "file", **analysis})
        except RequestError as exc:
            items.append({"kind": "file", "label": str(name)[:180], "error": str(exc)})

    for url in urls:
        if not isinstance(url, str) or len(url) > 2048:
            raise RequestError("URL non valido o troppo lungo.")
        try:
            analysis, extracted = _analyze_public_webpage(url, query)
            corpus_texts.append(extracted)
            items.append({"kind": "url", "label": url, **analysis})
        except RequestError as exc:
            items.append({"kind": "url", "label": url, "error": str(exc)})

    return {
        "items": items,
        "corpus": _summarize_source_corpus(corpus_texts) if corpus_texts else None,
    }


_PORTAL_SEARCH_GROUPS = {
    "temperatura": {"temperatura", "temperature", "temperatures", "temp", "t2m", "era5"},
    "clima": {"clima", "climatico", "climatic", "climate", "climatology", "weather", "era5"},
    "precipitazioni": {"precipitazione", "precipitazioni", "precipitation", "precipitations", "rain", "rainfall", "pioggia"},
    "siccita": {"siccita", "drought", "dryness"},
    "inquinamento": {"inquinamento", "pollution", "pollutant", "pollutants", "air", "pm10", "pm2", "no2", "o3"},
    "emissioni": {"emissione", "emissioni", "emission", "emissions", "co2", "greenhouse", "ghg"},
    "agricoltura": {"agricoltura", "agricultural", "agriculture", "crop", "crops", "colture"},
    "salute_piante": {"pianta", "piante", "plant", "plants", "vegetation", "infestazione", "infestazioni", "pest", "pests"},
    "italia": {"italia", "italy", "italian"},
    "europa": {"europa", "europe", "european"},
}
_PORTAL_SEARCH_STOP_WORDS = {
    "a", "ad", "al", "alla", "ai", "agli", "alle", "anche", "che", "con", "cosa", "da", "dal",
    "dalla", "de", "dei", "del", "della", "di", "e", "ed", "gli", "il", "in", "la", "le", "lo",
    "ma", "nei", "nel", "nella", "per", "quale", "quali", "su", "tra", "un", "una", "uno", "and",
    "are", "as", "at", "by", "for", "from", "how", "in", "of", "on", "or", "the", "to", "what",
    "with", "data", "dataset", "dati", "analisi", "analizzare", "confronta", "confrontare", "mostra",
    "andamento", "trend", "serie", "storico", "storica", "storici", "ultimi", "ultimo", "ultime",
    "anni", "anno", "dal", "fino", "futuro", "previsione",
}


def _portal_search_tokens(value: str) -> set[str]:
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii").lower()
    return {
        token for token in re.findall(r"[a-z0-9]+", normalized)
        if token not in _PORTAL_SEARCH_STOP_WORDS and not token.isdigit() and (len(token) > 2 or token in {"o3"})
    }


def _rank_portal_candidates(candidates: list[dict[str, Any]], query: str) -> list[dict[str, Any]]:
    ranked = []
    for candidate in candidates:
        item = dict(candidate)
        requested = _portal_search_tokens(query)
        direct_tokens = _portal_search_tokens(f"{item['label']} {item['url']}")
        context_tokens = _portal_search_tokens(item.get("_context", ""))
        matched = []
        for term in sorted(requested):
            aliases = next((values for values in _PORTAL_SEARCH_GROUPS.values() if term in values), {term})
            if direct_tokens.intersection(aliases) or context_tokens.intersection(aliases):
                matched.append(term)
        missing = sorted(requested.difference(matched))
        item["relevanceScore"] = len(matched)
        item["matchedTerms"] = matched
        item["missingTerms"] = missing
        item["matchReason"] = (
            f"Parole chiave trovate: {', '.join(matched)}."
            + (f" Non rilevate nella pagina o nel link: {', '.join(missing)}." if missing else "")
            if matched else "Nessuna corrispondenza testuale chiara con la richiesta."
        )
        item.pop("_context", None)
        ranked.append(item)
    return sorted(
        ranked,
        key=lambda item: (-item["relevanceScore"], not item["importable"], -item["score"], item["label"].lower()),
    )


def _portal_recommendations(candidates: list[dict[str, Any]], source_host: str) -> list[dict[str, Any]]:
    recommendations = []
    seen_families: set[str] = set()
    covered_terms: set[str] = set()
    is_copernicus = source_host == "cds.climate.copernicus.eu" or source_host.endswith(".climate.copernicus.eu")
    for candidate in candidates:
        if candidate.get("relevanceScore", 0) <= 0:
            continue
        new_terms = set(candidate.get("matchedTerms", [])).difference(covered_terms)
        if not new_terms:
            continue
        path = urllib.parse.urlsplit(candidate["url"]).path.lower()
        family = "era5" if is_copernicus and "era5" in path else candidate["url"]
        if family in seen_families:
            continue
        seen_families.add(family)
        recommendations.append(candidate)
        covered_terms.update(new_terms)
        if len(recommendations) == 5:
            break
    return recommendations


def _portal_link(url: str, label: str, base_url: str) -> dict[str, Any] | None:
    absolute, _fragment = urllib.parse.urldefrag(urllib.parse.urljoin(base_url, url.strip()))
    try:
        parsed = urllib.parse.urlsplit(absolute)
        port = parsed.port or (443 if parsed.scheme == "https" else 80)
    except ValueError:
        return None
    if (
        parsed.scheme not in {"https", "http"}
        or not parsed.hostname
        or parsed.username
        or parsed.password
        or port != (443 if parsed.scheme == "https" else 80)
    ):
        return None

    path = parsed.path.lower()
    text = f"{label} {parsed.path}".lower()
    suffix = Path(path).suffix
    data_formats = {
        ".csv": ("CSV", True),
        ".tsv": ("TSV", False),
        ".json": ("JSON", True),
        ".xlsx": ("XLSX", False),
        ".xls": ("XLS", False),
        ".pdf": ("PDF", False),
        ".nc": ("NetCDF", False),
        ".nc4": ("NetCDF", False),
        ".grib": ("GRIB", False),
        ".grb": ("GRIB", False),
        ".zip": ("Archivio", False),
        ".parquet": ("Parquet", False),
    }
    inferred = None
    if "download" in text or "file" in text:
        for token, format_info in (
            ("csv", ("CSV", True)), ("json", ("JSON", True)), ("netcdf", ("NetCDF", False)),
            ("grib", ("GRIB", False)), ("xlsx", ("XLSX", False)), ("pdf", ("PDF", False)),
        ):
            if re.search(rf"\b{token}\b", label.lower()):
                inferred = format_info
                break
    if suffix in data_formats or inferred:
        file_format, importable = data_formats.get(suffix, inferred)
        return {
            "url": absolute,
            "label": label or Path(path).name or file_format,
            "kind": "file",
            "format": file_format,
            "importable": importable,
            "score": 10,
            "reason": "Download dati individuato nel portale." if importable else f"Risorsa {file_format}: il formato non e importabile direttamente nell'analisi corrente.",
        }

    api_match = bool(
        re.search(r"\bapi\b|opendap|thredds|graphql|\b(wms|stac)\b", label.lower())
        or re.search(r"(?:^|/)(api|opendap|thredds|wms|stac|graphql)(?:/|$)", parsed.path.lower())
    )
    dataset_match = any(term in text for term in ("dataset", "catalog", "download", "data store", "data access", "climate data", "collection", "product"))
    docs_match = any(term in text for term in ("documentation", "docs", "metadata", "guide", "api"))
    if api_match or dataset_match or docs_match:
        kind = "api" if api_match else "dataset" if dataset_match else "documentazione"
        return {
            "url": absolute,
            "label": label or parsed.netloc + parsed.path,
            "kind": kind,
            "format": "",
            "importable": False,
            "score": 7 if api_match else 8 if dataset_match else 3,
            "reason": "Possibile endpoint/API o accesso machine-to-machine." if api_match else "Pagina del catalogo da ispezionare per metadati, selettori e download." if dataset_match else "Pagina informativa utile per capire come richiedere i dati.",
        }
    return None


def _portal_download(url: str, content_type: str, content_disposition: str = "") -> dict[str, Any] | None:
    filename_match = re.search(r"""filename\*?=(?:UTF-8''|")?([^";]+)""", content_disposition, re.IGNORECASE)
    filename = urllib.parse.unquote(filename_match.group(1).strip().strip('"')) if filename_match else ""
    parsed = urllib.parse.urlsplit(url)
    suffix = Path(filename or parsed.path).suffix.lower()
    media_type = content_type.split(";", 1)[0].strip().lower()
    formats = {
        ".csv": ("CSV", True), ".json": ("JSON", True), ".tsv": ("TSV", False),
        ".xlsx": ("XLSX", False), ".xls": ("XLS", False), ".pdf": ("PDF", False),
        ".nc": ("NetCDF", False), ".nc4": ("NetCDF", False), ".grib": ("GRIB", False),
        ".grb": ("GRIB", False), ".zip": ("Archivio", False), ".parquet": ("Parquet", False),
        ".txt": ("TXT", False),
    }
    if suffix not in formats:
        mime_formats = {
            "text/csv": ("CSV", True), "application/csv": ("CSV", True),
            "application/json": ("JSON", True), "application/geo+json": ("JSON", True),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ("XLSX", False),
            "application/x-netcdf": ("NetCDF", False), "application/netcdf": ("NetCDF", False),
            "application/grib": ("GRIB", False), "application/x-grib": ("GRIB", False),
            "application/zip": ("Archivio", False), "application/vnd.apache.parquet": ("Parquet", False),
        }
        format_info = mime_formats.get(media_type)
    else:
        format_info = formats[suffix]
    if not format_info:
        return _portal_link(url, filename or "", url)
    file_format, importable = format_info
    return {
        "url": url,
        "label": filename or Path(parsed.path).name or parsed.netloc,
        "kind": "file",
        "format": file_format,
        "importable": importable,
        "score": 10,
        "reason": "Download dati individuato nel portale." if importable else f"Risorsa {file_format}: il formato non e importabile direttamente nell'analisi corrente.",
    }


def explore_portal(payload: dict[str, Any]) -> dict[str, Any]:
    url = payload.get("url")
    if not isinstance(url, str) or not url.strip() or len(url) > 4096:
        raise RequestError("Inserisci un link HTTP/HTTPS valido (massimo 4096 caratteri).")
    query = payload.get("query", "")
    if not isinstance(query, str) or len(query) > 1000:
        raise RequestError("La richiesta di analisi deve contenere al massimo 1000 caratteri.")
    query = query.strip()
    start_url = url.strip()
    start_parts = _validate_public_url(start_url)
    start_host = start_parts.hostname.lower() if start_parts.hostname else ""
    start_origin = (start_parts.scheme, start_host, start_parts.port or (443 if start_parts.scheme == "https" else 80))
    queue = [start_url]
    visited: set[str] = set()
    candidates: dict[str, dict[str, Any]] = {}
    pages: list[dict[str, str]] = []
    warnings: list[str] = []
    root_is_data = False

    while queue and len(visited) < MAX_PORTAL_PAGES:
        page_url = queue.pop(0)
        if page_url in visited:
            continue
        visited.add(page_url)
        try:
            with open_public_url(
                page_url,
                "text/html, application/xhtml+xml, application/json, text/csv, text/plain",
                timeout=PORTAL_PAGE_TIMEOUT,
            ) as response:
                content_type = response.headers.get("Content-Type", "").lower()
                content_disposition = response.headers.get("Content-Disposition", "")
                content = read_limited(response, MAX_PORTAL_PAGE_BYTES)
                final_url = response.geturl()
        except RequestError as exc:
            if page_url == start_url:
                raise
            warnings.append(f"Una pagina collegata non e accessibile ({urllib.parse.urlsplit(page_url).path or '/'}): {exc}")
            continue

        final_parts = _validate_public_url(final_url)
        final_host = final_parts.hostname.lower() if final_parts.hostname else ""
        path_suffix = Path(final_parts.path.lower()).suffix
        looks_html = "html" in content_type or content.lstrip().lower().startswith((b"<!doctype html", b"<html", b"<head", b"<body"))
        if not looks_html:
            direct = _portal_download(final_url, content_type, content_disposition)
            if direct:
                candidates[direct["url"]] = direct
                root_is_data = page_url == start_url
            elif page_url == start_url:
                raise RequestError("Il link non restituisce una pagina HTML o un file dati riconosciuto.")
            continue

        page = _PortalPageParser()
        page.feed(content.decode("utf-8-sig", errors="replace"))
        pages.append({"url": final_url, "title": page.title[:200], "description": page.description[:500]})
        page_candidate = candidates.get(final_url)
        if page_candidate:
            path_segments = [part.lower() for part in urllib.parse.urlsplit(final_url).path.split("/") if part]
            generic_pages = {"datasets", "catalog", "catalogue", "search", "quality-assurance", "documentation", "user-guide"}
            body_context = "" if path_segments and path_segments[-1] in generic_pages else page.body_text
            page_candidate["_context"] = f"{page.title} {page.description} {body_context}"
        if page_url == start_url:
            root_is_data = False
        next_pages: list[tuple[int, str]] = []
        for link in page.links:
            found = _portal_link(link["href"], link["text"], final_url)
            if not found:
                continue
            existing = candidates.get(found["url"])
            if existing is None or found["score"] > existing["score"]:
                candidates[found["url"]] = found
            target_parts = urllib.parse.urlsplit(found["url"])
            target_suffix = Path(target_parts.path.lower()).suffix
            target_origin = (
                target_parts.scheme,
                (target_parts.hostname or "").lower(),
                target_parts.port or (443 if target_parts.scheme == "https" else 80),
            )
            if (
                target_origin == start_origin
                and target_suffix not in {".csv", ".tsv", ".json", ".xlsx", ".xls", ".pdf", ".nc", ".nc4", ".grib", ".grb", ".zip", ".parquet"}
                and found["kind"] in {"dataset", "api", "documentazione"}
                and "download" not in link["text"].lower()
                and "/download" not in target_parts.path.lower()
                and found["url"] not in visited
            ):
                relevance = _rank_portal_candidates([found], query)[0]["relevanceScore"] if query else 0
                next_pages.append((found["score"] + relevance * 100, found["url"]))
        for _score, next_url in sorted(set(next_pages), reverse=True):
            if next_url not in visited and next_url not in queue and len(queue) + len(visited) < MAX_PORTAL_PAGES:
                queue.append(next_url)

    ordered_candidates = (
        _rank_portal_candidates(list(candidates.values()), query)
        if query else sorted(candidates.values(), key=lambda item: (-item["score"], item["label"].lower()))
    )
    recommendations = _portal_recommendations(ordered_candidates, start_host) if query else []
    matched_query_terms = {term for item in recommendations for term in item.get("matchedTerms", [])}
    candidates_list = []
    category_limits = {"file": 12, "dataset": 10, "api": 8, "documentazione": 5}
    for kind, limit in category_limits.items():
        candidates_list.extend([item for item in ordered_candidates if item["kind"] == kind][:limit])
    if len(candidates_list) < MAX_PORTAL_CANDIDATES:
        selected_urls = {item["url"] for item in candidates_list}
        candidates_list.extend(
            item for item in ordered_candidates
            if item["url"] not in selected_urls and len(candidates_list) < MAX_PORTAL_CANDIDATES
        )
    candidates_list = sorted(candidates_list[:MAX_PORTAL_CANDIDATES], key=lambda item: (-item["score"], item["label"].lower()))
    if query:
        candidates_list = sorted(
            candidates_list,
            key=lambda item: (-item.get("relevanceScore", 0), not item["importable"], -item["score"], item["label"].lower()),
        )
        recommendations = _portal_recommendations(ordered_candidates, start_host)
        matched_query_terms = {term for item in recommendations for term in item.get("matchedTerms", [])}
    notes = [
        f"Esplorate {len(pages)} pagine HTML (massimo {MAX_PORTAL_PAGES}); il contenuto JavaScript dinamico potrebbe non essere visibile.",
        "I link trovati non vengono scaricati automaticamente: apri o importa solo la risorsa che riconosci. Sono seguiti solo link della stessa origine.",
    ]
    parsed_host = start_host
    cds_guidance = None
    if parsed_host == "cds.climate.copernicus.eu" or parsed_host.endswith(".climate.copernicus.eu"):
        cds_guidance = {
            "title": "Nota per Copernicus Climate Data Store",
            "text": "Il catalogo CDS carica parte dei contenuti dinamicamente e per scaricare molte serie richiede accesso, accettazione delle condizioni e una richiesta con area, periodo e variabili. Questo assistente non accede al tuo account e non usa credenziali. Il CDS restituisce spesso NetCDF o GRIB, che questa demo non importa direttamente: sono importabili qui CSV e JSON.",
            "steps": [
                "Apri la pagina del dataset CDS e scegli il prodotto; consulta descrizione, copertura e variabili.",
                "Accedi al tuo account CDS, accetta le condizioni del dataset e invia la richiesta nell'interfaccia ufficiale.",
                "Per richieste programmatiche segui la guida API ufficiale; non incollare qui password o API key.",
                "Se il risultato e NetCDF/GRIB, estrai le serie necessarie e convertile in CSV con colonne data e valori prima di caricarle.",
            ],
            "apiGuide": "https://cds.climate.copernicus.eu/how-to-api",
        }
    return {
        "sourceUrl": start_url,
        "sourceHost": start_host,
        "query": query,
        "pagesScanned": pages,
        "pagesCount": len(pages),
        "candidates": candidates_list,
        "recommendations": recommendations,
        "unmatchedTerms": sorted(_portal_search_tokens(query).difference(matched_query_terms)) if query else [],
        "noRelevantCandidates": bool(query and not recommendations),
        "candidatesTruncated": len(ordered_candidates) > len(candidates_list),
        "warnings": warnings,
        "notes": notes,
        "directDataFound": root_is_data,
        "cdsGuidance": cds_guidance,
    }


class Handler(SimpleHTTPRequestHandler):
    server_version = "DataInsightLocal/1.0"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):
        print(f"[{self.log_date_time_string()}] {self.address_string()} {fmt % args}", flush=True)

    def _json(self, status: int, payload: dict[str, Any]):
        data = json.dumps(payload, ensure_ascii=False, allow_nan=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _authorized(self) -> bool:
        if not API_KEY:
            return True
        provided = self.headers.get("Authorization", "")
        expected = f"Bearer {API_KEY}"
        if hmac.compare_digest(provided.encode("utf-8"), expected.encode("utf-8")):
            return True
        self._json(401, {"error": "Autenticazione del servizio non valida."})
        return False

    def _body(self) -> dict[str, Any]:
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError as exc:
            raise RequestError("Lunghezza richiesta non valida.") from exc
        if not 0 < length <= MAX_BODY:
            raise RequestError("Richiesta vuota o oltre il limite di 10 MB.")
        try:
            data = json.loads(self.rfile.read(length))
        except (json.JSONDecodeError, UnicodeDecodeError) as exc:
            raise RequestError("Il corpo della richiesta deve essere JSON valido.") from exc
        if not isinstance(data, dict):
            raise RequestError("Il corpo JSON deve essere un oggetto.")
        return data

    def do_GET(self):
        parsed_path = urllib.parse.urlsplit(self.path)
        if parsed_path.path.startswith("/api/") and parsed_path.path != "/api/health" and not self._authorized():
            return
        if parsed_path.path == "/api/assist/remote-sensing/status":
            job_id = urllib.parse.parse_qs(parsed_path.query).get("id", [""])[0]
            if not job_id:
                self._json(400, {"error": "ID del test non specificato."})
                return
            job = remote_sensing.get_eurosat_job(job_id)
            if not job:
                self._json(404, {"error": "Test non trovato o scaduto."})
            else:
                self._json(200, job)
        elif parsed_path.path == "/api/assist/remote-sensing/aoi/status":
            job_id = urllib.parse.parse_qs(parsed_path.query).get("id", [""])[0]
            if not job_id:
                self._json(400, {"error": "ID dell'elaborazione non specificato."})
                return
            job = remote_sensing.get_sentinel_aoi_job(job_id)
            if not job:
                self._json(404, {"error": "Elaborazione non trovata o scaduta."})
            else:
                self._json(200, job)
        elif parsed_path.path == "/api/assist/remote-sensing/map":
            job_id = urllib.parse.parse_qs(parsed_path.query).get("id", [""])[0]
            map_path = remote_sensing.get_sentinel_map_path(job_id)
            if not map_path:
                self._json(404, {"error": "Mappa non disponibile o elaborazione non completata."})
                return
            if map_path.stat().st_size > 25 * 1024 * 1024:
                self._json(413, {"error": "La mappa supera il limite di download di 25 MB."})
                return
            content = map_path.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "image/tiff")
            self.send_header("Content-Length", str(len(content)))
            self.send_header("Content-Disposition", f'attachment; filename="sentinel-2-classification-{job_id}.tif"')
            self.end_headers()
            self.wfile.write(content)
        elif parsed_path.path == "/api/health":
            self._json(200, {"ok": True, "service": "Data Insight Python"})
        elif self.path == "/favicon.ico":
            self.send_response(204)
            self.end_headers()
        elif self.path.startswith("/api/"):
            self._json(404, {"error": "Endpoint API non trovato."})
        else:
            super().do_GET()

    def do_POST(self):
        if not self.path.startswith("/api/"):
            self._json(404, {"error": "Endpoint API non trovato."})
            return
        if not self._authorized():
            return
        try:
            payload = self._body()
            status_code = 200
            if self.path == "/api/source/series":
                result = fetch_source(payload)
            elif self.path == "/api/analyze":
                result = analyze(payload)
            elif self.path == "/api/ml/preview":
                result = preview_ml_dataset(payload)
            elif self.path == "/api/ml/train":
                result = train_tabular_model(payload)
            elif self.path == "/api/import/url":
                result = import_url(payload)
            elif self.path == "/api/assist/explore-url":
                result = explore_portal(payload)
            elif self.path == "/api/assist/recommend":
                result = recommend_sources(payload)
            elif self.path == "/api/assist/document":
                result = analyze_document(payload)
            elif self.path == "/api/assist/remote-sensing/run":
                try:
                    result = remote_sensing.start_eurosat_job()
                except RuntimeError as exc:
                    raise RequestError(str(exc)) from exc
                status_code = 202
            elif self.path == "/api/assist/remote-sensing/aoi/run":
                try:
                    result = remote_sensing.start_sentinel_aoi_job(payload)
                except (RuntimeError, ValueError) as exc:
                    raise RequestError(str(exc)) from exc
                status_code = 202
            else:
                self._json(404, {"error": "Endpoint API non trovato."})
                return
            self._json(status_code, result)
        except RequestError as exc:
            self._json(400, {"error": str(exc)})
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            self._json(502, {"error": f"Errore della fonte dati: {exc}"})
        except (BrokenPipeError, ConnectionResetError):
            return
        except Exception as exc:
            print(f"Errore interno API: {type(exc).__name__}: {exc}", file=sys.stderr, flush=True)
            self._json(500, {"error": "Errore interno del servizio. Controlla il terminale del server."})


def serve():
    if HOST not in {"127.0.0.1", "localhost", "::1"} and len(API_KEY) < 32:
        raise RuntimeError("Imposta una DATA_INSIGHT_API_KEY di almeno 32 caratteri prima di esporre il servizio su una rete.")
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    server.daemon_threads = True
    print(f"Data Insight AI disponibile su http://{HOST}:{PORT}/", flush=True)
    print("Premi Ctrl+C per arrestare il servizio.", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nArresto richiesto.", flush=True)
    finally:
        server.server_close()


if __name__ == "__main__":
    serve()
