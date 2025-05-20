import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDmeb_7NwL0w2BGzTKhB0ehEDCbqGiXZpc",
  authDomain: "c-kodelab.firebaseapp.com",
  databaseURL: "https://c-kodelab-default-rtdb.firebaseio.com",
  projectId: "c-kodelab",
  storageBucket: "c-kodelab.appspot.com",
  messagingSenderId: "1071867733080",
  appId: "1:1071867733080:web:1234567890abcdef",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export { app };
export const firestore = getFirestore(app);
export const auth = getAuth(app);
export const db = getDatabase(app);


/*I didn't want to waste time on a database, so i let my old firebase proyect to handle this aspect*/