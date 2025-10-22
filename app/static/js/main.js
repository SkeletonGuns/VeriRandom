// main.js 
class AnimationManager {
    constructor() {
        this.init();
    }

    init() {
        this.createParticles();
        this.createBinaryStreams();
        this.initScrollAnimations();
        this.initHoverEffects();
    }

    createParticles() {
        const container = document.getElementById('particlesContainer');
        if (!container) return;

        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Случайная позиция
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.top = Math.random() * 100 + 'vh';
            
            // Случайная задержка анимации
            particle.style.animationDelay = Math.random() * 6 + 's';
            
            container.appendChild(particle);
        }
    }

    createBinaryStreams() {
        const heroSection = document.querySelector('.hero-section');
        if (!heroSection) return;

        for (let i = 0; i < 3; i++) {
            const stream = document.createElement('div');
            stream.className = 'binary-stream';
            
            // Генерация случайного бинарного кода
            let binary = '';
            for (let j = 0; j < 40; j++) {
                binary += Math.round(Math.random());
            }
            stream.textContent = binary;
            
            // Случайная позиция по вертикали
            stream.style.top = (20 + i * 30) + '%';
            stream.style.animationDelay = (i * 2) + 's';
            
            heroSection.appendChild(stream);
        }
    }

    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Наблюдаем за всеми neo-card
        document.querySelectorAll('.neo-card').forEach(card => {
            observer.observe(card);
        });
    }

    initHoverEffects() {
        // Добавляем эффект свечения при наведении на ссылки
        document.querySelectorAll('a').forEach(link => {
            link.addEventListener('mouseenter', function() {
                this.classList.add('hover-glow');
            });
            
            link.addEventListener('mouseleave', function() {
                this.classList.remove('hover-glow');
            });
        });
    }
}

// Класс для управления энтропией
class EntropyGenerator {
    constructor() {
        this.sources = [];
        this.isCollecting = false;
    }
    
    startCollection() {
        this.isCollecting = true;
        console.log('Начало сбора энтропии...');
    }
    
    stopCollection() {
        this.isCollecting = false;
        console.log('Сбор энтропии завершен');
    }
    
    addSource(source) {
        this.sources.push(source);
    }

    // Генерация случайной последовательности с визуализацией
    generateSequence(length = 6) {
        const sequence = [];
        const container = document.querySelector('.lottery-numbers');
        
        if (container) {
            container.innerHTML = '';
            
            for (let i = 0; i < length; i++) {
                setTimeout(() => {
                    const number = Math.floor(Math.random() * 100).toString().padStart(2, '0');
                    sequence.push(number);
                    
                    const numberElement = document.createElement('div');
                    numberElement.className = 'number-circle animate-pop';
                    numberElement.textContent = number;
                    container.appendChild(numberElement);
                    
                    // Анимация появления
                    setTimeout(() => {
                        numberElement.classList.remove('animate-pop');
                    }, 500);
                    
                }, i * 300);
            }
        }
        
        return sequence;
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Запуск анимаций
    new AnimationManager();
    
    // Инициализация генератора энтропии
    window.entropyGenerator = new EntropyGenerator();
    
    // Анимация для кнопок
    animateButtons();
    
    // Параллакс эффект для героя
    initParallax();
});

function animateButtons() {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Создаем эффект ripple
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple-animation 0.6s linear;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
            `;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

function initParallax() {
    const hero = document.querySelector('.hero-section');
    if (!hero) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        hero.style.transform = `translateY(${rate}px)`;
    });
}

// Добавляем стили для анимаций
const dynamicStyles = `
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .hover-glow {
        transition: all 0.3s ease;
        text-shadow: 0 0 10px currentColor;
    }
    
    .number-circle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 80px;
        height: 80px;
        border: 3px solid #ffd700;
        border-radius: 50%;
        font-size: 2rem;
        font-weight: bold;
        margin: 0 10px;
        background: rgba(255, 215, 0, 0.1);
        color: #ffd700;
        transition: all 0.3s ease;
    }
    
    .animate-pop {
        animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    
    @keyframes popIn {
        0% {
            transform: scale(0);
            opacity: 0;
        }
        70% {
            transform: scale(1.1);
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }
    
    .animate-in {
        animation: slideInUp 0.8s ease-out;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(50px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

// Добавляем стили в документ
const styleSheet = document.createElement('style');
styleSheet.textContent = dynamicStyles;
document.head.appendChild(styleSheet);