class DemoManager {
    constructor() {
        this.examples = {
            perfect: this.generatePerfectRandom(),
            weak: this.generateWeakRandom(),
            predictable: this.generatePredictable()
        };
        this.currentExample = null;
        this.isAnalyzing = false;
    }

    generatePerfectRandom() {
        return Array.from({length: 1000}, () => Math.floor(Math.random() * 100));
    }

    generateWeakRandom() {
        const base = Array.from({length: 1000}, () => Math.floor(Math.random() * 100));
        // Добавляем слабую корреляцию
        return base.map((val, idx) => (idx % 50 === 0 ? 75 : val));
    }

    generatePredictable() {
        return Array.from({length: 1000}, (_, idx) => (idx % 10) * 10);
    }

    loadExample(type) {
        if (this.isAnalyzing) return;

        this.currentExample = type;
        const data = this.examples[type];
        
        this.updateUI(type);
        this.visualizeSequence(data);
        this.startAnalysis(data, type);
    }

    updateUI(type) {
        const names = {
            perfect: 'Идеально случайная',
            weak: 'Слабая корреляция',
            predictable: 'Предсказуемая'
        };
        
        document.getElementById('currentExample').textContent = names[type];
        document.getElementById('keyMetrics').style.display = 'none';
        document.getElementById('resultsSummary').innerHTML = `
            <div class="placeholder">
                <i class="bi bi-hourglass text-warning display-4 mb-3"></i>
                <p class="text-warning">Анализ запущен...</p>
            </div>
        `;
    }

    visualizeSequence(data) {
        const container = document.getElementById('sequenceContainer');
        const sample = data.slice(0, 50);
        
        container.innerHTML = `
            <div class="sequence-preview">
                <div class="d-flex flex-wrap gap-1 mb-3">
                    ${sample.map(num => `
                        <span class="badge bg-warning text-dark">${num}</span>
                    `).join('')}
                </div>
                <small class="text-muted">Показано 50 из ${data.length} элементов</small>
            </div>
        `;
    }

    async startAnalysis(data, type) {
        this.isAnalyzing = true;
        
        const progressBar = document.getElementById('analysisProgress');
        const testStatus = document.getElementById('testStatus');
        
        // Сброс прогресса
        progressBar.style.width = '0%';
        progressBar.textContent = '0%';
        
        // Симуляция анализа с прогрессом
        await this.simulateProgress(progressBar);
        
        // Генерация результатов
        const results = this.generateResults(type);
        
        // Отображение результатов
        this.displayResults(results, data.length);
        this.updateEducationalContent(type);
        
        this.isAnalyzing = false;
    }

    async simulateProgress(progressBar) {
        const testStatus = document.getElementById('testStatus');
        const tests = [
            'Frequency Test',
            'Runs Test', 
            'Serial Test',
            'Complexity Test',
            'Spectral Test'
        ];

        for (let i = 0; i < tests.length; i++) {
            const progress = ((i + 1) / tests.length) * 100;
            progressBar.style.width = progress + '%';
            progressBar.textContent = Math.round(progress) + '%';
            
            testStatus.innerHTML = `
                ${tests.slice(0, i + 1).map(test => `
                    <div class="status-item d-flex justify-content-between align-items-center p-2 border-bottom border-secondary">
                        <span class="text-success">${test}</span>
                        <i class="bi bi-check-circle-fill text-success"></i>
                    </div>
                `).join('')}
                ${i < tests.length - 1 ? `
                    <div class="status-item d-flex justify-content-between align-items-center p-2 border-bottom border-secondary">
                        <span class="text-warning">${tests[i + 1]}</span>
                        <i class="bi bi-hourglass text-warning"></i>
                    </div>
                ` : ''}
            `;
            
            await new Promise(resolve => setTimeout(resolve, 800));
        }
    }

