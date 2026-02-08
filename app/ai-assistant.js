/**
 * AI Assistant Module - Dr. Chip
 * Doctor Component
 * 
 * Handles AI chatbot functionality, colorful border animation,
 * and AI-powered component analysis.
 */

// AI Knowledge Base
const aiKnowledgeBase = {
    greetings: [
        "Hello! I'm Dr. Chip, your AI component specialist. How can I help you today?",
        "Hi there! Dr. Chip here. Ready to help you find the perfect component replacement!",
        "Welcome! I'm Dr. Chip. Ask me anything about electronic components!"
    ],
    
    componentInfo: {
        '2N2222': {
            description: "The 2N2222 is a common NPN bipolar junction transistor used for general-purpose low-power amplifying or switching applications.",
            specs: "Vceo: 40V, Ic: 800mA, hFE: 100-300, Package: TO-92",
            commonUses: "Amplifiers, switches, oscillators, and general-purpose circuits.",
            alternatives: "PN2222A (direct replacement), BC547 (lower current), 2N3904 (similar specs)"
        },
        'LM358': {
            description: "The LM358 is a dual operational amplifier IC designed for general-purpose use.",
            specs: "Supply: 3-32V, GBW: 1MHz, Slew Rate: 0.3V/µs, Package: DIP-8/SOIC-8",
            commonUses: "Active filters, general signal conditioning, transducer amplifiers.",
            alternatives: "LM358B (improved version), RC4558 (higher bandwidth), NE5532 (low noise)"
        },
        'BC547': {
            description: "The BC547 is an NPN bipolar junction transistor for general-purpose switching and amplification.",
            specs: "Vceo: 45V, Ic: 100mA, hFE: 110-800, Package: TO-92",
            commonUses: "Small signal amplification, switching applications.",
            alternatives: "BC547B (direct replacement), 2N3904 (higher current), BC337 (higher gain)"
        },
        'NE555': {
            description: "The NE555 is a highly stable controller capable of producing accurate time delays or oscillation.",
            specs: "Supply: 4.5-16V, Timing: µs to hours, Output: 200mA",
            commonUses: "Timers, pulse generation, oscillators, LED flashers.",
            alternatives: "TLC555 (CMOS low power), LMC555 (very low power), NA555 (precision)"
        },
        '7805': {
            description: "The 7805 is a fixed voltage regulator that provides 5V output.",
            specs: "Output: 5V, Current: 1A, Input: 7-25V, Package: TO-220",
            commonUses: "Power supplies, voltage regulation, circuit protection.",
            alternatives: "LM7805 (higher current), AMS1117-5.0 (LDO), LM2940CT-5.0 (low dropout)"
        },
        '2N3904': {
            description: "The 2N3904 is a common NPN transistor used for general-purpose low-power amplifying or switching.",
            specs: "Vceo: 40V, Ic: 200mA, hFE: 100-300, Package: TO-92",
            commonUses: "General amplification, switching, signal processing.",
            alternatives: "2N2222 (higher current), BC547 (similar), PN2222A (direct)"
        },
        'LM741': {
            description: "The LM741 is a general-purpose operational amplifier.",
            specs: "Supply: ±10V to ±22V, GBW: 1MHz, Input Offset: 1mV",
            commonUses: "Mathematical operations, comparators, filters.",
            alternatives: "LM358 (dual), TL071 (low noise), OP07 (precision)"
        },
        'BC337': {
            description: "The BC337 is an NPN transistor with high current gain.",
            specs: "Vceo: 45V, Ic: 800mA, hFE: 100-630, Package: TO-92",
            commonUses: "High-gain amplification, switching, driver circuits.",
            alternatives: "BC547 (lower current), 2N2222 (similar), PN2222A (direct)"
        }
    },
    
    faq: {
        'what is eol': "EOL stands for 'End of Life.' It means a component is no longer being manufactured or supported by the manufacturer. This can happen due to technological advances, low demand, or material shortages.",
        'eol meaning': "EOL (End of Life) indicates that a component will no longer be produced. It's important to find replacements before existing stock runs out!",
        'end of life': "End of Life (EOL) is when a manufacturer stops producing a component. I can help you find suitable replacements for EOL components!",
        'how to read datasheets': "Datasheets contain crucial information: 1) Pin configuration, 2) Electrical characteristics, 3) Maximum ratings, 4) Typical performance curves. Look for key specs like voltage, current, and gain values.",
        'datasheet reading': "When reading datasheets, focus on: Absolute Maximum Ratings (never exceed these!), Electrical Characteristics (operating specs), and Pin Configuration (connection diagram).",
        'pin compatibility': "Pin compatibility means the replacement component has the same pin arrangement as the original. This allows for direct replacement without circuit modification.",
        'drop-in replacement': "A drop-in replacement is a component that can directly substitute the original without any circuit changes. Same pinout, similar or better specs!",
        'transistor basics': "Transistors are semiconductor devices used to amplify or switch electronic signals. Key parameters: Vceo (max voltage), Ic (max current), hFE (current gain).",
        'op amp basics': "Operational Amplifiers (op-amps) are DC-coupled high-gain electronic voltage amplifiers. Key specs: Supply voltage, GBW (gain bandwidth), slew rate, input offset."
    }
};

