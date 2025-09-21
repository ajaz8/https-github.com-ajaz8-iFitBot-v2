// FIX: Use Firebase v8 compat imports to resolve module export errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC5HHBHxastDpD3Eb4aHnASsxb73_puLwk",
  authDomain: "ifitbot-94ca2.firebaseapp.com",
  projectId: "ifitbot-94ca2",
  storageBucket: "ifitbot-94ca2.firebasestorage.app",
  messagingSenderId: "322143926987",
  appId: "1:322143926987:web:9d4af3843ac6fc3059f94e",
  measurementId: "G-1DRBYBM10N"
};

// Initialize Firebase
// FIX: Use compat initialization to avoid errors and ensure single initialization.
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.firestore(); // Export firestore instance
// FIX: Use v8 compat syntax for GoogleAuthProvider
const googleProvider = new firebase.auth.GoogleAuthProvider();

export const signInWithGoogle = () => {
    // FIX: Use v8 compat syntax for signInWithPopup
    return auth.signInWithPopup(googleProvider);
};

export const logout = () => {
    // FIX: Use v8 compat syntax for signOut
    return auth.signOut();
};
