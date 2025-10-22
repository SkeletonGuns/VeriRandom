class AuditManager {
    constructor() {
        this.uploadedFile = null; // Для хранения объекта File
        this.analysisResults = null;
        this.isAnalyzing = false;
    }

    init() {
        this.setupDragAndDrop();
        this.setupEventListeners();
        this.resetUI();
    }

    resetUI() {
        // Установка начального состояния элементов
        document.getElementById('analysisSummary').innerHTML = `
            <div class="placeholder-content">
                <i class="bi bi-graph-up text-white display-4 mb-3"></i>
                <p class="text-white">Загрузите данные для начала анализа</p>
            </div>
        `;
        document.getElementById('statusMessage').textContent = "";
        document.getElementById('dataPreview').style.display = 'none';
        document.getElementById('testResults').style.display = 'none';
        document.getElementById('anomaliesSection').style.display = 'none';
        document.getElementById('visualizationPlaceholder').style.display = 'block';
        document.getElementById('chartsContainer').style.display = 'none';
        document.getElementById('analyzeBtn').disabled = true;
    }

    setupDragAndDrop() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                uploadArea.classList.add('bg-warning', 'bg-opacity-10');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.remove('bg-warning', 'bg-opacity-10');
            }, false);
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0]);
            }
        });
    }

    setupEventListeners() {
        document.getElementById('confidenceLevel').addEventListener('input', (e) => {
            document.getElementById('confidenceValue').textContent = e.target.value + '%';
        });
    }

    handleFileUpload(file) {
        this.uploadedFile = file;
        this.showDataPreview(file.name, file.size);
        document.getElementById('analyzeBtn').disabled = false;
        document.getElementById('statusMessage').textContent = `Файл "${file.name}" готов к анализу.`;
    }

    showDataPreview(fileName, fileSize) {
        const preview = document.getElementById('dataPreview');
        const previewContent = document.getElementById('previewContent');

        previewContent.innerHTML = `
            <strong>Имя:</strong> ${fileName}<br>
            <strong>Размер:</strong> ${fileSize} байт<br>
            <strong>Тип:</strong> ${this.uploadedFile.type || 'неизвестен'}
        `;
        preview.style.display = 'block';
    }

    async startAnalysis() {
        if (!this.uploadedFile || this.isAnalyzing) return;

        this.isAnalyzing = true;
        document.getElementById('analyzeBtn').disabled = true;
        document.getElementById('analyzeBtn').innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Анализ...';
        document.getElementById('statusMessage').textContent = 'Отправка данных на сервер...';

        await this.uploadFile(this.uploadedFile);

        this.isAnalyzing = false;
        document.getElementById('analyzeBtn').disabled = false;
        document.getElementById('analyzeBtn').innerHTML = '<i class="bi bi-graph-up me-2"></i>Запустить анализ';
    }

    async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/audit/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                // Если ошибка от FastAPI (например, 413, 400), читаем JSON-тело для сообщения
                const errorData = await response.json().catch(() => ({ detail: `Ошибка сервера: ${response.status}` }));
                throw new Error(errorData.detail || `Ошибка: ${response.status}`);
            }

            const data = await response.json();
            this.analysisResults = data;
            this.displayResults();
            document.getElementById('statusMessage').textContent = "Анализ завершён!";
            document.getElementById('statusMessage').classList.remove('text-warning', 'text-danger');
            document.getElementById('statusMessage').classList.add('text-success');

        } catch (e) {
            this.showError('Ошибка анализа: ' + e.message);
            document.getElementById('statusMessage').textContent = e.message;
            document.getElementById('statusMessage').classList.remove('text-warning', 'text-success');
            document.getElementById('statusMessage').classList.add('text-danger');
            this.resetUI(); // Сброс интерфейса при ошибке
        }
    }

    displayResults() {
        this.displaySummary();
        this.displayTestResults();
        this.displayAnomalies();
        this.generateCharts();

        document.getElementById('testResults').style.display = 'block';
        document.getElementById('visualizationPlaceholder').style.display = 'none';
        document.getElementById('chartsContainer').style.display = 'block';
    }

    displaySummary() {
        const summary = document.getElementById('analysisSummary');
        const entropyVal = this.analysisResults.entropy_per_byte;

        let statusClass, statusIcon, statusText;

        if (entropyVal >= 7.9) {
            statusClass = 'text-success';
            statusIcon = 'bi-check-circle-fill';
            statusText = 'Отличное качество (высокая энтропия)';
        } else if (entropyVal >= 7.0) {
            statusClass = 'text-warning';
            statusIcon = 'bi-exclamation-triangle';
            statusText = 'Удовлетворительное качество (средняя энтропия)';
        } else {
            statusClass = 'text-danger';
            statusIcon = 'bi-x-circle-fill';
            statusText = 'Низкое качество случайности';
        }

        summary.innerHTML = `
            <div class="score-circle mx-auto mb-3" style="width: 120px; height: 120px; border: 4px solid var(--bs-warning); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span class="display-6 fw-bold ${statusClass}">${entropyVal.toFixed(2)}</span>
            </div>
            <h5 class="${statusClass}">
                <i class="bi ${statusIcon} me-2"></i>${statusText}
            </h5>
            <p class="text-muted small">
                Максимальная энтропия: 8.00 бит/байт<br>
                Проверено: ${this.analysisResults.file_size_bytes} байт
            </p>
        `;
    }

    displayTestResults() {
        document.getElementById('fileSize').textContent = this.analysisResults.file_size_bytes;
        document.getElementById('entropy').textContent = this.analysisResults.entropy_per_byte.toFixed(4);
        document.getElementById('chi2').textContent = this.analysisResults.chi_square_stat;
    }

    displayAnomalies() {
        const anomaliesSection = document.getElementById('anomaliesSection');
        const anomaliesList = document.getElementById('anomaliesList');
        const anomalies = this.analysisResults.anomalies;

        if (anomalies && anomalies.length > 0) {
            anomaliesList.innerHTML = anomalies.map(anomaly => `
                <div class="alert alert-warning d-flex align-items-center">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    ${anomaly}
                </div>
            `).join('');
            anomaliesSection.style.display = 'block';
        } else {
            anomaliesList.innerHTML = `
                <div class="alert alert-success d-flex align-items-center">
                    <i class="bi bi-check-circle me-2"></i>
                    Базовые статистические аномалии не обнаружены.
                </div>
            `;
            anomaliesSection.style.display = 'block';
        }
    }

    generateCharts() {
        const container = document.getElementById('chartsContainer');
        const histogramDiv = document.getElementById('histogram');
        const histogramData = this.analysisResults.histogram;

        if (!histogramData) return;

        const maxVal = Math.max(...histogramData);

        histogramDiv.innerHTML = histogramData.map((val, i) => `
            <div class="d-flex align-items-center mb-2">
                <small class="text-muted me-2" style="width: 20px;">${(i*16).toString(16).toUpperCase()}-...</small>
                <div class="progress flex-grow-1 bg-dark-subtle" style="height: 10px;">
                    <div class="progress-bar bg-warning" style="width: ${maxVal ? (val / maxVal) * 100 : 0}%"></div>
                </div>
            </div>
        `).join('');
    }

    showError(message) {
        // Убрал стандартный alert, так как статус отображается в интерфейсе
    }
}

// Инициализация
const auditManager = new AuditManager();
document.addEventListener('DOMContentLoaded', () => auditManager.init());

// Глобальная функция для кнопки
function startAnalysis() {
    auditManager.startAnalysis();
}

// Дополнительные стили для drag-and-drop
const auditStyles = `
    .border-dashed {
        border-style: dashed !important;
    }

    .upload-area {
        transition: all 0.3s ease;
        cursor: pointer;
    }

    .upload-area:hover {
        background: rgba(255, 215, 0, 0.05) !important;
    }

    .score-circle {
        background: rgba(255, 215, 0, 0.1);
    }

    .chart-container {
        background: rgba(255, 215, 0, 0.05);
    }

    .bg-dark-subtle {
        background-color: #334155 !important;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = auditStyles;
document.head.appendChild(styleSheet);