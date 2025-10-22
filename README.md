# VeriRandom

### Гибридный генератор случайных чисел с экзотическим сбором энтропии из браузера

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.8%2B-blue)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green)](https://fastapi.tiangolo.com)

> **«Случайность — не недостаток порядка, а его высшая форма»**  
> Система генерации случайных чисел, вдохновлённая квантовым шумом, но реализованная **исключительно в веб-браузере**.

---

## 🌟 Особенности

- ✅ **Экзотический источник энтропии**: сбор через **джиттер рендеринга Canvas и вычислений Chaotic Map** — без доступа к железу!
- ✅ **Гибридная обработка**:  
  `Chaotic Map → Rule 30 (Cellular Automaton) → SHA3-256 → HKDF`
- ✅ **Полная кроссплатформенность**: работает на **любом устройстве с браузером**
- ✅ **Три сценария соревнования**:
  1. **Лотерейный тираж** с цифровым слепком и тестами
  2. **Аудит внешнего генератора** с визуализацией аномалий
  3. **Демонстрация работы** с пошаговой визуализацией конвейера
- ✅ **100% open-source**: только MIT/Apache 2.0 зависимости, без проприетарных SDK

---

## 🎯 Демонстрация

### Сценарий 1: Лотерея

![Лотерея](<img width="1919" height="964" alt="image" src="https://github.com/user-attachments/assets/956ce05b-985f-4e2e-9ff9-dd4ec5730c34" />)

### Сценарий 2: Аудит

![Аудит](<img width="1919" height="965" alt="image" src="https://github.com/user-attachments/assets/b5e4c7ba-063e-4e98-9885-2192606ee7cf" />
)

### Сценарий 3: Демо

![Демо](<img width="1919" height="964" alt="image" src="https://github.com/user-attachments/assets/af69e24e-0124-4dd8-baa5-2f5891d3424b" />
)

---

## 🚀 Быстрый старт

### Требования

- Python 3.12.8
- Git

### Установка

```bash
git clone https://github.com/SkeletonGuns/VeriRandom.git
cd VeryRandom
pip install -r requirements.txt
python run.py
```