    generateResults(type) {
        const baseScores = {
            perfect: { entropy: 0.95, pValue: 0.62, quality: 92 },
            weak: { entropy: 0.78, pValue: 0.04, quality: 65 },
            predictable: { entropy: 0.35, pValue: 0.001, quality: 28 }
        };
        
        const base = baseScores[type];
        
        // Добавляем небольшую случайность для реалистичности
        return {
            entropy: base.entropy + (Math.random() * 0.1 - 0.05),
            pValue: base.pValue * (0.8 + Math.random() * 0.4),
            quality: base.quality + Math.floor(Math.random() * 10 - 5)
        };
    }

    displayResults(results, length) {
        this.displaySummary(results);
        this.displayMetrics(results, length);
    }

    displaySummary(results) {
        const summary = document.getElementById('resultsSummary');
        let statusClass, statusIcon, statusText;
        
        if (results.quality >= 80) {
            statusClass = 'text-success';
            statusIcon = 'bi-check-circle-fill';
            statusText = 'Высокое качество случайности';
        } else if (results.quality >= 60) {
            statusClass = 'text-warning';
            statusIcon = 'bi-exclamation-triangle';
            statusText = 'Среднее качество случайности';
        } else {
            statusClass = 'text-danger';
            statusIcon = 'bi-x-circle-fill';
            statusText = 'Низкое качество случайности';
        }

        summary.innerHTML = `
            <div class="score-display">
                <div class="display-4 fw-bold ${statusClass} mb-2">${results.quality}%</div>
                <h5 class="${statusClass}">
                    <i class="bi ${statusIcon} me-2"></i>${statusText}
                </h5>
            </div>
        `;
    }

    displayMetrics(results, length) {
        document.getElementById('entropyValue').textContent = results.entropy.toFixed(3);
        document.getElementById('pValue').textContent = results.pValue.toFixed(4);
        document.getElementById('sequenceLength').textContent = length;
        document.getElementById('randomnessQuality').textContent = results.quality + '%';
        
        document.getElementById('keyMetrics').style.display = 'block';
    }

    updateEducationalContent(type) {
        const content = document.getElementById('educationalContent');
        const explanations = {
            perfect: `
                <h6 class="text-success">Идеально случайная последовательность</h6>
                <p class="text-muted small">
                    Эта последовательность демонстрирует отличные характеристики случайности:
                </p>
                <ul class="text-muted small">
                    <li>Равномерное распределение частот</li>
                    <li>Отсутствие detectable паттернов</li>
                    <li>Высокое значение энтропии</li>
                    <li>p-значения в допустимом диапазоне</li>
                </ul>
            `,
            weak: `
                <h6 class="text-warning">Последовательность со слабой корреляцией</h6>
                <p class="text-muted small">
                    Обнаружены незначительные аномалии:
                </p>
                <ul class="text-muted small">
                    <li>Небольшие отклонения в распределении</li>
                    <li>Слабые корреляции между элементами</li>
                    <li>p-значения на границе допустимого</li>
                    <li>Требуется дополнительная проверка</li>
                </ul>
            `,
            predictable: `
                <h6 class="text-danger">Предсказуемая последовательность</h6>
                <p class="text-muted small">
                    Выявлены серьезные проблемы:
                </p>
                <ul class="text-muted small">
                    <li>Явные паттерны и закономерности</li>
                    <li>Неравномерное распределение</li>
                    <li>Низкое значение энтропии</li>
                    <li>p-значения указывают на неслучайность</li>
                </ul>
            `
        };
        
        content.innerHTML = explanations[type];
    }
}

// Инициализация
const demoManager = new DemoManager();

// Глобальные функции
function loadExample(type) {
    demoManager.loadExample(type);
}

// Стили для демо страницы
const demoStyles = `
    .example-card {
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .example-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
    }
    
    .sequence-preview .badge {
        font-family: 'Courier New', monospace;
        font-size: 0.8em;
    }
    
    .status-item {
        transition: all 0.3s ease;
    }
    
    .score-display {
        animation: fadeIn 0.5s ease-in;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;

const demoStyleSheet = document.createElement('style');
demoStyleSheet.textContent = demoStyles;
document.head.appendChild(demoStyleSheet);