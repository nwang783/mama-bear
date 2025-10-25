import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let app;
let db;
let storage;
let functions;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  storage = getStorage(app);
  functions = getFunctions(app);
  
  // Use emulators in development
  if (process.env.NODE_ENV === 'development') {
    const { connectFirestoreEmulator } = require('firebase/firestore');
    const { connectStorageEmulator } = require('firebase/storage');
    const { connectFunctionsEmulator } = require('firebase/functions');
    
    try {
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.log('Connected to Firestore emulator');
    } catch (e) {
      console.log('Firestore emulator connection skipped');
    }
    
    try {
      connectStorageEmulator(storage, 'localhost', 9199);
      console.log('Connected to Storage emulator');
    } catch (e) {
      console.log('Storage emulator connection skipped');
    }
    
    try {
      connectFunctionsEmulator(functions, 'localhost', 5001);
      console.log('Connected to Functions emulator');
    } catch (e) {
      console.log('Functions emulator connection skipped');
    }
  }
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

export { app, db, storage, functions };
