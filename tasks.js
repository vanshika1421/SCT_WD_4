// Tasks Page JavaScript
class TasksApp {
    constructor() {
        // Initialize dark mode manager
        this.darkModeManager = new DarkModeManager();
        
        // Load existing tasks
        this.tasks = this.loadTasks();
        console.log('📊 Current tasks loaded:', this.tasks.length);
        console.log('📋 Tasks data:', this.tasks);
        
        // Create sample tasks for testing if no tasks exist
        if (this.tasks.length === 0) {
            console.log('🎯 No tasks found, creating sample tasks for testing...');
            this.createSampleTasks();
            console.log('📊 Sample tasks created, total now:', this.tasks.length);
        }
        this.currentFilter = 'all';
        this.currentSort = 'newest';
        this.searchQuery = '';
        this.initializeEventListeners();
        this.renderTasks();
        
        // Show current task count
        this.showTaskCount();
        
        // Set initial filter button as active
        setTimeout(() => {
            const allTasksBtn = document.querySelector('[data-filter="all"]');
            if (allTasksBtn) {
                allTasksBtn.classList.add('active');
                console.log('✅ Set All Tasks button as active');
            }
            
            // Set initial sort dropdown value
            const sortSelect = document.getElementById('sortSelect');
            if (sortSelect) {
                sortSelect.value = this.currentSort;
                console.log('✅ Set sort dropdown to:', this.currentSort);
            }
        }, 100);
    }

