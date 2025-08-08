// Enhanced Analytics JavaScript with Modern Features
class AnalyticsApp {
    constructor() {
        this.tasks = this.loadTasks();
        console.log('📊 Analytics: Loaded tasks from localStorage:', this.tasks.length);
        console.log('📋 Analytics: Task data:', this.tasks);
        
        // If no tasks exist, create some sample data for analytics
        if (this.tasks.length === 0) {
            console.log('📊 Analytics: No tasks found, creating sample data...');
            this.createSampleTasks();
        }
        
        this.darkModeManager = new DarkModeManager();
        this.charts = {};
        this.initializeEventListeners();
        this.renderAnalytics();
        this.initializeCharts();
        this.animateOnLoad();
        
        // Force create charts with data after a short delay
        setTimeout(() => {
            this.forceCreateChartsWithData();
        }, 1500);
    }

    initializeEventListeners() {
        // Dark mode toggle
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => this.darkModeManager.toggleDarkMode());
        }

        // Time period selector
        const timePeriodSelect = document.getElementById('timePeriod');
        if (timePeriodSelect) {
            timePeriodSelect.addEventListener('change', (e) => this.updateTimePeriod(e.target.value));
        }

        // Export button
        const exportBtn = document.getElementById('exportAnalytics');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportAnalytics());
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
        
        // Auto-refresh data every 30 seconds
        setInterval(() => this.refreshData(), 30000);
    }

    animateOnLoad() {
        // Animate analytics cards on load
        const cards = document.querySelectorAll('.analytics-card');
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
        const cards = document.querySelectorAll('.analytics-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    }

    refreshData() {
        this.tasks = this.loadTasks();
        this.renderAnalytics();
        this.updateCharts();
    }

    renderAnalytics() {
        this.updateMetrics();
        this.updateCompletionTrends();
        this.updateCategoryBreakdown();
        this.updateProductivityInsights();
        this.updateAchievements();
    }

    updateMetrics() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        // Calculate average completion time
        const completedTasks = this.tasks.filter(task => task.completed && task.completedAt);
        let avgCompletionTime = 0;
        
        if (completedTasks.length > 0) {
            const totalTime = completedTasks.reduce((sum, task) => {
                const created = new Date(task.createdAt);
                const completed = new Date(task.completedAt);
                return sum + (completed - created);
            }, 0);
            avgCompletionTime = Math.round(totalTime / completedTasks.length / (1000 * 60 * 60)); // hours
        }

        // Calculate current streak
        const currentStreak = this.calculateProductivityStreak();

        // Update metrics with animation
        this.animateMetricUpdate('totalCompleted', completed);
        this.animateMetricUpdate('avgCompletionTime', `${avgCompletionTime > 0 ? avgCompletionTime + 'h' : '0h'}`);
        this.animateMetricUpdate('currentStreak', currentStreak);
        this.animateMetricUpdate('productivityRate', `${completionRate}%`);
    }

    animateMetricUpdate(elementId, newValue) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const currentValue = element.textContent;
        if (currentValue !== newValue.toString()) {
            element.style.transform = 'scale(1.1)';
            element.style.color = '#059669';
            
            setTimeout(() => {
                element.textContent = newValue;
                element.style.transform = 'scale(1)';
                element.style.color = '';
            }, 150);
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

    updateCompletionTrends() {
        // Get last 7 days of data
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last7Days.push({
                date: date.toISOString().split('T')[0],
                label: date.toLocaleDateString('en-US', { weekday: 'short' })
            });
        }

        const trendData = last7Days.map(day => {
            const dayTasks = this.tasks.filter(task => {
                if (!task.completedAt) return false;
                const completedDate = new Date(task.completedAt).toISOString().split('T')[0];
                return completedDate === day.date;
            });
            return {
                ...day,
                completed: dayTasks.length
            };
        });

        // Update best progress day
        const bestDay = trendData.reduce((best, current) => 
            current.completed > best.completed ? current : best, trendData[0]);
        
        const bestDayElement = document.getElementById('bestProgressDay');
        if (bestDayElement) {
            bestDayElement.textContent = bestDay.label;
        }

        // Update weekly total
        const weeklyTotal = trendData.reduce((sum, day) => sum + day.completed, 0);
        const weeklyTotalElement = document.getElementById('weeklyTotal');
        if (weeklyTotalElement) {
            weeklyTotalElement.textContent = `${weeklyTotal} tasks`;
        }
    }

    updateCategoryBreakdown() {
        const categories = {};
        this.tasks.forEach(task => {
            categories[task.category] = (categories[task.category] || 0) + 1;
        });

        // Find most active category
        const topCategory = Object.entries(categories).reduce((top, [cat, count]) => 
            count > top.count ? { category: cat, count } : top, 
            { category: 'general', count: 0 }
        );

        const topCategoryElement = document.getElementById('topCategory');
        if (topCategoryElement) {
            topCategoryElement.textContent = topCategory.category.charAt(0).toUpperCase() + topCategory.category.slice(1);
        }
    }

    updateProductivityInsights() {
        // Update best performing day
        const dayStats = this.getDayStats();
        const bestDay = Object.entries(dayStats).reduce((best, [day, count]) => 
            count > best.count ? { day, count } : best, 
            { day: 'Monday', count: 0 }
        );

        const bestDayElement = document.getElementById('bestDay');
        if (bestDayElement) {
            bestDayElement.textContent = bestDay.day;
        }

        // Update peak hours (simulated for demo)
        const peakHours = this.calculatePeakHours();
        const peakHoursElement = document.getElementById('peakHours');
        if (peakHoursElement) {
            peakHoursElement.textContent = peakHours;
        }

        // Update completion rate
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        const completionRateElement = document.getElementById('completionRate');
        if (completionRateElement) {
            completionRateElement.textContent = `${completionRate}%`;
        }
    }

    getDayStats() {
        const dayStats = {
            'Monday': 0, 'Tuesday': 0, 'Wednesday': 0, 'Thursday': 0,
            'Friday': 0, 'Saturday': 0, 'Sunday': 0
        };

        this.tasks.filter(task => task.completed && task.completedAt).forEach(task => {
            const date = new Date(task.completedAt);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            dayStats[dayName]++;
        });

        return dayStats;
    }

    calculatePeakHours() {
        // Simulated peak hours calculation (in a real app, this would analyze completion times)
        const completedTasks = this.tasks.filter(task => task.completed);
        if (completedTasks.length === 0) return '9:00 AM - 11:00 AM';
        
        // Simple simulation - peak hours based on completion pattern
        const patterns = [
            '9:00 AM - 11:00 AM',
            '10:00 AM - 12:00 PM', 
            '2:00 PM - 4:00 PM',
            '3:00 PM - 5:00 PM'
        ];
        
        return patterns[Math.floor(Math.random() * patterns.length)];
    }

    updateAchievements() {
        const achievements = this.calculateAchievements();
        const achievementsGrid = document.getElementById('achievementsGrid');
        
        if (achievementsGrid) {
            // Update existing achievement elements with calculated data
            const achievementElements = achievementsGrid.querySelectorAll('.achievement-item');
            
            // Update streak achievement
            const streakAchievement = achievementElements[1];
            if (streakAchievement) {
                const streak = this.calculateProductivityStreak();
                const badge = streakAchievement.querySelector('.achievement-badge');
                if (streak >= 7) {
                    streakAchievement.classList.remove('locked');
                    streakAchievement.classList.add('unlocked');
                    badge.textContent = 'Unlocked';
                } else {
                    badge.textContent = `${streak}/7`;
                }
            }

            // Update productivity king achievement
            const kingAchievement = achievementElements[2];
            if (kingAchievement) {
                const completed = this.tasks.filter(task => task.completed).length;
                const badge = kingAchievement.querySelector('.achievement-badge');
                if (completed >= 100) {
                    kingAchievement.classList.remove('locked');
                    kingAchievement.classList.add('unlocked');
                    badge.textContent = 'Unlocked';
                } else {
                    badge.textContent = `${completed}/100`;
                }
            }
        }
    }

    calculateAchievements() {
        const completed = this.tasks.filter(task => task.completed).length;
        const streak = this.calculateProductivityStreak();
        
        return [
            {
                id: 'first-steps',
                title: 'First Steps',
                description: 'Complete your first task',
                unlocked: completed > 0,
                progress: Math.min(completed, 1),
                total: 1
            },
            {
                id: 'week-warrior',
                title: 'Week Warrior',
                description: '7-day completion streak',
                unlocked: streak >= 7,
                progress: Math.min(streak, 7),
                total: 7
            },
            {
                id: 'productivity-king',
                title: 'Productivity King',
                description: 'Complete 100 tasks',
                unlocked: completed >= 100,
                progress: Math.min(completed, 100),
                total: 100
            }
        ];
    }

    generateProductivityInsights() {
        const insights = [];
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const completionRate = total > 0 ? (completed / total) * 100 : 0;

        // Completion rate insight
        if (completionRate >= 80) {
            insights.push({
                icon: 'fa-trophy',
                title: 'Excellent Performance!',
                description: `You're completing ${Math.round(completionRate)}% of your tasks. Keep up the great work!`
            });
        } else if (completionRate >= 60) {
            insights.push({
                icon: 'fa-thumbs-up',
                title: 'Good Progress',
                description: `You're completing ${Math.round(completionRate)}% of tasks. Consider breaking larger tasks into smaller ones.`
            });
        } else {
            insights.push({
                icon: 'fa-target',
                title: 'Room for Improvement',
                description: `Your completion rate is ${Math.round(completionRate)}%. Try prioritizing fewer, more important tasks.`
            });
        }

        // Category distribution insight
        const categories = {};
        this.tasks.forEach(task => {
            categories[task.category] = (categories[task.category] || 0) + 1;
        });
        
        const workTasks = categories['work'] || 0;
        const workPercentage = total > 0 ? (workTasks / total) * 100 : 0;
        
        if (workPercentage > 70) {
            insights.push({
                icon: 'fa-balance-scale',
                title: 'Work-Life Balance',
                description: 'Your tasks are heavily work-focused. Consider adding personal activities for better balance.'
            });
        }

        // Recent activity insight
        const recentTasks = this.tasks.filter(task => {
            const createdDate = new Date(task.createdAt);
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
            return createdDate > threeDaysAgo;
        });

        if (recentTasks.length > 5) {
            insights.push({
                icon: 'fa-fire',
                title: 'High Activity',
                description: `You've been very active with ${recentTasks.length} tasks created in the last 3 days!`
            });
        }

        return insights;
    }

    initializeCharts() {
        // Only initialize if Chart.js is available
        if (typeof Chart !== 'undefined') {
            this.createTaskDistributionChart();
            this.createCategoryChart();
            this.createWeeklyProgressChart();
            console.log('📊 Charts initialized successfully');
        } else {
            console.log('Chart.js not loaded, using fallback visualizations');
        }
    }

    createTaskDistributionChart() {
        const ctx = document.getElementById('taskDistributionChart');
        if (!ctx) {
            console.log('📊 Task distribution chart canvas not found');
            return;
        }

        const completed = this.tasks.filter(task => task.completed).length;
        const pending = this.tasks.filter(task => !task.completed).length;
        const today = new Date().toISOString().split('T')[0];
        const overdue = this.tasks.filter(task => 
            !task.completed && task.date && task.date < today
        ).length;

        console.log('📊 Creating task distribution chart with data:', { completed, pending, overdue, total: this.tasks.length });

        // Ensure we have some data to show
        if (this.tasks.length === 0) {
            console.log('📊 No tasks found for task distribution chart');
            // Show empty state
            ctx.parentElement.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 200px; color: #666;"><i class="fas fa-chart-pie" style="margin-right: 10px;"></i>No data available</div>';
            return;
        }

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Pending', 'Overdue'],
                datasets: [{
                    data: [completed, pending, overdue],
                    backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    createWeeklyProgressChart() {
        const ctx = document.getElementById('weeklyProgressChart');
        if (!ctx) {
            console.log('📊 Weekly progress chart canvas not found');
            return;
        }

        // Generate last 7 days data
        const last7Days = [];
        const completionData = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            
            last7Days.push(dayName);
            
            // Count completed tasks for this day
            const completedToday = this.tasks.filter(task => 
                task.completed && task.date === dateStr
            ).length;
            
            completionData.push(completedToday);
        }

        console.log('📊 Creating weekly progress chart with data:', { days: last7Days, completions: completionData });

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days,
                datasets: [{
                    label: 'Tasks Completed',
                    data: completionData,
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#007bff',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    createCategoryChart() {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) {
            console.log('📊 Category chart canvas not found');
            return;
        }

        const categories = {};
        this.tasks.forEach(task => {
            categories[task.category] = (categories[task.category] || 0) + 1;
        });

        console.log('📊 Creating category chart with data:', categories);

        // Ensure we have some data to show
        if (Object.keys(categories).length === 0) {
            console.log('📊 No categories found for category chart');
            // Show empty state
            ctx.parentElement.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 200px; color: #666;"><i class="fas fa-chart-bar" style="margin-right: 10px;"></i>No data available</div>';
            return;
        }

        const labels = Object.keys(categories).map(cat => this.formatCategoryName(cat));
        const data = Object.values(categories);
        const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6610f2', '#fd7e14'];

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Tasks',
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    formatCategoryName(category) {
        return category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    updateTimeRange(range) {
        // Filter tasks based on selected time range
        let filteredTasks = [...this.tasks];
        const now = new Date();

        switch (range) {
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                filteredTasks = this.tasks.filter(task => new Date(task.createdAt) > weekAgo);
                break;
            case 'month':
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                filteredTasks = this.tasks.filter(task => new Date(task.createdAt) > monthAgo);
                break;
            case 'year':
                const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                filteredTasks = this.tasks.filter(task => new Date(task.createdAt) > yearAgo);
                break;
        }

        // Temporarily update tasks for analytics
        const originalTasks = this.tasks;
        this.tasks = filteredTasks;
        this.renderAnalytics();
        this.tasks = originalTasks;

        this.showNotification(`Analytics updated for ${range} view`, 'success');
    }

    exportAnalytics() {
        const analytics = {
            summary: {
                totalTasks: this.tasks.length,
                completedTasks: this.tasks.filter(task => task.completed).length,
                pendingTasks: this.tasks.filter(task => !task.completed).length,
                completionRate: this.tasks.length > 0 ? 
                    Math.round((this.tasks.filter(task => task.completed).length / this.tasks.length) * 100) : 0
            },
            categories: this.getCategoryBreakdown(),
            insights: this.generateProductivityInsights(),
            exportDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(analytics, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `todo-analytics-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('Analytics exported successfully!', 'success');
    }

    getCategoryBreakdown() {
        const categories = {};
        this.tasks.forEach(task => {
            categories[task.category] = (categories[task.category] || 0) + 1;
        });
        return categories;
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

    loadTasks() {
        try {
            const saved = localStorage.getItem('todoApp_tasks');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    }
}

// Global dark mode manager for all pages
class DarkModeManager {
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

    updateTimePeriod(period) {
        // Update time period selector and refresh data
        this.currentPeriod = period;
        this.refreshData();
        this.showNotification(`Analytics updated for ${period}`, 'info');
    }

    updateCharts() {
        // Update Chart.js charts with new data
        if (this.charts.taskDistribution) {
            this.updateTaskDistributionChart();
        }
        if (this.charts.weeklyProgress) {
            this.updateWeeklyProgressChart();
        }
        if (this.charts.categoryChart) {
            this.updateCategoryChart();
        }
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

    loadTasks() {
        try {
            const saved = localStorage.getItem('todoApp_tasks');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    }

    forceCreateChartsWithData() {
        console.log('🚀 Force creating charts with guaranteed data...');
        
        // Ensure we have data
        if (this.tasks.length === 0) {
            console.log('📊 No tasks found, creating sample data...');
            this.createSampleTasks();
        }
        
        console.log('📊 Current task count:', this.tasks.length);
        console.log('📋 Task data:', this.tasks);
        
        // Force create all charts
        setTimeout(() => {
            console.log('📊 Creating task distribution chart...');
            this.createTaskDistributionChart();
            
            console.log('📊 Creating weekly progress chart...');
            this.createWeeklyProgressChart();
            
            console.log('📊 Creating category chart...');
            this.createCategoryChart();
            
            console.log('✅ All charts creation attempted');
        }, 100);
    }

    createSampleTasks() {
        // Create sample tasks similar to tasks.js for analytics demonstration
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        this.tasks = [
            {
                id: 'analytics-1',
                text: "Review analytics dashboard",
                completed: true,
                date: yesterday,
                time: "14:00",
                priority: "high",
                category: "work",
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'analytics-2',
                text: "Update project documentation",
                completed: true,
                date: twoDaysAgo,
                time: "18:00",
                priority: "medium",
                category: "work",
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'analytics-3',
                text: "Plan weekend activities",
                completed: false,
                date: today,
                time: "10:00",
                priority: "low",
                category: "personal",
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'analytics-4',
                text: "Team standup meeting",
                completed: true,
                date: threeDaysAgo,
                time: "09:00",
                priority: "urgent",
                category: "work",
                createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'analytics-5',
                text: "Grocery shopping",
                completed: false,
                date: today,
                time: "16:00",
                priority: "medium",
                category: "personal",
                createdAt: new Date().toISOString()
            },
            {
                id: 'analytics-6',
                text: "Code review session",
                completed: true,
                date: yesterday,
                time: "11:00",
                priority: "high",
                category: "work",
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        
        // Save to localStorage so other pages can access this data too
        try {
            localStorage.setItem('todoApp_tasks', JSON.stringify(this.tasks));
            console.log('✅ Analytics: Sample tasks created and saved to localStorage');
        } catch (error) {
            console.error('❌ Analytics: Error saving sample tasks:', error);
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
        this.updateToggleButton(darkMode);
        
        // Listen for storage changes (when dark mode is toggled from another page)
        window.addEventListener('storage', (e) => {
            if (e.key === 'todoApp_darkMode') {
                const newDarkMode = this.loadDarkMode();
                document.body.classList.toggle('dark-mode', newDarkMode);
                this.updateToggleElements(newDarkMode);
                this.updateToggleButton(newDarkMode);
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
        this.updateToggleButton(newMode);
        return newMode;
    }
    
    toggleDarkMode() {
        return this.toggle();
    }
    
    updateToggleButton(darkMode) {
        const toggleBtn = document.getElementById('darkModeToggle');
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                icon.className = darkMode ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }
}

// Initialize Analytics with enhanced features
document.addEventListener('DOMContentLoaded', () => {
    console.log('📊 Analytics page DOM loaded');
    
    // Initialize dark mode manager
    const darkModeManager = new DarkModeManager();
    
    // Wait for Chart.js to be ready
    setTimeout(() => {
        console.log('🚀 Initializing Analytics App...');
        console.log('📊 Chart.js available:', typeof Chart !== 'undefined');
        
        // Initialize analytics app
        window.analyticsApp = new AnalyticsApp();
        
        // Force refresh after initialization
        setTimeout(() => {
            console.log('🔄 Force refreshing analytics data and charts...');
            if (window.analyticsApp) {
                window.analyticsApp.refreshData();
                console.log('✅ Analytics force refreshed');
            }
        }, 1000);
        
    }, 500);
    
    // Add CSS animations for slide effects
    if (!document.querySelector('#analytics-animations')) {
        const style = document.createElement('style');
        style.id = 'analytics-animations';
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
            
            .analytics-card {
                animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .metric-item:hover {
                animation: none !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    console.log('📊 Analytics initialized with enhanced features!');
});
