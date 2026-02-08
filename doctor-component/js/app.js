// Main Application Module for Doctor Component
// Handles component search, display, and interactions

class ComponentApp {
    constructor() {
        this.components = [];
        this.filteredComponents = [];
        this.savedComponents = [];
        this.searchHistory = [];
        this.currentComponent = null;
        
        // Sample component database
        this.sampleDatabase = [
            {
                id: '2n2222',
                name: '2N2222',
                description: 'NPN Bipolar Junction Transistor',
                manufacturer: 'Various',
                category: 'Transistor',
                subcategory: 'BJT',
                package: 'TO-92',
                specs: {
                    'Vceo': '40V',
                    'Ic': '800mA',
                    'hFE': '100-300',
                    'Power': '500mW',
                    'Frequency': '250MHz'
                },
                status: 'active',
                alternatives: ['2N3904', 'PN2222', 'BC547', 'MPSA13'],
                datasheet: 'https://example.com/2n2222.pdf',
                image: null,
                aiScore: 95,
                aiAnalysis: 'Excellent general-purpose NPN transistor. Widely available and well-documented. Good for switching and amplification applications up to 800mA.'
            },
            {
                id: 'lm358',
                name: 'LM358',
                description: 'Dual Operational Amplifier',
                manufacturer: 'Texas Instruments',
                category: 'Op-Amp',
                subcategory: 'General Purpose',
                package: 'DIP-8, SOIC-8',
                specs: {
                    'Supply Voltage': '3V-32V',
                    'Input Offset': '2mV',
                    'Gain Bandwidth': '1MHz',
                    'Slew Rate': '0.3V/μs',
                    'Channels': '2'
                },
                status: 'active',
                alternatives: ['LM324', 'TL072', 'MCP6002', 'LMV358'],
                datasheet: 'https://example.com/lm358.pdf',
                image: null,
                aiScore: 92,
                aiAnalysis: 'Industry standard dual op-amp. Wide supply range and low power consumption make it versatile for battery-powered applications.'
            },
            {
                id: '7805',
                name: 'LM7805',
                description: '5V Linear Voltage Regulator',
                manufacturer: 'Various',
                category: 'Voltage Regulator',
                subcategory: 'Linear',
                package: 'TO-220',
                specs: {
                    'Output Voltage': '5V',
                    'Input Voltage': '7V-35V',
                    'Output Current': '1A',
                    'Dropout': '2V',
                    'Tolerance': '±4%'
                },
                status: 'active',
                alternatives: ['AMS1117-5.0', 'LM2940-5.0', 'LM2596', '78M05'],
                datasheet: 'https://example.com/7805.pdf',
                image: null,
                aiScore: 88,
                aiAnalysis: 'Classic linear regulator. Simple to use but consider switching regulators for better efficiency in new designs.'
            },
            {
                id: 'ne555',
                name: 'NE555',
                description: 'Precision Timer IC',
                manufacturer: 'Various',
                category: 'Timer',
                subcategory: 'Precision',
                package: 'DIP-8, SOIC-8',
                specs: {
                    'Supply Voltage': '4.5V-16V',
                    'Timing': 'μs to hours',
                    'Output Current': '200mA',
                    'Accuracy': '1%',
                    'Temperature': '0°C to 70°C'
                },
                status: 'active',
                alternatives: ['LM555', 'TLC555', 'NA555', 'LMC555'],
                datasheet: 'https://example.com/ne555.pdf',
                image: null,
                aiScore: 94,
                aiAnalysis: 'The most popular timer IC ever made. Extremely versatile for oscillators, timers, and pulse generation applications.'
            },
            {
                id: '1n4007',
                name: '1N4007',
                description: '1000V 1A Rectifier Diode',
                manufacturer: 'Various',
                category: 'Diode',
                subcategory: 'Rectifier',
                package: 'DO-41',
                specs: {
                    'Peak Reverse Voltage': '1000V',
                    'Forward Current': '1A',
                    'Forward Voltage': '1.1V',
                    'Reverse Recovery': '30μs',
                    'Operating Temp': '-65°C to 175°C'
                },
                status: 'active',
                alternatives: ['1N5408', 'UF4007', 'M7', '1N4001-1N4006'],
                datasheet: 'https://example.com/1n4007.pdf',
                image: null,
                aiScore: 96,
                aiAnalysis: 'Standard rectifier diode for power supplies. High voltage rating provides good safety margin. For high frequency, consider UF4007 fast recovery version.'
            },
            {
                id: 'atmega328p',
                name: 'ATmega328P',
                description: '8-bit AVR Microcontroller',
                manufacturer: 'Microchip',
                category: 'Microcontroller',
                subcategory: '8-bit',
                package: 'DIP-28, TQFP-32',
                specs: {
                    'Flash Memory': '32KB',
                    'SRAM': '2KB',
                    'EEPROM': '1KB',
                    'Clock Speed': '20MHz',
                    'Operating Voltage': '1.8V-5.5V'
                },
                status: 'active',
                alternatives: ['ATmega168P', 'ATmega88P', 'ATtiny85', 'Arduino Nano'],
                datasheet: 'https://example.com/atmega328p.pdf',
                image: null,
                aiScore: 93,
                aiAnalysis: 'Popular microcontroller used in Arduino Uno. Good balance of features, power, and ease of use. Consider newer ARM-based MCUs for more demanding applications.'
            },
            {
                id: 'bc547',
                name: 'BC547',
                description: 'NPN General Purpose Transistor',
                manufacturer: 'Various',
                category: 'Transistor',
                subcategory: 'BJT',
                package: 'TO-92',
                specs: {
                    'Vceo': '45V',
                    'Ic': '100mA',
                    'hFE': '110-800',
                    'Power': '500mW',
                    'Frequency': '300MHz'
                },
                status: 'active',
                alternatives: ['BC548', 'BC549', '2N3904', '2N2222'],
                datasheet: 'https://example.com/bc547.pdf',
                image: null,
                aiScore: 91,
                aiAnalysis: 'European standard NPN transistor. Good for low-power switching and amplification. Higher gain variants available (BC547B, BC547C).'
            },
            {
                id: 'lm317',
                name: 'LM317',
                description: 'Adjustable Voltage Regulator',
                manufacturer: 'Texas Instruments',
                category: 'Voltage Regulator',
                subcategory: 'Adjustable',
                package: 'TO-220',
                specs: {
                    'Output Range': '1.25V-37V',
                    'Input Voltage': '4.25V-40V',
                    'Output Current': '1.5A',
                    'Line Regulation': '0.01%/V',
                    'Load Regulation': '0.1%'
                },
                status: 'active',
                alternatives: ['LM317T', 'LM350', 'LM338', 'LM1084'],
                datasheet: 'https://example.com/lm317.pdf',
                image: null,
                aiScore: 90,
                aiAnalysis: 'Versatile adjustable regulator. Only 2 resistors needed to set output voltage. Include input and output capacitors for stability.'
            },
            {
                id: 'irfz44n',
                name: 'IRFZ44N',
                description: 'N-Channel Power MOSFET',
                manufacturer: 'Infineon',
                category: 'MOSFET',
                subcategory: 'Power',
                package: 'TO-220',
                specs: {
                    'Vds': '55V',
                    'Id': '49A',
                    'Rds(on)': '17.5mΩ',
                    'Qg': '63nC',
                    'Power': '94W'
                },
                status: 'active',
                alternatives: ['IRF540N', 'IRF3205', 'STP55NF06', 'FQP30N06'],
                datasheet: 'https://example.com/irfz44n.pdf',
                image: null,
                aiScore: 89,
                aiAnalysis: 'Popular power MOSFET for switching applications. Low Rds(on) minimizes conduction losses. Gate driver recommended for fast switching.'
            },
            {
                id: 'pcf8574',
                name: 'PCF8574',
                description: 'I2C I/O Expander',
                manufacturer: 'NXP',
                category: 'Interface',
                subcategory: 'I/O Expander',
                package: 'DIP-16, SOIC-16',
                specs: {
                    'I2C Speed': '100kHz',
                    'I/O Pins': '8',
                    'Voltage': '2.5V-6V',
                    'Address': '8 selectable',
                    'Output Current': '25mA per pin'
                },
                status: 'active',
                alternatives: ['PCF8574A', 'MCP23008', 'MCP23017', 'TCA9555'],
                datasheet: 'https://example.com/pcf8574.pdf',
                image: null,
                aiScore: 87,
                aiAnalysis: 'Simple I2C I/O expander. Quasi-bidirectional pins can be used as input or output. Useful when you need more GPIO pins.'
            }
        ];

        this.init();
    }

