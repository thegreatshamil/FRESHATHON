/**
 * Authentication Module
 * Doctor Component
 * 
 * Handles user authentication, registration, profile management,
 * and guest mode functionality.
 */

// Global auth state
let currentUser = null;
let userData = null;
let isGuest = false;

// Initialize auth when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
});

/**
 * Initialize authentication
 */
function initAuth() {
    // Check for guest mode
    const authMode = localStorage.getItem('authMode');
    if (authMode === 'guest') {
        isGuest = true;
        updateUIForGuest();
    }
    
    // Listen for auth state changes
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            isGuest = false;
            localStorage.removeItem('authMode');
            fetchUserData(user.uid);
        } else {
            currentUser = null;
            userData = null;
            if (!isGuest) {
                updateUIForLoggedOut();
            }
        }
    });
    
    // Setup form listeners
    setupAuthForms();
    setupLogoutButton();
}

/**
 * Fetch user data from Firestore
 */
async function fetchUserData(uid) {
    try {
        const doc = await firebase.firestore().collection('users').doc(uid).get();
        if (doc.exists) {
            userData = doc.data();
            updateUIForLoggedIn();
        } else {
            // Create user document if it doesn't exist
            await createUserDocument(currentUser);
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        showToast('Error loading user data', 'error');
    }
}

/**
 * Create user document in Firestore
 */
async function createUserDocument(user, additionalData = {}) {
    const userDataDoc = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        firstName: additionalData.firstName || '',
        lastName: additionalData.lastName || '',
        userType: additionalData.userType || 'prefer-not-say',
        company: additionalData.company || '',
        bio: '',
        phone: '',
        expertise: '',
        website: '',
        linkedin: '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        postsCount: 0,
        commentsCount: 0,
        savedComponents: [],
        notificationSettings: {
            emailReplies: true,
            newEOLAlerts: true,
            newsletter: false
        }
    };
    
    try {
        await firebase.firestore().collection('users').doc(user.uid).set(userDataDoc);
        userData = userDataDoc;
        return userDataDoc;
    } catch (error) {
        console.error('Error creating user document:', error);
        throw error;
    }
}

/**
 * Setup authentication forms
 */
function setupAuthForms() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Forgot password form
    const forgotForm = document.getElementById('forgot-form');
    if (forgotForm) {
        forgotForm.addEventListener('submit', handleForgotPassword);
    }
}

