/**
 * Main Application Module
 * Doctor Component
 */

// Component database
const componentDatabase = {
    '2N2222': {
        name: '2N2222',
        type: 'NPN Transistor',
        manufacturer: 'Various',
        package: 'TO-92',
        eolDate: '2023-06-15',
        specs: { 'Vceo': '40V', 'Ic': '800mA', 'hFE': '100-300' },
        replacements: [
            { name: 'PN2222A', manufacturer: 'ON Semi', match: 98, specs: { 'Vceo': '40V', 'Ic': '1A' } },
            { name: 'BC547', manufacturer: 'Various', match: 85, specs: { 'Vceo': '45V', 'Ic': '100mA' } },
            { name: '2N3904', manufacturer: 'Various', match: 82, specs: { 'Vceo': '40V', 'Ic': '200mA' } }
        ]
    },
    'LM358': {
        name: 'LM358',
        type: 'Dual Op-Amp',
        manufacturer: 'Texas Instruments',
        package: 'DIP-8',
        eolDate: '2024-03-01',
        specs: { 'Supply': '3-32V', 'GBW': '1MHz', 'Slew': '0.3V/µs' },
        replacements: [
            { name: 'LM358B', manufacturer: 'TI', match: 99, specs: { 'Supply': '3-36V', 'GBW': '1.2MHz' } },
            { name: 'RC4558', manufacturer: 'TI', match: 88, specs: { 'Supply': '±4-±18V', 'GBW': '3MHz' } },
            { name: 'NE5532', manufacturer: 'TI', match: 85, specs: { 'Supply': '±3-±20V', 'GBW': '10MHz' } }
        ]
    },
    'NE555': {
        name: 'NE555',
        type: 'Timer IC',
        manufacturer: 'Various',
        package: 'DIP-8',
        eolDate: '2025-12-31',
        specs: { 'Supply': '4.5-16V', 'Output': '200mA' },
        replacements: [
            { name: 'TLC555', manufacturer: 'TI', match: 95, specs: { 'Supply': '2-18V', 'Output': '10mA' } },
            { name: 'LMC555', manufacturer: 'TI', match: 94, specs: { 'Supply': '1.5-15V', 'Output': '10mA' } },
            { name: 'NA555', manufacturer: 'TI', match: 98, specs: { 'Supply': '4.5-16V', 'Output': '200mA' } }
        ]
    },
    '7805': {
        name: '7805',
        type: 'Linear Regulator',
        manufacturer: 'Various',
        package: 'TO-220',
        eolDate: '2024-08-15',
        specs: { 'Output': '5V', 'Current': '1A' },
        replacements: [
            { name: 'LM7805', manufacturer: 'TI', match: 99, specs: { 'Output': '5V', 'Current': '1.5A' } },
            { name: 'AMS1117-5.0', manufacturer: 'AMS', match: 85, specs: { 'Output': '5V', 'Current': '1A' } },
            { name: 'LM2940CT-5.0', manufacturer: 'TI', match: 88, specs: { 'Output': '5V', 'Current': '1A' } }
        ]
    },
    'BC547': {
        name: 'BC547',
        type: 'NPN Transistor',
        manufacturer: 'Various',
        package: 'TO-92',
        eolDate: '2024-01-20',
        specs: { 'Vceo': '45V', 'Ic': '100mA' },
        replacements: [
            { name: 'BC547B', manufacturer: 'ON Semi', match: 99, specs: { 'Vceo': '45V', 'Ic': '100mA' } },
            { name: '2N3904', manufacturer: 'Various', match: 80, specs: { 'Vceo': '40V', 'Ic': '200mA' } }
        ]
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initSearch();
    checkAuthState();
});

/**
 * Initialize search functionality
 */
function initSearch() {
    const searchInput = document.getElementById('component-search');
    const suggestions = document.getElementById('search-suggestions');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const value = e.target.value.toUpperCase();
        
        if (value.length < 2) {
            suggestions.style.display = 'none';
            return;
        }
        
        const matches = Object.keys(componentDatabase).filter(key => key.includes(value));
        
        if (matches.length > 0) {
            suggestions.innerHTML = matches.map(match => `
                <div class="suggestion-item" onclick="quickSearch('${match}')">
                    <strong>${match}</strong> - ${componentDatabase[match].type}
                </div>
            `).join('');
            suggestions.style.display = 'block';
        } else {
            suggestions.style.display = 'none';
        }
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box')) {
            suggestions.style.display = 'none';
        }
    });
}

