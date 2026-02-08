// Gemini AI Module for Doctor Component
// Handles AI chat functionality using Google's Gemini API

class GeminiAI {
    constructor() {
        this.API_KEY = 'AIzaSyBzurxPl1gPAMGD8pPKTm3FL-B_xfkmY2E';
        this.API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        this.chatHistory = [];
        this.maxHistory = 20;
        this.isTyping = false;
        this.currentSession = null;
        
        // Component knowledge base for context
        this.componentContext = `
You are Dr. Chip, an AI assistant for Doctor Component - an electronic component replacement platform.
You help users with:
1. Finding replacement components for EOL (End of Life) parts
2. Analyzing datasheets and specifications
3. Comparing component alternatives
4. Answering general electronics questions
5. Providing technical guidance

Be helpful, professional, and concise. When discussing components, provide specific part numbers and manufacturers when possible.
`;

        this.init();
    }

    init() {
        this.loadChatHistory();
        this.initUI();
    }

    initUI() {
        // Cache elements
        this.chatContainer = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('sendMessage');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.quickTopics = document.querySelectorAll('.quick-topic');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.chatHistoryList = document.getElementById('chatHistoryList');
        this.sessionsList = document.getElementById('sessionsList');

        // Bind events
        this.sendBtn?.addEventListener('click', () => this.sendMessage());
        this.chatInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Quick topics
        this.quickTopics.forEach(topic => {
            topic.addEventListener('click', () => {
                const query = topic.dataset.query;
                this.chatInput.value = query;
                this.sendMessage();
            });
        });

        // New chat
        this.newChatBtn?.addEventListener('click', () => this.startNewChat());

        // Auto-resize textarea
        this.chatInput?.addEventListener('input', () => {
            this.chatInput.style.height = 'auto';
            this.chatInput.style.height = Math.min(this.chatInput.scrollHeight, 150) + 'px';
        });

        // Load sessions
        this.loadSessions();
    }

