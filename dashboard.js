// Enhanced Dashboard JavaScript with Modern Features
class DashboardApp {
    constructor() {
        console.log('📋 DashboardApp constructor called');
        this.tasks = this.loadTasks();
        
        // Add a sample task for testing if no tasks exist
        if (this.tasks.length === 0) {
            console.log('No tasks found, adding sample task for testing');
            const sampleTask = {
                id: 'sample-' + Date.now(),
                text: 'Welcome to your Todo App! This is a sample task.',
                completed: false,
                date: new Date().toISOString().split('T')[0],
                time: '',
                priority: 'medium',
                category: 'general',
                createdAt: new Date().toISOString()
            };
            this.tasks.push(sampleTask);
            this.saveTasks();
        }
        
        this.darkModeManager = new DarkModeManager();
        this.initializeEventListeners();
        this.updateDashboard();
        this.loadRecentActivity();
        this.animateOnLoad();
        this.updateCurrentDate();
        this.updateProductivityStreak();
        console.log('📋 DashboardApp initialization complete');
    }

    initializeEventListeners() {
        // Quick add task form submission
        const quickAddForm = document.getElementById('quickAddForm');
        if (quickAddForm) {
            quickAddForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Quick add form submitted');
                this.quickAddTask();
            });
        } else {
            console.error('Quick add form not found!');
        }

        // Mobile navigation toggle
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }

        // Add hover animations to cards
        this.addCardAnimations();
        
        // Update stats periodically
        setInterval(() => this.updateDashboard(), 30000); // Update every 30 seconds
    }

    animateOnLoad() {
        // Animate dashboard cards on load
        const cards = document.querySelectorAll('.dashboard-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    addCardAnimations() {
        const cards = document.querySelectorAll('.dashboard-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    }

    updateCurrentDate() {
        const dateElement = document.querySelector('.current-date');
        if (dateElement) {
            const now = new Date();
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            dateElement.innerHTML = `
                <i class="fas fa-calendar-alt"></i>
                ${now.toLocaleDateString('en-US', options)}
            `;
        }
    }

    updateProductivityStreak() {
        const streakElement = document.querySelector('.productivity-badge');
        if (streakElement) {
            const streak = this.calculateProductivityStreak();
            streakElement.innerHTML = `
                <i class="fas fa-fire"></i>
                ${streak} day${streak !== 1 ? 's' : ''} streak
            `;
        }
    }

    calculateProductivityStreak() {
        // Calculate consecutive days with completed tasks
        const today = new Date();
        let streak = 0;
        
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const completedTasksOnDate = this.tasks.filter(task => 
                task.completed && 
                task.date === dateStr
            ).length;
            
            if (completedTasksOnDate > 0) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }
        
        return streak;
    }

    quickAddTask() {
        console.log('quickAddTask function called');
        
        const input = document.getElementById('quickTaskInput');
        const priority = document.getElementById('taskPriority')?.value || 'medium';
        const category = document.getElementById('taskCategory')?.value || 'general';
        const text = input.value.trim();
        
        console.log('Input text:', text);
        console.log('Priority:', priority);
        console.log('Category:', category);
        
        if (!text) {
            this.showNotification('Please enter a task description!', 'error');
            input.focus();
            return;
        }

        const task = {
            id: this.generateId(),
            text: text,
            completed: false,
            date: new Date().toISOString().split('T')[0],
            time: '',
            priority: priority,
            category: category,
            createdAt: new Date().toISOString()
        };

        console.log('Created task:', task);

        this.tasks.unshift(task);
        this.saveTasks();
        this.updateDashboard();
        this.addToRecentActivity('created', task.text);
        
        console.log('Tasks after adding:', this.tasks);
        
        // Clear inputs with animation
        input.value = '';
        input.style.transform = 'scale(0.98)';
        setTimeout(() => {
            input.style.transform = 'scale(1)';
        }, 150);
        
        this.showNotification('Task added successfully!', 'success');
        
        // Reset selectors to default
        if (document.getElementById('taskPriority')) {
            document.getElementById('taskPriority').value = 'medium';
        }
        if (document.getElementById('taskCategory')) {
            document.getElementById('taskCategory').value = 'general';
        }
    }

    updateDashboard() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;
        const productivity = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Update stats with animation
        this.animateStatUpdate('totalTasks', total);
        this.animateStatUpdate('pendingTasks', pending);
        this.animateStatUpdate('completedTasks', completed);
        this.animateStatUpdate('productivityScore', `${productivity}%`);

        // Update today's tasks
        this.updateTodaysTasks();
        
        // Update insights
        this.updateInsights();
        
        // Update productivity streak
        this.updateProductivityStreak();
    }

    animateStatUpdate(elementId, newValue) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const currentValue = element.textContent;
        if (currentValue !== newValue.toString()) {
            element.style.transform = 'scale(1.1)';
            element.style.color = '#667eea';
            
            setTimeout(() => {
                element.textContent = newValue;
                element.style.transform = 'scale(1)';
                element.style.color = '';
            }, 150);
        }
    }

    updateTodaysTasks() {
        const today = new Date().toISOString().split('T')[0];
        const todayTasks = this.tasks.filter(task => task.date === today).slice(0, 5);
        
        const container = document.getElementById('todayTasksList') || document.querySelector('.tasks-preview');
        if (!container) return;
        
        if (todayTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h4>All Caught Up!</h4>
                    <p>No tasks scheduled for today. Great job!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = todayTasks.map(task => {
            const priorityColors = {
                high: '#dc2626',
                medium: '#f59e0b',
                low: '#059669'
            };
            
            return `
                <div class="task-preview-item ${task.completed ? 'completed' : ''}" style="
                    display: flex; 
                    align-items: center; 
                    gap: 1rem; 
                    padding: 0.75rem; 
                    border-radius: 8px; 
                    margin-bottom: 0.5rem;
                    background: ${task.completed ? '#f8f9fa' : 'white'};
                    border: 1px solid #e2e8f0;
                    transition: all 0.3s ease;
                ">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} 
                           onchange="dashboardApp.toggleTask('${task.id}')"
                           style="margin: 0; cursor: pointer;">
                    <span style="
                        flex: 1;
                        ${task.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}
                        font-weight: 500;
                    ">${task.text}</span>
                    <span class="priority-badge" style="
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        background: ${priorityColors[task.priority] || '#059669'};
                        display: inline-block;
                    "></span>
                    <small style="color: #64748b; font-size: 0.8rem;">
                        ${task.category}
                    </small>
                </div>
            `;
        }).join('');
    }

    updateInsights() {
        const insights = this.generateInsights();
        const container = document.querySelector('.insights-list');
        if (!container) return;
        
        container.innerHTML = insights.map(insight => `
            <div class="insight-item ${insight.type}">
                <div class="insight-icon">
                    <i class="${insight.icon}"></i>
                </div>
                <div class="insight-content">
                    <div class="insight-text">${insight.text}</div>
                    <div class="insight-badge">${insight.badge}</div>
                </div>
            </div>
        `).join('');
    }

    generateInsights() {
        const insights = [];
        const completed = this.tasks.filter(task => task.completed).length;
        const total = this.tasks.length;
        const today = new Date().toISOString().split('T')[0];
        const todayTasks = this.tasks.filter(task => task.date === today);
        const completedToday = todayTasks.filter(task => task.completed).length;
        
        // Achievement insights
        if (completed >= 10) {
            insights.push({
                type: 'achievement',
                icon: 'fas fa-trophy',
                text: `Congratulations! You've completed ${completed} tasks total.`,
                badge: 'Achievement'
            });
        }
        
        // Daily productivity
        if (completedToday > 0) {
            insights.push({
                type: 'achievement',
                icon: 'fas fa-star',
                text: `You've completed ${completedToday} task${completedToday > 1 ? 's' : ''} today. Keep it up!`,
                badge: 'Daily Win'
            });
        }
        
        // Overdue reminders
        const overdue = this.tasks.filter(task => 
            !task.completed && 
            task.date && 
            task.date < today
        ).length;
        
        if (overdue > 0) {
            insights.push({
                type: 'reminder',
                icon: 'fas fa-exclamation-triangle',
                text: `You have ${overdue} overdue task${overdue > 1 ? 's' : ''}. Consider updating or completing them.`,
                badge: 'Action Needed'
            });
        }
        
        // Productivity tips
        const tips = [
            'Try breaking large tasks into smaller, manageable chunks.',
            'Set specific time blocks for focused work sessions.',
            'Review and prioritize your tasks each morning.',
            'Celebrate small wins to maintain motivation.'
        ];
        
        insights.push({
            type: 'tip',
            icon: 'fas fa-lightbulb',
            text: tips[Math.floor(Math.random() * tips.length)],
            badge: 'Pro Tip'
        });
        
        return insights.slice(0, 3); // Show max 3 insights
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            const wasCompleted = task.completed;
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            
            this.saveTasks();
            this.updateDashboard();
            
            // Add to recent activity
            this.addToRecentActivity(
                task.completed ? 'completed' : 'uncompleted', 
                task.text
            );
            
            // Show animated notification
            this.showNotification(
                task.completed ? 'Task completed! 🎉' : 'Task marked as pending', 
                'success'
            );
            
            // Add visual feedback
            const taskElement = document.querySelector(`input[onchange*="${taskId}"]`)?.parentElement;
            if (taskElement) {
                taskElement.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    taskElement.style.transform = 'scale(1)';
                }, 150);
            }
        }
    }

    addToRecentActivity(action, taskText) {
        let recentActivity = JSON.parse(localStorage.getItem('recentActivity') || '[]');
        
        const activity = {
            id: this.generateId(),
            action: action,
            taskText: taskText,
            timestamp: new Date().toISOString()
        };
        
        recentActivity.unshift(activity);
        recentActivity = recentActivity.slice(0, 10); // Keep only last 10 activities
        
        localStorage.setItem('recentActivity', JSON.stringify(recentActivity));
        this.loadRecentActivity();
    }

    loadRecentActivity() {
        const container = document.getElementById('recentActivity') || document.querySelector('.activity-list');
        if (!container) return;
        
        const recentActivity = JSON.parse(localStorage.getItem('recentActivity') || '[]');
        const recentTasks = recentActivity.slice(0, 5);

        if (recentTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-history"></i>
                    </div>
                    <h4>No Recent Activity</h4>
                    <p>Your recent task activities will appear here</p>
                </div>
            `;
            return;
        }

        container.innerHTML = recentTasks.map(activity => {
            const timeAgo = this.getTimeAgo(new Date(activity.timestamp));
            const actionIcons = {
                'created': 'fas fa-plus-circle',
                'completed': 'fas fa-check-circle',
                'uncompleted': 'fas fa-undo',
                'edited': 'fas fa-edit'
            };
            
            const actionTexts = {
                'created': 'Created',
                'completed': 'Completed', 
                'uncompleted': 'Reopened',
                'edited': 'Edited'
            };
            
            return `
                <div class="activity-item">
                    <div class="activity-icon ${activity.action}">
                        <i class="${actionIcons[activity.action] || 'fas fa-circle'}"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-text">
                            ${actionTexts[activity.action] || 'Updated'}: ${activity.taskText}
                        </div>
                        <div class="activity-time">${timeAgo}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
        return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }

    generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    showNotification(message, type = 'info') {
        // Remove any existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const colors = {
            'success': 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            'error': 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            'info': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            z-index: 1001;
            font-weight: 500;
            font-size: 0.9rem;
            max-width: 350px;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            transform: translateX(100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        
        const icons = {
            'success': 'fas fa-check-circle',
            'error': 'fas fa-exclamation-circle',
            'info': 'fas fa-info-circle'
        };
        
        notification.innerHTML = `
            <i class="${icons[type] || icons.info}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    saveTasks() {
        try {
            console.log('Saving tasks to localStorage:', this.tasks);
            localStorage.setItem('todoApp_tasks', JSON.stringify(this.tasks));
            console.log('Tasks saved successfully');
        } catch (error) {
            console.error('Error saving tasks:', error);
        }
    }

    loadTasks() {
        try {
            const saved = localStorage.getItem('todoApp_tasks');
            const tasks = saved ? JSON.parse(saved) : [];
            console.log('Loaded tasks from localStorage:', tasks);
            return tasks;
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    }
}

// Enhanced Dark Mode Manager with cross-page synchronization
class DarkModeManager {
    constructor() {
        this.init();
    }
    
    init() {
        const darkMode = this.loadDarkMode();
        document.body.classList.toggle('dark-mode', darkMode);
        
        // Listen for storage changes (when dark mode is toggled from another page)
        window.addEventListener('storage', (e) => {
            if (e.key === 'todoApp_darkMode') {
                const newDarkMode = this.loadDarkMode();
                document.body.classList.toggle('dark-mode', newDarkMode);
                this.updateToggleElements(newDarkMode);
            }
        });
        
        // Also listen for custom events (for same-page changes)
        window.addEventListener('darkModeChanged', (e) => {
            document.body.classList.toggle('dark-mode', e.detail.darkMode);
            this.updateToggleElements(e.detail.darkMode);
        });
        
        // Initialize any toggle elements on the page
        this.initializeToggleElements();
    }
    
    initializeToggleElements() {
        const toggles = document.querySelectorAll('.dark-mode-toggle, [data-dark-mode-toggle]');
        toggles.forEach(toggle => {
            const darkMode = this.loadDarkMode();
            if (toggle.type === 'checkbox') {
                toggle.checked = darkMode;
            }
            
            toggle.addEventListener('change', () => {
                const newDarkMode = toggle.checked || !this.loadDarkMode();
                this.saveDarkMode(newDarkMode);
                document.body.classList.toggle('dark-mode', newDarkMode);
            });
        });
    }
    
    updateToggleElements(darkMode) {
        const toggles = document.querySelectorAll('.dark-mode-toggle, [data-dark-mode-toggle]');
        toggles.forEach(toggle => {
            if (toggle.type === 'checkbox') {
                toggle.checked = darkMode;
            }
        });
    }

    loadDarkMode() {
        try {
            const saved = localStorage.getItem('todoApp_darkMode');
            return saved ? JSON.parse(saved) : false;
        } catch (error) {
            return false;
        }
    }
    
    saveDarkMode(darkMode) {
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
    
    toggle() {
        const currentMode = this.loadDarkMode();
        const newMode = !currentMode;
        this.saveDarkMode(newMode);
        document.body.classList.toggle('dark-mode', newMode);
        return newMode;
    }
}

// Initialize dashboard with enhanced features
document.addEventListener('DOMContentLoaded', () => {
    // Initialize dark mode manager
    const darkModeManager = new DarkModeManager();
    
    // Initialize dashboard app
    window.dashboardApp = new DashboardApp();
    
    // Add CSS animations for slide effects
    if (!document.querySelector('#dashboard-animations')) {
        const style = document.createElement('style');
        style.id = 'dashboard-animations';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            
            @keyframes fadeInUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .dashboard-card {
                animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .stat-item:hover {
                animation: none !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    console.log('🎉 Dashboard initialized with enhanced features!');
});
