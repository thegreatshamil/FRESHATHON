/**
 * Gemini AI Integration
 * Doctor Component - Dr. Chip AI Assistant
 * 
 * Uses Google's Gemini API for intelligent responses
 */

// Gemini API Configuration
const GEMINI_API_KEY = 'AIzaSyBzurxPl1gPAMGD8pPKTm3FL-B_xfkmY2E';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Chat history for context
let chatHistory = [];

// Component knowledge base for quick responses
const componentDatabase = {
    '2N2222': {
        name: '2N2222',
        type: 'NPN Bipolar Junction Transistor',
        specs: 'Vceo: 40V, Ic: 800mA, hFE: 100-300, Package: TO-92',
        replacements: ['PN2222A (direct)', 'BC547 (lower current)', '2N3904 (similar)'],
        uses: 'General purpose amplification and switching'
    },
    'LM358': {
        name: 'LM358',
        type: 'Dual Operational Amplifier',
        specs: 'Supply: 3-32V, GBW: 1MHz, Slew Rate: 0.3V/µs',
        replacements: ['LM358B (improved)', 'RC4558 (higher BW)', 'NE5532 (low noise)'],
        uses: 'Active filters, signal conditioning, transducer amplifiers'
    },
    'NE555': {
        name: 'NE555',
        type: 'Timer IC',
        specs: 'Supply: 4.5-16V, Output: 200mA, Timing: µs to hours',
        replacements: ['TLC555 (CMOS low power)', 'LMC555 (very low power)', 'NA555 (precision)'],
        uses: 'Timers, oscillators, pulse generation'
    },
    '7805': {
        name: '7805',
        type: 'Linear Voltage Regulator',
        specs: 'Output: 5V, Current: 1A, Input: 7-25V',
        replacements: ['LM7805 (higher current)', 'AMS1117-5.0 (LDO)', 'LM2940CT-5.0 (low dropout)'],
        uses: 'Power supplies, voltage regulation'
    },
    'BC547': {
        name: 'BC547',
        type: 'NPN Bipolar Junction Transistor',
        specs: 'Vceo: 45V, Ic: 100mA, hFE: 110-800',
        replacements: ['BC547B (direct)', '2N3904 (higher current)', 'BC337 (higher gain)'],
        uses: 'Small signal amplification, switching'
    }
};

// System prompt for Dr. Chip personality
const SYSTEM_PROMPT = `You are Dr. Chip, a friendly and knowledgeable AI assistant specializing in electronic components. 
Your expertise includes:
- End-of-Life (EOL) component replacements
- Datasheet interpretation
- Component specifications and parameters
- Circuit design recommendations
- Electronics troubleshooting

Guidelines:
- Be concise but thorough in your explanations
- Use technical terms appropriately but explain them when needed
- Provide practical advice for engineers, technicians, and hobbyists
- When suggesting replacements, explain why they're suitable
- If you're unsure about something, be honest about it
- Always be helpful and encouraging

Current date: 2026. You are part of Doctor Component, an AI Component Replacer service.`;

/**
 * Handle chat form submission
 */
async function handleChatSubmit(event) {
    event.preventDefault();
    
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Clear input
    input.value = '';
    
    // Add user message to chat
    addMessage(message, 'user');
    
    // Save to recent chats
    saveToRecentChats(message);
    
    // Show typing indicator
    showTypingIndicator();
    
    // Activate AI border effect
    activateAIBorder(true);
    
    try {
        // Get AI response
        const response = await getGeminiResponse(message);
        
        // Hide typing indicator
        hideTypingIndicator();
        
        // Add AI response
        addMessage(response, 'ai');
        
    } catch (error) {
        console.error('AI Error:', error);
        hideTypingIndicator();
        addMessage('I apologize, but I encountered an error. Please try again in a moment.', 'ai');
    } finally {
        // Deactivate AI border effect
        activateAIBorder(false);
    }
}

/**
 * Get response from Gemini API
 */
async function getGeminiResponse(message) {
    // Check if it's a component query for quick local response
    const componentMatch = checkComponentQuery(message);
    if (componentMatch) {
        // Still call Gemini but with component context for better response
        return await callGeminiAPI(message, componentMatch);
    }
    
    return await callGeminiAPI(message);
}

