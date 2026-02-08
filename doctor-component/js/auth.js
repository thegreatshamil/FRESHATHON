// Firebase Authentication Module for Doctor Component
// Handles login, register, social auth, and user state

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.userData = null;
        this.authModal = null;
        this.init();
    }

    init() {
        // Listen for auth state changes
        firebase.auth().onAuthStateChanged(async (user) => {
            this.currentUser = user;
            if (user) {
                await this.loadUserData(user.uid);
                this.updateUIForLoggedInUser();
            } else {
                this.userData = null;
                this.updateUIForLoggedOutUser();
            }
        });

        // Initialize modal if on a page with auth
        this.initAuthModal();
    }

    // Load user data from Firestore
    async loadUserData(uid) {
        try {
            const doc = await firebase.firestore().collection('users').doc(uid).get();
            if (doc.exists) {
                this.userData = doc.data();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    // Update UI for logged in user
    updateUIForLoggedInUser() {
        const authButtons = document.querySelectorAll('.auth-btn');
        const userMenus = document.querySelectorAll('.user-menu');

        authButtons.forEach(btn => btn.style.display = 'none');
        userMenus.forEach(menu => {
            menu.style.display = 'flex';
            const avatar = menu.querySelector('.user-avatar');
            const name = menu.querySelector('.user-name');
            if (avatar && this.currentUser.photoURL) {
                avatar.src = this.currentUser.photoURL;
            }
            if (name && this.userData) {
                name.textContent = this.userData.displayName || this.currentUser.email;
            }
        });
    }

    // Update UI for logged out user
    updateUIForLoggedOutUser() {
        const authButtons = document.querySelectorAll('.auth-btn');
        const userMenus = document.querySelectorAll('.user-menu');

        authButtons.forEach(btn => btn.style.display = 'flex');
        userMenus.forEach(menu => menu.style.display = 'none');
    }

    // Initialize auth modal
    initAuthModal() {
        const modal = document.getElementById('authModal');
        if (!modal) return;

        this.authModal = modal;
        const closeBtn = modal.querySelector('.modal-close');
        const tabBtns = modal.querySelectorAll('.tab-btn');
        const socialBtns = modal.querySelectorAll('.social-btn');
        const guestBtn = modal.querySelector('.guest-btn');

        // Close modal
        closeBtn?.addEventListener('click', () => this.closeAuthModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeAuthModal();
        });

        // Tab switching
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Social login
        socialBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const provider = btn.dataset.provider;
                if (provider === 'google') this.signInWithGoogle();
                if (provider === 'github') this.signInWithGithub();
            });
        });

        // Guest mode
        guestBtn?.addEventListener('click', () => this.continueAsGuest());

        // Form submissions
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        loginForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(e.target);
        });

        registerForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister(e.target);
        });
    }

    // Open auth modal
    openAuthModal(tab = 'login') {
        if (!this.authModal) {
            window.location.href = 'login.html';
            return;
        }
        this.authModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.switchTab(tab);
    }

    // Close auth modal
    closeAuthModal() {
        if (!this.authModal) return;
        this.authModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Switch between login and register tabs
    switchTab(tab) {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabPanels = document.querySelectorAll('.tab-panel');

        tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        tabPanels.forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tab}Panel`);
        });
    }

    // Handle login form submission
    async handleLogin(form) {
        const email = form.querySelector('#loginEmail').value;
        const password = form.querySelector('#loginPassword').value;
        const submitBtn = form.querySelector('button[type="submit"]');
        const errorDiv = form.querySelector('.form-error');

        this.setLoading(submitBtn, true);
        errorDiv?.classList.remove('show');

        try {
            await firebase.auth().signInWithEmailAndPassword(email, password);
            this.closeAuthModal();
            form.reset();
            this.showNotification('Welcome back!', 'success');
        } catch (error) {
            errorDiv.textContent = this.getErrorMessage(error);
            errorDiv?.classList.add('show');
        } finally {
            this.setLoading(submitBtn, false);
        }
    }

    // Handle register form submission
    async handleRegister(form) {
        const firstName = form.querySelector('#registerFirstName').value;
        const lastName = form.querySelector('#registerLastName').value;
        const email = form.querySelector('#registerEmail').value;
        const password = form.querySelector('#registerPassword').value;
        const userType = form.querySelector('#registerUserType').value;
        const submitBtn = form.querySelector('button[type="submit"]');
        const errorDiv = form.querySelector('.form-error');

        this.setLoading(submitBtn, true);
        errorDiv?.classList.remove('show');

        try {
            const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
            
            // Create user document in Firestore
            await firebase.firestore().collection('users').doc(result.user.uid).set({
                uid: result.user.uid,
                email: email,
                firstName: firstName,
                lastName: lastName,
                displayName: `${firstName} ${lastName}`,
                userType: userType,
                photoURL: null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                postsCount: 0,
                commentsCount: 0,
                savedComponents: [],
                recentSearches: []
            });

            this.closeAuthModal();
            form.reset();
            this.showNotification('Account created successfully!', 'success');
        } catch (error) {
            errorDiv.textContent = this.getErrorMessage(error);
            errorDiv?.classList.add('show');
        } finally {
            this.setLoading(submitBtn, false);
        }
    }

    // Sign in with Google
    async signInWithGoogle() {
        const provider = new firebase.auth.GoogleAuthProvider();
        
        try {
            const result = await firebase.auth().signInWithPopup(provider);
            
            if (result.additionalUserInfo.isNewUser) {
                const names = result.user.displayName?.split(' ') || ['', ''];
                await firebase.firestore().collection('users').doc(result.user.uid).set({
                    uid: result.user.uid,
                    email: result.user.email,
                    firstName: names[0],
                    lastName: names.slice(1).join(' '),
                    displayName: result.user.displayName,
                    userType: 'prefer-not-say',
                    photoURL: result.user.photoURL,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    postsCount: 0,
                    commentsCount: 0,
                    savedComponents: [],
                    recentSearches: []
                });
            }

            this.closeAuthModal();
            this.showNotification('Signed in with Google!', 'success');
        } catch (error) {
            console.error('Google sign in error:', error);
            this.showNotification(this.getErrorMessage(error), 'error');
        }
    }

    // Sign in with GitHub
    async signInWithGithub() {
        const provider = new firebase.auth.GithubAuthProvider();
        
        try {
            const result = await firebase.auth().signInWithPopup(provider);
            
            if (result.additionalUserInfo.isNewUser) {
                const name = result.additionalUserInfo.username || result.user.displayName || 'GitHub User';
                await firebase.firestore().collection('users').doc(result.user.uid).set({
                    uid: result.user.uid,
                    email: result.user.email,
                    firstName: name,
                    lastName: '',
                    displayName: name,
                    userType: 'prefer-not-say',
                    photoURL: result.user.photoURL,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    postsCount: 0,
                    commentsCount: 0,
                    savedComponents: [],
                    recentSearches: []
                });
            }

            this.closeAuthModal();
            this.showNotification('Signed in with GitHub!', 'success');
        } catch (error) {
            console.error('GitHub sign in error:', error);
            this.showNotification(this.getErrorMessage(error), 'error');
        }
    }

    // Continue as guest
    continueAsGuest() {
        // Set guest mode in session
        sessionStorage.setItem('guestMode', 'true');
        sessionStorage.setItem('guestUser', JSON.stringify({
            displayName: 'Guest User',
            userType: 'guest',
            isGuest: true
        }));
        
        this.closeAuthModal();
        this.showNotification('Continuing as guest', 'info');
        
        // Redirect to home if on login page
        if (window.location.pathname.includes('login.html')) {
            window.location.href = 'index.html';
        }
    }

    // Check if user is in guest mode
    isGuest() {
        return sessionStorage.getItem('guestMode') === 'true';
    }

    // Get current user (including guest)
    getCurrentUser() {
        if (this.currentUser) return this.currentUser;
        if (this.isGuest()) return JSON.parse(sessionStorage.getItem('guestUser'));
        return null;
    }

    // Logout
    async logout() {
        try {
            // Clear guest mode if active
            sessionStorage.removeItem('guestMode');
            sessionStorage.removeItem('guestUser');
            
            await firebase.auth().signOut();
            this.showNotification('Logged out successfully', 'info');
            
            // Redirect to home if on protected page
            if (window.location.pathname.includes('profile.html')) {
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('Logout error:', error);
            this.showNotification('Error logging out', 'error');
        }
    }

    // Reset password
    async resetPassword(email) {
        try {
            await firebase.auth().sendPasswordResetEmail(email);
            this.showNotification('Password reset email sent!', 'success');
            return true;
        } catch (error) {
            this.showNotification(this.getErrorMessage(error), 'error');
            return false;
        }
    }

    // Update user profile
    async updateProfile(data) {
        if (!this.currentUser) return false;

        try {
            await firebase.firestore().collection('users').doc(this.currentUser.uid).update({
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Reload user data
            await this.loadUserData(this.currentUser.uid);
            this.showNotification('Profile updated!', 'success');
            return true;
        } catch (error) {
            console.error('Update profile error:', error);
            this.showNotification('Error updating profile', 'error');
            return false;
        }
    }

    // Upload profile picture
    async uploadProfilePicture(file) {
        if (!this.currentUser) return null;

        try {
            const storageRef = firebase.storage().ref();
            const fileRef = storageRef.child(`profile-pictures/${this.currentUser.uid}/${Date.now()}_${file.name}`);
            
            await fileRef.put(file);
            const photoURL = await fileRef.getDownloadURL();
            
            // Update auth profile
            await this.currentUser.updateProfile({ photoURL });
            
            // Update Firestore
            await firebase.firestore().collection('users').doc(this.currentUser.uid).update({
                photoURL: photoURL,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Reload user data
            await this.loadUserData(this.currentUser.uid);
            this.showNotification('Profile picture updated!', 'success');
            
            return photoURL;
        } catch (error) {
            console.error('Upload error:', error);
            this.showNotification('Error uploading photo', 'error');
            return null;
        }
    }

    // Set loading state on button
    setLoading(button, loading) {
        if (!button) return;
        button.disabled = loading;
        button.classList.toggle('loading', loading);
        const text = button.querySelector('.btn-text');
        if (text) {
            text.dataset.original = text.dataset.original || text.textContent;
            text.textContent = loading ? 'Please wait...' : text.dataset.original;
        }
    }

    // Get user-friendly error message
    getErrorMessage(error) {
        const messages = {
            'auth/user-not-found': 'No account found with this email',
            'auth/wrong-password': 'Incorrect password',
            'auth/invalid-email': 'Invalid email address',
            'auth/email-already-in-use': 'An account already exists with this email',
            'auth/weak-password': 'Password should be at least 6 characters',
            'auth/popup-closed-by-user': 'Sign in was cancelled',
            'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method'
        };
        return messages[error.code] || error.message || 'An error occurred';
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Auto dismiss
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);

        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
    }

    // Require auth for protected actions
    requireAuth(callback) {
        if (this.currentUser || this.isGuest()) {
            callback();
        } else {
            this.openAuthModal('login');
        }
    }
}

// Initialize auth manager
const auth = new AuthManager();

// Expose to global scope for HTML event handlers
window.auth = auth;
