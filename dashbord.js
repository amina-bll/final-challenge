document.addEventListener('DOMContentLoaded', () => {
    // --------- Configuration ---------
    const CONFIG = {
        focusTimerDuration: 25 * 60, // 25 minutes en secondes
        selectors: {
            // DOM selectors pour les éléments importants
            themeSwitch: '#theme-switch',
            menuToggle: '.menu-toggle',
            sidebar: '.sidebar',
            navLinks: '.sidebar-nav a',
            sections: '.section',
            // Containers
            toolsContainer: '#tools-container',
            tasksList: '#tasks-list',
            ideasContainer: '#ideas-container',
            visionGrid: '.vision-grid',
            mainGoalContent: '#main-goal-content',
            // Timer
            timerDisplay: '#timer-display',
            startTimerBtn: '#start-timer',
            resetTimerBtn: '#reset-timer',
        },
        timerState: {
            timer: null,
            timeLeft: 25 * 60,
            isRunning: false
        }
    };

    // --------- Utilitaires ---------
    const utils = {
        /**
         * Sélecteur DOM simplifié
         * @param {string} selector - Sélecteur CSS
         * @param {Element} [parent=document] - Élément parent pour la recherche
         * @return {Element|null} - Element trouvé ou null
         */
        $(selector, parent = document) {
            return parent.querySelector(selector);
        },
        
        /**
         * Sélecteur DOM multiple simplifié
         * @param {string} selector - Sélecteur CSS
         * @param {Element} [parent=document] - Élément parent pour la recherche
         * @return {NodeList} - Liste des éléments trouvés
         */
        $$(selector, parent = document) {
            return parent.querySelectorAll(selector);
        },
        
        /**
         * Crée un élément avec des attributs et contenu
         * @param {string} tag - Tag HTML
         * @param {Object} attributes - Attributs de l'élément
         * @param {string|Element|Array} [content] - Contenu de l'élément
         * @return {Element} - Nouvel élément créé
         */
        createElement(tag, attributes = {}, content = null) {
            const element = document.createElement(tag);
            
            // Appliquer les attributs
            Object.entries(attributes).forEach(([key, value]) => {
                if (key === 'className') {
                    element.className = value;
                } else {
                    element.setAttribute(key, value);
                }
            });
            
            // Ajouter le contenu
            if (content) {
                if (typeof content === 'string') {
                    element.innerHTML = content;
                } else if (content instanceof Element) {
                    element.appendChild(content);
                } else if (Array.isArray(content)) {
                    content.forEach(item => {
                        if (typeof item === 'string') {
                            element.innerHTML += item;
                        } else if (item instanceof Element) {
                            element.appendChild(item);
                        }
                    });
                }
            }
            
            return element;
        },
        
        /**
         * Ajoute des événements à un élément
         * @param {Element} element - Élément cible
         * @param {Object} events - Paires événement/callback
         */
        addEvents(element, events) {
            Object.entries(events).forEach(([event, callback]) => {
                element.addEventListener(event, callback);
            });
        },
        
        /**
         * Format une date pour l'affichage
         * @return {string} - Date formatée
         */
        formatDate() {
            return new Date().toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            });
        }
    };

    // --------- Gestion du thème ---------
    const themeManager = {
        init() {
            const themeSwitch = utils.$(CONFIG.selectors.themeSwitch);
            const savedTheme = localStorage.getItem('theme');
            
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-theme');
            }
            
            utils.addEvents(themeSwitch, {
                click: () => {
                    document.body.classList.toggle('dark-theme');
                    const isDark = document.body.classList.contains('dark-theme');
                    localStorage.setItem('theme', isDark ? 'dark' : 'light');
                }
            });
        }
    };

    // --------- Navigation ---------
    const navigation = {
        init() {
            const menuToggle = utils.$(CONFIG.selectors.menuToggle);
            const sidebar = utils.$(CONFIG.selectors.sidebar);
            const navLinks = utils.$$(CONFIG.selectors.navLinks);
            
            // Menu mobile toggle
            utils.addEvents(menuToggle, {
                click: () => sidebar.classList.toggle('active')
            });
            
            // Navigation smooth scroll
            navLinks.forEach(link => {
                utils.addEvents(link, {
                    click: (e) => {
                        e.preventDefault();
                        
                        // Mise à jour de l'état actif
                        navLinks.forEach(l => l.classList.remove('active'));
                        link.classList.add('active');
                        
                        // Scroll vers la section
                        const targetId = link.getAttribute('href');
                        const targetSection = utils.$(targetId);
                        targetSection.scrollIntoView({ behavior: 'smooth' });
                        
                        // Ferme sidebar sur mobile
                        if (window.innerWidth <= 768) {
                            sidebar.classList.remove('active');
                        }
                    }
                });
            });
            
            // Suivi du scroll pour la navigation
            window.addEventListener('scroll', () => {
                const sections = utils.$$(CONFIG.selectors.sections);
                let current = '';
                
                sections.forEach(section => {
                    const sectionTop = section.offsetTop;
                    if (pageYOffset >= (sectionTop - 200)) {
                        current = section.getAttribute('id');
                    }
                });
                
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${current}`) {
                        link.classList.add('active');
                    }
                });
            });
        }
    };

    // --------- Gestionnaire de modales ---------
    const modalManager = {
        init() {
            // Référence les IDs de modales et leurs boutons d'ouverture
            const modals = {
                tool: { id: 'tool-modal', openBtn: 'add-tool-btn' },
                task: { id: 'task-modal', openBtn: 'add-task-btn' },
                idea: { id: 'idea-modal', openBtn: 'add-idea-btn' },
                vision: { id: 'vision-modal', openBtn: 'add-vision-btn' },
                goal: { id: 'goal-modal', openBtn: '.edit-goal-btn' }
            };
            
            // Configure les événements pour chaque modale
            Object.entries(modals).forEach(([key, config]) => {
                const modal = utils.$(`#${config.id}`);
                const openBtn = config.openBtn.startsWith('.') 
                    ? utils.$(config.openBtn) 
                    : utils.$(`#${config.openBtn}`);
                
                if (modal && openBtn) {
                    utils.addEvents(openBtn, {
                        click: () => modal.classList.add('active')
                    });
                    
                    // Boutons de fermeture dans la modale
                    utils.$$('.close-modal, .cancel-btn', modal).forEach(btn => {
                        utils.addEvents(btn, {
                            click: () => modal.classList.remove('active')
                        });
                    });
                    
                    // Fermeture en cliquant à l'extérieur
                    utils.addEvents(modal, {
                        click: (e) => {
                            if (e.target === modal) {
                                modal.classList.remove('active');
                            }
                        }
                    });
                }
            });
        }
    };

    // --------- Gestionnaire de contenu ---------
    const contentManager = {
        init() {
            // Initialise tous les formulaires
            this.initForms();
        },
        
        initForms() {
            // Formulaire d'ajout d'outil
            const toolForm = utils.$('#tool-form');
            if (toolForm) {
                utils.addEvents(toolForm, {
                    submit: (e) => {
                        e.preventDefault();
                        const name = utils.$('#tool-name').value;
                        const description = utils.$('#tool-description').value;
                        const link = utils.$('#tool-link').value;
                        
                        this.addTool(name, description, link);
                        
                        toolForm.reset();
                        utils.$('#tool-modal').classList.remove('active');
                    }
                });
            }
            
            // Formulaire de tâche
            const taskForm = utils.$('#task-form');
            if (taskForm) {
                utils.addEvents(taskForm, {
                    submit: (e) => {
                        e.preventDefault();
                        const taskName = utils.$('#task-name').value;
                        
                        this.addTask(taskName);
                        
                        taskForm.reset();
                        utils.$('#task-modal').classList.remove('active');
                    }
                });
            }
            
            // Formulaire d'idée
            const ideaForm = utils.$('#idea-form');
            if (ideaForm) {
                utils.addEvents(ideaForm, {
                    submit: (e) => {
                        e.preventDefault();
                        const title = utils.$('#idea-title').value;
                        const description = utils.$('#idea-description').value;
                        
                        this.addIdea(title, description);
                        
                        ideaForm.reset();
                        utils.$('#idea-modal').classList.remove('active');
                    }
                });
            }
            
            // Formulaire de vision
            const visionForm = utils.$('#vision-form');
            if (visionForm) {
                utils.addEvents(visionForm, {
                    submit: (e) => {
                        e.preventDefault();
                        const title = utils.$('#vision-title').value;
                        const description = utils.$('#vision-description').value;
                        
                        this.addVision(title, description);
                        
                        visionForm.reset();
                        utils.$('#vision-modal').classList.remove('active');
                    }
                });
            }
            
            // Formulaire d'objectif principal
            const goalForm = utils.$('#goal-form');
            if (goalForm) {
                utils.addEvents(goalForm, {
                    submit: (e) => {
                        e.preventDefault();
                        const goalText = utils.$('#goal-text').value;
                        
                        this.updateMainGoal(goalText);
                        
                        goalForm.reset();
                        utils.$('#goal-modal').classList.remove('active');
                    }
                });
            }
        },
        
        // Ajoute un nouvel outil
        addTool(name, description, link) {
            const container = utils.$(CONFIG.selectors.toolsContainer);
            if (!container) return;
            
            const toolCard = utils.createElement('div', { className: 'card tool-card' }, `
                <div class="card-header">
                    <h3>${name}</h3>
                    <div class="card-actions">
                        <button class="icon-button edit-btn" aria-label="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>
                        </button>
                        <button class="icon-button delete-btn" aria-label="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>
                <p>${description}</p>
                <a href="${link}" target="_blank" class="card-link">Open Tool</a>
            `);
            
            // Ajoute la gestion d'événements pour le bouton de suppression
            const deleteBtn = utils.$('.delete-btn', toolCard);
            utils.addEvents(deleteBtn, {
                click: () => toolCard.remove()
            });
            
            container.appendChild(toolCard);
            
            // Sauvegarde des données (pourrait être ajouté)
            this.saveData();
        },
        
        // Ajoute une nouvelle tâche
        addTask(taskName) {
            const tasksList = utils.$(CONFIG.selectors.tasksList);
            if (!tasksList) return;
            
            const taskId = 'task' + Date.now();
            const taskItem = utils.createElement('li', { className: 'task-item' }, `
                <input type="checkbox" id="${taskId}" class="task-checkbox">
                <label for="${taskId}">${taskName}</label>
                <div class="task-actions">
                    <button class="icon-button edit-task-btn" aria-label="Edit task">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>
                    </button>
                    <button class="icon-button delete-task-btn" aria-label="Delete task">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                </div>
            `);
            
            // Configuration du bouton de suppression
            const deleteBtn = utils.$('.delete-task-btn', taskItem);
            utils.addEvents(deleteBtn, {
                click: () => taskItem.remove()
            });
            
            // Configuration de la case à cocher
            const checkbox = utils.$('.task-checkbox', taskItem);
            utils.addEvents(checkbox, {
                change: function() {
                    const label = taskItem.querySelector('label');
                    if (this.checked) {
                        label.style.textDecoration = 'line-through';
                        label.style.opacity = '0.6';
                    } else {
                        label.style.textDecoration = 'none';
                        label.style.opacity = '1';
                    }
                }
            });
            
            tasksList.appendChild(taskItem);
            this.saveData();
        },
        
        // Ajoute une nouvelle idée
        addIdea(title, description) {
            const container = utils.$(CONFIG.selectors.ideasContainer);
            if (!container) return;
            
            const ideaCard = utils.createElement('div', { className: 'idea-card' }, `
                <div class="idea-header">
                    <h3>${title}</h3>
                    <div class="idea-actions">
                        <button class="icon-button edit-idea-btn" aria-label="Edit idea">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>
                        </button>
                        <button class="icon-button delete-idea-btn" aria-label="Delete idea">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>
                <p>${description}</p>
                <div class="idea-meta">
                    <span class="idea-date">${utils.formatDate()}</span>
                </div>
            `);
            
            // Ajoute la gestion de la suppression
            const deleteBtn = utils.$('.delete-idea-btn', ideaCard);
            utils.addEvents(deleteBtn, {
                click: () => ideaCard.remove()
            });
            
            container.appendChild(ideaCard);
            this.saveData();
        },
        
        // Ajoute une nouvelle vision
        addVision(title, description) {
            const container = utils.$(CONFIG.selectors.visionGrid);
            if (!container) return;
            
            const visionCard = utils.createElement('div', { className: 'vision-card' }, `
                <div class="vision-header">
                    <h3>${title}</h3>
                    <div class="vision-actions">
                        <button class="icon-button edit-vision-btn" aria-label="Edit vision">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>
                        </button>
                        <button class="icon-button delete-vision-btn" aria-label="Delete vision">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>
                <div class="vision-image">
                    <img src="/api/placeholder/250/150" alt="${title} visualization">
                </div>
                <p>${description}</p>
            `);
            
            // Ajoute la gestion de la suppression
            const deleteBtn = utils.$('.delete-vision-btn', visionCard);
            utils.addEvents(deleteBtn, {
                click: () => visionCard.remove()
            });
            
            container.appendChild(visionCard);
            this.saveData();
        },
        
        // Met à jour l'objectif principal
        updateMainGoal(goalText) {
            const mainGoalContent = utils.$(CONFIG.selectors.mainGoalContent);
            if (mainGoalContent) {
                utils.$('p', mainGoalContent).textContent = goalText;
                this.saveData();
            }
        },
        
        //  (LocalStorage)
        saveData() {
            // Implémentation pour sauvegarder les données dans le LocalStorage
            
        }
    };

    // --------- Gestionnaire de minuteur ---------
    const timerManager = {
        init() {
            const timerDisplay = utils.$(CONFIG.selectors.timerDisplay);
            const startTimerBtn = utils.$(CONFIG.selectors.startTimerBtn);
            const resetTimerBtn = utils.$(CONFIG.selectors.resetTimerBtn);
            
            // Initialise l'affichage
            this.updateDisplay();
            
            // Configuration des boutons
            utils.addEvents(startTimerBtn, {
                click: () => this.toggleTimer()
            });
            
            utils.addEvents(resetTimerBtn, {
                click: () => this.resetTimer()
            });
        },
        
        // Mise à jour de l'affichage du minuteur
        updateDisplay() {
            const timerDisplay = utils.$(CONFIG.selectors.timerDisplay);
            if (!timerDisplay) return;
            
            const minutes = Math.floor(CONFIG.timerState.timeLeft / 60);
            const seconds = CONFIG.timerState.timeLeft % 60;
            
            timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        },
        
        // Démarre ou met en pause le minuteur
        toggleTimer() {
            const startTimerBtn = utils.$(CONFIG.selectors.startTimerBtn);
            if (!startTimerBtn) return;
            
            if (CONFIG.timerState.isRunning) {
                // Pause
                clearInterval(CONFIG.timerState.timer);
                CONFIG.timerState.isRunning = false;
                startTimerBtn.textContent = 'Start';
            } else {
                // Démarrage
                CONFIG.timerState.isRunning = true;
                startTimerBtn.textContent = 'Pause';
                
                CONFIG.timerState.timer = setInterval(() => {
                    CONFIG.timerState.timeLeft--;
                    this.updateDisplay();
                    
                    if (CONFIG.timerState.timeLeft <= 0) {
                        this.timerComplete();
                    }
                }, 1000);
            }
        },
        
        // Réinitialise le minuteur
        resetTimer() {
            clearInterval(CONFIG.timerState.timer);
            CONFIG.timerState.isRunning = false;
            CONFIG.timerState.timeLeft = CONFIG.focusTimerDuration;
            
            const startTimerBtn = utils.$(CONFIG.selectors.startTimerBtn);
            if (startTimerBtn) startTimerBtn.textContent = 'Start';
            
            this.updateDisplay();
        },
        
        // Action à la fin du minuteur
        timerComplete() {
            clearInterval(CONFIG.timerState.timer);
            CONFIG.timerState.isRunning = false;
            
            const startTimerBtn = utils.$(CONFIG.selectors.startTimerBtn);
            if (startTimerBtn) startTimerBtn.textContent = 'Start';
            
            // Notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Temps écoulé!', {
                    body: 'Votre session de concentration est terminée.',
                    icon: '/favicon.ico'
                });
            } else {
                alert('Temps écoulé!');
            }
            
            // Réinitialisation
            CONFIG.timerState.timeLeft = CONFIG.focusTimerDuration;
            this.updateDisplay();
        }
    };
    
    // --------- Initialisation de l'application ---------
    const app = {
        init() {
            // Initialise tous les modules
            themeManager.init();
            navigation.init();
            modalManager.init();
            contentManager.init();
            timerManager.init();
            
            // Permissions de notification pour le timer
            if ('Notification' in window && Notification.permission !== 'denied') {
                Notification.requestPermission();
            }
            
            console.log('Anti-Dispersion Hub initialized');
        }
    };
    
    // Démarrage de l'application
    app.init();
});