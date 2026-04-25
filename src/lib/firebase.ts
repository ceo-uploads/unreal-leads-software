import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBlFnS50_L4r3VtF7zoBnY30HxVX_bmWEs",
  authDomain: "unreal-leads.firebaseapp.com",
  databaseURL: "https://unreal-leads-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "unreal-leads",
  storageBucket: "unreal-leads.firebasestorage.app",
  messagingSenderId: "887294236293",
  appId: "1:887294236293:web:3cfc13d8f71d330e48fbec",
  measurementId: "G-ZCERS03YWE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const rtdb = getDatabase(app);
