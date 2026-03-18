import { initializeApp } from 'firebase/app';
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore, doc, setDoc, getDoc, collection, addDoc,
  updateDoc, onSnapshot, query, orderBy, serverTimestamp,
  getDocs, limit, where, increment, deleteDoc,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyADNmRWDijYqyo8tvUy2VA4mwxb3gdE0ow',
  authDomain: 'luckyit-8702d.firebaseapp.com',
  projectId: 'luckyit-8702d',
  storageBucket: 'luckyit-8702d.firebasestorage.app',
  messagingSenderId: '996255153313',
  appId: '1:996255153313:web:916bbde37c09a1c2c7c4e0',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const provider = new GoogleAuthProvider();

// Re-export Firestore helpers
export {
  doc, setDoc, getDoc, collection, addDoc,
  updateDoc, onSnapshot, query, orderBy, serverTimestamp,
  getDocs, limit, where, increment, deleteDoc,
  signInWithPopup, signOut, onAuthStateChanged,
  ref, uploadBytes, getDownloadURL,
};