    async sendMessage(message = null) {
        const userMessage = message || this.chatInput?.value.trim();
        if (!userMessage || this.isTyping) return;

        // Clear input
        if (!message && this.chatInput) {
            this.chatInput.value = '';
            this.chatInput.style.height = 'auto';
        }

        // Add user message to chat
        this.addMessage('user', userMessage);

        // Add to history
        this.chatHistory.push({ role: 'user', content: userMessage });
        this.trimHistory();

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const response = await this.callGeminiAPI(userMessage);
            this.hideTypingIndicator();
            
            // Add AI response
            this.addMessage('ai', response);
            
            // Add to history
            this.chatHistory.push({ role: 'ai', content: response });
            this.trimHistory();
            
            // Save session
            this.saveCurrentSession();

        } catch (error) {
            this.hideTypingIndicator();
            console.error('Gemini API error:', error);
            this.addMessage('ai', 'I apologize, but I encountered an error. Please try again in a moment.', true);
        }
    }

    async callGeminiAPI(message) {
        // Build conversation context
        const conversationContext = this.chatHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        // Add system context as first message if new conversation
        if (conversationContext.length === 0) {
            conversationContext.push({
                role: 'user',
                parts: [{ text: this.componentContext }]
            });
            conversationContext.push({
                role: 'model',
                parts: [{ text: 'Understood. I am Dr. Chip, ready to assist with electronic component replacements and technical questions.' }]
            });
        }

        // Add current message
        conversationContext.push({
            role: 'user',
            parts: [{ text: message }]
        });

        const response = await fetch(`${this.API_URL}?key=${this.API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: conversationContext,
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048
                },
                safetySettings: [
                    {
                        category: 'HARM_CATEGORY_HARASSMENT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    },
                    {
                        category: 'HARM_CATEGORY_HATE_SPEECH',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    },
                    {
                        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    },
                    {
                        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'API request failed');
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            return data.candidates[0].content.parts[0].text;
        }

        throw new Error('Invalid response format');
    }

    addMessage(role, content, isError = false) {
        if (!this.chatContainer) return;

        const messageEl = document.createElement('div');
        messageEl.className = `message ${role}${isError ? ' error' : ''}`;
        
        const avatar = role === 'ai' 
            ? '<img src="images/ai-mascot.png" alt="Dr. Chip" class="message-avatar">'
            : '<div class="message-avatar user-avatar"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>';

        // Format content (basic markdown)
        const formattedContent = this.formatContent(content);

        messageEl.innerHTML = `
            ${avatar}
            <div class="message-content">
                <div class="message-text">${formattedContent}</div>
                <div class="message-time">${this.formatTime(new Date())}</div>
            </div>
        `;

        this.chatContainer.appendChild(messageEl);
        this.scrollToBottom();

        // Animate in
        requestAnimationFrame(() => {
            messageEl.classList.add('show');
        });
    }

    formatContent(content) {
        // Escape HTML
        let formatted = this.escapeHtml(content);

        // Format code blocks
        formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
        formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Format bold and italic
        formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');

        // Format links
        formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

        // Format lists
        formatted = formatted.replace(/^\s*[-*]\s+(.+)$/gm, '<li>$1</li>');
        formatted = formatted.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

        // Format line breaks
        formatted = formatted.replace(/\n/g, '<br>');

        return formatted;
    }

    showTypingIndicator() {
        this.isTyping = true;
        if (this.typingIndicator) {
            this.typingIndicator.classList.add('show');
            this.scrollToBottom();
        }
    }

    hideTypingIndicator() {
        this.isTyping = false;
        if (this.typingIndicator) {
            this.typingIndicator.classList.remove('show');
        }
    }

    scrollToBottom() {
        if (this.chatContainer) {
            this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        }
    }

    startNewChat() {
        // Save current session if has messages
        if (this.chatHistory.length > 0) {
            this.saveCurrentSession();
        }

        // Clear chat
        this.chatHistory = [];
        this.currentSession = null;
        
        if (this.chatContainer) {
            this.chatContainer.innerHTML = `
                <div class="welcome-message">
                    <img src="images/ai-mascot.png" alt="Dr. Chip" class="welcome-avatar">
                    <h3>Hello! I'm Dr. Chip</h3>
                    <p>Your AI assistant for electronic component replacements. I can help you find alternatives, analyze datasheets, and answer technical questions.</p>
                    <div class="welcome-suggestions">
                        <span class="suggestion-chip" data-query="Find a replacement for 2N2222 transistor">
                            Find 2N2222 replacement
                        </span>
                        <span class="suggestion-chip" data-query="What are good alternatives to the LM358 op-amp?">
                            LM358 alternatives
                        </span>
                        <span class="suggestion-chip" data-query="Explain the difference between NPN and PNP transistors">
                            NPN vs PNP
                        </span>
                    </div>
                </div>
            `;

            // Bind suggestion chips
            this.chatContainer.querySelectorAll('.suggestion-chip').forEach(chip => {
                chip.addEventListener('click', () => {
                    this.chatInput.value = chip.dataset.query;
                    this.sendMessage();
                });
            });
        }

        // Reload sessions
        this.loadSessions();
    }

    saveCurrentSession() {
        if (this.chatHistory.length === 0) return;

        const sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
        
        const session = {
            id: this.currentSession || Date.now().toString(),
            title: this.generateSessionTitle(),
            preview: this.chatHistory[0]?.content.substring(0, 50) + '...',
            messages: this.chatHistory,
            timestamp: Date.now()
        };

        // Update or add session
        const existingIndex = sessions.findIndex(s => s.id === session.id);
        if (existingIndex >= 0) {
            sessions[existingIndex] = session;
        } else {
            sessions.unshift(session);
            // Keep only last 20 sessions
            if (sessions.length > 20) sessions.pop();
        }

        localStorage.setItem('chatSessions', JSON.stringify(sessions));
        this.currentSession = session.id;
        this.loadSessions();
    }

    loadSessions() {
        if (!this.sessionsList) return;

        const sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');

        if (sessions.length === 0) {
            this.sessionsList.innerHTML = '<p class="no-sessions">No previous chats</p>';
            return;
        }

        this.sessionsList.innerHTML = sessions.map(session => `
            <div class="session-item ${session.id === this.currentSession ? 'active' : ''}" data-session-id="${session.id}">
                <div class="session-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </div>
                <div class="session-info">
                    <span class="session-title">${this.escapeHtml(session.title)}</span>
                    <span class="session-time">${this.formatTimeAgo(session.timestamp)}</span>
                </div>
                <button class="session-delete" data-session-id="${session.id}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `).join('');

        // Bind session clicks
        this.sessionsList.querySelectorAll('.session-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.session-delete')) {
                    this.loadSession(item.dataset.sessionId);
                }
            });
        });

        // Bind delete buttons
        this.sessionsList.querySelectorAll('.session-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteSession(btn.dataset.sessionId);
            });
        });
    }

    loadSession(sessionId) {
        const sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
        const session = sessions.find(s => s.id === sessionId);

        if (!session) return;

        this.currentSession = sessionId;
        this.chatHistory = session.messages;

        // Render messages
        if (this.chatContainer) {
            this.chatContainer.innerHTML = '';
            this.chatHistory.forEach(msg => {
                this.addMessage(msg.role, msg.content);
            });
        }

        // Update active state
        this.sessionsList?.querySelectorAll('.session-item').forEach(item => {
            item.classList.toggle('active', item.dataset.sessionId === sessionId);
        });
    }

    deleteSession(sessionId) {
        let sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
        sessions = sessions.filter(s => s.id !== sessionId);
        localStorage.setItem('chatSessions', JSON.stringify(sessions));

        if (this.currentSession === sessionId) {
            this.startNewChat();
        } else {
            this.loadSessions();
        }
    }

    generateSessionTitle() {
        // Use first user message as title
        const firstUserMessage = this.chatHistory.find(m => m.role === 'user');
        if (firstUserMessage) {
            return firstUserMessage.content.substring(0, 30) + 
                   (firstUserMessage.content.length > 30 ? '...' : '');
        }
        return 'New Chat';
    }

    loadChatHistory() {
        // Load from current session if exists
        const saved = localStorage.getItem('currentChatSession');
        if (saved) {
            const session = JSON.parse(saved);
            this.chatHistory = session.messages || [];
            this.currentSession = session.id;
        }
    }

    trimHistory() {
        if (this.chatHistory.length > this.maxHistory) {
            this.chatHistory = this.chatHistory.slice(-this.maxHistory);
        }
    }

    formatTime(date) {
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    }

    formatTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        
        return new Date(timestamp).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Preset component queries
    getPresetQueries() {
        return {
            '2n2222': 'The 2N2222 is a common NPN bipolar junction transistor. Good replacements include: 2N3904 (lower current), PN2222 (similar specs), BC547 (European equivalent), or MPSA13 (Darlington for higher gain). Consider your specific requirements for current, voltage, and gain.',
            'lm358': 'The LM358 is a dual operational amplifier. Alternatives include: LM324 (quad version), TL072 (lower noise, JFET input), MCP6002 (rail-to-rail, modern), or LMV358 (low voltage). Choose based on your supply voltage and noise requirements.',
            '7805': 'The 7805 is a 5V linear voltage regulator. Modern replacements: LM7805 (direct replacement), AMS1117-5.0 (LDO, lower dropout), LM2940-5.0 (low dropout), or consider switching regulators like LM2596 for better efficiency.',
            'ne555': 'The NE555 timer is very common. Direct replacements: LM555, TLC555 (CMOS, lower power), NA555, or SA555. For new designs, consider microcontroller-based solutions for more flexibility.',
            '1n4007': 'The 1N4007 is a 1000V 1A rectifier diode. Alternatives: 1N5408 (3A version), UF4007 (fast recovery), or M7 (SMD equivalent). For higher currents, consider bridge rectifiers.'
        };
    }

    // Check if query matches a preset
    checkPresetQuery(query) {
        const presets = this.getPresetQueries();
        const lowerQuery = query.toLowerCase();
        
        for (const [key, response] of Object.entries(presets)) {
            if (lowerQuery.includes(key)) {
                return response;
            }
        }
        return null;
    }
}

// Initialize Gemini AI
const geminiAI = new GeminiAI();
