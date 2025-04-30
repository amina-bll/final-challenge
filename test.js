document.addEventListener('DOMContentLoaded', function () {
    // THEME TOGGLE
    const themeSwitch = document.getElementById('theme-switch');
    const body = document.body;

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') body.classList.add('dark-theme');

    themeSwitch?.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
        localStorage.setItem('theme', body.classList.contains('dark-theme') ? 'dark' : 'light');
    });

    // MOBILE MENU TOGGLE
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    menuToggle?.addEventListener('click', () => {
        sidebar?.classList.toggle('active');
    });

    // SCROLL & NAVIGATION
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const target = document.querySelector(link.getAttribute('href'));
            target?.scrollIntoView({ behavior: 'smooth' });

            if (window.innerWidth <= 768) sidebar?.classList.remove('active');
        });
    });

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            if (window.pageYOffset >= section.offsetTop - 200) {
                current = section.id;
            }
        });
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    });

    // MODALS
    const modals = {
        tool: document.getElementById('tool-modal'),
        task: document.getElementById('task-modal'),
        idea: document.getElementById('idea-modal'),
        vision: document.getElementById('vision-modal'),
        goal: document.getElementById('goal-modal'),
    };

    const openModalButtons = {
        tool: document.getElementById('add-tool-btn'),
        task: document.getElementById('add-task-btn'),
        idea: document.getElementById('add-idea-btn'),
        vision: document.getElementById('add-vision-btn'),
        goal: document.querySelector('.edit-goal-btn'),
    };

    Object.entries(openModalButtons).forEach(([key, button]) => {
        button?.addEventListener('click', () => modals[key]?.classList.add('active'));
    });

    document.querySelectorAll('.close-modal, .cancel-btn').forEach(button => {
        button.addEventListener('click', () => {
            Object.values(modals).forEach(modal => modal?.classList.remove('active'));
        });
    });

    window.addEventListener('click', e => {
        Object.values(modals).forEach(modal => {
            if (e.target === modal) modal.classList.remove('active');
        });
    });

    // FORMS
    const forms = {
        tool: document.getElementById('tool-form'),
        task: document.getElementById('task-form'),
        idea: document.getElementById('idea-form'),
        vision: document.getElementById('vision-form'),
        goal: document.getElementById('goal-form'),
    };

    forms.tool?.addEventListener('submit', function (e) {
        e.preventDefault();
        addTool(
            this['tool-name'].value,
            this['tool-description'].value,
            this['tool-link'].value
        );
        this.reset();
        modals.tool.classList.remove('active');
    });

    forms.task?.addEventListener('submit', function (e) {
        e.preventDefault();
        addTask(this['task-name'].value);
        this.reset();
        modals.task.classList.remove('active');
    });

    forms.idea?.addEventListener('submit', function (e) {
        e.preventDefault();
        addIdea(this['idea-title'].value, this['idea-description'].value);
        this.reset();
        modals.idea.classList.remove('active');
    });

    forms.vision?.addEventListener('submit', function (e) {
        e.preventDefault();
        addVision(this['vision-title'].value, this['vision-description'].value);
        this.reset();
        modals.vision.classList.remove('active');
    });

    forms.goal?.addEventListener('submit', function (e) {
        e.preventDefault();
        updateMainGoal(this['goal-text'].value);
        this.reset();
        modals.goal.classList.remove('active');
    });

    // TOOL CREATION
    function addTool(name, description, link) {
        const container = document.getElementById('tools-container');
        const card = document.createElement('div');
        card.className = 'card tool-card';
        card.innerHTML = `
            <div class="card-header">
                <h3>${name}</h3>
                <button class="icon-button delete-btn" aria-label="Delete">
                    🗑
                </button>
            </div>
            <p>${description}</p>
            <a href="${link}" target="_blank" class="card-link">Open Tool</a>
        `;
        container.appendChild(card);
        card.querySelector('.delete-btn')?.addEventListener('click', () => card.remove());
    }

    // TASK CREATION
    function addTask(name) {
        const list = document.getElementById('tasks-list');
        const id = 'task' + Date.now();
        const item = document.createElement('li');
        item.className = 'task-item';
        item.innerHTML = `
            <input type="checkbox" id="${id}" class="task-checkbox">
            <label for="${id}">${name}</label>
            <button class="icon-button delete-task-btn" aria-label="Delete">🗑</button>
        `;
        list.appendChild(item);
        item.querySelector('.delete-task-btn')?.addEventListener('click', () => item.remove());
        item.querySelector('.task-checkbox')?.addEventListener('change', function () {
            const label = item.querySelector('label');
            label.style.textDecoration = this.checked ? 'line-through' : 'none';
            label.style.opacity = this.checked ? '0.6' : '1';
        });
    }

    // IDEA CREATION
    function addIdea(title, description) {
        const container = document.getElementById('ideas-container');
        const card = document.createElement('div');
        card.className = 'idea-card';
        card.innerHTML = `
            <div class="idea-header">
                <h3>${title}</h3>
                <button class="icon-button delete-idea-btn" aria-label="Delete">🗑</button>
            </div>
            <p>${description}</p>
            <div class="idea-meta"><span>${new Date().toLocaleDateString()}</span></div>
        `;
        container.appendChild(card);
        card.querySelector('.delete-idea-btn')?.addEventListener('click', () => card.remove());
    }

    // VISION CREATION
    function addVision(title, description) {
        const grid = document.querySelector('.vision-grid');
        const card = document.createElement('div');
        card.className = 'vision-card';
        card.innerHTML = `
            <div class="vision-header">
                <h3>${title}</h3>
                <button class="icon-button delete-vision-btn" aria-label="Delete">🗑</button>
            </div>
            <img src="/placeholder.svg?height=150&width=250" alt="${title}">
            <p>${description}</p>
        `;
        grid.appendChild(card);
        card.querySelector('.delete-vision-btn')?.addEventListener('click', () => card.remove());
    }

    // GOAL UPDATE
    function updateMainGoal(text) {
        const goal = document.getElementById('main-goal-content');
        goal.querySelector('p').textContent = text;
    }

    // TIMER
    const timerDisplay = document.getElementById('timer-display');
    const startBtn = document.getElementById('start-timer');
    const resetBtn = document.getElementById('reset-timer');

    let timer = null;
    let timeLeft = 25 * 60;
    let running = false;

    function updateDisplay() {
        const m = String(Math.floor(timeLeft / 60)).padStart(2, '0');
        const s = String(timeLeft % 60).padStart(2, '0');
        timerDisplay.textContent = `${m}:${s}`;
    }

    startBtn?.addEventListener('click', () => {
        if (running) {
            clearInterval(timer);
            startBtn.textContent = 'Start';
        } else {
            timer = setInterval(() => {
                if (--timeLeft <= 0) {
                    clearInterval(timer);
                    alert('Time is up!');
                    timeLeft = 25 * 60;
                }
                updateDisplay();
            }, 1000);
            startBtn.textContent = 'Pause';
        }
        running = !running;
    });

    resetBtn?.addEventListener('click', () => {
        clearInterval(timer);
        running = false;
        timeLeft = 25 * 60;
        updateDisplay();
        startBtn.textContent = 'Start';
    });

    updateDisplay();
});
