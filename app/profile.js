/**
 * Profile Module
 * Doctor Component
 * 
 * Handles user profile management, settings, and activity display.
 */

// Current user data
let profileUserData = null;
let currentSection = 'overview';

// Initialize profile when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initProfile();
});

/**
 * Initialize profile page
 */
function initProfile() {
    checkAuth();
    setupProfileTabs();
    setupForms();
    setupAvatarUpload();
    loadUserData();
    loadUserActivity();
    loadSavedComponents();
}

/**
 * Check authentication
 */
function checkAuth() {
    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            // Redirect to login if not authenticated
            window.location.href = 'login.html';
        }
    });
}

/**
 * Load user data
 */
async function loadUserData() {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    try {
        const doc = await firebase.firestore().collection('users').doc(user.uid).get();
        if (doc.exists) {
            profileUserData = doc.data();
            populateProfileFields();
            updateProfileHeader();
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        showToast('Error loading profile data', 'error');
    }
}

/**
 * Populate profile fields
 */
function populateProfileFields() {
    if (!profileUserData) return;
    
    // Profile information
    document.getElementById('profile-firstname').value = profileUserData.firstName || '';
    document.getElementById('profile-lastname').value = profileUserData.lastName || '';
    document.getElementById('profile-display-email').value = profileUserData.email || '';
    document.getElementById('profile-phone').value = profileUserData.phone || '';
    document.getElementById('profile-company').value = profileUserData.company || '';
    document.getElementById('profile-bio').value = profileUserData.bio || '';
    
    // Professional information
    document.getElementById('profile-user-type').value = profileUserData.userType || 'prefer-not-say';
    document.getElementById('profile-expertise').value = profileUserData.expertise || '';
    document.getElementById('profile-website').value = profileUserData.website || '';
    document.getElementById('profile-linkedin').value = profileUserData.linkedin || '';
    
    // Update stats
    document.getElementById('stat-posts').textContent = profileUserData.postsCount || 0;
    document.getElementById('stat-comments').textContent = profileUserData.commentsCount || 0;
    document.getElementById('stat-saved').textContent = profileUserData.savedComponents?.length || 0;
}

/**
 * Update profile header
 */
function updateProfileHeader() {
    if (!profileUserData) return;
    
    const displayName = `${profileUserData.firstName || ''} ${profileUserData.lastName || ''}`.trim() || 
                       profileUserData.displayName || 
                       'User';
    
    document.getElementById('profile-name').textContent = displayName;
    document.getElementById('profile-email').textContent = profileUserData.email || '';
    document.getElementById('profile-avatar').src = profileUserData.photoURL || 'images/default-avatar.png';
    
    // Update user type badge
    const userTypeBadge = document.getElementById('user-type-badge');
    userTypeBadge.textContent = USER_TYPE_LABELS[profileUserData.userType] || 'User';
}

/**
 * Setup profile tabs
 */
function setupProfileTabs() {
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.profile-section');
    
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionName = item.dataset.section;
            
            // Update active menu item
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Show corresponding section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${sectionName}-section`) {
                    section.classList.add('active');
                }
            });
            
            currentSection = sectionName;
        });
    });
    
    // Activity tabs
    const activityTabs = document.querySelectorAll('.activity-tab');
    const activityContents = document.querySelectorAll('.activity-content');
    
    activityTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const activityType = tab.dataset.activity;
            
            activityTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            activityContents.forEach(content => {
                content.classList.add('hidden');
                if (content.id === `activity-${activityType}`) {
                    content.classList.remove('hidden');
                }
            });
        });
    });
}

/**
 * Setup forms
 */
function setupForms() {
    // Profile form
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    // Professional form
    const professionalForm = document.getElementById('professional-form');
    if (professionalForm) {
        professionalForm.addEventListener('submit', handleProfessionalUpdate);
    }
    
    // Password form
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
    }
}

/**
 * Handle profile update
 */
async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    const updates = {
        firstName: document.getElementById('profile-firstname').value,
        lastName: document.getElementById('profile-lastname').value,
        phone: document.getElementById('profile-phone').value,
        company: document.getElementById('profile-company').value,
        bio: document.getElementById('profile-bio').value,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        await firebase.firestore().collection('users').doc(user.uid).update(updates);
        
        // Update display name
        const displayName = `${updates.firstName} ${updates.lastName}`.trim();
        if (displayName) {
            await user.updateProfile({ displayName });
        }
        
        showToast('Profile updated successfully!', 'success');
        loadUserData();
        
    } catch (error) {
        console.error('Error updating profile:', error);
        showToast('Error updating profile', 'error');
    }
}

/**
 * Handle professional update
 */
async function handleProfessionalUpdate(e) {
    e.preventDefault();
    
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    const updates = {
        userType: document.getElementById('profile-user-type').value,
        expertise: document.getElementById('profile-expertise').value,
        website: document.getElementById('profile-website').value,
        linkedin: document.getElementById('profile-linkedin').value,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        await firebase.firestore().collection('users').doc(user.uid).update(updates);
        showToast('Professional information updated!', 'success');
        loadUserData();
        
    } catch (error) {
        console.error('Error updating professional info:', error);
        showToast('Error updating professional information', 'error');
    }
}

/**
 * Handle password change
 */
async function handlePasswordChange(e) {
    e.preventDefault();
    
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-new-password').value;
    
    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }
    
    try {
        // Re-authenticate user
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email,
            currentPassword
        );
        await user.reauthenticateWithCredential(credential);
        
        // Update password
        await user.updatePassword(newPassword);
        
        showToast('Password updated successfully!', 'success');
        document.getElementById('password-form').reset();
        
    } catch (error) {
        console.error('Error changing password:', error);
        if (error.code === 'auth/wrong-password') {
            showToast('Current password is incorrect', 'error');
        } else {
            showToast('Error changing password', 'error');
        }
    }
}

/**
 * Setup avatar upload
 */
function setupAvatarUpload() {
    const avatarInput = document.getElementById('avatar-upload');
    if (!avatarInput) return;
    
    avatarInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validate file
        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file', 'error');
            return;
        }
        
        if (file.size > 2 * 1024 * 1024) {
            showToast('Image size must be less than 2MB', 'error');
            return;
        }
        
        const user = firebase.auth().currentUser;
        if (!user) return;
        
        try {
            // Show loading state
            showToast('Uploading image...', 'info');
            
            // Upload to Firebase Storage
            const storageRef = firebase.storage().ref();
            const avatarRef = storageRef.child(`avatars/${user.uid}/${Date.now()}_${file.name}`);
            
            await avatarRef.put(file);
            const downloadURL = await avatarRef.getDownloadURL();
            
            // Update user profile
            await user.updateProfile({ photoURL: downloadURL });
            
            // Update Firestore
            await firebase.firestore().collection('users').doc(user.uid).update({
                photoURL: downloadURL,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Update UI
            document.getElementById('profile-avatar').src = downloadURL;
            document.getElementById('nav-profile-pic').src = downloadURL;
            
            showToast('Profile picture updated!', 'success');
            
        } catch (error) {
            console.error('Error uploading avatar:', error);
            showToast('Error uploading profile picture', 'error');
        }
    });
}

/**
 * Load user activity
 */
async function loadUserActivity() {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    try {
        // Load user's posts
        const postsSnapshot = await firebase.firestore()
            .collection('posts')
            .where('author.uid', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();
        
        const postsList = document.getElementById('my-posts-list');
        if (postsSnapshot.empty) {
            postsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-pen"></i>
                    <p>You haven't created any posts yet.</p>
                </div>
            `;
        } else {
            postsList.innerHTML = postsSnapshot.docs.map(doc => {
                const post = doc.data();
                return `
                    <div class="activity-item">
                        <h4>${post.title}</h4>
                        <p>${post.content.substring(0, 100)}...</p>
                        <time>${formatDate(post.createdAt)}</time>
                    </div>
                `;
            }).join('');
        }
        
        // Load user's comments
        const commentsSnapshot = await firebase.firestore()
            .collection('comments')
            .where('author.uid', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();
        
        const commentsList = document.getElementById('my-comments-list');
        if (commentsSnapshot.empty) {
            commentsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comment"></i>
                    <p>You haven't made any comments yet.</p>
                </div>
            `;
        } else {
            commentsList.innerHTML = commentsSnapshot.docs.map(doc => {
                const comment = doc.data();
                return `
                    <div class="activity-item">
                        <p>${comment.content}</p>
                        <time>${formatDate(comment.createdAt)}</time>
                    </div>
                `;
            }).join('');
        }
        
    } catch (error) {
        console.error('Error loading user activity:', error);
    }
}

/**
 * Load saved components
 */
async function loadSavedComponents() {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    try {
        const doc = await firebase.firestore().collection('users').doc(user.uid).get();
        const savedComponents = doc.data()?.savedComponents || [];
        
        const container = document.getElementById('saved-components');
        
        if (savedComponents.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fas fa-bookmark"></i>
                    <p>No saved components yet.</p>
                    <a href="index.html" class="btn-primary" style="margin-top: 1rem;">
                        <i class="fas fa-search"></i> Find Components
                    </a>
                </div>
            `;
            return;
        }
        
        container.innerHTML = savedComponents.map(comp => `
            <div class="saved-component-card">
                <h4>${comp.name}</h4>
                <p>Saved on ${formatDate(comp.savedAt)}</p>
                <div style="margin-top: 0.75rem;">
                    <button class="btn-primary" style="width: 100%;" onclick="searchComponent('${comp.name}')">
                        <i class="fas fa-search"></i> View
                    </button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading saved components:', error);
    }
}

/**
 * Confirm delete account
 */
function confirmDeleteAccount() {
    document.getElementById('delete-modal').classList.add('active');
}

/**
 * Close delete modal
 */
function closeDeleteModal() {
    document.getElementById('delete-modal').classList.remove('active');
}

/**
 * Delete account
 */
document.getElementById('confirm-delete-btn')?.addEventListener('click', async () => {
    const confirmInput = document.getElementById('delete-confirm');
    
    if (confirmInput.value !== 'DELETE') {
        showToast('Please type DELETE to confirm', 'error');
        return;
    }
    
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    try {
        // Delete user data from Firestore
        await firebase.firestore().collection('users').doc(user.uid).delete();
        
        // Delete user's posts
        const postsSnapshot = await firebase.firestore()
            .collection('posts')
            .where('author.uid', '==', user.uid)
            .get();
        
        const batch = firebase.firestore().batch();
        postsSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        
        // Delete user's comments
        const commentsSnapshot = await firebase.firestore()
            .collection('comments')
            .where('author.uid', '==', user.uid)
            .get();
        
        const commentsBatch = firebase.firestore().batch();
        commentsSnapshot.docs.forEach(doc => {
            commentsBatch.delete(doc.ref);
        });
        await commentsBatch.commit();
        
        // Delete user account
        await user.delete();
        
        showToast('Account deleted successfully', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        console.error('Error deleting account:', error);
        showToast('Error deleting account. You may need to re-login.', 'error');
    }
});

/**
 * Format date
 */
function formatDate(timestamp) {
    if (!timestamp) return 'Unknown';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
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

// Export functions for global access
window.confirmDeleteAccount = confirmDeleteAccount;
window.closeDeleteModal = closeDeleteModal;
window.searchComponent = (name) => {
    window.location.href = `index.html?search=${name}`;
};
