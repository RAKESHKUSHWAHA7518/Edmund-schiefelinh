import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

// const firebaseConfig = {
//   apiKey: "AIzaSyBoIoGjiesIsbuA2dfpXx6pbQ3BwOuPNWc",
//   authDomain: "operating-in-the-black-68de2.firebaseapp.com",
//   projectId: "operating-in-the-black-68de2",
//   storageBucket: "operating-in-the-black-68de2.firebasestorage.app",
//   messagingSenderId: "713787476033",
//   appId: "1:713787476033:web:7dbc2c7e689ac970341ec0"
// };

// const firebaseConfig = {
//   apiKey: "AIzaSyBsq2hcB_QWN0cjPNMaglrvPlZh3IqUGIo",
//   authDomain: "edmund-schiefeling.firebaseapp.com",
//   projectId: "edmund-schiefeling",
//   storageBucket: "edmund-schiefeling.firebasestorage.app",
//   messagingSenderId: "667624846458",
//   appId: "1:667624846458:web:ee9d8a94cde56c9157f7c3"
// };


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);   