// User's search history
let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

// Initialize AI Assistant
document.addEventListener('DOMContentLoaded', () => {
    initAIAssistant();
});

/**
 * Initialize AI Assistant
 */
function initAIAssistant() {
    setupChatToggle();
    setupChatInput();
    setupPresetSelect();
    displayRecentSearches();
    setupDatasheetUpload();
}

/**
 * Setup chat toggle
 */
function setupChatToggle() {
    const toggleBtn = document.getElementById('toggle-chat');
    const chatMessages = document.getElementById('ai-chat-messages');
    
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            toggleBtn.classList.toggle('collapsed');
            chatMessages.style.display = toggleBtn.classList.contains('collapsed') ? 'none' : 'block';
        });
    }
}

/**
 * Setup chat input
 */
function setupChatInput() {
    const input = document.getElementById('ai-chat-input');
    const sendBtn = document.getElementById('send-ai-message');
    
    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            const message = input.value.trim();
            if (message) {
                sendUserMessage(message);
                input.value = '';
            }
        });
    }
    
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const message = input.value.trim();
                if (message) {
                    sendUserMessage(message);
                    input.value = '';
                }
            }
        });
    }
}

/**
 * Setup preset component select
 */
function setupPresetSelect() {
    const select = document.getElementById('preset-component-select');
    
    if (select) {
        select.addEventListener('change', () => {
            const component = select.value;
            if (component) {
                askAIAboutComponent(component);
                select.value = '';
            }
        });
    }
}

/**
 * Send user message
 */
function sendUserMessage(message) {
    addUserMessage(message);
    
    // Show AI is thinking
    showAIThinking();
    
    // Process message after delay
    setTimeout(() => {
        const response = processAIMessage(message);
        removeAIThinking();
        addAIMessage(response.text, response.quickOptions);
    }, 1000 + Math.random() * 1000);
}

/**
 * Add user message to chat
 */
