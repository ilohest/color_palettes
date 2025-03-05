import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyATlJstf30oYZ9qm1Ta8Ix746pppu9npmg",
    authDomain: "color-palettes-e81b4.firebaseapp.com",
    databaseURL: "https://color-palettes-e81b4-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "color-palettes-e81b4",
    storageBucket: "color-palettes-e81b4.firebasestorage.app",
    messagingSenderId: "793358717098",
    appId: "1:793358717098:web:4eafea88b2e75a3a31c0d3",
    measurementId: "G-14XBCGL2SQ",
    clientId: "793358717098-ihfn7p7pdq6jm02bmth8mkqr2kqgltqa.apps.googleusercontent.com"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Exporter Realtime Database et Auth
export const db = getDatabase(app);
export const auth = getAuth(app);
