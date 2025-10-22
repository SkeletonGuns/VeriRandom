async function startDraw() {
    // Получение ссылок на все элементы UI
    const drawBtn = document.getElementById('drawBtn');
    const statusMessage = document.getElementById('statusMessage');
    const loadingProgress = document.getElementById('loadingProgress');
    const processingSteps = document.getElementById('processingSteps');
    const serverTestsCard = document.getElementById('serverTestsCard');
    const lotteryNumbers = document.getElementById('lotteryNumbers');
    const resultMessage = document.getElementById('resultMessage');
    const serverStepsList = document.getElementById('serverStepsList');
    const entropyValue = document.getElementById('entropyValue');
    const chi2Value = document.getElementById('chi2Value');
    const fingerprintCode = document.getElementById('fingerprintCode');
    const downloadBtn = document.getElementById('downloadBtn');

    // --- 1. Сброс UI и установка статуса загрузки ---
    drawBtn.disabled = true;
    loadingProgress.style.display = 'block';
    statusMessage.textContent = "Генерация тиража... Пожалуйста, подождите.";
    statusMessage.classList.remove('text-danger', 'text-success');
    statusMessage.classList.add('text-white');

    // Скрытие предыдущих результатов
    processingSteps.style.display = 'none';
    serverTestsCard.style.display = 'none';
    serverStepsList.innerHTML = '';
    entropyValue.textContent = '?';
    chi2Value.textContent = '?';
    fingerprintCode.textContent = 'waiting_for_generation...';
    downloadBtn.disabled = true;

    // Сброс номеров на '?'
    lotteryNumbers.innerHTML = '';
    for(let i = 0; i < 6; i++) {
        lotteryNumbers.innerHTML += `<div class="number-circle">?</div>`;
    }
    resultMessage.textContent = 'Результат будет отображен после завершения генерации';

    try {
        // --- 2. Выполнение Fetch API call к серверу ---
        const res = await fetch('/lottery/draw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!res.ok) {
            // Если ответ сервера не 200 OK
            throw new Error(`Ошибка сервера: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        // --- 3. Обновление результатов ---

        // Обновление тиражной комбинации
        const numbersDiv = document.getElementById('lotteryNumbers');
        numbersDiv.innerHTML = '';
        data.draw.forEach(num => {
            numbersDiv.innerHTML += `<div class="number-circle">${num}</div>`;
        });

        // Обновление этапов обработки
        data.processing_steps.forEach(step => {
            // Используем Bootstrap стили для списка с иконками
            serverStepsList.innerHTML += `<li class="d-flex align-items-start mb-2"><i class="bi bi-check-circle-fill text-success me-2 mt-1"></i><span class="text-white">${step}</span></li>`;
        });
        processingSteps.style.display = 'block';

        // Обновление результатов тестов
        entropyValue.textContent = `${data.tests.entropy_per_byte} бит/байт`;
        chi2Value.textContent = `${data.tests.chi_square_stat}`;
        serverTestsCard.style.display = 'block';

        // Обновление цифрового слепка
        fingerprintCode.textContent = data.snapshot_hash;
        downloadBtn.disabled = false;

        // --- 4. Финальный статус ---
        loadingProgress.style.display = 'none';
        statusMessage.textContent = "Тираж успешно сгенерирован!";
        statusMessage.classList.remove('text-white');
        statusMessage.classList.add('text-success');
        resultMessage.textContent = 'Окончательная тиражная комбинация';

    } catch (e) {
        // --- 5. Обработка ошибок ---
        loadingProgress.style.display = 'none';
        statusMessage.textContent = `Ошибка при проведении тиража: ${e.message}`;
        statusMessage.classList.remove('text-white');
        statusMessage.classList.add('text-danger');

    } finally {
        // Кнопка снова активна
        drawBtn.disabled = false;
    }
}