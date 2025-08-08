// Advanced Todo App JavaScript - Professional Enterprise Features
class AdvancedTodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.currentSort = 'newest';
        this.searchQuery = '';
        this.editingTaskId = null;
        this.darkMode = this.loadDarkMode();
        this.analytics = this.loadAnalytics();
        this.achievements = this.initializeAchievements();
        this.aiSuggestions = [];
        
        this.initializeEventListeners();
        this.renderTasks();
        this.updateStats();
        this.setCurrentDateTime();
        this.applyDarkMode();
        this.initializeFloatingMenu();
        this.startAnalyticsTracking();
        this.generateAISuggestions();
    }

    // Initialize all event listeners
    initializeEventListeners() {
        // Basic functionality
        document.getElementById('addTaskBtn').addEventListener('click', () => this.addTask());
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Advanced search and sort
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.renderTasks();
        });

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

        // AI functionality
        document.getElementById('askAiBtn').addEventListener('click', () => this.askAI());
        document.getElementById('aiInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.askAI();
        });

        // Floating menu
        document.getElementById('fabMain').addEventListener('click', () => this.toggleFloatingMenu());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    // Advanced task addition with all features
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
            completedAt: null,
            estimatedTime: this.estimateTaskTime(text),
            tags: this.extractTags(text)
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.trackAnalytics('taskAdded', task);
        this.checkAchievements();

        // Clear inputs and reset
        taskInput.value = '';
        this.setCurrentDateTime();
        taskPriority.value = 'medium';
        taskCategory.value = 'general';
        
        this.showNotification('Task added successfully!', 'success');
        taskInput.focus();
    }

    // Enhanced task rendering with all features
    renderTasks() {
        const todoList = document.getElementById('todoList');
        const emptyState = document.getElementById('emptyState');
        let filteredTasks = this.getFilteredTasks();

        // Apply search filter
        if (this.searchQuery) {
            filteredTasks = filteredTasks.filter(task =>
                task.text.toLowerCase().includes(this.searchQuery) ||
                task.category.toLowerCase().includes(this.searchQuery) ||
                (task.tags && task.tags.some(tag => tag.toLowerCase().includes(this.searchQuery)))
            );
        }

        // Apply sorting
        filteredTasks = this.sortTasks(filteredTasks);

        if (filteredTasks.length === 0) {
            todoList.innerHTML = '';
            emptyState.classList.add('show');
            return;
        }

        emptyState.classList.remove('show');
        
        todoList.innerHTML = filteredTasks.map(task => {
            const { date, time } = this.formatDateTime(task.date, task.time);
            const isOverdue = this.isOverdue(task);
            const priorityClass = `priority-${task.priority}`;
            const completionPercentage = this.getTaskCompletionPercentage(task);
            
            return `
                <li class="todo-item ${task.completed ? 'completed' : ''} ${priorityClass}" data-id="${task.id}">
                    <input type="checkbox" class="todo-checkbox" ${task.completed ? 'checked' : ''} 
                           onchange="todoApp.toggleTask('${task.id}')">
                    <div class="todo-content">
                        <div class="todo-text">
                            ${this.escapeHtml(task.text)}
                            <span class="category-badge category-${task.category}">${this.getCategoryIcon(task.category)} ${task.category}</span>
                            ${this.getPriorityIndicator(task.priority)}
                        </div>
                        ${task.subtasks && task.subtasks.length > 0 ? `
                            <div class="progress-container">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${completionPercentage}%"></div>
                                </div>
                                <small>${completionPercentage}% complete (${task.subtasks.filter(st => st.completed).length}/${task.subtasks.length} subtasks)</small>
                            </div>
                        ` : ''}
                        ${date ? `
                            <div class="todo-datetime ${isOverdue ? 'overdue' : ''}">
                                <span><i class="fas fa-calendar"></i> ${date}</span>
                                ${time ? `<span><i class="fas fa-clock"></i> ${time}</span>` : ''}
                                ${isOverdue ? '<span><i class="fas fa-exclamation-triangle"></i> Overdue</span>' : ''}
                                ${task.estimatedTime ? `<span><i class="fas fa-hourglass-half"></i> ~${task.estimatedTime}min</span>` : ''}
                            </div>
                        ` : ''}
                        ${task.tags && task.tags.length > 0 ? `
                            <div class="task-tags">
                                ${task.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                    <div class="todo-actions">
                        <button class="action-btn edit-btn" onclick="todoApp.editTask('${task.id}')" title="Edit task">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn duplicate-btn" onclick="todoApp.duplicateTask('${task.id}')" title="Duplicate task">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="todoApp.deleteTask('${task.id}')" title="Delete task">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </li>
            `;
        }).join('');
    }

    // Enhanced filtering with new filter types
    getFilteredTasks() {
        const now = new Date();
        const today = now.toISOString().split('T')[0];

        switch (this.currentFilter) {
            case 'completed':
                return this.tasks.filter(task => task.completed);
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            case 'overdue':
                return this.tasks.filter(task => !task.completed && this.isOverdue(task));
            case 'today':
                return this.tasks.filter(task => task.date === today);
            default:
                return this.tasks;
        }
    }

    // Advanced sorting functionality
    sortTasks(tasks) {
        switch (this.currentSort) {
            case 'newest':
                return tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case 'oldest':
                return tasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            case 'priority':
                const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
                return tasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
            case 'deadline':
                return tasks.sort((a, b) => {
                    if (!a.date && !b.date) return 0;
                    if (!a.date) return 1;
                    if (!b.date) return -1;
                    return new Date(a.date + ' ' + (a.time || '00:00')) - new Date(b.date + ' ' + (b.time || '00:00'));
                });
            case 'alphabetical':
                return tasks.sort((a, b) => a.text.localeCompare(b.text));
            default:
                return tasks;
        }
    }

    // Dark mode functionality
    toggleDarkMode() {
        this.darkMode = !this.darkMode;
        this.applyDarkMode();
        this.saveDarkMode();
        this.showNotification(`Dark mode ${this.darkMode ? 'enabled' : 'disabled'}!`, 'success');
    }

    applyDarkMode() {
        document.body.classList.toggle('dark-mode', this.darkMode);
        const icon = document.querySelector('#darkModeToggle i');
        icon.className = this.darkMode ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Enhanced edit functionality with subtasks
    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            this.editingTaskId = taskId;
            document.getElementById('editTaskInput').value = task.text;
            document.getElementById('editTaskDate').value = task.date;
            document.getElementById('editTaskTime').value = task.time;
            document.getElementById('editTaskPriority').value = task.priority;
            document.getElementById('editTaskCategory').value = task.category;
            
            this.renderEditSubtasks(task.subtasks || []);
            document.getElementById('editModal').style.display = 'block';
        }
    }

    // Subtask management
    addSubtask() {
        const input = document.getElementById('newSubtaskInput');
        const text = input.value.trim();
        if (!text) return;

        const subtask = {
            id: this.generateId(),
            text: text,
            completed: false
        };

        const subtasksList = document.getElementById('editSubtasksList');
        this.renderSubtaskItem(subtasksList, subtask);
        input.value = '';
    }

    renderEditSubtasks(subtasks) {
        const container = document.getElementById('editSubtasksList');
        container.innerHTML = '';
        subtasks.forEach(subtask => this.renderSubtaskItem(container, subtask));
    }

    renderSubtaskItem(container, subtask) {
        const div = document.createElement('div');
        div.className = 'subtask-item';
        div.innerHTML = `
            <input type="checkbox" ${subtask.completed ? 'checked' : ''} 
                   onchange="todoApp.toggleSubtask('${subtask.id}')">
            <span class="subtask-text ${subtask.completed ? 'completed' : ''}">${this.escapeHtml(subtask.text)}</span>
            <button type="button" onclick="todoApp.removeSubtask('${subtask.id}')" class="remove-subtask">
                <i class="fas fa-times"></i>
            </button>
        `;
        div.dataset.subtaskId = subtask.id;
        container.appendChild(div);
    }

    // Analytics and insights
    trackAnalytics(action, data = {}) {
        const today = new Date().toISOString().split('T')[0];
        if (!this.analytics[today]) {
            this.analytics[today] = { tasksAdded: 0, tasksCompleted: 0, tasksDeleted: 0 };
        }
        
        switch (action) {
            case 'taskAdded':
                this.analytics[today].tasksAdded++;
                break;
            case 'taskCompleted':
                this.analytics[today].tasksCompleted++;
                break;
            case 'taskDeleted':
                this.analytics[today].tasksDeleted++;
                break;
        }
        
        this.saveAnalytics();
    }

    calculateProductivityScore() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const overdue = this.tasks.filter(task => !task.completed && this.isOverdue(task)).length;
        
        if (total === 0) return 0;
        
        let score = (completed / total) * 100;
        score -= (overdue / total) * 20; // Penalty for overdue tasks
        
        return Math.max(0, Math.round(score));
    }

    // AI Assistant functionality
    generateAISuggestions() {
        const suggestions = [
            "Break down large tasks into smaller subtasks",
            "Set specific deadlines for better time management", 
            "Use high priority for urgent tasks only",
            "Group similar tasks by category",
            "Review and update your tasks daily",
            "Use the search feature to find tasks quickly"
        ];
        
        this.aiSuggestions = suggestions.sort(() => 0.5 - Math.random()).slice(0, 3);
    }

    askAI() {
        const input = document.getElementById('aiInput');
        const question = input.value.trim();
        if (!question) return;

        const chatHistory = document.getElementById('aiChatHistory');
        
        // Add user message
        const userMsg = document.createElement('div');
        userMsg.innerHTML = `<strong>You:</strong> ${this.escapeHtml(question)}`;
        chatHistory.appendChild(userMsg);

        // Generate AI response
        const response = this.generateAIResponse(question);
        const aiMsg = document.createElement('div');
        aiMsg.innerHTML = `<strong>AI:</strong> ${response}`;
        aiMsg.style.marginTop = '10px';
        chatHistory.appendChild(aiMsg);

        chatHistory.scrollTop = chatHistory.scrollHeight;
        input.value = '';
    }

    generateAIResponse(question) {
        const responses = {
            productivity: "Focus on high-priority tasks first. Break large tasks into smaller ones and use the Pomodoro technique!",
            time: "Set realistic deadlines and use the time estimation feature. Review your tasks daily to stay on track.",
            organization: "Use categories to group similar tasks. Try the search feature to find tasks quickly.",
            motivation: "Celebrate small wins! Complete easier tasks first to build momentum, then tackle the challenging ones.",
            default: "Great question! Try using priorities, categories, and deadlines to organize your tasks better. The analytics feature can show your productivity trends!"
        };

        const lowerQuestion = question.toLowerCase();
        if (lowerQuestion.includes('productive') || lowerQuestion.includes('efficient')) return responses.productivity;
        if (lowerQuestion.includes('time') || lowerQuestion.includes('deadline')) return responses.time;
        if (lowerQuestion.includes('organize') || lowerQuestion.includes('sort')) return responses.organization;
        if (lowerQuestion.includes('motivat') || lowerQuestion.includes('focus')) return responses.motivation;
        
        return responses.default;
    }

    // Achievements system
    initializeAchievements() {
        return [
            { id: 'first_task', name: 'Getting Started', description: 'Add your first task', unlocked: false },
            { id: 'task_master', name: 'Task Master', description: 'Complete 10 tasks', unlocked: false },
            { id: 'productive_day', name: 'Productive Day', description: 'Complete 5 tasks in one day', unlocked: false },
            { id: 'streak_keeper', name: 'Streak Keeper', description: 'Use the app for 7 consecutive days', unlocked: false },
            { id: 'organizer', name: 'Super Organizer', description: 'Use all categories', unlocked: false }
        ];
    }

    checkAchievements() {
        const completed = this.tasks.filter(t => t.completed).length;
        const today = new Date().toISOString().split('T')[0];
        const todayCompleted = this.tasks.filter(t => t.completed && t.completedAt?.startsWith(today)).length;
        const categories = [...new Set(this.tasks.map(t => t.category))];

        // Check achievements
        if (this.tasks.length >= 1) this.unlockAchievement('first_task');
        if (completed >= 10) this.unlockAchievement('task_master');
        if (todayCompleted >= 5) this.unlockAchievement('productive_day');
        if (categories.length >= 5) this.unlockAchievement('organizer');

        this.saveAchievements();
    }

    unlockAchievement(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            this.showNotification(`🏆 Achievement Unlocked: ${achievement.name}!`, 'success');
        }
    }

    // Floating menu functionality
    initializeFloatingMenu() {
        document.getElementById('fabMain').addEventListener('click', () => {
            document.querySelector('.floating-menu').classList.toggle('active');
        });
    }

    toggleFloatingMenu() {
        document.querySelector('.floating-menu').classList.toggle('active');
    }

    // Quick actions
    quickAddTask() {
        document.getElementById('taskInput').focus();
        this.toggleFloatingMenu();
    }

    openAnalytics() {
        document.getElementById('analyticsModal').style.display = 'block';
        this.renderAnalytics();
        this.toggleFloatingMenu();
    }

    openAI() {
        document.getElementById('aiModal').style.display = 'block';
        this.renderAISuggestions();
        this.toggleFloatingMenu();
    }

    closeAnalytics() {
        document.getElementById('analyticsModal').style.display = 'none';
    }

    closeAI() {
        document.getElementById('aiModal').style.display = 'none';
    }

    renderAnalytics() {
        // Render charts and analytics data
        this.renderTaskChart();
        this.renderProgressChart();
        this.renderAchievements();
        this.renderTimeInsights();
    }

    renderAISuggestions() {
        const container = document.getElementById('aiSuggestions');
        container.innerHTML = this.aiSuggestions.map(suggestion => 
            `<div class="ai-suggestion">${suggestion}</div>`
        ).join('');
    }

    // Advanced utility functions
    duplicateTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            const duplicatedTask = {
                ...task,
                id: this.generateId(),
                text: `${task.text} (Copy)`,
                completed: false,
                createdAt: new Date().toISOString()
            };
            this.tasks.unshift(duplicatedTask);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.showNotification('Task duplicated successfully!', 'success');
        }
    }

    estimateTaskTime(text) {
        // Simple time estimation based on task complexity
        const words = text.split(' ').length;
        if (words <= 3) return 15;
        if (words <= 6) return 30;
        if (words <= 10) return 60;
        return 120;
    }

    extractTags(text) {
        const tagRegex = /#(\w+)/g;
        const tags = [];
        let match;
        while ((match = tagRegex.exec(text)) !== null) {
            tags.push(match[1]);
        }
        return tags;
    }

    getTaskCompletionPercentage(task) {
        if (!task.subtasks || task.subtasks.length === 0) return 0;
        const completed = task.subtasks.filter(st => st.completed).length;
        return Math.round((completed / task.subtasks.length) * 100);
    }

    getPriorityIndicator(priority) {
        const indicators = {
            low: '<span class="priority-indicator low">🟢</span>',
            medium: '<span class="priority-indicator medium">🟡</span>',
            high: '<span class="priority-indicator high">🔴</span>',
            urgent: '<span class="priority-indicator urgent">⚡</span>'
        };
        return indicators[priority] || '';
    }

    getCategoryIcon(category) {
        const icons = {
            general: '📋', work: '💼', personal: '👤', health: '💪',
            learning: '📚', shopping: '🛒', finance: '💰'
        };
        return icons[category] || '📋';
    }

    // Keyboard shortcuts
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'Enter':
                    e.preventDefault();
                    this.quickAddTask();
                    break;
                case 'f':
                    e.preventDefault();
                    document.getElementById('searchInput').focus();
                    break;
                case 'd':
                    e.preventDefault();
                    this.toggleDarkMode();
                    break;
            }
        }
    }

    // Enhanced update stats with productivity score
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;
        const productivityScore = this.calculateProductivityScore();

        document.getElementById('totalTasks').textContent = total;
        document.getElementById('pendingTasks').textContent = pending;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('productivityScore').textContent = `${productivityScore}%`;
    }

    // Data backup functionality
    backupData() {
        const backup = {
            tasks: this.tasks,
            analytics: this.analytics,
            achievements: this.achievements,
            settings: { darkMode: this.darkMode },
            exportDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(backup, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `todo-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Data backed up successfully!', 'success');
        this.toggleFloatingMenu();
    }

    // Storage methods for new features
    loadAnalytics() {
        try {
            const saved = localStorage.getItem('todoApp_analytics');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            return {};
        }
    }

    saveAnalytics() {
        try {
            localStorage.setItem('todoApp_analytics', JSON.stringify(this.analytics));
        } catch (error) {
            console.error('Error saving analytics:', error);
        }
    }

    loadDarkMode() {
        try {
            const saved = localStorage.getItem('todoApp_darkMode');
            return saved ? JSON.parse(saved) : false;
        } catch (error) {
            return false;
        }
    }

    saveDarkMode() {
        try {
            localStorage.setItem('todoApp_darkMode', JSON.stringify(this.darkMode));
        } catch (error) {
            console.error('Error saving dark mode setting:', error);
        }
    }

    saveAchievements() {
        try {
            localStorage.setItem('todoApp_achievements', JSON.stringify(this.achievements));
        } catch (error) {
            console.error('Error saving achievements:', error);
        }
    }

    startAnalyticsTracking() {
        // Start tracking user activity patterns
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                this.trackUsageTime();
            }
        }, 60000); // Track every minute
    }

    trackUsageTime() {
        const today = new Date().toISOString().split('T')[0];
        if (!this.analytics[today]) {
            this.analytics[today] = { timeSpent: 0 };
        }
        this.analytics[today].timeSpent = (this.analytics[today].timeSpent || 0) + 1;
        this.saveAnalytics();
    }

    // Inherit remaining methods from base class
    setCurrentDateTime() {
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = now.toTimeString().slice(0, 5);
        
        document.getElementById('taskDate').value = date;
        document.getElementById('taskTime').value = time;
    }

    generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.trackAnalytics('taskCompleted', task);
            this.checkAchievements();
            
            const message = task.completed ? 'Task completed!' : 'Task marked as pending!';
            this.showNotification(message, 'success');
        }
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.trackAnalytics('taskDeleted');
            this.showNotification('Task deleted successfully!', 'success');
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        this.renderTasks();
    }

    isOverdue(task) {
        if (!task.date || task.completed) return false;
        const now = new Date();
        const taskDateTime = new Date(`${task.date}T${task.time || '23:59'}`);
        return taskDateTime < now;
    }

    formatDateTime(date, time) {
        if (!date) return { date: '', time: null };
        
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
            task.priority = document.getElementById('editTaskPriority').value;
            task.category = document.getElementById('editTaskCategory').value;
            task.updatedAt = new Date().toISOString();
            
            // Save subtasks
            const subtaskElements = document.querySelectorAll('#editSubtasksList .subtask-item');
            task.subtasks = Array.from(subtaskElements).map(element => ({
                id: element.dataset.subtaskId,
                text: element.querySelector('.subtask-text').textContent,
                completed: element.querySelector('input[type="checkbox"]').checked
            }));
            
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.closeModal();
            this.showNotification('Task updated successfully!', 'success');
        }
    }

    closeModal() {
        document.getElementById('editModal').style.display = 'none';
        this.editingTaskId = null;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
            this.showNotification('Error saving tasks. Storage might be full.', 'error');
        }
    }

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
}

// Initialize the advanced app
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new AdvancedTodoApp();
    
    console.log('🚀 Advanced Todo App initialized successfully!');
    console.log('💡 Keyboard shortcuts:');
    console.log('  • Ctrl+Enter: Quick add task');
    console.log('  • Ctrl+F: Focus search');
    console.log('  • Ctrl+D: Toggle dark mode');
});
