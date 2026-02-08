// Profile Module for Doctor Component
// Handles user profile, settings, and activity

class ProfileManager {
    constructor() {
        this.currentTab = 'overview';
        this.userPosts = [];
        this.savedPosts = [];
        this.userActivity = [];
        this.init();
    }

    init() {
        this.checkAuth();
        this.cacheElements();
        this.bindEvents();
        this.loadUserData();
    }

    checkAuth() {
        firebase.auth().onAuthStateChanged((user) => {
            if (!user && !auth.isGuest()) {
                window.location.href = 'login.html';
            }
        });
    }

    cacheElements() {
        this.tabBtns = document.querySelectorAll('.profile-tab-btn');
        this.tabPanels = document.querySelectorAll('.profile-tab-panel');
        this.avatarUpload = document.getElementById('avatarUpload');
        this.profileForm = document.getElementById('profileForm');
        this.passwordForm = document.getElementById('passwordForm');
        this.deleteAccountBtn = document.getElementById('deleteAccountBtn');
        this.logoutBtn = document.getElementById('logoutBtn');
    }

    bindEvents() {
        // Tab switching
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Avatar upload
        this.avatarUpload?.addEventListener('change', (e) => this.handleAvatarUpload(e));

        // Profile form
        this.profileForm?.addEventListener('submit', (e) => this.handleProfileUpdate(e));

        // Password form
        this.passwordForm?.addEventListener('submit', (e) => this.handlePasswordChange(e));

        // Delete account
        this.deleteAccountBtn?.addEventListener('click', () => this.handleDeleteAccount());

        // Logout
        this.logoutBtn?.addEventListener('click', () => auth.logout());

        // Copy user ID
        document.getElementById('copyUserId')?.addEventListener('click', () => {
            const userId = document.getElementById('userIdDisplay')?.textContent;
            if (userId) {
                navigator.clipboard.writeText(userId);
                auth.showNotification('User ID copied!', 'success');
            }
        });
    }

    async loadUserData() {
        const user = auth.getCurrentUser();
        if (!user) return;

        // Update profile header
        this.updateProfileHeader(user);

        // Load stats
        await this.loadStats();

        // Load content based on current tab
        this.loadTabContent(this.currentTab);
    }

