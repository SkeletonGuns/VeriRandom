class GuideManager {
    constructor() {
        this.currentSection = 'section-intro';
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupScrollSpy();
        this.setupAccordions();
    }

    setupNavigation() {
        // Обработка кликов по навигации
        const navItems = document.querySelectorAll('.guide-nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Удаляем активный класс у всех элементов
                navItems.forEach(nav => nav.classList.remove('active'));
                
                // Добавляем активный класс текущему элементу
                item.classList.add('active');
                
                // Плавная прокрутка к секции
                const targetId = item.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupScrollSpy() {
        // Простой ScrollSpy для подсветки активного раздела
        const sections = document.querySelectorAll('.guide-section');
        const navItems = document.querySelectorAll('.guide-nav-item');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    this.setActiveNavItem(id);
                }
            });
        }, {
            rootMargin: '-20% 0px -60% 0px',
            threshold: 0
        });

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    setActiveNavItem(sectionId) {
        const navItems = document.querySelectorAll('.guide-nav-item');
        
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${sectionId}`) {
                item.classList.add('active');
            }
        });
    }

    setupAccordions() {
        // Добавляем анимации для аккордеонов
        const accordions = document.querySelectorAll('.accordion-button');
        
        accordions.forEach(accordion => {
            accordion.addEventListener('click', function() {
                const icon = this.querySelector('.bi');
                if (icon) {
                    if (this.classList.contains('collapsed')) {
                        icon.classList.remove('bi-chevron-down');
                        icon.classList.add('bi-chevron-up');
                    } else {
                        icon.classList.remove('bi-chevron-up');
                        icon.classList.add('bi-chevron-down');
                    }
                }
            });
        });
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new GuideManager();
});

// Дополнительные функции для руководства
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Добавляем иконки для аккордеонов
document.addEventListener('DOMContentLoaded', function() {
    const accordionButtons = document.querySelectorAll('.accordion-button');
    accordionButtons.forEach(button => {
        if (!button.querySelector('.bi')) {
            const icon = document.createElement('i');
            icon.className = 'bi bi-chevron-down ms-2';
            button.appendChild(icon);
        }
    });
});