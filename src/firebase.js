import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB86DMUbET1lH8AnKRSthte8KuLVOkX4t4",
  authDomain: "rcs-app-2aae2.firebaseapp.com",
  projectId: "rcs-app-2aae2",
  storageBucket: "rcs-app-2aae2.firebasestorage.app",
  messagingSenderId: "464397171050",
  appId: "1:464397171050:web:15e3cd5dc2f9708d1a4d13"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
export {app,db,auth}
