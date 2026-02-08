/**
 * Blog Module
 * Doctor Component
 * 
 * Handles blog posts, comments, and community interactions.
 */

// Sample posts data
let posts = [];
let currentPostId = null;
let currentCategory = 'all';

// Initialize blog when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initBlog();
});

/**
 * Initialize blog
 */
function initBlog() {
    loadPosts();
    setupCategoryFilter();
    setupPostForm();
    setupCommentForm();
    setupSortOptions();
    setupLoadMore();
    loadTrendingComponents();
    loadCommunityStats();
}

/**
 * Load posts from Firestore
 */
async function loadPosts(limit = 10) {
    const postsList = document.getElementById('posts-list');
    if (!postsList) return;
    
    try {
        let query = firebase.firestore()
            .collection('posts')
            .orderBy('createdAt', 'desc')
            .limit(limit);
        
        if (currentCategory !== 'all') {
            query = firebase.firestore()
                .collection('posts')
                .where('category', '==', currentCategory)
                .orderBy('createdAt', 'desc')
                .limit(limit);
        }
        
        const snapshot = await query.get();
        
        posts = [];
        snapshot.forEach(doc => {
            posts.push({ id: doc.id, ...doc.data() });
        });
        
        displayPosts();
        
    } catch (error) {
        console.error('Error loading posts:', error);
        // Show sample posts if Firestore is not configured
        showSamplePosts();
    }
}

/**
 * Show sample posts (for demo purposes)
 */
function showSamplePosts() {
    posts = [
        {
            id: '1',
            title: '2N2222 is coming to EOL - What are the best alternatives?',
            content: 'I just received notification that the 2N2222 transistor is reaching end-of-life. I\'ve been using this component for years in my designs. What are the recommended replacements that offer pin-to-pin compatibility?',
            component: '2N2222',
            category: 'eol-announcement',
            author: {
                name: 'Johnson',
                avatar: 'images/default-avatar.png',
                userType: 'engineer'
            },
            createdAt: { toDate: () => new Date('2026-02-05') },
            likes: 24,
            commentsCount: 8,
            views: 156
        },
        {
            id: '2',
            title: 'Experience replacing LM358 with LM358B',
            category: 'experience',
            content: 'Recently had to replace LM358 with the new LM358B in an audio amplifier circuit. The transition was seamless and actually improved performance slightly. Highly recommend for anyone facing the same EOL situation.',
            component: 'LM358',
            author: {
                name: 'Sarah Chen',
                avatar: 'images/default-avatar.png',
                userType: 'technician'
            },
            createdAt: { toDate: () => new Date('2026-02-03') },
            likes: 18,
            commentsCount: 5,
            views: 89
        },
        {
            id: '3',
            title: 'Question: Can I use BC547 instead of 2N2222?',
            category: 'question',
            content: 'Working on a switching circuit that originally used 2N2222. I have BC547 in stock. Will it work as a direct replacement or do I need to modify the circuit?',
            component: 'BC547',
            author: {
                name: 'Mike Rodriguez',
                avatar: 'images/default-avatar.png',
                userType: 'hobbyist'
            },
            createdAt: { toDate: () => new Date('2026-02-01') },
            likes: 12,
            commentsCount: 6,
            views: 67
        },
        {
            id: '4',
            title: 'NE555 alternatives for precision timing applications',
            category: 'replacement-discussion',
            content: 'Looking for recommendations on replacing NE555 in precision timing circuits. The CMOS versions seem promising but I\'m concerned about output drive capability.',
            component: 'NE555',
            author: {
                name: 'David Kim',
                avatar: 'images/default-avatar.png',
                userType: 'engineer'
            },
            createdAt: { toDate: () => new Date('2026-01-28') },
            likes: 31,
            commentsCount: 12,
            views: 234
        }
    ];
    
    displayPosts();
}

/**
 * Display posts
 */
