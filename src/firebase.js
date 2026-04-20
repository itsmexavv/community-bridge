/* ================================================================
   CommunityBridge — Firebase Configuration
   
   SETUP INSTRUCTIONS:
   1. Go to https://console.firebase.google.com
   2. Click "Add project" → Name it "communitybridge-usl"
   3. Disable Google Analytics (optional) → Create Project
   4. In the sidebar: Build → Authentication → Get Started
      → Enable "Email/Password" provider
   5. In the sidebar: Build → Firestore Database → Create Database
      → Start in TEST mode → Choose nearest region
   6. In the sidebar: Build → Storage → Get Started → Next → Done
   7. Click ⚙️ Project Settings → Scroll to "Your apps" → Click </> (Web)
      → Name it "communitybridge-web" → Register app
   8. Copy the firebaseConfig object and paste it below
   ================================================================ */
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAuth } from 'firebase/auth'

// ✅ PASTE YOUR FIREBASE CONFIG HERE:
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:000000000000"
}

// Set to true once you've added your real Firebase config above
const FIREBASE_ENABLED = false

let app = null, db = null, storage = null, auth = null

if (FIREBASE_ENABLED) {
  try {
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
    storage = getStorage(app)
    auth = getAuth(app)
    console.log('🔥 Firebase initialized successfully')
  } catch (err) {
    console.error('Firebase init failed:', err.message)
  }
}

export { db, storage, auth }
export const isFirebaseEnabled = () => FIREBASE_ENABLED && !!db