/**
 * Quick search from tags
 */
function quickSearch(component) {
    const searchInput = document.getElementById('component-search');
    if (searchInput) {
        searchInput.value = component;
        performSearch();
    }
}

/**
 * Perform search
 */
function performSearch() {
    const searchInput = document.getElementById('component-search');
    const query = searchInput.value.toUpperCase().trim();
    
    if (!query) return;
    
    const component = componentDatabase[query];
    const resultsSection = document.getElementById('results-section');
    
    if (component) {
        displayResults(component);
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        showToast('Component not found. Try: 2N2222, LM358, NE555, 7805, BC547', 'error');
    }
}

/**
 * Display search results
 */
function displayResults(component) {
    document.getElementById('result-name').textContent = component.name;
    document.getElementById('result-type').textContent = component.type;
    document.getElementById('result-package').textContent = component.package;
    document.getElementById('result-manufacturer').textContent = component.manufacturer;
    document.getElementById('result-eol').textContent = formatDate(component.eolDate);
    
    const container = document.getElementById('replacements-container');
    container.innerHTML = component.replacements.map(rep => `
        <div class="replacement-card">
            <div class="replacement-header">
                <h4>${rep.name}</h4>
                <span class="match-score">${rep.match}% Match</span>
            </div>
            <div class="spec-row">
                <span class="spec-label">Manufacturer</span>
                <span class="spec-value">${rep.manufacturer}</span>
            </div>
            ${Object.entries(rep.specs).map(([key, val]) => `
                <div class="spec-row">
                    <span class="spec-label">${key}</span>
                    <span class="spec-value">${val}</span>
                </div>
            `).join('')}
            <div class="card-footer">
                <button class="btn-outline" onclick="saveComponent('${rep.name}')">
                    <i class="fas fa-bookmark"></i>
                    <span>Save</span>
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Save component
 */
async function saveComponent(name) {
    const user = firebase.auth().currentUser;
    
    if (!user) {
        showToast('Please sign in to save components', 'error');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }
    
    try {
        await firebase.firestore().collection('users').doc(user.uid).update({
            savedComponents: firebase.firestore.FieldValue.arrayUnion({
                name: name,
                savedAt: new Date()
            })
        });
        showToast('Component saved!', 'success');
    } catch (error) {
        showToast('Error saving component', 'error');
    }
}

/**
 * View datasheet
 */
function viewDatasheet() {
    const name = document.getElementById('result-name').textContent;
    window.open(`https://www.google.com/search?q=${name}+datasheet+pdf`, '_blank');
}

/**
 * Format date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Check auth state
 */
function checkAuthState() {
    firebase.auth().onAuthStateChanged(user => {
        const signinLink = document.getElementById('signin-link');
        const profileLink = document.getElementById('profile-link');
        const userMenu = document.getElementById('user-menu');
        const navAvatar = document.getElementById('nav-avatar');
        
        if (user) {
            if (signinLink) signinLink.style.display = 'none';
            if (profileLink) profileLink.style.display = 'inline-flex';
            if (userMenu) userMenu.style.display = 'block';
            if (navAvatar) {
                navAvatar.src = user.photoURL || 'images/default-avatar.png';
            }
        } else {
            if (signinLink) signinLink.style.display = 'inline-flex';
            if (profileLink) profileLink.style.display = 'none';
            if (userMenu) userMenu.style.display = 'none';
        }
    });
}

/**
 * Toggle navigation
 */
function toggleNav() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

/**
 * Logout
 */
function logout() {
    firebase.auth().signOut().then(() => {
        showToast('Signed out successfully', 'success');
        setTimeout(() => window.location.href = 'index.html', 1000);
    });
}

/**
 * Show toast
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
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Export
window.quickSearch = quickSearch;
window.performSearch = performSearch;
window.saveComponent = saveComponent;
window.viewDatasheet = viewDatasheet;
window.toggleNav = toggleNav;
window.logout = logout;
window.showToast = showToast;