/**
 * Handle login
 */
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me')?.checked;
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
    submitBtn.disabled = true;
    
    try {
        // Set persistence
        const persistence = rememberMe 
            ? firebase.auth.Auth.Persistence.LOCAL 
            : firebase.auth.Auth.Persistence.SESSION;
        
        await firebase.auth().setPersistence(persistence);
        const result = await firebase.auth().signInWithEmailAndPassword(email, password);
        
        // Update last login
        await firebase.firestore().collection('users').doc(result.user.uid).update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showToast('Welcome back!', 'success');
        
        // Redirect to home page after short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        showToast(getAuthErrorMessage(error.code), 'error');
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

/**
 * Handle registration
 */
async function handleRegister(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('reg-firstname').value;
    const lastName = document.getElementById('reg-lastname').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const userType = document.getElementById('reg-user-type').value;
    const company = document.getElementById('reg-company').value;
    
    // Validation
    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }
    
    if (!userType) {
        showToast('Please select your designation', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    submitBtn.disabled = true;
    
    try {
        // Create user
        const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
        
        // Update profile
        await result.user.updateProfile({
            displayName: `${firstName} ${lastName}`
        });
        
        // Create user document
        await createUserDocument(result.user, {
            firstName,
            lastName,
            userType,
            company
        });
        
        // Send email verification
        await result.user.sendEmailVerification();
        
        showToast('Account created successfully! Welcome to Doctor Component!', 'success');
        
        // Redirect to home page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        console.error('Registration error:', error);
        showToast(getAuthErrorMessage(error.code), 'error');
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

/**
 * Handle forgot password
 */
async function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('forgot-email').value;
    
    try {
        await firebase.auth().sendPasswordResetEmail(email);
        showToast('Password reset email sent! Check your inbox.', 'success');
        closeForgotPassword();
    } catch (error) {
        console.error('Password reset error:', error);
        showToast(getAuthErrorMessage(error.code), 'error');
    }
}

/**
 * Sign in with Google
 */
async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    try {
        const result = await firebase.auth().signInWithPopup(provider);
        
        // Check if new user
        if (result.additionalUserInfo.isNewUser) {
            const names = result.user.displayName?.split(' ') || ['', ''];
            await createUserDocument(result.user, {
                firstName: names[0],
                lastName: names.slice(1).join(' '),
                userType: 'prefer-not-say'
            });
        } else {
            // Update last login
            await firebase.firestore().collection('users').doc(result.user.uid).update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        showToast('Welcome to Doctor Component!', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    } catch (error) {
        console.error('Google sign-in error:', error);
        showToast(getAuthErrorMessage(error.code), 'error');
    }
}

/**
 * Sign in with GitHub
 */
async function signInWithGithub() {
    const provider = new firebase.auth.GithubAuthProvider();
    
    try {
        const result = await firebase.auth().signInWithPopup(provider);
        
        // Check if new user
        if (result.additionalUserInfo.isNewUser) {
            const names = result.user.displayName?.split(' ') || ['', ''];
            await createUserDocument(result.user, {
                firstName: names[0],
                lastName: names.slice(1).join(' '),
                userType: 'prefer-not-say'
            });
        } else {
            // Update last login
            await firebase.firestore().collection('users').doc(result.user.uid).update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        showToast('Welcome to Doctor Component!', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    } catch (error) {
        console.error('GitHub sign-in error:', error);
        showToast(getAuthErrorMessage(error.code), 'error');
    }
}

/**
 * Setup logout button
 */
function setupLogoutButton() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

/**
 * Handle logout
 */
async function handleLogout(e) {
    if (e) e.preventDefault();
    
    try {
        await firebase.auth().signOut();
        localStorage.removeItem('authMode');
        showToast('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Error logging out', 'error');
    }
}

/**
 * Update UI for logged in user
 */
function updateUIForLoggedIn() {
    const authLinks = document.getElementById('auth-links');
    const userMenu = document.getElementById('user-menu');
    const navUsername = document.getElementById('nav-username');
    const navProfilePic = document.getElementById('nav-profile-pic');
    
    if (authLinks) authLinks.classList.add('hidden');
    if (userMenu) userMenu.classList.remove('hidden');
    
    if (navUsername && userData) {
        navUsername.textContent = userData.firstName || userData.displayName || 'User';
    }
    
    if (navProfilePic) {
        navProfilePic.src = userData?.photoURL || 'images/default-avatar.png';
    }
    
    // Update create post section visibility
    const createPostSection = document.getElementById('create-post-section');
    const guestNotice = document.getElementById('guest-notice');
    if (createPostSection) createPostSection.style.display = 'block';
    if (guestNotice) guestNotice.style.display = 'none';
}

/**
 * Update UI for guest mode
 */
function updateUIForGuest() {
    const authLinks = document.getElementById('auth-links');
    const userMenu = document.getElementById('user-menu');
    
    if (authLinks) authLinks.classList.remove('hidden');
    if (userMenu) userMenu.classList.add('hidden');
    
    // Update create post section visibility
    const createPostSection = document.getElementById('create-post-section');
    const guestNotice = document.getElementById('guest-notice');
    if (createPostSection) createPostSection.style.display = 'none';
    if (guestNotice) guestNotice.style.display = 'block';
}

/**
 * Update UI for logged out user
 */
function updateUIForLoggedOut() {
    const authLinks = document.getElementById('auth-links');
    const userMenu = document.getElementById('user-menu');
    
    if (authLinks) authLinks.classList.remove('hidden');
    if (userMenu) userMenu.classList.add('hidden');
    
    // Update create post section visibility
    const createPostSection = document.getElementById('create-post-section');
    const guestNotice = document.getElementById('guest-notice');
    if (createPostSection) createPostSection.style.display = 'none';
    if (guestNotice) guestNotice.style.display = 'block';
}

/**
 * Get authentication error message
 */
function getAuthErrorMessage(code) {
    const messages = {
        'auth/invalid-email': 'Invalid email address',
        'auth/user-disabled': 'This account has been disabled',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/email-already-in-use': 'An account already exists with this email',
        'auth/weak-password': 'Password is too weak (min 6 characters)',
        'auth/invalid-credential': 'Invalid email or password',
        'auth/popup-closed-by-user': 'Sign-in popup was closed',
        'auth/cancelled-popup-request': 'Sign-in was cancelled',
        'auth/account-exists-with-different-credential': 'An account already exists with the same email',
        'auth/requires-recent-login': 'Please log in again to complete this action',
        'auth/too-many-requests': 'Too many attempts. Please try again later.'
    };
    
    return messages[code] || 'An error occurred. Please try again.';
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i> ${message}`;
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    return currentUser !== null || isGuest;
}

/**
 * Get current user ID
 */
function getCurrentUserId() {
    return currentUser?.uid || null;
}

/**
 * Get current user data
 */
function getCurrentUserData() {
    return userData;
}

/**
 * Check if user is in guest mode
 */
function isGuestMode() {
    return isGuest;
}

// Export functions for use in other scripts
window.auth = {
    isAuthenticated,
    getCurrentUserId,
    getCurrentUserData,
    isGuestMode,
    showToast,
    signInWithGoogle,
    signInWithGithub,
    handleLogout
};

// Also export individual functions
window.showToast = showToast;
window.signInWithGoogle = signInWithGoogle;
window.signInWithGithub = signInWithGithub;