    initializeEventListeners() {
        // Task form submission
        const taskForm = document.getElementById('taskForm');
        if (taskForm) {
            taskForm.addEventListener('submit', (e) => this.handleTaskSubmit(e));
        }

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        // Sort dropdown
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            console.log('✅ Sort dropdown found, adding event listener');
            sortSelect.addEventListener('change', (e) => {
                console.log('🔄 Sort dropdown changed to:', e.target.value);
                this.setSortBy(e.target.value);
            });
        } else {
            console.error('❌ Sort dropdown not found!');
        }

        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Mobile navigation toggle
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }
    }

    handleTaskSubmit(e) {
        e.preventDefault();
        console.log('📝 Task submission triggered!');

        const form = e.target;
        const editId = form.dataset.editId;
        console.log('🔧 Edit ID from form:', editId);

        const taskText = document.getElementById('taskInput').value.trim();
        const taskDate = document.getElementById('taskDate').value;
        const taskTime = document.getElementById('taskTime').value;
        const taskPriority = document.getElementById('taskPriority').value;
        const taskCategory = document.getElementById('taskCategory').value;

        console.log('📋 Form data:', { taskText, taskDate, taskTime, taskPriority, taskCategory, editId });

        if (!taskText) {
            this.showNotification('Please enter a task description!', 'error');
            return;
        }

        if (editId) {
            // Update existing task
            const task = this.tasks.find(t => t.id === editId);
            if (task) {
                task.text = taskText;
                task.date = taskDate || new Date().toISOString().split('T')[0];
                task.time = taskTime;
                task.priority = taskPriority;
                task.category = taskCategory;
                task.updatedAt = new Date().toISOString();
                
                this.saveTasks();
                this.renderTasks();
                this.clearForm();
                this.showNotification('Task updated successfully!', 'success');
                console.log('✅ Task updated:', task);
            }
        } else {
            // Create new task
            const task = {
                id: this.generateId(),
                text: taskText,
                completed: false,
                date: taskDate || new Date().toISOString().split('T')[0],
                time: taskTime,
                priority: taskPriority,
                category: taskCategory,
                createdAt: new Date().toISOString()
            };

            console.log('🆕 Creating new task:', task);
            this.tasks.unshift(task);
            this.saveTasks();
            this.renderTasks();
            this.clearForm();
            this.showNotification('Task added successfully!', 'success');
            console.log('✅ Task added successfully! Total tasks:', this.tasks.length);
        }
    }    setFilter(filter) {
        console.log('🔍 Setting filter to:', filter);
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            console.log('✅ Active button updated for filter:', filter);
        } else {
            console.error('❌ No button found for filter:', filter);
        }
        
        this.renderTasks();
    }

    setSortBy(sortBy) {
        console.log('🔄 Setting sort to:', sortBy);
        this.currentSort = sortBy;
        this.renderTasks();
    }

    handleSearch(query) {
        this.searchQuery = query.toLowerCase();
        this.renderTasks();
    }

    renderTasks() {
        console.log('📋 Rendering tasks with filter:', this.currentFilter);
        let filteredTasks = [...this.tasks];
        console.log('📊 Total tasks before filtering:', filteredTasks.length);

        // Apply filter
        if (this.currentFilter === 'all') {
            // Show all tasks - no filtering needed
            console.log('🔍 Showing all tasks');
        } else if (this.currentFilter === 'completed') {
            filteredTasks = filteredTasks.filter(task => task.completed);
        } else if (this.currentFilter === 'pending') {
            filteredTasks = filteredTasks.filter(task => !task.completed);
        } else if (this.currentFilter === 'today') {
            const today = new Date().toISOString().split('T')[0];
            filteredTasks = filteredTasks.filter(task => task.date === today);
        } else if (this.currentFilter === 'overdue') {
            const today = new Date().toISOString().split('T')[0];
            filteredTasks = filteredTasks.filter(task => 
                !task.completed && task.date && task.date < today
            );
        }

        console.log('📊 Tasks after filtering:', filteredTasks.length);

        // Apply search
        if (this.searchQuery) {
            filteredTasks = filteredTasks.filter(task => 
                task.text.toLowerCase().includes(this.searchQuery) ||
                task.category.toLowerCase().includes(this.searchQuery)
            );
        }

        // Apply sort
        console.log('🔄 Sorting by:', this.currentSort);
        filteredTasks.sort((a, b) => {
            switch (this.currentSort) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'priority':
                    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                case 'deadline':
                    if (!a.date && !b.date) return 0;
                    if (!a.date) return 1;
                    if (!b.date) return -1;
                    return new Date(a.date) - new Date(b.date);
                case 'alphabetical':
                    return a.text.localeCompare(b.text);
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });
        console.log('✅ Tasks sorted, first task:', filteredTasks[0]?.text);

        const container = document.getElementById('todoList');
        console.log('📋 Tasks container found:', !!container);
        if (!container) {
            console.error('❌ Tasks container not found! Looking for element with id="todoList"');
            return;
        }

        if (filteredTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>No tasks found</h3>
                    <p>Add a new task to get started!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-checkbox">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} 
                           onchange="tasksApp.toggleTask('${task.id}')">
                </div>
                <div class="task-content">
                    <div class="task-text">${task.text}</div>
                    <div class="task-meta">
                        <span class="task-date"><i class="fas fa-calendar"></i> ${task.date}</span>
                        ${task.time ? `<span class="task-time"><i class="fas fa-clock"></i> ${task.time}</span>` : ''}
                        <span class="task-category"><i class="fas fa-tag"></i> ${task.category}</span>
                    </div>
                </div>
                <div class="task-priority priority-${task.priority}"></div>
                <div class="task-actions">
                    <button onclick="tasksApp.editTask('${task.id}')" class="edit-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="tasksApp.deleteTask('${task.id}')" class="delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        this.updateTaskStats();
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.saveTasks();
            this.renderTasks();
            this.showNotification(task.completed ? 'Task completed!' : 'Task marked as pending!', 'success');
        }
    }

    editTask(taskId) {
        console.log('🔧 Edit task called with ID:', taskId);
        const task = this.tasks.find(t => t.id === taskId);
        console.log('🔍 Found task:', task);
        
        if (!task) {
            console.error('❌ Task not found with ID:', taskId);
            this.showNotification('Task not found!', 'error');
            return;
        }

        // Fill form with task data
        document.getElementById('taskInput').value = task.text;
        document.getElementById('taskDate').value = task.date;
        document.getElementById('taskTime').value = task.time || '';
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskCategory').value = task.category;

        // Change form to edit mode
        const form = document.getElementById('taskForm');
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Task';
        
        // Store edit ID
        form.dataset.editId = taskId;
        console.log('✅ Form set to edit mode with ID:', taskId);
        
        // Scroll to form
        form.scrollIntoView({ behavior: 'smooth' });
        
        // Focus on the input
        document.getElementById('taskInput').focus();
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasks();
            this.renderTasks();
            this.showNotification('Task deleted successfully!', 'success');
        }
    }

    clearForm() {
        const form = document.getElementById('taskForm');
        form.reset();
        
        // Reset form to add mode
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Task';
        delete form.dataset.editId;
    }

    updateTaskStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;

        // Update stats if elements exist
        const totalEl = document.getElementById('totalTasks');
        const completedEl = document.getElementById('completedTasks');
        const pendingEl = document.getElementById('pendingTasks');

        if (totalEl) totalEl.textContent = total;
        if (completedEl) completedEl.textContent = completed;
        if (pendingEl) pendingEl.textContent = pending;
    }

    generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    showTaskCount() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;
        const today = new Date().toISOString().split('T')[0];
        const todayTasks = this.tasks.filter(task => task.date === today).length;
        const overdue = this.tasks.filter(task => 
            !task.completed && task.date && task.date < today
        ).length;

        console.log('📊 === TASK SUMMARY ===');
        console.log(`📋 Total Tasks: ${total}`);
        console.log(`✅ Completed: ${completed}`);
        console.log(`⏳ Pending: ${pending}`);
        console.log(`📅 Today: ${todayTasks}`);
        console.log(`⚠️ Overdue: ${overdue}`);
        console.log('📊 === END SUMMARY ===');

        // Also update the notification
        this.showNotification(`You have ${total} total tasks: ${completed} completed, ${pending} pending, ${overdue} overdue`, 'info');
        
        return { total, completed, pending, todayTasks, overdue };
    }

    createSampleTasks() {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        this.tasks = [
            {
                id: this.generateId(),
                text: "Complete project report",
                completed: false,
                date: yesterday,
                time: "14:00",
                priority: "high",
                category: "work",
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: this.generateId(),
                text: "Buy groceries",
                completed: false,
                date: twoDaysAgo,
                time: "18:00",
                priority: "medium",
                category: "personal",
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: this.generateId(),
                text: "Review code changes",
                completed: true,
                date: yesterday,
                time: "10:00",
                priority: "high",
                category: "work",
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: this.generateId(),
                text: "Team meeting",
                completed: false,
                date: today,
                time: "15:00",
                priority: "urgent",
                category: "work",
                createdAt: new Date().toISOString()
            }
        ];
        
        this.saveTasks();
        console.log('✅ Sample tasks created:', this.tasks.length);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1001;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
            font-weight: 500;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    saveTasks() {
        try {
            localStorage.setItem('todoApp_tasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Error saving tasks:', error);
        }
    }

    loadTasks() {
        try {
            const saved = localStorage.getItem('todoApp_tasks');
            console.log('💾 Loading tasks from localStorage:', saved);
            const tasks = saved ? JSON.parse(saved) : [];
            console.log('📋 Parsed tasks:', tasks);
            return tasks;
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    }
}

// Global dark mode manager for all pages
class DarkModeManager {
    constructor() {
        this.init();
    }
    
    init() {
        const darkMode = DarkModeManager.loadDarkMode();
        document.body.classList.toggle('dark-mode', darkMode);
        
        // Listen for storage changes (when dark mode is toggled from another page)
        window.addEventListener('storage', (e) => {
            if (e.key === 'todoApp_darkMode') {
                const newDarkMode = DarkModeManager.loadDarkMode();
                document.body.classList.toggle('dark-mode', newDarkMode);
            }
        });
        
        // Also listen for custom events (for same-page changes)
        window.addEventListener('darkModeChanged', (e) => {
            document.body.classList.toggle('dark-mode', e.detail.darkMode);
        });
    }
    
    static init() {
        const darkMode = DarkModeManager.loadDarkMode();
        document.body.classList.toggle('dark-mode', darkMode);
        
        // Listen for storage changes (when dark mode is toggled from another page)
        window.addEventListener('storage', (e) => {
            if (e.key === 'todoApp_darkMode') {
                const newDarkMode = DarkModeManager.loadDarkMode();
                document.body.classList.toggle('dark-mode', newDarkMode);
            }
        });
        
        // Also listen for custom events (for same-page changes)
        window.addEventListener('darkModeChanged', (e) => {
            document.body.classList.toggle('dark-mode', e.detail.darkMode);
        });
    }

    static loadDarkMode() {
        try {
            const saved = localStorage.getItem('todoApp_darkMode');
            return saved ? JSON.parse(saved) : false;
        } catch (error) {
            return false;
        }
    }
    
    static saveDarkMode(darkMode) {
        try {
            localStorage.setItem('todoApp_darkMode', JSON.stringify(darkMode));
            // Dispatch custom event for same-page listeners
            window.dispatchEvent(new CustomEvent('darkModeChanged', { 
                detail: { darkMode } 
            }));
        } catch (error) {
            console.error('Error saving dark mode:', error);
        }
    }
}

// Initialize tasks page
document.addEventListener('DOMContentLoaded', () => {
    // Apply dark mode first
    DarkModeManager.init();
    
    window.tasksApp = new TasksApp();
    console.log('📋 Tasks page initialized successfully!');
    
    // Add global helper function to check tasks
    window.checkTasks = () => {
        return window.tasksApp.showTaskCount();
    };
    
    // Add function to reset and recreate sample tasks
    window.resetTasks = () => {
        console.log('� Resetting tasks...');
        localStorage.removeItem('todoApp_tasks');
        window.tasksApp.tasks = [];
        window.tasksApp.createSampleTasks();
        window.tasksApp.renderTasks();
        window.tasksApp.showTaskCount();
        console.log('✅ Tasks reset and sample data created');
    };
    
    console.log('💡 Available commands:');
    console.log('  - checkTasks() - Show current task summary');
    console.log('  - resetTasks() - Clear all tasks and create new sample data');
});