function displayPosts() {
    const postsList = document.getElementById('posts-list');
    if (!postsList) return;
    
    if (posts.length === 0) {
        postsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h4>No posts yet</h4>
                <p>Be the first to start a discussion!</p>
            </div>
        `;
        return;
    }
    
    postsList.innerHTML = posts.map(post => `
        <div class="post-card" onclick="openPostModal('${post.id}')">
            <div class="post-header">
                <div class="post-meta">
                    <div class="post-author">
                        <img src="${post.author?.avatar || 'images/default-avatar.png'}" alt="${post.author?.name || 'User'}">
                        <span>${post.author?.name || 'Anonymous'}</span>
                        ${post.author?.userType ? `<span class="user-type-badge-small">${USER_TYPE_LABELS[post.author.userType] || post.author.userType}</span>` : ''}
                    </div>
                </div>
                <span class="post-category" style="background: ${CATEGORY_COLORS[post.category] || '#ccc'}20; color: ${CATEGORY_COLORS[post.category] || '#666'};">
                    ${CATEGORY_LABELS[post.category] || post.category}
                </span>
            </div>
            <h4 class="post-title">${post.title}</h4>
            <p class="post-content">${post.content}</p>
            ${post.component ? `<p style="font-size: 0.875rem; color: var(--primary-dark); margin-bottom: 0.75rem;"><i class="fas fa-microchip"></i> ${post.component}</p>` : ''}
            <div class="post-footer">
                <span><i class="fas fa-calendar"></i> ${formatDate(post.createdAt)}</span>
                <span><i class="fas fa-heart"></i> ${post.likes || 0}</span>
                <span><i class="fas fa-comment"></i> ${post.commentsCount || 0}</span>
                <span><i class="fas fa-eye"></i> ${post.views || 0}</span>
            </div>
        </div>
    `).join('');
}

/**
 * Setup category filter
 */
function setupCategoryFilter() {
    const categoryLinks = document.querySelectorAll('.category-list a');
    
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Update active state
            categoryLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Update current category
            currentCategory = link.dataset.category;
            
            // Reload posts
            loadPosts();
        });
    });
}

/**
 * Setup post form
 */
function setupPostForm() {
    const form = document.getElementById('post-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const user = firebase.auth().currentUser;
        
        if (!user) {
            showToast('Please sign in to create a post', 'error');
            return;
        }
        
        // Get user data
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        
        const postData = {
            title: document.getElementById('post-title').value,
            content: document.getElementById('post-content').value,
            component: document.getElementById('post-component').value,
            category: document.getElementById('post-category').value,
            author: {
                uid: user.uid,
                name: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || user.displayName || 'User',
                avatar: userData?.photoURL || user.photoURL || 'images/default-avatar.png',
                userType: userData?.userType || 'prefer-not-say'
            },
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            likes: 0,
            commentsCount: 0,
            views: 0,
            likedBy: []
        };
        
        try {
            await firebase.firestore().collection('posts').add(postData);
            
            // Update user's post count
            await firebase.firestore().collection('users').doc(user.uid).update({
                postsCount: firebase.firestore.FieldValue.increment(1)
            });
            
            showToast('Post created successfully!', 'success');
            form.reset();
            loadPosts();
            
        } catch (error) {
            console.error('Error creating post:', error);
            showToast('Error creating post', 'error');
        }
    });
}

/**
 * Setup comment form
 */
function setupCommentForm() {
    const form = document.getElementById('comment-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const user = firebase.auth().currentUser;
        
        if (!user) {
            showToast('Please sign in to comment', 'error');
            return;
        }
        
        if (!currentPostId) return;
        
        // Get user data
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        
        const commentData = {
            postId: currentPostId,
            content: document.getElementById('comment-content').value,
            author: {
                uid: user.uid,
                name: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || user.displayName || 'User',
                avatar: userData?.photoURL || user.photoURL || 'images/default-avatar.png',
                userType: userData?.userType || 'prefer-not-say'
            },
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        try {
            await firebase.firestore().collection('comments').add(commentData);
            
            // Update post's comment count
            await firebase.firestore().collection('posts').doc(currentPostId).update({
                commentsCount: firebase.firestore.FieldValue.increment(1)
            });
            
            // Update user's comment count
            await firebase.firestore().collection('users').doc(user.uid).update({
                commentsCount: firebase.firestore.FieldValue.increment(1)
            });
            
            showToast('Comment added!', 'success');
            form.reset();
            loadComments(currentPostId);
            
        } catch (error) {
            console.error('Error adding comment:', error);
            showToast('Error adding comment', 'error');
        }
    });
}

/**
 * Open post modal
 */
async function openPostModal(postId) {
    currentPostId = postId;
    
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const modal = document.getElementById('post-modal');
    const postDetail = document.getElementById('post-detail');
    
    postDetail.innerHTML = `
        <div class="post-header">
            <div class="post-meta">
                <div class="post-author">
                    <img src="${post.author?.avatar || 'images/default-avatar.png'}" alt="${post.author?.name || 'User'}">
                    <span>${post.author?.name || 'Anonymous'}</span>
                </div>
            </div>
            <span class="post-category" style="background: ${CATEGORY_COLORS[post.category] || '#ccc'}20; color: ${CATEGORY_COLORS[post.category] || '#666'};">
                ${CATEGORY_LABELS[post.category] || post.category}
            </span>
        </div>
        <h2>${post.title}</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1rem;">
            <i class="fas fa-calendar"></i> ${formatDate(post.createdAt)}
        </p>
        <div class="post-full-content" style="line-height: 1.8; margin-bottom: 1.5rem;">
            ${post.content}
        </div>
        ${post.component ? `
            <div style="background: var(--primary-pale); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem;">
                <strong><i class="fas fa-microchip"></i> Related Component:</strong> 
                <a href="index.html?search=${post.component}" style="color: var(--primary-dark);">${post.component}</a>
            </div>
        ` : ''}
        <div class="post-actions" style="display: flex; gap: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
            <button class="btn-secondary" onclick="likePost('${post.id}')">
                <i class="fas fa-heart"></i> ${post.likes || 0} Likes
            </button>
            <button class="btn-secondary">
                <i class="fas fa-share"></i> Share
            </button>
        </div>
    `;
    
    modal.classList.add('active');
    
    // Load comments
    loadComments(postId);
    
    // Increment view count
    incrementViewCount(postId);
}

/**
 * Close post modal
 */
function closePostModal() {
    const modal = document.getElementById('post-modal');
    modal.classList.remove('active');
    currentPostId = null;
}

/**
 * Load comments for a post
 */
async function loadComments(postId) {
    const commentsList = document.getElementById('comments-list');
    
    try {
        const snapshot = await firebase.firestore()
            .collection('comments')
            .where('postId', '==', postId)
            .orderBy('createdAt', 'asc')
            .get();
        
        const comments = [];
        snapshot.forEach(doc => {
            comments.push({ id: doc.id, ...doc.data() });
        });
        
        if (comments.length === 0) {
            commentsList.innerHTML = `
                <div class="empty-state" style="padding: 2rem;">
                    <i class="fas fa-comments"></i>
                    <p>No comments yet. Be the first to comment!</p>
                </div>
            `;
            return;
        }
        
        commentsList.innerHTML = comments.map(comment => `
            <div class="comment-card">
                <div class="comment-header">
                    <div class="comment-author">
                        <img src="${comment.author?.avatar || 'images/default-avatar.png'}" alt="${comment.author?.name || 'User'}">
                        <span>${comment.author?.name || 'Anonymous'}</span>
                        ${comment.author?.userType ? `<span class="user-type-badge-small">${USER_TYPE_LABELS[comment.author.userType] || comment.author.userType}</span>` : ''}
                    </div>
                    <span class="comment-time">${formatDate(comment.createdAt)}</span>
                </div>
                <div class="comment-content">${comment.content}</div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading comments:', error);
        commentsList.innerHTML = `
            <div class="empty-state" style="padding: 2rem;">
                <i class="fas fa-comments"></i>
                <p>No comments yet. Be the first to comment!</p>
            </div>
        `;
    }
}