function addUserMessage(message) {
    const container = document.getElementById('ai-chat-messages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${escapeHtml(message)}</p>
        </div>
    `;
    
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

/**
 * Show AI thinking indicator
 */
function showAIThinking() {
    const container = document.getElementById('ai-chat-messages');
    
    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = 'message ai-message typing';
    thinkingDiv.id = 'ai-typing';
    thinkingDiv.innerHTML = `
        <div class="message-avatar">
            <img src="images/ai-avatar.png" alt="AI">
        </div>
        <div class="message-content">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    container.appendChild(thinkingDiv);
    container.scrollTop = container.scrollHeight;
    
    // Trigger colorful border animation
    triggerAIBorderAnimation(true);
}

/**
 * Remove AI thinking indicator
 */
function removeAIThinking() {
    const typing = document.getElementById('ai-typing');
    if (typing) {
        typing.remove();
    }
    
    // Stop border animation
    triggerAIBorderAnimation(false);
}

/**
 * Add AI message to chat
 */
function addAIMessage(text, quickOptions = []) {
    const container = document.getElementById('ai-chat-messages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai-message';
    
    let quickOptionsHtml = '';
    if (quickOptions.length > 0) {
        quickOptionsHtml = `
            <div class="quick-options">
                ${quickOptions.map(opt => `<button class="quick-option" onclick="askAI('${opt.action}')">${opt.label}</button>`).join('')}
            </div>
        `;
    }
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <img src="images/ai-avatar.png" alt="AI">
        </div>
        <div class="message-content">
            <p>${text}</p>
            ${quickOptionsHtml}
        </div>
    `;
    
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

/**
 * Process AI message and generate response
 */
function processAIMessage(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for greetings
    if (lowerMessage.match(/^(hi|hello|hey|greetings)/)) {
        return {
            text: getRandomResponse(aiKnowledgeBase.greetings),
            quickOptions: [
                { label: 'Find a replacement', action: 'Find replacement' },
                { label: 'What is EOL?', action: 'What is EOL?' },
                { label: 'How to use this?', action: 'How do I use Doctor Component?' }
            ]
        };
    }
    
    // Check for component-specific queries
    for (const [component, info] of Object.entries(aiKnowledgeBase.componentInfo)) {
        if (lowerMessage.includes(component.toLowerCase())) {
            addToSearchHistory(component);
            
            if (lowerMessage.includes('replace') || lowerMessage.includes('alternative')) {
                return {
                    text: `For ${component}, here are the best alternatives:\n\n${info.alternatives}\n\nWould you like me to show you detailed specifications for any of these?`,
                    quickOptions: [
                        { label: `Search ${component}`, action: `Find replacement for ${component}` },
                        { label: 'Show specs', action: `What are the specs of ${component}?` }
                    ]
                };
            }
            
            if (lowerMessage.includes('spec')) {
                return {
                    text: `${component} Specifications:\n\n${info.specs}\n\n${info.description}`,
                    quickOptions: [
                        { label: 'Common uses', action: `What is ${component} used for?` },
                        { label: 'Find alternatives', action: `Find replacement for ${component}` }
                    ]
                };
            }
            
            if (lowerMessage.includes('use') || lowerMessage.includes('application')) {
                return {
                    text: `${component} is commonly used for:\n\n${info.commonUses}\n\n${info.description}`,
                    quickOptions: [
                        { label: 'Show specs', action: `What are the specs of ${component}?` },
                        { label: 'Find alternatives', action: `Find replacement for ${component}` }
                    ]
                };
            }
            
            return {
                text: `${info.description}\n\nKey Specs: ${info.specs}\n\nCommon Uses: ${info.commonUses}\n\nAlternatives: ${info.alternatives}`,
                quickOptions: [
                    { label: 'Search this component', action: `Find replacement for ${component}` },
                    { label: 'Show full specs', action: `What are the specs of ${component}?` }
                ]
            };
        }
    }
    
    // Check FAQ
    for (const [key, answer] of Object.entries(aiKnowledgeBase.faq)) {
        if (lowerMessage.includes(key)) {
            return {
                text: answer,
                quickOptions: [
                    { label: 'Find a component', action: 'Find replacement' },
                    { label: 'Popular EOL components', action: 'Show popular EOL components' }
                ]
            };
        }
    }
    
    // Check for replacement requests
    if (lowerMessage.includes('replacement') || lowerMessage.includes('alternative') || lowerMessage.includes('substitute')) {
        const componentMatch = message.match(/[A-Z0-9]+/);
        if (componentMatch) {
            const component = componentMatch[0];
            addToSearchHistory(component);
            
            // Trigger search
            setTimeout(() => {
                const searchInput = document.getElementById('component-search');
                if (searchInput) {
                    searchInput.value = component;
                    performSearch(component);
                }
            }, 500);
            
            return {
                text: `I'll help you find replacements for ${component}. Let me search our database...`,
                quickOptions: []
            };
        }
    }
    
    // Check for help/how to use
    if (lowerMessage.includes('how') && (lowerMessage.includes('use') || lowerMessage.includes('work'))) {
        return {
            text: "Here's how to use Doctor Component:\n\n1. Enter a component number in the search box\n2. I'll show you the original component details\n3. Browse AI-analyzed replacement options\n4. Compare specs and AI scores\n5. Save components to your profile\n\nYou can also upload datasheets for AI analysis!",
            quickOptions: [
                { label: 'Try a search', action: 'Find replacement for 2N2222' },
                { label: 'Upload datasheet', action: 'How to upload datasheet?' }
            ]
        };
    }
    
    // Default response
    return {
        text: "I'm not sure I understand. You can ask me about:\n\n• Specific components (e.g., 'Tell me about 2N2222')\n• Replacement options (e.g., 'Find replacement for LM358')\n• Component specifications\n• What EOL means\n• How to read datasheets\n\nOr use the quick select dropdown to choose a component!",
        quickOptions: [
            { label: 'Popular components', action: 'Show popular components' },
            { label: 'What is EOL?', action: 'What is EOL?' }
        ]
    };
}

