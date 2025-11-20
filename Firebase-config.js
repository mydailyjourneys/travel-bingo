// ============================================================================
// Firebase Configuration
// ============================================================================
// ⚠️ IMPORTANT: This file contains your Firebase credentials
// ⚠️ DO NOT commit this file to Git!
// ⚠️ Add "firebase-config.js" to your .gitignore file
// ============================================================================

// Your Firebase project configuration
// Get these values from: https://console.firebase.google.com/
// Project Settings → General → Your apps → Firebase SDK snippet → Config

const firebaseConfig = {
  // Replace these with your NEW credentials from Firebase Console
  // After you regenerate your API key (if needed)
  
  apiKey: "AIzaSyA-JPCy0Kx1OPRWLsPeYZy19AdEtXX2yOE",  // ← Replace with new key if regenerated
  authDomain: "travel-bingo-bee34.firebaseapp.com",
  databaseURL: "https://travel-bingo-bee34-default-rtdb.firebaseio.com",
  projectId: "travel-bingo-bee34",
  storageBucket: "travel-bingo-bee34.firebasestorage.app",
  messagingSenderId: "226946210782",
  appId: "1:226946210782:web:1d010ad2845c052da6db4f",
  measurementId: "G-FER4KDQ64F"
};

// Make configuration available globally
// This is used by the main HTML file
if (typeof window !== 'undefined') {
  window.FIREBASE_CONFIG = firebaseConfig;
}

// ============================================================================
// INSTRUCTIONS:
// ============================================================================
// 1. Copy this file to the same folder as your HTML file
// 2. Update the values above if you regenerated your API key
// 3. Add this file to .gitignore:
//    echo "firebase-config.js" >> .gitignore
// 4. The HTML file will automatically load this configuration
// ============================================================================
