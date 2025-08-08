// AI Assistant JavaScript - Clean Version
class AIAssistantApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.chatHistory = this.loadChatHistory();
        this.aiResponses = this.initializeAIResponses();
        this.initializeEventListeners();
        this.updateAIInsights();
        this.renderChatHistory();
        this.generateProductivityTips();
        this.animateOnLoad();
    }

    initializeEventListeners() {
        // Chat functionality
        const chatForm = document.getElementById('chatForm');
        const chatInput = document.getElementById('chatInput');

        if (chatForm) {
            chatForm.addEventListener('submit', (e) => this.handleChatSubmit(e));
        }

        if (chatInput) {
            // Auto-resize textarea
            chatInput.addEventListener('input', () => this.autoResizeTextarea(chatInput));
            
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleChatSubmit(e);
                }
            });
        }

        // Quick action buttons with enhanced animations
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.animateButtonPress(btn);
                this.handleQuickAction(e.target.closest('.quick-action-btn').dataset.action);
            });
        });

        // Apply suggestion buttons
        document.querySelectorAll('.apply-suggestion').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.applySuggestion(e.target.closest('.apply-suggestion').dataset.suggestion);
                this.animateSuccessAction(e.target);
            });
        });

        // Automation toggles
        document.querySelectorAll('.automation-item .toggle-input').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                this.handleAutomationToggle(e.target.id, e.target.checked);
                this.showToast(`${e.target.checked ? 'Enabled' : 'Disabled'} ${this.getAutomationName(e.target.id)}`);
            });
        });

        // Mobile navigation toggle
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }

        // Initialize tooltips
        this.initializeTooltips();
    }

    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    animateButtonPress(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }

    animateSuccessAction(element) {
        const originalText = element.innerHTML;
        element.innerHTML = '<i class="fas fa-check"></i> Applied!';
        element.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
        
        setTimeout(() => {
            element.innerHTML = originalText;
            element.style.background = '';
        }, 2000);
    }

    animateOnLoad() {
        // Animate cards on load
        const cards = document.querySelectorAll('.ai-feature-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            setTimeout(() => {
                card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }

    initializeAIResponses() {
        return {
            productivity: [
                "Based on your task patterns, I recommend using the Pomodoro Technique. Try working in 25-minute focused sessions with 5-minute breaks! 🍅",
                "I notice you're most productive in the mornings. Consider scheduling your most important tasks between 9-11 AM for optimal results! ☀️",
                "Your task completion rate could improve by 23% if you break down large tasks into smaller, actionable steps. Would you like me to help with that? 📝"
            ],
            organization: [
                "I suggest grouping similar tasks together. For example, batch all your email-related tasks to reduce context switching! 📧",
                "Consider using the SMART criteria for your goals: Specific, Measurable, Achievable, Relevant, and Time-bound! 🎯",
                "Your workspace organization affects productivity by up to 40%. Try the 5S methodology: Sort, Set in order, Shine, Standardize, Sustain! 🗂️"
            ],
            timeManagement: [
                "Time blocking can increase your productivity by 35%. Allocate specific time slots for different types of work! ⏰",
                "I recommend the 2-minute rule: if a task takes less than 2 minutes, do it immediately rather than adding it to your list! ⚡",
                "Your peak focus hours appear to be between 9-11 AM and 2-4 PM. Schedule your most challenging tasks during these windows! 🧠"
            ],
            motivation: [
                "You've completed 78% of your tasks this week - that's fantastic progress! Remember, consistency beats perfection! 💪",
                "Consider celebrating small wins! Research shows that acknowledging progress boosts motivation by 32%! 🎉",
                "When feeling overwhelmed, try the 1% rule: just commit to improving by 1% each day. Small steps lead to big changes! 🌱"
            ]
        };
    }

    handleChatSubmit(e) {
        e.preventDefault();
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;

        // Add user message to chat
        this.addChatMessage(message, 'user');
        input.value = '';
        this.autoResizeTextarea(input);

        // Show typing indicator
        this.showTypingIndicator();

        // Simulate AI response with intelligent suggestions
        setTimeout(() => {
            this.hideTypingIndicator();
            const response = this.generateAIResponse(message);
            this.addChatMessage(response, 'ai');
        }, 1500);
    }

    addChatMessage(message, sender) {
        const chatContainer = document.getElementById('chatMessages');
        if (!chatContainer) return;

        const messageEl = document.createElement('div');
        messageEl.className = `chat-message ${sender}-message`;
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (sender === 'user') {
            messageEl.innerHTML = `
                <div class="message-content">
                    <p>${message}</p>
                </div>
                <div class="message-time">${time}</div>
                <div class="message-avatar user-avatar">
                    <i class="fas fa-user"></i>
                </div>
            `;
            messageEl.style.flexDirection = 'row-reverse';
        } else {
            messageEl.innerHTML = `
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <p>${message}</p>
                </div>
                <div class="message-time">${time}</div>
            `;
        }

        messageEl.style.animation = 'fadeInUp 0.4s ease';
        chatContainer.appendChild(messageEl);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // Save to chat history
        this.chatHistory.push({ message, sender, timestamp: new Date().toISOString() });
        this.saveChatHistory();
    }

    generateAIResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Analyze message intent
        if (message.includes('productivity') || message.includes('efficient') || message.includes('better')) {
            return this.getRandomResponse('productivity');
        } else if (message.includes('organize') || message.includes('structure') || message.includes('plan')) {
            return this.getRandomResponse('organization');
        } else if (message.includes('time') || message.includes('schedule') || message.includes('deadline')) {
            return this.getRandomResponse('timeManagement');
        } else if (message.includes('motivat') || message.includes('stuck') || message.includes('overwhelm')) {
            return this.getRandomResponse('motivation');
        } else {
            return this.getPersonalizedResponse(message);
        }
    }

    getRandomResponse(category) {
        const responses = this.aiResponses[category];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getPersonalizedResponse(message) {
        const personalizedResponses = [
            `That's an interesting question about "${message}". Based on your productivity patterns, I recommend focusing on one task at a time for better results! 🎯`,
            `I understand you're asking about "${message}". Your completion rate shows you work best with clear, actionable steps. Let me help you break this down! 📊`,
            `Great question! For "${message}", I suggest applying the 80/20 rule - focus on the 20% of tasks that will give you 80% of the results! ⚡`,
            `Thanks for asking about "${message}". Your data shows you're most successful when you set specific deadlines. Would you like me to help you create a timeline? 📅`
        ];
        return personalizedResponses[Math.floor(Math.random() * personalizedResponses.length)];
    }

    showTypingIndicator() {
        const chatContainer = document.getElementById('chatMessages');
        if (!chatContainer) return;

        const typingEl = document.createElement('div');
        typingEl.className = 'chat-message ai-message typing-indicator';
        typingEl.id = 'typing-indicator';
        typingEl.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content typing-animation">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        chatContainer.appendChild(typingEl);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    applySuggestion(suggestionType) {
        const suggestions = {
            'break-down': () => {
                this.showToast('💡 I\'ll help you identify large tasks that can be broken down into smaller steps!');
                this.addChatMessage('I\'ve analyzed your tasks and found 3 large tasks that could be broken down. Would you like me to suggest specific sub-tasks for each?', 'ai');
            },
            'time-blocks': () => {
                this.showToast('⏰ Time blocking suggestions have been applied to your schedule!');
                this.addChatMessage('I\'ve optimized your schedule based on your peak productivity hours. Check your calendar for new time blocks!', 'ai');
            },
            'categories': () => {
                this.showToast('🗂️ Your tasks have been reorganized into smart categories!');
                this.addChatMessage('I\'ve grouped similar tasks together and created 4 new categories to streamline your workflow. Take a look at your updated task list!', 'ai');
            }
        };

        if (suggestions[suggestionType]) {
            suggestions[suggestionType]();
        }
    }

    handleAutomationToggle(automationId, isEnabled) {
        const automations = {
            'auto-prioritize': 'Auto-Prioritize Tasks',
            'smart-scheduling': 'Smart Scheduling',
            'reminder-optimization': 'Intelligent Reminders'
        };

        // Save automation preference
        this.saveAutomationSetting(automationId, isEnabled);
        
        if (isEnabled) {
            this.simulateAutomationSetup(automations[automationId]);
        }
    }

    getAutomationName(automationId) {
        const names = {
            'auto-prioritize': 'Auto-Prioritize Tasks',
            'smart-scheduling': 'Smart Scheduling',
            'reminder-optimization': 'Intelligent Reminders'
        };
        return names[automationId] || 'Automation';
    }

    simulateAutomationSetup(automationName) {
        setTimeout(() => {
            this.addChatMessage(`🤖 ${automationName} is now active! I'm learning from your patterns to provide better automation. You should see improvements within 24-48 hours.`, 'ai');
        }, 1000);
    }

    initializeTooltips() {
        // Add tooltips to various elements
        const tooltips = [
            { selector: '.confidence-score', text: 'AI confidence level based on data analysis' },
            { selector: '.productivity-score .score-number', text: 'Your overall productivity score this week' },
            { selector: '.progress-fill', text: 'AI learning progress in this area' }
        ];

        tooltips.forEach(tooltip => {
            document.querySelectorAll(tooltip.selector).forEach(element => {
                element.title = tooltip.text;
            });
        });
    }

    showToast(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => toast.classList.add('show'), 100);

        // Remove after 4 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    handleQuickAction(action) {
        switch(action) {
            case 'optimize':
                this.addChatMessage('🗓️ I\'m analyzing your schedule to find optimization opportunities...', 'ai');
                setTimeout(() => {
                    this.addChatMessage('Based on your patterns, I suggest moving your "Review Project" task to 9 AM when you\'re most focused!', 'ai');
                }, 2000);
                break;
            case 'priorities':
                this.addChatMessage('🎯 Let me analyze your task priorities...', 'ai');
                setTimeout(() => {
                    this.addChatMessage('I recommend prioritizing: 1) Tasks with approaching deadlines, 2) High-impact projects, 3) Quick wins that boost momentum!', 'ai');
                }, 2000);
                break;
            case 'estimates':
                this.addChatMessage('⏱️ Analyzing your historical completion times...', 'ai');
                setTimeout(() => {
                    this.addChatMessage('Based on similar tasks, I estimate: Writing tasks ~45 mins, Planning tasks ~30 mins, Review tasks ~20 mins!', 'ai');
                }, 2000);
                break;
            case 'tips':
                this.generateAndDisplayTip();
                break;
        }
    }

    generateAndDisplayTip() {
        const tips = [
            "💡 Try the 2-minute rule: If it takes less than 2 minutes, do it now!",
            "🎯 Use the ABCDE method: A=Must do, B=Should do, C=Could do, D=Delegate, E=Eliminate",
            "⏰ Time-block your calendar to avoid decision fatigue",
            "🧘 Take a 5-minute break every hour to maintain focus",
            "📝 Write tomorrow's top 3 tasks before ending today"
        ];
        
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        this.addChatMessage(randomTip, 'ai');
    }

    updateAIInsights() {
        // This would normally analyze actual task data
        // For demo purposes, we'll show static insights
        console.log('🤖 AI insights updated');
    }

    renderChatHistory() {
        const chatContainer = document.getElementById('chatMessages');
        if (!chatContainer || this.chatHistory.length === 0) return;

        // Only show the initial AI message if no history exists
        if (this.chatHistory.length === 0) {
            // The initial message is already in the HTML
            return;
        }

        // Render saved chat history
        this.chatHistory.forEach(chat => {
            if (chat.message && chat.sender) {
                this.addChatMessageToDOM(chat.message, chat.sender, false);
            }
        });
    }

    addChatMessageToDOM(message, sender, shouldSave = true) {
        const chatContainer = document.getElementById('chatMessages');
        if (!chatContainer) return;

        const messageEl = document.createElement('div');
        messageEl.className = `chat-message ${sender}-message`;
        
        if (sender === 'user') {
            messageEl.innerHTML = `
                <div class="message-content">
                    <p>${message}</p>
                </div>
                <div class="message-avatar user-avatar">
                    <i class="fas fa-user"></i>
                </div>
            `;
            messageEl.style.flexDirection = 'row-reverse';
        } else {
            messageEl.innerHTML = `
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <p>${message}</p>
                </div>
            `;
        }

        chatContainer.appendChild(messageEl);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        if (shouldSave) {
            this.chatHistory.push({ message, sender, timestamp: new Date().toISOString() });
            this.saveChatHistory();
        }
    }

    generateProductivityTips() {
        // Generate contextual productivity tips
        console.log('📈 Productivity tips generated');
    }

    saveAutomationSetting(automationId, isEnabled) {
        try {
            const settings = JSON.parse(localStorage.getItem('todoApp_automationSettings') || '{}');
            settings[automationId] = isEnabled;
            localStorage.setItem('todoApp_automationSettings', JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving automation setting:', error);
        }
    }

    loadTasks() {
        try {
            const savedTasks = localStorage.getItem('todoApp_tasks');
            return savedTasks ? JSON.parse(savedTasks) : [];
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    }

    loadChatHistory() {
        try {
            const saved = localStorage.getItem('todoApp_aiChatHistory');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading chat history:', error);
            return [];
        }
    }

    saveChatHistory() {
        try {
            localStorage.setItem('todoApp_aiChatHistory', JSON.stringify(this.chatHistory));
        } catch (error) {
            console.error('Error saving chat history:', error);
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
                console.log('🌙 Dark mode synced from another page:', newDarkMode);
            }
        });
        
        // Also listen for custom events (for same-page changes)
        window.addEventListener('darkModeChanged', (e) => {
            document.body.classList.toggle('dark-mode', e.detail.darkMode);
            console.log('🌙 Dark mode changed:', e.detail.darkMode);
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

// Initialize AI Assistant
document.addEventListener('DOMContentLoaded', () => {
    // Apply dark mode first
    DarkModeManager.init();
    
    window.aiAssistantApp = new AIAssistantApp();
    console.log('🤖 AI Assistant initialized successfully!');
});
