// interactive-guide.js
class InteractiveGuide {
    constructor() {
        this.currentEntropy = 30;
        this.generatedSequence = [];
        this.init();
    }

    init() {
        this.createEntropyDots();
        this.setupStepAnimations();
        this.initDistributionChart();
    }

    createEntropyDots() {
        const container = document.getElementById('entropyDots');
        if (!container) return;

        for (let i = 0; i < 50; i++) {
            const dot = document.createElement('div');
            dot.className = 'entropy-dot';
            dot.style.cssText = `
                width: 8px;
                height: 8px;
                background: #333;
                border-radius: 50%;
                display: inline-block;
                margin: 2px;
                transition: all 0.3s ease;
            `;
            container.appendChild(dot);
        }
    }

    setupStepAnimations() {
        const steps = document.querySelectorAll('.guide-step');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'slideInUp 0.8s ease-out';
                }
            });
        }, {
            threshold: 0.1
        });

        steps.forEach(step => observer.observe(step));
    }

    initDistributionChart() {
        const canvas = document.getElementById('distributionChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Очистка canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Сетка
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        
        // Горизонтальные линии
        for (let i = 0; i <= 5; i++) {
            const y = i * 30;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(200, y);
            ctx.stroke();
        }
        
        ctx.fillStyle = '#666';
        ctx.font = '10px Arial';
        ctx.fillText('Равномерное распределение', 50, 140);
    }

    updateEntropyVisualization() {
        const dots = document.querySelectorAll('.entropy-dot');
        const activeDots = Math.floor((this.currentEntropy / 100) * dots.length);

        dots.forEach((dot, index) => {
            if (index < activeDots) {
                const intensity = (index / dots.length) * 255;
                dot.style.background = `rgb(255, 215, ${255 - intensity})`;
                dot.style.transform = 'scale(1.2)';
            } else {
                dot.style.background = '#333';
                dot.style.transform = 'scale(1)';
            }
        });

        // Обновление progress bar
        const entropyBar = document.getElementById('entropyBar');
        if (entropyBar) {
            entropyBar.style.width = this.currentEntropy + '%';
            entropyBar.textContent = this.currentEntropy >= 70 ? 
                'Высокая энтропия' : 
                this.currentEntropy >= 40 ? 'Средняя энтропия' : 'Низкая энтропия';
        }
    }

    generateRandomNumbers(count = 6) {
        const numbers = [];
        for (let i = 0; i < count; i++) {
            // Качество чисел зависит от уровня энтропии
            const quality = this.currentEntropy / 100;
            const baseRandom = Math.random();
            
            // Добавляем "шум" в зависимости от энтропии
            const enhancedRandom = quality > 0.7 ? 
                baseRandom : 
                baseRandom * quality + (1 - quality) * (i / count);
                
            numbers.push(Math.floor(enhancedRandom * 100));
        }
        return numbers;
    }

    runStatisticalTests(numbers) {
        // Простая имитация статистических тестов
        const frequencyTest = this.frequencyTest(numbers);
        const runsTest = this.runsTest(numbers);
        
        // Обновление UI
        this.updateTestResult('frequencyTest', frequencyTest);
        this.updateTestResult('runsTest', runsTest);
        
        // Общая оценка
        const overallScore = (frequencyTest + runsTest) / 2;
        this.updateTestResult('overallTest', overallScore);
        
        // Обновление графика распределения
        this.updateDistributionChart(numbers);
    }

    frequencyTest(numbers) {
        // Простой тест частот - проверяем равномерность распределения
        const buckets = Array(10).fill(0);
        numbers.forEach(num => {
            const bucket = Math.floor(num / 10);
            buckets[bucket]++;
        });
        
        const expected = numbers.length / 10;
        const chiSquare = buckets.reduce((sum, freq) => {
            return sum + Math.pow(freq - expected, 2) / expected;
        }, 0);
        
        // Нормализуем до 0-1 (чем ближе к 1, тем лучше)
        return Math.max(0, 1 - chiSquare / 20);
    }

    runsTest(numbers) {
        // Простой тест серий
        let runs = 1;
        let previousAbove = numbers[0] > 50;
        
        for (let i = 1; i < numbers.length; i++) {
            const currentAbove = numbers[i] > 50;
            if (currentAbove !== previousAbove) {
                runs++;
                previousAbove = currentAbove;
            }
        }
        
        const expectedRuns = (2 * numbers.length - 1) / 3;
        const score = 1 - Math.abs(runs - expectedRuns) / expectedRuns;
        
        return Math.max(0, score);
    }

    updateTestResult(elementId, score) {
        const element = document.getElementById(elementId);
        if (!element) return;

        let icon, color, text;
        
        if (score > 0.8) {
            icon = 'bi-check-circle-fill';
            color = 'text-success';
            text = 'Отлично';
        } else if (score > 0.6) {
            icon = 'bi-exclamation-triangle';
            color = 'text-warning';
            text = 'Удовлетворительно';
        } else {
            icon = 'bi-x-circle-fill';
            color = 'text-danger';
            text = 'Требует внимания';
        }

        element.innerHTML = `
            <i class="bi ${icon} ${color} me-1"></i>
            <span class="${color}">${text}</span>
        `;
    }

    updateDistributionChart(numbers) {
        const canvas = document.getElementById('distributionChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Создаем гистограмму
        const buckets = Array(10).fill(0);
        numbers.forEach(num => {
            const bucket = Math.floor(num / 10);
            buckets[bucket]++;
        });

        const maxFreq = Math.max(...buckets);
        const barWidth = 18;
        const spacing = 2;

        ctx.fillStyle = '#ffd700';
        
        buckets.forEach((freq, index) => {
            const barHeight = (freq / maxFreq) * 100;
            const x = index * (barWidth + spacing) + 10;
            const y = 120 - barHeight;
            
            ctx.fillRect(x, y, barWidth, barHeight);
        });

        // Сетка
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = i * 30;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(200, y);
            ctx.stroke();
        }
    }
}