/**
 * Call Gemini API
 */
async function callGeminiAPI(message, componentContext = null) {
    const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
    
    // Build conversation history
    let conversationText = SYSTEM_PROMPT + '\n\n';
    
    // Add component context if available
    if (componentContext) {
        conversationText += `Component Information: ${JSON.stringify(componentContext)}\n\n`;
    }
    
    // Add recent chat history for context
    chatHistory.slice(-5).forEach(entry => {
        conversationText += `${entry.role === 'user' ? 'User' : 'Dr. Chip'}: ${entry.message}\n`;
    });
    
    conversationText += `User: ${message}\nDr. Chip:`;
    
    const requestBody = {
        contents: [{
            parts: [{
                text: conversationText
            }]
        }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
            topP: 0.9,
            topK: 40
        },
        safetySettings: [
            {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
        ]
    };
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const aiResponse = data.candidates[0].content.parts[0].text.trim();
        
        // Save to chat history
        chatHistory.push({ role: 'user', message });
        chatHistory.push({ role: 'ai', message: aiResponse });
        
        // Keep only last 20 messages
        if (chatHistory.length > 20) {
            chatHistory = chatHistory.slice(-20);
        }
        
        return aiResponse;
    }
    
    throw new Error('Invalid response format');
}

/**
 * Check if message is about a specific component
 */
function checkComponentQuery(message) {
    const lowerMessage = message.toLowerCase();
    
    for (const [key, data] of Object.entries(componentDatabase)) {
        if (lowerMessage.includes(key.toLowerCase())) {
            return data;
        }
    }
    
    return null;
}

/**
 * Add message to chat UI
 */
function addMessage(text, sender) {
    const container = document.getElementById('messages-container');
    
    // Remove welcome message if present
    const welcomeMsg = container.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const timestamp = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    if (sender === 'ai') {
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <img src="images/ai-mascot.png" alt="Dr. Chip">
            </div>
            <div class="message-content">
                <div class="message-text">${formatMessageText(text)}</div>
                <span class="message-time">${timestamp}</span>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">${escapeHtml(text)}</div>
                <span class="message-time">${timestamp}</span>
            </div>
        `;
    }
    
    container.appendChild(messageDiv);
    scrollToBottom();
}

/**
 * Format message text with basic markdown
 */
function formatMessageText(text) {
    // Escape HTML
    let formatted = escapeHtml(text);
    
    // Bold text
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic text
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Code blocks
    formatted = formatted.replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>');
    
    // Inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    // Bullet points
    formatted = formatted.replace(/^- (.*)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    return formatted;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Show typing indicator
 */
function showTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    indicator.style.display = 'flex';
    scrollToBottom();
}

/**
 * Hide typing indicator
 */
function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    indicator.style.display = 'none';
}

/**
 * Scroll to bottom of chat
 */
function scrollToBottom() {
    const container = document.getElementById('messages-container');
    container.scrollTop = container.scrollHeight;
}

/**
 * Activate/deactivate AI border effect
 */
function activateAIBorder(active) {
    const border = document.getElementById('ai-border-effect');
    if (border) {
        if (active) {
            border.classList.add('active');
        } else {
            border.classList.remove('active');
        }
    }
}

/**
 * Save to recent chats
 */
function saveToRecentChats(message) {
    let recentChats = JSON.parse(localStorage.getItem('recentChats') || '[]');
    
    // Remove if already exists
    recentChats = recentChats.filter(chat => chat !== message);
    
    // Add to beginning
    recentChats.unshift(message);
    
    // Keep only last 10
    recentChats = recentChats.slice(0, 10);
    
    localStorage.setItem('recentChats', JSON.stringify(recentChats));
    
    // Update UI if function exists
    if (typeof loadRecentChats === 'function') {
        loadRecentChats();
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const container = document.querySelector('.toast-container');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Export for global use
window.handleChatSubmit = handleChatSubmit;
window.sendQuickMessage = sendQuickMessage;
window.clearChat = clearChat;
window.showToast = showToast;