/**
 * Like a post
 */
async function likePost(postId) {
    const user = firebase.auth().currentUser;
    
    if (!user) {
        showToast('Please sign in to like posts', 'error');
        return;
    }
    
    try {
        const postRef = firebase.firestore().collection('posts').doc(postId);
        const postDoc = await postRef.get();
        
        if (!postDoc.exists) return;
        
        const postData = postDoc.data();
        const likedBy = postData.likedBy || [];
        
        if (likedBy.includes(user.uid)) {
            // Unlike
            await postRef.update({
                likes: firebase.firestore.FieldValue.increment(-1),
                likedBy: firebase.firestore.FieldValue.arrayRemove(user.uid)
            });
            showToast('Post unliked', 'info');
        } else {
            // Like
            await postRef.update({
                likes: firebase.firestore.FieldValue.increment(1),
                likedBy: firebase.firestore.FieldValue.arrayUnion(user.uid)
            });
            showToast('Post liked!', 'success');
        }
        
        // Refresh posts
        loadPosts();
        
    } catch (error) {
        console.error('Error liking post:', error);
        showToast('Error processing like', 'error');
    }
}

/**
 * Increment view count
 */
async function incrementViewCount(postId) {
    try {
        await firebase.firestore().collection('posts').doc(postId).update({
            views: firebase.firestore.FieldValue.increment(1)
        });
    } catch (error) {
        console.error('Error incrementing view count:', error);
    }
}