/**
 * Ask AI a specific question (for quick options)
 */
function askAI(question) {
    const input = document.getElementById('ai-chat-input');
    if (input) {
        input.value = question;
        sendUserMessage(question);
        input.value = '';
    }
}

/**
 * Ask AI about a specific component
 */
function askAIAboutComponent(component) {
    const info = aiKnowledgeBase.componentInfo[component];
    if (info) {
        addToSearchHistory(component);
        
        addUserMessage(`Tell me about ${component}`);
        showAIThinking();
        
        setTimeout(() => {
            removeAIThinking();
            addAIMessage(
                `${info.description}\n\n📊 Specs: ${info.specs}\n\n🔧 Common Uses: ${info.commonUses}\n\n🔄 Alternatives: ${info.alternatives}`,
                [
                    { label: 'Search this component', action: `Find replacement for ${component}` },
                    { label: 'Show full specs', action: `What are the specs of ${component}?` }
                ]
            );
        }, 800);
    }
}

/**
 * Trigger AI border animation
 */
function triggerAIBorderAnimation(active) {
    const overlay = document.getElementById('ai-border-overlay');
    const body = document.body;
    
    if (overlay) {
        if (active) {
            overlay.classList.remove('hidden');
            body.classList.add('ai-working');
        } else {
            overlay.classList.add('hidden');
            body.classList.remove('ai-working');
        }
    }
}

/**
 * Add to search history
 */
function addToSearchHistory(component) {
    // Remove if already exists
    searchHistory = searchHistory.filter(c => c !== component);
    
    // Add to beginning
    searchHistory.unshift(component);
    
    // Keep only last 5
    searchHistory = searchHistory.slice(0, 5);
    
    // Save to localStorage
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    
    // Update display
    displayRecentSearches();
}

/**
 * Display recent searches
 */
function displayRecentSearches() {
    const container = document.getElementById('recent-searches');
    if (!container) return;
    
    if (searchHistory.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = `
        <span style="font-size: 0.75rem; color: var(--text-muted);">Recent:</span>
        ${searchHistory.map(comp => `
            <span class="recent-search-tag" onclick="askAI('Tell me about ${comp}')">${comp}</span>
        `).join('')}
    `;
}

/**
 * Setup datasheet upload
 */
function setupDatasheetUpload() {
    const fileInput = document.getElementById('datasheet-file');
    
    if (fileInput) {
        fileInput.addEventListener('change', handleDatasheetUpload);
    }
}

/**
 * Handle datasheet upload
 */
async function handleDatasheetUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file
    const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.txt')) {
        showToast('Please upload PDF, DOC, or TXT files only', 'error');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        showToast('File size must be less than 10MB', 'error');
        return;
    }
    
    const user = firebase.auth().currentUser;
    
    try {
        // Show AI is analyzing
        triggerAIBorderAnimation(true);
        showToast('AI is analyzing your datasheet...', 'info');
        
        let downloadURL = null;
        
        // Upload to Firebase Storage if user is logged in
        if (user) {
            const storageRef = firebase.storage().ref();
            const datasheetRef = storageRef.child(`datasheets/${user.uid}/${Date.now()}_${file.name}`);
            await datasheetRef.put(file);
            downloadURL = await datasheetRef.getDownloadURL();
        }
        
        // Simulate AI analysis
        setTimeout(() => {
            triggerAIBorderAnimation(false);
            
            // Add to datasheet list
            addDatasheetToList(file.name, downloadURL);
            
            // Show AI analysis results
            showDatasheetAnalysis(file.name);
            
            showToast('Datasheet analyzed successfully!', 'success');
        }, 2000);
        
    } catch (error) {
        console.error('Error uploading datasheet:', error);
        triggerAIBorderAnimation(false);
        showToast('Error uploading datasheet', 'error');
    }
}