    updateProfileHeader(user) {
        const avatar = document.getElementById('profileAvatar');
        const name = document.getElementById('profileName');
        const email = document.getElementById('profileEmail');
        const userType = document.getElementById('profileUserType');
        const joinDate = document.getElementById('joinDate');
        const userIdDisplay = document.getElementById('userIdDisplay');

        if (avatar) avatar.src = user.photoURL || 'images/default-avatar.png';
        if (name) name.textContent = user.displayName || 'User';
        if (email) email.textContent = user.email || '';
        if (userType) userType.textContent = this.formatUserType(user.userType);
        if (joinDate && user.createdAt) {
            joinDate.textContent = new Date(user.createdAt.toDate()).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
            });
        }
        if (userIdDisplay) userIdDisplay.textContent = user.uid;

        // Fill form fields
        const firstNameInput = document.getElementById('editFirstName');
        const lastNameInput = document.getElementById('editLastName');
        const displayNameInput = document.getElementById('editDisplayName');
        const bioInput = document.getElementById('editBio');
        const websiteInput = document.getElementById('editWebsite');
        const locationInput = document.getElementById('editLocation');
        const userTypeSelect = document.getElementById('editUserType');

        if (firstNameInput) firstNameInput.value = user.firstName || '';
        if (lastNameInput) lastNameInput.value = user.lastName || '';
        if (displayNameInput) displayNameInput.value = user.displayName || '';
        if (bioInput) bioInput.value = user.bio || '';
        if (websiteInput) websiteInput.value = user.website || '';
        if (locationInput) locationInput.value = user.location || '';
        if (userTypeSelect) userTypeSelect.value = user.userType || 'prefer-not-say';
    }

    async loadStats() {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
            const data = userDoc.data();

            document.getElementById('statPosts').textContent = data?.postsCount || 0;
            document.getElementById('statComments').textContent = data?.commentsCount || 0;
            document.getElementById('statSaved').textContent = data?.savedPosts?.length || 0;
            
            // Calculate reputation (example formula)
            const reputation = (data?.postsCount || 0) * 10 + (data?.commentsCount || 0) * 5;
            document.getElementById('statReputation').textContent = reputation;

        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    switchTab(tab) {
        this.currentTab = tab;

        // Update buttons
        this.tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // Update panels
        this.tabPanels.forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tab}Panel`);
        });

        // Load content
        this.loadTabContent(tab);
    }

    async loadTabContent(tab) {
        switch (tab) {
            case 'overview':
                await this.loadOverview();
                break;
            case 'activity':
                await this.loadActivity();
                break;
            case 'saved':
                await this.loadSavedPosts();
                break;
            case 'components':
                await this.loadSavedComponents();
                break;
        }
    }

    async loadOverview() {
        const user = auth.currentUser;
        if (!user) return;

        try {
            // Load recent posts
            const postsSnapshot = await firebase.firestore().collection('blogPosts')
                .where('authorId', '==', user.uid)
                .orderBy('createdAt', 'desc')
                .limit(3)
                .get();

            const recentPostsContainer = document.getElementById('recentPosts');
            if (recentPostsContainer) {
                if (postsSnapshot.empty) {
                    recentPostsContainer.innerHTML = `
                        <div class="empty-state">
                            <p>No posts yet</p>
                            <a href="blog.html" class="btn btn-primary">Create Your First Post</a>
                        </div>
                    `;
                } else {
                    recentPostsContainer.innerHTML = postsSnapshot.docs.map(doc => {
                        const post = doc.data();
                        return `
                            <div class="activity-item">
                                <div class="activity-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                    </svg>
                                </div>
                                <div class="activity-content">
                                    <p>Published "${this.escapeHtml(post.title)}"</p>
                                    <span class="activity-time">${this.formatTimeAgo(post.createdAt?.toDate())}</span>
                                </div>
                            </div>
                        `;
                    }).join('');
                }
            }

            // Load recent activity
            const activityContainer = document.getElementById('recentActivity');
            if (activityContainer) {
                // Get recent comments
                const commentsSnapshot = await firebase.firestore().collection('comments')
                    .where('authorId', '==', user.uid)
                    .orderBy('createdAt', 'desc')
                    .limit(3)
                    .get();

                if (commentsSnapshot.empty && postsSnapshot.empty) {
                    activityContainer.innerHTML = '<p class="empty-text">No recent activity</p>';
                } else {
                    const activities = [];
                    
                    commentsSnapshot.forEach(doc => {
                        const comment = doc.data();
                        activities.push({
                            type: 'comment',
                            text: `Commented on "${this.escapeHtml(comment.postTitle)}"`,
                            time: comment.createdAt?.toDate()
                        });
                    });

                    activities.sort((a, b) => b.time - a.time);

                    activityContainer.innerHTML = activities.slice(0, 3).map(activity => `
                        <div class="activity-item">
                            <div class="activity-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                </svg>
                            </div>
                            <div class="activity-content">
                                <p>${activity.text}</p>
                                <span class="activity-time">${this.formatTimeAgo(activity.time)}</span>
                            </div>
                        </div>
                    `).join('');
                }
            }

        } catch (error) {
            console.error('Error loading overview:', error);
        }
    }

    async loadActivity() {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const activityContainer = document.getElementById('allActivity');
            if (!activityContainer) return;

            // Get all user activity
            const [postsSnapshot, commentsSnapshot] = await Promise.all([
                firebase.firestore().collection('blogPosts')
                    .where('authorId', '==', user.uid)
                    .orderBy('createdAt', 'desc')
                    .limit(20)
                    .get(),
                firebase.firestore().collection('comments')
                    .where('authorId', '==', user.uid)
                    .orderBy('createdAt', 'desc')
                    .limit(20)
                    .get()
            ]);

            const activities = [];

            postsSnapshot.forEach(doc => {
                const post = doc.data();
                activities.push({
                    type: 'post',
                    text: `Published "${this.escapeHtml(post.title)}"`,
                    time: post.createdAt?.toDate(),
                    link: `post.html?id=${doc.id}`
                });
            });

            commentsSnapshot.forEach(doc => {
                const comment = doc.data();
                activities.push({
                    type: 'comment',
                    text: `Commented on "${this.escapeHtml(comment.postTitle)}"`,
                    time: comment.createdAt?.toDate()
                });
            });

            activities.sort((a, b) => b.time - a.time);

            if (activities.length === 0) {
                activityContainer.innerHTML = `
                    <div class="empty-state">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <p>No activity yet</p>
                        <span>Your posts and comments will appear here</span>
                    </div>
                `;
            } else {
                activityContainer.innerHTML = activities.map(activity => `
                    <div class="activity-item ${activity.type}">
                        <div class="activity-icon">
                            ${activity.type === 'post' ? `
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                            ` : `
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                </svg>
                            `}
                        </div>
                        <div class="activity-content">
                            <p>${activity.link ? `<a href="${activity.link}">${activity.text}</a>` : activity.text}</p>
                            <span class="activity-time">${this.formatTimeAgo(activity.time)}</span>
                        </div>
                    </div>
                `).join('');
            }

        } catch (error) {
            console.error('Error loading activity:', error);
        }
    }

    async loadSavedPosts() {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const container = document.getElementById('savedPostsList');
            if (!container) return;

            const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
            const savedPostIds = userDoc.data()?.savedPosts || [];

            if (savedPostIds.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <p>No saved posts</p>
                        <span>Bookmark posts to read later</span>
                        <a href="blog.html" class="btn btn-primary">Browse Posts</a>
                    </div>
                `;
                return;
            }

            // Get saved posts
            const posts = [];
            for (const postId of savedPostIds.slice(0, 20)) {
                const postDoc = await firebase.firestore().collection('blogPosts').doc(postId).get();
                if (postDoc.exists) {
                    posts.push({ id: postDoc.id, ...postDoc.data() });
                }
            }

            container.innerHTML = posts.map(post => `
                <div class="saved-post-item">
                    <div class="saved-post-content">
                        <h4><a href="post.html?id=${post.id}">${this.escapeHtml(post.title)}</a></h4>
                        <p>${this.escapeHtml(this.truncateText(post.content, 100))}</p>
                        <div class="saved-post-meta">
                            <span>By ${this.escapeHtml(post.authorName)}</span>
                            <span>${this.formatTimeAgo(post.createdAt?.toDate())}</span>
                        </div>
                    </div>
                    <button class="btn btn-icon remove-saved" data-post-id="${post.id}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            `).join('');

            // Bind remove buttons
            container.querySelectorAll('.remove-saved').forEach(btn => {
                btn.addEventListener('click', () => this.removeSavedPost(btn.dataset.postId));
            });

        } catch (error) {
            console.error('Error loading saved posts:', error);
        }
    }

    async loadSavedComponents() {
        const container = document.getElementById('savedComponentsList');
        if (!container) return;

        // Get saved components from localStorage (or Firestore if logged in)
        const savedComponents = JSON.parse(localStorage.getItem('savedComponents') || '[]');

        if (savedComponents.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                        <rect x="9" y="9" width="6" height="6"></rect>
                        <line x1="9" y1="1" x2="9" y2="4"></line>
                        <line x1="15" y1="1" x2="15" y2="4"></line>
                        <line x1="9" y1="20" x2="9" y2="23"></line>
                        <line x1="15" y1="20" x2="15" y2="23"></line>
                        <line x1="20" y1="9" x2="23" y2="9"></line>
                        <line x1="20" y1="14" x2="23" y2="14"></line>
                        <line x1="1" y1="9" x2="4" y2="9"></line>
                        <line x1="1" y1="14" x2="4" y2="14"></line>
                    </svg>
                    <p>No saved components</p>
                    <span>Save components for quick access</span>
                    <a href="index.html" class="btn btn-primary">Find Components</a>
                </div>
            `;
            return;
        }

        container.innerHTML = savedComponents.map(comp => `
            <div class="saved-component-item">
                <div class="component-info">
                    <h4>${this.escapeHtml(comp.name)}</h4>
                    <p>${this.escapeHtml(comp.manufacturer)} • ${this.escapeHtml(comp.category)}</p>
                </div>
                <div class="component-actions">
                    <a href="?search=${encodeURIComponent(comp.name)}" class="btn btn-sm btn-secondary">View</a>
                    <button class="btn btn-icon remove-component" data-component-id="${comp.id}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');

        // Bind remove buttons
        container.querySelectorAll('.remove-component').forEach(btn => {
            btn.addEventListener('click', () => this.removeSavedComponent(btn.dataset.componentId));
        });
    }

    async handleAvatarUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            auth.showNotification('Please select an image file', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            auth.showNotification('Image must be less than 5MB', 'error');
            return;
        }

        const photoURL = await auth.uploadProfilePicture(file);
        if (photoURL) {
            document.getElementById('profileAvatar').src = photoURL;
        }
    }

    async handleProfileUpdate(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        auth.setLoading(submitBtn, true);

        try {
            const updates = {
                firstName: formData.get('firstName').trim(),
                lastName: formData.get('lastName').trim(),
                displayName: formData.get('displayName').trim(),
                bio: formData.get('bio').trim(),
                website: formData.get('website').trim(),
                location: formData.get('location').trim(),
                userType: formData.get('userType')
            };

            await auth.updateProfile(updates);
            
            // Update display name in Firebase Auth
            if (auth.currentUser && updates.displayName) {
                await auth.currentUser.updateProfile({ displayName: updates.displayName });
            }

            // Reload user data
            await this.loadUserData();

        } catch (error) {
            console.error('Error updating profile:', error);
            auth.showNotification('Failed to update profile', 'error');
        } finally {
            auth.setLoading(submitBtn, false);
        }
    }

    async handlePasswordChange(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const currentPassword = formData.get('currentPassword');
        const newPassword = formData.get('newPassword');
        const confirmPassword = formData.get('confirmPassword');
        const submitBtn = e.target.querySelector('button[type="submit"]');

        if (newPassword !== confirmPassword) {
            auth.showNotification('Passwords do not match', 'error');
            return;
        }

        if (newPassword.length < 6) {
            auth.showNotification('Password must be at least 6 characters', 'error');
            return;
        }

        auth.setLoading(submitBtn, true);

        try {
            const user = auth.currentUser;
            const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
            
            await user.reauthenticateWithCredential(credential);
            await user.updatePassword(newPassword);
            
            e.target.reset();
            auth.showNotification('Password updated successfully!', 'success');

        } catch (error) {
            console.error('Error changing password:', error);
            if (error.code === 'auth/wrong-password') {
                auth.showNotification('Current password is incorrect', 'error');
            } else {
                auth.showNotification('Failed to change password', 'error');
            }
        } finally {
            auth.setLoading(submitBtn, false);
        }
    }

    async handleDeleteAccount() {
        const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.');
        if (!confirmed) return;

        const user = auth.currentUser;
        if (!user) return;

        try {
            // Delete user data from Firestore
            await firebase.firestore().collection('users').doc(user.uid).delete();
            
            // Delete user auth
            await user.delete();
            
            auth.showNotification('Account deleted', 'info');
            window.location.href = 'index.html';

        } catch (error) {
            console.error('Error deleting account:', error);
            auth.showNotification('Failed to delete account. You may need to re-authenticate.', 'error');
        }
    }

    async removeSavedPost(postId) {
        await blog.toggleBookmark(postId);
        this.loadSavedPosts();
    }

    removeSavedComponent(componentId) {
        let savedComponents = JSON.parse(localStorage.getItem('savedComponents') || '[]');
        savedComponents = savedComponents.filter(c => c.id !== componentId);
        localStorage.setItem('savedComponents', JSON.stringify(savedComponents));
        this.loadSavedComponents();
        auth.showNotification('Component removed', 'info');
    }

    formatUserType(type) {
        const types = {
            'manufacturer': 'Manufacturer',
            'electrician': 'Electrician',
            'engineer': 'Engineer',
            'hobbyist': 'Hobbyist',
            'student': 'Student',
            'prefer-not-say': 'Member'
        };
        return types[type] || 'Member';
    }

    formatTimeAgo(date) {
        if (!date) return 'Recently';
        
        const seconds = Math.floor((new Date() - date) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize profile manager
const profile = new ProfileManager();
