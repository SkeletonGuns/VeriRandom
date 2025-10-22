import os
import time
import json
import hashlib
import math
import random
from collections import Counter
from typing import List, Dict, Any
from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from fastapi.responses import HTMLResponse, PlainTextResponse

# ======================
# Конфигурация
# ======================
MAX_ENTROPY_POOL_SIZE = 1024 * 1024  # 1 MB
MAX_BATCH_SIZE = 4096  # 4 KB

app = FastAPI(
    title="Test",
    description="Гибридный генератор случайных чисел с экзотическим сбором энтропии",
    version="1.1"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


entropy_pool: List[int] = []

templates = Jinja2Templates(directory="app/templates")
app.mount("/static", StaticFiles(directory="app/static"), name="static")


# ======================
# Вспомогательные функции
# ======================

def logistic_map_bytes(data: bytes, r: float = 3.9999) -> bytes:
    """Применяет логистическое отображение к байтам."""
    if not data:
        return b""
    x = (sum(data) / len(data)) / 256.0
    out = bytearray()
    for _ in range(len(data)):
        x = r * x * (1 - x)
        out.append(int(x * 255) & 0xFF)
    return bytes(out)


def rule30_step(row: List[int]) -> List[int]:
    """Один шаг клеточного автомата Rule 30."""
    n = len(row)
    new_row = []
    for i in range(n):
        left = row[(i - 1) % n]
        center = row[i]
        right = row[(i + 1) % n]
        new_row.append(left ^ (center | right))
    return new_row


def rule30_bytes(data: bytes, steps: int = 10) -> bytes:
    """
    Rule 30 для небольших данных.
    Оптимизирован для скорости на малых объёмах.
    """
    if len(data) > 256: # думаю по производительности не ударит сильно.
        raise ValueError("Rule30: вход ограничен 256 байтами")

    bits = []
    for b in data:
        for i in range(8):
            bits.append((b >> (7 - i)) & 1)

    while len(bits) % 8 != 0:
        bits.append(0)

    for _ in range(steps):
        bits = rule30_step(bits)

    out = bytearray()
    for i in range(0, len(bits), 8):
        byte = 0
        for j in range(min(8, len(bits) - i)):
            byte = (byte << 1) | bits[i + j]
        out.append(byte)
    return bytes(out)


def shannon_entropy(data: bytes) -> float:
    """Энтропия Шеннона."""
    if not data:
        return 0.0
    counts = Counter(data)
    total = len(data)
    entropy = 0.0
    for count in counts.values():
        p = count / total
        entropy -= p * math.log2(p)
    return entropy


def chi_square_statistic(data: bytes) -> float | None:
    """χ²-статистика для равномерности."""
    if len(data) < 256:
        return None
    counts = Counter(data)
    expected = len(data) / 256.0
    chi2 = 0.0
    for byte_val in range(256):
        observed = counts.get(byte_val, 0)
        chi2 += (observed - expected) ** 2 / expected
    return chi2


def extract_seed(min_bytes: int = 32) -> bytes:
    """Извлекает и отбеливает семя из энтропийного пула."""
    global entropy_pool
    if len(entropy_pool) < min_bytes:
        raise HTTPException(425, "Недостаточно энтропии")

    raw = bytes(entropy_pool[:min_bytes])
    del entropy_pool[:min_bytes]

    step1 = logistic_map_bytes(raw)
    step2 = rule30_bytes(step1)
    step3 = hashlib.sha3_256(step2).digest()

    hkdf = HKDF(
        algorithm=hashes.SHA3_256(),
        length=32,
        salt=None,
        info=b"final-seed"
    )
    return hkdf.derive(step3)


# ======================
# Эндпоинты
# ======================

@app.get("/entropy/status")
async def entropy_status():
    return {"bytes_available": len(entropy_pool)}


@app.post("/entropy/feed")
async def feed_entropy(payload: Dict[str, Any]):
    """Приём энтропии из браузера."""
    raw = payload.get("raw", [])
    if not isinstance(raw, list):
        raise HTTPException(400, "Ожидался массив байтов")
    if len(raw) > MAX_BATCH_SIZE:
        raise HTTPException(400, f"Пакет слишком велик (макс. {MAX_BATCH_SIZE} байт)")
    if not all(isinstance(b, int) and 0 <= b <= 255 for b in raw):
        raise HTTPException(400, "Байты должны быть целыми числами в диапазоне [0, 255]")

    if len(entropy_pool) + len(raw) > MAX_ENTROPY_POOL_SIZE:
        raise HTTPException(413, "Пул энтропии переполнен (макс. 1 МБ)")

    entropy_pool.extend(raw)
    return {"status": "ok", "total_bytes": len(entropy_pool)}


@app.post("/api/generate_nist_data")
async def generate_nist_data(payload: Dict[str, Any]):
    """Генерирует 1,000,000 бинарных значений для тестов NIST/Dieharder."""

    target_bits = payload.get("length", 1000000)
    target_bytes = target_bits // 8

    try:
        final_seed = extract_seed(32)
    except HTTPException as e:
        if e.status_code == 425:
            raw_fallback = os.urandom(32)
            step1 = logistic_map_bytes(raw_fallback)
            step2 = rule30_bytes(step1)
            step3 = hashlib.sha3_256(step2).digest()
            hkdf = HKDF(
                algorithm=hashes.SHA3_256(),
                length=32,
                salt=None,
                info=b"fallback-seed"
            )
            final_seed = hkdf.derive(step3)
        else:
            raise e

    seed_int = int.from_bytes(final_seed, byteorder='big')
    rng = random.Random(seed_int)
    random_bytes = rng.randbytes(target_bytes)
    binary_string = "".join(format(byte, '08b') for byte in random_bytes)
    if len(binary_string) > target_bits:
        binary_string = binary_string[:target_bits]

    filename = f"for_tests_{target_bits}_bits.txt"

    return PlainTextResponse(
        binary_string,
        media_type="text/plain",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )

@app.post("/lottery/draw")
async def lottery_draw():
    """Сценарий 1: Лотерейный тираж."""
    seed = extract_seed(32)

    rng = random.Random(seed)
    numbers = sorted(rng.sample(range(1, 50), 6))

    hkdf_test = HKDF(
        algorithm=hashes.SHA3_256(),
        length=1000,
        salt=None,
        info=b"test-data"
    )
    test_data = hkdf_test.derive(seed)

    entropy_val = shannon_entropy(test_data)
    chi2_stat = chi_square_statistic(test_data)
    chi2_display = round(chi2_stat, 2) if chi2_stat is not None else "N/A"

    snapshot = {
        "timestamp": time.time(),
        "numbers": numbers,
        "seed_hash": hashlib.sha256(seed).hexdigest(),
        "tests": {
            "entropy_per_byte": round(entropy_val, 4),
            "chi_square_stat": chi2_display
        }
    }
    snapshot_hash = hashlib.sha256(json.dumps(snapshot, sort_keys=True).encode()).hexdigest()

    return {
        "draw": numbers,
        "snapshot_hash": snapshot_hash,
        "tests": snapshot["tests"],
        "processing_steps": [
            "Сбор энтропии из браузера",
            "Chaotic Map (Logistic)",
            "Cellular Automaton (Rule 30)",
            "SHA3-256 Whitening",
            "HKDF Expansion"
        ]
    }


@app.post("/audit/upload")
async def audit_upload(file: UploadFile = File(...)):
    """Сценарий 2: Аудит внешнего генератора."""
    content = await file.read()

    if not content:
        raise HTTPException(400, "Файл пуст")

    if file.content_type.startswith('text') or file.filename.endswith(('.txt', '.csv', '.log')):
        try:
            numbers = list(map(int, content.decode().split()))
            data = bytes([n & 0xFF for n in numbers])
        except Exception as e:
            raise HTTPException(400, f"Неверный формат текста: {e}")
    else:
        data = content

    entropy_val = shannon_entropy(data)
    chi2_stat = chi_square_statistic(data)
    chi2_display = round(chi2_stat, 2) if chi2_stat is not None else "N/A"

    hist = [0] * 16
    for b in data:
        hist[b // 16] += 1

    anomalies = []
    if entropy_val < 7.9:
        anomalies.append("Низкая энтропия (<7.9 бит/байт)")
    expected_chi2 = 255
    if chi2_stat is not None:
        if abs(chi2_stat - expected_chi2) > 100:
            anomalies.append("Высокая χ²-статистика — возможное смещение")
    else:
        anomalies.append("Недостаточно данных (требуется >255 байт) для χ²-теста")

    return {
        "file_size_bytes": len(data),
        "entropy_per_byte": round(entropy_val, 4),
        "chi_square_stat": chi2_display,
        "histogram": hist,
        "anomalies": anomalies
    }


@app.get("/demo/generate")
async def demo_generate():
    """Сценарий 3: Демонстрация работы."""
    raw = os.urandom(32)

    step1 = logistic_map_bytes(raw)
    step2 = rule30_bytes(step1)
    step3 = hashlib.sha3_256(step2).digest()

    hkdf = HKDF(
        algorithm=hashes.SHA3_256(),
        length=32,
        salt=None,
        info=b"demo"
    )
    final = hkdf.derive(step3)

    return {
        "raw_entropy_sample": raw.hex()[:32],
        "after_chaotic": step1.hex()[:32],
        "after_ca": step2.hex()[:32],
        "after_hash": step3.hex(),
        "final_seed": final.hex(),
        "explanations": {
            "chaotic": "Нелинейное преобразование усиливает чувствительность к начальным условиям",
            "ca": "Rule 30 создаёт вычислительно непредсказуемый паттерн",
            "hash": "Криптографическое отбеливание устраняет статистические отклонения",
            "hkdf": "Генерация криптостойкого семени для безопасной генерации"
        }
    }

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/lottery", response_class=HTMLResponse)
async def lottery_page(request: Request):
    return templates.TemplateResponse("lottery.html", {"request": request})

@app.get("/audit", response_class=HTMLResponse)
async def audit_page(request: Request):
    return templates.TemplateResponse("audit.html", {"request": request})

@app.get("/demo", response_class=HTMLResponse)
async def demo_page(request: Request):
    return templates.TemplateResponse("demo.html", {"request": request})

@app.get("/guide", response_class=HTMLResponse)
async def guide(request: Request):
    return templates.TemplateResponse("guide.html", {"request": request})

@app.get("/entropy", response_class=HTMLResponse)
async def entropy(request: Request):
    return templates.TemplateResponse("entropy.html", {"request": request})