// Глобальные функции
let guide;

document.addEventListener('DOMContentLoaded', function() {
    guide = new InteractiveGuide();
});

function increaseEntropy() {
    if (guide.currentEntropy < 100) {
        guide.currentEntropy += 10;
        if (guide.currentEntropy > 100) guide.currentEntropy = 100;
        guide.updateEntropyVisualization();
    }
}

function generateRandomSequence() {
    const numbers = guide.generateRandomNumbers(6);
    guide.generatedSequence = numbers;
    
    // Отображение последовательности
    const numberGrid = document.getElementById('numberGrid');
    const sequenceInfo = document.getElementById('sequenceInfo');
    
    numberGrid.innerHTML = '';
    sequenceInfo.textContent = 'Генерация...';
    
    numbers.forEach((num, index) => {
        setTimeout(() => {
            const numberElement = document.createElement('div');
            numberElement.className = 'number-bubble';
            numberElement.textContent = num.toString().padStart(2, '0');
            numberElement.style.animation = 'popIn 0.5s ease-out';
            numberGrid.appendChild(numberElement);
            
            if (index === numbers.length - 1) {
                sequenceInfo.textContent = `Сгенерировано ${numbers.length} чисел`;
                // Запуск тестов
                setTimeout(() => guide.runStatisticalTests(numbers), 500);
            }
        }, index * 200);
    });
}

// Стили для интерактивного руководства
const guideStyles = `
    .number-bubble {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 60px;
        height: 60px;
        background: rgba(255, 215, 0, 0.2);
        border: 2px solid #ffd700;
        border-radius: 15px;
        font-size: 1.5rem;
        font-weight: bold;
        margin: 5px;
        color: #ffd700;
    }
    
    .entropy-dots {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 5px;
        padding: 20px;
    }
    
    .step-badge {
        font-weight: bold;
        font-size: 1.1rem;
    }
    
    .success-check {
        animation: bounceIn 1s ease-out;
    }
    
    @keyframes bounceIn {
        0% {
            transform: scale(0);
            opacity: 0;
        }
        50% {
            transform: scale(1.2);
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }
    
    .guide-step {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.8s ease-out;
    }
    
    .guide-step.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
`;

const guideStyleSheet = document.createElement('style');
guideStyleSheet.textContent = guideStyles;
document.head.appendChild(guideStyleSheet);