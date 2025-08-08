// Settings JavaScript
class SettingsApp {
    constructor() {
        this.darkMode = this.loadDarkMode();
        this.notifications = this.loadNotifications();
        this.initializeEventListeners();
        this.applyDarkMode(); // Apply dark mode immediately
        this.updateUI();
    }

    initializeEventListeners() {
        // Dark mode toggle
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('change', () => this.toggleDarkMode());
        }

        // Notification settings
        const notificationToggle = document.getElementById('notificationToggle');
        if (notificationToggle) {
            notificationToggle.addEventListener('change', () => this.toggleNotifications());
        }

        // Data management buttons
        const exportBtn = document.getElementById('exportData');
        const importBtn = document.getElementById('importData');
        const clearBtn = document.getElementById('clearData');

        if (exportBtn) exportBtn.addEventListener('click', () => this.exportData());
        if (importBtn) importBtn.addEventListener('click', () => this.importData());
        if (clearBtn) clearBtn.addEventListener('click', () => this.clearAllData());

        // Mobile navigation toggle
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }
    }

    toggleDarkMode() {
        this.darkMode = !this.darkMode;
        this.saveDarkMode();
        this.applyDarkMode();
        this.showNotification(`Dark mode ${this.darkMode ? 'enabled' : 'disabled'}!`, 'success');
        
        // Notify other pages about the change
        this.broadcastDarkModeChange();
    }

    applyDarkMode() {
        document.body.classList.toggle('dark-mode', this.darkMode);
        
        // Update dark mode toggle state
        const toggle = document.getElementById('darkModeToggle');
        if (toggle) {
            toggle.checked = this.darkMode;
        }
    }

    toggleNotifications() {
        this.notifications = !this.notifications;
        this.saveNotifications();
        this.showNotification(`Notifications ${this.notifications ? 'enabled' : 'disabled'}!`, 'success');
    }

    updateUI() {
        // Update toggles
        const darkModeToggle = document.getElementById('darkModeToggle');
        const notificationToggle = document.getElementById('notificationToggle');

        if (darkModeToggle) darkModeToggle.checked = this.darkMode;
        if (notificationToggle) notificationToggle.checked = this.notifications;

        // Update stats
        this.updateStorageStats();
    }

    updateStorageStats() {
        const tasks = this.loadTasks();
        const tasksCount = tasks.length;
        const completedCount = tasks.filter(task => task.completed).length;
        
        // Calculate storage usage (rough estimate)
        const storageSize = new Blob([JSON.stringify(tasks)]).size;
        const storageSizeKB = (storageSize / 1024).toFixed(2);

        // Update display
        const statsContainer = document.querySelector('.data-stats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stat-item">
                    <i class="fas fa-tasks"></i>
                    <div>
                        <strong>${tasksCount}</strong>
                        <span>Total Tasks</span>
                    </div>
                </div>
                <div class="stat-item">
                    <i class="fas fa-check-circle"></i>
                    <div>
                        <strong>${completedCount}</strong>
                        <span>Completed</span>
                    </div>
                </div>
                <div class="stat-item">
                    <i class="fas fa-database"></i>
                    <div>
                        <strong>${storageSizeKB} KB</strong>
                        <span>Storage Used</span>
                    </div>
                </div>
            `;
        }
    }

    exportData() {
        try {
            const data = {
                tasks: this.loadTasks(),
                settings: {
                    darkMode: this.darkMode,
                    notifications: this.notifications
                },
                exportDate: new Date().toISOString(),
                version: '1.0'
            };

            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `todo-backup-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            this.showNotification('Data exported successfully!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Failed to export data!', 'error');
        }
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (data.tasks) {
                        localStorage.setItem('todoApp_tasks', JSON.stringify(data.tasks));
                    }
                    
                    if (data.settings) {
                        if (data.settings.darkMode !== undefined) {
                            this.darkMode = data.settings.darkMode;
                            this.saveDarkMode();
                            this.applyDarkMode();
                        }
                        if (data.settings.notifications !== undefined) {
                            this.notifications = data.settings.notifications;
                            this.saveNotifications();
                        }
                    }
                    
                    this.updateUI();
                    this.showNotification('Data imported successfully!', 'success');
                } catch (error) {
                    console.error('Import error:', error);
                    this.showNotification('Invalid backup file!', 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone!')) {
            localStorage.removeItem('todoApp_tasks');
            localStorage.removeItem('todoApp_darkMode');
            localStorage.removeItem('todoApp_notifications');
            
            this.darkMode = false;
            this.notifications = true;
            this.updateUI();
            this.applyDarkMode();
            
            this.showNotification('All data cleared successfully!', 'success');
        }
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

    // Storage methods
    saveDarkMode() {
        localStorage.setItem('todoApp_darkMode', JSON.stringify(this.darkMode));
    }

    loadDarkMode() {
        try {
            const saved = localStorage.getItem('todoApp_darkMode');
            return saved ? JSON.parse(saved) : false;
        } catch (error) {
            console.error('Error loading dark mode setting:', error);
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

    broadcastDarkModeChange() {
        // Dispatch a custom event and trigger storage event to notify other pages
        window.dispatchEvent(new CustomEvent('darkModeChanged', { 
            detail: { darkMode: this.darkMode } 
        }));
        
        // Trigger storage event for cross-tab synchronization
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'todoApp_darkMode',
            newValue: JSON.stringify(this.darkMode),
            storageArea: localStorage
        }));
    }

    saveNotifications() {
        localStorage.setItem('todoApp_notifications', JSON.stringify(this.notifications));
    }

    loadNotifications() {
        try {
            const saved = localStorage.getItem('todoApp_notifications');
            return saved ? JSON.parse(saved) : true;
        } catch (error) {
            console.error('Error loading notification setting:', error);
            return true;
        }
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

// Initialize settings page
document.addEventListener('DOMContentLoaded', () => {
    window.settingsApp = new SettingsApp();
    console.log('⚙️ Settings initialized successfully!');
});

// Export for use in other pages
window.DarkModeManager = DarkModeManager;
