// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDA4xnu1Nc-eFNsj75WNfCEyx6P___a-XU",
  authDomain: "lendly-94fec.firebaseapp.com",
  projectId: "lendly-94fec",
  storageBucket: "lendly-94fec.firebasestorage.app",
  messagingSenderId: "317602296419",
  appId: "1:317602296419:web:c50c3971b7d2fa40c7fe56",
  measurementId: "G-FL8Y5KEKKY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);