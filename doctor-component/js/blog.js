// Blog Module for Doctor Component
// Handles blog posts, comments, and interactions

class BlogManager {
    constructor() {
        this.posts = [];
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.lastDoc = null;
        this.loading = false;
        this.postsPerPage = 10;
        
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadPosts();
        this.updateStats();
    }

    cacheElements() {
        this.postsGrid = document.getElementById('postsGrid');
        this.postsList = document.getElementById('postsList');
        this.viewToggle = document.getElementById('viewToggle');
        this.searchInput = document.getElementById('blogSearch');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.sortSelect = document.getElementById('sortSelect');
        this.newPostBtn = document.getElementById('newPostBtn');
        this.postModal = document.getElementById('postModal');
        this.postForm = document.getElementById('postForm');
        this.loadMoreBtn = document.getElementById('loadMoreBtn');
        this.emptyState = document.getElementById('emptyState');
    }

    bindEvents() {
        // View toggle (grid/list)
        this.viewToggle?.addEventListener('click', () => this.toggleView());

        // Search
        this.searchInput?.addEventListener('input', this.debounce((e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.resetAndLoad();
        }, 300));

        // Filters
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.resetAndLoad();
            });
        });

        // Sort
        this.sortSelect?.addEventListener('change', () => this.resetAndLoad());

        // New post
        this.newPostBtn?.addEventListener('click', () => this.openPostModal());

        // Post form
        this.postForm?.addEventListener('submit', (e) => this.handlePostSubmit(e));

        // Modal close
        this.postModal?.querySelector('.modal-close')?.addEventListener('click', () => {
            this.closePostModal();
        });

        this.postModal?.addEventListener('click', (e) => {
            if (e.target === this.postModal) this.closePostModal();
        });

        // Load more
        this.loadMoreBtn?.addEventListener('click', () => this.loadMore());

        // Tag input
        const tagInput = document.getElementById('postTags');
        tagInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                this.addTag(e.target.value.trim());
                e.target.value = '';
            }
        });
    }

    async loadPosts() {
        if (this.loading) return;
        this.loading = true;

        try {
            let query = firebase.firestore().collection('blogPosts')
                .where('status', '==', 'published');

            // Apply filter
            if (this.currentFilter !== 'all') {
                query = query.where('category', '==', this.currentFilter);
            }

            // Apply sort
            const sortBy = this.sortSelect?.value || 'newest';
            switch (sortBy) {
                case 'newest':
                    query = query.orderBy('createdAt', 'desc');
                    break;
                case 'oldest':
                    query = query.orderBy('createdAt', 'asc');
                    break;
                case 'popular':
                    query = query.orderBy('views', 'desc');
                    break;
                case 'most-discussed':
                    query = query.orderBy('commentsCount', 'desc');
                    break;
            }

            // Pagination
            if (this.lastDoc) {
                query = query.startAfter(this.lastDoc);
            }
            query = query.limit(this.postsPerPage);

            const snapshot = await query.get();
            
            if (snapshot.empty && !this.lastDoc) {
                this.showEmptyState();
                return;
            }

            this.lastDoc = snapshot.docs[snapshot.docs.length - 1];
            
            const newPosts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate()
            }));

            // Apply search filter client-side
            let filteredPosts = newPosts;
            if (this.searchQuery) {
                filteredPosts = newPosts.filter(post => 
                    post.title?.toLowerCase().includes(this.searchQuery) ||
                    post.content?.toLowerCase().includes(this.searchQuery) ||
                    post.tags?.some(tag => tag.toLowerCase().includes(this.searchQuery))
                );
            }

            this.posts = this.lastDoc ? [...this.posts, ...filteredPosts] : filteredPosts;
            this.renderPosts();

            // Show/hide load more button
            if (this.loadMoreBtn) {
                this.loadMoreBtn.style.display = 
                    snapshot.docs.length < this.postsPerPage ? 'none' : 'flex';
            }

        } catch (error) {
            console.error('Error loading posts:', error);
            this.showError('Failed to load posts');
        } finally {
            this.loading = false;
        }
    }

    renderPosts() {
        if (!this.postsGrid && !this.postsList) return;

        const isGridView = this.postsGrid?.classList.contains('active') ?? true;
        const container = isGridView ? this.postsGrid : this.postsList;
        
        if (!container) return;

        if (this.posts.length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();

        const html = this.posts.map(post => this.createPostCard(post, isGridView)).join('');
        container.innerHTML = html;

        // Bind post card events
        container.querySelectorAll('.post-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.post-actions') && !e.target.closest('.author-link')) {
                    this.openPostDetail(card.dataset.postId);
                }
            });
        });

        // Like buttons
        container.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleLike(btn.dataset.postId);
            });
        });

        // Bookmark buttons
        container.querySelectorAll('.bookmark-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleBookmark(btn.dataset.postId);
            });
        });
    }

    createPostCard(post, isGrid) {
        const user = auth.getCurrentUser();
        const isLiked = post.likes?.includes(user?.uid);
        const isBookmarked = user?.uid && post.bookmarks?.includes(user?.uid);
        
        const timeAgo = this.formatTimeAgo(post.createdAt);
        const excerpt = this.truncateText(post.content, isGrid ? 120 : 200);

        return `
            <article class="post-card ${isGrid ? 'grid' : 'list'}" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="post-category">${this.formatCategory(post.category)}</div>
                    <div class="post-time">${timeAgo}</div>
                </div>
                
                <h3 class="post-title">${this.escapeHtml(post.title)}</h3>
                
                <p class="post-excerpt">${this.escapeHtml(excerpt)}</p>
                
                ${post.tags?.length ? `
                    <div class="post-tags">
                        ${post.tags.map(tag => `<span class="tag">#${this.escapeHtml(tag)}</span>`).join('')}
                    </div>
                ` : ''}
                
                <div class="post-footer">
                    <div class="post-author">
                        <img src="${post.authorPhoto || 'images/default-avatar.png'}" alt="${post.authorName}" class="author-avatar">
                        <span class="author-name">${this.escapeHtml(post.authorName)}</span>
                    </div>
                    
                    <div class="post-stats">
                        <span class="stat">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            ${this.formatNumber(post.views || 0)}
                        </span>
                        <span class="stat">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                            </svg>
                            ${post.commentsCount || 0}
                        </span>
                    </div>
                    
                    <div class="post-actions">
                        <button class="action-btn like-btn ${isLiked ? 'active' : ''}" data-post-id="${post.id}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                            <span>${post.likes?.length || 0}</span>
                        </button>
                        <button class="action-btn bookmark-btn ${isBookmarked ? 'active' : ''}" data-post-id="${post.id}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </article>
        `;
    }

    async handlePostSubmit(e) {
        e.preventDefault();
        
        const user = auth.getCurrentUser();
        if (!user) {
            auth.openAuthModal('login');
            return;
        }

        const formData = new FormData(e.target);
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        auth.setLoading(submitBtn, true);

        try {
            const tags = Array.from(document.querySelectorAll('.tag-item')).map(tag => 
                tag.textContent.replace('×', '').trim()
            );

            const postData = {
                title: formData.get('title').trim(),
                content: formData.get('content').trim(),
                category: formData.get('category'),
                tags: tags,
                authorId: user.uid,
                authorName: user.displayName || user.email,
                authorPhoto: user.photoURL,
                status: 'published',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                views: 0,
                likes: [],
                bookmarks: [],
                commentsCount: 0
            };

            await firebase.firestore().collection('blogPosts').add(postData);

            // Update user posts count
            await firebase.firestore().collection('users').doc(user.uid).update({
                postsCount: firebase.firestore.FieldValue.increment(1)
            });

            this.closePostModal();
            e.target.reset();
            document.querySelectorAll('.tag-item').forEach(tag => tag.remove());
            
            this.showNotification('Post published successfully!', 'success');
            this.resetAndLoad();
            this.updateStats();

        } catch (error) {
            console.error('Error creating post:', error);
            this.showNotification('Failed to publish post', 'error');
        } finally {
            auth.setLoading(submitBtn, false);
        }
    }

    async toggleLike(postId) {
        auth.requireAuth(async () => {
            try {
                const postRef = firebase.firestore().collection('blogPosts').doc(postId);
                const post = this.posts.find(p => p.id === postId);
                const userId = auth.currentUser.uid;

                if (post.likes?.includes(userId)) {
                    await postRef.update({
                        likes: firebase.firestore.FieldValue.arrayRemove(userId)
                    });
                } else {
                    await postRef.update({
                        likes: firebase.firestore.FieldValue.arrayUnion(userId)
                    });
                }

                // Refresh posts
                this.resetAndLoad();
            } catch (error) {
                console.error('Error toggling like:', error);
            }
        });
    }

    async toggleBookmark(postId) {
        auth.requireAuth(async () => {
            try {
                const postRef = firebase.firestore().collection('blogPosts').doc(postId);
                const userId = auth.currentUser.uid;

                // Check if already bookmarked
                const userRef = firebase.firestore().collection('users').doc(userId);
                const userDoc = await userRef.get();
                const bookmarks = userDoc.data().savedPosts || [];

                if (bookmarks.includes(postId)) {
                    await userRef.update({
                        savedPosts: firebase.firestore.FieldValue.arrayRemove(postId)
                    });
                    await postRef.update({
                        bookmarks: firebase.firestore.FieldValue.arrayRemove(userId)
                    });
                } else {
                    await userRef.update({
                        savedPosts: firebase.firestore.FieldValue.arrayUnion(postId)
                    });
                    await postRef.update({
                        bookmarks: firebase.firestore.FieldValue.arrayUnion(userId)
                    });
                }

                this.resetAndLoad();
            } catch (error) {
                console.error('Error toggling bookmark:', error);
            }
        });
    }

    openPostDetail(postId) {
        window.location.href = `post.html?id=${postId}`;
    }

    openPostModal() {
        auth.requireAuth(() => {
            this.postModal?.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    closePostModal() {
        this.postModal?.classList.remove('active');
        document.body.style.overflow = '';
    }

    toggleView() {
        const isGrid = this.postsGrid?.classList.contains('active');
        
        this.postsGrid?.classList.toggle('active', !isGrid);
        this.postsList?.classList.toggle('active', isGrid);
        
        this.viewToggle?.querySelector('span').textContent = isGrid ? 'List View' : 'Grid View';
        this.viewToggle?.querySelector('svg').innerHTML = isGrid 
            ? '<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>'
            : '<line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>';

        this.renderPosts();
    }

    addTag(tag) {
        if (!tag) return;
        
        const container = document.getElementById('tagsContainer');
        const existingTags = Array.from(container.querySelectorAll('.tag-item')).map(t => 
            t.textContent.replace('×', '').trim().toLowerCase()
        );
        
        if (existingTags.includes(tag.toLowerCase())) return;
        if (existingTags.length >= 5) {
            this.showNotification('Maximum 5 tags allowed', 'warning');
            return;
        }

        const tagEl = document.createElement('span');
        tagEl.className = 'tag-item';
        tagEl.innerHTML = `${this.escapeHtml(tag)} <button type="button" onclick="this.parentElement.remove()">&times;</button>`;
        container.appendChild(tagEl);
    }

    resetAndLoad() {
        this.lastDoc = null;
        this.posts = [];
        this.loadPosts();
    }

    loadMore() {
        this.loadPosts();
    }

    showEmptyState() {
        this.emptyState?.classList.add('show');
        this.postsGrid && (this.postsGrid.innerHTML = '');
        this.postsList && (this.postsList.innerHTML = '');
    }

    hideEmptyState() {
        this.emptyState?.classList.remove('show');
    }

    async updateStats() {
        try {
            const postsSnapshot = await firebase.firestore().collection('blogPosts')
                .where('status', '==', 'published')
                .get();
            
            const totalPosts = postsSnapshot.size;
            let totalComments = 0;
            
            postsSnapshot.forEach(doc => {
                totalComments += doc.data().commentsCount || 0;
            });

            const usersSnapshot = await firebase.firestore().collection('users').get();

            document.getElementById('totalPosts') && (document.getElementById('totalPosts').textContent = totalPosts);
            document.getElementById('totalComments') && (document.getElementById('totalComments').textContent = totalComments);
            document.getElementById('totalMembers') && (document.getElementById('totalMembers').textContent = usersSnapshot.size);
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    // Utility functions
    formatTimeAgo(date) {
        if (!date) return 'Recently';
        
        const seconds = Math.floor((new Date() - date) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    formatCategory(category) {
        const categories = {
            'eol-discussion': 'EOL Discussion',
            'replacement': 'Replacement Guide',
            'datasheet': 'Datasheet',
            'question': 'Question',
            'news': 'Industry News'
        };
        return categories[category] || category;
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

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    showNotification(message, type = 'info') {
        auth.showNotification(message, type);
    }

    showError(message) {
        this.showNotification(message, 'error');
    }
}

// Initialize blog manager
const blog = new BlogManager();
