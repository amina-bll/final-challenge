document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle
    const themeSwitch = document.getElementById('theme-switch');
    const body = document.body;
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
    }
    
    themeSwitch.addEventListener('click', function() {
        body.classList.toggle('dark-theme');
        const currentTheme = body.classList.contains('dark-theme') ? 'dark' : 'light';
        localStorage.setItem('theme', currentTheme);
    });
    
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
    
    // Navigation
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const sections = document.querySelectorAll('.section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(link => link.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Get the target section
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            // Scroll to the target section
            targetSection.scrollIntoView({ behavior: 'smooth' });
            
            // Close mobile menu if open
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
        });
    });
    
    // Highlight active section on scroll
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
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
    
    // Modal functionality
    const modals = {
        tool: document.getElementById('tool-modal'),
        task: document.getElementById('task-modal'),
        idea: document.getElementById('idea-modal'),
        vision: document.getElementById('vision-modal'),
        goal: document.getElementById('goal-modal')
    };
    
    const openModalButtons = {
        tool: document.getElementById('add-tool-btn'),
        task: document.getElementById('add-task-btn'),
        idea: document.getElementById('add-idea-btn'),
        vision: document.getElementById('add-vision-btn'),
        goal: document.querySelector('.edit-goal-btn')
    };
    
    const closeModalButtons = document.querySelectorAll('.close-modal, .cancel-btn');
    
    // Open modals
    for (const [key, button] of Object.entries(openModalButtons)) {
        button.addEventListener('click', function() {
            modals[key].classList.add('active');
        });
    }
    
    // Close modals
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            for (const modal of Object.values(modals)) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        for (const [key, modal] of Object.entries(modals)) {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        }
    });
    
    // Form submissions
    const forms = {
        tool: document.getElementById('tool-form'),
        task: document.getElementById('task-form'),
        idea: document.getElementById('idea-form'),
        vision: document.getElementById('vision-form'),
        goal: document.getElementById('goal-form')
    };
    
    // Tool form submission
    forms.tool.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('tool-name').value;
        const description = document.getElementById('tool-description').value;
        const link = document.getElementById('tool-link').value;
        
        addTool(name, description, link);
        
        // Reset form and close modal
        this.reset();
        modals.tool.classList.remove('active');
    });
    
    // Task form submission
    forms.task.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const taskName = document.getElementById('task-name').value;
        
        addTask(taskName);
        
        // Reset form and close modal
        this.reset();
        modals.task.classList.remove('active');
    });
    
    // Idea form submission
    forms.idea.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('idea-title').value;
        const description = document.getElementById('idea-description').value;
        
        addIdea(title, description);
        
        // Reset form and close modal
        this.reset();
        modals.idea.classList.remove('active');
    });
    
    // Vision form submission
    forms.vision.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('vision-title').value;
        const description = document.getElementById('vision-description').value;
        
        addVision(title, description);
        
        // Reset form and close modal
        this.reset();
        modals.vision.classList.remove('active');
    });
    
    // Goal form submission
    forms.goal.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const goalText = document.getElementById('goal-text').value;
        
        updateMainGoal(goalText);
        
        // Reset form and close modal
        this.reset();
        modals.goal.classList.remove('active');
    });
    
    // Add new tool
    function addTool(name, description, link) {
        const toolsContainer = document.getElementById('tools-container');
        
        const toolCard = document.createElement('div');
        toolCard.className = 'card tool-card';
        
        toolCard.innerHTML = `
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
        `;
        
        toolsContainer.appendChild(toolCard);
        
        // Add event listeners for edit and delete buttons
        const deleteBtn = toolCard.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', function() {
            toolCard.remove();
        });
    }
    
    // Add new task
    function addTask(taskName) {
        const tasksList = document.getElementById('tasks-list');
        const taskId = 'task' + Date.now();
        
        const taskItem = document.createElement('li');
        taskItem.className = 'task-item';
        
        taskItem.innerHTML = `
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
        `;
        
        tasksList.appendChild(taskItem);
        
        // Add event listeners for delete button
        const deleteBtn = taskItem.querySelector('.delete-task-btn');
        deleteBtn.addEventListener('click', function() {
            taskItem.remove();
        });
        
        // Add event listener for checkbox
        const checkbox = taskItem.querySelector('.task-checkbox');
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                taskItem.querySelector('label').style.textDecoration = 'line-through';
                taskItem.querySelector('label').style.opacity = '0.6';
            } else {
                taskItem.querySelector('label').style.textDecoration = 'none';
                taskItem.querySelector('label').style.opacity = '1';
            }
        });
    }
    
    // Add new idea
    function addIdea(title, description) {
        const ideasContainer = document.getElementById('ideas-container');
        
        const ideaCard = document.createElement('div');
        ideaCard.className = 'idea-card';
        
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        
        ideaCard.innerHTML = `
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
                <span class="idea-date">${formattedDate}</span>
            </div>
        `;
        
        ideasContainer.appendChild(ideaCard);
        
        // Add event listeners for delete button
        const deleteBtn = ideaCard.querySelector('.delete-idea-btn');
        deleteBtn.addEventListener('click', function() {
            ideaCard.remove();
        });
    }
    
    // Add new vision
    function addVision(title, description) {
        const visionGrid = document.querySelector('.vision-grid');
        
        const visionCard = document.createElement('div');
        visionCard.className = 'vision-card';
        
        visionCard.innerHTML = `
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
                <img src="/placeholder.svg?height=150&width=250" alt="${title} visualization">
            </div>
            <p>${description}</p>
        `;
        
        visionGrid.appendChild(visionCard);
        
        // Add event listeners for delete button
        const deleteBtn = visionCard.querySelector('.delete-vision-btn');
        deleteBtn.addEventListener('click', function() {
            visionCard.remove();
        });
    }
    
    // Update main goal
    function updateMainGoal(goalText) {
        const mainGoalContent = document.getElementById('main-goal-content');
        mainGoalContent.querySelector('p').textContent = goalText;
    }
    
    // Focus Timer
    const timerDisplay = document.getElementById('timer-display');
    const startTimerBtn = document.getElementById('start-timer');
    const resetTimerBtn = document.getElementById('reset-timer');
    
    let timer;
    let timeLeft = 25 * 60; // 25 minutes in seconds
    let timerRunning = false;
    
    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    startTimerBtn.addEventListener('click', function() {
        if (timerRunning) {
            // Pause timer
            clearInterval(timer);
            timerRunning = false;
            startTimerBtn.textContent = 'Start';
        } else {
            // Start timer
            timerRunning = true;
            startTimerBtn.textContent = 'Pause';
            
            timer = setInterval(function() {
                timeLeft--;
                updateTimerDisplay();
                
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    timerRunning = false;
                    startTimerBtn.textContent = 'Start';
                    
                    // Play sound or notification
                    alert('Time is up!');
                    
                    // Reset timer
                    timeLeft = 25 * 60;
                    updateTimerDisplay();
                }
            }, 1000);
        }
    });
    
    resetTimerBtn.addEventListener('click', function() {
        clearInterval(timer);
        timerRunning = false;
        startTimerBtn.textContent = 'Start';
        timeLeft = 25 * 60;
        updateTimerDisplay();
    });
    
    // Initialize the app
    updateTimerDisplay();
});