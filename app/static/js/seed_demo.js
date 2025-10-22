function runSeedDemo() {
    const btn = document.getElementById('seedDemoBtn');
    const status = document.getElementById('seedStatus');
    const pipeline = document.getElementById('seedPipeline');

    // Ссылки на элементы для данных
    const rawData = document.getElementById('raw_data');
    const chaoticData = document.getElementById('chaotic_data');
    const caData = document.getElementById('ca_data');
    const hashData = document.getElementById('hash_data');
    const finalData = document.getElementById('final_data');

    // Ссылки на элементы для пояснений
    const chaoticExp = document.getElementById('chaotic_exp');
    const caExp = document.getElementById('ca_exp');
    const hashExp = document.getElementById('hash_exp');
    const finalExp = document.getElementById('final_exp');

    // Очистка данных перед запуском
    [rawData, chaoticData, caData, hashData, finalData].forEach(el => el.textContent = 'Ожидание...');
    status.className = "status mt-3 text-warning fw-bold";

    btn.disabled = true;
    status.textContent = "Запуск конвейера...";
    pipeline.style.display = 'block';

    // Внутренняя функция для симуляции задержки и обновления
    async function updateStage(dataElement, textContent) {
        await new Promise(resolve => setTimeout(resolve, 500));
        dataElement.textContent = textContent;
    }

    // Прогресс-бар для всего процесса (не используется, но полезно для визуализации)
    // const progressSteps = 5;
    // let currentStep = 0;

    try {
        // Предполагается, что на бэкенде есть эндпоинт /demo/generate
        // который возвращает JSON с результатами:
        // {
        //   raw_entropy_sample: "...",
        //   after_chaotic: "...",
        //   after_ca: "...",
        //   after_hash: "...",
        //   final_seed: "...",
        //   explanations: { chaotic: "...", ca: "...", hash: "...", hkdf: "..." }
        // }
        const res = await fetch('/demo/generate');
        if (!res.ok) {
            throw new Error(`Ошибка сети: ${res.statusText}`);
        }
        const data = await res.json();

        // 1. Сырая энтропия
        status.textContent = "1/5: Получение сырой энтропии...";
        await updateStage(rawData, data.raw_entropy_sample);

        // 2. Chaotic Map
        status.textContent = "2/5: Обработка Chaotic Map (Logistic)...";
        chaoticExp.textContent = data.explanations.chaotic;
        await updateStage(chaoticData, data.after_chaotic);

        // 3. Cellular Automaton
        status.textContent = "3/5: Обработка Cellular Automaton (Rule 30)...";
        caExp.textContent = data.explanations.ca;
        await updateStage(caData, data.after_ca);

        // 4. SHA3-256 Whitening
        status.textContent = "4/5: Криптографическое отбеливание (SHA3-256)...";
        hashExp.textContent = data.explanations.hash;
        await updateStage(hashData, data.after_hash);

        // 5. Финальное семя (HKDF)
        status.textContent = "5/5: Финальное извлечение семени (HKDF)...";
        finalExp.textContent = data.explanations.hkdf;
        await updateStage(finalData, data.final_seed);
        finalData.className = "data-display text-success fw-bold"; // Выделить финальный результат

        status.textContent = "Конвейер генерации завершен! 🎉";
        status.className = "status mt-3 text-success fw-bold";

    } catch (e) {
        status.textContent = `Ошибка при запуске конвейера: ${e.message}`;
        status.className = "status mt-3 text-danger fw-bold";
        console.error("Seed Demo Error:", e);
    } finally {
        btn.disabled = false;
    }
}