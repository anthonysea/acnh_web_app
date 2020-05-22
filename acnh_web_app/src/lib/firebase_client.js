import firebase from 'firebase/app';
import 'firebase/analytics';
import 'firebase/firestore';


let firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID 
  };

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig)
} 

// Check that `window` is in scope for the analytics module
// Enable analytics
if ((typeof window !== 'undefined') && ('measurementId' in firebaseConfig)) 
  firebase.analytics()


export default firebase