/**
 * Setup sort options
 */
function setupSortOptions() {
    const sortSelect = document.getElementById('sort-posts');
    if (!sortSelect) return;
    
    sortSelect.addEventListener('change', () => {
        const sortValue = sortSelect.value;
        
        switch (sortValue) {
            case 'newest':
                posts.sort((a, b) => new Date(b.createdAt?.toDate?.() || b.createdAt) - new Date(a.createdAt?.toDate?.() || a.createdAt));
                break;
            case 'oldest':
                posts.sort((a, b) => new Date(a.createdAt?.toDate?.() || a.createdAt) - new Date(b.createdAt?.toDate?.() || b.createdAt));
                break;
            case 'popular':
                posts.sort((a, b) => (b.likes + b.commentsCount) - (a.likes + a.commentsCount));
                break;
        }
        
        displayPosts();
    });
}

/**
 * Setup load more button
 */
function setupLoadMore() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (!loadMoreBtn) return;
    
    loadMoreBtn.addEventListener('click', () => {
        showToast('Loading more posts...', 'info');
    });
}

/**
 * Load trending components
 */
async function loadTrendingComponents() {
    const trendingList = document.getElementById('trending-list');
    if (!trendingList) return;
    
    // Sample trending components
    const trending = [
        { name: '2N2222', mentions: 45 },
        { name: 'LM358', mentions: 38 },
        { name: 'NE555', mentions: 32 },
        { name: '7805', mentions: 28 },
        { name: 'BC547', mentions: 24 }
    ];
    
    trendingList.innerHTML = trending.map(comp => `
        <li>
            <a href="index.html?search=${comp.name}">
                <span>${comp.name}</span>
                <span style="color: var(--text-muted); font-size: 0.75rem;">${comp.mentions} mentions</span>
            </a>
        </li>
    `).join('');
}

/**
 * Load community stats
 */
async function loadCommunityStats() {
    try {
        // Get total posts count
        const postsSnapshot = await firebase.firestore().collection('posts').get();
        const totalPosts = postsSnapshot.size;
        
        // Get total comments count
        const commentsSnapshot = await firebase.firestore().collection('comments').get();
        const totalComments = commentsSnapshot.size;
        
        // Get active users count (users who posted in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const activeUsersSnapshot = await firebase.firestore()
            .collection('posts')
            .where('createdAt', '>=', thirtyDaysAgo)
            .get();
        
        const activeUsers = new Set();
        activeUsersSnapshot.forEach(doc => {
            activeUsers.add(doc.data().author?.uid);
        });
        
        // Update stats
        document.getElementById('total-posts').textContent = totalPosts;
        document.getElementById('total-comments').textContent = totalComments;
        document.getElementById('active-users').textContent = activeUsers.size;
        
    } catch (error) {
        console.error('Error loading community stats:', error);
        
        // Show sample stats
        document.getElementById('total-posts').textContent = '156';
        document.getElementById('total-comments').textContent = '423';
        document.getElementById('active-users').textContent = '89';
    }
}

/**
 * Format date
 */
function formatDate(timestamp) {
    if (!timestamp) return 'Unknown';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Less than 1 hour
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return minutes < 1 ? 'Just now' : `${minutes}m ago`;
    }
    
    // Less than 24 hours
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours}h ago`;
    }
    
    // Less than 7 days
    if (diff < 604800000) {
        const days = Math.floor(diff / 86400000);
        return `${days}d ago`;
    }
    
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
window.openPostModal = openPostModal;
window.closePostModal = closePostModal;
window.likePost = likePost;
window.showToast = showToast;