    init() {
        this.components = [...this.sampleDatabase];
        this.filteredComponents = [...this.components];
        this.loadSavedComponents();
        this.loadSearchHistory();
        this.cacheElements();
        this.bindEvents();
        this.renderComponents();
        this.updateStats();
    }

    cacheElements() {
        this.searchInput = document.getElementById('componentSearch');
        this.searchBtn = document.getElementById('searchBtn');
        this.categoryFilter = document.getElementById('categoryFilter');
        this.statusFilter = document.getElementById('statusFilter');
        this.sortSelect = document.getElementById('sortSelect');
        this.resultsGrid = document.getElementById('resultsGrid');
        this.resultsCount = document.getElementById('resultsCount');
        this.clearFiltersBtn = document.getElementById('clearFilters');
        this.datasheetUpload = document.getElementById('datasheetUpload');
        this.uploadArea = document.getElementById('uploadArea');
        this.aiPanel = document.getElementById('aiPanel');
        this.aiToggle = document.getElementById('aiToggle');
    }

    bindEvents() {
        // Search
        this.searchBtn?.addEventListener('click', () => this.performSearch());
        this.searchInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });

        // Filters
        this.categoryFilter?.addEventListener('change', () => this.applyFilters());
        this.statusFilter?.addEventListener('change', () => this.applyFilters());
        this.sortSelect?.addEventListener('change', () => this.applyFilters());
        this.clearFiltersBtn?.addEventListener('click', () => this.clearFilters());

        // Datasheet upload
        this.uploadArea?.addEventListener('click', () => this.datasheetUpload?.click());
        this.uploadArea?.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });
        this.uploadArea?.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('dragover');
        });
        this.uploadArea?.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length) this.handleDatasheetUpload(files[0]);
        });
        this.datasheetUpload?.addEventListener('change', (e) => {
            if (e.target.files.length) this.handleDatasheetUpload(e.target.files[0]);
        });

        // AI panel toggle
        this.aiToggle?.addEventListener('click', () => this.toggleAIPanel());
    }

    performSearch() {
        const query = this.searchInput?.value.trim().toLowerCase();
        if (!query) {
            this.filteredComponents = [...this.components];
        } else {
            this.filteredComponents = this.components.filter(comp =>
                comp.name.toLowerCase().includes(query) ||
                comp.description.toLowerCase().includes(query) ||
                comp.manufacturer.toLowerCase().includes(query) ||
                comp.category.toLowerCase().includes(query) ||
                comp.alternatives.some(alt => alt.toLowerCase().includes(query))
            );

            // Add to search history
            this.addToSearchHistory(query);
        }

        this.applyFilters();
    }

    applyFilters() {
        let results = [...this.filteredComponents];

        // Category filter
        const category = this.categoryFilter?.value;
        if (category) {
            results = results.filter(comp => comp.category === category);
        }

        // Status filter
        const status = this.statusFilter?.value;
        if (status) {
            results = results.filter(comp => comp.status === status);
        }

        // Sort
        const sortBy = this.sortSelect?.value;
        switch (sortBy) {
            case 'name':
                results.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'score':
                results.sort((a, b) => b.aiScore - a.aiScore);
                break;
            case 'category':
                results.sort((a, b) => a.category.localeCompare(b.category));
                break;
            default:
                results.sort((a, b) => a.name.localeCompare(b.name));
        }

        this.filteredComponents = results;
        this.renderComponents();
    }

    clearFilters() {
        if (this.searchInput) this.searchInput.value = '';
        if (this.categoryFilter) this.categoryFilter.value = '';
        if (this.statusFilter) this.statusFilter.value = '';
        if (this.sortSelect) this.sortSelect.value = 'name';
        
        this.filteredComponents = [...this.components];
        this.renderComponents();
    }

    renderComponents() {
        if (!this.resultsGrid) return;

        const count = this.filteredComponents.length;
        if (this.resultsCount) {
            this.resultsCount.textContent = `${count} component${count !== 1 ? 's' : ''} found`;
        }

        if (count === 0) {
            this.resultsGrid.innerHTML = `
                <div class="no-results">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <h3>No components found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            `;
            return;
        }

        this.resultsGrid.innerHTML = this.filteredComponents.map(comp => this.createComponentCard(comp)).join('');

        // Bind card events
        this.resultsGrid.querySelectorAll('.component-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.card-actions')) {
                    this.showComponentDetail(card.dataset.componentId);
                }
            });
        });

        // Save buttons
        this.resultsGrid.querySelectorAll('.save-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleSaveComponent(btn.dataset.componentId);
            });
        });

        // Datasheet buttons
        this.resultsGrid.querySelectorAll('.datasheet-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.open(btn.dataset.url, '_blank');
            });
        });
    }

    createComponentCard(comp) {
        const isSaved = this.savedComponents.includes(comp.id);
        
        return `
            <div class="component-card" data-component-id="${comp.id}">
                <div class="card-header">
                    <div class="card-status status-${comp.status}">${comp.status}</div>
                    <div class="card-score" title="AI Confidence Score">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        ${comp.aiScore}%
                    </div>
                </div>
                
                <div class="card-body">
                    <h3 class="component-name">${comp.name}</h3>
                    <p class="component-desc">${comp.description}</p>
                    
                    <div class="component-meta">
                        <span class="meta-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                            </svg>
                            ${comp.category}
                        </span>
                        <span class="meta-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                                <path d="M2 17l10 5 10-5"></path>
                                <path d="M2 12l10 5 10-5"></path>
                            </svg>
                            ${comp.package}
                        </span>
                    </div>
                    
                    <div class="component-specs">
                        ${Object.entries(comp.specs).slice(0, 3).map(([key, value]) => `
                            <div class="spec-item">
                                <span class="spec-label">${key}</span>
                                <span class="spec-value">${value}</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    ${comp.alternatives.length ? `
                        <div class="component-alternatives">
                            <span class="alt-label">Alternatives:</span>
                            ${comp.alternatives.slice(0, 3).map(alt => `<span class="alt-chip">${alt}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
                
                <div class="card-footer">
                    <div class="card-actions">
                        <button class="action-btn save-btn ${isSaved ? 'saved' : ''}" data-component-id="${comp.id}" title="${isSaved ? 'Remove from saved' : 'Save component'}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </button>
                        <button class="action-btn datasheet-btn" data-url="${comp.datasheet}" title="View datasheet">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                        </button>
                    </div>
                    <button class="btn btn-sm btn-primary view-details">View Details</button>
                </div>
            </div>
        `;
    }

    showComponentDetail(componentId) {
        const comp = this.components.find(c => c.id === componentId);
        if (!comp) return;

        this.currentComponent = comp;

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal component-modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                
                <div class="component-detail">
                    <div class="detail-header">
                        <div class="detail-title">
                            <h2>${comp.name}</h2>
                            <span class="detail-category">${comp.category}</span>
                        </div>
                        <div class="detail-score">
                            <span class="score-value">${comp.aiScore}%</span>
                            <span class="score-label">AI Score</span>
                        </div>
                    </div>
                    
                    <p class="detail-description">${comp.description}</p>
                    
                    <div class="detail-section">
                        <h4>Specifications</h4>
                        <div class="specs-grid">
                            ${Object.entries(comp.specs).map(([key, value]) => `
                                <div class="spec-card">
                                    <span class="spec-name">${key}</span>
                                    <span class="spec-val">${value}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>AI Analysis</h4>
                        <div class="ai-analysis-box">
                            <img src="images/ai-mascot.png" alt="Dr. Chip" class="ai-avatar">
                            <p>${comp.aiAnalysis}</p>
                        </div>
                    </div>
                    
                    ${comp.alternatives.length ? `
                        <div class="detail-section">
                            <h4>Alternative Components</h4>
                            <div class="alternatives-list">
                                ${comp.alternatives.map(alt => `
                                    <div class="alt-item">
                                        <span class="alt-name">${alt}</span>
                                        <button class="btn btn-sm btn-secondary compare-btn" data-alt="${alt}">Compare</button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="detail-actions">
                        <a href="${comp.datasheet}" target="_blank" class="btn btn-secondary">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            View Datasheet
                        </a>
                        <button class="btn btn-primary ask-ai-btn" data-component="${comp.name}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                            Ask Dr. Chip
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Bind close
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
            document.body.style.overflow = '';
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                document.body.style.overflow = '';
            }
        });

        // Bind ask AI button
        modal.querySelector('.ask-ai-btn')?.addEventListener('click', () => {
            window.location.href = `ai-chat.html?query=${encodeURIComponent(`Tell me about ${comp.name}`)}`;
        });

        // Bind compare buttons
        modal.querySelectorAll('.compare-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const alt = btn.dataset.alt;
                window.location.href = `ai-chat.html?query=${encodeURIComponent(`Compare ${comp.name} vs ${alt}`)}`;
            });
        });
    }

    async handleDatasheetUpload(file) {
        if (!file.type.includes('pdf')) {
            auth.showNotification('Please upload a PDF file', 'error');
            return;
        }

        // Show uploading state
        this.uploadArea.classList.add('uploading');

        try {
            // Simulate upload and analysis
            await new Promise(resolve => setTimeout(resolve, 2000));

            // In a real app, you would:
            // 1. Upload to Firebase Storage
            // 2. Process with a PDF parsing service
            // 3. Extract component information
            // 4. Search for matches

            auth.showNotification('Datasheet uploaded! AI analysis coming soon.', 'success');
            
            // Open AI chat with the component
            window.location.href = `ai-chat.html?query=${encodeURIComponent(`I uploaded a datasheet for ${file.name.replace('.pdf', '')}. Can you help me find replacements?`)}`;

        } catch (error) {
            console.error('Upload error:', error);
            auth.showNotification('Upload failed. Please try again.', 'error');
        } finally {
            this.uploadArea.classList.remove('uploading');
        }
    }

    toggleSaveComponent(componentId) {
        const index = this.savedComponents.indexOf(componentId);
        
        if (index > -1) {
            this.savedComponents.splice(index, 1);
            auth.showNotification('Component removed from saved', 'info');
        } else {
            this.savedComponents.push(componentId);
            auth.showNotification('Component saved!', 'success');
        }

        this.saveSavedComponents();
        this.renderComponents();
    }

    toggleAIPanel() {
        this.aiPanel?.classList.toggle('active');
    }

    loadSavedComponents() {
        const saved = localStorage.getItem('savedComponents');
        if (saved) {
            this.savedComponents = JSON.parse(saved);
        }
    }

    saveSavedComponents() {
        localStorage.setItem('savedComponents', JSON.stringify(this.savedComponents));
    }

    loadSearchHistory() {
        const history = localStorage.getItem('searchHistory');
        if (history) {
            this.searchHistory = JSON.parse(history);
        }
    }

    addToSearchHistory(query) {
        // Remove if exists
        this.searchHistory = this.searchHistory.filter(q => q !== query);
        // Add to beginning
        this.searchHistory.unshift(query);
        // Keep last 10
        this.searchHistory = this.searchHistory.slice(0, 10);
        // Save
        localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
    }

    updateStats() {
        const totalComponents = this.components.length;
        const activeComponents = this.components.filter(c => c.status === 'active').length;
        const savedCount = this.savedComponents.length;

        document.getElementById('totalComponents') && (document.getElementById('totalComponents').textContent = totalComponents);
        document.getElementById('activeComponents') && (document.getElementById('activeComponents').textContent = activeComponents);
        document.getElementById('savedComponents') && (document.getElementById('savedComponents').textContent = savedCount);
    }
}

// Initialize app
const app = new ComponentApp();
