// Advanced Todo App JavaScript - SkillCraft Technology Internship Task
class TodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.currentSort = 'newest';
        this.searchQuery = '';
        this.editingTaskId = null;
        this.darkMode = this.loadDarkMode();
        this.analytics = this.loadAnalytics();
        this.achievements = this.loadAchievements();
        
        this.initializeEventListeners();
        this.renderTasks();
        this.updateStats();
        this.setCurrentDateTime();
        this.applyDarkMode();
        this.initializeFloatingMenu();
        this.startAnalyticsTracking();
    }

    // Initialize all event listeners
    initializeEventListeners() {
        // Add task button
        document.getElementById('addTaskBtn').addEventListener('click', () => this.addTask());
        
        // Enter key in task input
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.renderTasks();
        });

        // Sort functionality
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderTasks();
        });

        // Dark mode toggle
        document.getElementById('darkModeToggle').addEventListener('click', () => this.toggleDarkMode());

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        // Modal controls
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        document.getElementById('saveEditBtn').addEventListener('click', () => this.saveEdit());
        document.getElementById('cancelEditBtn').addEventListener('click', () => this.closeModal());

        // Subtask functionality
        document.getElementById('addSubtaskBtn').addEventListener('click', () => this.addSubtask());
        document.getElementById('newSubtaskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addSubtask();
        });

        // Enter key in edit modal
        document.getElementById('editTaskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveEdit();
        });

        // Click outside modal to close
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('editModal');
            if (e.target === modal) this.closeModal();
        });
    }

    // Set current date and time as default
    setCurrentDateTime() {
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = now.toTimeString().slice(0, 5);
        
        document.getElementById('taskDate').value = date;
        document.getElementById('taskTime').value = time;
    }

    // Generate unique ID for tasks
    generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    // Add new task
    addTask() {
        const taskInput = document.getElementById('taskInput');
        const taskDate = document.getElementById('taskDate');
        const taskTime = document.getElementById('taskTime');
        const taskPriority = document.getElementById('taskPriority');
        const taskCategory = document.getElementById('taskCategory');

        const text = taskInput.value.trim();
        if (!text) {
            this.showNotification('Please enter a task description!', 'error');
            taskInput.focus();
            return;
        }

        const task = {
            id: this.generateId(),
            text: text,
            completed: false,
            date: taskDate.value,
            time: taskTime.value,
            priority: taskPriority.value,
            category: taskCategory.value,
            subtasks: [],
            createdAt: new Date().toISOString(),
            completedAt: null
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.trackAnalytics('taskAdded', task);
        this.checkAchievements();

        // Clear inputs
        taskInput.value = '';
        this.setCurrentDateTime();
        taskPriority.value = 'medium';
        taskCategory.value = 'general';
        
        this.showNotification('Task added successfully!', 'success');
        taskInput.focus();
    }

    // Toggle task completion
    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            
            const message = task.completed ? 'Task completed!' : 'Task marked as pending!';
            this.showNotification(message, 'success');
        }
    }

    // Delete task
    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.showNotification('Task deleted successfully!', 'success');
        }
    }

    // Open edit modal
    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            this.editingTaskId = taskId;
            document.getElementById('editTaskInput').value = task.text;
            document.getElementById('editTaskDate').value = task.date;
            document.getElementById('editTaskTime').value = task.time;
            document.getElementById('editModal').style.display = 'block';
        }
    }

    // Save edited task
    saveEdit() {
        const text = document.getElementById('editTaskInput').value.trim();
        if (!text) {
            this.showNotification('Please enter a task description!', 'error');
            return;
        }

        const task = this.tasks.find(t => t.id === this.editingTaskId);
        if (task) {
            task.text = text;
            task.date = document.getElementById('editTaskDate').value;
            task.time = document.getElementById('editTaskTime').value;
            task.updatedAt = new Date().toISOString();
            
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.closeModal();
            this.showNotification('Task updated successfully!', 'success');
        }
    }

    // Close edit modal
    closeModal() {
        document.getElementById('editModal').style.display = 'none';
        this.editingTaskId = null;
    }

    // Set filter
    setFilter(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        this.renderTasks();
    }

    // Filter tasks based on current filter
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'completed':
                return this.tasks.filter(task => task.completed);
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            default:
                return this.tasks;
        }
    }

    // Check if task is overdue
    isOverdue(task) {
        if (!task.date || task.completed) return false;
        
        const now = new Date();
        const taskDateTime = new Date(`${task.date}T${task.time || '23:59'}`);
        return taskDateTime < now;
    }

    // Format date and time for display
    formatDateTime(date, time) {
        if (!date) return '';
        
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        if (time) {
            const [hours, minutes] = time.split(':');
            const timeObj = new Date();
            timeObj.setHours(parseInt(hours), parseInt(minutes));
            const formattedTime = timeObj.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
            return { date: formattedDate, time: formattedTime };
        }
        
        return { date: formattedDate, time: null };
    }

    // Render all tasks
    renderTasks() {
        const todoList = document.getElementById('todoList');
        const emptyState = document.getElementById('emptyState');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            todoList.innerHTML = '';
            emptyState.classList.add('show');
            return;
        }

        emptyState.classList.remove('show');
        
        todoList.innerHTML = filteredTasks.map(task => {
            const { date, time } = this.formatDateTime(task.date, task.time);
            const isOverdue = this.isOverdue(task);
            
            return `
                <li class="todo-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                    <input type="checkbox" class="todo-checkbox" ${task.completed ? 'checked' : ''} 
                           onchange="todoApp.toggleTask('${task.id}')">
                    <div class="todo-content">
                        <div class="todo-text">${this.escapeHtml(task.text)}</div>
                        ${date ? `
                            <div class="todo-datetime ${isOverdue ? 'overdue' : ''}">
                                <span><i class="fas fa-calendar"></i> ${date}</span>
                                ${time ? `<span><i class="fas fa-clock"></i> ${time}</span>` : ''}
                                ${isOverdue ? '<span><i class="fas fa-exclamation-triangle"></i> Overdue</span>' : ''}
                            </div>
                        ` : ''}
                    </div>
                    <div class="todo-actions">
                        <button class="action-btn edit-btn" onclick="todoApp.editTask('${task.id}')" title="Edit task">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="todoApp.deleteTask('${task.id}')" title="Delete task">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </li>
            `;
        }).join('');
    }

    // Update statistics
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;

        document.getElementById('totalTasks').textContent = total;
        document.getElementById('pendingTasks').textContent = pending;
        document.getElementById('completedTasks').textContent = completed;
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element
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

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Save tasks to localStorage
    saveTasks() {
        try {
            localStorage.setItem('todoApp_tasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Error saving tasks:', error);
            this.showNotification('Error saving tasks. Storage might be full.', 'error');
        }
    }

    // Load tasks from localStorage
    loadTasks() {
        try {
            const saved = localStorage.getItem('todoApp_tasks');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.showNotification('Error loading saved tasks.', 'error');
            return [];
        }
    }

    // Export tasks as JSON
    exportTasks() {
        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `todo-tasks-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Tasks exported successfully!', 'success');
    }

    // Clear all completed tasks
    clearCompleted() {
        const completedCount = this.tasks.filter(task => task.completed).length;
        if (completedCount === 0) {
            this.showNotification('No completed tasks to clear.', 'info');
            return;
        }

        if (confirm(`Are you sure you want to delete all ${completedCount} completed tasks?`)) {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.showNotification(`${completedCount} completed tasks cleared!`, 'success');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to add task quickly
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const taskInput = document.getElementById('taskInput');
            if (taskInput.value.trim()) {
                todoApp.addTask();
            } else {
                taskInput.focus();
            }
        }
        
        // Escape to close modal
        if (e.key === 'Escape') {
            todoApp.closeModal();
        }
    });

    // Add export functionality (bonus feature)
    const exportBtn = document.createElement('button');
    exportBtn.innerHTML = '<i class="fas fa-download"></i> Export Tasks';
    exportBtn.className = 'filter-btn';
    exportBtn.style.background = '#28a745';
    exportBtn.style.color = 'white';
    exportBtn.style.border = '2px solid #28a745';
    exportBtn.onclick = () => todoApp.exportTasks();
    
    // Add clear completed button
    const clearBtn = document.createElement('button');
    clearBtn.innerHTML = '<i class="fas fa-broom"></i> Clear Completed';
    clearBtn.className = 'filter-btn';
    clearBtn.style.background = '#dc3545';
    clearBtn.style.color = 'white';
    clearBtn.style.border = '2px solid #dc3545';
    clearBtn.onclick = () => todoApp.clearCompleted();
    
    document.querySelector('.filter-buttons').appendChild(exportBtn);
    document.querySelector('.filter-buttons').appendChild(clearBtn);

    console.log('🚀 Todo App initialized successfully!');
    console.log('💡 Pro tip: Use Ctrl+Enter to quickly add tasks!');
});