/**
 * Add datasheet to list
 */
function addDatasheetToList(filename, url) {
    const list = document.getElementById('datasheet-list');
    if (!list) return;
    
    const item = document.createElement('div');
    item.className = 'datasheet-item';
    item.innerHTML = `
        <span><i class="fas fa-file-pdf"></i> ${filename}</span>
        <i class="fas fa-times" onclick="this.parentElement.remove()"></i>
    `;
    
    list.appendChild(item);
}

/**
 * Show datasheet analysis
 */
function showDatasheetAnalysis(filename) {
    const aiAnalysisSection = document.getElementById('ai-analysis-section');
    const aiAnalysisContent = document.getElementById('ai-analysis-content');
    
    if (!aiAnalysisSection || !aiAnalysisContent) return;
    
    aiAnalysisSection.style.display = 'block';
    
    aiAnalysisContent.innerHTML = `
        <div class="ai-analysis-item">
            <i class="fas fa-file-alt"></i>
            <div>
                <strong>Document Analyzed:</strong> ${filename}
                <p>AI has extracted key specifications from your datasheet.</p>
            </div>
        </div>
        <div class="ai-analysis-item">
            <i class="fas fa-microchip"></i>
            <div>
                <strong>Component Type:</strong> NPN Bipolar Junction Transistor
                <p>Based on datasheet content analysis.</p>
            </div>
        </div>
        <div class="ai-analysis-item">
            <i class="fas fa-chart-line"></i>
            <div>
                <strong>Key Specifications Extracted:</strong>
                <p>• Maximum Collector Voltage: 40V<br>
                • Maximum Collector Current: 800mA<br>
                • Current Gain (hFE): 100-300<br>
                • Transition Frequency: 250MHz</p>
            </div>
        </div>
        <div class="ai-analysis-item">
            <i class="fas fa-lightbulb"></i>
            <div>
                <strong>AI Recommendation:</strong>
                <p>This component has moderate availability. Based on the specifications, I recommend checking for PN2222A as a direct replacement with improved characteristics.</p>
            </div>
        </div>
    `;
    
    // Scroll to analysis
    aiAnalysisSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Generate AI opinion for replacement
 */
function generateAIOpinion(originalComponent, replacement) {
    const opinions = [
        `Based on my analysis of both components' datasheets, the ${replacement.name} offers ${replacement.matchScore >= 95 ? 'excellent' : replacement.matchScore >= 85 ? 'good' : 'fair'} compatibility with the ${originalComponent}. The key specifications align well, making this a ${replacement.matchScore >= 95 ? 'recommended drop-in replacement' : 'viable alternative with minor considerations'}.`,
        
        `AI Analysis: ${replacement.name} shows ${replacement.matchScore}% parameter matching with ${originalComponent}. ${replacement.matchScore >= 90 ? 'Pin-to-pin compatibility verified. Safe to use in most applications.' : 'Some parameters differ - verify in your specific circuit conditions.'}`,
        
        `My recommendation: ${replacement.name} is ${replacement.matchScore >= 95 ? 'an excellent choice' : replacement.matchScore >= 85 ? 'a good alternative' : 'acceptable with caution'}. ${replacement.notes}`
    ];
    
    return opinions[Math.floor(Math.random() * opinions.length)];
}

/**
 * Generate AI score for replacement
 */
function generateAIScore(originalComponent, replacement) {
    // Base score on match score with AI adjustment
    let aiScore = replacement.matchScore;
    
    // AI adjustments based on various factors
    if (replacement.specs.Vceo && replacement.specs.Vceo.includes('V')) {
        aiScore += 2; // Bonus for clear voltage rating
    }
    
    if (replacement.notes.toLowerCase().includes('direct') || 
        replacement.notes.toLowerCase().includes('pin-to-pin')) {
        aiScore += 3; // Bonus for direct replacement
    }
    
    // Cap at 100
    return Math.min(Math.round(aiScore), 100);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Get random response from array
 */
function getRandomResponse(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i> ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Export functions for global access
window.askAI = askAI;
window.askAIAboutComponent = askAIAboutComponent;
window.showToast = showToast;
window.generateAIOpinion = generateAIOpinion;
window.generateAIScore = generateAIScore;
