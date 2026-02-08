/**
 * Firebase Configuration
 * Doctor Component - AI Component Replacer
 * 
 * INSTRUCTIONS: Replace these values with your actual Firebase project configuration.
 * 1. Go to Firebase Console (https://console.firebase.google.com/)
 * 2. Create a new project or select existing
 * 3. Click the gear icon -> Project settings
 * 4. Scroll down to "Your apps" and copy the config object
 * 5. Replace the values below
 */

// Firebase configuration - REPLACE WITH YOUR VALUES
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    
    // Initialize services
    const auth = firebase.auth();
    const db = firebase.firestore();
    const storage = firebase.storage();
    
    // Enable offline persistence for Firestore
    db.enablePersistence({
        synchronizeTabs: true
    }).catch((err) => {
        if (err.code === 'failed-precondition') {
            console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
            console.log('The current browser does not support offline persistence.');
        }
    });
    
    console.log('🔥 Firebase initialized successfully - Doctor Component');
} else {
    console.error('❌ Firebase SDK not loaded');
}

// User type labels for display
const USER_TYPE_LABELS = {
    'manufacturer': 'Manufacturer',
    'electrician': 'Electrician',
    'engineer': 'Electronics Engineer',
    'hobbyist': 'Electronics Hobbyist',
    'student': 'Student',
    'distributor': 'Component Distributor',
    'technician': 'Technician',
    'other': 'Other',
    'prefer-not-say': 'Prefer Not to Say'
};

// Category labels for blog posts
const CATEGORY_LABELS = {
    'eol-announcement': 'EOL Announcement',
    'replacement-discussion': 'Replacement Discussion',
    'experience': 'User Experience',
    'question': 'Question'
};

// Category colors
const CATEGORY_COLORS = {
    'eol-announcement': '#EF4444',
    'replacement-discussion': '#3B82F6',
    'experience': '#10B981',
    'question': '#F59E0B'
};
